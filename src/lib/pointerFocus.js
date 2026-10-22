// A mouse click must not leave a coloured focus ring on a button. Keyboard focus still shows it:
// pressing any key removes the flag again (see the rule in styles.css).
document.addEventListener('pointerdown', () => { document.documentElement.dataset.input = 'mouse' }, true)
document.addEventListener('keydown', () => { delete document.documentElement.dataset.input }, true)
