<script>
  import keyPress from '../Components/keyboard'
  export let done = () => {}
  export let prev = () => {}
  export let doEnd = false
  // pages
  import Drake from './Drake.svelte'
  import Timeline from './Timeline.svelte'
  import Menu from './Menu.svelte'
  import Anaphor from './Anaphor.svelte'
  import Dates from './Dates.svelte'
  import Modal from './Modal.svelte'
  import Numbers from './Numbers.svelte'

  let steps = [Drake, Timeline, Menu, Anaphor, Numbers, Dates, Modal]
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
