// init global vars
window.nmdCardgamesGlobals = {};
nmdCardgamesGlobals.handsPlayed = 0;
nmdCardgamesGlobals.seats = 0;
nmdCardgamesGlobals.cards_per_seat = 1;
nmdCardgamesGlobals.auto_play_interval;
nmdCardgamesGlobals.auto_play_state = 'stopped';
nmdCardgamesGlobals.display_percent_decimals = false;
window.nmdCardgamesResults = {};
nmdCardgamesResults.hands_count = 0;
nmdCardgamesResults.winning_player = null;
nmdCardgamesResults.player_cards =	{
										'player_1': null,
										'player_2': null,
										'player_3': null,
										'player_4': null,
										'player_5': null
									};
nmdCardgamesResults.player_tricks =	{};

// start application	
$(document).ready(function() {
	// init stats
	nmdInitStatistics();
	// bind to changes in user controls
	var seat_select_previous_value;

	$('#nmd-number-of-players-select').on('focus', function () {
		// Store the current value on focus and on change
		seat_select_previous_value = this.value;
	}).change(function() {
		if (seat_select_previous_value > 0) {
			var answer = confirm('Changing the number of players will reset all statistics. Continue?');
			if (!answer) {
				// revert the value
				$('#nmd-number-of-players-select').val(seat_select_previous_value);
				return;
			}
		}
		nmdCardgamesGlobals.seats = $(this).val();
		// stop autoplay, reset stats and output display
		if (nmdCardgamesGlobals.auto_play_state != 'stopped') {
			nmdAutoPlayHands();
		}
		nmdInitStatistics();
		nmdResetOutputDisplay();

		// show selected number of seats and stats rows
		$('.nmd-seat').addClass('d-none');
		$('.nmd_results_player_row').addClass('d-none');
		for (var j = 1; j <= nmdCardgamesGlobals.seats; j++) {
			$('#nmd-seat-column-player_'+j).removeClass('d-none');
			$('#nmd_results_player_'+j+'_row').removeClass('d-none');
		}
		nmdInitHand();
	});

	// bind to nmd-percent-display-toggle
	$('#nmd-percent-display-toggle').change(function () {
			var show_percent_decimals = $(this).prop("checked") ? 1 : 0;
			if (show_percent_decimals) {
				nmdCardgamesGlobals.display_percent_decimals = true;
				$('.nmd_results_percent_without_decimals').addClass('d-none');
				$('.nmd_results_percent_with_decimals').removeClass('d-none');
			} else {
				nmdCardgamesGlobals.display_percent_decimals = false;
				$('.nmd_results_percent_with_decimals').addClass('d-none');
				$('.nmd_results_percent_without_decimals').removeClass('d-none');
			}
	});
});

window.nmdCalculateWinner = function () {
	nmdCardgamesResults.hands_count++;
	nmdCardgamesResults.winning_player = 'player_1';
	var winning_card = nmdCardgamesResults.player_cards['player_1'];

	// update counter of hands
	nmdCardgamesGlobals.handsPlayed++;

	// iterate players and find winner
	for (var j = 2; j <= nmdCardgamesGlobals.seats; j++) {
		// get player card from global
		var player = 'player_' + j;
		var player_card = nmdCardgamesResults.player_cards[player];

		// if player connot follow suit, and they don't have trump, skip them
		if (player_card['suit_code'] != winning_card['suit_code'] && player_card['suit_code'] != nmdCardgamesGlobals.trump_card['suit_code']) {
			continue;
		}
		// if player follows suit with lesser value card, skip them
		if (player_card['suit_code'] == winning_card['suit_code'] && winning_card['value'] > player_card['value']) {
			continue;
		}
		// player has better card
		nmdCardgamesResults.winning_player = player;
		winning_card = player_card;
	}

	// record winner in global var
	nmdCardgamesResults.player_tricks[nmdCardgamesResults.winning_player]['total']++;
	if (winning_card['suit_code'] == nmdCardgamesGlobals.trump_card['suit_code']) {
		nmdCardgamesResults.player_tricks[nmdCardgamesResults.winning_player]['with_trump']++;		
	} else {
		nmdCardgamesResults.player_tricks[nmdCardgamesResults.winning_player]['without_trump']++;
	}
}

