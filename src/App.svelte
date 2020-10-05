<script>
  import { setContext } from 'svelte'
  setContext('size', { width: 1280, height: 720 })
  import Intro from './00.intro/index.svelte'
  import Keyboards from './01.keyboards/index.svelte'
  import Punctuation from './01.punctuation/index.svelte'
  import Markup from './02.markup/index.svelte'
  import Wrapping from './03.word-wrap/index.svelte'
  import TextEditor from './04.text-editor/index.svelte'
  import Focus from './05.focus/index.svelte'

  let i = 3
  let steps = [
    Intro,
    Keyboards,
    Punctuation,
    Markup,
    Wrapping,
    TextEditor,
    Focus
  ]
  let doEnd = false
  function prev() {
    if (i > 0) {
      i -= 1
    }
    i = i < 0 ? 0 : i // dont go under 0
    doEnd = true
  }
  function done() {
    if (steps[i + 1]) {
      i += 1
    } else {
      console.log('done')
    }
    doEnd = false
  }
  function changeIt(e) {
    i = parseInt(e.target.value, 10)
    e.preventDefault()
  }
</script>

<style>

</style>

<div>part: {i}</div>
<div>
  <select bind:value={i} on:click={e => e.preventDefault()} on:blur={changeIt}>
    <option value="0">intro</option>
    <option value="1">keyboards</option>
    <option value="2">punctuation</option>
    <option value="3">markup</option>
    <option value="4">wrapping</option>
    <option value="5">text-editor</option>
    <option value="6">focus</option>
  </select>
</div>
<svelte:component this={steps[i]} {done} {prev} {doEnd} />
