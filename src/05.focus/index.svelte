<script>
  import keyPress from '../Components/keyboard'
  export let done = () => {}
  export let prev = () => {}
  export let doEnd = false
  // pages
  import Focus from './Focus.svelte'
  import Browser from './Browser.svelte'
  import Zelda from './Zelda.svelte'
  import CanonCat from './Canon-cat.svelte'
  import Spicer from './Spicer.svelte'
  import Quake from './Quake.svelte'

  let steps = [Focus, Spicer, Browser, Zelda, CanonCat, Quake]
  let i = 0
  // come from backward
  i = doEnd === true ? steps.length - 1 : i
  const spaceBar = function(e) {
    i = keyPress(e, i)
    if (i < 0) {
      prev()
    } else if (!steps[i]) {
      done()
    }
  }
  const onClick = function() {
    i += 1
    if (!steps[i]) {
      done()
    }
  }
</script>

<style>

</style>

<svelte:body on:keydown={spaceBar} on:click={onClick} />

<svelte:component this={steps[i]} />
