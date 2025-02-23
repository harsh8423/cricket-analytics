import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaLock, FaUserShield, FaChartLine, FaUsers } from 'react-icons/fa'

export default function Admin() {
  const navigate = useNavigate()

  const handleAddMatch = () => {
    navigate('/admin/add-match')
  }

  const handleAddPrediction = () => {
    navigate('/admin/add-prediction')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaUserShield className="text-indigo-600 text-3xl mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Manage your application settings and content</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-lg">
              <FaLock className="text-indigo-600" />
              <span className="text-indigo-600 font-medium">Admin Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add Match Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Match Management</h2>
                <FaChartLine className="text-indigo-600 text-2xl" />
              </div>
              <p className="text-gray-600 mb-6">Add and manage upcoming matches and their details</p>
              <button 
                onClick={handleAddMatch}
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 
                          transition duration-300 flex items-center justify-center gap-2"
              >
                Add New Match
              </button>
            </div>
          </div>

          {/* Add Prediction Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Prediction Management</h2>
                <FaUsers className="text-indigo-600 text-2xl" />
              </div>
              <p className="text-gray-600 mb-6">Manage match predictions and analysis</p>
              <button 
                onClick={handleAddPrediction}
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 
                          transition duration-300 flex items-center justify-center gap-2"
              >
                Add New Prediction
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
