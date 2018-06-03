'use strict';

const dgram = require('dgram');
const Buffer = require('buffer').Buffer;
const urlParse = require('url').parse;

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
      const announceReq = buildAnnounceReq(connResp.connectionId);
      udpSend(socket, announceReq, url);
    } else if (respType(response) === 'announce') {
      // 4. Parse announce response.
      const announceResp = parseAnnounceResp(response);
      callback(announceResp.peers);
    }
  })
}

function udpSend(socket, message, rawUrl, callback =()=> {}) {
  const url = urlParse(rawUrl);
  socket.send(message, 0, message.length, url.port, url.host, callback);
}

function respType(response) {

}

function buildConnReq() {}

function parseConnResp(response) {
  
}

function buildAnnounceReq(connectionId) {

}

function parseAnnounceReq(response) {
  
}