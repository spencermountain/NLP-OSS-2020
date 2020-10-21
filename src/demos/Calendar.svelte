<script>
  import nlp from '/Users/spencer/mountain/compromise/src'
  import spacetime from '/Users/spencer/mountain/spacetime/src'
  import numbers from '/Users/spencer/mountain/compromise/plugins/numbers/src'
  import dates from '/Users/spencer/mountain/compromise/plugins/dates/src'
  nlp.extend(numbers)
  nlp.extend(dates)
  import {
    Month,
    Day
  } from '/Users/spencer/mountain/somehow-calendar/src/index.mjs'
  let isZero = false
  let hover = false
  const fmt = '{day-short} {month} {date-ordinal}'

  let iso = '2020-10-10'
  $: text = spacetime(iso)
    .minus(1, 'day')
    .format(fmt)
  const onClick = function(d) {
    iso = d.format('iso-short')
    hover = false
  }
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
    background-color: #cc6966;
    color: white;
  }
  .pink {
    background-color: #cc6966;
    color: white;
  }
  .abs {
    transition: 1.2s;
    position: absolute;
    width: 200px;
    top: -230px;
    left: 200px;
  }
  .hide {
    display: none;
    /* height: 0px; */
  }
</style>

<div class="box row">
  <div class="text">

    <div class="abs" class:hide={!hover}>
      {#if hover}
        <Month date="october 2020" showToday={false} {onClick}>
          <Day bind:date={iso} color="red" />
        </Month>
      {/if}
    </div>

    <span class="has" class:hover on:mouseenter={() => (hover = true)}>
      {text}
    </span>
    at 3:15pm
  </div>
</div>
