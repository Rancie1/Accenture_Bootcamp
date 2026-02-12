import { useNavigate } from 'react-router-dom'
import MascotPreview from '../components/MascotPreview'

function SplashScreen() {
  const navigate = useNavigate()

  const handleStart = () => {
    navigate('/register')
  }

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-white dark:bg-gray-900 p-6">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <MascotPreview equippedItems={{}} mascotItems={[]} size="large" />
          </div>
          <h1 className="text-4xl font-bold text-mascot mb-2">Koko</h1>
          <p className="text-gray-600 dark:text-gray-400">Your Savings Companion</p>
        </div>
      </div>
      <button 
        onClick={handleStart}
        className="w-full py-4 bg-primary text-white rounded-xl font-semibold text-lg shadow-lg active:scale-95 transition-transform"
      >
        Start
      </button>
    </div>
  )
}

export default SplashScreen
