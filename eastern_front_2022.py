#!/usr/bin/env python3
"""
Eastern Front 2022: A Minimalist Grand Strategy Wargame
A turn-based, text-driven wargame inspired by classic pen & paper military simulations.
"""

import random
import sys
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum


class Side(Enum):
    UKRAINE = "UKR"
    RUSSIA = "RUS"
    NEUTRAL = "NEU"


class Role(Enum):
    INFANTRY = "INF"
    ARMOR = "ARM"
    ARTILLERY = "ART"


@dataclass
class Division:
    """Represents a military division with minimal stats."""
    name: str
    strength: int  # 1-5
    supply_need: int  # 1-3
    role: Role
    side: Side
    location: str

    def __str__(self):
        return f"{self.name} ({self.role.value} S{self.strength})"


@dataclass
class Zone:
    """Represents a strategic zone on the map."""
    name: str
    full_name: str
    controller: Side
    is_city: bool
    supply_value: int
    divisions: List[Division]
    neighbors: List[str]

    def display(self):
        """Return a compact display string for the zone."""
        ctrl = self.controller.value
        div_count = len(self.divisions)
        total_strength = sum(d.strength for d in self.divisions)
        if div_count > 0:
            return f"[{self.name}:{ctrl} D{div_count}S{total_strength}]"
        else:
            return f"[{self.name}:{ctrl}]"


