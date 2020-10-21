<script>
  import nlp from '/Users/spencer/mountain/compromise/src'
  import numbers from '/Users/spencer/mountain/compromise/plugins/numbers/src'
  nlp.extend(numbers)
  import { Vertical } from '/Users/spencer/mountain/somehow-slider/src/index.mjs'
  let isZero = false
  let hover = false
  $: text = nlp('' + num)
    .values()
    .toText()
    .text()

  let num = 34
  $: noun = num !== 1 ? 'bottles' : 'bottle'
</script>

<style>
  .row {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    text-align: center;
    flex-wrap: nowrap;
    align-self: stretch;
  }
  .text {
    width: 1200px;
    font-family: Avenir Next Regular;
    font-size: 4rem;
    line-height: 2rem;
    color: #705e5c;
    text-align: left;
    position: relative;
  }
  .has {
    /* height: 300px; */
    transition: 0.2s;
    padding: 5px;
    border-radius: 4px;
    cursor: pointer;
    cursor: pointer;
    min-height: 400px;
    /* display: inline-block; */
  }
  .hover {
    background-color: #2d85a8;
    color: white;
  }
  .pink {
    background-color: #cc6966;
    color: white;
  }
  .abs {
    transition: 1.2s;
    position: absolute;
    height: 200px;
    top: -220px;
    left: 200px;
  }
  .hide {
    display: none;
    /* height: 0px; */
  }
</style>

<div class="box row" on:click={() => (hover = false)}>
  <div class="text">

    <div class="abs" class:hide={!hover}>
      <Vertical bind:value={num} min={0} max={100} />
    </div>

    <span class="has" class:hover on:mouseenter={() => (hover = true)}>
      {text}
    </span>
    <span class="has" class:pink={noun === 'bottle'}>{noun}</span>
    of beer on the wall
  </div>
</div>
