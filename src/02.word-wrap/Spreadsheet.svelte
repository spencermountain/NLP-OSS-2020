<script>
  let rows = 14
  let cols = 22
</script>

<style>
  .container {
    display: grid;
    width: 100%;
    min-height: 100%;
    grid-template-columns: repeat(23, 50px);
    grid-gap: 3px;
    border: 1px solid lightgrey;
    justify-content: center;
    align-content: center;
  }
  .cell {
    border: 1px solid grey;
    width: 50px;
    height: 40px;
    border-radius: 2px;
    font-size: 12px;
  }
  .top {
    background-color: lightsteelblue;
    height: 25px;
  }
  .num {
    background-color: lightsteelblue;
    width: 40px;
    color: #fbfbfb;
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
        <div class="cell" />
      {/each}
    {/each}

  </div>
</div>
