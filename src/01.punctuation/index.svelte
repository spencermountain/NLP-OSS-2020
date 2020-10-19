<script>
  import keyPress from '../Components/keyboard'
  export let done = () => {}
  export let prev = () => {}
  export let doEnd = false
  // pages
  // import Keyboard1 from './Keyboard.1.svelte'
  import Keyboard2 from './Keyboard.2.svelte'
  import Keyboard3 from './Keyboard.3.svelte'
  import KeyTilde from './KeyTilde.svelte'
  import KeyTilde2 from './KeyTilde2.svelte'
  import KeyHash from './KeyHash.svelte'
  import KeyAt from './KeyAt.svelte'
  import KeyAsterix from './KeyAsterix.svelte'
  import KeyBrackets from './KeyBrackets.svelte'
  import Tomlinson from './Tomlinson.svelte'
  import Escaping from './Escaping.svelte'
  // import Timeline from './Timeline.svelte'

  let steps = [
    // Keyboard1,
    Keyboard2,
    Keyboard3,
    KeyTilde,
    KeyTilde2,
    KeyAt,
    Tomlinson,
    KeyHash,
    KeyAsterix,
    KeyBrackets,
    Escaping
    // Timeline,
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
