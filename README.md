# LLMonster Battle Simulator

This project simulates a Pokémon-style battle between two Pikachu agents controlled by GPT-based logic using the OpenAI API.

## Files
- `main.py`: Entry point for running the battle.
- `pikachu1.py`, `pikachu2.py`: Pikachu agent logic.
- `gamemaster.py`: Game master logic and battle orchestration.

## Setup
1. Clone this repository.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` and add your OpenAI API key:
   ```bash
   cp .env.example .env
   # Edit .env and set OPENAI_API_KEY
   ```
4. Update the code to load the API key from the environment variable if desired.

## Usage
Run the simulator:
```bash
python main.py
```

## Make Battles More Fun: Use Different LLMs!

By default, both Pikachu agents use OpenAI models, but you can make battles more interesting by giving Pikachu1 and Pikachu2 different personalities powered by different LLMs (Large Language Models). For example, Pikachu1 could use OpenAI GPT-4, Pikachu2 could use Anthropic Claude, Google Gemini, Cohere, or even a local model via Ollama!

### Why Use Different LLMs?
- Each LLM has its own style and strengths, making battles more dynamic and unpredictable.
- Great for comparing LLMs or just for fun!

## How to Switch Pikachu Agents to Different LLMs

Below are step-by-step guides for each supported API. You only need to change the `PikachuAgent` class in `pikachu1.py` or `pikachu2.py` to use a different LLM client and API call.

---

### 1. OpenAI (Default)
- Already set up! Just put your API key in `.env` as shown above.
- Uses `openai` Python package.

---

### 2. Anthropic (Claude)
- Install: `pip install anthropic`
- Get your API key from https://console.anthropic.com/
- Example code for PikachuAgent:
  ```python
  from anthropic import Anthropic
  import os

  class PikachuAgent:
      def __init__(self):
          self.client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
          ...
      def generate_action(self, game_state):
          response = self.client.messages.create(
              model="claude-3-sonnet-20240229",
              max_tokens=100,
              messages=[
                  {"role": "user", "content": f"Based on the current game state: {game_state}, choose one of your available moves to use."}
              ]
          )
          return response.content[0].text.strip()
  ```
- Add `ANTHROPIC_API_KEY=your_key_here` to your `.env` file.

---

### 3. Google Gemini
- Install: `pip install google-generativeai`
- Get your API key from https://aistudio.google.com/app/apikey
- Example code for PikachuAgent:
  ```python
  import google.generativeai as genai
  import os

  class PikachuAgent:
      def __init__(self):
          genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
          self.model = genai.GenerativeModel('gemini-pro')
          ...
      def generate_action(self, game_state):
          response = self.model.generate_content([
              {"role": "user", "parts": [f"Based on the current game state: {game_state}, choose one of your available moves to use."]}
          ])
          return response.text.strip()
  ```
- Add `GOOGLE_API_KEY=your_key_here` to your `.env` file.

---

### 4. Cohere
- Install: `pip install cohere`
- Get your API key from https://dashboard.cohere.com/api-keys
- Example code for PikachuAgent:
  ```python
  import cohere
  import os

  class PikachuAgent:
      def __init__(self):
          self.client = cohere.ClientV2(api_key=os.getenv("COHERE_API_KEY"))
          ...
      def generate_action(self, game_state):
          response = self.client.chat(
              model="command-a-03-2025",
              messages=[
                  {"role": "user", "content": f"Based on the current game state: {game_state}, choose one of your available moves to use."}
              ]
          )
          return response.message.content[0].text.strip()
  ```
- Add `COHERE_API_KEY=your_key_here` to your `.env` file.

---

### 5. Local Models with Ollama
- Install Ollama from https://ollama.com/download and run `ollama pull llama2` (or your preferred model).
- Start Ollama (usually starts automatically on install).
- Ollama supports the OpenAI API format locally!
- In your PikachuAgent, use the OpenAI client but set the base_url:
  ```python
  from openai import OpenAI

  class PikachuAgent:
      def __init__(self):
          self.client = OpenAI(base_url='http://localhost:11434/v1', api_key='ollama')  # 'api_key' is required but not used
          ...
      def generate_action(self, game_state):
          response = self.client.chat.completions.create(
              model="llama2",  # or another model you've pulled
              messages=[
                  {"role": "system", "content": "You are Pikachu..."},
                  {"role": "user", "content": f"Based on the current game state: {game_state}, choose one of your available moves to use."}
              ]
          )
          return response.choices[0].message.content.strip()
  ```
- No API key needed for Ollama.
- See [Ollama OpenAI compatibility docs](https://ollama.com/blog/openai-compatibility) for more info.

---

## Summary Table
| LLM        | Python Package      | API Key Needed | Env Var              | Notes                |
|------------|--------------------|----------------|----------------------|----------------------|
| OpenAI     | openai             | Yes            | OPENAI_API_KEY       | Default setup        |
| Anthropic  | anthropic          | Yes            | ANTHROPIC_API_KEY    | Claude models        |
| Gemini     | google-generativeai| Yes            | GOOGLE_API_KEY       | Gemini Pro           |
| Cohere     | cohere             | Yes            | COHERE_API_KEY       | Cohere Command       |
| Ollama     | openai (local)     | No             | N/A                  | Local, OpenAI format |

---

## Tips
- You can mix and match LLMs: for example, Pikachu1 uses OpenAI, Pikachu2 uses Cohere, etc.
- Each LLM may have different output styles and capabilities.
- Some LLMs require extra setup (API keys, local server for Ollama).
- If you use `.env`, remember to update it for the LLMs you want.

## Notes
- The OpenAI API key is required for the default project. Do not commit your real API key.
- All API keys in the code are placeholders and should be replaced with your own.
- For more LLM options, check the docs for each provider.
