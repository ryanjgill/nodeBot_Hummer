var express = require('express')
  , app = express()
  , fs = require('fs')
  , os = require('os')
  , path = require('path')
  , http = require('http').createServer(app)
  , socketIO = require('socket.io')(http)
  , five = require('johnny-five')
  , eth0 = os.networkInterfaces().apcli0
  , brLan = os.networkInterfaces()['br-lan']
  , address = eth0 && eth0.length && eth0[0].address && eth0[0].address.indexOf('::') === -1
      ? eth0[0].address
      : brLan && brLan.length && brLan[0].address
        ? brLan[0].address
        : null
  , PORT = 3030
  , board = new five.Board({
      port: '/dev/ttyS0'
    })
  ;

function emitUserCount(socketIO) {
  socketIO.sockets.emit('user:count', socketIO.engine.clientsCount);
  console.log('Total users: ', socketIO.engine.clientsCount);
}

app.use(express.static(path.join(__dirname + '/public')));

// index route
app.get('/', function (req, res, next) {
  res.sendFile(path.join(__dirname + '/public/index.html'))
});
// variable input controller route
app.get('/controller', function (req, res, next) {
  res.sendFile(path.join(__dirname + '/public/controller.html'))
});

// board ready event
board.on('ready', function (err) {
  if (err) {
    console.log(err);
    board.reset();
    return;
  }

  function checkForZeroUsers(socketIO) {
    if (socketIO.engine.clientsCount === 0) {
      stop();
    }
  }

  console.log('board connected! Johnny-Five ready to go.')

  // setup motors 
  // steering 
  var motor1 = new five.Motor({
    pins: {
      pwm: 3,
      dir: 5
    },
    invertPWM: true
  })
  // power
  , motor2 = new five.Motor({
    pins: {
      pwm: 9,
      dir: 10
    },
    invertPWM: true
  });

  function forward(_speed) {
    motor2.forward(_speed ? _speed : 255);
  }

  function reverse(_speed) {
    motor2.reverse(_speed ? _speed : 255);
  }

  function turnLeft(_speed) {
    motor1.forward(_speed ? _speed : 255 * .9);
  }

  function turnRight(_speed) {
    motor1.reverse(_speed ? _speed : 255 * .9);
  }

  function stop() {
    motor1.stop();
    motor2.stop();
  }

  // SocketIO events
  socketIO.on('connection', function (socket) {
    console.log('New connection!');

    emitUserCount(socketIO);

    socket.on('forward', forward);

    socket.on('reverse', reverse);

    socket.on('turnLeft', turnLeft);

    socket.on('turnRight', turnRight);

    // nipplejs variable input events
    socket.on('steer', function (input) {
      if (input.direction === 'right') {
        //console.log('motor1:forward(' + input.force + ')');
        motor1.forward(input.force);
      } else {
        //console.log('motor1:reverse(' + input.force + ')');
        motor1.reverse(input.force);
      }
    });

    socket.on('drive', function (input) {
      if (input.direction === 'forward') {
        //console.log('motor2:forward(' + input.force + ')');
        motor2.forward(input.force);
      } else {
        //console.log('motor2:reverse(' + input.force + ')');
        motor2.reverse(input.force);
      }
    });

    socket.on('stop', function (motor) {
      if (!motor) {
        stop();
      } else if (motor === 'leftMotor') {
        //console.log('motor1:stop');
        motor1.stop();
      } else {
        //console.log('motor2:stop');
        motor2.stop();
      }
    });

    socket.on('disconnect', function() {
      checkForZeroUsers(socketIO);
      emitUserCount(socketIO);
    });
  });

  // set the app to listen on PORT
  http.listen(PORT);

  // log the address and port
  console.log('Up and running on ' + address + ':' + PORT);
});