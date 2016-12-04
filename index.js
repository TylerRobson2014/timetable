// index.js

var express = require('express');
var app = express();
var socketio = require('socket.io');

app.get('/', function (req, res) {
  //res.send('It Works!');             // one line response
  res.sendFile('/home/pi/www/index.html');     // or send a webpage you designed
});

var server = app.listen(12345, function () {

  console.log('Node Express Webserver Started');

});

socketio.listen(server).on('connection', function (socket) {

    socket.on('message', function (msg) {

        console.log('Message Received: ', msg);

        socket.broadcast.emit('message', msg);

    });

});
