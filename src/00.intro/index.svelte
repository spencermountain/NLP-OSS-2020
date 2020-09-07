<script>
  import keyPress from '../Components/keyboard'
  export let done = () => {}
  export let prev = () => {}
  export let doEnd = false
  // pages
  import Splash from './Splash-page.svelte'
  import Resolution1 from './Resolution-1.svelte'
  import Resolution2 from './Resolution-2.svelte'
  import Concepts from './Concepts.svelte'
  import Shoulders from './Shoulders.svelte'
  import Bear from './Bear.svelte'
  import FigureSkating from './FigureSkating.svelte'

  let steps = [
    Splash,
    Resolution1,
    Resolution2,
    Concepts,
    Shoulders,
    Bear,
    FigureSkating,
  ]
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
