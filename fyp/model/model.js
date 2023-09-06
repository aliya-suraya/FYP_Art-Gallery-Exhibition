const mongoose = require ("mongoose");

const modelSchema = new mongoose.Schema({
    modelFile:String,
    imageData:String,
});

module.exports = mongoose.model("Model", modelSchema);
        
    