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
      <Key key="`" fill="rose" show="~" />
      <Key key="1" fill="rose" show="!" opacity="0.3" />
      <Key key="2" fill="rose" show="@" />
      <Key key="3" fill="rose" show="#" />
      <Key key="4" fill="rose" show="$" opacity="0.3" />
      <Key key="5" fill="rose" show="%" opacity="0.3" />
      <Key key="6" fill="rose" show="^" />
      <Key key="7" fill="rose" show="&" opacity="0.3" />
      <Key key="8" fill="rose" show="*" />
      <Key key="9" fill="rose" show="(" opacity="0.3" />
      <Key key="0" fill="rose" show=")" opacity="0.3" />
      <Key key="-" fill="rose" show="_" />
      <Key key="=" fill="rose" show="+" opacity="0.3" />
      <Key key="[" fill="rose" show="[" />
      <Key key="]" fill="rose" show="]" />
      <Key key="\" fill="rose" show="\" />
      <Key key=";" fill="rose" show=";" opacity="0.3" />
      <Key key="'" fill="rose" show="'" opacity="0.3" />
      <Key key="," fill="rose" show="<" />
      <Key key="." fill="rose" show=">" />
      <Key key="/" fill="rose" show="/" opacity="0.3" />

      <Key key="rshift" fill="pink" opacity="0.4" />
      <Key key="lshift" fill="pink" opacity="0.4" />
      <Key key="rctrl" fill="pink" opacity="0.4" />
      <Key key="ropt" fill="pink" opacity="0.4" />
      <Key key="rcmd" fill="pink" opacity="0.4" />
      <Key key="lctrl" fill="pink" opacity="0.4" />
      <Key key="lopt" fill="pink" opacity="0.4" />
      <Key key="lcmd" fill="pink" opacity="0.4" />
      <Key key="caps" fill="pink" opacity="0.4" />
      <Key key="space" fill="#a9bdd1" opacity="0.4" />
      <Key key="enter" fill="#a9bdd1" opacity="0.4" />
      <Key key="tab" fill="#a9bdd1" opacity="0.4" />
      <Key key="del" fill="#a9bdd1" opacity="0.4" />

    </Keyboard>
  </div>
</div>

<div class="notes">
  <li>9 control-characters</li>
</div>
