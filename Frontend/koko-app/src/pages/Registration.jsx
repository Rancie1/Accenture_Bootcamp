import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

function Registration() {
  const navigate = useNavigate()
  const { setUserPreferences } = useContext(AppContext)

  const [name, setName] = useState('')
  const [budget, setBudget] = useState('')
  const [transportPreference, setTransportPreference] = useState('')
  const [errors, setErrors] = useState({})

  const validateInputs = () => {
    const newErrors = {}

    if (!name.trim()) {
      newErrors.name = 'Name is required'
    }

    const budgetNum = parseFloat(budget)
    if (!budget || isNaN(budgetNum) || budgetNum <= 0) {
      newErrors.budget = 'Budget must be greater than 0'
    }

    if (!transportPreference) {
      newErrors.transport = 'Please select a transport preference'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateInputs()) {
      setUserPreferences({
        name: name.trim(),
        budget: parseFloat(budget),
        transportPreference
      })
      navigate('/shop')
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Welcome to Koko</h1>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter your name"
            required
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Budget <span className="text-red-500">*</span>
          </label>
          <input 
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter your budget"
            min="0"
            step="0.01"
            required
          />
          {errors.budget && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.budget}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Transport Preference <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTransportPreference('public')}
              className={`py-3 border-2 rounded-lg font-medium transition-colors ${
                transportPreference === 'public'
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              Public Transport
            </button>
            <button
              onClick={() => setTransportPreference('driving')}
              className={`py-3 border-2 rounded-lg font-medium transition-colors ${
                transportPreference === 'driving'
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              Driving
            </button>
          </div>
          {errors.transport && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.transport}</p>
          )}
        </div>
        
        <button
          onClick={handleSubmit}
          className="w-full py-4 bg-primary text-white rounded-xl font-semibold text-lg shadow-lg active:scale-95 transition-transform mt-8"
        >
          Get Started
        </button>
      </div>
    </div>
  )
}

export default Registration
