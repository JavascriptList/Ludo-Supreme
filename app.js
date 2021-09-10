const express = require('express');
const app = express();
const http = require("http").createServer(app);
const port = process.env.PORT || 8080 //
const mongoose = require('mongoose');

require('./io').init(http);

require('dotenv').config();

app.use(express.json());
app.use(require('./routes/auth'));
const path = require("path");

// Dini7cG3zZmoMrts
mongoose.connect('DB_URL=mongodb+srv://rootUser:Dini7cG3zZmoMrts@cluster0.znpi6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
  useNewUrlParser: true, useUnifiedTopology: true,
})
mongoose.connection.on('connected', () => {
    console.log("Database Connected!");
})



app.get("/servertesting", (req, res) => {
  res.sendFile(path.join(__dirname + '/test.html'));
});


http.listen(port, ()=>{
    console.log("Server listening on port =>", port);
})