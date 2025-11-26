// ============================================================================
// Bot Class
// Minimax engine with Alpha-Beta pruning + Piece-Square Tables (PST)
// ============================================================================
class Bot {
	constructor(game, colour, depth = 3) {
		this.game = game
		this.colour = colour // 'white' or 'black'
		this.depth = depth // Search depth

		// =========================================================================
		// Piece Values (Material scoring)
		// =========================================================================
		// prettier-ignore
		this.pieceValues = {
            p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
            f: 450, w: 450, e: 550, a: 500  // elemental pieces
        }

		// =========================================================================
		// Piece-Square Tables (PST)
		// =========================================================================
		// White uses PST normally, black uses it mirrored vertically.
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
			// --- Elemental PSTs ---
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

	// =========================================================================
	// Public Api — Make Best Move
	// =========================================================================
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

		this.game.makeMove(bestMove.from, bestMove.to, this.game.board.getPieceFromCoord(bestMove.from))
	}

	// =========================================================================
	// Minimax With Alpha-beta Pruning
	// =========================================================================
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

	// =========================================================================
	// Evaluation (Material + PST)
	// =========================================================================
	evaluate(gameState) {
		const board = gameState.boardArray120
		let score = 0

		for (let i = 0; i < 120; i++) {
			const piece = board[i]
			if (!Bot.isValidPiece(piece)) continue

			const type = piece.toLowerCase()
			const mat = this.pieceValues[type]
			const pst = this.getPSTValue(piece, i)
			const total = mat + pst

			score += this.isBotsPiece(piece) ? total : -total
		}

		return score
	}

	getPSTValue(piece, index120) {
		const type = piece.toLowerCase()
		const table = this.PST[type]
		if (!table) return 0

		const idx64 = Chessboard.MAILBOX120[index120]
		if (idx64 < 0 || idx64 > 63) return 0

		const r = Math.floor(idx64 / 8)
		const f = idx64 % 8

		// White uses table normally, black uses vertically mirrored version
		return piece === piece.toUpperCase() ? table[r][f] : table[7 - r][f]
	}

	isBotsPiece(piece) {
		return this.colour === 'white' ? piece === piece.toUpperCase() : piece === piece.toLowerCase()
	}

	static isValidPiece(p) {
		return typeof p === 'string' && /^[prnbqkafwe]$/i.test(p)
	}
}

// ============================================================================
// Game Copy Class
// Lightweight board for minimax simulations
// ============================================================================

class GameCopy {
	constructor(game) {
		this.originalGame = game

		// =========================================================================
		// Shallow State Copy
		// =========================================================================
		this.boardArray120 = [...game.board.boardArray120]
		this.activePlayer = game.activePlayer
		this.enPassantIndex = game.enPassantIndex
		this.castlingRights = structuredClone(game.castlingRights)
	}

	// =========================================================================
	// Helpers
	// =========================================================================
	getOpponentColour(c) {
		return c === 'white' ? 'black' : 'white'
	}

	// =========================================================================
	// Move Generation
	// =========================================================================
	generateMoves(colour) {
		const moves = []

		for (let i = 21; i <= 98; i++) {
			const piece = this.boardArray120[i]
			if (!Bot.isValidPiece(piece)) continue
			if (Chessboard.getPieceColour(piece) !== colour) continue

			let legalMoves = []
			try {
				legalMoves = this.originalGame.generateLegalMoves(piece, i)
			} catch {
				continue
			}

			const fromCoord = Chessboard.index120ToCoord(i)
			for (const dest of legalMoves) {
				moves.push({
					from: fromCoord,
					to: Chessboard.index120ToCoord(dest),
					piece
				})
			}
		}

		return moves
	}

	// =========================================================================
	// Move Execution
	// =========================================================================
	makeMove(move) {
		const fromIndex = Chessboard.coordToIndex120(move.from)
		const toIndex = Chessboard.coordToIndex120(move.to)

		this._backup = {
			board: [...this.boardArray120],
			activePlayer: this.activePlayer,
			enPassantIndex: this.enPassantIndex,
			castlingRights: structuredClone(this.castlingRights)
		}

		this.boardArray120[toIndex] = this.boardArray120[fromIndex]
		this.boardArray120[fromIndex] = ''

		this.activePlayer = this.getOpponentColour(this.activePlayer)
	}

	undoMove() {
		if (!this._backup) return
		this.boardArray120 = this._backup.board
		this.activePlayer = this._backup.activePlayer
		this.enPassantIndex = this._backup.enPassantIndex
		this.castlingRights = this._backup.castlingRights
	}

	// =========================================================================
	// Game Over Check
	// =========================================================================
	isGameOver() {
		const moves = this.generateMoves(this.activePlayer)
		return moves.length === 0
	}
}
