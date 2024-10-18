//!-------------- New Game Modal --------------

document.getElementById('confirmButton').addEventListener('click', function () {
	document.getElementById('confirmationModal').classList.remove('show')
	game.start()
})

document.getElementById('cancelButton').addEventListener('click', function () {
	document.getElementById('confirmationModal').classList.remove('show')
})
