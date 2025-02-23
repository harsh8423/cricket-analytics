import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

export default function AddPrediction() {
  const { token } = useAuth();
  const [matchId, setMatchId] = useState('1'); // Default match ID
  const [predictions, setPredictions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPrediction, setEditingPrediction] = useState(null);
  const [formData, setFormData] = useState({
    predictor: '',
    content: '',
    status: 'upcoming',
    correctness: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch predictions for a match
  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/admin/predictions/${matchId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setPredictions(data);
    } catch (error) {
      setError('Failed to fetch predictions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (matchId) {
      fetchPredictions();
    }
  }, [matchId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingPrediction 
        ? `http://localhost:8000/api/admin/predictions/${editingPrediction._id}`
        : 'http://localhost:8000/api/admin/predictions';
      
      const method = editingPrediction ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          matchId
        })
      });

      if (!response.ok) throw new Error('Failed to save prediction');

      // Reset form and refresh predictions
      setFormData({
        predictor: '',
        content: '',
        status: 'upcoming',
        correctness: 0
      });
      setShowForm(false);
      setEditingPrediction(null);
      fetchPredictions();
    } catch (error) {
      setError('Failed to save prediction');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prediction?')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/admin/predictions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete prediction');
      fetchPredictions();
    } catch (error) {
      setError('Failed to delete prediction');
      console.error(error);
    }
  };

  const handleEdit = (prediction) => {
    setEditingPrediction(prediction);
    setFormData({
      predictor: prediction.predictor,
      content: prediction.content,
      status: prediction.status,
      correctness: prediction.correctness
    });
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Expert Predictions Management</h1>
          <p className="mt-2 text-gray-600">Manage expert predictions for matches</p>
        </div>

        {/* Match ID Input */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Match ID
          </label>
          <input
            type="text"
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-full max-w-xs"
          />
        </div>

        {/* Create/Edit Form */}
        <div className="mb-6">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
            >
              <FaPlus /> Create New Prediction
            </button>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                {editingPrediction ? 'Edit Prediction' : 'Create New Prediction'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Predictor Name
                  </label>
                  <input
                    type="text"
                    value={formData.predictor}
                    onChange={(e) => setFormData({...formData, predictor: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prediction Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full h-32"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="border border-gray-300 rounded-md px-3 py-2 w-full"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="live">Live</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Correctness (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.correctness}
                      onChange={(e) => setFormData({...formData, correctness: Number(e.target.value)})}
                      className="border border-gray-300 rounded-md px-3 py-2 w-full"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    {editingPrediction ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingPrediction(null);
                      setFormData({
                        predictor: '',
                        content: '',
                        status: 'upcoming',
                        correctness: 0
                      });
                    }}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Predictions List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-4 text-center">Loading...</div>
            ) : predictions.length > 0 ? (
              predictions.map((prediction) => (
                <div key={prediction._id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {prediction.predictor}
                      </h3>
                      <p className="mt-1 text-gray-600">{prediction.content}</p>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${prediction.status === 'live' ? 'bg-green-100 text-green-800' :
                            prediction.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'}`}>
                          {prediction.status.toUpperCase()}
                        </span>
                        <span>Correctness: {prediction.correctness}%</span>
                        <span>Upvotes: {prediction.upvotes}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(prediction)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <FaEdit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(prediction._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No predictions found for this match
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
