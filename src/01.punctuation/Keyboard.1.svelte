<script>
  import {
    Keyboard,
    Key
  } from '/Users/spencer/mountain/somehow-keyboard/src/index.mjs'
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
    margin: 10%;
  }
</style>

<div class="box">
  <div class="container">
    <Keyboard>
      <Key key="rshift" fill="pink" />
      <Key key="lshift" fill="pink" />
      <Key key="rctrl" fill="pink" />
      <Key key="ropt" fill="pink" />
      <Key key="rcmd" fill="pink" />
      <Key key="lctrl" fill="pink" />
      <Key key="lopt" fill="pink" />
      <Key key="lcmd" fill="pink" />
      <Key key="caps" fill="pink" />
      <Key key="space" fill="#a9bdd1" />
      <Key key="enter" fill="#a9bdd1" />
      <Key key="tab" fill="#a9bdd1" />
      <Key key="del" fill="#a9bdd1" />
    </Keyboard>
  </div>
</div>

<div class="notes">
  <li>we're maxed for keys'</li>
</div>
