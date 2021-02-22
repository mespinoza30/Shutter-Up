require('dotenv').config();
const express = require('express');
const layouts = require('express-ejs-layouts');
const session = require('express-session');
const passport = require('./config/ppConfig');
const flash = require('connect-flash');
const app = express();
const multer = require('multer'); //used for uploading files
const db = require('./models')
const cloudinary = require('cloudinary');
//uploader for images, make a uploads forlder, then pass through the route as middleware
const uploads = multer({ dest: './uploads'});
//for put & delete 
const methodOverride = require('method-override')

app.set('view engine', 'ejs');

const SECRET_SESSION = process.env.SECRET_SESSION;
const isLoggedIn = require('./middleware/isLoggedIn');
const router = require('./controllers/auth');

//Middleware
app.use(require('morgan')('dev'));
app.use(express.urlencoded({ extended: false })); //to access req.body
app.use(express.static(__dirname + '/public'));
app.use(layouts);
app.use(methodOverride('_method'));

const sessionObject = {
  secret: SECRET_SESSION,
  resave: false,
  saveUninitialized: true
}
app.use(session(sessionObject));

// Passport
app.use(passport.initialize()); // Initialize passport
app.use(passport.session()); // Add a session

// Flash 
app.use(flash());
app.use((req, res, next) => {
  console.log(res.locals);
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();
});

app.use('/auth', require('./controllers/auth'));

//home route
app.get('/', (req, res) => {
  res.render('index');
});

app.use('/auth', require('./routes/auth'));

app.get('/profile', isLoggedIn, (req, res) => {
  const { id, name, email } = req.user.get(); 
  req.user.getImages()
  .then(allImages => {
    console.log(allImages)
    res.render('profile', { allImages: allImages, id, name, email })
    console.log(allImages)
  })
})

app.get('/images/new', (req, res) => {
  res.render('new');
})

app.get('/mainDial', isLoggedIn, (req, res) => {
  db.image.findAll({
    include: [db.user]
  })
  .then(postArray =>{
    console.log(postArray[0])
    res.render('mainDial', {posts: postArray});
  })
});

///POST ROUTE
app.post('/mainDial', uploads.single('inputFile'), (req, res) =>{//pass in the uploads folder//allows us to bring in a single file
//greab uploaded file
const image = req.file.path
// console.log(image)//should show in terminal upload
//upload to image to cloudinary
cloudinary.uploader.upload(image, (result) =>{//first parameter is the file// next one is what happens after file uploaded//we are getting back a result
    // console.log(result)//result comeback from cloudinary//should get an object back in terminal//I get the url inside the object
    db.image.create({
     name: req.body.name,
     imageUrl: result.url
  })
  .then(newPost =>{
    // console.log(newPost.get())
    req.user.addImage(newPost)
    console.log(req.user)
    res.redirect('mainDial')
    })
  })
})

app.delete('/profile/:index', async(req, res) => {
  try {
    await db.image.destroy({
      where: {
        id: req.params.index
      }
    })
    res.redirect('/profile');
  } catch(e) {
    console.log(e.message)
  }
})

//404 page
app.use(function(req, res, next){
  res.status(404).render('404');
});

//Listen on PORT
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${PORT} 🎧`);
});

module.exports = server;