const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');


mongoose.connect(config.database);
var db = mongoose.connection;

//check for DB Errors
db.on('error', console.error.bind(console, 'connection error:'));

//Check connection
db.once('open', function() {
    console.log("Connected to MongoDB")
});

//Article Models
let Article = require('./models/article')

//Init App
const app = express();

//Static Files
app.use(express.static(path.join(__dirname, 'public')))

//Avatar folder 
app.use('/avatars',express.static('uploads/users/avatars'));
//Article Image folder 
app.use('/article/images',express.static('uploads/articles/images'));

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

//multer Middleware

//Set global variable 'user' if there is actually object req.user
//after authentication req.user will contain authenticated user
app.get('*',function(req,res,next){
    res.locals.user = req.user || null;
    next();
})

// Home Route
app.get('/',function(req,res){
    console.log("auth req.user",req.user)
    Article.find({},function(err,articles){
        if(err){
            console.log(err)
        }else{
            console.log("articles xxxx",articles)
            const archives = ['March 2018','April 2018','May 2018','June 2018','Jully 2018','August 2018',
            'Sept 2018','November 2018','December 2018'];
            var latestArticleCount = 0;
            if(articles.length !== 0){
                latestArticleCount = articles.length -1;
            }else{
                var obj = {}
                obj.title = "Article Titel",
                obj.date= "Jan 2019",
                obj.description= "This is dummy article.";
                articles.push(obj)
            }
            articles.map(function(article){
                article.date = article.date.split(' ')[1] +' '+ article.date.split(' ')[3];
                return article;
            })
            res.render('index',{
                title:"Articles",
                articles: articles,
                archives: archives,
                latestArticleCount: latestArticleCount
            })
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
<<<<<<< HEAD
app.listen(80,function(){
    console.log("Server is running on 80 port...")
})
=======
app.listen(3000,function(){
    console.log("Server is running on 3000 port...")
})
>>>>>>> 83ce704ce0c2cfd28cbf823f162ce3a9c80b94d0
