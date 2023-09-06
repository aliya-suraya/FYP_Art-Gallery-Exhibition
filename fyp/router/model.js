const express = require('express');
const router = express.Router();
const mongoose = require ('mongoose');
const bcrypt = require('bcrypt');
const fs = require ('fs');
const multer = require('multer');
const path = require("path");

const modelSchema = new mongoose.Schema({
    modelFile:String,
    imageData:String,
});

const Model = mongoose.models.Model || mongoose.model('Model', modelSchema);
const upload = multer ({dest: 'uploads/'});


router.post('/upload', upload.single('model'), (req,res) => {
    console.log('Upload request received');
    const modelFile = req.file;
    const imageData = req.body.imageData;

    fs.renameSync(modelFile.path, path.join('uploads/', modelFile.originalname));
    
    const databaseEntry = {
        modelPath: `uploads/${modelFile.originalname}`,
        imageData: imageData,
    };
    console.log('Model file:', modelFile);
    console.log('Image data:', imageData);

    Model.create(databaseEntry, (err, createdEntry) => {
        if (err) {
            console.error('Error creating databse entry:', err);
            return res.status(500).json ({ error: 'Database error'});
        }
        console.log('Database entry created:', createdEntry);
        res.status(200).json({message: 'Upload successful'});
    });
});

module.exports = router;
