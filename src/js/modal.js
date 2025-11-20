//!-------------- Modal Elements --------------

const pvpGameModal = document.getElementById('pvpGameModal')
const botGameModal = document.getElementById('botGameModal')
const checkmateModal = document.getElementById('checkmateModal')

const confirmPvPButton = document.getElementById('confirmPvPButton')
const cancelPvPButton = document.getElementById('cancelPvPButton')

const confirmBotButton = document.getElementById('confirmBotButton')
const cancelBotButton = document.getElementById('cancelBotButton')

const winnerNameElement = document.getElementById('winnerName')
const playAgainButton = document.getElementById('playAgainButton')

const rulesModal = document.getElementById('rulesModal')
const closeRulesButton = document.getElementById('closeRulesButton')

//!--------------  Utility --------------

function hideModal(modal) {
	modal.classList.remove('show')
}

function newGame(mode) {
	const modal = mode === 'pvb' ? botGameModal : pvpGameModal
	modal.classList.add('show')
}

//!--------------  PvP Modal --------------

document.getElementById('pvpClassicButton').addEventListener('click', () => {
	hideModal(pvpGameModal)
	game.start('pvp', 'classic')
})

document.getElementById('pvpElementalButton').addEventListener('click', () => {
	hideModal(pvpGameModal)
	game.start('pvp', 'elemental')
})

cancelPvPButton.addEventListener('click', () => {
	hideModal(pvpGameModal)
})

//!--------------  Bot Modal --------------

document.getElementById('botClassicButton').addEventListener('click', () => {
	hideModal(botGameModal)
	game.start('pvb', 'classic')
})

document.getElementById('botElementalButton').addEventListener('click', () => {
	hideModal(botGameModal)
	game.start('pvb', 'elemental')
})

cancelBotButton.addEventListener('click', () => {
	hideModal(botGameModal)
})

//!--------------  Checkmate Modal --------------

function showCheckmateModal(winner) {
	winnerNameElement.textContent = winner
	checkmateModal.classList.add('show')
}

function hideCheckmateModal() {
	hideModal(checkmateModal)
}

playAgainButton.addEventListener('click', () => {
	hideCheckmateModal()
	game.start()
})

//!--------------  Rules Modal --------------

function openRules() {
	rulesModal.classList.add('show')
}

closeRulesButton.addEventListener('click', () => {
	hideModal(rulesModal)
})
