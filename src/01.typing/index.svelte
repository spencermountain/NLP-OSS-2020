<script>
  import keyPress from '../Components/keyboard'
  export let done = () => {}
  export let prev = () => {}
  export let doEnd = false
  // pages
  import LoveTyping from './LoveTyping.svelte'
  import NowCLI from './NowCLI.svelte'
  import Typewriter from './Typewriter.svelte'
  import TypewriterMag from './TypewriterMag.svelte'
  import Engelbart from './Engelbart.svelte'
  import Apollo8 from './Apollo8.svelte'

  let steps = [
    LoveTyping,
    NowCLI,
    Typewriter,
    TypewriterMag,
    Engelbart,
    Apollo8
  ]
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
