<script>
  import { setContext } from 'svelte'
  setContext('size', { width: 1280, height: 720 })
  import Intro from './00.intro/index.svelte'
  import Keyboards from './01.keyboards/index.svelte'
  import Wrapping from './02.word-wrap/index.svelte'
  import Refactoring from './03.refactoring/index.svelte'
  import Focus from './04.focus/index.svelte'

  let i = 0
  let steps = [Intro, Keyboards, Wrapping, Refactoring, Focus]
  let doEnd = false
  function prev() {
    if (i > 0) {
      i -= 1
    }
    i = i < 0 ? 0 : i // dont go under 0
    doEnd = true
    console.log('prev', i)
  }
  function done() {
    if (steps[i + 1]) {
      i += 1
    } else {
      console.log('done')
    }
    doEnd = false
  }
</script>

<style>
</style>

<div>chapter: {i}</div>
<svelte:component this={steps[i]} {done} {prev} {doEnd} />
