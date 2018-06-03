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

// 3.
const socket = dgram.createSocket('udp4');

// 4
const myMsg = Buffer.from('hello?', 'utf8');

// 
socket.send(myMsg, 0, myMsg.length, url.port, url.host, () => {});

socket.on('message', msg => {
  console.log('message is', msg);
})
console.log(torrent.announce.toString('utf8'));
