import React, { useState } from "react";
import teams from "./iplteams.json"; // Adjust the path if needed
import axios from "axios";

const AddMatch = () => {
  const [formData, setFormData] = useState({
    _id: "",
    team1: null, // Store as object
    team2: null, // Store as object
    venue: {
      name: "",
      city: "",
      country: "",
    },
    matchStartTimestamp: "",
    state: "Upcoming"
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTeamChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: JSON.parse(value), // Parse JSON string back into an object
    });
  };

  const handleVenueChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      venue: {
        ...formData.venue,
        [name]: value,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/api/matches", formData);
      alert("Match added successfully!");
    } catch (err) {
      console.error("Error adding match:", err);
      alert("Failed to add match.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Add Match</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded-lg">
        {/* Match ID */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Match ID</label>
          <input
            type="number"
            name="_id"
            value={formData._id}
            onChange={handleInputChange}
            className="border border-gray-300 rounded-lg w-full p-2"
            required
          />
        </div>

        {/* Team 1 */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Team 1</label>
          <select
            name="team1"
            onChange={handleTeamChange} // Use handleTeamChange
            className="border border-gray-300 rounded-lg w-full p-2"
            required
          >
            <option value="">Select Team 1</option>
            {teams.map((team) => (
              <option key={team._id} value={JSON.stringify(team)}>
                {team.team_name}
              </option>
            ))}
          </select>
        </div>

        {/* Team 2 */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Team 2</label>
          <select
            name="team2"
            onChange={handleTeamChange} // Use handleTeamChange
            className="border border-gray-300 rounded-lg w-full p-2"
            required
          >
            <option value="">Select Team 2</option>
            {teams.map((team) => (
              <option key={team._id} value={JSON.stringify(team)}>
                {team.team_name}
              </option>
            ))}
          </select>
        </div>

        {/* Venue */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Venue Name</label>
          <input
            type="text"
            name="name"
            value={formData.venue.name}
            onChange={handleVenueChange}
            className="border border-gray-300 rounded-lg w-full p-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">City</label>
          <input
            type="text"
            name="city"
            value={formData.venue.city}
            onChange={handleVenueChange}
            className="border border-gray-300 rounded-lg w-full p-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Country</label>
          <input
            type="text"
            name="country"
            value={formData.venue.country}
            onChange={handleVenueChange}
            className="border border-gray-300 rounded-lg w-full p-2"
            required
          />
        </div>

        {/* Match Start Timestamp */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Start Timestamp</label>
          <input
            type="datetime-local"
            name="matchStartTimestamp"
            value={formData.matchStartTimestamp}
            onChange={handleInputChange}
            className="border border-gray-300 rounded-lg w-full p-2"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          Add Match
        </button>
      </form>
    </div>
  );
};

export default AddMatch;
