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
nmdCardgamesResults.player_1_details = {};
var nmdPlayer1DetailsChart;
var nmdPlayer1DetailsChartData =	{
												'trump': [],
												'non_trump': [],
											};

// start application	
$(document).ready(function() {
	// init stats
	nmdInitStatistics();
	// bind to collapsable player 1 details
	$('#nmd-player1-details').on('show.bs.collapse', function () {
		// stop autoplay, id needed
		if (nmdCardgamesGlobals.auto_play_state != 'stopped') {
			nmdAutoPlayHands();
		}
		// display tables
		nmdDisplayPlayer1Details();
		// display chart
		nmdDisplayPlayer1DetailsChart();
	});
	$('#nmd-player1-details').on('hide.bs.collapse', function () {
		// reset data for chart
		nmdPlayer1DetailsChartData =	{
												'trump': [],
												'non_trump': [],
											};
		// destroy chart
		nmdPlayer1DetailsChart.destroy();
		// clear details
		$('#nmd-player1-details-container').html('');
	})

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

window.nmdDisplayPlayer1DetailsChart = function () {
	const ctx = document.getElementById('nmd-player1-details-canvas').getContext('2d');
	nmdPlayer1DetailsChart = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: ['2','3','4','5','6','7','8','9','10','J','Q','K','A'],
			datasets: [
				{
					label: 'Non-Trump',
					data: nmdPlayer1DetailsChartData.non_trump,
					backgroundColor: [
						'rgba(106, 121, 187, 0.5)'
					],
					borderColor: [
						'rgba(106, 121, 187, 0.8)'
					],
					borderWidth: 1
				},
				{
					label: 'Trump',
					data: nmdPlayer1DetailsChartData.trump,
					backgroundColor: [
						'rgba(92, 137, 61, 0.5)'
					],
					borderColor: [
						'rgba(92, 137, 61, 0.8)'
					],
					borderWidth: 1
				}
			]
		},
		options: {
			maintainAspectRatio: false,
			responsive: true,
			plugins: {
				legend: {
					position: 'top',
				},
			},
			scales: {
				y: {
					beginAtZero: true,
					min: 0,
					max: 100,
					type: 'linear',
					ticks: {
						stepSize: 10
					}
				}
			}
		}
	});
}

window.nmdDisplayPlayer1Details = function () {
	/* we also will build the data for chart and store in:
		nmdPlayer1DetailsChartData.trump
		nmdPlayer1DetailsChartData.non_trump
	*/

	// init vars
	var player1_details_html = '';
	var categories = ['non_trump', 'trump'];

	// iterate categories
	for (var category of categories) {
		var category_label = category == 'trump' ? 'Trump' : 'Non-Trump';

		// init html
		player1_details_html += '<p class="mt-4"><strong>Performance with ' + category_label + ' Cards</strong></p>';
		player1_details_html += '<table class="table table-bordered">';
		player1_details_html += '	<thead class="thead-light">';
		player1_details_html += '		<tr>';
		player1_details_html += '			<th scope="column" class="w-25 bg-white border-top-0 border-left-0"></th>';
		player1_details_html += '			<th scope="column" class="w-25 text-center">Wins</th>';
		player1_details_html += '			<th scope="column" class="w-25 text-center">Losses</th>';
		player1_details_html += '			<th scope="column" class="w-25 text-center">Win&nbsp;Rate</th>';
		player1_details_html += '		</tr>';
		player1_details_html += '	</thead>';
		player1_details_html += '	<tbody>';


		$.each(nmdCardgamesResults.player_1_details[category], function(value, details) {
			switch (value) {
				case '11':
					value = 'J';
					break;
				case '12':
					value = 'Q';
					break;
				case '13':
					value = 'K';
					break;
				case '14':
					value = 'A';
					break;
				default:
					value = value;
			}
			var wins_and_losses = parseInt(details.wins) + parseInt(details.losses);
			if (wins_and_losses > 0) {
				var win_rate_raw = ((100 * parseInt(details.wins)) / wins_and_losses).toFixed(0);
				var win_rate = ((100 * parseInt(details.wins)) / wins_and_losses).toFixed(0) + '%';
			} else {
				var win_rate_raw = 0;
				var win_rate = '--';
			}

			// add rows to html
			player1_details_html += '		<tr>';
			player1_details_html += '			<th scope="row" class="bg-light text-center">' + value + '</th>';
			player1_details_html += '			<td class="text-right">' + details.wins + '</td>';
			player1_details_html += '			<td class="text-right">' + details.losses + '</td>';
			player1_details_html += '			<td class="text-right">' + win_rate + '</td>';
			player1_details_html += '		</tr>';

			// add data for chartjs
			nmdPlayer1DetailsChartData[category].push(win_rate_raw);
		});

		// finish html
		player1_details_html += '	</tbody>';
		player1_details_html += '</table>';
	}

	// update dom element
	$('#nmd-player1-details-container').html(player1_details_html);
}