window.nmdUpdateResultsDisplay = function () {
	// highlight winning card
	$('#nmd-seat-'+nmdCardgamesResults.winning_player).addClass('nmd-winning-card')
	$('#nmd-seat-'+nmdCardgamesResults.winning_player+' .nmd-playing-card-winner_notice').removeClass('d-none');

	// update stats display
	$('#nmd_results_winner').text(nmdCardgamesResults.winning_player);
	$('#nmd_results_winner').text($('#nmd-seat-column-'+nmdCardgamesResults.winning_player+' .nmd-player-name').text());
	$('#nmd_results_hands_count').text(nmdCardgamesResults.hands_count);

	// update player stats
	for (var j = 1; j <= nmdCardgamesGlobals.seats; j++) {
		var wins = nmdCardgamesResults.player_tricks['player_'+j]['total'];
		var wins_with_trump = nmdCardgamesResults.player_tricks['player_'+j]['with_trump'];
		var wins_without_trump = nmdCardgamesResults.player_tricks['player_'+j]['without_trump'];

		var wins_percent = (100 * wins) / nmdCardgamesResults.hands_count;
		var wins_with_trump_percent = (100 * wins_with_trump) / nmdCardgamesResults.hands_count;
		var wins_without_trump_percent = (100 * wins_without_trump) / nmdCardgamesResults.hands_count;

		var display_string_wins = wins + '<span class="nmd_results_percent_without_decimals ' + (nmdCardgamesGlobals.display_percent_decimals ? 'd-none' : null ) + ' float-right">'+wins_percent.toFixed(0)+'%</span>' + '<span class="nmd_results_percent_with_decimals ' + (!nmdCardgamesGlobals.display_percent_decimals ? 'd-none' : null ) + ' float-right">'+wins_percent.toFixed(2)+'%</span>';
		var display_string_wins_with_trump = wins_with_trump + '<span class="nmd_results_percent_without_decimals ' + (nmdCardgamesGlobals.display_percent_decimals ? 'd-none' : null ) + ' float-right">'+wins_with_trump_percent.toFixed(0)+'%</span>' + '<span class="nmd_results_percent_with_decimals ' + (!nmdCardgamesGlobals.display_percent_decimals ? 'd-none' : null ) + ' float-right">'+wins_with_trump_percent.toFixed(2)+'%</span>';
		var display_string_wins_without_trump = wins_without_trump + '<span class="nmd_results_percent_without_decimals ' + (nmdCardgamesGlobals.display_percent_decimals ? 'd-none' : null ) + ' float-right">'+wins_without_trump_percent.toFixed(0)+'%</span>' + '<span class="nmd_results_percent_with_decimals ' + (!nmdCardgamesGlobals.display_percent_decimals ? 'd-none' : null ) + ' float-right">'+wins_without_trump_percent.toFixed(2)+'%</span>';

		$('#nmd_results_player_'+j+'_wins').html(display_string_wins);
		$('#nmd_results_player_'+j+'_wins_with_trump').html(display_string_wins_with_trump);
		$('#nmd_results_player_'+j+'_wins_without_trump').html(display_string_wins_without_trump);
	}
}

window.nmdAutoPlayHands = function () {
	if (nmdCardgamesGlobals.seats == 0) {
		alert('Please choose the number of players');
		return;
	}
	if (nmdCardgamesGlobals.auto_play_state == 'stopped') {
		// update global var
		nmdCardgamesGlobals.auto_play_state = 'running'
		// set button state
		$('#nmd-autoplay-button').text('Stop').removeClass('btn-primary').addClass('btn-danger');
		// start autoplay
		nmdCardgamesGlobals.auto_play_interval = setInterval(nmdPlayHand, 1);
	} else {
		// update global var
		nmdCardgamesGlobals.auto_play_state = 'stopped'
		// set button state
		$('#nmd-autoplay-button').text('Auto-Play').removeClass('btn-danger').addClass('btn-primary');
		// stop autoplay
		nmdCardgamesGlobals.auto_play_interval = clearInterval(nmdCardgamesGlobals.auto_play_interval);
	}
}

window.nmdPlayHand = function () {
	if (nmdCardgamesGlobals.seats == 0) {
		alert('Please choose the number of players');
		return;
	}

	// init the new hand
	nmdInitHand();

	// get deck
	nmdSetStandardDeck();

	// shuffle deck
	nmdCardgamesGlobals.deck_shuffled = shuffleFisherYates(nmdCardgamesGlobals.deck);

	// display shuffled deck
	nmdDisplayShuffledDeck();

	// deal hand
	nmdDealHand();
	
	// calculate winner
	nmdCalculateWinner();

	// update results display
	nmdUpdateResultsDisplay();
}

window.nmdInitHand = function () {
	nmdCardgamesGlobals.deck = [];
	nmdCardgamesGlobals.deck_shuffled = [];
	nmdCardgamesGlobals.current_card = null;
	nmdCardgamesGlobals.trump_suit = null;

	$('#nmd-seat-player_1').html('<span class="d-none nmd-playing-card-winner_notice"></span>');
	$('#nmd-seat-player_2').html('<span class="d-none nmd-playing-card-winner_notice"></span>');
	$('#nmd-seat-player_3').html('<span class="d-none nmd-playing-card-winner_notice"></span>');
	$('#nmd-seat-player_4').html('<span class="d-none nmd-playing-card-winner_notice"></span>');
	$('#nmd-seat-player_5').html('<span class="d-none nmd-playing-card-winner_notice"></span>');
	$('#nmd-output-deck-container').html('');
	$('#nmd-output-trump-container').html('');
	$('#nmd-output-table').removeClass('d-none');
	$('.nmd-playing-card').removeClass('nmd-winning-card')
}

