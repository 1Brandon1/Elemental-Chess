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

//!--------------  Utility --------------

function hideModal(modal) {
	modal.classList.remove('show')
}

//!--------------  PvP Modal --------------

confirmPvPButton.addEventListener('click', () => {
	hideModal(pvpGameModal)
	game.start('pvp')
})

cancelPvPButton.addEventListener('click', () => {
	hideModal(pvpGameModal)
})

//!--------------  Bot Modal --------------

confirmBotButton.addEventListener('click', () => {
	hideModal(botGameModal)
	bot = new Bot(game, 'black')
	game.start('pvb')
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
