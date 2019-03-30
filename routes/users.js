const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator/check");
const passport = require("passport");

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
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};
var multerConfig = multer({ storage: storage, fileFilter: imageFilter }).single(
  "avatar"
);

var cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "pankaj142",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//User Model
const User = require("../models/user");
const Article = require("../models/article");

router.get("/register", function(req, res) {
  res.render("register");
});

router.post(
  "/register",
  //multer middleware- handles image file upload
  function(req, res, next) {
    multerConfig(req, res, function(err) {
      if (err) {
        req.flash(
          "danger",
          "Avatar file extension is invalid. Only jpeg and png images allowed."
        );
        res.redirect("/articles/add");
      } else {
        next();
      }
    });
  },

  //validation array req.body
  [
    check("name")
      .not()
      .isEmpty()
      .withMessage("Please enter name!"),
    check("email")
      .isEmail()
      .withMessage("Please enter email!"),
    check("username")
      .not()
      .isEmpty()
      .withMessage("Please enter user name!")
      .isLength({ min: 4, max: 15 })
      .withMessage("Username must be atleast 4 character long"),
    check("password")
      .isLength({ min: 4, max: 100 })
      .withMessage("Password must be atleast 4 character long"),
    check("password2", "Confirm password cannot be empty.")
      .not()
      .isEmpty()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Password don't match!");
        } else {
          return value;
        }
      })
  ],
  function(req, res, next) {
    //validation errors
    const errors = validationResult(req);
    console.log("errors", errors.array());

    if (!errors.isEmpty()) {
      return res.render("register", { errors: errors.array() });
    } else if (req.file === undefined) {
      //avatar file validation
      req.flash("danger", "Please select your Avatar.");
      return res.redirect("/users/register");
    }
    next();
  },
  function(req, res, next) {
    //mutler middleware is for image upload and handling errors
    cloudinary.uploader
      .upload(req.file.path)
      .then(result => {
        if (!result) {
          req.flash("danger", "Could not upload profile picture.");
          return res.redirect("/users/register");
        }
        req.imageUrl = result.secure_url;
        next();
      })
      .catch(err => {
        req.flash("danger", "Could not upload profile picture.");
        return res.redirect("/users/register");
      });
  },
  function(req, res) {
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(req.body.password, salt, function(err, hash) {
        let userDetails = new User();
        userDetails.name = req.body.name;
        userDetails.email = req.body.email;
        userDetails.username = req.body.username;
        // (userDetails.avatar = req.file.filename),
        (userDetails.avatar = req.imageUrl), (userDetails.password = hash);
        userDetails.save(function(err) {
          if (err) {
            console.log(err);
          } else {
            req.flash("success", "You Registered successfully! You can login!");
            res.redirect("/");
          }
        });
      });
    });
  }
);

//Login Form
router.get("/login", function(req, res) {
  res.render("login");
});

//Login Process
router.post("/login", function(req, res, next) {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});
//If authentication succeeds, the next handler will be invoked and the req.user property will be set to the authenticated user.

//Logout
router.get("/logout", function(req, res) {
  req.logOut();
  req.flash("success", "You are logged out!");
  res.redirect("/users/login");
});

router.get("/profile/:id", function(req, res) {
  User.findById(req.params.id, function(err, user_profile) {
    if (err) {
      console.log(err);
    } else {
      Article.find({ userId: user_profile._id }, function(err, articles) {
        res.render("user_profile", {
          user_profile: user_profile,
          articles: articles
        });
      }).select(["title", "author"]);
    }
  });
});

module.exports = router;
