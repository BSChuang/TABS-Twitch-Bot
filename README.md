# TABS-Twitch-Bot
### DO NOT COPY, MODIFY, OR STEAL WITHOUT PERMISSION
This is the bot I created for betting on Totally Accurate Battle Simulator battles through Twitch chat

I think it is a very unique idea and worked just as well as I imagined. However, it is much harder for a Twitch channel to garner  attention than I expected. Without the playerbase, I do not have the means (money) to keep the channel up 24/7, but perhaps I will try it again another time. But you didn't come for a sob story, here's the functionality!

# WELCOME to Totally Inaccurate Betting Simulator!
Here you can suggest battles and bet on which team you think will reign victorious!

### Type !credits to get started!
Gain honor and climb the leaderboards by betting and winning credits! You gain 1 honor for every 10 credits you win.

### Odds-based or pool-based?
Both! If the viewers choose the house's battle (chil_ttv), the battle will be odds based, where you receive more credits depending on how much the odds stacked against you. If the battle chosen was suggested by another viewer, the winnings will be determined by how many credits were bet on both sides.

## !credits and !points
### !credits
Usage:
Returns credits or makes account
!credits

### !points
Usage:
Returns your honor on the leaderboard
!points

## 1) !suggest
Suggests a battle to be played in the simulation! Try to suggest even battles for more exciting duels. Remember to only put spaces between suggest and the red team's composition and blue team's composition. You can suggest any time except during the voting phase! If there are more than 5 suggestions, 5 are chosen by random to be voted on.

### Possible Units:
'clubber', 'protector', 'spear_thrower', 'stoner', 'bone_mage', 'chieftain', 'mammoth',
'halfling', 'farmer', 'potionseller', 'harvester', 'wheelbarrow', 'scarecrow',
'bard', 'squire', 'archer', 'priest', 'knight', 'catapult', 'the_king',
'sarissa', 'shield_bearer', 'hoplite', 'snake_archer', 'ballista', 'minotaur', 'zeus',
'headbutter', 'ice_archer', 'brawler', 'berserker', 'valkyrie', 'jarl', 'longship'

### Usage:
Suggest battle:
!suggest [unit1]:[quantity1],[unit2]:[quantity2],...,[unit]:[quantity] [unit1]:[quantity1],[unit2]:[quantity2],...,[unit]:[quantity]

See battle you've suggested:
!suggest

### Examples:
Suggests 25 halfings vs. 10 farmers
!suggest halfling:25 farmer:10

Suggest 30 clubbers and 5 ice archers vs. 5 knights and 5 valkyries
!suggest clubber:30,ice_archer:5 knight:5,valkyrie:5

## 2) !vote
Votes on which battle you'd like to see play out. You can only vote during the voting phase!

### Usage:
Vote on a suggested battle
!vote [username]

See all suggested battles
!vote

### Examples:
Votes for chil_ttv's battle
!vote chil_ttv

Votes for shroud's battle
!vote shroud

Returns who you've voted for
!vote

## 3) !bet
Bets on which team you think will win. You can only bet during the betting phase, and you can't bet more credits than you have (duh)!

### Usage:
Bets an amount on a team
!bet [credits to bet] [red or blue]

Returns how much you've bet on a team

### Examples:
Bets 10 credits on red team
!bet 10 red

Bets 1234 credits on blue team
!bet 1234 blue

Returns the amount you've bet
!bet
