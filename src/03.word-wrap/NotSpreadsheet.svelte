<script>
  let rows = 14
  let cols = 22
  let content = [
    '',
    ' in west philadelphia',
    ' born and raised,',
    ' on the playground',
    ' is where I spent',
    ' most of my days.'
  ]
  content = content.map(str => str.split(''))
  let letters = 'abcdefghijklmnopqrstuv'.split('')
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
    border-radius: 5px;
    box-shadow: 2px 2px 8px 0px rgba(0, 0, 0, 0.2);
  }
  .cell {
    box-sizing: border-box;
    border: 1px solid #d7d5d2;
    width: 50px;
    height: 40px;
    font-size: 30px;
    font-weight: bold;
    color: #443d3d;
    line-height: 40px;
    /* font-family: monospace; */
  }
  .top {
    background-color: lightsteelblue;
    line-height: 20px;
    height: 20px;
    color: #abb0b3;
    font-size: 12px;
  }
  .num {
    background-color: lightsteelblue;
    color: #abb0b3;
    font-size: 12px;
  }
  .overlay {
    position: absolute;
    background-color: rgba(244, 244, 244, 0.9);
    width: 80%;
    height: 80%;
    box-shadow: 2px 2px 8px 0px rgba(0, 0, 0, 0.2);
    border: 4px solid #d68881;
    font-size: 3.5rem;
    border-radius: 5px;
  }
  .diff {
    line-height: 6rem;
    color: #d68881;
    position: absolute;
    text-align: left;
    width: 65%;
    left: 20%;
    top: 20%;
  }
</style>

<div class="box">
  <div class="container">
    <div class="overlay">
      <div class="diff i">
        <div>✗ append-mode</div>
        <div>✗ word-wrap</div>
        <div>✗ variable-width fonts</div>
      </div>
    </div>
    <!-- top row -->
    <div class="cell num top" />
    {#each Array(cols) as _2, i2}
      <div class="cell top">{letters[i2] || ''}</div>
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
<div class="notes">
  <li>complex datastructure required</li>
</div>
