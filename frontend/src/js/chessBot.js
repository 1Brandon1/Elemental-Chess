class Bot {
	constructor(game, colour, depth = 3) {
		this.game = game
		this.board = this.game.board
		this.boardArray = this.board.boardArray120
		this.colour = colour
		this.depth = depth
		this.pieceValues = {
			p: 1,
			n: 3,
			b: 3,
			r: 5,
			q: 9,
			f: 5,
			w: 7,
			e: 5,
			a: 9,
			k: Infinity
		}
		this.positionBonus = {
			p: [
				[0, 0, 0, 0, 0, 0, 0, 0],
				[5, 5, 5, 5, 5, 5, 5, 5],
				[1, 1, 2, 3, 3, 2, 1, 1],
				[0.5, 0.5, 1, 2.5, 2.5, 1, 0.5, 0.5],
				[0, 0, 0, 2, 2, 0, 0, 0],
				[0.5, -0.5, -1, 0, 0, -1, -0.5, 0.5],
				[0.5, 1, 1, -2, -2, 1, 1, 0.5],
				[0, 0, 0, 0, 0, 0, 0, 0]
			],
			n: [
				[-5, -4, -3, -3, -3, -3, -4, -5],
				[-4, -2, 0, 0, 0, 0, -2, -4],
				[-3, 0, 1, 1.5, 1.5, 1, 0, -3],
				[-3, 0.5, 1.5, 2, 2, 1.5, 0.5, -3],
				[-3, 0, 1.5, 2, 2, 1.5, 0, -3],
				[-3, 0.5, 1, 1.5, 1.5, 1, 0.5, -3],
				[-4, -2, 0, 0.5, 0.5, 0, -2, -4],
				[-5, -4, -3, -3, -3, -3, -4, -5]
			],
			b: [
				[-2, -1, -1, -1, -1, -1, -1, -2],
				[-1, 0, 0, 0, 0, 0, 0, -1],
				[-1, 0, 0.5, 1, 1, 0.5, 0, -1],
				[-1, 0.5, 0.5, 1, 1, 0.5, 0.5, -1],
				[-1, 0, 1, 1, 1, 1, 0, -1],
				[-1, 1, 1, 1, 1, 1, 1, -1],
				[-1, 0.5, 0, 0, 0, 0, 0.5, -1],
				[-2, -1, -1, -1, -1, -1, -1, -2]
			],
			r: [
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0.5, 1, 1, 1, 1, 1, 1, 0.5],
				[-0.5, 0, 0, 0, 0, 0, 0, -0.5],
				[-0.5, 0, 0, 0, 0, 0, 0, -0.5],
				[-0.5, 0, 0, 0, 0, 0, 0, -0.5],
				[-0.5, 0, 0, 0, 0, 0, 0, -0.5],
				[-0.5, 0, 0, 0, 0, 0, 0, -0.5],
				[0, 0, 0, 0.5, 0.5, 0, 0, 0]
			],
			q: [
				[-2, -1, -1, -0.5, -0.5, -1, -1, -2],
				[-1, 0, 0, 0, 0, 0, 0, -1],
				[-1, 0, 0.5, 0.5, 0.5, 0.5, 0, -1],
				[-0.5, 0, 0.5, 0.5, 0.5, 0.5, 0, -0.5],
				[0, 0, 0.5, 0.5, 0.5, 0.5, 0, -0.5],
				[-1, 0.5, 0.5, 0.5, 0.5, 0.5, 0, -1],
				[-1, 0, 0.5, 0, 0, 0, 0, -1],
				[-2, -1, -1, -0.5, -0.5, -1, -1, -2]
			],
			k: [
				[-3, -4, -4, -5, -5, -4, -4, -3],
				[-3, -4, -4, -5, -5, -4, -4, -3],
				[-3, -4, -4, -5, -5, -4, -4, -3],
				[-3, -4, -4, -5, -5, -4, -4, -3],
				[-2, -3, -3, -4, -4, -3, -3, -2],
				[-1, -2, -2, -2, -2, -2, -2, -1],
				[2, 2, 0, 0, 0, 0, 2, 2],
				[2, 3, 1, 0, 0, 1, 3, 2]
			]
		}
	}

	makeBestMove() {
		if (this.game.activePlayer === this.colour && !this.game.gameOver) {
			let bestMove = null
			let bestScore = -Infinity
			const allMoves = this.game.calculateAllMoves(this.colour)

			allMoves.forEach((move) => {
				const simulatedBoard = this.simulateMoveOnBoard(this.boardArray, move)
				const score = this.minimax(simulatedBoard, this.depth - 1, -Infinity, Infinity, false)
				if (score > bestScore) {
					bestScore = score
					bestMove = move
				}
			})

			// Execute the best move found or a random move if none
			const moveToMake = bestMove || allMoves[Math.floor(Math.random() * allMoves.length)]
			this.board.move(moveToMake[0], moveToMake[1])
		}
	}

	minimax(board, depth, alpha, beta, isMaximizingPlayer) {
		if (depth === 0 || this.isGameOver(board)) {
			return this.evaluateBoard(board)
		}

		const allMoves = this.game.calculateAllMoves(isMaximizingPlayer ? this.colour : this.getOpponentColour())
		let bestEval = isMaximizingPlayer ? -Infinity : Infinity

		for (const move of allMoves) {
			const simulatedBoard = this.simulateMoveOnBoard(board, move)
			const evaluate = this.minimax(simulatedBoard, depth - 1, alpha, beta, !isMaximizingPlayer)
			bestEval = isMaximizingPlayer ? Math.max(bestEval, evaluate) : Math.min(bestEval, evaluate)
			if (isMaximizingPlayer) alpha = Math.max(alpha, evaluate)
			else beta = Math.min(beta, evaluate)
			if (beta <= alpha) break
		}
		return bestEval
	}

	simulateMoveOnBoard(originalBoard, move) {
		const newBoard = [...originalBoard]
		const [fromCoord, toCoord] = move
		const fromIndex = this.board.coordinateToIndex120(fromCoord)
		const toIndex = this.board.coordinateToIndex120(toCoord)
		newBoard[toIndex] = newBoard[fromIndex]
		newBoard[fromIndex] = ''
		return newBoard
	}

	evaluateBoard(board) {
		let score = 0

		for (let i = 0; i < board.length; i++) {
			const piece = board[i]
			if (piece && /^[prnbqfweaPRNBQFWEAkK]+$/.test(piece)) {
				const pieceValue = this.getPieceValue(piece)
				const positionValue = this.getPositionValue(piece, i)
				score += this.isBotPiece(piece) ? pieceValue + positionValue : -(pieceValue + positionValue)
			}
		}

		score += this.evaluateKingSafety(board)
		return score
	}

	getPositionValue(piece, index) {
		const pieceType = piece.toLowerCase()
		const rank = Math.floor(index / 10)
		const bonusTable = this.positionBonus[pieceType]
		// console.log(Array.isArray(bonusTable) ? bonusTable[rank] || 0 : bonusTable)

		return Array.isArray(bonusTable) ? bonusTable[rank] || 0 : bonusTable
	}

	evaluateKingSafety(board) {
		const kingPos = this.findKingPosition(board)
		const threats = this.calculateThreats(board, kingPos)
		return threats > 0 ? -threats * 2 : 0 // Adjust penalty for king threats
	}

	findKingPosition(board) {
		for (let i = 0; i < board.length; i++) {
			if (board[i].toLowerCase() === 'k' && this.isBotPiece(board[i])) {
				return i
			}
		}
		return null
	}

	calculateThreats(board, kingPos) {
		// if (kingPos === null) return 0
		// const opponentMoves = this.game.calculateAllMoves(this.getOpponentColour())
		// return opponentMoves.filter((move) => this.board.coordinateToIndex120(move[1]) === kingPos).length
	}

	getPieceValue(piece) {
		return this.pieceValues[piece.toLowerCase()] || 0
	}

	isBotPiece(piece) {
		return this.colour === 'white' ? piece === piece.toUpperCase() : piece === piece.toLowerCase()
	}

	isGameOver(board) {
		return false // Placeholder for actual game-over logic
	}

	getOpponentColour() {
		return this.colour === 'white' ? 'black' : 'white'
	}
}
