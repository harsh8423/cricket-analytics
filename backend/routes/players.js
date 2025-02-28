const express = require('express');
const router = express.Router();
const { Player } = require('../models/match');

// Get player by ID
router.get('/:playerId', async (req, res) => {
  try {
    const player = await Player.findById(req.params.playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    res.json(player);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get multiple players by IDs
router.post('/batch', async (req, res) => {
  try {
    const { playerIds } = req.body;
    const players = await Player.find({ _id: { $in: playerIds } });
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 