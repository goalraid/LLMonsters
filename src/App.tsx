import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'
import ChatPage from './pages/ChatPage'
import BattlePage from './pages/BattlePage'
import LoadingSpinner from './components/LoadingSpinner'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  const { isLoading, isAuthenticated, error } = useAuth0()

  if (isLoading) {
    return <LoadingSpinner />
  }

  // If there's an Auth0 error, show login page with error handling
  if (error) {
    console.error('Auth0 Error:', error)
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {isAuthenticated && <Navbar />}
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <LoginPage /> : <Navigate to="/chat" />} 
          />
          <Route 
            path="/onboarding" 
            element={isAuthenticated ? <OnboardingPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/chat" 
            element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/battle" 
            element={isAuthenticated ? <BattlePage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/chat" : "/login"} />} 
          />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App