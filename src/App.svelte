<script>
  import { setContext } from 'svelte'
  setContext('size', { width: 1280, height: 720 })
  // let Cmp = null
  // import Cmp from './00.intro/Resolution-1.svelte'
  // import Cmp from './00.intro/Resolution-2.svelte'
  // import Cmp from './00.intro/Concepts.svelte'
  import Cmp from './02.word-wrap/Spreadsheet.svelte'
  let i = 0

  const pages = [
    './00.intro/Resolution-1.svelte',
    './00.intro/Resolution-2.svelte',
    './01.keyboards/Desks.svelte'
  ]

  const showPage = function() {
    import(pages[i]).then(res => {
      console.log(res)
      Cmp = res
    })
  }

  const nextPage = function(e) {
    console.log(e.keyCode)
    if (e.keyCode === 32 || e.keyCode === 39 || e.keyCode === 40) {
      i += 1
      showPage()
      e.preventDefault()
    }
    if (e.keyCode === 37 || e.keyCode === 38) {
      i -= 1
      showPage()
      e.preventDefault()
    }
    return false
  }
</script>

<style>

</style>

<svelte:window on:keydown={nextPage} />

<Cmp />
