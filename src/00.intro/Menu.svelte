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
          <span class="num red">↓</span>
          Keyboards
        </div>
        <div class="f2">
          <span class="num pink">↓</span>
          <span style="color:#AB5850;">Punctuation</span>
        </div>
        <div class="f2">
          <span class="num blue">↓</span>
          <span style="color:#6699cc;">Markup languages</span>
        </div>
        <div class="f2">
          <span class="num rose">↓</span>
          <span style="color:#8BA3A2;">Data structures</span>
        </div>
        <div class="f2 rouge">
          <span class="num">↓</span>
          <span style="color:#d8b3e6;">NLP interface</span>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="notes">
  <li>1 - actual act of typing</li>
  <li>2 - punctuation and markup</li>
  <li>3 - word-wrap & datastructures</li>
  <li>4 - refactoring sentences, keyboard focus</li>
</div>
