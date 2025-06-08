import OpenAI from 'openai'

// Configuration for different LLM providers
interface LLMConfig {
  provider: 'openai' | 'ollama' | 'anthropic' | 'gemini'
  apiKey?: string
  baseURL?: string
  model: string
}

// Default configuration - you can change this
const DEFAULT_CONFIG: LLMConfig = {
  provider: 'ollama',
  baseURL: '/ollama-api/v1',
  model: 'llama2',
  apiKey: 'ollama' // Required but not used for Ollama
}

class LLMService {
  private client: OpenAI
  private config: LLMConfig

  constructor(config: LLMConfig = DEFAULT_CONFIG) {
    this.config = config
    
    // Initialize OpenAI client (works for OpenAI, Ollama, and other OpenAI-compatible APIs)
    this.client = new OpenAI({
      apiKey: config.apiKey || 'dummy-key',
      baseURL: config.baseURL,
      dangerouslyAllowBrowser: true // Required for browser usage
    })
  }

  async chat(systemPrompt: string, userMessage: string, guidance?: string): Promise<string> {
    try {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: systemPrompt + (guidance ? `\n\nAdditional guidance: ${guidance}` : '')
        },
        {
          role: 'user',
          content: userMessage
        }
      ]

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      })

      return response.choices[0]?.message?.content || 'I apologize, but I could not generate a response.'
    } catch (error) {
      console.error('LLM Service Error:', error)
      
      // Fallback response with helpful error information
      if (this.config.provider === 'ollama') {
        return `I'm having trouble connecting to Ollama. Please make sure:
1. Ollama is installed and running (ollama serve)
2. You have pulled a model (ollama pull llama2)
3. The model "${this.config.model}" is available

For now, I'm responding as ${systemPrompt.split('.')[0]} but without AI capabilities.`
      }
      
      return `I'm having trouble connecting to the AI service. Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }

  async generateBattleAction(systemPrompt: string, move: string, guidance?: string): Promise<string> {
    const battlePrompt = `${systemPrompt}

You are in battle! Describe your action dramatically and briefly (1-2 sentences).
Move chosen: ${move}
${guidance ? `Trainer guidance: ${guidance}` : ''}

Respond in character with an exciting battle description of using this move.`

    return this.chat(systemPrompt, battlePrompt)
  }

  // Method to switch LLM provider
  switchProvider(config: LLMConfig) {
    this.config = config
    this.client = new OpenAI({
      apiKey: config.apiKey || 'dummy-key',
      baseURL: config.baseURL,
      dangerouslyAllowBrowser: true
    })
  }
}

// Export a singleton instance
export const llmService = new LLMService()

// Export configuration presets for easy switching
export const LLM_PRESETS = {
  ollama: {
    provider: 'ollama' as const,
    baseURL: '/ollama-api/v1',
    model: 'llama2',
    apiKey: 'ollama'
  },
  openai: {
    provider: 'openai' as const,
    model: 'gpt-3.5-turbo',
    apiKey: '' // User needs to set this
  },
  openaiLocal: {
    provider: 'openai' as const,
    baseURL: 'http://localhost:1234/v1', // LM Studio or similar
    model: 'local-model',
    apiKey: 'not-needed'
  }
}

export type { LLMConfig }