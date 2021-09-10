const express = require('express');
const router = express.router();
const gameCtrl = require("../controllers/games");

router.post('/', checkAuth);

function checkAuth(req, res, next) {
    if(req.user) return next();
    return res.status(401).json({message:'Not Authenticated'});
}

modules.exports = router;