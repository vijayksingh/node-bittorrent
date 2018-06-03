# Overview of Bittorrent

The bittorrent protocol has two parts.

 1. You need to send your request to something called tracker, and tracker respond with the list of peers.  
    * In Layman terms : You tell the tracker which files you're trying to download, and the tracker gives you the ip address of the users you download them from.

 1. After you have the list of peer addresses, you can connect ot them directly and start downloading. 
    * What really happens : So you go and ask a peer i need this file, 


- The torrent file has announce property, which generally signifies location of torrent tracker.
- Interesting thing is torrent operates on udp protocol instead of http protocol.

## Bencode 
 - The output probably looked fairly incomprehensible to you as it's written in Bencode.
 - Bencode is data serialization format just like XML and JSON.

## Getting Peers via the Tracker

 > udp://tracker.coppersurfer.tk:6969/announce

This is the result we got once we parse the torrent. 
- Here announce url is what is called the tracker's url. It's the location of torrent's tracker.
- Other thing to look here is use of udp instead of HTTP.
- As we know HTTP is built on top of TCP their is a slight difference between udp and tcp.


### HTTP vs UPD vs TCP

- **HTTP** : The http protocol based on tcp protocol is a set of rules that let you create a request, respond to that request and perform CRUD operations on it.
- **TCP** : TCP is the underlying protocol which provide functionality to HTTP protocol. TCP protocol guarrentess that when a user sends data, the other user will recieve that data in it's entirety, uncorrupted and in the correct order.
    - In order to do that TCP has to create a persistant connection between client and the server in order to ensure the data integrity.
- **UDP** : The TCP because it always have to maintain a persistant path between Client and the server result in slow speed, much slower than UDP. 
- Generally in case of UDP data being sent is less than 512 bytes.
- UDP doesn't proide any ordering functionality to the data coming in, it might come out of order.
    - The UDP protocol also doesn't ensure whether all the data will arrive or not and sometime you have to resend or re-request data.
    - But for some reasons, udp is often a good choice for trackers because they send small messages, and we use tcp for when we actually transfer files between peers because those files tend to be larger and must arrive intact.

- Now we are going to send the UDP request.

### UDP Trcacker protocol and message format.
- In order to get a list of peers from the tracker, the tracker will be expecting messages to follow a specific protocol.
    - These are the rules
        - Send a connect request.
        - Get the connect response and extract the connection id.
        - Use the connection id to send an announce request - this is where we tell the tracker which files we're interested in.
        - Get the announce response and extract the peers list.

