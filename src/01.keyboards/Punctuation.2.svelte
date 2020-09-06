<script>
  //export let name = ''
</script>

<style>
  .container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    text-align: center;
    flex-wrap: wrap;
    align-self: stretch;
    margin-left: 200px;
  }
  .row {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    text-align: center;
    flex-wrap: wrap;
    align-self: stretch;
  }
  .key {
    border: 1px solid grey;
    border-radius: 3px;
    width: 50px;
    height: 30px;
    margin: 4px;
    color: #fbfbfb;
    box-sizing: border-box;
  }
  .show {
    color: #6699cc;
    border: 2px solid #6699cc;
  }
  .nope {
    opacity: 0.2;
  }
  .red {
    border: 2px solid #d68881;
  }
  .pink {
    border: 2px solid #f2c0bb;
  }
</style>

<div class="box">
  <div class="container">
    <div class="row">
      <div class="key show" style="max-width:30px;">~</div>
      <div class="key show nope">!</div>
      <div class="key show">@</div>
      <div class="key show">#</div>
      <div class="key show nope">$</div>
      <div class="key show nope">%</div>
      <div class="key show">^</div>
      <div class="key show">&</div>
      <div class="key show">*</div>
      <div class="key show nope">(</div>
      <div class="key show nope">)</div>
      <div class="key show nope">-</div>
      <div class="key show nope">=</div>
      <div class="key nope pink" style="width:70px">⟵</div>
    </div>
    <div class="row">
      <div class="key nope pink" style="width:50px">tab</div>
      <div class="key nope">q</div>
      <div class="key nope">w</div>
      <div class="key nope">e</div>
      <div class="key nope">r</div>
      <div class="key nope">t</div>
      <div class="key nope">y</div>
      <div class="key nope">u</div>
      <div class="key nope">i</div>
      <div class="key nope">o</div>
      <div class="key nope">p</div>
      <div class="key show">[</div>
      <div class="key show">]</div>
      <div class="key show">\</div>
    </div>
    <div class="row">
      <div class="key nope pink" style="width:80px">caps</div>
      <div class="key nope">a</div>
      <div class="key nope">s</div>
      <div class="key nope">d</div>
      <div class="key nope">f</div>
      <div class="key nope">g</div>
      <div class="key nope">h</div>
      <div class="key nope">j</div>
      <div class="key nope">k</div>
      <div class="key nope">l</div>
      <div class="key nope show">;</div>
      <div class="key nope show">'</div>
      <div class="key nope pink" style="width:80px">↵</div>
    </div>
    <div class="row">
      <div class="key nope pink" style="width:110px">⇧</div>
      <div class="key nope">z</div>
      <div class="key nope">x</div>
      <div class="key nope">c</div>
      <div class="key nope">v</div>
      <div class="key nope">b</div>
      <div class="key nope">n</div>
      <div class="key nope">m</div>
      <div class="key nope show">,</div>
      <div class="key nope show">.</div>
      <div class="key nope show">/</div>
      <div class="key nope pink" style="width:110px">⇧</div>
    </div>
    <div class="row">
      <div class="key nope pink" style="width:70px">⌃</div>
      <div class="key nope pink" style="width:70px">⌥</div>
      <div class="key nope pink" style="width:70px">⌘</div>
      <div class="key nope " style="width:340px" />
      <div class="key nope pink" style="width:70px">⌘</div>
      <div class="key nope pink" style="width:70px">⌥</div>
      <div class="key nope pink" style="width:70px">⌃</div>
    </div>
  </div>
</div>
