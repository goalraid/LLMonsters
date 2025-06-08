import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Send, Bot, User, Settings } from 'lucide-react'
import { llmService, LLM_PRESETS, LLMConfig } from '../services/llmService'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const ChatPage: React.FC = () => {
  const navigate = useNavigate()
  const { llmonster, loading } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [guidance, setGuidance] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [currentProvider, setCurrentProvider] = useState<keyof typeof LLM_PRESETS>('ollama')
  const [customApiKey, setCustomApiKey] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!loading && !llmonster) {
      navigate('/onboarding')
    }
  }, [llmonster, loading, navigate])

  useEffect(() => {
    if (llmonster && messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `Hello! I'm ${llmonster.name}, your personal LLMonster companion! ${llmonster.visual_description} I'm ready to chat, battle, or help you with anything you need!`,
        timestamp: new Date()
      }])
    }
  }, [llmonster])

  const switchLLMProvider = (provider: keyof typeof LLM_PRESETS) => {
    const config = { ...LLM_PRESETS[provider] }
    
    // If OpenAI and user provided API key, use it
    if (provider === 'openai' && customApiKey) {
      config.apiKey = customApiKey
    }
    
    llmService.switchProvider(config)
    setCurrentProvider(provider)
    setShowSettings(false)
    
    // Add system message about the switch
    const switchMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `I've switched to ${provider.toUpperCase()}! ${provider === 'ollama' ? 'Make sure Ollama is running with a model like llama2.' : provider === 'openai' ? 'Using OpenAI GPT models.' : 'Using local model.'} Let's continue our conversation!`,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, switchMessage])
  }

  const sendMessage = async () => {
    if (!input.trim() || !llmonster) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      // Use the LLM service for real AI responses
      const response = await llmService.chat(
        llmonster.system_prompt,
        input,
        guidance
      )

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error getting AI response:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your message. Please check your LLM configuration.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading your LLMonster...</div>
      </div>
    )
  }

  if (!llmonster) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">No LLMonster found</div>
          <button
            onClick={() => navigate('/onboarding')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
          >
            Create Your LLMonster
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 h-screen flex flex-col">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{llmonster.name}</h2>
                <p className="text-gray-400 text-sm">Your AI Companion • {currentProvider.toUpperCase()}</p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <Settings size={18} />
              <span>LLM Settings</span>
            </button>
          </div>
        </div>

        {/* LLM Settings Panel */}
        {showSettings && (
          <div className="p-4 border-b border-gray-700 bg-gray-900/50">
            <h3 className="text-white font-semibold mb-3">Choose LLM Provider:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <button
                onClick={() => switchLLMProvider('ollama')}
                className={`p-3 rounded-lg border transition-colors ${
                  currentProvider === 'ollama'
                    ? 'border-purple-500 bg-purple-500/20 text-white'
                    : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="font-medium">Ollama (Local)</div>
                <div className="text-xs opacity-75">Free, runs locally</div>
              </button>
              
              <button
                onClick={() => switchLLMProvider('openai')}
                className={`p-3 rounded-lg border transition-colors ${
                  currentProvider === 'openai'
                    ? 'border-purple-500 bg-purple-500/20 text-white'
                    : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="font-medium">OpenAI</div>
                <div className="text-xs opacity-75">Requires API key</div>
              </button>
              
              <button
                onClick={() => switchLLMProvider('openaiLocal')}
                className={`p-3 rounded-lg border transition-colors ${
                  currentProvider === 'openaiLocal'
                    ? 'border-purple-500 bg-purple-500/20 text-white'
                    : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="font-medium">Local OpenAI</div>
                <div className="text-xs opacity-75">LM Studio, etc.</div>
              </button>
            </div>
            
            {currentProvider === 'openai' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  OpenAI API Key:
                </label>
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 text-sm"
                />
              </div>
            )}
            
            <div className="mt-3 text-xs text-gray-400">
              <strong>Ollama:</strong> Install from ollama.ai, run "ollama pull llama2"<br/>
              <strong>OpenAI:</strong> Get API key from platform.openai.com<br/>
              <strong>Local:</strong> Use LM Studio or similar on port 1234
            </div>
          </div>
        )}

        {/* Guidance Input */}
        <div className="p-4 border-b border-gray-700">
          <textarea
            value={guidance}
            onChange={(e) => setGuidance(e.target.value)}
            placeholder="Enter guidance for your LLMonster (optional)..."
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:border-purple-500 focus:outline-none"
            rows={2}
          />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-purple-600' 
                    : 'bg-gradient-to-br from-purple-500 to-pink-500'
                }`}>
                  {message.role === 'user' ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className={`chat-bubble ${message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="chat-bubble chat-bubble-assistant">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-700">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatPage