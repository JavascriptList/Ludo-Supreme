const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const io  = require('socket.io');

var socket = io();

router.get('/',(req, res) => {
    res.send('!---------Welcome to Ludo Supreme Game--------------!');
})


router.post('/signup',(req, res) => {
    const {name,email,password} = req.body;
    if(!email || !password || !name){
        return res.status(422).json({error: 'Please add all the fields'})
    }
    User.findOne({email: email})
    .then((savedUser) => {
        if(savedUser){
            return res.status(422).json({error: 'user already exists with that email'})
        }
        bcrypt.hash(password,12)
        .then(hashedpassword => {
            const user = new User({
                email,
                password:hashedpassword,
                name
            })
            user.save()
            .then(user=>{
                res.json({message:"saved successfully"})
            })
            .catch((err =>{
                console.log(err);
            }))
        })
    })
    .catch(err=>{
        console.log(err);
    })
})


router.post('/signin',(req, res)=>{
    const {email,password} = req.body
    if(!email || !password){
        res.status(422).json({error:"please add email or password"});
    }
    User.findOne({email:email})
    .then(savedUser=>{
        if(!savedUser){
            return res.status(422).json({error:"Invalid email or password"});
        }
        bcrypt.compare(password, savedUser.password)
        .then(doMatch => {
            if(doMatch){
                res.json({message:"successfully signed in"});
            }
            else{
                return res.status(422).json({error:"Invalid email or password"});
            }
        })
        .catch(err => {
            console.log(err);
        })
    })
})


module.exports = router;