### Section for Nerds
You can move on from this section without interfering your flow of tutorial, i just found some really good number for nerds to ensure how we arrive at **UDP**.

  - **Sending Message** :   
    - To discover other peers in a swarm a client announces it's existence to a tracker.
    - The HTTP protocol is used and a typical request contains the following parameters
        - ```info_hash```  
        - ```key```
        - ```peer_id```
        - ```downloaded```
        - ```left```
        - ```uploaded```
        - ```compact```
    - The request and response are both quite short.
    - Since TCP is used. a connection has to be opened and closed, introducing additional **overhead**.

  - **Overhead** :
    - Using HTTP introduces significant overhead.
        - Ethernet layer *(14 bytes per packet)*
        - IP layer *(20 bytes per packet)*
        - TCP layer *(20 bytes per packet)*
    - About 10 packets are used for a request plus response containing 50 peers and the total number of bytes used is about 1206.
    - This can be reduced by using UDP protocol.
    - The protocol proposed here is about 618 bytes reducing traffic by 50%.
    - For a client saving 1kB every hours isn't significant, but for a tracker servig a million peers, reducting traffic by 50% matters a lot. 
    - Other advantage is that a UDP based binary protocol doesn't require a complex parser and no connection handling, reducing the complexity of tracker code and increasing it's performance.

  - **UDP Connection/ Spoofing**
    - In the ideal case, only 2 packets would be necessary.
    - However, it is possible to spoof the source address of a UDP packet.
    - Tracker has to ensure it doesn't occur, so it calculates a value (connection_id) and sends it to the client.
    - If the client is spoofed it's source address, it won't recieve this value (unless it's sniffing the network).
    - The connection_id will then be send to the tracker again in packet.
    - The tracker validates the connection_id and ignores the request if it doesn't match.
    - A cookie like approach should be used to store the connection_id on the tracker side.
    - A connection_id now works like a token authenticatinig the client for multiple requests.
    - A client can use a connection ID until one minute after it has recieved it.

#### Connect Messaging
> The UDP tracker protocol expects packets to be exactly in certain size.  
So now we know we have to send two types of request.
  1. Connect Request
  2. Announce Request.

**Connect Request**
Before announcing or scrapping, you have to obtain a connection ID.

    1. Choose a random transaction ID.
    2. Fill the connect request structure
    3. Send the request

###### Connect Request 
    | Offset | Size       | Name                 | Value                           |
    | ------ | ---------- | -------------------- | ------------------------------- |
    | 0      | 64-bit int | ```protocol_id```    | 0x41727101980 // magic constant |
    | 8      | 32-bit int | ```action```         | 0 // connect                    |
    | 12     | 32-bit int | ```transaction_id``` |                                 |
    | 16     |            |                      |                                 |

    1. Receive the packet.
    2. Check whether the packet is at least 16 bytes.
    3. Check whether the transaction ID is equal to the one you chose.
    4. Check whether the action is connect.
    5. Store the connection ID for future use.

###### Connect Response
    | Offset | Size       | Name                 | Value        |
    | ------ | ---------- | -------------------- | ------------ |
    | 0      | 32-bit int | ```action```         | 0 // connect |
    | 4      | 32-bit int | ```transaction_id``` |              |
    | 8      | 16-bit int | ```connection_id```  |              |
    | 16     |            |                      |              |


**Announce**

    1. Choose a random transaction ID.
    2. Fill the announce request structure.
    3. Send the packet

###### IPv4 Announce Request

    | Offset | Size           | Name                 | Value                            |
    | ------ | -------------- | -------------------- | -------------------------------- |
    | 0      | 64-bit int     | ```connection_id```  |                                  |
    | 8      | 32-bit int     | ```action```         | 1 // announce                    |
    | 12     | 32-bit int     | ```transaction_id``` |                                  |
    | 16     | 20-byte string | info_hash            |                                  |
    | 36     | 20-byte string | peer_id              |                                  |
    | 56     | 64-bit int     | downloaded           |                                  |
    | 64     | 64-bit int     | left                 |                                  |
    | 72     | 64-bit int     | uploaded             |                                  |
    | 80     | 32-bit int     | event                | // 1: compl. 2: start 3: stopped |
    | 84     | 32-bit int     | IP_address           | 0 // default                     |
    | 88     | 32-bit int     | key                  |                                  |
    | 92     | 32-bit int     | num_want             | -1 // default                    |
    | 96     | 16-bit int     | key                  |                                  |
    
    1. Receive the packet.
    2. Check whether the packet is at least 20 bytes.
    3. Check whether the transaction ID is equal to the one you chose.
    4. Check whether the action is announce.
    5. Do not announce again until interval seconds have passed or an event has occurred.

###### IPv4 announce response:

    | Offset     | Size           | Name           | Value         |
    | ---------- | -------------- | -------------- | ------------- |
    | 0          | 32-bit integer | action         | 1 // announce |
    | 4          | 32-bit integer | transaction_id |
    | 8          | 32-bit integer | interval       |
    | 12         | 32-bit integer | leechers       |
    | 16         | 32-bit integer | seeders        |
    | 20 + 6 * n | 32-bit integer | IP address     |
    | 24 + 6 * n | 16-bit integer | TCP port       |
    | 20 + 6 * N |


#### Announce Messaging

#### Info hash and torrent size

