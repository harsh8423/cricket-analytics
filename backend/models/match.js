const mongoose = require("mongoose");

const MatchSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  team1: { 
    _id: { type: Number, required: true },
    short_name: String,
    team_name: String,
    players: [Number],
    winPrediction: { type: Number, default: 50 }
  },
  team2: { 
    _id: { type: Number, required: true },
    short_name: String,
    team_name: String,
    players: [Number],
    winPrediction: { type: Number, default: 50 }
  },
  probablePlaying11: {
    team1: [{
      playerId: Number,
      name: String,
      salePercentage: { type: Number, default: 0 }
    }],
    team2: [{
      playerId: Number,
      name: String,
      salePercentage: { type: Number, default: 0 }
    }]
  },
  weather: {
    temperature: String,
    chanceOfRain: String,
    windSpeed: String,
    humidity: String,
    dewFactor: String,
  },
  venue: { type: Object, required: true },
  playersOfTheMatch: { type: Object},
  result: { type: Object},
  tossResults: { type: Object},
  matchStartTimestamp: { type: Date, required: true },
  state: String,
  playingXI: { type: Object},
  scorecard: { type: Number, ref: 'Scorecard' }, // Referencing scorecard by _id
  commentary: { type: Number, ref: 'Commentary' }, 
});
const Match = mongoose.model('Match', MatchSchema);

const CommentarySchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  commentary_innings1: { type: Array, required: true },
  commentary_innings2: { type: Array, required: true },
});
const Commentary = mongoose.model('Commentary', CommentarySchema);


const playerSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  name: { type: String, required: true },
  role: { type: String},
  batting_style: { type: String},
  bowling_style: { type: String},
  matches: [{ type: Number, ref: 'Match'}],
});
const Player = mongoose.model('Player', playerSchema);

const ScorecardSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  firstInnings: { type: Array, required: true },
  secondInnings: { type: Array, required: true },
});
const Scorecard = mongoose.model('Scorecard', ScorecardSchema);

const teamSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  players: [{ type: Array, ref: 'Player'}],
  matches: [{ type: Array, ref: 'Match'}],
  team_name: { type: String},
});
const Team = mongoose.model('Team', teamSchema);

module.exports = { Match, Commentary, Player, Scorecard, Team };
