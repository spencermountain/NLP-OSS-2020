<script>
  import keyPress from '../Components/keyboard'
  export let done = () => {}
  export let prev = () => {}
  // pages
  import Spreadsheet from './Spreadsheet.svelte'
  import Wrap1 from './Wrap.1.svelte'

  let steps = [Spreadsheet, Wrap1]
  let i = 0
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
