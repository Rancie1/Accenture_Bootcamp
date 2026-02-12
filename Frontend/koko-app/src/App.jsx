import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useContext, useEffect, lazy, Suspense } from 'react'
import { AppProvider, AppContext } from './context/AppContext'

// Lazy load page components for better performance
const SplashScreen = lazy(() => import('./pages/SplashScreen'))
const Registration = lazy(() => import('./pages/Registration'))
const Shop = lazy(() => import('./pages/Shop'))
const Results = lazy(() => import('./pages/Results'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Settings = lazy(() => import('./pages/Settings'))
const Mascot = lazy(() => import('./pages/Mascot'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const Saved = lazy(() => import('./pages/Saved'))
const Grimace = lazy(() => import('./pages/Grimace'))

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="text-6xl mb-4 animate-bounce">🐨</div>
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
)

function AppContent() {
  const { darkMode } = useContext(AppContext);

  // Apply dark mode class to HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/results" element={<Results />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/mascot" element={<Mascot />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/grimace" element={<Grimace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
