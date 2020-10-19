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
  import Insert from './Insert.svelte'
  import FormalNote from './FormalNote.svelte'
  import Engelbart from './Engelbart.svelte'
  import EngelbartApollo from './EngelbartApollo.svelte'
  import EngelbartMiller from './EngelbartMiller.svelte'
  import SplitHistory from './SplitHistory.svelte'
  import Sds940 from './SDS940.svelte'
  import Keyboard1 from './Keyboard.1.svelte'
  import LightPen from './LightPen.svelte'

  let steps = [
    LoveTyping,
    NowCLI,
    Typewriter,
    TypewriterMag,
    Insert,
    FormalNote,
    SplitHistory,
    Engelbart,
    EngelbartMiller,
    EngelbartApollo,
    Sds940,
    Keyboard1,
    LightPen
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
