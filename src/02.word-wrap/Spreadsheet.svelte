<script>
  let rows = 14
  let cols = 22
  let content = [
    '',
    ' in west philidelphia',
    ' born and raised,',
    ' on the playground',
    ' is where I spent',
    ' most of my days.'
  ]
  content = content.map(str => str.split(''))
</script>

<style>
  .container {
    display: grid;
    width: 100%;
    min-height: 100%;
    grid-template-columns: repeat(23, 50px);
    grid-gap: 0px;
    border: 1px solid lightgrey;
    justify-content: center;
    align-content: center;
    align-items: center;
    justify-items: center;
  }
  .cell {
    box-sizing: border-box;
    border: 1px solid grey;
    width: 50px;
    height: 40px;
    /* border-radius: 2px; */
    font-size: 36px;
    font-weight: bold;
    color: #333333;
    /* font-family: monospace; */
  }
  .top {
    background-color: lightsteelblue;
    height: 20px;
  }
  .num {
    background-color: lightsteelblue;
    /* width: 40px; */
    font-size: 12px;
  }
</style>

<div class="box">
  <div class="container">
    <!-- top row -->
    <div class="cell num top" />
    {#each Array(cols) as _2, i2}
      <div class="cell top" />
    {/each}

    {#each Array(rows) as _, i}
      <div class="cell num">{i}</div>
      {#each Array(cols) as _2, i2}
        {#if content[i] && content[i][i2]}
          <div class="cell">{content[i][i2]}</div>
        {:else}
          <div class="cell" />
        {/if}
      {/each}
    {/each}

  </div>
</div>
