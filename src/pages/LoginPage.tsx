import React, { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Zap, Shield, Users, AlertCircle } from 'lucide-react'

const LoginPage: React.FC = () => {
  const { loginWithRedirect, error } = useAuth0()
  const [showDemo, setShowDemo] = useState(false)

  const handleLogin = () => {
    // Check if Auth0 is properly configured
    const domain = import.meta.env.VITE_AUTH0_DOMAIN
    const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID
    
    if (!domain || domain === 'demo.auth0.com' || !clientId || clientId === 'demo-client-id') {
      setShowDemo(true)
      return
    }
    
    loginWithRedirect()
  }

  if (showDemo) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-2">
              Demo Mode
            </h2>
            <p className="text-gray-300 text-lg">
              Auth0 not configured - Running in demo mode
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
            <div className="space-y-4 mb-6">
              <div className="bg-orange-900/30 border border-orange-500/50 rounded-lg p-4">
                <h3 className="text-orange-400 font-semibold mb-2">Setup Required</h3>
                <p className="text-gray-300 text-sm">
                  To use authentication, you need to:
                </p>
                <ol className="text-gray-300 text-sm mt-2 space-y-1 list-decimal list-inside">
                  <li>Create an Auth0 account</li>
                  <li>Set up an application</li>
                  <li>Update the .env file with your credentials</li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => window.location.href = '/chat'}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Continue in Demo Mode
            </button>
            
            <button
              onClick={() => setShowDemo(false)}
              className="w-full mt-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-all"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6">
            <Zap className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">
            Welcome to LLMonster Arena
          </h2>
          <p className="text-gray-300 text-lg">
            Create your AI companion and battle with others
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
          <div className="space-y-6 mb-8">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-purple-400" />
              <span className="text-gray-300">Secure authentication with Auth0</span>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-purple-400" />
              <span className="text-gray-300">Personalized AI companions</span>
            </div>
            <div className="flex items-center space-x-3">
              <Zap className="h-6 w-6 text-purple-400" />
              <span className="text-gray-300">Epic turn-based battles</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">{error.message}</p>
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Sign In / Sign Up
          </button>
        </div>

        <p className="text-center text-gray-400 text-sm">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}

export default LoginPage