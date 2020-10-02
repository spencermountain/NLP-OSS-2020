<script>
  import keyPress from '../Components/keyboard'
  export let done = () => {}
  export let prev = () => {}
  export let doEnd = false
  // pages
  import Splash from './Splash-page.svelte'
  import Compromise from './Compromise.svelte'
  import Resolution1 from './Resolution-1.svelte'
  import Resolution2 from './Resolution-2.svelte'
  import Concept1 from './Concept.1.svelte'
  import Concept2 from './Concept.2.svelte'
  import Concept3 from './Concept.3.svelte'
  import Shoulders from './Shoulders.svelte'
  import Bear from './Bear.svelte'
  import FigureSkating from './FigureSkating.svelte'
  import Question from './Question.svelte'
  import LoveTyping from './Question.svelte'
  import Menu from './Menu.svelte'

  let steps = [
    Splash,
    Compromise,
    Resolution1,
    Resolution2,
    Concept1,
    Concept2,
    Concept3,
    Shoulders,
    Bear,
    FigureSkating,
    Question,
    LoveTyping,
    Menu
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
