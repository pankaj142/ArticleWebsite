const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require :true
    },
    email:{
        type: String,
        require:true
    },
    username:{
        type:String,
        required:true
    },
    avatar:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required:true
    }
}) 
let User = mongoose.model('User',userSchema);
module.exports = User;