'use strict';

const dgram = require('dgram');
const Buffer = require('buffer').Buffer;
const urlParse = require('url').parse;
const crypto = require('crypto');

const torrentParser = require('./torrent-parser');
const util = require('./util');

module.exports.getPeers = (torrent, callback) => {
  const socket = dgram.createSocket('udp4');
  const url = torrent.announce.toString('utf8');

  // 1 Send connect request.
  udpSend(socket, buildConneqReq(), url);

  socket.on('message', response => {
    if (respType(response) === 'connect') {
      // 2. Recieve and parse connect response
      const connResp = parseConnResp(response);
      // 3. Send announce request.
      const announceReq = buildAnnounceReq(connResp.connectionId, torrent);
      udpSend(socket, announceReq, url);
    } else if (respType(response) === 'announce') {
      // 4. Parse announce response.
      const announceResp = parseAnnounceResp(response);
      callback(announceResp.peers);
    }
  })
}

function udpSend(socket, message, rawUrl, callback = () => { }) {
  const url = urlParse(rawUrl);
  socket.send(message, 0, message.length, url.port, url.host, callback);
}

function respType(response) {
  const action = response.readUInt32BE(0);
  if (action === 0) return 'connect';
  if (action === 1) return 'announce';
}

function buildConnReq() {
  // Empty buffer of 16 bytes
  const buf = Buffer.alloc(16);

  //connection id
  // unsigned 32-bit integer in big-endian format
  // 0x specifies that the number is an hexadecimal number.
  // We are going to write these two in split 4 bytes values because node doesn't have 8bytes insertion method
  buf.writeUInt32BE(0x417, 0); // value 0x417 with offset of 4 bytes
  buf.writeUInt32BE(0x27101980, 4); // value 0x27101980 with offset of 4 bytes





  // action id
  // we write 4byte with value 0 and set offset at 8
  buf.writeUInt32BE(0, 8);

  // transaction id
  // create a random 4 bytes buffer and copy it into buf starting at offset 12
  crypto.randomBytes(4).copy(buf, 12);

  return buf;
}

function parseConnResp(response) {
  return {
    action: response.readUInt32BE(0),
    transactionId: response.readUInt32BE(4),
    connectionId: response.slice(8)
  }
}

/*

This is what we have to pass inside createAnnounceReq
Offset  Size    Name    Value
0       64-bit integer  connection_id
8       32-bit integer  action          1 // announce
12      32-bit integer  transaction_id
16      20-byte string  info_hash
36      20-byte string  peer_id
56      64-bit integer  downloaded
64      64-bit integer  left
72      64-bit integer  uploaded
80      32-bit integer  event           0 // 0: none; 1: completed; 2: started; 3: stopped
84      32-bit integer  IP address      0 // default
88      32-bit integer  key             ? // random
92      32-bit integer  num_want        -1 // default
96      16-bit integer  port            ? // should be betwee
98
*/
function buildAnnounceReq(connId, torrent, port = 6881) {
  const buf = Buffer.allocUnsafe(98); // Allocate 98 bytes

  // connection id
  connId.copy(buf, 0);

  //action id
  buf.writeUInt32BE(1, 8);

  //transaction id
  crypto.randomBytes(4).copy(buf, 12);

  //info hash
  torrentParser.infoHash(torrent).copy(buf, 16);

  // peerId
  util.genId().copy(buf, 36);

  //download
  Buffer.alloc(8).copy(buf, 56);

  //left
  torrentParser.size(torrent).copy(buf, 64);

  // uploaded
  Buffer.alloc(8).copy(buf, 72);

  // event
  buf.writeUInt32BE(0, 80);

  // ip address
  buf.writeUInt32BE(0, 80);

  // key
  crypto.randomBytes(4).copy(buf, 88);

  // num want 
  buf.writeInt32BE(-1, 92);

  // port
  buf.writeUInt32BE(port, 96);

  return buf;
}


function parseAnnounceReq(response) {
  function group(iterable, groupSize) {
    let groups = [];
    for (let i = 0; i < iterable.length; i += groupSize) {
      groups.push(iterable.slice(i, i + groupSize));
    }
    return groups;
  }

  return {
    action: response.readUInt32BE(0),
    transactionId: response.readUInt32BE(4),
    leechers: response.readUInt32BE(8),
    seeders: response.readUInt32BE(12),
    peers: group(response.slice(20), 6).map(address => {
      return {
        ip: address.slice(0, 4).join('.'),
        port: address.readUInt32BE(4)
      }
    })
  }
}

