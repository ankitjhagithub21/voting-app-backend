const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    age:{
        type:String,
        required:true
    },
    ano:{
        type:Number,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["voter","admin"],
        default:"voter"
    },
    isVoted:{
        type:Boolean,
        default:false
    },
    forVoted:{
        type:String,
    }
})

const User = mongoose.model('User',userSchema)

module.exports = User