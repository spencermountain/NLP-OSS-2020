<script>
  import keyPress from '../Components/keyboard'
  export let done = () => {}
  export let prev = () => {}
  export let doEnd = false
  // pages
  import Monospace from './Monospace.svelte'
  import Spreadsheet from './Spreadsheet.svelte'
  import SpreadsheetSelect from './SpreadsheetSelect.svelte'
  import Wrap from './Wrap.svelte'
  import Poe from './Poe.svelte'
  import VariableWidth from './VariableWidth.svelte'
  import NotSpreadsheet from './NotSpreadsheet.svelte'
  import SplayTree from './SplayTree.svelte'
  import Crdt from './Crdt.svelte'
  import XiEditor from './XiEditor.svelte'

  let steps = [
    Monospace,
    Spreadsheet,
    Wrap,
    Poe,
    SpreadsheetSelect,
    VariableWidth,
    NotSpreadsheet,
    SplayTree,
    XiEditor,
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
