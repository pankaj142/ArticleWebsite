const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");

//multer image upload
const multer = require("multer");
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function(req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Only image files are allowed!"));
  }
  cb(null, true);
};
var multerConfig = multer({ storage: storage, fileFilter: imageFilter }).single(
  "picture"
);

var cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "pankaj142",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//Import Article Model
const Article = require("../models/article");

//Import User Model
const User = require("../models/user");

router.get("/add", ensureAuthenticated, function(req, res) {
  res.render("add_article", { title: "Add Article" });
});

router.post(
  "/add",
  //multer middleware- handles image file upload
  function(req, res, next) {
    multerConfig(req, res, function(err) {
      if (err) {
        req.flash(
          "danger",
          "Image file extension is invalid. Only jpeg and png images allowed."
        );
        res.redirect("/articles/add");
      } else {
        next();
      }
    });
  },
  //validation array req.body
  [
    check("title", "Please enter Title!")
      .not()
      .isEmpty(),
    check("description", "Please enter Description!")
      .not()
      .isEmpty(),
    check("body", "Please enter Article Body!")
      .not()
      .isEmpty()
  ],
  function(req, res, next) {
    //validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const allErrors = errors.array(false);
      return res.render("add_article", {
        title: "Add Article",
        errors: allErrors
      });
    } else if (req.file === undefined) {
      req.flash("danger", "Image is not selected.");
      return res.redirect("/articles/add");
    }
    next();
  },
  function(req, res, next) {
    //image store to cloudinary
    cloudinary.uploader
      .upload(req.file.path)
      .then(result => {
        if (!result) {
          req.flash("danger", "Could not upload image.");
          return res.redirect("/users/register");
        }
        req.imageUrl = result.secure_url;
        next();
      })
      .catch(err => {
        req.flash("danger", "Could not upload image.");
        return res.redirect("/users/register");
      });
  },
  function(req, res) {
    let article = new Article();
    article.title = req.body.title;
    article.description = req.body.description;
    //req.user contains logined users details
    article.author = req.user.name;
    // article.images = req.file.filename;
    article.images = req.imageUrl;
    article.body = req.body.body;
    article.date = new Date();
    article.userId = req.user._id;
    article.save(function(err) {
      if (err) {
        console.log(err);
        return;
      } else {
        req.flash("success", "Article added successfully!");
        res.redirect("/");
      }
    });
  }
);
//Get Single Article
router.get("/:id", function(req, res) {
  Article.findById(req.params.id, function(err, article) {
    if (err) {
      console.log(err);
    } else {
      User.findById(article.userId, function(err, user) {
        if (err) {
          console.log("userId fetch err", err);
        } else {
          console.log("author image", user);
          article.date =
            article.date.split(" ")[1] + " " + article.date.split(" ")[3];
          res.render("article", { article: article, author: user });
        }
      }).select("avatar");
    }
  });
});

//Load Edit Form
router.get("/edit/:id", ensureAuthenticated, function(req, res) {
  console.log("edit req.body", req.body);
  Article.findById(req.params.id, function(err, article) {
    if (err) {
      console.log("err", err);
    }
    if (article.author != req.user.name) {
      //only the owner of article can edit
      req.flash("danger", "You are not autherized!");
      res.redirect("/");
    } else {
      res.render("edit_article", { title: "Edit Article", article: article });
    }
  });
});

//Update Article
router.post("/edit/:id", function(req, res) {
  let article = {};
  article.title = req.body.title;
  article.description = req.body.description;
  article.body = req.body.body;
  let query = { _id: req.params.id };

  Article.update(query, article, function(err) {
    if (err) {
      console.log(err);
    } else {
      //warning beacuse the it is the bootstrap class of alert
      req.flash("warning ", "Article Updated Successfully!");
      res.redirect("/articles/" + req.params.id);
    }
  });
});

//Delete Article
router.delete("/:id", ensureAuthenticated, function(req, res) {
  Article.findById(req.params.id, function(err, article) {
    if (err) throw err;
    if (article.author != req.user.name) {
      res.status(500).send();
    } else {
      const query = { _id: req.params.id };
      Article.remove(query, function(err) {
        if (err) {
          console.log(err);
        } else {
          //danger beacuse the it is the bootstrap class of alert
          req.flash("danger", "Article Deleted successfully!");
          res.send("Success");
        }
      });
    }
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash("danger", "Please Login");
    res.redirect("/users/login");
  }
}

module.exports = router;
