import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { ArrowLeft } from "lucide-react";

/**
 * Settings Component
 * Allows users to edit their preferences and toggle dark mode
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7
 */
const Settings = () => {
  const navigate = useNavigate();
  const { userPreferences, setUserPreferences, darkMode, setDarkMode } =
    useContext(AppContext);

  // Local state for form inputs
  const [name, setName] = useState(userPreferences.name);
  const [budget, setBudget] = useState(userPreferences.budget);
  const [address, setAddress] = useState(userPreferences.address || "");
  const [transportPreference, setTransportPreference] = useState(
    userPreferences.transportPreference
  );
  const [localDarkMode, setLocalDarkMode] = useState(darkMode);

  // Save to context (and localStorage) as user types
  useEffect(() => {
    setUserPreferences({
      ...userPreferences,
      name,
      budget: parseFloat(budget) || 0,
      address: address.trim(),
      transportPreference
    });
  }, [name, budget, transportPreference]);

  // Save dark mode changes immediately
  useEffect(() => {
    setDarkMode(localDarkMode);
  }, [localDarkMode, setDarkMode]);

  const handleSave = () => {
    // Data is already saved, just navigate back
    navigate("/dashboard");
  };

  const handleBack = () => {
    // Navigate back (data is already saved)
    navigate("/dashboard");
  };

  const toggleDarkMode = () => {
    setLocalDarkMode(!localDarkMode);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={handleBack}
          className="text-gray-600 dark:text-gray-400 mr-4"
        >
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-2xl font-bold text-primary">Settings</h1>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Budget
          </label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Home Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 30 Campbell St, Parramatta NSW 2150"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Used to find nearby stores and calculate transport costs
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Transport Preference
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTransportPreference("public")}
              className={`py-3 border-2 rounded-lg font-medium transition-colors ${
                transportPreference === "public"
                  ? "border-primary bg-primary text-white"
                  : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              }`}
            >
              Public Transport
            </button>
            <button
              onClick={() => setTransportPreference("driving")}
              className={`py-3 border-2 rounded-lg font-medium transition-colors ${
                transportPreference === "driving"
                  ? "border-primary bg-primary text-white"
                  : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              }`}
            >
              Driving
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between py-3">
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            Dark Mode
          </span>
          <button
            onClick={toggleDarkMode}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              localDarkMode ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                localDarkMode ? "right-1" : "left-1"
              }`}
            />
          </button>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-4 bg-primary text-white rounded-xl font-semibold text-lg shadow-lg active:scale-95 transition-transform mt-8"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default Settings;
