'use strict';
const fs = require('fs');
const bencode = require('bencode');

// 1. Requiring 3 modules, standard library inside node.
const dgram = require('dgram');
const Buffer = require('buffer').Buffer;
const urlParse = require('url').parse;

// 2. Parsing the torrent tracker url
const torrent = bencode.decode(fs.readFileSync('puppy.torrent'));
const url = urlParse(torrent.announce.toString('utf8'));

// 3. The dgram module is module for handling udp request.
/* 
 - Here i instantiate a socket instance with udp4 parameter.
 - A socket is an object through which network communication can happen.
 - We pass the udp4 which signifies we want to use 4byte IPv4 address.
 - IPv4 address example 127.0.0.1 (can also pass udp6 for IPv6)
*/
const socket = dgram.createSocket('udp4');

// 4 In order to send a message through a socket, it must be in the form of socket.
/* 
  - Buffer.from is an easy way to create a buffer from a string.
*/
const myMsg = Buffer.from('hello?', 'utf8');

// 5. 
/*
 The socket's send method is used for sending messages.
 - The first arguement is the message as a buffer.
 - The next two arguement let you send just part of the buffer as the message by specifying
 an offset and length of the buffer.
 - By passing 0 and msg.length we can just send the whole lenght of the buffer.
 - Next two parameter are port and host number of reciever's url.
 - Last parameter is a callback for when the message has finished sending.
*/
socket.send(myMsg, 0, myMsg.length, url.port, url.host, () => {});

// 6.
/*
 Telling socket how to handle incoming messages. 
 The socket function will intercept a message event and it will be passed
 to the callback function.
*/
socket.on('message', msg => {
  console.log('message is', msg);
})

console.log(torrent.announce.toString('utf8'));
