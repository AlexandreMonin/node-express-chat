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
                io.emit('users', results);
                io.emit('message', item);
                io.emit('messageCount', count);
              }
            });
          }
        })
      })
    })

    // Listener sur la déconnexion
    socket.on('disconnect', () => {
      console.log(`user ${socket.id} disconnected`);
      io.emit('notification', { type: 'removed_user', data: socket.id });
    });


  })
}