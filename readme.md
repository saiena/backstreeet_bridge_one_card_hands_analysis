# Backstreet Bridge
### Winning Percentages For One-Card Hands

This application was developed to provide insights into the best strategy for a specific scenario in Backstreet Bridge:
	* Hand consists of 1 card dealt to each player
	* Player 1 (the player to the dealer's left) must decide what to bid
This scenario has generated some controversy:
	* Some experts have proposed that Player 1 should assume they will win the trick and therefore bid "1", and that all other players should bid "0" (with the exception of the dealer who will be forced to bid "1").
	* Others have proposed that Player 1 should assume they will win the trick only if they hold a trump card.
This application can be used to view the win rate of Player 1 when they have a trump card and when they do not have a trump card. By using the application's "Auto-Play" feature, statistics based on thousands for single-card hands can be generated.
### How the Application Works
This application was written in Javascript, and displays data using an HTML + CSS template.
The Javascript code performs the following operations:
	* create a virtual deck of cards (create array)
	* shuffle the virtual deck (sort array)
	* display the shuffled deck
	* deal a hand from the top of the shuffled deck
	* calculate the winner of the hand and store results
	* update the displayed statistics
