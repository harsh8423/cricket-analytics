const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const { verifyToken } = require('../middleware/auth');
const ExpertPrediction = require('../models/ExpertPrediction');
const {Match, Player} = require('../models/match');

// Verify admin access - use both verifyToken and adminAuth
router.get('/verify', verifyToken, adminAuth, (req, res) => {
  res.status(200).json({ 
    message: 'Admin access verified',
    isAdmin: true
  });
});

// Other admin routes
router.post('/matches', verifyToken, adminAuth, async (req, res) => {
  // Add match logic
  try {
    const match = new Match(req.body);
    await match.save();
    res.status(201).send("Match added successfully!");
  } catch (err) {
      console.log(err);
    res.status(400).send(err.message);
  }
});

// Get all predictions for a match
router.get('/predictions/:matchId', verifyToken, adminAuth, async (req, res) => {
  try {
    const predictions = await ExpertPrediction.find({ matchId: req.params.matchId })
      .sort({ timestamp: -1 }); // Sort by newest first
    res.json(predictions);
  } catch (error) {
    console.error('Error fetching predictions:', error);
    res.status(500).json({ message: 'Failed to fetch predictions' });
  }
});

// Create new prediction
router.post('/predictions', verifyToken, adminAuth, async (req, res) => {
  try {
    const { matchId, predictor, content, status, correctness } = req.body;
    
    const prediction = new ExpertPrediction({
      matchId,
      predictor,
      content,
      status,
      correctness,
      upvotes: 0
    });

    await prediction.save();
    res.status(201).json(prediction);
  } catch (error) {
    console.error('Error creating prediction:', error);
    res.status(500).json({ message: 'Failed to create prediction' });
  }
});

// Update prediction
router.put('/predictions/:id', verifyToken, adminAuth, async (req, res) => {
  try {
    const { predictor, content, status, correctness } = req.body;
    
    const prediction = await ExpertPrediction.findByIdAndUpdate(
      req.params.id,
      {
        predictor,
        content,
        status,
        correctness,
        timestamp: Date.now() // Update timestamp on edit
      },
      { new: true } // Return updated document
    );

    if (!prediction) {
      return res.status(404).json({ message: 'Prediction not found' });
    }

    res.json(prediction);
  } catch (error) {
    console.error('Error updating prediction:', error);
    res.status(500).json({ message: 'Failed to update prediction' });
  }
});

// Delete prediction
router.delete('/predictions/:id', verifyToken, adminAuth, async (req, res) => {
  try {
    const prediction = await ExpertPrediction.findByIdAndDelete(req.params.id);
    
    if (!prediction) {
      return res.status(404).json({ message: 'Prediction not found' });
    }

    res.json({ message: 'Prediction deleted successfully' });
  } catch (error) {
    console.error('Error deleting prediction:', error);
    res.status(500).json({ message: 'Failed to delete prediction' });
  }
});

// Update win predictions
router.put('/match/:matchId/predictions', async (req, res) => {
  try {
    const { team1Prediction, team2Prediction } = req.body;
    const match = await Match.findById(req.params.matchId);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    match.team1.winPrediction = team1Prediction;
    match.team2.winPrediction = team2Prediction;
    await match.save();

    res.json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update probable playing XI and sale percentages
router.put('/match/:matchId/playing11', async (req, res) => {
  try {
    const { team1Players, team2Players } = req.body;
    const match = await Match.findById(req.params.matchId);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Update probable playing XI with player names
    const team1Playing11 = await Promise.all(team1Players.map(async (player) => {
      const playerDoc = await Player.findById(player.playerId);
      return {
        playerId: player.playerId,
        name: playerDoc.name,
        salePercentage: player.salePercentage
      };
    }));

    const team2Playing11 = await Promise.all(team2Players.map(async (player) => {
      const playerDoc = await Player.findById(player.playerId);
      return {
        playerId: player.playerId,
        name: playerDoc.name,
        salePercentage: player.salePercentage
      };
    }));

    match.probablePlaying11 = {
      team1: team1Playing11,
      team2: team2Playing11
    };
    
    await match.save();
    res.json(match);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Update weather data
router.put('/match/:matchId/weather', async (req, res) => {
  try {
    const { temperature, chanceOfRain, windSpeed, humidity, dewFactor } = req.body;
    const match = await Match.findById(req.params.matchId);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    match.weather = {
      temperature,
      chanceOfRain,
      windSpeed,
      humidity,
      dewFactor
    };
    
    await match.save();
    res.json(match);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 