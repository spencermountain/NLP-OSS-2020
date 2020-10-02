<script>
  import keyPress from '../Components/keyboard'
  export let done = () => {}
  export let prev = () => {}
  export let doEnd = false
  // pages
  import OscarsTalk from './OscarsTalk.svelte'
  import Mjackson from './Mjackson.svelte'
  import Desks from './Desks.svelte'
  import NowCLI from './NowCLI.svelte'
  import ISSKeyboard from './ISSKeyboard.svelte'
  import TonyAbra from './TonyAbra.svelte'
  import ZoeSmith from './ZoeSmith.svelte'
  import HandKeyboards from './HandKeyboards.svelte'
  import Typewriter1 from './Typewriter.1.svelte'
  import Typewriter2 from './Typewriter.2.svelte'
  import Punctuation1 from './Punctuation.1.svelte'
  import Punctuation2 from './Punctuation.2.svelte'

  let steps = [
    OscarsTalk,
    Mjackson,
    Desks,
    ISSKeyboard,
    TonyAbra,
    ZoeSmith,
    HandKeyboards,
    NowCLI,
    Typewriter1,
    Typewriter2,
    Punctuation1,
    Punctuation2
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
