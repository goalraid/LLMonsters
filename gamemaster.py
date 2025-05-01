# gamemaster.py
from openai import OpenAI
import random
import logging
import difflib

# Disable debug logging
logging.getLogger().setLevel(logging.WARNING)

class GameMaster:
    def __init__(self, pikachu1, pikachu2):
        self.pikachu1 = pikachu1
        self.pikachu2 = pikachu2
        self.round_number = 1
        self.max_rounds = 50
        self.stage = self.choose_stage()
        self.battle_log = []
        self.client = OpenAI(api_key='YOUR_OPENAI_API_KEY')  # Replace with your API key

    def choose_stage(self):
        stages = [
            {"name": "Thunder Plateau", "effect": "Electric attacks are boosted by 10%."},
            {"name": "Mud Swamp", "effect": "Speed is reduced by 2 due to the muddy terrain."},
            {"name": "Windy Valley", "effect": "Ranged attacks have disadvantage."},
            # Add more stages as needed
        ]
        return random.choice(stages)

    def narrate_battle_start(self):
        messages = [
            {"role": "system", "content": "You are the Game Master narrating a Pokémon battle."},
            {"role": "user", "content": f"Narrate the scene where {self.pikachu1.name} and {self.pikachu2.name} walk onto the battle stage named '{self.stage['name']}', which has the effect: {self.stage['effect']}."}
        ]
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages
        )
        narration = response.choices[0].message.content.strip()
        return narration  # Return the narration instead of printing it

    def apply_stage_effects(self):
        # Implement stage effects on Pikachus' stats
        effect = self.stage['effect']
        if "Electric attacks are boosted" in effect:
            # Apply a 10% boost to electric attack damage
            pass
        elif "Speed is reduced" in effect:
            # Reduce speed stat by 2
            self.pikachu1.stats['speed'] -= 2
            self.pikachu2.stats['speed'] -= 2
        elif "Ranged attacks have disadvantage" in effect:
            # Implement disadvantage logic
            pass

    def roll_dice(self):
        return random.randint(1, 20)

    def get_stat_modifier(self, stat_value):
        return (stat_value - 10) // 2

    def conduct_turn(self, attacker, defender):
        game_state = {
            'attacker': attacker.name,
            'defender': defender.name,
            'attacker_stats': attacker.stats,
            'defender_stats': defender.stats,
            'attacker_hp': attacker.hit_points,
            'defender_hp': defender.hit_points,
            'stage_effect': self.stage['effect']
        }

        action = attacker.generate_action(game_state)
        move_name = self.parse_move(action, attacker.moves)
        if not move_name:
            move_name = random.choice(attacker.moves)  # Choose a random move if no valid move is parsed

        move = self.get_move_details(move_name)
        if move:
            attack_mod = self.get_stat_modifier(attacker.stats[move['stat']])
            defense_mod = self.get_stat_modifier(defender.stats[move['defense_stat']])

            attack_roll = self.roll_dice() + attack_mod
            defense_roll = self.roll_dice() + defense_mod

            if attack_roll >= defense_roll:
                damage = move['damage']
                # Apply stage effect if applicable
                if "Electric attacks are boosted" in self.stage['effect'] and "Electric" in move['type']:
                    damage = int(damage * 1.1)  # 10% boost
                defender.apply_damage(damage)
                result = f"{attacker.name} uses {move_name} and hits {defender.name} for {damage} damage!"
            else:
                result = f"{attacker.name} uses {move_name}, but {defender.name} dodges the attack!"

            print(result)
            self.battle_log.append(result)

    def parse_move(self, action_text, available_moves):
        for move in available_moves:
            if move.lower() in action_text.lower():
                return move
        # If no exact match is found, try to find the closest match
        closest_match = difflib.get_close_matches(action_text.lower(), [move.lower() for move in available_moves], n=1, cutoff=0.6)
        if closest_match:
            return next(move for move in available_moves if move.lower() == closest_match[0])
        return random.choice(available_moves)  # If still no match, return a random move

    def get_move_details(self, move_name):
        moves = {
            'Quick Attack': {
                'damage': 42,
                'stat': 'speed',
                'defense_stat': 'speed',
                'type': 'Physical',
                'dc': 12
            },
            'Thunder Shock': {
                'damage': 50,
                'stat': 'intelligence',
                'defense_stat': 'endurance',
                'type': 'Electric',
                'dc': 13
            },
            'Electro Ball': {
                'damage': 60,
                'stat': 'intelligence',
                'defense_stat': 'speed',
                'type': 'Electric',
                'dc': 14
            },
            # Add more moves as needed
        }
        return moves.get(move_name)

    def battle(self):
        print(self.narrate_battle_start())  # Print the battle start narration
        self.apply_stage_effects()

        while self.round_number <= self.max_rounds:
            print(f"\n--- Round {self.round_number} ---")

            # Pikachu1's Turn
            self.conduct_turn(self.pikachu1, self.pikachu2)
            if self.pikachu2.hit_points <= 0:
                winner = self.pikachu1.name
                break

            # Pikachu2's Turn
            self.conduct_turn(self.pikachu2, self.pikachu1)
            if self.pikachu1.hit_points <= 0:
                winner = self.pikachu2.name
                break

            # Add visual description every 5 rounds
            if self.round_number % 5 == 0:
                self.generate_visual_description()

            self.round_number += 1

        # Generate final visual description
        self.generate_visual_description(is_final=True)

        print(f"\nThe battle is over! The winner is {winner}")

    def generate_visual_description(self, is_final=False):
        hp_difference = abs(self.pikachu1.hit_points - self.pikachu2.hit_points)
        leading_pikachu = self.pikachu1.name if self.pikachu1.hit_points > self.pikachu2.hit_points else self.pikachu2.name
        trailing_pikachu = self.pikachu2.name if leading_pikachu == self.pikachu1.name else self.pikachu1.name

        if is_final:
            prompt = f"Describe the final scene of an intense Pokémon battle between two Pikachus on {self.stage['name']}. {leading_pikachu} has won with {hp_difference} more HP than {trailing_pikachu}. The stage effect is: {self.stage['effect']}."
        else:
            prompt = f"Describe a snapshot of an ongoing Pokémon battle between two Pikachus on {self.stage['name']}. It's round {self.round_number}, and {leading_pikachu} is leading with {hp_difference} more HP than {trailing_pikachu}. The stage effect is: {self.stage['effect']}."

        messages = [
            {"role": "system", "content": "You are a visual descriptor for Pokémon battles. Provide vivid, concise descriptions of battle scenes."},
            {"role": "user", "content": prompt}
        ]

        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages
            )
            description = response.choices[0].message.content.strip()
        except Exception as e:
            description = f"The battle rages on at {self.stage['name']}! {leading_pikachu} seems to have the upper hand, but {trailing_pikachu} is not giving up!"

        print("\n--- Battle Scene ---")
        print(description)
        print("----")
