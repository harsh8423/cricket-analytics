const mongoose = require('mongoose');

const expertPredictionSchema = new mongoose.Schema({
  matchId: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  predictor: {
    type: String,
    required: true
  },
  correctness: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['live', 'upcoming', 'completed'],
    default: 'upcoming'
  },
  upvotes: {
    type: Number,
    default: 0
  },
  votedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ExpertPrediction', expertPredictionSchema); 