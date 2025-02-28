import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function MatchEditor() {
  const [matchId, setMatchId] = useState('');
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [predictions, setPredictions] = useState({ team1: 50, team2: 50 });
  const [weather, setWeather] = useState({
    temperature: '',
    chanceOfRain: '',
    windSpeed: '',
    humidity: '',
    dewFactor: 'No'
  });
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);

  const fetchPlayers = async (playerIds) => {
    try {
      // Use batch endpoint instead of multiple requests
      const response = await axios.post('http://localhost:8000/api/players/batch', {
        playerIds
      });
      return response.data.map(player => ({
        ...player,
        selected: false,
        salePercentage: 0
      }));
    } catch (error) {
      console.error('Error fetching players:', error);
      return [];
    }
  };

  const fetchMatch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`http://localhost:8000/api/matches/${matchId}`);
      setMatch(response.data);
      
      // Initialize form states with existing data
      setPredictions({
        team1: response.data.team1.winPrediction || 50,
        team2: response.data.team2.winPrediction || 50
      });
      
      setWeather(response.data.weather || {
        temperature: '',
        chanceOfRain: '',
        windSpeed: '',
        humidity: '',
        dewFactor: 'No'
      });

      // Fetch players for both teams using batch endpoint
      const team1PlayersData = await fetchPlayers(response.data.team1.players);
      const team2PlayersData = await fetchPlayers(response.data.team2.players);

      setTeam1Players(team1PlayersData);
      setTeam2Players(team2PlayersData);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      await Promise.all([
        // Update win predictions
        axios.put(`http://localhost:8000/api/admin/match/${matchId}/predictions`, {
          team1Prediction: predictions.team1,
          team2Prediction: predictions.team2
        }),

        // Update weather data
        axios.put(`http://localhost:8000/api/admin/match/${matchId}/weather`, weather),

        // Update playing XI and sale percentages
        axios.put(`http://localhost:8000/api/admin/match/${matchId}/playing11`, {
          team1Players: team1Players
            .filter(p => p.selected)
            .map(p => ({
              playerId: p._id,
              salePercentage: parseInt(p.salePercentage) || 0
            })),
          team2Players: team2Players
            .filter(p => p.selected)
            .map(p => ({
              playerId: p._id,
              salePercentage: parseInt(p.salePercentage) || 0
            }))
        })
      ]);

      alert('Match data updated successfully!');
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const TeamPlayersList = ({ players, setPlayers, teamName }) => (
    <div className="mb-6">
      <h3 className="font-semibold text-lg mb-3">{teamName}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {players.map(player => (
          <div key={player._id} 
            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={player.selected}
              onChange={() => {
                setPlayers(players.map(p =>
                  p._id === player._id ? { ...p, selected: !p.selected } : p
                ));
              }}
              className="w-4 h-4 text-blue-600"
            />
            <span className="flex-1">{player.name}</span>
            {player.selected && (
              <input
                type="number"
                value={player.salePercentage}
                onChange={(e) => {
                  setPlayers(players.map(p =>
                    p._id === player._id ? { ...p, salePercentage: e.target.value } : p
                  ));
                }}
                className="w-20 p-1 border rounded"
                placeholder="Sale %"
                min="0"
                max="100"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Match Editor</h1>
      
      {/* Match ID Input */}
      <div className="mb-8">
        <div className="flex space-x-4">
          <input
            type="text"
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            placeholder="Enter Match ID"
            className="flex-1 border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={fetchMatch}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 
              disabled:bg-blue-300 transition-colors"
          >
            {loading ? 'Loading...' : 'Load Match'}
          </button>
        </div>
        {error && (
          <div className="mt-2 text-red-500 text-sm">{error}</div>
        )}
      </div>

      {match && (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Win Predictions */}
          <section className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-xl font-semibold mb-6">Win Predictions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { team: match.team1, key: 'team1' },
                { team: match.team2, key: 'team2' }
              ].map(({ team, key }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {team.team_name}
                  </label>
                  <input
                    type="number"
                    value={predictions[key]}
                    onChange={(e) => setPredictions({
                      ...predictions,
                      [key]: e.target.value
                    })}
                    className="w-full border p-2 rounded-lg"
                    min="0"
                    max="100"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Weather Data */}
          <section className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-xl font-semibold mb-6">Weather Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: 'Temperature', key: 'temperature', placeholder: '28°C' },
                { label: 'Chance of Rain', key: 'chanceOfRain', placeholder: '10%' },
                { label: 'Wind Speed', key: 'windSpeed', placeholder: '12 km/h' },
                { label: 'Humidity', key: 'humidity', placeholder: '65%' },
                { 
                  label: 'Dew Factor',
                  key: 'dewFactor',
                  type: 'select',
                  options: ['Yes', 'No', '50-50 Chances']
                }
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={weather[field.key]}
                      onChange={(e) => setWeather({
                        ...weather,
                        [field.key]: e.target.value
                      })}
                      className="w-full border p-2 rounded-lg"
                    >
                      {field.options.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={weather[field.key]}
                      onChange={(e) => setWeather({
                        ...weather,
                        [field.key]: e.target.value
                      })}
                      placeholder={field.placeholder}
                      className="w-full border p-2 rounded-lg"
                    />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Playing XI Selection */}
          <section className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-xl font-semibold mb-6">Probable Playing XI</h2>
            <TeamPlayersList 
              players={team1Players}
              setPlayers={setTeam1Players}
              teamName={match.team1.team_name}
            />
            <TeamPlayersList 
              players={team2Players}
              setPlayers={setTeam2Players}
              teamName={match.team2.team_name}
            />
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 
              disabled:bg-green-300 transition-colors text-lg font-medium"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}
    </div>
  );
} 