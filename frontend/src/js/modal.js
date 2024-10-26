//!-------------- New PvP Game Modal --------------

const confirmPvPButton = document.getElementById('confirmPvPButton')
const pvpGameModal = document.getElementById('pvpGameModal')

document.getElementById('confirmPvPButton').addEventListener('click', function () {
	document.getElementById('pvpGameModal').classList.remove('show')
	game.start('pvp')
})

document.getElementById('cancelPvPButton').addEventListener('click', function () {
	document.getElementById('pvpGameModal').classList.remove('show')
})

//!-------------- New Bot Game Modal --------------

const confirmBotButton = document.getElementById('confirmBotButton')
const botGameModal = document.getElementById('botGameModal')

document.getElementById('confirmBotButton').addEventListener('click', function () {
	document.getElementById('botGameModal').classList.remove('show')
	bot = new Bot(game, 'black')
	game.start('bot')
})

document.getElementById('cancelBotButton').addEventListener('click', function () {
	document.getElementById('botGameModal').classList.remove('show')
})

//!-------------- Checkmate Modal --------------

const checkmateModal = document.getElementById('checkmateModal')
const winnerNameElement = document.getElementById('winnerName')
const playAgainButton = document.getElementById('playAgainButton')
const saveGameButton = document.getElementById('saveGameButton')

function showNewGameModal(winner) {
	winnerNameElement.textContent = winner
	checkmateModal.classList.add('show')
}

function showCheckmateModal(winner) {
	winnerNameElement.textContent = winner
	checkmateModal.classList.add('show')
}

// Function to hide the checkmate modal
function hideCheckmateModal() {
	checkmateModal.classList.remove('show')
}

// Event listener for "Play Again" button
playAgainButton.addEventListener('click', function () {
	hideCheckmateModal()
	game.start()
})

// Event listener for "Save Game" button
saveGameButton.addEventListener('click', function () {
	console.log('Game saved')
	hideCheckmateModal()
})