window.nmdCalculateWinner = function () {
	nmdCardgamesResults.hands_count++;
	nmdCardgamesResults.winning_player = 'player_1';
	var winning_card = nmdCardgamesResults.player_cards['player_1'];

	// record if the player1 has a trump card
	if (winning_card['suit_code'] == nmdCardgamesGlobals.trump_card['suit_code']) {
		nmdCardgamesResults.player_tricks['player_1']['hands_with_trump']++;
	}

	// update counter of hands
	nmdCardgamesGlobals.handsPlayed++;

	// iterate players and find winner
	for (var j = 2; j <= nmdCardgamesGlobals.seats; j++) {
		// get player card from global
		var player = 'player_' + j;
		var player_card = nmdCardgamesResults.player_cards[player];

		// record if the player has a trump card
		if (player_card['suit_code'] == nmdCardgamesGlobals.trump_card['suit_code']) {
			nmdCardgamesResults.player_tricks[player]['hands_with_trump']++;
		}

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
	// record player 1 details
	if (nmdCardgamesResults.winning_player == 'player_1') {
		if (winning_card['suit_code'] == nmdCardgamesGlobals.trump_card['suit_code']) {
			nmdCardgamesResults.player_1_details['trump'][nmdCardgamesResults.player_cards['player_1']['value']]['wins']++;
		} else {
			nmdCardgamesResults.player_1_details['non_trump'][nmdCardgamesResults.player_cards['player_1']['value']]['wins']++;
		}
	} else {
		if (nmdCardgamesResults.player_cards['player_1']['suit_code'] == nmdCardgamesGlobals.trump_card['suit_code']) {
			nmdCardgamesResults.player_1_details['trump'][nmdCardgamesResults.player_cards['player_1']['value']]['losses']++;
		} else {
			nmdCardgamesResults.player_1_details['non_trump'][nmdCardgamesResults.player_cards['player_1']['value']]['losses']++;
		}
	}
}

window.nmdUpdateResultsDisplay = function () {
	// highlight winning card
	$('#nmd-seat-'+nmdCardgamesResults.winning_player).addClass('nmd-winning-card')
	$('#nmd-seat-'+nmdCardgamesResults.winning_player+' .nmd-playing-card-winner_notice').removeClass('d-none');

	// update stats display
	$('#nmd_results_winner').text(nmdCardgamesResults.winning_player);
	$('#nmd_results_winner').text($('#nmd-seat-column-'+nmdCardgamesResults.winning_player+' .nmd-player-name').text());
	$('.nmd_results_hands_count').text(nmdCardgamesResults.hands_count);

	// update player stats
	for (var j = 1; j <= nmdCardgamesGlobals.seats; j++) {
		// calculate
		var wins = nmdCardgamesResults.player_tricks['player_'+j]['total'];
		var wins_percent = (100 * wins) / nmdCardgamesResults.hands_count;

		var hands_with_trump = nmdCardgamesResults.player_tricks['player_'+j]['hands_with_trump'];
		var wins_with_trump = nmdCardgamesResults.player_tricks['player_'+j]['with_trump'];
		if (hands_with_trump > 0 && wins_with_trump > 0) {
			var wins_with_trump_percent = (100 * wins_with_trump) / hands_with_trump;			
		} else {
			var wins_with_trump_percent = 0;
		}

		var hands_without_trump = nmdCardgamesResults.hands_count - hands_with_trump;
		var wins_without_trump = nmdCardgamesResults.player_tricks['player_'+j]['without_trump'];
		if (hands_without_trump > 0 && wins_without_trump > 0) {
			var wins_without_trump_percent = (100 * wins_without_trump) / hands_without_trump;
		} else {
			var wins_without_trump_percent = 0;
		}

		// build display strings
		var win_rate_extra_class = j == 1 ? 'text-primary' : '';
		var display_string_wins = 'wins: <span class="float-right">' + wins + '</span><br><span class="' + win_rate_extra_class + '">win&nbsp;rate: </span><span class="nmd_results_percent_without_decimals float-right ' + win_rate_extra_class + (nmdCardgamesGlobals.display_percent_decimals ? ' d-none' : '') + '">' +  wins_percent.toFixed(0) + '%</span>' + '<span class="nmd_results_percent_with_decimals float-right ' + win_rate_extra_class + (!nmdCardgamesGlobals.display_percent_decimals ? ' d-none' : '')  + '">' + wins_percent.toFixed(2) + '%</span>';
		var display_string_wins_with_trump = 'hands:<span class="float-right">' + hands_with_trump + '</span><br>wins:<span class="float-right">' + wins_with_trump + '</span><br><span class="' + win_rate_extra_class + '">win&nbsp;rate: </span><span class="nmd_results_percent_without_decimals float-right ' + win_rate_extra_class + (nmdCardgamesGlobals.display_percent_decimals ? ' d-none' : '') + '">' +  wins_with_trump_percent.toFixed(0) + '%</span>' + '<span class="nmd_results_percent_with_decimals float-right ' + win_rate_extra_class + (!nmdCardgamesGlobals.display_percent_decimals ? ' d-none' : '')  + '">' + wins_with_trump_percent.toFixed(2) + '%</span>';
		var display_string_wins_without_trump = 'hands:<span class="float-right">' + hands_without_trump + '</span><br>wins:<span class="float-right">' + wins_without_trump + '</span><br><span class="' + win_rate_extra_class + '">win&nbsp;rate: </span><span class="nmd_results_percent_without_decimals float-right ' + win_rate_extra_class + (nmdCardgamesGlobals.display_percent_decimals ? ' d-none' : '') + '">' +  wins_without_trump_percent.toFixed(0) + '%</span>' + '<span class="nmd_results_percent_with_decimals float-right ' + win_rate_extra_class + (!nmdCardgamesGlobals.display_percent_decimals ? ' d-none' : '')  + '">' + wins_without_trump_percent.toFixed(2) + '%</span>';

		// update DOM elements
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
		// set button states
		$('#nmd-autoplay-button').text('Stop').removeClass('btn-primary').addClass('btn-danger');
		$('#nmd-playone-button').prop('disabled', true);
		$('#nmd-number-of-players-select').prop('disabled', true);
		$('#nmd-go-button').prop('disabled', false);
		// start autoplay
		nmdCardgamesGlobals.auto_play_interval = setInterval(nmdPlayHand, 1);
	} else {
		// update global var
		nmdCardgamesGlobals.auto_play_state = 'stopped'
		// set button states
		$('#nmd-autoplay-button').text('Auto-Play').removeClass('btn-danger').addClass('btn-primary');
		$('#nmd-playone-button').prop('disabled', false);
		$('#nmd-number-of-players-select').prop('disabled', false);
		// stop autoplay
		nmdCardgamesGlobals.auto_play_interval = clearInterval(nmdCardgamesGlobals.auto_play_interval);
	}
}

window.nmdPlayHand = function () {
	if (nmdCardgamesGlobals.seats == 0) {
		alert('Please choose the number of players');
		return;
	}

	// hide player 1 details
	$('#nmd-player1-details').collapse('hide');

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
	$('#nmd-go-button').prop('disabled', false);
	$('.nmd-playing-card').removeClass('nmd-winning-card')
}

window.nmdInitStatistics = function () {
	nmdCardgamesResults.hands_count = 0;
	nmdCardgamesResults.winning_player = null;
	nmdCardgamesResults.player_tricks =	{
											'player_1': {'total':0, 'with_trump':0, 'without_trump':0, 'hands_with_trump':0},
											'player_2': {'total':0, 'with_trump':0, 'without_trump':0, 'hands_with_trump':0},
											'player_3': {'total':0, 'with_trump':0, 'without_trump':0, 'hands_with_trump':0},
											'player_4': {'total':0, 'with_trump':0, 'without_trump':0, 'hands_with_trump':0},
											'player_5': {'total':0, 'with_trump':0, 'without_trump':0, 'hands_with_trump':0}
										};
	nmdCardgamesResults.player_1_details =	{
												'trump':		{'2':{'wins':0, 'losses':0}, '3':{'wins':0, 'losses':0}, '4':{'wins':0, 'losses':0}, '5':{'wins':0, 'losses':0}, '6':{'wins':0, 'losses':0}, '7':{'wins':0, 'losses':0}, '8':{'wins':0, 'losses':0}, '9':{'wins':0, 'losses':0}, '10':{'wins':0, 'losses':0}, '11':{'wins':0, 'losses':0}, '12':{'wins':0, 'losses':0}, '13':{'wins':0, 'losses':0}, '14':{'wins':0, 'losses':0}},
												'non_trump':	{'2':{'wins':0, 'losses':0}, '3':{'wins':0, 'losses':0}, '4':{'wins':0, 'losses':0}, '5':{'wins':0, 'losses':0}, '6':{'wins':0, 'losses':0}, '7':{'wins':0, 'losses':0}, '8':{'wins':0, 'losses':0}, '9':{'wins':0, 'losses':0}, '10':{'wins':0, 'losses':0}, '11':{'wins':0, 'losses':0}, '12':{'wins':0, 'losses':0}, '13':{'wins':0, 'losses':0}, '14':{'wins':0, 'losses':0}}
											};
}


window.nmdResetOutputDisplay = function () {
	$('#nmd-number-of-players-select').prop('disabled', false);
	$('#nmd-go-button').prop('disabled', true);
	$('#nmd-playone-button').prop('disabled', false);
	$('#nmd-go-button').prop('disabled', true);
	for (var i = 1; i <= 5; i++) {
		$('#nmd_results_player_'+i+'_wins').text('');
		$('#nmd_results_player_'+i+'_wins_with_trump').text('');
		$('#nmd_results_player_'+i+'_wins_without_trump').text('');
		$('.nmd_results_hands_count').text('');
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


window.nmdScrollToDomElement = function (element_id) {
$('html, body').animate({
	scrollTop: $(element_id).offset().top
}, 1000);

	//$(element_id).get(0).scrollIntoView();
}

function shuffleFisherYates(array) {
	let i = array.length;
	while (i--) {
		const ri = Math.floor(Math.random() * i);
		[array[i], array[ri]] = [array[ri], array[i]];
	}
	return array;
}
