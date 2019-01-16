const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

//Import Article Model
const Article = require('../models/article');

router.get('/add', ensureAuthenticated, function(req,res){
    res.render('add_article',{title:'Add Article'})
});

router.post('/add',[
  check('title','Please enter Title!').not().isEmpty(),
  check('body','Please enter Article Body!').not().isEmpty()
],function(req,res){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const allErrors  = errors.array(false)
        res.render('add_article',{title: "Add Article", errors : allErrors})
    }else{
        let article = new Article();
        article.title = req.body.title;
        //req.user contains logined users details
        article.author = req.user.name;
        article.body = req.body.body;
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
            res.render('article',{article: article})
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
    article.author = req.body.author;
    article.body = req.body.body;
    let query = {_id: req.params.id};

    Article.update(query,article,function(err){
        if(err){
            console.log(err)
        }else{
            //warning beacuse the it is the bootstrap class of alert
            req.flash('warning ','Article Updated Successfully!')
            res.redirect('/')
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