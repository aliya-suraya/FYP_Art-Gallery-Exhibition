const express = require('express');
const router = express.Router();
const mongoose = require ('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema ({
    fname: String,
    lname: String,
    email: String,
    username: String,
    password: String,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

router.post('/', async (req, res) => {
    const { fname, lname, email, username, password } = req.body;

    const emailRegex = /^\d{10}@student\.uitm\.edu\.my$/;
    if(!emailRegex.test(email)) {
        return res.status(400).json({error:'Invalid email format'});
    }

    try {
        //check if username already taken
        const existingUser = await User.findOne ({ username });
        if (existingUser) {
            return res.status(409).json({error:'Username already exist'});
        }
        const hashPassword = await bcrypt.hash(password, 10);

        // create new user
        const newUser = new User({ 
            fname,
            lname,
            email, 
            username,
            password: hashPassword,
         });
        await newUser.save();

        return res.status(201).json({message:'User registered successfully'});
    }
    catch (error) {
        return res.status(500).json({error: 'Error registering user'});
    }
});

module.exports = router;