const express = require("express");
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require("cors");
const path = require('path');
const port = process.env.PORT || 5000;
const socketPort = process.env.SOCKET_PORT || 5001;
const axios = require("axios").default;
const { createServer } = require("http");
const httpServer = createServer();
const { Server } = require("socket.io");
const app = express();
const avatars = require('../server/guestImages');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const mongoose = require("mongoose");
const mongoDB = 'mongodb://127.0.0.1:27017/drawium';
const Schemas = require('./schemas/schemas');
const { Upload } = require("@aws-sdk/lib-storage")
const { S3, HeadObjectCommand } = require("@aws-sdk/client-s3")

const s3 = new S3({
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
  },
  region: 'us-west-2'
})

function make_config(authorization_token) {
  data = {
    headers: {
      "authorization": `Bearer ${authorization_token}`
    }
  };
  return data;
};



const corsOptions = {
  origin: /localhost\:\d{4,5}$/i,
  credentials: true,
  allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization',
  methods: 'GET,PUT,POST,DELETE',
  maxAge: 43200
};




const io = new Server(httpServer, {
  cors: corsOptions,
  path: '/socket'
});



app.use(bodyParser.json());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client/build')));



app.put('/api/updatePlayerScores/', async function (req, res, next) {

 
 console.log(req.body)
  const bulk = req.body.map(obj => {
    return {
      updateOne: {
        filter: {
          _id: obj.userid
        },
        update: {
        $inc: 
          {
            gamesplayed: obj.gamesplayed,
            gameswon: obj.gameswon,
            totalscore: obj.totalscore
          }
      }
    }
    }
  })
  await Schemas.Users.bulkWrite(bulk);
 

});


app.post('/api/game', async function (req, res, next) {

  let game = new Schemas.Games({ players: req.body.players, name: req.body.name, started: req.body.started });
  game._id = req.body._id;
  await game.save();
  res.send(game);
});

app.put('/api/updateGameStatus/:id', async function (req, res, next) {
  let game = await Schemas.Games.updateOne({ _id: req.params.id }, { started: req.body.started });
  res.send(game);
});

app.put('/api/updatePlayers/:id', async function (req, res, next) {
  let game = await Schemas.Games.updateOne({ _id: req.params.id }, { $push: { players: req.body.players } });
  res.send(game);
});

app.get('/api/games', async function (req, res, next) {
  let allGames = await Schemas.Games.find()
  res.send(allGames);
});

app.get('/api/game/:id', async function (req, res, next) {
  let game = await Schemas.Games.findById(req.params.id);
  res.send(game);
});

app.get('/api/players', async function (req, res, next) {
  let allUsers = await Schemas.Users.find()
  res.send(allUsers);
});

app.put('/api/drawing', async function (req, res, next) {
  if (req.body._id === 0) { return }
  if (req.body.gameID !== null) {
    try {
      const command = new HeadObjectCommand(
        {
          Bucket: 'drawium',
          Key: req.body.url
        }
      )
      const response = await s3.send(command)

      if (response.status = 200) { return; }
    } catch (err) { }

    await Schemas.Users.updateOne({ _id: req.body._id }, { $addToSet: { drawings: { word: req.body.word, url: req.body.url } } });
    let blob = new Buffer.from(req.body.blobFile.replace('data:image/jpeg;base64,', ""), 'base64')
    uploadToS3(req.body.gameID, req.body._id, blob, req.body.word)
  }
});

app.get('/api/login', async function (req, res) {
  let params = req.query.code
  if (params.length === 30) {

    if (params !== null) {
      const options = new URLSearchParams()
      options.append('client_id', process.env.DISCORD_OAUTH2_ID)
      options.append('client_secret', process.env.DISCORD_OAUTH2_SECRET)
      options.append('code', params)
      options.append('grant_type', 'authorization_code')
      options.append('redirect_uri', process.env.REDIRECT_URL)
      options.append('scope', 'identify')


      fetch(process.env.DISCORD_API_CALL, { method: "POST", body: options }).then(response => response.json()).then(data => {


        axios.get(process.env.DISCORD_TOKEN_CALL, make_config(data.access_token)).then(response => {
          let userInfo = response.data;
          const discordUser = {
            '_id': userInfo.id,
            'avatar': 'https://cdn.discordapp.com/avatars/' + userInfo.id + '/' + userInfo.avatar + '.png',
            'username': userInfo.username
          };

          const saveUser = async (discordUser) => {
            let user = await Schemas.Users.findById(discordUser._id).exec();
            if (!user) {
              let newUser = new Schemas.Users({
                avatar: discordUser.avatar,
                username: discordUser.username,
                gamesplayed: 0,
                gameswon: 0,
                totalscore: 0,
                drawings: []
              });
              newUser._id = discordUser._id;
              newUser.save()
            }
            if (user) {
              const updateDiscordUser = async (id) => {
                await Schemas.Users.findByIdAndUpdate(id, { avatar: discordUser.avatar, username: discordUser.username })
              }

              updateDiscordUser(discordUser._id);

            }
          }

          saveUser(discordUser);

          let currentUser = {
            '_id': discordUser._id,
            'username': discordUser.username,
            'avatar': discordUser.avatar
          }
          res.send(currentUser);
        })
      })
    }

  } else {
    let num = '';
    let avatarpic = '';
    while (num.length < 4) {
      num += Math.floor(Math.random() * 5);
    }
    const avatarBase = Math.floor(Math.random() * 9);
    const isShiny = Math.floor(Math.random() * 300 + 1);
    if (isShiny % 30 === 0) {
      avatarpic = avatars[avatarBase];
    } else {
      avatarpic = avatars[avatarBase * 2];
    }
    let guest = {
      '_id': 0,
      'username': 'Guest#' + num,
      'avatar': avatarpic
    };
    res.send(guest)
  }

});



