// Import the processed data
const processedData = require('./processedData.js'); // Adjust the path as needed

// Extract match_summary
const matchSummary = processedData.match_summary;

// Print venue_analysis and venue_stats
console.log('Venue Analysis:', matchSummary.venue_analysis);
console.log('Venue Stats:', matchSummary.venue_stats);
