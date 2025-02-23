const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  picture: {
    type: String,
    required: true
  },
  google_id: {
    type: String,
    required: true,
    unique: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true, // This will add createdAt and updatedAt fields
  collection: 'users' // Explicitly set the collection name
});

// Remove the explicit index creation since unique: true already creates indexes
// userSchema.index({ email: 1 });
// userSchema.index({ google_id: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User; 