const Game = require("./models/game");
const board = require("./config/game");

const mongoose = require('mongoose');
require('./models/user');
const User = mongoose.model('User');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');


let io;
var games = {};

module.exports = {
    init: function(httpServer){
        io = require('socket.io')(httpServer);
        io.on('connection', function(socket){

            console.log("a user connected " + socket.id);

            socket.on('chat', function(chat){
                io.emit('chat', chat);
            });

            socket.on('getActiveGame', function(userId, game){
                var game = Object.values(games).find(g => g.players.some(p => p.id === userId));
                if(game){
                    socket.gameId = game.id;
                    socket.join(game.id);
                }
                io.emit('gameData', game);
            });


            socket.on('createGame', function(user, roomId){
                var game = new Game();
                board.createPlayer(game, user);
                game.save(function(err){
                    socket.gameId = game.id;
                    socket.join(game.id);
                    io.to(game.id).emit('gameData', game);
                    games[game._id] = game;
                })
            })


            socket.on('joinGame', function(user, roomId){
                var game = games[roomId];
                board.createPlayer(game, user);
                socket.gameId = game.id;
                socket.join(game.id);
                if(same.players.length ===4) game.gameInPlay = true;
                io.to(game.id).emit('gameData', game);
                game.save();
            })


            socket.on('startGame', function(){
                var game = games[socket.gameId];
                game.gameInPlay = true;
                io.to(game.id).emit('gameData', game);
                game.save();
            })


            socket.on('rollDice', function(){
                var game = games[socket.gameId];
                var randomNumber = Math.floor(Math.random() * 6) + 1;
                game.dice = randomNumber;
                board.checkIfMoveAvailable(game);
                io.to(game.id).emit('gameData', game);
                game.save();
            })

            socket.on('movePiece', function(piece){
                var game = games[socket.gameId];
                board.movePiece(game, piece);
                io.to(game.id).emit('gameData', game);
                game.save();
            });

            //Done By Rahul Kalra====================================

            socket.on("disconnect", () => {
                console.log("player got dissconnected " + socket.id);
            })

            socket.on('OnLogin', async(req) =>{
                let response 
                let data = {}
                const {email,password} = req;

                if(!email || !password){
                    response = {en:"OnLogin",StatusCode:422,message:'Please add all the fields.',data}
                    return socket.emit('res',response);
                }

                User.findOne({email:email})
                .then(savedUser=>{
                    if(!savedUser){
                        response = {en:"OnLogin",StatusCode:422,message:'Invalid email or password.',data}
                        return socket.emit('res',response);
                    }

                    bcrypt.compare(password, savedUser.password)
                    .then(doMatch => {
                        if(doMatch){
                            data = {userId:savedUser._id}
                            response = {en:"OnLogin",StatusCode:200,message:'Login Successfully.',data}
                            return socket.emit('res',response);
                        }
                        else{
                            response = {en:"OnLogin",StatusCode:422,message:'Invalid email or password.',data}
                            return socket.emit('res',response);
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    })
                })
                
            })

            socket.on('OnSignup', async(req) =>{
                let response;
                let data = {};

                const {name,email,password} = req;
                if(!email || !password || !name){
                    response = {en:"OnSignup",StatusCode:422,message:'Please add all the fields.',data}
                    return socket.emit('res',response);
                }

                User.findOne({email: email})
                .then((savedUser) => {
                    if(savedUser){
                        response = {en:"OnSignup",StatusCode:422,message:'user already exists.',data}
                        return socket.emit('res',response);
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
                            data = {userId:user._id,email:user.email}
                            response = {en:"OnSignup",StatusCode:200,message:'Signup successfully.',data}
                            return socket.emit('res',response);
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

            //Done By Rahul Kalra====================================


        })
    },


    getIo: function() {
        return io
    }
}