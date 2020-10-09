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
  .topWord {
    position: absolute;
    top: 45px;
    left: 44%;
    width: 15%;
    text-align: left;
    font-size: 2.5rem;
    color: #6699cc;
    line-height: 4rem;
  }
  .bottom {
    position: absolute;
    bottom: 75px;
    left: 5%;
    width: 90%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    text-align: center;
    flex-wrap: wrap;
    align-self: stretch;

    font-size: 2.5rem;
    color: #6699cc;
    line-height: 4rem;
  }
  .desc {
    color: lightgrey;
    font-size: 1rem;
    position: absolute;
    top: 30px;
    margin-left: 45px;
  }
  .mud {
    color: #72697d;
  }
</style>

<div class="box">
  <div class="topWord">
    <div class="pink">El Niño</div>
    <div class="desc">original</div>
  </div>
  <div class="container">
    <Keyboard>
      <Key key="`" fill="blue" show="~" />
      <Key key="1" fill="rose" show="" opacity="0.3" />
      <Key key="2" fill="rose" show="" opacity="0.5" />
      <Key key="3" fill="rose" show="" opacity="0.5" />
      <Key key="4" fill="rose" show="" opacity="0.3" />
      <Key key="5" fill="rose" show="" opacity="0.3" />
      <Key key="6" fill="rose" show="" opacity="0.5" />
      <Key key="7" fill="rose" show="" opacity="0.3" />
      <Key key="8" fill="rose" show="" opacity="0.5" />
      <Key key="9" fill="rose" show="" opacity="0.3" />
      <Key key="0" fill="rose" show="" opacity="0.3" />
      <Key key="-" fill="rose" show="" opacity="0.5" />
      <Key key="=" fill="rose" show="" opacity="0.3" />
      <Key key="[" fill="rose" show="" opacity="0.5" />
      <Key key="]" fill="rose" show="" opacity="0.5" />
      <Key key="\" fill="rose" show="" opacity="0.5" />
      <Key key=";" fill="rose" show="" opacity="0.3" />
      <Key key="'" fill="rose" show="" opacity="0.3" />
      <Key key="," fill="rose" show="" opacity="0.5" />
      <Key key="." fill="rose" show="" opacity="0.5" />
      <Key key="/" fill="rose" show="" opacity="0.3" />

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
  <div class="bottom">
    <div>
      <div class="blue">~/desktop</div>
      <div class="desc">engineering</div>
    </div>
    <div>
      <div class="red">~$250</div>
      <div class="desc">adopted</div>
    </div>
  </div>
</div>

<div class="notes">
  <li>overstriking for spanish/portuguese</li>
  <li>approx from `≈`</li>
  <li>home dir</li>
</div>
