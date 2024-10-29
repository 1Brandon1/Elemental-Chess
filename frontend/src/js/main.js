const game = new Game()
game.start('pvp')

function newGame(type) {
	if (type === 'bot') {
		document.getElementById('botGameModal').classList.add('show')
	} else {
		document.getElementById('pvpGameModal').classList.add('show')
	}
}

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

const bot = new Bot(game, 'black', 2)

setInterval(() => {
	if (game.activePlayer === bot.colour && !game.gameOver) {
		bot.makeBestMove()
		game.toggleTurn()
	}
}, 1000)