app.get('/*', function (req, res, next) {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});




let drawRooms = [];
let allRooms = [];

io.on('connection', (socket) => {
  let currentRoom = {
    room: "",
    players: []
  };


  socket.on('create-room', (room, username, userid, avatar, score) => {
    if (!drawRooms.includes(room)) {
      drawRooms.push(room);
      currentRoom.room = room;
      currentRoom.players.push({ socket: socket.id, username: username, userid: userid, avatar: avatar, score: score });
      allRooms.push(currentRoom);
    } else {
      allRooms.forEach(el => {
        if (Object.values(el).includes(room)) {
          currentRoom = el;
          currentRoom.players.push({ socket: socket.id, username: username, userid: userid, avatar: avatar, score: score });
          el = currentRoom;

        }
      });
    }
    socket.join(room);

    io.in(room).emit('updatePlayerTable', currentRoom.players);
  });

  socket.on('word', (data, room) => io.in(room).emit('word', data));

  socket.once('startTimer', (room) => io.in(room).emit('startTimer'));

  socket.once('gameStart', (room) => io.in(room).emit('gameStart'));

  socket.on('toolP', () => socket.emit('toolP'));

  socket.on('color', (room) => io.in(room).emit('color'));

  socket.on('endGame', (room) => io.in(room).emit('endGame'));

  socket.on('clear', (room, newTurn) => io.in(room).emit('clear', newTurn));

  socket.on('drawing', (drawingData, room) => socket.to(room).emit('drawing', drawingData));

  socket.on('drawingMobile', (drawingDataMobile, room) => socket.to(room).emit('drawingMobile', drawingDataMobile));

  socket.on('updateGameOwner', (room, players) => io.in(room).emit('updateGameOwner', players));

  socket.on('scores', (data, room) => io.in(room).emit('scores', data));

  socket.on('saveScores', (room) => io.in(room).emit('saveScores'));

  socket.on('guessCount', (room) => io.in(room).emit('guessCount'));

  socket.on('saveCanvas', (room) => io.in(room).emit('saveCanvas'));

  socket.on('words', async (room) => {
    let allWords = await Schemas.Words.find()
    let words = allWords[0].default;
    let yourWords = [];
    for (let i = 0; i < 3; i++) {
      let index = Math.floor(Math.random() * words.length);
      yourWords.push(words[index]);
    }
    io.in(room).emit('words', yourWords);
  });


  socket.on('disconnect', async () => {
    let socketID = socket.id;

    try {
      let room = allRooms.filter(room => { return room.players.some(item => item.socket === socketID); });
      if (room[0]) {
        let player = room[0].players.filter((val) => val.socket === socketID);
        let index = room[0].players.indexOf(player[0]);
        room[0].players.splice(index, 1);
        if (room[0].players.length === 0) {
          await Schemas.Games.findByIdAndDelete(room[0].room);
        }
        else {
          let playerToRemove = {
            username: player[0].username,
            userid: player[0].userid,
            avatar: player[0].avatar,
            score: player[0].score
          }
          await Schemas.Games.updateOne({ _id: room[0].room }, { $pull: { players: playerToRemove } });
        }

        io.in(room[0].room).emit('updatePlayerTable', room[0].players);
      }
    } catch { }
  });


});



const uploadToS3 = async (id, user, blobFile, word) => {
  const params = {
    Bucket: 'drawium',
    Key: `${user}/${id}/${word}.jpg`,
    Body: blobFile,
    ContentEncoding: 'base64',
    ContentType: 'image/jpeg'
  };


  await new Upload({
    client: s3,
    params
  }).done()
}

app.listen(port, async () => {
  console.log(`Server is running on port: http://localhost:${port}`);
  await mongoose.connect(mongoDB);
});

io.listen(socketPort);
