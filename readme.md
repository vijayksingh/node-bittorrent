# Overview of Bittorrent

The bittorrent protocol has two parts.

 1. You need to send your request to something called tracker, and tracker respond with the list of peers.  
    * In Layman terms : You tell the tracker which files you're trying to download, and the tracker gives you the ip address of the users you download them from.

 1. After you have the list of peer addresses, you can connect ot them directly and start downloading. 
    * What really happens : So you go and ask a peer i need this file, 


- The torrent file has announce property, which generally signifies location of torrent tracker.
- Interesting thing is torrent operates on udp protocol instead of http protocol.

## Bencode 

## Getting Peers via the Tracker

### HTTP vs UPD vs TCP

### Sending messages with UDP

### UDP Trcacker protocol and message format.

#### Connect Messaging

#### Announce Messaging

#### Info hash and torrent size

