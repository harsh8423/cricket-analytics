// Import required modules
const express = require("express");
const mongooseConnection = require("./models/MoongooseConnection");
const app = express();
const cors = require("cors");


// Set up CORS middleware
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  // Add more origins as needed
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);



// Parse JSON requests
app.use(express.json());

// Define API routes
app.use("/api", require("./routes/match"));


// Define a test route
app.get("/", async (req, res) => {
  res.send("harsh");
});

// Start the server on port 5000
app.listen(8000, () => {
  console.log("Listening on port 8000");
});
