# main.py
from pikachu1 import PikachuAgent as Pikachu1Agent
from pikachu2 import PikachuAgent as Pikachu2Agent
from gamemaster import GameMaster

def main():
    # Initialize Pikachu agents
    pikachu1 = Pikachu1Agent()
    pikachu2 = Pikachu2Agent()

    # Get battle strategies from trainers
    pikachu1.battle_strategy = input("Trainer 1, enter battle strategy for Pikachu1: ")
    pikachu2.battle_strategy = input("Trainer 2, enter battle strategy for Pikachu2: ")

    # Initialize Game Master
    game_master = GameMaster(pikachu1, pikachu2)

    # Start the battle
    game_master.battle()

if __name__ == "__main__":
    main()
