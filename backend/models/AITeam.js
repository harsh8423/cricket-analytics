const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  is_captain: {
    type: Boolean,
    default: false
  },
  is_vice_captain: {
    type: Boolean,
    default: false
  },
  reason: String
});

const strategySchema = new mongoose.Schema({
  pace_spin_ratio: String,
  batting_order: String,
  venue_adjustments: [String]
});

const aiTeamSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  match_id: {
    type: mongoose.Schema.Types.Number,
    ref: 'Match',
    required: true
  },
  team: [playerSchema],
  strategies: strategySchema,
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AITeam', aiTeamSchema); 