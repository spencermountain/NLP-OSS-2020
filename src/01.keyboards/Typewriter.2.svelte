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
  .red {
    border: 2px solid #d68881;
    background-color: #d68881;
    color: #d68881;
  }
  .blue {
    border: 2px solid #6699cc;
    background-color: #6699cc;
    color: #6699cc;
  }
</style>

<div class="box">
  <div class="container">
    <div class="row">
      <div class="key" style="max-width:30px;">~</div>
      <div class="key">!</div>
      <div class="key">@</div>
      <div class="key">#</div>
      <div class="key">$</div>
      <div class="key">%</div>
      <div class="key">^</div>
      <div class="key">&</div>
      <div class="key">*</div>
      <div class="key">(</div>
      <div class="key">)</div>
      <div class="key">-</div>
      <div class="key">=</div>
      <div class="key" style="width:70px">⟵</div>
    </div>
    <div class="row">
      <div class="key red" style="width:50px">tab</div>
      <div class="key">q</div>
      <div class="key">w</div>
      <div class="key">e</div>
      <div class="key">r</div>
      <div class="key">t</div>
      <div class="key">y</div>
      <div class="key">u</div>
      <div class="key">i</div>
      <div class="key">o</div>
      <div class="key">p</div>
      <div class="key">[</div>
      <div class="key">]</div>
      <div class="key">\</div>
    </div>
    <div class="row">
      <div class="key red" style="width:80px">caps</div>
      <div class="key">a</div>
      <div class="key">s</div>
      <div class="key">d</div>
      <div class="key">f</div>
      <div class="key">g</div>
      <div class="key">h</div>
      <div class="key">j</div>
      <div class="key">k</div>
      <div class="key">l</div>
      <div class="key">;</div>
      <div class="key">'</div>
      <div class="key blue" style="width:80px">↵</div>
    </div>
    <div class="row">
      <div class="key red" style="width:110px">⇧</div>
      <div class="key">z</div>
      <div class="key">x</div>
      <div class="key">c</div>
      <div class="key">v</div>
      <div class="key">b</div>
      <div class="key">n</div>
      <div class="key">m</div>
      <div class="key">,</div>
      <div class="key">.</div>
      <div class="key">/</div>
      <div class="key red" style="width:110px">⇧</div>
    </div>
    <div class="row">
      <div class="key" style="width:70px">⌃</div>
      <div class="key" style="width:70px">⌥</div>
      <div class="key" style="width:70px">⌘</div>
      <div class="key red" style="width:340px" />
      <div class="key" style="width:70px">⌘</div>
      <div class="key" style="width:70px">⌥</div>
      <div class="key" style="width:70px">⌃</div>
    </div>
  </div>
</div>
