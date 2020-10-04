<script>
  import keyPress from '../Components/keyboard'
  export let done = () => {}
  export let prev = () => {}
  export let doEnd = false
  // pages
  import Keyboard1 from './Keyboard.1.svelte'
  import Keyboard2 from './Keyboard.2.svelte'
  import Tilde from './Tilde.svelte'
  import Typewriter2 from './Typewriter.2.svelte'
  // import Punctuation1 from './Punctuation.1.svelte'
  import Punctuation2 from './Punctuation.2.svelte'

  let steps = [Keyboard1, Keyboard2, Tilde, Typewriter2, Punctuation2]
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
