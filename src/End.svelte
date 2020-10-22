<script>
  import Image from './Components/Image.svelte'
</script>

<style>
  .row {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    text-align: center;
    flex-wrap: wrap;
    align-self: stretch;
  }
  .small {
    font-size: 0.7rem;
    font-family: monospace;
    margin-left: 6rem;
  }
</style>

<div class="box">
  <div class="row">
    <img style="width:250px;" src="./src/00.intro/assets/cn-tower.png" alt="" />
    <div>
      @spencermountain
      <div class="small">spencermounta.in/nlp-oss-2020</div>
    </div>
  </div>
</div>
<div class="notes" />
