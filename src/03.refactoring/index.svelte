<script>
  import keyPress from '../Components/keyboard'
  export let done = () => {}
  export let prev = () => {}
  // pages
  import Timeline from './Timeline.svelte'

  let steps = [Timeline]
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
