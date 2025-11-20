class Bot {
	constructor(game, colour, depth = 3) {
		this.game = game
		this.colour = colour
		this.depth = depth

		// Material count
		this.pieceValues = {
			p: 100,
			n: 320,
			b: 330,
			r: 500,
			q: 900,
			k: 20000,

			// Elemental values
			f: 450, // Fire Mage
			w: 450, // Water Mage
			e: 550, // Earth Golem
			a: 500 // Air Spirit
		}

		// Piece-square tables (row 0 = a8, row 7 = a1)
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
				[-50, -40, -30, -20, -20, -30, -40, -50],
				[-30, -20, -10, 0, 0, -10, -20, -30],
				[-30, -10, 20, 30, 30, 20, -10, -30],
				[-30, -10, 30, 40, 40, 30, -10, -30],
				[-30, -10, 30, 40, 40, 30, -10, -30],
				[-30, -10, 20, 30, 30, 20, -10, -30],
				[-30, -30, 0, 0, 0, 0, -30, -30],
				[-50, -30, -30, -30, -30, -30, -30, -50]
			],
			// Elemental PSTs
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

	makeBestMove() {
		if (this.game.activePlayer !== this.colour || this.game.gameOver) return

		const gameCopy = new GameCopy(this.game)
		const moves = gameCopy.generateMoves(this.colour)

		if (!moves.length) return

		let bestMove = moves[0]
		let bestEval = -Infinity

		for (const move of moves) {
			gameCopy.makeMove(move)
			const evalScore = this.minimax(gameCopy, this.depth - 1, -Infinity, Infinity, false)
			gameCopy.undoMove()

			if (evalScore > bestEval) {
				bestEval = evalScore
				bestMove = move
			}
		}

		// Execute best move in real game
		this.game.executeMove(bestMove.from, bestMove.to, this.game.board.getPieceFromCoordinate(bestMove.from))
	}

	//!-------------- Minimax with Alpha-Beta Pruning --------------

	minimax(gameState, depth, alpha, beta, maximizing) {
		if (depth === 0 || gameState.isGameOver()) {
			return this.evaluate(gameState)
		}

		console.log(depth)
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
				if (beta <= alpha) break
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
				if (beta <= alpha) break
			}

			return minEval
		}
	}

	//!-------------- Evaluation Function (Material + PST) --------------

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

	// Get PST bonus for a piece at index120
	getPSTValue(pieceChar, index120) {
		if (!pieceChar) return 0
		const typ = pieceChar.toLowerCase()
		const table = this.PST[typ]
		if (!table) return 0

		const idx64 = Chessboard.MAILBOX120[index120]
		if (idx64 === undefined || idx64 < 0 || idx64 > 63) return 0

		const rank = Math.floor(idx64 / 8) // 0..7 where 0 = a8
		const file = idx64 % 8

		// white uppercase: table[rank][file]; black lowercase: flip vertically
		if (pieceChar === pieceChar.toUpperCase()) return table[rank][file] || 0
		return table[7 - rank][file] || 0
	}

	isBotsPiece(piece) {
		if (!Bot.isValidPiece(piece)) return false
		return this.colour === 'white' ? piece === piece.toUpperCase() : piece === piece.toLowerCase()
	}

	// STATIC SAFETY UTIL
	static isValidPiece(piece) {
		return typeof piece === 'string' && piece.length === 1 && /[prnbqkafwe]/i.test(piece)
	}
}

class GameCopy {
	constructor(game) {
		this.originalGame = game

		// Copy game state in a minimal safe form
		this.boardArray120 = [...game.board.boardArray120]
		this.activePlayer = game.activePlayer
		this.enPassantIndex = game.enPassantIndex
		this.castlingRights = structuredClone(game.castlingRights)
	}

	//!-------------- Helpers --------------

	coordToIndex(coord) {
		return this.originalGame.board.coordinateToIndex120(coord)
	}

	indexToCoord(index120) {
		return this.originalGame.board.index120ToCoordinate(index120)
	}

	getPieceColour(piece) {
		if (!Bot.isValidPiece(piece)) return null
		return piece === piece.toUpperCase() ? 'white' : 'black'
	}

	getOpponentColour(colour) {
		return colour === 'white' ? 'black' : 'white'
	}

	//!-------------- Move Generation --------------

	generateMoves(colour) {
		const moves = []

		for (let i = 21; i <= 98; i++) {
			const piece = this.boardArray120[i]

			// skip invalid/empty
			if (!Bot.isValidPiece(piece)) continue
			if (this.getPieceColour(piece) !== colour) continue

			const fromCoord = this.indexToCoord(i)

			let legalMoves = []
			try {
				legalMoves = this.originalGame.calculateValidMoves(piece, i)
			} catch {
				continue
			}

			for (const dest120 of legalMoves) {
				moves.push({
					from: fromCoord,
					to: this.indexToCoord(dest120),
					piece
				})
			}
		}

		return moves
	}

	//!-------------- Move Execution --------------

	makeMove(move) {
		const fromIndex = this.coordToIndex(move.from)
		const toIndex = this.coordToIndex(move.to)

		// Backup state
		this._backup = {
			board: [...this.boardArray120],
			activePlayer: this.activePlayer,
			enPassantIndex: this.enPassantIndex,
			castlingRights: structuredClone(this.castlingRights)
		}

		// Basic move (no UI, no special moves here)
		this.boardArray120[toIndex] = this.boardArray120[fromIndex]
		this.boardArray120[fromIndex] = ''

		// Swap turn
		this.activePlayer = this.activePlayer === 'white' ? 'black' : 'white'
	}

	undoMove() {
		if (!this._backup) return
		this.boardArray120 = this._backup.board
		this.activePlayer = this._backup.activePlayer
		this.enPassantIndex = this._backup.enPassantIndex
		this.castlingRights = this._backup.castlingRights
	}

	//!-------------- Game Over Check --------------

	isGameOver() {
		const moves = this.generateMoves(this.activePlayer)
		return moves.length === 0 // checkmate or stalemate
	}
}
