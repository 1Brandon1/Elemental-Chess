const game = new Game()

game.start('pvp', 'elemental')

//!-------------- Keybind actions --------------
const actions = {
	ArrowLeft: () => game.undoMove(), // Undo move
	ArrowRight: () => game.redoMove(), // Redo move
	f: () => game.board.flip(), // Flip board
	n: () => newGame(game.gameType), // New game
	r: () => openRules(), // Show rules
	t: () => toggleTheme() // Change theme
}

// Key listener
document.addEventListener('keydown', ({ key }) => {
	if (actions[key]) actions[key]()
})
