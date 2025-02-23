const express = require('express');
const router = express.Router();
const AITeam = require('../models/AITeam');
const { verifyToken } = require('../middleware/auth');

// Save team
router.post('/', verifyToken, async (req, res) => {
  try {
    const { team, strategies, match_id } = req.body;
    
    // Validate required fields
    if (!team || !Array.isArray(team) || team.length === 0) {
      return res.status(400).json({ message: 'Team data is required and must be an array' });
    }

    // if (!match_id) {
    //   return res.status(400).json({ message: 'Match ID is required' });
    // }

    const aiTeam = new AITeam({
      user: req.user.sub,
      match_id,
      team,
      strategies: strategies || {}
    });

    await aiTeam.save();
    res.status(201).json(aiTeam);
  } catch (error) {
    console.error('Save team error:', error);
    res.status(400).json({ 
      message: 'Failed to save team',
      error: error.message 
    });
  }
});

// Get user's teams
router.get('/user-teams', verifyToken, async (req, res) => {
  try {
    const teams = await AITeam.find({ user: req.user.sub })
      .populate('match_id', 'team1 team2 date')
      .sort('-created_at');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete team
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const team = await AITeam.findOneAndDelete({
      _id: req.params.id,
      user: req.user.sub
    });
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Get team by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const team = await AITeam.findById(req.params.id)
      .populate('team.player')
      .populate('author', 'name picture');
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update team
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { team, strategies } = req.body;

    // Validate required fields
    if (!team || !Array.isArray(team) || team.length === 0) {
      return res.status(400).json({ message: 'Team data is required and must be an array' });
    }

    // Find team and verify ownership
    const existingTeam = await AITeam.findOne({
      _id: req.params.id,
      user: req.user.sub
    });

    if (!existingTeam) {
      return res.status(404).json({ message: 'Team not found or unauthorized' });
    }

    // Update the team
    const updatedTeam = await AITeam.findByIdAndUpdate(
      req.params.id,
      { 
        $set: {
          team: team,
          strategies: strategies || existingTeam.strategies
        }
      },
      { new: true }
    );

    res.json(updatedTeam);
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ message: error.message });
  }
}); 

module.exports = router; 