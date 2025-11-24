// ============================================================================
// Game Class
// Manages game state, turn flow, move execution, rules, and validation
// ============================================================================
class Game {
	constructor() {
		this.board = new Chessboard(this)

		this.FEN_CLASSIC = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
		this.FEN_ELEMENTAL = 'rfbekanw/pppppppp/8/8/8/8/PPPPPPPP/RFBEKANW'

		this.activePlayerDisplay = document.getElementById('activePlayer')
		this.selectedSquare = null

		this.handleSquareClick = this.handleSquareClick.bind(this)
	}

	// =========================================================================
	// Game Start
	// =========================================================================
	start(mode = 'pvp', variant = 'elemental') {
		this.mode = mode // pvp or pvb
		this.variant = variant // classic or elemental
		this.activePlayer = 'white'
		this.activePlayerDisplay.textContent = 'White'

		this.gameOver = false
		this.legalMoves = []
		this.history = []
		this.redoStack = []

		this.enPassantIndex = null
		this.castleRights = {
			white: { kingside: true, queenside: true },
			black: { kingside: true, queenside: true }
		}

		const fen = variant === 'elemental' ? this.FEN_ELEMENTAL : this.FEN_CLASSIC

		this.bot = mode === 'pvb' ? new Bot(this, 'black', 1) : null

		this.board.draw(fen)
	}

	// =========================================================================
	// Input / UI Handling
	// =========================================================================
	handleSquareClick(event) {
		if (this.board.promotionInProgress) return

		const square = event.currentTarget

		if (!this.selectedSquare) return this.handleFirstClick(square)

		if (square === this.selectedSquare) return this.resetSquareSelection()

		if (this.isActivePlayersPiece(square)) {
			this.resetSquareSelection()
			return this.handleFirstClick(square)
		}

		this.handleSecondClick(square)
	}

	handleFirstClick(square) {
		const coord = square.getAttribute('coordinate')
		const index120 = parseInt(square.getAttribute('index120'))
		const piece = this.board.getPieceFromCoord(coord)

		if (!this.isActivePlayersPiece(square)) return

		this.selectedSquare = square
		this.legalMoves = this.generateLegalMoves(piece, index120)

		this.board.highlightSquares(this.legalMoves)
		square.classList.add('clickedSquare')
	}

	handleSecondClick(square) {
		const index120 = parseInt(square.getAttribute('index120'))
		if (!this.legalMoves.includes(index120)) return

		const from = this.selectedSquare.getAttribute('coordinate')
		const to = square.getAttribute('coordinate')
		const piece = this.board.getPieceFromCoord(from)

		this.makeMove(from, to, piece)
		this.resetSquareSelection()

		const enemy = this.getOpponentColour(this.activePlayer)

		if (this.isCheckmate(enemy)) {
			this.gameOver = true
			showCheckmateModal(this.activePlayer)
		} else if (this.isInCheck(enemy)) {
			console.log('Check!')
		}

		this.toggleTurn()
		this.redoStack = []
	}

	resetSquareSelection() {
		if (!this.selectedSquare) return
		this.selectedSquare.classList.remove('clickedSquare')
		this.board.unhighlightSquares(this.legalMoves)
		this.selectedSquare = null
		this.legalMoves = []
	}

	// =========================================================================
	// Turn Management
	// =========================================================================
	toggleTurn() {
		this.activePlayer = this.getOpponentColour(this.activePlayer)
		this.activePlayerDisplay.textContent = this.activePlayer.charAt(0).toUpperCase() + this.activePlayer.slice(1)

		console.log(this.displayMoveHistory())

		if (this.mode === 'pvb' && this.activePlayer === this.bot.colour) {
			setTimeout(() => {
				this.bot.makeBestMove()
				this.toggleTurn()
			}, 500) // Delay to simulate thinking time
		}
	}

