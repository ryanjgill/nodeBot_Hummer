var express = require('express')
  , app = express()
  , ip = require('ip')
  , path = require('path')
  , http = require('http').createServer(app)
  , socketIO = require('socket.io')(http)
  , five = require('johnny-five')
  , Raspi = require('raspi-io')
  , emitUserCount = require('./utils/emitUserCount')
  , log = require('./utils/log')
  , showLogs = false // enable to view logs
  , address = ip.address()
  , PORT = 3030
  , board = new five.Board({
      io: new Raspi(),
      repl: false
    })
  ;

app.use(express.static(path.join(__dirname + '/public')));

// index route
app.get('/', function (req, res, next) {
  res.sendFile(path.join(__dirname + '/public/controller.html'))
});

// variable input controller route
app.get('/buttons', function (req, res, next) {
  res.sendFile(path.join(__dirname + '/public/buttons.html'))
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
      pwm: 'GPIO18',
      dir: 'GPIO17'
    },
    invertPWM: true
  })
  // power
  , motor2 = new five.Motor({
    pins: {
      pwm: 'GPIO13',
      dir: 'GPIO12'
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
    motor1.reverse(_speed ? _speed : 255 * .9);
  }

  function turnRight(_speed) {
    motor1.forward(_speed ? _speed : 255 * .9);
  }

  function stop() {
    motor1.stop();
    motor2.stop();
  }

  // SocketIO events
  socketIO.on('connection', function (socket) {
    console.log('New connection!');

    emitUserCount(socketIO);

    // old button style events
    socket.on('forward', forward);
    socket.on('reverse', reverse);
    socket.on('turnLeft', turnLeft);
    socket.on('turnRight', turnRight);

    // nipplejs variable input events
    socket.on('steer', function (input) {
      if (input.direction === 'right') {
        log('motor1:forward(' + input.force + ')', showLogs);
        motor1.forward(input.force);
      } else {
        log('motor1:reverse(' + input.force + ')', showLogs);
        motor1.reverse(input.force);
      }
    });

    socket.on('drive', function (input) {
      if (input.direction === 'forward') {
        log('motor2:forward(' + input.force + ')', showLogs);
        motor2.forward(input.force);
      } else {
        log('motor2:reverse(' + input.force + ')', showLogs);
        motor2.reverse(input.force);
      }
    });

    socket.on('stop', function (motor) {
      if (!motor) {
        stop();
      } else if (motor === 'leftMotor') {
        log('motor1:stop', showLogs);
        motor1.stop();
      } else {
        log('motor2:stop', showLogs);
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
