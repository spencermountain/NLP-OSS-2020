<script>
  import keyPress from '../Components/keyboard'
  export let done = () => {}
  export let prev = () => {}
  export let doEnd = false
  // pages
  import Question from './Question.svelte'
  import Wikipedia from './Wikipedia.svelte'
  import Escaping from './Escaping.svelte'
  import Newline from './Newline.svelte'
  import MarkupQuestion from './MarkupQuestion.svelte'
  import Margin from './Margin.svelte'
  import Glimpse from './Glimpse.svelte'

  let steps = [
    Question,
    Wikipedia,
    MarkupQuestion,
    Escaping,
    Newline,
    Margin,
    Glimpse
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
