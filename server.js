require('dotenv').config();
const express = require('express');
const layouts = require('express-ejs-layouts');
const app = express();
const multer = require('multer'); //used for uploading files
const cloudinary = require('cloudinary');
//uploader for images, make a uploads forlder, then pass through the route as middleware
const uploads = multer({ dest: './uploads'});

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

app.get('/images', (req, res) => {
  res.render('index');
})

app.get('/images/new', (req, res) => {
  res.render('new');
})

app.post('/images', uploads.single('inputFile'), (req, res) => {
  //grab the uploaded file
  const image = req.file.path;
  console.log(image);
  //upload image to cloudinary
  cloudinary.uploader.upload(image, (result) => {
    //the result that comes back from cloudinary
    console.log(result);
    //its getting this info from the info that it returns in the terminal
    res.render('index', { image: result.url })
  })
})

//Listen on PORT
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${PORT} 🎧`);
});

module.exports = server;
