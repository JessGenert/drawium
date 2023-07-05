const mongoose = require('mongoose');
const { Schema } = mongoose;


const gameSchema = new Schema({
    _id: String,
    name: String,
    players: Array,
    started: Boolean,
});



const userSchema = new Schema({
    _id: String,
    username: String,
    avatar: String,
    gamesplayed: Number,
    gameswon: Number,
    totalscore: Number,
    drawings: Array,
});

const wordSchema = new Schema({
    _id: Number,
    default: Array
});

const Words = mongoose.model('Words', wordSchema);
const Users = mongoose.model('Users', userSchema);
const Games = mongoose.model('Games', gameSchema);

const Schemas = {
 Words: Words,
 Users: Users,
 Games: Games
}

module.exports = Schemas;