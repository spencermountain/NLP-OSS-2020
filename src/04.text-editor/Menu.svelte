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
    <div style="width:350px;">
      <img src="./src/04.text-editor/assets/parking.png" alt="" />
    </div>
    <div>
      <div style="text-align:left;" class="ml3">
        <div class="f2">
          <span class="num red">1)</span>
          Sentence re-ordering
        </div>
        <div class="f2">
          <span class="num pink">2)</span>
          Modality change
        </div>
        <div class="f2">
          <span class="num rose">3)</span>
          Clause shifting
        </div>
        <div class="f2 rouge">
          <span class="num">4)</span>
          Adverb shifting
        </div>
      </div>
    </div>
  </div>
</div>
<div class="notes">
  <li>1 - anaphora resolution</li>
  <li>2 -setting tone</li>
  <li>3 - verb-agreement</li>
  <li>4 - adverb-ordering</li>
</div>
