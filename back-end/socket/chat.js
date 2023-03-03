module.exports = function (io) {

  const sMessage = require('../models/message');

  io.on('connection', (socket) => {

    sMessage.count((err, count) => {
      if (err) {
        console.log(err)
      }
      else {
        io.emit('messageCount', count);
      }
    });

    sMessage.aggregate([
      { $group: { _id: '$username', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ], (err, results) => {
      if (err) {
        console.log(err);
      } else {
        io.emit('users', results);
      }
    });

    io.emit('connectedUsers')

    socket.on('message', (data) => {
      const newMessage = new sMessage({ ...data });

      newMessage.save().then((item) => {
        sMessage.count((err, count) => {
          if (err) {
            console.log(err);
          }
          else {
            sMessage.aggregate([
              { $group: { _id: '$username', count: { $sum: 1 } } },
              { $sort: { _id: -1 } }
            ], (err, results) => {
              if (err) {
                console.log(err);
              } else {
                if(item.addressee == "all"){
                  io.emit('message', item);
                }
                else{
                  io.emit(item.addressee, item);
                }
                io.emit('users', results);
                io.emit('messageCount', count);
              }
            });
          }
        })
      })
    })

    socket.on('connectingUser', (data) => {
      io.emit('connectingUser', data);
    });

    // Listener sur la déconnexion
    socket.on('disconnect', () => {
      console.log(`user ${socket.id} disconnected`);
      io.emit('notification', { type: 'removed_user', data: socket.id });
    });


  })
}