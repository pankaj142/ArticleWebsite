const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

mongoose.connect(config.database);
let db = mongoose.connection;

//check for DB Errors
db.on('error', console.error.bind(console, 'connection error:'));

//Check connection
db.once('open', function() {
    console.log("Connected to MongoDB")
});

//Bring on Models
let Article = require('./models/article')

//Init App
const app = express();

//Static Files
app.use(express.static(path.join(__dirname, 'public')))

// Load View Engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

//Body Parser Middleware
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:false}))

//parse application JSON
app.use(bodyParser.json());

//Set public Folder
app.use(express.static(path.join(__dirname,'public')))

//Express Session Middleware 
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
}))

//Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Passport Config
require('./config/passport')(passport);
//Passport Middlewares
app.use(passport.initialize());
app.use(passport.session());

//Set global variable 'user' if there is actually object req.user
//after authentication req.user will contain authenticated user
app.get('*',function(req,res,next){
    res.locals.user = req.user || null;
    next();
})

// Home Route
app.get('/',function(req,res){
    Article.find({},function(err,articles){
        if(err){
            console.log(err)
        }else{
            res.render('index',{title:"Articles", articles:articles})
        }
    })
})

//Articles Routes
const articles = require('./routes/articles');
app.use('/articles',articles)

//Users Routes
const users = require('./routes/users');
app.use('/users',users)

//Start Server
app.listen(3000,function(){
    console.log("Server is running on 3000 port...")
})