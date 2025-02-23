const express = require('express');
const router = express.Router();
const Discussion = require('../models/Discussion');
const { verifyToken } = require('../middleware/auth');

// Create a new discussion
router.post('/', verifyToken, async (req, res) => {
  try {
    // The user ID is in the 'sub' field of the token
    const authorId = req.user.sub;
    
    if (!authorId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }

    const discussion = new Discussion({
      ...req.body,
      author: authorId,  // Set the author using the sub field from token
      uploadTime: new Date()
    });

    await discussion.save();
    
    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate('author', 'name avatar')
      .populate('match_id', 'team1 team2');

    res.status(201).json(populatedDiscussion);
  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.errors // Include validation errors if any
    });
  }
});

// Get all discussions (no auth required)
router.get('/', async (req, res) => {
  try {
    const { tag } = req.query;
    let query = {};
    
    // If tag is a reference type, filter by it
    if (['prediction', 'stats', 'question', 'ai_team'].includes(tag)) {
      query = { 'reference.type': tag };
    }

    const discussions = await Discussion.find(query)
      .populate('author', 'name picture')
      .populate('likes')
      .populate('replies.author', 'name picture')
      .sort({ createdAt: -1 });

    res.json(discussions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single discussion with replies
router.get('/:id', async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('author', 'name picture')
      .populate('replies.author', 'name picture')
      .populate('likes', 'name picture')
      .populate('replies.likes', 'name picture');
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    res.json(discussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like/unlike discussion
router.post('/:id/like', verifyToken, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const userIndex = discussion.likes.indexOf(req.user.sub);
    
    if (userIndex === -1) {
      discussion.likes.push(req.user.sub);
    } else {
      discussion.likes.splice(userIndex, 1);
    }
    
    await discussion.save();
    res.json({ likes: discussion.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add reply
router.post('/:id/replies', verifyToken, async (req, res) => {
  try {
    const { content, parentReplyId } = req.body;
    
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const newReply = {
      content,
      author: req.user.sub,
      parentReply: parentReplyId || null,
      likes: []
    };

    discussion.replies.push(newReply);
    await discussion.save();

    const populatedDiscussion = await Discussion.findById(req.params.id)
      .populate('replies.author', 'name picture')
      .populate('replies.likes', 'name picture');

    const addedReply = populatedDiscussion.replies[populatedDiscussion.replies.length - 1];
    
    res.status(201).json(addedReply);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like/unlike reply
router.post('/:id/replies/:replyId/like', verifyToken, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const reply = discussion.replies.id(req.params.replyId);
    
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    const userIndex = reply.likes.indexOf(req.user.sub);
    
    if (userIndex === -1) {
      reply.likes.push(req.user.sub);
    } else {
      reply.likes.splice(userIndex, 1);
    }
    
    await discussion.save();
    res.json({ likes: reply.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add this route to your discussion.js routes file
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.json([]);
    }

    // Create text index for search
    await Discussion.collection.createIndex({ 
      title: 'text', 
      content: 'text',
      'reference.content': 'text'
    });

    const discussions = await Discussion.find(
      { 
        $text: { 
          $search: query,
          $caseSensitive: false,
          $diacriticSensitive: false
        }
      },
      { 
        score: { $meta: 'textScore' } 
      }
    )
    .sort({ score: { $meta: 'textScore' } })
    .populate('author', 'name picture')
    .limit(10);

    res.json(discussions);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 