	// =========================================================================
	// Move Execution / History
	// =========================================================================
	makeMove(fromCoord, toCoord, piece) {
		let capturedPiece = null
		let capturedCoord = null
		let moveType = 'normal'

		const previousCastling = structuredClone(this.castleRights)
		const previousEnPassant = this.enPassantIndex

		// --- En Passant ------------------------------------------------------
		if (this.isEnPassant(toCoord, piece)) {
			const dir = piece === piece.toUpperCase() ? -1 : 1
			const epCoord = Chessboard.index120ToCoord(this.enPassantIndex - 10 * dir)

			capturedPiece = this.getCapturedPiece(epCoord)
			capturedCoord = epCoord

			this.board.enPassant(fromCoord, toCoord)
			moveType = 'enPassant'
		}

		// --- Castling --------------------------------------------------------
		else if (this.isCastle(fromCoord, toCoord, piece)) {
			this.board.castle(fromCoord, toCoord)
			moveType = 'castle'
		}

		// --- Normal Move / Capture / Promotion -------------------------------
		else {
			capturedPiece = this.getCapturedPiece(toCoord)
			if (capturedPiece) capturedCoord = toCoord

			this.board.move(fromCoord, toCoord)

			if (this.isPromotion(piece, toCoord)) {
				this.board.promote(toCoord)
				moveType = 'promotion'
			}
		}

		this.history.push({
			piece,
			fromCoord,
			toCoord,
			capturedPiece,
			capturedCoord,
			moveType,
			castleRightsBefore: previousCastling,
			enPassantIndexBefore: previousEnPassant
		})

		this.updateCastling(fromCoord, piece)
	}

	undoMove() {
		this.resetSquareSelection()
		this.board.hidePromotionOptions()
		this.board.promotionInProgress = false

		if (this.history.length === 0) return

		const last = this.history.pop()
		const { fromCoord, toCoord, piece, capturedPiece, capturedCoord, moveType, castleRightsBefore, enPassantIndexBefore } = last

		// Reverse specific move types
		switch (moveType) {
			case 'enPassant':
				this.board.move(toCoord, fromCoord)
				this.board.place(capturedPiece, capturedCoord)
				break

			case 'promotion':
				this.board.place(capturedPiece, capturedCoord)
				this.board.place(piece, fromCoord)
				break

			case 'castle':
				this.board.move(toCoord, fromCoord)
				if (toCoord === 'g1') this.board.move('f1', 'h1')
				if (toCoord === 'b1') this.board.move('c1', 'a1')
				if (toCoord === 'g8') this.board.move('f8', 'h8')
				if (toCoord === 'b8') this.board.move('c8', 'a8')
				break

			default:
				this.board.move(toCoord, fromCoord)
				if (capturedPiece) this.board.place(capturedPiece, capturedCoord)
		}

		this.castleRights = castleRightsBefore
		this.enPassantIndex = enPassantIndexBefore

		this.gameOver = false
		this.toggleTurn()
		this.redoStack.push(last)
	}

	redoMove() {
		if (this.redoStack.length === 0) return

		const move = this.redoStack.pop()
		const { fromCoord, toCoord, moveType } = move

		switch (moveType) {
			case 'enPassant':
				this.board.enPassant(fromCoord, toCoord)
				break

			case 'promotion':
				this.board.move(fromCoord, toCoord)
				this.board.promote(toCoord)
				break

			case 'castle':
				this.board.castle(fromCoord, toCoord)
				break

			default:
				this.board.move(fromCoord, toCoord)
		}

		this.history.push(move)
		this.toggleTurn()
	}

	// =========================================================================
	// Move Generation / Validation
	// =========================================================================
	generateLegalMoves(piece, pos120) {
		const colour = Chessboard.getPieceColour(piece)
		let moves = []

		// prettier-ignore
		switch (piece.toLowerCase()) {
			case 'k': moves = this.calculateKingMoves(pos120, colour); break
			case 'p': moves = this.calculatePawnMoves(pos120, colour); break
			case 'n': moves = this.calculateMoves(pos120, colour, [-21, -19, -12, -8, 8, 12, 19, 21], false); break
			case 'b': moves = this.calculateMoves(pos120, colour, [-11, -9, 9, 11], true); break
			case 'r': moves = this.calculateMoves(pos120, colour, [-10, -1, 1, 10], true); break
			case 'q': moves = this.calculateMoves(pos120, colour, [-11, -10, -9, -1, 1, 9, 10, 11], true); break
			case 'f': moves = this.calculateFireMoves(pos120, colour); break
			case 'e': moves = this.calculateEarthMoves(pos120, colour); break
			case 'w': moves = this.calculateWaterMoves(pos120, colour); break
			case 'a': moves = this.calculateAirMoves(pos120, colour); break
		}

		return moves.filter((dest) => this.isKingSafeAfterMove(pos120, dest))
	}

