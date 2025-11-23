// ============================================================
// THEME MANAGEMENT
// Handles cycling between available page themes
// ============================================================
const THEME_CYCLE = {
	dark: 'light',
	light: 'earth',
	earth: 'fire',
	fire: 'water',
	water: 'air',
	air: 'dark'
}

function getStoredTheme() {
	const saved = localStorage.getItem('theme')
	return THEME_CYCLE[saved] ? saved : Object.keys(THEME_CYCLE)[0]
}

function applyTheme(theme) {
	document.body.classList.add(theme)
	localStorage.setItem('theme', theme)
}

function toggleTheme() {
	const current = getStoredTheme()
	const next = THEME_CYCLE[current]
	if (!next) return console.error(`Invalid theme: ${current}`)

	document.body.classList.replace(current, next)
	localStorage.setItem('theme', next)
}

// Initialize theme
applyTheme(getStoredTheme())

document.getElementById('themeButton').addEventListener('click', toggleTheme)
