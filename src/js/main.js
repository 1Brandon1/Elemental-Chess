// ============================================================
// Game Initialisation
// ============================================================
const game = new Game()
game.start('pvb', 'elemental')

// ============================================================
// Keybind Controls
// ============================================================
const KEY_ACTIONS = {
	ArrowLeft: () => game.undoMove(),
	ArrowRight: () => game.redoMove(),
	f: () => game.board.flip(),
	n: () => openNewGameModal(game.mode),
	r: openRules,
	t: toggleTheme
}

// Key listener
document.addEventListener('keydown', ({ key }) => {
	if (KEY_ACTIONS[key]) KEY_ACTIONS[key]()
})
