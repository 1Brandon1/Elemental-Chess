// ============================================================================
// Chessboard Class
// Handles board state, UI interaction, coordinate conversion,
// move application, and attack detection.
// ============================================================================

class Chessboard {
	// ------------------------------------------------------------------------
	// Mailbox (120-grid) lookup tables
	// ------------------------------------------------------------------------
	// prettier-ignore
	static MAILBOX120 = [
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1,  0,  1,  2,  3,  4,  5,  6,  7, -1,
        -1,  8,  9, 10, 11, 12, 13, 14, 15, -1,
        -1, 16, 17, 18, 19, 20, 21, 22, 23, -1,
        -1, 24, 25, 26, 27, 28, 29, 30, 31, -1,
        -1, 32, 33, 34, 35, 36, 37, 38, 39, -1,
        -1, 40, 41, 42, 43, 44, 45, 46, 47, -1,
        -1, 48, 49, 50, 51, 52, 53, 54, 55, -1,
        -1, 56, 57, 58, 59, 60, 61, 62, 63, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1
    ]
	// prettier-ignore
	static MAILBOX64 = [
        21, 22, 23, 24, 25, 26, 27, 28,
        31, 32, 33, 34, 35, 36, 37, 38,
        41, 42, 43, 44, 45, 46, 47, 48,
        51, 52, 53, 54, 55, 56, 57, 58,
        61, 62, 63, 64, 65, 66, 67, 68,
        71, 72, 73, 74, 75, 76, 77, 78,
        81, 82, 83, 84, 85, 86, 87, 88,
        91, 92, 93, 94, 95, 96, 97, 98
	]

	// ============================================================================
	// Constructor
	// ============================================================================
	constructor(game) {
		this.game = game
		this.boardElement = document.getElementById('Board')
		this.boardArray120 = new Array(120).fill('')
		this.promotionInProgress = false

		this.initPromotionOptions()
	}

	// ============================================================================
	// Promotion UI Setup
	// ============================================================================
	initPromotionOptions() {
		this.promotionOptions = document.getElementById('promotionOptions')
		this.pieceOptions = this.promotionOptions.querySelectorAll('.piece-option')

		this.pieceOptions.forEach((opt) =>
			opt.addEventListener('click', (e) => {
				const selected = e.currentTarget.getAttribute('data-piece')
				this.applyPromotion(selected)
				this.hidePromotionOptions()
			})
		)
	}

	// ============================================================================
	// Board Rendering
	// ============================================================================
	draw(fen) {
		const pieces64 = Chessboard.fenToArray64(fen)

		this.clear()
		const frag = document.createDocumentFragment()

		pieces64.forEach((piece, idx64) => {
			const idx120 = Chessboard.MAILBOX64[idx64]
			const square = this.renderSquare(piece, idx120, idx64)
			frag.appendChild(square)
		})
		this.boardElement.appendChild(frag)
	}

	clear() {
		this.boardElement.innerHTML = ''
	}

	flip() {
		const squares = Array.from(this.boardElement.children)
		this.boardElement.innerHTML = ''
		squares.reverse().forEach((s) => this.boardElement.appendChild(s))
	}

	// ============================================================================
	// Piece Placement and Movement (all inputs as coordinates)
	// ============================================================================
	place(piece, coord) {
		const html = this.renderPiece(piece)
		const idx120 = Chessboard.coordToIndex120(coord)
		this.boardArray120[idx120] = piece
		this.getSquareElement(idx120).innerHTML = html
	}

	move(from, to) {
		const fromIdx = Chessboard.coordToIndex120(from)
		const toIdx = Chessboard.coordToIndex120(to)

		const fromEl = this.getSquareElement(fromIdx)
		const toEl = this.getSquareElement(toIdx)

		const piece = fromEl.querySelector('.piece')
		if (!piece) throw new Error('No piece on source square')

		const captured = toEl.querySelector('.piece')
		if (captured) captured.remove()

		toEl.appendChild(piece)

		this.boardArray120[toIdx] = this.boardArray120[fromIdx]
		this.boardArray120[fromIdx] = ''

		this.game.updateEnPassantIndex(from, to, this.boardArray120[toIdx])
	}

	castle(kingFrom, kingTo) {
		const from = Chessboard.coordToIndex120(kingFrom)
		const to = Chessboard.coordToIndex120(kingTo)

		const kingEl = this.getSquareElement(from).querySelector('.piece')
		const direction = to > from ? 1 : -1

		const rookFrom = direction === 1 ? from + 3 : from - 4
		const rookTo = to - direction

		const rookEl = this.getSquareElement(rookFrom).querySelector('.piece')

		// Move king
		this.getSquareElement(to).appendChild(kingEl)
		this.boardArray120[to] = this.boardArray120[from]
		this.boardArray120[from] = ''

		// Move rook
		this.getSquareElement(rookTo).appendChild(rookEl)
		this.boardArray120[rookTo] = this.boardArray120[rookFrom]
		this.boardArray120[rookFrom] = ''
	}

