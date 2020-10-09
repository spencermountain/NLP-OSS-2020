<script>
  import keyPress from '../Components/keyboard'
  export let done = () => {}
  export let prev = () => {}
  export let doEnd = false
  // pages
  import Newline from './Newline.svelte'
  import Spreadsheet from './Spreadsheet.svelte'
  import Spreadsheet2 from './Spreadsheet2.svelte'
  import Wrap from './Wrap.svelte'
  import VariableWidth from './VariableWidth.svelte'
  import Insert from './Insert.svelte'
  import Crdt from './Crdt.svelte'

  let steps = [
    Newline,
    Spreadsheet,
    Wrap,
    Insert,
    VariableWidth,
    Spreadsheet2,
    Crdt
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
