<script>
  import keyPress from '../Components/keyboard'
  export let done = () => {}
  export let prev = () => {}
  export let doEnd = false
  // pages
  import Spreadsheet from './Spreadsheet.svelte'
  import Wrap1 from './Wrap.svelte'
  import Insert from './Insert.svelte'

  let steps = [Spreadsheet, Wrap1, Insert]
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