	enPassant(from, to) {
		const fromIdx = Chessboard.coordToIndex120(from)
		const toIdx = Chessboard.coordToIndex120(to)

		const colour = Chessboard.getPieceColour(this.boardArray120[fromIdx])
		const dir = colour === 'white' ? 1 : -1

		const capturedIdx = toIdx + 10 * dir

		this.boardArray120[capturedIdx] = ''
		this.getSquareElement(capturedIdx).innerHTML = ''

		this.move(from, to)
	}

	promote(coord) {
		this.promotionSquareIndex = Chessboard.coordToIndex120(coord)
		const piece = this.boardArray120[this.promotionSquareIndex]
		const colour = Chessboard.getPieceColour(piece)

		this.showPromotionOptions(colour)
	}

	applyPromotion(piece) {
		const idx = this.promotionSquareIndex
		const old = this.boardArray120[idx]

		const colour = Chessboard.getPieceColour(old)
		const newPiece = colour === 'white' ? piece.toUpperCase() : piece.toLowerCase()

		this.boardArray120[idx] = newPiece
		this.getSquareElement(idx).innerHTML = this.renderPiece(newPiece)

		this.promotionInProgress = false
	}

	// ============================================================================
	// Highlighting
	// ============================================================================
	highlightSquares(list) {
		for (const idx of list) {
			const square = this.getSquareElement(idx)
			const isCapture = this.isSquareOccupied(idx)

			const className = isCapture ? 'highlightRing' : 'highlightCircle'
			let el = square.querySelector(`.${className}`)

			if (!el) {
				el = document.createElement('div')
				el.className = className
				square.appendChild(el)
			}

			el.style.display = 'block'
		}
	}

	unhighlightSquares(list) {
		for (const idx of list) {
			const square = this.getSquareElement(idx)
			const circle = square.querySelector('.highlightCircle')
			const ring = square.querySelector('.highlightRing')

			if (circle) circle.style.display = 'none'
			if (ring) ring.style.display = 'none'
		}
	}

	// ============================================================================
	// Promotion UI
	// ============================================================================
	showPromotionOptions(colour) {
		this.pieceOptions.forEach((option) => {
			const piece = option.getAttribute('data-piece')
			const path = `assets/chessPieces/${colour[0]}${piece}.svg`
			const img = option.querySelector('img')
			img.src = path
			img.alt = piece
		})

		this.promotionOptions.style.display = 'block'
		this.promotionInProgress = true
	}

	hidePromotionOptions() {
		this.promotionOptions.style.display = 'none'
		this.promotionInProgress = false
	}

	// ============================================================================
	// Coordinate Conversion
	// ============================================================================
	static coordToIndex120(coord) {
		if (typeof coord !== 'string' || coord.length !== 2) throw new Error('Invalid coordinate')

		const file = coord.charCodeAt(0) - 97
		const rank = 8 - parseInt(coord[1])

		if (file < 0 || file > 7 || rank < 0 || rank > 7) throw new Error('Bad coordinate')

		return Chessboard.MAILBOX64[rank * 8 + file]
	}

	static index120ToCoord(idx120) {
		const idx64 = Chessboard.MAILBOX120[idx120]

		if (idx64 < 0 || idx64 > 63) throw new Error('Invalid square index')

		const file = idx64 % 8
		const rank = Math.floor(idx64 / 8)

		return String.fromCharCode(97 + file) + (8 - rank)
	}

	// ============================================================================
	// HTML Helpers
	// ============================================================================
	getSquareElement(idx120) {
		const el = this.boardElement.querySelector(`.square[index120="${idx120}"]`)
		if (!el) throw new Error(`Square ${idx120} missing`)
		return el
	}

	getPieceFromCoord(coord) {
		return this.boardArray120[Chessboard.coordToIndex120(coord)]
	}

	renderSquare(piece, idx120, idx64) {
		const square = document.createElement('div')

		const isDark = ((idx64 % 8) + Math.floor(idx64 / 8)) % 2 === 1

		square.className = `square ${isDark ? 'darkSquare' : 'lightSquare'}`
		square.setAttribute('index120', idx120)
		square.setAttribute('coordinate', Chessboard.index120ToCoord(idx120))
		square.innerHTML = piece ? this.renderPiece(piece) : ''

		square.addEventListener('click', (e) => this.game.handleSquareClick(e))

		this.boardArray120[idx120] = piece || ''
		return square
	}

	renderPiece(piece) {
		if (!piece) return ''
		const colour = piece === piece.toUpperCase() ? 'white' : 'black'
		return `
            <div class="piece ${colour}">
                <img src="assets/chessPieces/${colour[0]}${piece.toUpperCase()}.svg">
            </div>
        `
	}

	// ============================================================================
	// FEN Handling
	// ============================================================================
	static fenToArray64(fen) {
		if (!Chessboard.isValidFEN(fen)) throw new Error('Invalid FEN string')
		const board = new Array(64).fill('')
		const rows = fen.split(' ')[0].split('/')

		let i = 0
		for (const row of rows) {
			for (const char of row) {
				if (/[1-8]/.test(char)) i += parseInt(char)
				else board[i++] = char
			}
		}
		return board
	}

