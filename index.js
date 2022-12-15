const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const options = {
  cors: true,
  origins: '*',
};
const io = socketio(server, options);
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');
const router = require('./router');

app.use(cors());
app.use(router);

io.on('connection', (socket) => {
  socket.on('join', ({ name, room }, callback) => {
    console.log(`${name} had joined room ${room}`);
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.join(user.room);

    socket.emit('message', {
      user: 'admin',
      text: `${user.name}, welcome to room ${user.room}.`,
    });
    socket.broadcast
      .to(user.room)
      .emit('message', { user: 'admin', text: `${user.name} has joined!` });

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on('typing', ({ status }) => {
    const user = getUser(socket.id);
    if (user) {
      io.to(user.room).emit('typing', { user: user.name, status });
    }
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    console.log(`user ${user.name}: message ${message}`);

    if (user) {
      io.to(user.room).emit('message', { user: user.name, text: message });
    }

    callback();
  });

  socket.on('addChessOrder', ({ xIndex, yIndex, chessType }) => {
    const user = getUser(socket.id);
    console.log(
      `addChessOrder: x ${xIndex}; y ${yIndex}; chessType ${chessType}`
    );
    if (user) {
      io.to(user.room).emit('message', {
        user: 'Admin',
        text: `${chessType}: (${xIndex}:${yIndex})`,
      });
      io.to(user.room).emit('updateChessOrder', {
        xIndex,
        yIndex,
        chessType,
      });
    }
  });

  socket.on('resetChessMap', () => {
    const user = getUser(socket.id);
    console.log('reset map');
    if (user) {
      io.to(user.room).emit('message', {
        user: 'Admin',
        text: `Chess Board Reset`,
      });
      io.to(user.room).emit('resetChessMap');
    }
  });

  socket.on('undoChessAction', () => {
    const user = getUser(socket.id);
    console.log('undo chess action');
    if (user) {
      io.to(user.room).emit('message', {
        user: 'Admin',
        text: `Undo Chess Action`,
      });
      io.to(user.room).emit('undoChessAction');
    }
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    console.log(`user ${user.name} left the room`);

    if (user) {
      io.to(user.room).emit('message', {
        user: 'Admin',
        text: `${user.name} has left.`,
      });
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(process.env.PORT || 4000, () =>
  console.log(`Server has started.`)
);
