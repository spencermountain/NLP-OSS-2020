// import App from './00.intro/FigureSkating.svelte'
// import App from './01.keyboards/Engelbart.svelte'
// import App from './01.punctuation/KeyTilde2.svelte'
// import App from './02.markup/Newline.svelte'
// import App from './02.markup/Loop.svelte'
// import App from './01.02.typing/Keyboard.1.svelte'
// import App from './04.word-wrap/Wrap.svelte'
// import App from './03.word-wrap/Spreadsheet2.svelte'
// import App from './03.word-wrap/SpreadsheetSelect.svelte'
// import App from './03.word-wrap/VariableWidth.svelte'
// import App from './04.text-editor/Dates.svelte'
// import App from './demos/Browser.svelte'
// import App from './demos/Anaphor.svelte'
// import App from './demos/Modal.svelte'
// import App from './demos/flip.svelte'
// import App from './demos/UI.svelte'
// import App from './demos/Monospace.svelte'
import App from './05.focus/Focus.svelte'

var app = new App({
  target: document.body,
})

export default app

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://www.snowpack.dev/#hot-module-replacement
if (import.meta.hot) {
  import.meta.hot.accept()
  import.meta.hot.dispose(() => {
    app.$destroy()
  })
}