	static isValidFEN(fen) {
		const validChars = /^[prnbqkfweaPRNBQKFWEA1-8\/]+$/
		if (!validChars.test(fen)) return false

		const ranks = fen.split(' ')[0].split('/')
		if (ranks.length !== 8) return false

		return ranks.every((rank) => {
			let squareCount = 0
			for (const char of rank) {
				if (char >= '1' && char <= '8') squareCount += Number(char)
				else squareCount++
			}
			return squareCount === 8
		})
	}

	// ============================================================================
	// Occupancy Helpers
	// ============================================================================
	isSquareOccupied(idx) {
		return this.boardArray120[idx] !== ''
	}

	areSquaresEmpty(indices) {
		return indices.every((index) => !this.isSquareOccupied(index))
	}

	// ============================================================================
	// Attack Detection
	// ============================================================================
	isSquareUnderAttack(squareIndex, attackerColour) {
		const board = this.boardArray120

		// ----------------------------
		// Pawn attacks
		// ----------------------------
		const pawnOffsets = attackerColour === 'white' ? [-11, -9] : [11, 9]

		for (const offset of pawnOffsets) {
			const idx = squareIndex + offset
			if (Chessboard.isValidIndex(idx)) {
				const p = board[idx]
				if (p.toLowerCase() === 'p' && Chessboard.getPieceColour(p) === attackerColour) return true
			}
		}

		// ----------------------------
		// Knight attacks
		// ----------------------------
		const knightOffsets = [-21, -19, -12, -8, 8, 12, 19, 21]
		for (const off of knightOffsets) {
			const idx = squareIndex + off
			if (Chessboard.isValidIndex(idx)) {
				const p = board[idx]
				if (p.toLowerCase() === 'n' && Chessboard.getPieceColour(p) === attackerColour) return true
			}
		}

		// ----------------------------
		// King attacks (one-step moves)
		// ----------------------------
		const kingOffsets = [-11, -10, -9, -1, 1, 9, 10, 11]
		for (const off of kingOffsets) {
			const idx = squareIndex + off
			if (Chessboard.isValidIndex(idx)) {
				const p = board[idx]
				if (p.toLowerCase() === 'k' && Chessboard.getPieceColour(p) === attackerColour) return true
			}
		}

		// --------------------------------------
		// Sliding Pieces (rook / bishop / queen)
		// --------------------------------------
		const directions = {
			rook: [-10, -1, 1, 10],
			bishop: [-11, -9, 9, 11]
		}

		// — Rooks + Queens (orthogonal)
		if (this.traceSliding(squareIndex, directions.rook, attackerColour, ['r', 'q'])) return true

		// — Bishops + Queens (diagonal)
		if (this.traceSliding(squareIndex, directions.bishop, attackerColour, ['b', 'q'])) return true

		// ----------------------------
		// Custom Elemental Pieces
		// ----------------------------

		// Fire, Earth, Water (king-like but extended)
		const fweOffsets = [-21, -19, -12, -11, -10, -9, -8, -1, 1, 8, 9, 10, 11, 12, 19, 21]
		for (const off of fweOffsets) {
			const idx = squareIndex + off
			if (Chessboard.isValidIndex(idx)) {
				const p = board[idx]
				if (['f', 'w', 'e'].includes(p.toLowerCase()) && Chessboard.getPieceColour(p) === attackerColour) return true
			}
		}

		// Air Spirit (donut move)
		const airOffsets = [22, 20, 18, 2, -2, -18, -20, -22]
		for (const off of airOffsets) {
			const idx = squareIndex + off
			if (Chessboard.isValidIndex(idx)) {
				const p = board[idx]
				if (p.toLowerCase() === 'a' && Chessboard.getPieceColour(p) === attackerColour) return true
			}
		}

		return false
	}

	// Sliding attack helper
	traceSliding(start, directions, colour, types) {
		const board = this.boardArray120

		for (const dir of directions) {
			let idx = start + dir

			while (Chessboard.isValidIndex(idx)) {
				const p = board[idx]

				if (p) {
					if (Chessboard.getPieceColour(p) === colour && types.includes(p.toLowerCase())) return true
					break
				}
				idx += dir
			}
		}
		return false
	}

	// ============================================================================
	// Misc Helpers
	// ============================================================================
	findKingIndex(colour) {
		for (let i = 0; i < 120; i++) {
			const piece = this.boardArray120[i]
			if (piece && piece === (colour === 'white' ? 'K' : 'k')) return i
		}
		throw new Error(`King of colour ${colour} not found on the board.`)
	}

	static isValidIndex(i) {
		return i >= 21 && i <= 98 && i % 10 !== 0 && (i + 1) % 10 !== 0
	}

	static getPieceColour(p) {
		return p === p.toUpperCase() ? 'white' : 'black'
	}
}
