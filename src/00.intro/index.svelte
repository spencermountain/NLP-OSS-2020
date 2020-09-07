<script>
  import keyPress from '../Components/keyboard'
  export let done = () => {}
  export let prev = () => {}
  // pages
  import Splash from './Splash-page.svelte'
  import Resolution1 from './Resolution-1.svelte'
  import Resolution2 from './Resolution-2.svelte'
  import Concepts from './Concepts.svelte'
  import Shoulders from './Shoulders.svelte'

  let steps = [Splash, Resolution1, Resolution2, Concepts, Shoulders]
  let i = 4
  function spaceBar(e) {
    i = keyPress(e, i)
    if (i < 0) {
      prev()
    }
    if (!steps[i]) {
      done()
    }
  }
</script>

<style>
</style>

<svelte:window on:keydown={spaceBar} />

<svelte:component this={steps[i]} />
