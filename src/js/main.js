const game = new Game()

game.start('pvp', 'elemental')

document.addEventListener('keydown', (event) => {
	switch (event.key) {
		case 'ArrowLeft':
			game.undoMove()
			break
		case 'ArrowRight':
			game.redoMove()
			break
		case 'f':
			game.board.flip()
			break
		case 'n':
			newGame(game.gameType)
			break
	}
})
