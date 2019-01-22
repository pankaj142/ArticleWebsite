const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/articles/images')
    },
    filename: function (req, file, cb) {
      cb(null, req.body.title+'_image.'+ file.mimetype.split('/')[1])
    }
})

function fileFilter(req,file,cb){
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true)
    }else{
        return cb(new Error('Only jpeg and png images allowed.'))
    }
}  

const multerConfig = multer({
    storage: storage,
    limits:{
        fileSize: 1024 *1024 * 5
    },
    fileFilter: fileFilter
}).single('picture')

//Import Article Model
const Article = require('../models/article');

//Import User Model
const User = require('../models/user')

router.get('/add', ensureAuthenticated, function(req,res){
    res.render('add_article',{title:'Add Article'})
});

router.post('/add', 
    //multer middleware- handles image file upload
    function(req,res,next){
        multerConfig(req,res,function(err){
            if(err){
                console.log('errzzzzzzzz',err)
                req.flash('danger','Picture file extension is invalid. Only jpeg and png images allowed.');
                res.redirect('/articles/add')
            }else{
                console.log('save the file', req.file);
                next();
            }
        })
    },
    [
        check('title','Please enter Title!').not().isEmpty(),
        check('description','Please enter Description!').not().isEmpty(),
        check('body','Please enter Article Body!').not().isEmpty()
    ],
    function(req,res){
        console.log("user data",req.user)
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            const allErrors  = errors.array(false)
            res.render('add_article',{title: "Add Article", errors : allErrors})
        }else if(req.file === undefined){
            req.flash('danger','Image is not selected.');
            res.redirect('/articles/add')
        }else{
            console.log("article image ",req.file)
            let article = new Article();
            article.title = req.body.title;
            article.description = req.body.description;
            //req.user contains logined users details
            article.author = req.user.name;
            article.images = req.file.filename;
            article.body = req.body.body;
            article.date = new Date();
            article.userId = req.user._id;
            console.log(" article submitted")
            article.save(function(err){
                if(err){
                    console.log(err);
                    return;
                }else{
                    req.flash("success", "Article added successfully!");
                    res.redirect('/');
                }
            })
        }
})
//Get Single Article
router.get('/:id', function (req, res) {
    Article.findById(req.params.id,function(err, article){
        if(err){
            console.log(err)
        }else{
            User.findById(article.userId,function(err,user){
                if(err){
                    console.log("userId fetch err",err)
                }else{
                    console.log('author image',user)
                    article.date = article.date.split(' ')[1] +' '+ article.date.split(' ')[3];
                    res.render('article',{article: article, author: user})
                }
            }).select('avatar');
            
        }
    })
})

//Load Edit Form
router.get('/edit/:id', ensureAuthenticated, function(req,res){
    console.log("edit req.body",req.body)
    Article.findById(req.params.id,function(err,article){
        if(err){
            console.log("err",err);
        }if(article.author != req.user.name){ //only the owner of article can edit
            req.flash("danger","You are not autherized!");
            res.redirect('/')
        }else{
            res.render('edit_article',{title:"Edit Article",article:article})
        }
    })
})

//Update Article
router.post('/edit/:id',function(req,res){
    let article = {};
    article.title = req.body.title;
    article.description = req.body.description;
    article.body = req.body.body;
    let query = {_id: req.params.id};

    Article.update(query,article,function(err){
        if(err){
            console.log(err)
        }else{
            //warning beacuse the it is the bootstrap class of alert
            req.flash('warning ','Article Updated Successfully!')
            res.redirect('/articles/'+req.params.id)
        }
    })
})

//Delete Article
router.delete('/:id', ensureAuthenticated, function(req,res){
    Article.findById(req.params.id, function(err, article){
        if(err) throw err;
        if(article.author != req.user.name){
            res.status(500).send()
        }else{
            const query = {_id:req.params.id}
            Article.remove(query,function(err){
                if(err){
                    console.log(err)
                }else{
                    //danger beacuse the it is the bootstrap class of alert
                    req.flash("danger","Article Deleted successfully!")
                    res.send("Success")
                }
            })
        }
    })
})

function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        next();
    }else{
        req.flash('danger','Please Login');
        res.redirect('/users/login')
    }
}

module.exports = router;