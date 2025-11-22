//!-------------- Modal Elements --------------
// DOM references for modals and buttons
const pvpGameModal = document.getElementById('pvpGameModal') // PvP game selection modal
const botGameModal = document.getElementById('botGameModal') // PvB (player vs bot) modal
const checkmateModal = document.getElementById('checkmateModal') // End-of-game winner modal

const cancelPvPButton = document.getElementById('cancelPvPButton')
const cancelBotButton = document.getElementById('cancelBotButton')

const winnerNameElement = document.getElementById('winnerName') // Span to display winner's name
const playAgainButton = document.getElementById('playAgainButton')

const rulesModal = document.getElementById('rulesModal') // Game rules modal
const closeRulesButton = document.getElementById('closeRulesButton') // Button to close rules modal

//!--------------  Utility --------------

// Hide any modal by removing the 'show' CSS class
function hideModal(modal) {
	modal.classList.remove('show')
}

// Show the appropriate modal for starting a new game
function newGame(mode) {
	const modal = mode === 'pvb' ? botGameModal : pvpGameModal
	modal.classList.add('show')
}

//!--------------  PvP Modal --------------
// PvP mode selection buttons
document.getElementById('pvpClassicButton').addEventListener('click', () => {
	hideModal(pvpGameModal) // hide selection modal
	game.start('pvp', 'classic') // start classic PvP game
})

document.getElementById('pvpElementalButton').addEventListener('click', () => {
	hideModal(pvpGameModal)
	game.start('pvp', 'elemental') // start elemental PvP game
})

// Cancel PvP selection
cancelPvPButton.addEventListener('click', () => {
	hideModal(pvpGameModal)
})

//!--------------  Bot Modal --------------
// PvB mode selection buttons
document.getElementById('botClassicButton').addEventListener('click', () => {
	hideModal(botGameModal)
	game.start('pvb', 'classic') // start classic PvB game
})

document.getElementById('botElementalButton').addEventListener('click', () => {
	hideModal(botGameModal)
	game.start('pvb', 'elemental') // start elemental PvB game
})

// Cancel PvB selection
cancelBotButton.addEventListener('click', () => {
	hideModal(botGameModal)
})

//!--------------  Checkmate Modal --------------
// Show winner modal with winner's name
function showCheckmateModal(winner) {
	winnerNameElement.textContent = winner
	checkmateModal.classList.add('show')
}

// Hide winner modal
function hideCheckmateModal() {
	hideModal(checkmateModal)
}

// Restart game when 'Play Again' button is clicked
playAgainButton.addEventListener('click', () => {
	hideCheckmateModal()
	game.start(game.gameMode, game.gameType)
})

//!--------------  Rules Modal --------------
// Open the rules modal
function openRules() {
	rulesModal.classList.add('show')
}

// Close rules modal
closeRulesButton.addEventListener('click', () => {
	hideModal(rulesModal)
})
