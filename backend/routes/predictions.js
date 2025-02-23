const express = require('express');
const router = express.Router();
const ExpertPrediction = require('../models/ExpertPrediction');
const { verifyToken } = require('../middleware/auth');

// Get all predictions for a match (public endpoint)
router.get('/:matchId', async (req, res) => {
  try {
    const predictions = await ExpertPrediction.find({ matchId: req.params.matchId })
      .sort({ timestamp: -1 });
    res.json(predictions);
  } catch (error) {
    console.error('Error fetching predictions:', error);
    res.status(500).json({ message: 'Failed to fetch predictions' });
  }
});

// Upvote a prediction
router.post('/:id/upvote', verifyToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    
    // Check if user has already voted
    const prediction = await ExpertPrediction.findById(req.params.id);
    
    if (!prediction) {
      return res.status(404).json({ message: 'Prediction not found' });
    }

    if (prediction.votedUsers.includes(userId)) {
      return res.status(400).json({ message: 'Already voted' });
    }

    // Add user to votedUsers and increment upvotes
    const updatedPrediction = await ExpertPrediction.findByIdAndUpdate(
      req.params.id,
      { 
        $inc: { upvotes: 1 },
        $push: { votedUsers: userId }
      },
      { new: true }
    );

    res.json(updatedPrediction);
  } catch (error) {
    console.error('Error upvoting prediction:', error);
    res.status(500).json({ message: 'Failed to upvote prediction' });
  }
});

module.exports = router; 