class Game:
    """Main game controller."""

    def __init__(self):
        self.turn = 0
        self.player_side: Optional[Side] = None
        self.ai_side: Optional[Side] = None
        self.zones: Dict[str, Zone] = {}
        self.divisions: List[Division] = []
        self.player_supply = 0
        self.ai_supply = 0
        self.game_over = False
        self.winner: Optional[Side] = None

    def initialize_map(self):
        """Create the strategic map."""
        # Define zones with adjacency
        zones_data = {
            "KYIV": ("Kyiv", Side.UKRAINE, True, 5, ["CHER", "SUMY"]),
            "SUMY": ("Sumy", Side.UKRAINE, True, 3, ["KYIV", "KHARKIV", "POLT"]),
            "KHARKIV": ("Kharkiv", Side.UKRAINE, True, 4, ["SUMY", "LUHANSK", "POLT"]),
            "CHER": ("Cherkasy", Side.UKRAINE, True, 2, ["KYIV", "POLT", "MYKO"]),
            "POLT": ("Poltava", Side.UKRAINE, True, 3, ["SUMY", "KHARKIV", "CHER", "LUHANSK", "MYKO"]),
            "LUHANSK": ("Luhansk", Side.RUSSIA, True, 3, ["KHARKIV", "POLT", "KHER"]),
            "ODESA": ("Odesa", Side.UKRAINE, True, 4, ["MYKO"]),
            "MYKO": ("Mykolaiv", Side.UKRAINE, True, 3, ["ODESA", "CHER", "POLT", "KHER"]),
            "KHER": ("Kherson", Side.RUSSIA, True, 3, ["MYKO", "POLT", "LUHANSK"]),
        }

        for code, (full_name, controller, is_city, supply, neighbors) in zones_data.items():
            self.zones[code] = Zone(
                name=code,
                full_name=full_name,
                controller=controller,
                is_city=is_city,
                supply_value=supply,
                divisions=[],
                neighbors=neighbors
            )

    def initialize_divisions(self):
        """Create starting divisions for both sides."""
        # Ukraine starting forces
        ukr_divs = [
            Division("1st Guard", 4, 2, Role.INFANTRY, Side.UKRAINE, "KYIV"),
            Division("2nd Mech", 3, 2, Role.ARMOR, Side.UKRAINE, "KHARKIV"),
            Division("3rd Rifle", 3, 1, Role.INFANTRY, Side.UKRAINE, "ODESA"),
            Division("4th Artillery", 2, 2, Role.ARTILLERY, Side.UKRAINE, "POLT"),
        ]

        # Russia starting forces
        rus_divs = [
            Division("5th Guards", 4, 2, Role.ARMOR, Side.RUSSIA, "LUHANSK"),
            Division("6th Motorized", 3, 2, Role.INFANTRY, Side.RUSSIA, "LUHANSK"),
            Division("7th Tank", 3, 2, Role.ARMOR, Side.RUSSIA, "KHER"),
            Division("8th Rocket", 2, 2, Role.ARTILLERY, Side.RUSSIA, "KHER"),
        ]

        self.divisions = ukr_divs + rus_divs

        # Place divisions in zones
        for div in self.divisions:
            self.zones[div.location].divisions.append(div)

    def calculate_supply(self, side: Side) -> int:
        """Calculate total supply generation for a side."""
        supply = 0
        for zone in self.zones.values():
            if zone.controller == side and zone.is_city:
                supply += zone.supply_value
        return supply

    def display_map(self):
        """Print the ASCII strategic map."""
        print("\n" + "="*50)
        print("STRATEGIC MAP")
        print("="*50)

        # Map layout (3x3 grid)
        rows = [
            ["KYIV", "SUMY", "KHARKIV"],
            ["CHER", "POLT", "LUHANSK"],
            ["ODESA", "MYKO", "KHER"]
        ]

        for row in rows:
            print("  ".join(self.zones[code].display() for code in row))

        print("="*50 + "\n")

    def display_status(self):
        """Show current turn and supply status."""
        print(f"\n{'='*50}")
        print(f"TURN {self.turn}")
        print(f"{'='*50}")
        print(f"Your Supply: {self.player_supply}")
        print(f"Enemy Supply: {self.ai_supply}")
        print()

    def get_side_divisions(self, side: Side) -> List[Division]:
        """Get all divisions belonging to a side."""
        return [d for d in self.divisions if d.side == side and d.strength > 0]

    def reinforcement_phase(self, side: Side, supply: int) -> int:
        """Allow player or AI to spend supply on reinforcements."""
        divs = self.get_side_divisions(side)
        
        if side == self.player_side:
            print(f"\n--- REINFORCEMENT PHASE (Supply: {supply}) ---")
            print("Reinforce divisions? (Costs 2 supply per strength point)")
            print("0. Skip reinforcements")
            
            for i, div in enumerate(divs, 1):
                print(f"{i}. {div} at {self.zones[div.location].full_name}")
            
            while supply >= 2:
                try:
                    choice = input(f"\nReinforce which division? (Supply: {supply}): ").strip()
                    if choice == '0' or choice == '':
                        break
                    
                    idx = int(choice) - 1
                    if 0 <= idx < len(divs):
                        div = divs[idx]
                        if div.strength < 5:
                            div.strength += 1
                            supply -= 2
                            print(f"✓ {div.name} reinforced to S{div.strength}")
                        else:
                            print(f"✗ {div.name} already at maximum strength")
                    else:
                        print("Invalid choice")
                except (ValueError, KeyboardInterrupt):
                    break
        else:
            # Simple AI: reinforce weakest divisions
            while supply >= 2:
                weak_divs = [d for d in divs if d.strength < 5]
                if not weak_divs:
                    break
                div = min(weak_divs, key=lambda d: d.strength)
                div.strength += 1
                supply -= 2

        return supply

    def movement_phase(self, side: Side):
        """Allow movement of divisions."""
        divs = self.get_side_divisions(side)
        
        if side == self.player_side:
            print(f"\n--- MOVEMENT PHASE ---")
            print("0. Done moving")
            
            for i, div in enumerate(divs, 1):
                zone = self.zones[div.location]
                neighbors_str = ", ".join([self.zones[n].full_name for n in zone.neighbors])
                print(f"{i}. {div} at {zone.full_name} → Can move to: {neighbors_str}")
            
            moved = set()
            while True:
                try:
                    choice = input("\nMove which division? ").strip()
                    if choice == '0' or choice == '':
                        break
                    
                    idx = int(choice) - 1
                    if 0 <= idx < len(divs) and idx not in moved:
                        div = divs[idx]
                        zone = self.zones[div.location]
                        
                        print(f"Move {div.name} from {zone.full_name} to:")
                        for i, neighbor in enumerate(zone.neighbors, 1):
                            n_zone = self.zones[neighbor]
                            print(f"  {i}. {n_zone.full_name} ({n_zone.controller.value})")
                        
                        dest_choice = input("Destination: ").strip()
                        if dest_choice.isdigit():
                            dest_idx = int(dest_choice) - 1
                            if 0 <= dest_idx < len(zone.neighbors):
                                new_loc = zone.neighbors[dest_idx]
                                zone.divisions.remove(div)
                                div.location = new_loc
                                self.zones[new_loc].divisions.append(div)
                                moved.add(idx)
                                print(f"✓ {div.name} moved to {self.zones[new_loc].full_name}")
                    else:
                        print("Invalid choice or already moved")
                except (ValueError, KeyboardInterrupt):
                    break
        else:
            # Simple AI: move divisions toward enemy zones
            for div in divs:
                zone = self.zones[div.location]
                enemy_neighbors = [n for n in zone.neighbors 
                                 if self.zones[n].controller != side]
                if enemy_neighbors and random.random() > 0.3:
                    target = random.choice(enemy_neighbors)
                    zone.divisions.remove(div)
                    div.location = target
                    self.zones[target].divisions.append(div)

    def resolve_combat(self, zone: Zone):
        """Resolve combat in a contested zone."""
        attackers = [d for d in zone.divisions if d.side != zone.controller]
        defenders = [d for d in zone.divisions if d.side == zone.controller]
        
        if not attackers or not defenders:
            # No combat or zone captured
            if attackers and not defenders:
                zone.controller = attackers[0].side
                print(f"  → {zone.full_name} captured by {attackers[0].side.value}!")
            return
        
        attacker_supply = sum(d.strength for d in attackers)
        defender_supply = sum(d.strength for d in defenders)
        
        print(f"\n⚔️  COMBAT in {zone.full_name}")
        print(f"   Attackers ({attackers[0].side.value}): {attacker_supply} strength")
        print(f"   Defenders ({defenders[0].side.value}): {defender_supply} strength")
        
        # Apply combat results
        if attacker_supply < defender_supply:
            # Attacker loses
            casualties = min(2, len(attackers))
            for _ in range(casualties):
                if attackers:
                    div = random.choice(attackers)
                    div.strength -= 1
                    print(f"   - {div.name} takes 1 damage (S{div.strength})")
                    if div.strength <= 0:
                        zone.divisions.remove(div)
                        attackers.remove(div)
        elif attacker_supply > defender_supply:
            # Defender loses
            casualties = min(2, len(defenders))
            for _ in range(casualties):
                if defenders:
                    div = random.choice(defenders)
                    div.strength -= 1
                    print(f"   - {div.name} takes 1 damage (S{div.strength})")
                    if div.strength <= 0:
                        zone.divisions.remove(div)
                        defenders.remove(div)
            
            # Check if zone captured
            if not defenders:
                zone.controller = attackers[0].side
                print(f"  → {zone.full_name} captured by {attackers[0].side.value}!")
        else:
            # Equal - both take damage
            if attackers:
                div = random.choice(attackers)
                div.strength -= 1
                print(f"   - {div.name} takes 1 damage (S{div.strength})")
                if div.strength <= 0:
                    zone.divisions.remove(div)
            if defenders:
                div = random.choice(defenders)
                div.strength -= 1
                print(f"   - {div.name} takes 1 damage (S{div.strength})")
                if div.strength <= 0:
                    zone.divisions.remove(div)

    def combat_phase(self):
        """Resolve all combats."""
        print(f"\n--- COMBAT RESOLUTION ---")
        combat_occurred = False
        
        for zone in self.zones.values():
            sides_present = set(d.side for d in zone.divisions)
            if len(sides_present) > 1:
                combat_occurred = True
                self.resolve_combat(zone)
        
        if not combat_occurred:
            print("  No combat this turn.")

    def random_event(self):
        """Trigger a random event."""
        print(f"\n--- RANDOM EVENT ---")
        
        events = [
            ("Heavy Rain", "All movements disrupted. No supply bonus this turn."),
            ("Clear Weather", "Perfect conditions. +2 supply to both sides."),
            ("Civilian Unrest", "Supply lines strained. -2 supply to both sides."),
            ("Intelligence Report", "Enemy positions revealed (no mechanical effect)."),
            ("Reinforcements Arrive", "+1 strength to a random division."),
            ("Supply Depot Found", "+3 supply to controlling side."),
            ("Morale Boost", "Troops are inspired. (Narrative effect only.)"),
        ]
        
        event_name, event_desc = random.choice(events)
        print(f"  {event_name}: {event_desc}")
        
        # Apply mechanical effects
        if "supply to both sides" in event_desc:
            change = 2 if "+" in event_desc else -2
            self.player_supply = max(0, self.player_supply + change)
            self.ai_supply = max(0, self.ai_supply + change)
        elif "Reinforcements Arrive" in event_name:
            all_divs = [d for d in self.divisions if d.strength > 0 and d.strength < 5]
            if all_divs:
                lucky_div = random.choice(all_divs)
                lucky_div.strength += 1
                print(f"  → {lucky_div.name} reinforced to S{lucky_div.strength}!")

    def check_victory(self):
        """Check if game is over."""
        ukraine_zones = sum(1 for z in self.zones.values() if z.controller == Side.UKRAINE)
        russia_zones = sum(1 for z in self.zones.values() if z.controller == Side.RUSSIA)
        
        # Victory if one side controls 7+ zones
        if ukraine_zones >= 7:
            self.game_over = True
            self.winner = Side.UKRAINE
        elif russia_zones >= 7:
            self.game_over = True
            self.winner = Side.RUSSIA
        
        # Check if either side has no divisions left
        ukr_divs = len(self.get_side_divisions(Side.UKRAINE))
        rus_divs = len(self.get_side_divisions(Side.RUSSIA))
        
        if ukr_divs == 0:
            self.game_over = True
            self.winner = Side.RUSSIA
        elif rus_divs == 0:
            self.game_over = True
            self.winner = Side.UKRAINE

    def play_turn(self):
        """Execute one complete turn."""
        self.turn += 1
        
        # Generate supply
        self.player_supply = self.calculate_supply(self.player_side)
        self.ai_supply = self.calculate_supply(self.ai_side)
        
        self.display_status()
        self.display_map()
        
        # Player turn
        self.player_supply = self.reinforcement_phase(self.player_side, self.player_supply)
        self.movement_phase(self.player_side)
        
        # AI turn
        self.ai_supply = self.reinforcement_phase(self.ai_side, self.ai_supply)
        self.movement_phase(self.ai_side)
        
        # Combat
        self.combat_phase()
        
        # Random event
        self.random_event()
        
        # Check victory
        self.check_victory()
        
        input("\n[Press Enter to continue...]")

    def choose_side(self):
        """Let player choose which side to play."""
        print("\n" + "="*50)
        print("EASTERN FRONT 2022")
        print("A Minimalist Grand Strategy Wargame")
        print("="*50)
        print("\nChoose your side:")
        print("1. Ukraine")
        print("2. Russia")
        
        while True:
            choice = input("\nYour choice (1 or 2): ").strip()
            if choice == '1':
                self.player_side = Side.UKRAINE
                self.ai_side = Side.RUSSIA
                break
            elif choice == '2':
                self.player_side = Side.RUSSIA
                self.ai_side = Side.UKRAINE
                break
            else:
                print("Invalid choice. Enter 1 or 2.")

    def run(self):
        """Main game loop."""
        self.initialize_map()
        self.initialize_divisions()
        self.choose_side()
        
        while not self.game_over:
            self.play_turn()
        
        # Game over
        print("\n" + "="*50)
        print("GAME OVER")
        print("="*50)
        print(f"Winner: {self.winner.value}")
        
        ukraine_zones = sum(1 for z in self.zones.values() if z.controller == Side.UKRAINE)
        russia_zones = sum(1 for z in self.zones.values() if z.controller == Side.RUSSIA)
        print(f"Final Territory Control:")
        print(f"  Ukraine: {ukraine_zones} zones")
        print(f"  Russia: {russia_zones} zones")
        print("="*50)


def main():
    """Entry point."""
    try:
        game = Game()
        game.run()
    except KeyboardInterrupt:
        print("\n\nGame interrupted. Thanks for playing!")
        sys.exit(0)


if __name__ == "__main__":
    main()
