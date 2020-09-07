<script>
  import keyPress from '../Components/keyboard'
  export let done = () => {}
  export let prev = () => {}
  // pages
  import Zelda from './Zelda.svelte'
  import CanonCat from './Canon-cat.svelte'

  let steps = [Zelda, CanonCat]
  let i = 0
  // come from backward
  i = doEnd === true ? steps.length - 1 : i
  function spaceBar(e) {
    i = keyPress(e, i)
    if (i < 0) {
      prev()
    } else if (!steps[i]) {
      done()
    }
  }
</script>

<style>
</style>

<svelte:window on:keydown={spaceBar} />

<svelte:component this={steps[i]} />
