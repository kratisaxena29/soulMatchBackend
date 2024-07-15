require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

app.use(cors({
    origin: "*"
}));

const MONGODBURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/soulMatch';
mongoose.connect(MONGODBURI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    retryWrites: false
});
mongoose.set('debug', false);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log("Successfully connected to DB");
});

app.use(bodyParser.json());
app.use(require('./routes'));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Socket.IO setup
let users = [];
io.on('connection', socket => {
    console.log('a user connected', socket.id);

    socket.on('addUser', userId => {
        const isUserExist = users.find(user => user.userId === userId);
        if (!isUserExist) {
            const user = { userId, socketId: socket.id };
            users.push(user);
            io.emit('getUsers', users);
        }
    });

    socket.on('handleSendMessage', ({ senderId, receiverId, message, conversationId }) => {
        const receiver = users.find(user => user.userId === receiverId);
        const sender = users.find(user => user.userId === senderId);
        if (receiver) {
            io.to(receiver.socketId).to(sender.socketId).emit('getMessage', {
                senderId,
                message,
                conversationId,
                receiverId
            });
        }
    });

    socket.on('disconnect', () => {
        users = users.filter(user => user.socketId !== socket.id);
        io.emit('getUsers', users);
    });
});

let PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
    console.log(`Server is up and running on ${PORT}..`);
});
