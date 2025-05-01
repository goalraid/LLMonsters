# pikachu1.py and pikachu2.py
from openai import OpenAI
import logging
import random

# Comment out or remove this line
# logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

class PikachuAgent:
    def __init__(self):
        self.name = "Pikachu2"  # or "Pikachu2" for pikachu2.py
        self.hit_points = 1000
        self.stats = {
            'strength': 15,
            'endurance': 12,
            'speed': 18,
            'intelligence': 14,
            'loyalty': 16
        }
        self.battle_strategy = "Prioritize quick attacks and use speed to dodge attacks."
        self.moves = [
            'Quick Attack',
            'Thunder Shock',
            'Electro Ball',
            'Agility',
        ]
        try:
            self.client = OpenAI(api_key='YOUR_OPENAI_API_KEY')  # Replace with your API key
        except Exception as e:
            logging.error(f"Failed to initialize OpenAI client: {e}")
            raise

    def generate_action(self, game_state):
        messages = [
            {"role": "system", "content": f"You are {self.name}, a Pikachu with stats {self.stats}. Your battle strategy is: '{self.battle_strategy}'. Your available moves are: {', '.join(self.moves)}."},
            {"role": "user", "content": f"Based on the current game state: {game_state}, choose one of your available moves to use."}
        ]
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=messages
            )
            
            if response.choices and len(response.choices) > 0:
                action = response.choices[0].message.content.strip()
            else:
                action = random.choice(self.moves)
            
            return action
        except Exception as e:
            return random.choice(self.moves)

    def apply_damage(self, damage):
        self.hit_points -= damage
        if self.hit_points < 0:
            self.hit_points = 0
