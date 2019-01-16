const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator/check');
const passport = require('passport');

const User = require('../models/user') 

router.get('/register',function(req,res){
    res.render('register');
})

router.post('/register',[
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
        const errors = validationResult(req);
        console.log("errors",errors.array())
        if(!errors.isEmpty()){
            res.render('register',{errors: errors.array()})
        }else{
            bcrypt.genSalt(10,function(err,salt){
                bcrypt.hash(req.body.password, salt, function(err,hash){
                    let userDetails = new User();
                    console.log("req",req.body)
                    console.log("userDetails",userDetails)
                    userDetails.name = req.body.name;
                    userDetails.email = req.body.email;
                    userDetails.username = req.body.username;
                    userDetails.password = hash;
                    userDetails.save(function(err){
                        if(err){
                            console.log(err)
                        }else{
                            req.flash("success", "You Registered!");
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

module.exports = router;