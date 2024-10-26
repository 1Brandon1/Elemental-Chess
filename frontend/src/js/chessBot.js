class Bot {
	constructor(game, colour, depth = 3) {
		this.game = game
		this.board = this.game.board
		this.boardArray = this.board.boardArray120
		this.colour = colour
		this.depth = depth
		this.pieceValues = {
			p: 1, // Pawn
			n: 3, // Knight
			b: 3, // Bishop
			r: 5, // Rook
			q: 9, // Queen
			f: 5, // Fire Mage
			w: 7, // Water Mage
			e: 5, // Earth Golem
			a: 9, // Air Spirit
			k: Infinity // King
		}
	}

	// Make a move using minimax with alpha-beta pruning
	makeBestMove() {
		if (this.game.activePlayer === this.colour && !this.game.gameOver) {
			let bestMove = null
			let bestScore = -Infinity
			const allMoves = this.game.calculateAllMoves(this.colour)

			allMoves.forEach((move) => {
				// Simulate the move on a board copy
				const simulatedBoard = this.simulateMoveOnBoard(this.boardArray, move)

				// Run minimax on the simulated board
				const score = this.minimax(simulatedBoard, this.depth - 1, -Infinity, Infinity, false)
				if (score > bestScore) {
					bestScore = score
					bestMove = move
				}
			})

			// Execute the best move found, or a random move if no best move was found
			if (bestMove) {
				this.board.move(bestMove[0], bestMove[1])
			} else {
				// Select a random move
				const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)]
				this.board.move(randomMove[0], randomMove[1])
			}
		}
	}

	// Minimax function with alpha-beta pruning
	minimax(board, depth, alpha, beta, isMaximizingPlayer) {
		if (depth === 0 || this.isGameOver(board)) {
			return this.evaluateBoard(board)
		}

		const allMoves = this.game.calculateAllMoves(isMaximizingPlayer ? this.colour : this.getOpponentColour())

		if (isMaximizingPlayer) {
			let maxEval = -Infinity
			for (let move of allMoves) {
				const simulatedBoard = this.simulateMoveOnBoard(board, move)
				const evaluate = this.minimax(simulatedBoard, depth - 1, alpha, beta, false)
				maxEval = Math.max(maxEval, evaluate)
				alpha = Math.max(alpha, evaluate)
				if (beta <= alpha) break
			}
			return maxEval
		} else {
			let minEval = Infinity
			for (let move of allMoves) {
				const simulatedBoard = this.simulateMoveOnBoard(board, move)
				const evaluate = this.minimax(simulatedBoard, depth - 1, alpha, beta, true)
				minEval = Math.min(minEval, evaluate)
				beta = Math.min(beta, evaluate)
				if (beta <= alpha) break
			}
			return minEval
		}
	}

	// Function to simulate a move on a board array and return the new board state
	simulateMoveOnBoard(originalBoard, move) {
		// Initialize a new board as a plain object
		const newBoard = [...originalBoard]

		const [fromCoord, toCoord] = move

		const fromSquareIndex = this.board.coordinateToIndex120(fromCoord)
		const toSquareIndex = this.board.coordinateToIndex120(toCoord)

		// Move the piece to the new position on the simulated board
		newBoard[toSquareIndex] = newBoard[fromSquareIndex]
		newBoard[fromSquareIndex] = ''
		return newBoard
	}

	evaluateBoard(board) {
		let score = 0
		for (let i = 0; i < board.length; i++) {
			const piece = board[i]
			if (/^[prnbqfweaPRNBQFWEA1-8\/]+$/.test(piece)) {
				const pieceValue = this.getPieceValue(piece)
				score += this.isBotPiece(piece) ? pieceValue : -pieceValue
			}
		}
		return score
	}

	// Get the value of a piece
	getPieceValue(piece) {
		if (piece && typeof piece === 'string') {
			return this.pieceValues[piece.toLowerCase()] || 0
		}
		return 0 // Return 0 if the square is empty or invalid
	}

	// Check if a piece belongs to the bot
	isBotPiece(piece) {
		// Define bot's color by the piece casing or custom rules
		return this.colour === 'white' ? piece === piece.toUpperCase() : piece === piece.toLowerCase()
	}

	// Determine if game is over on the simulated board
	isGameOver(board) {
		// Implement logic to determine if there’s a checkmate, stalemate, or other end condition
		return false // Placeholder
	}

	// Determine the opponent's color
	getOpponentColour() {
		return this.colour === 'white' ? 'black' : 'white'
	}
}
