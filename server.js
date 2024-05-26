const express = require('express')
const app = express();
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors');

app.use(
    cors({
        origin: "*"
    }),
);

const MONGODBURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/soulMatch'
mongoose.connect(MONGODBURI,{
    useUnifiedTopology : true,
    useNewUrlParser : true,
    retryWrites : false
})
mongoose.set('debug',false);

const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'));
db.once('open',() => {
    console.log("Successfully connected to DB")
})

app.use(bodyParser.json())
 app.use(require('./routes'))

let PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server is up and running on ${PORT}..`)
})