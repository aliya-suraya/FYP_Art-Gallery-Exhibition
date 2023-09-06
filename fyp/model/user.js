const mongoose = require ("mongoose")

const userSchema = new mongoose.Schema(
{
    fname: {
        type:String,
        require: true,
    },
    lname: {
        type:String,
        require: true,
    },
    email: {
        type:String,
        require: true,
        unique:true,
    },
    username: {
        type:String,
        require:true,
        unique:true,

    },
    password: {
        type:String,
        require: true,
        unique:true,

    },
},
{ timestamps: true }
)
module.exports = mongoose.model("User", userSchema)