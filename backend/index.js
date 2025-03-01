// Import required modules
const express = require("express");
const mongooseConnection = require("./models/MoongooseConnection");
const app = express();
const cors = require("cors");
const jwt = require('jsonwebtoken');
require('./models/User');
require('./models/Discussion');
const aiTeamRoutes = require('./routes/aiTeam');


// JWT secret key
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-jwt-secret';

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }


  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Set up CORS middleware
const allowedOrigins = [
  "http://localhost:3000",
  "https://cricgenius.vercel.app",
  // Add more origins as needed
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);



// Parse JSON requests
app.use(express.json());

// Protected routes
app.use("/api", require("./routes/match"));

// Auth verification endpoint
app.get("/api/verify-token", verifyToken, (req, res) => {
  res.json({ isValid: true, user: req.user });
});

// Add discussion routes
app.use('/api/discussions', require('./routes/discussion'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/predictions', require('./routes/predictions'));
app.use('/api/ai-teams', aiTeamRoutes);
app.use('/api/matches', require('./routes/matches'));
app.use('/api/players', require('./routes/players'));

// Define a test route
app.get("/", async (req, res) => {
  res.send("harsh");
});

// Start the server on port 5000
app.listen(8000, () => {
  console.log("Listening on port 8000");
});