window.nmdInitStatistics = function () {
	nmdCardgamesResults.hands_count = 0;
	nmdCardgamesResults.winning_player = null;
	nmdCardgamesResults.player_tricks =	{
											'player_1': {'total':0, 'with_trump':0, 'without_trump':0},
											'player_2': {'total':0, 'with_trump':0, 'without_trump':0},
											'player_3': {'total':0, 'with_trump':0, 'without_trump':0},
											'player_4': {'total':0, 'with_trump':0, 'without_trump':0},
											'player_5': {'total':0, 'with_trump':0, 'without_trump':0}
										};
}


window.nmdResetOutputDisplay = function () {
	for (var i = 1; i <= 5; i++) {
		$('#nmd_results_player_'+i+'_wins').text('');
		$('#nmd_results_player_'+i+'_wins_with_trump').text('');
		$('#nmd_results_player_'+i+'_wins_without_trump').text('');
		$('#nmd_results_hands_count').text('');
		$('#nmd_results_winner').text('');
	}
}

window.nmdDealHand = function () {
	var deal_card_index = 0;
	for (var i = 1; i <= nmdCardgamesGlobals.cards_per_seat; i++) {
		for (var j = 1; j <= nmdCardgamesGlobals.seats; j++) {
			nmdCardgamesGlobals.current_card = nmdCardgamesGlobals.deck_shuffled[deal_card_index];
			var card_code = '<p style="color:' + nmdCardgamesGlobals.current_card.color + '">&' + nmdCardgamesGlobals.current_card.suit_code + '; ' + nmdCardgamesGlobals.current_card.shortname + '</p>';
			$('#nmd-seat-player_'+j).prepend(card_code);
			// record player's card in global var
			nmdCardgamesResults.player_cards['player_'+j] = nmdCardgamesGlobals.current_card;
			deal_card_index++;
		}
	}
	// next card is trump
	nmdCardgamesGlobals.trump_card = nmdCardgamesGlobals.deck_shuffled[deal_card_index];
	var card_code = '<span style="color:' + nmdCardgamesGlobals.trump_card.color + '">&' + nmdCardgamesGlobals.trump_card.suit_code + '; ' + nmdCardgamesGlobals.trump_card.shortname + '</span>';
	$('#nmd-output-trump-container').html(card_code);
}

window.nmdDisplayShuffledDeck = function () {
	var table_code = '<table id="nmd-deck-table" class="table table-bordered"><thead><tr><th colspan="2">Shuffled Deck</th></tr><tr><th scope="col" style="width:80px;">Position</th><th scope="col">Card</th></tr></thead><tbody>';
	$.each(nmdCardgamesGlobals.deck_shuffled, function(i , card) {
		table_code += '<tr><td>' + (i+1) + '</td><td style="color:' + card.color + '">&' + card.suit_code + '; ' + card.shortname + '</td></tr>';
	});
	table_code += '<tbody></table>';
	nmdUpdateOutputContainer(table_code, 'replace', false, '#nmd-output-deck-container');
}
window.nmdUpdateOutputContainer = function (new_data, action, add_wrapper, target_id) {
	action = typeof action !== 'undefined' ? action : 'append';
	add_wrapper = typeof add_wrapper !== 'undefined' ? add_wrapper : true;
	target_id = typeof target_id !== 'undefined' ? target_id : 'nmd-main-conatiner';
	if (typeof new_data === 'undefined') {
		return;
	}
	if (add_wrapper) {
		new_data = '<div>' + new_data + '</div>';
	}
	if (action == 'append') {
		$(target_id).append(new_data);
	} else {
		$(target_id).html(new_data);
	}
}

window.nmdSetStandardDeck = function () {
	var suits = [['spades', 'black'], ['hearts', 'red'], ['diams', 'red'], ['clubs', 'black']];
	var names = [
					[2,2],[3,3],[4,4],[5,5],[6,6],[7,7],[8,8],[9,9],[10,10],[11,'J'],[12,'Q'],[13,'K'],[14,'A']
				];

	$.each(suits, function(i, suit) {
		$.each(names, function(j, name) {
			nmdCardgamesGlobals.deck.push (
							{
								'value': name[0],
								'shortname': name[1],
								'suit_code': suit[0],
								'color': suit[1]
							}
						);				
						
		});
	});

	
}

function shuffleFisherYates(array) {
	let i = array.length;
	while (i--) {
		const ri = Math.floor(Math.random() * i);
		[array[i], array[ri]] = [array[ri], array[i]];
	}
	return array;
}
