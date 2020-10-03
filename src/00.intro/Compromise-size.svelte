<script>
  import Image from '../Components/Image.svelte'
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
  .img {
    box-shadow: none;
  }
</style>

<div class="box">
  <div class="row">
    <img class="img" src="./src/00.intro/assets/compromise-size.png" alt="" />
  </div>
</div>
<div class="notes">
  <li>170kb</li>
</div>
