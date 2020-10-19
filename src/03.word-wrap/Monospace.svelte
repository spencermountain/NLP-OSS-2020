<script>
  import Image from '../Components/Image.svelte'
  let images = {
    src: './src/01.02.typing/assets/engelbart/engelbart-1.png'
  }
</script>

<style>
  .mono {
    font-family: monospace;
    text-align: left;
    margin-left: 3rem;
    font-size: 2rem;
    line-height: 2rem;
    color: #705e5c;
  }
  .row {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    text-align: center;
    flex-wrap: nowrap;
    align-self: stretch;
  }
  .green {
    color: #7f9c6c;
  }
</style>

<div class="box">
  <div class="row">
    <div style="width:600px">
      <Image {...images} />
    </div>
    <div class="mono">
      O R A N G E S
      <br />
      <span class="green">A P P L E S</span>
      <br />
      B A N A N A S
      <br />
      <span class="green">S O U P</span>
      <br />
      <span class="brown">P R O D U C E</span>
      <br />
      <span class="orange">&nbsp;&nbsp;&nbsp; C A R R O T S</span>
      <br />
    </div>
  </div>
</div>
