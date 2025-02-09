import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Admin() {
  const navigate = useNavigate()

  const handleAddMatch = () => {
    navigate('/admin/add-match')
  }

  const handleAddPrediction = () => {
    navigate('/admin/add-prediction')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage matches and predictions</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Add Match Card */}
            <div className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition duration-300">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Match Management</h2>
              <p className="text-gray-600 mb-4">Add and manage upcoming matches</p>
              <button 
                onClick={handleAddMatch}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 
                          transition duration-300 flex items-center"
              >
                <span className="mr-2">Add Match</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Add Prediction Card */}
            <div className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition duration-300">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Prediction Management</h2>
              <p className="text-gray-600 mb-4">Add and manage match predictions</p>
              <button 
                onClick={handleAddPrediction}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 
                          transition duration-300 flex items-center"
              >
                <span className="mr-2">Add Prediction</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
