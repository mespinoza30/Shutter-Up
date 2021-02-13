require('dotenv').config();
const express = require('express');
const layouts = require('express-ejs-layouts');
const app = express();
const multer = require('multer'); //used for uploading files
const cloudinary = require('cloudinary');

app.set('view engine', 'ejs');

app.use(require('morgan')('dev'));
app.use(express.urlencoded({ extended: false })); //to access req.body
app.use(express.static(__dirname + '/public'));
app.use(layouts);

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/profile', (req, res) => {
  res.render('profile');
});

app.use('/auth', require('./routes/auth'));


const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${PORT} 🎧`);
});

module.exports = server;
