module.exports = socketIO => {
  socketIO.sockets.emit('user:count', socketIO.engine.clientsCount);
  console.log('Total users: ', socketIO.engine.clientsCount);
}