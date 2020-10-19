<script>
  import { setContext } from 'svelte'
  setContext('size', { width: 1280, height: 720 })
  import Start from './Start.svelte'
  import Intro from './00.intro/index.svelte'
  import Keyboards from './01.keyboards/index.svelte'
  import Typing from './01.typing/index.svelte'
  import Punctuation from './01.punctuation/index.svelte'
  import Markup from './02.markup/index.svelte'
  import Wrapping from './03.word-wrap/index.svelte'
  import TextEditor from './04.text-editor/index.svelte'
  import Focus from './05.focus/index.svelte'
  import End from './End.svelte'

  let i = 0
  let steps = [
    Start,
    Intro,
    Keyboards,
    Typing,
    Punctuation,
    Markup,
    Wrapping,
    TextEditor,
    Focus,
    End
  ]
  $: step = steps[i]
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
    console.log(i, e.target.value)

    e.preventDefault()
  }
</script>

<style>

</style>

<div>part: {i}</div>
<div>
  <select
    bind:value={i}
    on:click={e => e.preventDefault()}
    on:change={changeIt}
    on:blur={() => {}}>
    <option value="0">start</option>
    <option value="1">compromise</option>
    <option value="2">keyboards</option>
    <option value="3">typing</option>
    <option value="4">punctuation</option>
    <option value="5">markup</option>
    <option value="6">wrapping</option>
    <option value="7">text-editor</option>
    <option value="8">focus</option>
  </select>
</div>
<svelte:component this={step} {done} {prev} {doEnd} />
