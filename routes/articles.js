const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

//Import Article Model
const Article = require('../models/article');

router.get('/add',function(req,res){
    res.render('add_article',{title:'Add Article'})
});

router.post('/add',[
  check('title','Please enter Title!').not().isEmpty(),
  check('author', 'Please enter Author!').not().isEmpty(),
  check('body','Please enter Article Body!').not().isEmpty()
],function(req,res){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const allErrors  = errors.array(false)
        res.render('add_article',{title: "Add Article", errors : allErrors})
    }else{
        let article = new Article();
        
        article.title = req.body.title;
        article.author = req.body.author;
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
router.get('/edit/:id',function(req,res){
    Article.findById(req.params.id,function(err,article){
        if(err){
            console.log("err",err);
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
router.delete('/:id',function(req,res){
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
})

module.exports = router;