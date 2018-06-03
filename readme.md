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

### Sending messages with UDP

### UDP Trcacker protocol and message format.

#### Connect Messaging

#### Announce Messaging

#### Info hash and torrent size