	calculateMoves(pos, colour, offsets, sliding) {
		const result = []

		for (let off of offsets) {
			let newPos = pos

			while (true) {
				newPos += off
				if (!Chessboard.isValidIndex(newPos)) break
				if (this.isAllySquare(newPos, colour)) break

				result.push(newPos)

				if (this.isEnemySquare(newPos, colour) || !sliding) break
			}
		}

		return result
	}

	calculateKingMoves(pos, colour) {
		const moves = this.calculateMoves(pos, colour, [-11, -10, -9, -1, 1, 9, 10, 11], false)

		if (this.canCastleKingSide(colour)) moves.push(pos + 2)
		if (this.canCastleQueenside(colour)) moves.push(pos - 3)

		return moves
	}

	calculatePawnMoves(pos, colour) {
		const dir = colour === 'white' ? -1 : 1
		const startRank = colour === 'white' ? 8 : 3
		const moves = []

		// Forward movement
		const one = pos + 10 * dir
		if (!this.board.isSquareOccupied(one)) {
			moves.push(one)

			const two = pos + 20 * dir
			if (Math.floor(pos / 10) === startRank && !this.board.isSquareOccupied(two)) {
				moves.push(two)
			}
		}

		// Diagonal captures
		for (let off of [9 * dir, 11 * dir]) {
			const diag = pos + off

			if (Chessboard.isValidIndex(diag)) {
				if (this.isEnemySquare(diag, colour) || diag === this.enPassantIndex) {
					moves.push(diag)
				}
			}
		}

		return moves
	}

	calculateFireMoves(pos, colour) {
		const knight = [-21, -19, -12, -8, 8, 12, 19, 21]
		const king = [-11, -10, -9, -1, 1, 9, 10, 11]
		return this.calculateMoves(pos, colour, knight.concat(king), false)
	}

	calculateWaterMoves(pos, colour) {
		const rook = [-10, -1, 1, 10]
		const special = [22, 20, 18, 2, -2, -18, -20, -22]
		return this.calculateMoves(pos, colour, rook.concat(special), false)
	}

	calculateEarthMoves(pos, colour) {
		const moves = []
		const dirs = [-10, -1, 1, 10, -11, -9, 9, 11]

		for (const off of dirs) {
			let p = pos
			for (let i = 0; i < 3; i++) {
				p += off
				if (!Chessboard.isValidIndex(p)) break
				if (this.isAllySquare(p, colour)) break

				moves.push(p)
				if (this.isEnemySquare(p, colour)) break
			}
		}

		return moves
	}

	calculateAirMoves(pos, colour) {
		const bishop = [-11, -9, 9, 11]
		const special = [22, 20, 18, 2, -2, -18, -20, -22]
		return this.calculateMoves(pos, colour, bishop.concat(special), false)
	}

	isKingSafeAfterMove(from, to) {
		const temp = [...this.board.boardArray120]
		const piece = temp[from]
		const colour = Chessboard.getPieceColour(piece)

		temp[to] = piece
		temp[from] = ''

		const tempBoard = new Chessboard(this)
		tempBoard.boardArray120 = temp

		const kingPos = tempBoard.findKingIndex(colour)

		return !tempBoard.isSquareUnderAttack(kingPos, this.getOpponentColour(colour))
	}

	// =========================================================================
	// Castling & En Passant Logic
	// =========================================================================
	updateCastling(fromCoord, piece) {
		const colour = Chessboard.getPieceColour(piece)
		const p = piece.toLowerCase()

		if (p === 'k') {
			this.castleRights[colour].kingside = false
			this.castleRights[colour].queenside = false
		}

		if (p === 'r') {
			if (fromCoord === 'a1' || fromCoord === 'a8') this.castleRights[colour].queenside = false

			if (fromCoord === 'h1' || fromCoord === 'h8') this.castleRights[colour].kingside = false
		}
	}

