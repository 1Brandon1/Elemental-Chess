// Bot AI class implementing a minimax chess engine with alpha-beta pruning
class Bot {
	constructor(game, colour, depth = 3) {
		this.game = game // Reference to the main game object
		this.colour = colour // Bot's colour ('white' or 'black')
		this.depth = depth // Depth of minimax search

		// prettier-ignore
		// Piece values for evaluation (material score)
		this.pieceValues = {
			p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
			// Custom elemental pieces
			f: 450, w: 450, e: 550, a: 500
		}

		// Piece-Square Tables (PST) for positional evaluation
		// Indexed by piece type; row 0 = a8, row 7 = a1
		this.PST = {
			p: [
				[0, 0, 0, 0, 0, 0, 0, 0],
				[50, 50, 50, 50, 50, 50, 50, 50],
				[10, 10, 20, 30, 30, 20, 10, 10],
				[5, 5, 10, 25, 25, 10, 5, 5],
				[0, 0, 0, 20, 20, 0, 0, 0],
				[5, -5, -10, 0, 0, -10, -5, 5],
				[5, 10, 10, -20, -20, 10, 10, 5],
				[0, 0, 0, 0, 0, 0, 0, 0]
			],
			n: [
				[-50, -40, -30, -30, -30, -30, -40, -50],
				[-40, -20, 0, 0, 0, 0, -20, -40],
				[-30, 0, 10, 15, 15, 10, 0, -30],
				[-30, 5, 15, 20, 20, 15, 5, -30],
				[-30, 0, 15, 20, 20, 15, 0, -30],
				[-30, 5, 10, 15, 15, 10, 5, -30],
				[-40, -20, 0, 5, 5, 0, -20, -40],
				[-50, -40, -30, -30, -30, -30, -40, -50]
			],
			b: [
				[-20, -10, -10, -10, -10, -10, -10, -20],
				[-10, 0, 0, 0, 0, 0, 0, -10],
				[-10, 0, 5, 10, 10, 5, 0, -10],
				[-10, 5, 5, 10, 10, 5, 5, -10],
				[-10, 0, 10, 10, 10, 10, 0, -10],
				[-10, 10, 10, 10, 10, 10, 10, -10],
				[-10, 5, 0, 0, 0, 0, 5, -10],
				[-20, -10, -10, -10, -10, -10, -10, -20]
			],
			r: [
				[0, 0, 5, 10, 10, 5, 0, 0],
				[0, 0, 5, 10, 10, 5, 0, 0],
				[0, 0, 5, 10, 10, 5, 0, 0],
				[0, 0, 5, 10, 10, 5, 0, 0],
				[0, 0, 5, 10, 10, 5, 0, 0],
				[0, 0, 5, 10, 10, 5, 0, 0],
				[25, 25, 25, 25, 25, 25, 25, 25],
				[0, 0, 5, 10, 10, 5, 0, 0]
			],
			q: [
				[-20, -10, -10, -5, -5, -10, -10, -20],
				[-10, 0, 0, 0, 0, 0, 0, -10],
				[-10, 0, 5, 5, 5, 5, 0, -10],
				[-5, 0, 5, 10, 10, 5, 0, -5],
				[0, 0, 5, 10, 10, 5, 0, -5],
				[-10, 0, 5, 5, 5, 5, 0, -10],
				[-10, 0, 0, 0, 0, 0, 0, -10],
				[-20, -10, -10, -5, -5, -10, -10, -20]
			],
			k: [
				[-40, -40, -35, -35, -35, -35, -40, -40],
				[-30, -30, -25, -25, -25, -25, -30, -30],
				[-30, -25, -10, -10, -10, -10, -25, -30],
				[-30, -25, -5, -5, -5, -5, -25, -30],
				[-25, -20, 0, 0, 0, 0, -20, -25],
				[-20, -15, 0, 5, 5, 0, -15, -20],
				[-5, -5, 0, 0, 0, 0, -5, -5],
				[-15, 0, -10, -15, -15, -10, 0, -15]
			],
			// Custom elemental pieces
			f: [
				[-40, -30, -20, -10, -10, -20, -30, -40],
				[-30, -10, 5, 10, 10, 5, -10, -30],
				[-20, 5, 20, 25, 25, 20, 5, -20],
				[-10, 10, 25, 30, 30, 25, 10, -10],
				[-10, 10, 25, 30, 30, 25, 10, -10],
				[-20, 5, 20, 25, 25, 20, 5, -20],
				[-30, -10, 5, 10, 10, 5, -10, -30],
				[-40, -30, -20, -10, -10, -20, -30, -40]
			],
			w: [
				[0, 0, 5, 10, 10, 5, 0, 0],
				[5, 10, 15, 10, 10, 15, 10, 5],
				[0, 5, 10, 15, 15, 10, 5, 0],
				[0, 0, 5, 15, 15, 5, 0, 0],
				[0, 0, 5, 15, 15, 5, 0, 0],
				[0, 5, 10, 15, 15, 10, 5, 0],
				[5, 10, 15, 10, 10, 15, 10, 5],
				[0, 0, 5, 10, 10, 5, 0, 0]
			],
			e: [
				[-20, -10, -5, 0, 0, -5, -10, -20],
				[-10, 0, 5, 10, 10, 5, 0, -10],
				[-5, 5, 10, 20, 20, 10, 5, -5],
				[0, 10, 20, 25, 25, 20, 10, 0],
				[0, 10, 20, 25, 25, 20, 10, 0],
				[-5, 5, 10, 20, 20, 10, 5, -5],
				[-10, 0, 5, 10, 10, 5, 0, -10],
				[-20, -10, -5, 0, 0, -5, -10, -20]
			],
			a: [
				[-20, -10, -5, 0, 0, -5, -10, -20],
				[-10, 0, 5, 10, 10, 5, 0, -10],
				[-5, 5, 10, 15, 15, 10, 5, -5],
				[0, 10, 15, 20, 20, 15, 10, 0],
				[0, 10, 15, 20, 20, 15, 10, 0],
				[-5, 5, 10, 15, 15, 10, 5, -5],
				[-10, 0, 5, 10, 10, 5, 0, -10],
				[-20, -10, -5, 0, 0, -5, -10, -20]
			]
		}
	}

