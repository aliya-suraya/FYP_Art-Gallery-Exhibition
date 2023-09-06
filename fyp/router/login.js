const express = require('express');
const router = express.Router();
const mongoose = require ('mongoose');
const bcrypt = require('bcrypt');  

const User = mongoose.models.User || mongoose.model('User');

router.post('/', async (req, res) => {
    const { username, password } = req.body;

    try {
        //check username
        const user = await User.findOne ({ username: req.body.username });
        if (!user) {
          return res.status(400).json("Wrong Username");
        }

        //compare password
        const validate = await bcrypt.compare(req.body.password, user.password);
        if (!validate) {
          return  res.status(400).json("Wrong Password");
        } 

         res.redirect('/index2.html');    
    }
    catch (error) {
        return res.status(500).json(error);
    }
})
module.exports = router;