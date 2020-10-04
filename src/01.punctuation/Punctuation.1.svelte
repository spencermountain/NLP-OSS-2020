<script>
  //export let name = ''
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
  .pink {
    border: 2px solid #f2c0bb;
  }
</style>

<div class="box">
  <div class="container">
    <Keyboard>
      <Key key="rshift" fill="red" show="" />
      <Key key="lshift" fill="red" show="" />
      <Key key="rctrl" fill="red" show="" />
      <Key key="ropt" fill="red" show="" />
      <Key key="rcmd" fill="red" show="" />
      <Key key="lctrl" fill="red" show="" />
      <Key key="lopt" fill="red" show="" />
      <Key key="lcmd" fill="red" show="" />
      <Key key="caps" fill="red" show="" />
      <Key key="space" fill="#94b4d4" show="" />
      <Key key="enter" fill="#94b4d4" show="" />
      <Key key="tab" fill="#94b4d4" show="" />
      <Key key="del" fill="#94b4d4" show="" />
    </Keyboard>
  </div>
</div>
