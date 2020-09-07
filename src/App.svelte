<script>
  import { setContext } from 'svelte'
  setContext('size', { width: 1280, height: 720 })
  import Intro from './00.intro/index.svelte'
  import Keyboards from './01.keyboards/index.svelte'
  import Wrapping from './02.word-wrap/index.svelte'
  import Refactoring from './03.refactoring/index.svelte'

  let i = 0
  let steps = [Intro, Keyboards, Wrapping, Refactoring]

  function prev() {
    if (i > 0) {
      i -= 1
    }
    console.log('prev', i)
  }
  function done() {
    if (steps[i + 1]) {
      i += 1
    } else {
      console.log('done')
    }
  }
</script>

<style>

</style>

<svelte:component this={steps[i]} {done} {prev} />
