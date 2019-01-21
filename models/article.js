const mongoose = require('mongoose');

let articleSchema = new mongoose.Schema({
    title:{
        type: String,
        required:true
    },
    author:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    body:{
        type: String,
        required:true
    },
    images:{
        type:String,
        required:false
    },
    date:{
        type:String,
        required:true
    },
    userId:{
        type:String,
        required:true
    }
  });

  let Article = module.exports = mongoose.model('Article',articleSchema);