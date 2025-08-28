//Setup
const express = require('express');
require('dotenv').config();
const {Server} = require('socket.io');
const {Chess} = require('chess.js');
const http = require('http');
const path = require('path');
const axios = require('axios');
const cors = require('cors');

//initailization
const app = express();
const server = http.createServer(app);
const io = new Server(server,{
      cors: {
    origin: "http://localhost:5173", // your React app
    methods: ["GET", "POST"],
      }
});
const chess = new Chess();

let player = {};
let currentPlayer = 'W';

//middlewares
app.use(express.static(path.join(__dirname,"public")));
app.use(cors());

//Routes
app.get('/chess',(req,res)=>{
    res.send("hello")
});

io.on("connection",(uniquesocket)=>{
   
    if(!player.white){
        console.log("white assigned");
        
        player.white = uniquesocket.id;
        uniquesocket.emit("playerRole","W");
    }
    else if(!player.black){
        console.log("black assigned");
        
        player.white = uniquesocket.id;
        uniquesocket.emit("playerRole","B");
    }
    else{
        console.log("spectatorRole assigned");
        uniquesocket.emit("spectatorRole","S")
    }

    uniquesocket.on("disconnect",()=>{
        if(uniquesocket.id === player.white){
            console.log("white disconnected");
            delete player.white;
        }
        else if(uniquesocket.id=== player.black){
             console.log("black disconnected");
            delete player.black;
        }
    })

    uniquesocket.on("move",(move)=>{
        try{

            if(chess.turn()==='W' && uniquesocket.id !==player.white) return
            if(chess.turn()==='B' && uniquesocket.id !==player.black) return
         
            const result = chess.move(move);
            if(result){
                currentPlayer = chess.turn();
                io.emit("move",move);
                io.emit("boardState",chess.fen())
            }else{
              uniquesocket.emit("Invalid move",move)              
            }
        }catch(err){
                console.log(err.message)
        }
        })
})

//Port handling
PORT= process.env.PORT || 4000
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port: ${PORT}`);
});