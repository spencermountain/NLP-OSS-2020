// import App from './00.intro/Menu.svelte'
// import App from './01.keyboards/HandKeyboards.svelte'
// import App from './01.punctuation/Keyboard.2.svelte'
// import App from './02.markup/Newline.svelte'
// import App from './04.word-wrap/Wrap.svelte'
// import App from './03.text-editor/Timeline.svelte'
import App from './05.focus/Quake.svelte'
// import App from './demos/Demo.svelte'

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
