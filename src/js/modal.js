// ============================================================
// Modals: Utility Helpers
// ============================================================
const $ = (sel) => document.getElementById(sel)

const modals = {
	pvp: $('pvpGameModal'),
	pvb: $('botGameModal'),
	checkmate: $('checkmateModal'),
	rules: $('rulesModal')
}

const buttons = {
	cancelPvP: $('cancelPvPButton'),
	cancelBot: $('cancelBotButton'),
	playAgain: $('playAgainButton'),
	closeRules: $('closeRulesButton')
}

const winnerName = $('winnerName')

function showModal(modal) {
	modal.classList.add('show')
}

function hideModal(modal) {
	modal.classList.remove('show')
}

function openNewGameModal(mode) {
	showModal(mode === 'pvb' ? modals.pvb : modals.pvp)
}

// ============================================================
// PvP Game Selection
// ============================================================
$('pvpClassicButton').addEventListener('click', () => {
	hideModal(modals.pvp)
	game.start('pvp', 'classic')
})

$('pvpElementalButton').addEventListener('click', () => {
	hideModal(modals.pvp)
	game.start('pvp', 'elemental')
})

buttons.cancelPvP.addEventListener('click', () => hideModal(modals.pvp))

// ============================================================
// PvB Game Selection
// ============================================================
$('botClassicButton').addEventListener('click', () => {
	hideModal(modals.pvb)
	game.start('pvb', 'classic')
})

$('botElementalButton').addEventListener('click', () => {
	hideModal(modals.pvb)
	game.start('pvb', 'elemental')
})

buttons.cancelBot.addEventListener('click', () => hideModal(modals.pvb))

// ============================================================
// Checkmate Modal
// ============================================================
function showCheckmateModal(winner) {
	winnerName.textContent = winner
	showModal(modals.checkmate)
}

function hideCheckmateModal() {
	hideModal(modals.checkmate)
}

buttons.playAgain.addEventListener('click', () => {
	hideCheckmateModal()
	game.start(game.gameMode, game.gameType)
})

// ============================================================
// Rules Modal
// ============================================================
function openRules() {
	showModal(modals.rules)
}

buttons.closeRules.addEventListener('click', () => hideModal(modals.rules))
