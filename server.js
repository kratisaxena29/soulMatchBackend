require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// const allowedOrigins = ['https://soulmatch.co.in'];

// app.use(cors({
//     origin: function (origin, callback) {
//         if (allowedOrigins.includes(origin) || !origin) {
//             callback(null, origin);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     credentials: true
// }));

 const allowedOrigins = ['https://www.soulmatch.co.in', 'https://soulmatch.co.in'];
app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  }));
// app.use(cors({
//   origin: "*"  
// }))

// const MONGODBURI = 'mongodb://127.0.0.1:27017/soulMatch'
const MONGODBURI =  'mongodb://admin:Y2wRrSw6kTT0ONt@13.200.211.15:27017/?authSource=admin';
// const MONGODBURI = 'mongodb://admin:Pdi73vGW@13.200.211.15:27017/?authMechanism=DEFAULT&authSource=soulMatch'
// const MONGODBURI = process.env.MONGO_URI
mongoose.connect(MONGODBURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // authSource: 'soulMatch',
    // user: 'admin', 
    // pass: 'Y2wRrSw6kTT0ONt',
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Connection error:', err));

mongoose.set('debug', false);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log("Successfully connected to DB");
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// app.use(bodyParser.json());
app.use(require('./routes'));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        // origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true,
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

let PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`Server is up and running on ${PORT}..`);
});
