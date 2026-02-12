import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { DollarSign, Target, Trophy, Sparkles } from 'lucide-react'
import MascotPreview from '../components/MascotPreview'

function SplashScreen() {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation after component mounts
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  const handleStart = () => {
    navigate('/register')
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-between bg-gradient-to-b from-purple-100 to-white dark:from-purple-900/40 dark:to-gray-900 p-6 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className={`text-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {/* Mascot with bounce animation */}
          <div className={`mb-8 transition-all duration-700 ${
            isVisible ? 'scale-100' : 'scale-75'
          }`}>
            <div className="relative">
              {/* Glow effect behind mascot */}
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl scale-110 animate-pulse" />
              <div className="relative">
                <MascotPreview equippedItems={{}} mascotItems={[]} size="large" />
              </div>
            </div>
          </div>

          {/* App name with staggered animation */}
          <div className={`transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600 mb-3">
              Koko
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
              Making saving fun!
            </p>
          </div>

          {/* Feature highlights */}
          <div className={`mt-8 space-y-2 transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <DollarSign size={18} className="text-primary" />
              <span>Save money on groceries and fuel.</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Target size={18} className="text-primary" />
              <span>Track your budget.</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Trophy size={18} className="text-primary" />
              <span>Earn rewards & XP.</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Sparkles size={18} className="text-primary" />
              <span>Customise your Koko.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Start button with animation */}
      <div className={`w-full relative z-10 transition-all duration-700 delay-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <button 
          onClick={handleStart}
          className="w-full py-4 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all"
        >
          Get started
        </button>
        <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-3">
          Start saving smarter today.
        </p>
      </div>
    </div>
  )
}

export default SplashScreen
