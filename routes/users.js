const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator/check');
const passport = require('passport');

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/users/avatars')
    },
    filename: function (req, file, cb) {
      cb(null, req.body.username+'_avatar.'+ file.mimetype.split('/')[1])
    }
  })

function fileFilter(req,file,cb){
    console.log("file filter",file)
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true)
    }else{
        return cb(new Error('Only jpeg and png images allowed.'))
    }
}  
const upload = multer({
    storage: storage,
    limits:{
    fileSize: 1024 *1024 * 5
    },
    fileFilter: fileFilter
}).single('avatar')
 
//User Model
const User = require('../models/user');
const Article = require('../models/article')

router.get('/register',function(req,res){
    res.render('register');
})

router.post('/register',
    //mutler middleware is for image upload and handling errors
    function(req,res,next){
        upload(req,res,function(err){
            if(err){
                req.flash("danger","Profile Picture file extension is invalid. Only jpeg and png images allowed.");
                res.redirect('/users/register');
            }else{
                console.log('save the file', req.file);
                next();
            }
        })
    },
    //validation array req.body
    [
        check('name').not().isEmpty().withMessage("Please enter name!"),
        check('email').isEmail().withMessage("Please enter email!"),
        check('username').not().isEmpty().withMessage("Please enter user name!").isLength({min:4, max:15}).withMessage('Username must be atleast 4 character long'),
        check('password').isLength({ min: 4, max: 100}).withMessage("Password must be atleast 4 character long"),
        check('password2','Confirm password cannot be empty.').not().isEmpty().custom((value,{req})=> {
            if(value !== req.body.password){
                throw new Error("Password don't match!")
            }else{
                return value
            }}
        )
    ],
    function(req,res){
        // console.log('multer error',err)
        console.log('multer ',req.file)
        // console.log("req img path",req.file.path)    
        console.log('req.body 2 ',req.body)
        console.log('req.body avataer ',req.body.avatar)
        const errors = validationResult(req);
        console.log("errors",errors.array())
        
        if(!errors.isEmpty()){
            res.render('register',{errors: errors.array()})
        }else if(req.file === undefined){ //avatar file validation
            console.log('file not selected')
            req.flash("danger", "Please select your Avatar.");
            res.redirect('/users/register')
        }else{
            bcrypt.genSalt(10,function(err,salt){
                bcrypt.hash(req.body.password, salt, function(err,hash){
                    let userDetails = new User();
                    console.log("req",req.body)
                    console.log("userDetails",userDetails)
                    userDetails.name = req.body.name;
                    userDetails.email = req.body.email;
                    userDetails.username = req.body.username;
                    userDetails.avatar = req.file.filename,
                    userDetails.password = hash;
                    userDetails.save(function(err){
                        if(err){
                            console.log(err)
                        }else{
                            req.flash("success", "You Registered successfully! You can login!");
                            res.redirect('/')
                        }
                    })
                })
            })
        }
})

//Login Form
router.get('/login',function(req,res){
    res.render('login');
})

//Login Process
router.post('/login',function(req,res,next){
    passport.authenticate('local',{
        successRedirect:'/',
        failureRedirect:'/users/login',
        failureFlash:true 
    })(req,res,next)
})
//If authentication succeeds, the next handler will be invoked and the req.user property will be set to the authenticated user.

//Logout
router.get('/logout',function(req,res){
    req.logOut();
    req.flash('success', 'You are logged out!')
    res.redirect('/users/login')
})

router.get('/profile/:id',function(req,res){
    User.findById(req.params.id,function(err,user_profile){
        if(err){
            console.log(err);
        }else{
            Article.find({userId: user_profile._id},function(err,articles){
                console.log('articles fileds',articles)
                res.render('user_profile',{user_profile: user_profile, articles: articles})
            }).select('title')
        }
    })
    
})

module.exports = router;