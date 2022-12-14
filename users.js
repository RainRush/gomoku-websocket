const users = [];

const addUser = ({ id, name, room }) => {
  if (!name || !room) return { error: 'Username and room are required.' };

  const trimmedName = name.trim().toLowerCase();
  const trimmedRoom = room.trim().toLowerCase();

  const existingUser = users.find(
    (user) => user.room === trimmedRoom && user.name === trimmedName
  );

  if (existingUser) return { error: 'Username is taken.' };

  const user = { id, name, room };
  users.push(user);

  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) return users.splice(index, 1)[0];
};

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
