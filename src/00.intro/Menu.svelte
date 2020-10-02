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
    flex-wrap: nowrap;
    align-self: stretch;
  }
  .f2 {
    margin-top: 3rem;
    margin-bottom: 3rem;
    font-size: 2.2rem;
    color: steelblue;
  }
  .num {
    color: #978ba3;
    margin-left: 1.5rem;
    margin-right: 1.5rem;
  }
</style>

<div class="box">
  <div class="row">
    <div style="width:450px;">
      <img src="./src/00.intro/assets/cn-tower-jump.jpg" alt="" />
    </div>
    <div>
      <div style="text-align:left;" class="ml3">
        <div class="f2">
          <span class="num">1)</span>
          Keyboard interface
        </div>
        <div class="f2">
          <span class="num">2)</span>
          Markup languages
        </div>
        <div class="f2">
          <span class="num">3)</span>
          Text-editors
        </div>
        <!-- <div class="f2">4) Data structure</div> -->
        <div class="f2">
          <span class="num">4)</span>
          Novel interactions
        </div>
      </div>
    </div>
  </div>
</div>
<div class="notes" />