	updateEnPassant(fromCoord, toCoord, piece) {
		this.enPassantIndex = null
		if (piece && piece.toLowerCase() === 'p') {
			const fromSquareIndex = Chessboard.coordToIndex120(fromCoord)
			const toSquareIndex = Chessboard.coordToIndex120(toCoord)
			if (Math.abs(toSquareIndex - fromSquareIndex) === 20) {
				this.enPassantIndex = (fromSquareIndex + toSquareIndex) / 2
			}
		}
	}

	canCastleKingSide(colour) {
		const empty = colour === 'white' ? [96, 97] : [26, 27]
		const rookCoord = colour === 'white' ? 'h1' : 'h8'
		const rook = this.board.getPieceFromCoord(rookCoord)

		return (
			this.castleRights[colour].kingside &&
			this.board.areSquaresEmpty(empty) &&
			!this.areSquaresUnderAttack(empty, colour) &&
			rook &&
			rook.toLowerCase() === 'r' &&
			Chessboard.getPieceColour(rook) === colour
		)
	}

	canCastleQueenside(colour) {
		const empty = colour === 'white' ? [94, 93, 92] : [24, 23, 22]
		const rookCoord = colour === 'white' ? 'a1' : 'a8'
		const rook = this.board.getPieceFromCoord(rookCoord)

		return (
			this.castleRights[colour].queenside &&
			this.board.areSquaresEmpty(empty) &&
			!this.areSquaresUnderAttack(empty, colour) &&
			rook &&
			rook.toLowerCase() === 'r' &&
			Chessboard.getPieceColour(rook) === colour
		)
	}

	isEnPassant(toCoord, piece) {
		return Chessboard.coordToIndex120(toCoord) === this.enPassantIndex && piece.toLowerCase() === 'p'
	}

	isCastle(fromCoord, toCoord, piece) {
		if (piece.toLowerCase() !== 'k') return false

		const from = Chessboard.coordToIndex120(fromCoord)
		const to = Chessboard.coordToIndex120(toCoord)

		const dist = Math.abs(from - to)
		return dist === 2 || dist === 3
	}

	isPromotion(piece, toCoord) {
		return piece.toLowerCase() === 'p' && (toCoord[1] === '1' || toCoord[1] === '8')
	}

	// =========================================================================
	// Game State Checks
	// =========================================================================
	isInCheck(colour) {
		const king = this.board.findKingIndex(colour)
		return this.board.isSquareUnderAttack(king, this.getOpponentColour(colour))
	}

	isCheckmate(colour) {
		if (!this.isInCheck(colour)) return false

		for (let i = 21; i <= 98; i++) {
			if (this.isAllySquare(i, colour)) {
				const coord = Chessboard.index120ToCoord(i)
				const piece = this.board.getPieceFromCoord(coord)
				if (this.generateLegalMoves(piece, i).length > 0) return false
			}
		}

		return true
	}

	areSquaresUnderAttack(indices, colour) {
		return indices.some((idx) => this.board.isSquareUnderAttack(idx, this.getOpponentColour(colour)))
	}

	// =========================================================================
	// Utility Helpers
	// =========================================================================
	getOpponentColour(colour) {
		return colour === 'white' ? 'black' : 'white'
	}

	getCapturedPiece(coord) {
		return this.board.getPieceFromCoord(coord) || null
	}

	formatMove({ piece, fromCoord, toCoord, capturedPiece }) {
		let str = `${piece} from ${fromCoord} to ${toCoord}`
		if (capturedPiece) str += `, capturing ${capturedPiece}`
		return str
	}

	displayMoveHistory() {
		if (this.history.length === 0) return 'No moves have been made yet.'
		return this.history.map((m, i) => `${i + 1}. ${this.formatMove(m)}`).join('\n')
	}

	isActivePlayersPiece(square) {
		const p = square.querySelector('.piece')
		return p && p.classList.contains(this.activePlayer)
	}

	isAllySquare(idx, colour) {
		const p = this.board.boardArray120[idx]
		return p && Chessboard.getPieceColour(p) === colour
	}

	isEnemySquare(idx, colour) {
		const p = this.board.boardArray120[idx]
		return p && Chessboard.getPieceColour(p) !== colour
	}
}