	//!-------------- Public API --------------

	// Choose and execute the best move for the bot
	makeBestMove() {
		if (this.game.activePlayer !== this.colour || this.game.gameOver) return

		// Create a safe copy of the game to simulate moves
		const gameCopy = new GameCopy(this.game)
		const moves = gameCopy.generateMoves(this.colour)
		if (!moves.length) return

		let bestMove = moves[0]
		let bestEval = -Infinity

		// Evaluate each move using minimax
		for (const move of moves) {
			gameCopy.makeMove(move)
			const evalScore = this.minimax(gameCopy, this.depth - 1, -Infinity, Infinity, false)
			gameCopy.undoMove()

			if (evalScore > bestEval) {
				bestEval = evalScore
				bestMove = move
			}
		}

		// Execute the chosen move in the real game
		this.game.executeMove(bestMove.from, bestMove.to, this.game.board.getPieceFromCoord(bestMove.from))
	}

	//!-------------- Minimax with Alpha-Beta Pruning --------------

	// Recursive minimax function with alpha-beta pruning
	minimax(gameState, depth, alpha, beta, maximizing) {
		if (depth === 0 || gameState.isGameOver()) {
			return this.evaluate(gameState) // Evaluate leaf nodes
		}

		const colour = maximizing ? this.colour : gameState.getOpponentColour(this.colour)
		const moves = gameState.generateMoves(colour)
		if (!moves.length) return this.evaluate(gameState)

		if (maximizing) {
			let maxEval = -Infinity
			for (const move of moves) {
				gameState.makeMove(move)
				const evalScore = this.minimax(gameState, depth - 1, alpha, beta, false)
				gameState.undoMove()

				maxEval = Math.max(maxEval, evalScore)
				alpha = Math.max(alpha, evalScore)
				if (beta <= alpha) break // prune branch
			}
			return maxEval
		} else {
			let minEval = Infinity
			for (const move of moves) {
				gameState.makeMove(move)
				const evalScore = this.minimax(gameState, depth - 1, alpha, beta, true)
				gameState.undoMove()

				minEval = Math.min(minEval, evalScore)
				beta = Math.min(beta, evalScore)
				if (beta <= alpha) break // prune branch
			}
			return minEval
		}
	}

	//!-------------- Evaluation Function (Material + PST) --------------

	// Evaluate a board state based on material and positional values
	evaluate(gameState) {
		const board = gameState.boardArray120
		let score = 0

		for (let i = 0; i < 120; i++) {
			const piece = board[i]
			if (!Bot.isValidPiece(piece)) continue

			const pieceType = piece.toLowerCase()
			const value = this.pieceValues[pieceType] || 0
			const pst = this.getPSTValue(piece, i)
			const isBotPiece = this.isBotsPiece(piece)

			const total = value + pst
			score += isBotPiece ? total : -total
		}

		return score
	}

	// Get positional bonus from PST for a piece at index120
	getPSTValue(pieceChar, index120) {
		if (!pieceChar) return 0
		const typ = pieceChar.toLowerCase()
		const table = this.PST[typ]
		if (!table) return 0

		const idx64 = Chessboard.MAILBOX120[index120]
		if (idx64 === undefined || idx64 < 0 || idx64 > 63) return 0

		const rank = Math.floor(idx64 / 8)
		const file = idx64 % 8

		// Uppercase = white, lowercase = black (flip vertically)
		if (pieceChar === pieceChar.toUpperCase()) return table[rank][file] || 0
		return table[7 - rank][file] || 0
	}

	// Check if piece belongs to the bot
	isBotsPiece(piece) {
		if (!Bot.isValidPiece(piece)) return false
		return this.colour === 'white' ? piece === piece.toUpperCase() : piece === piece.toLowerCase()
	}

	// STATIC SAFETY UTIL: validate piece character
	static isValidPiece(piece) {
		return typeof piece === 'string' && piece.length === 1 && /[prnbqkafwe]/i.test(piece)
	}
}

// Safe minimal copy of game state for simulation
class GameCopy {
	constructor(game) {
		this.originalGame = game
		// Clone essential game state
		this.boardArray120 = [...game.board.boardArray120]
		this.activePlayer = game.activePlayer
		this.enPassantIndex = game.enPassantIndex
		this.castlingRights = structuredClone(game.castlingRights)
	}

	//!-------------- Helpers --------------

	// Return opponent colour
	getOpponentColour(colour) {
		return colour === 'white' ? 'black' : 'white'
	}

	//!-------------- Move Generation --------------

	// Generate all legal moves for a given colour
	generateMoves(colour) {
		const moves = []
		for (let i = 21; i <= 98; i++) {
			const piece = this.boardArray120[i]
			if (!Bot.isValidPiece(piece)) continue
			if (Chessboard.getPieceColour(piece) !== colour) continue

			const fromCoord = Chessboard.index120ToCoord(i)
			let legalMoves = []
			try {
				legalMoves = this.originalGame.calculateValidMoves(piece, i)
			} catch {
				continue
			}

			for (const dest120 of legalMoves) {
				moves.push({
					from: fromCoord,
					to: Chessboard.index120ToCoord(dest120),
					piece
				})
			}
		}
		return moves
	}

	//!-------------- Move Execution --------------

	// Make a move on the copied board
	makeMove(move) {
		const fromIndex = Chessboard.coordToIndex120(move.from)
		const toIndex = Chessboard.coordToIndex120(move.to)

		// Backup current state for undo
		this._backup = {
			board: [...this.boardArray120],
			activePlayer: this.activePlayer,
			enPassantIndex: this.enPassantIndex,
			castlingRights: structuredClone(this.castlingRights)
		}

		// Execute move (no special moves considered)
		this.boardArray120[toIndex] = this.boardArray120[fromIndex]
		this.boardArray120[fromIndex] = ''

		// Swap active player
		this.activePlayer = this.activePlayer === 'white' ? 'black' : 'white'
	}

	// Undo last move
	undoMove() {
		if (!this._backup) return
		this.boardArray120 = this._backup.board
		this.activePlayer = this._backup.activePlayer
		this.enPassantIndex = this._backup.enPassantIndex
		this.castlingRights = this._backup.castlingRights
	}

	//!-------------- Game Over Check --------------

	// Check if current player has any legal moves
	isGameOver() {
		const moves = this.generateMoves(this.activePlayer)
		return moves.length === 0 // true if checkmate or stalemate
	}
}
