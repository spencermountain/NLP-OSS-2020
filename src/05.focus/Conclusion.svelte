<script>
  export let done = () => {}
  export let doEnd
  export let prev

  const fullScreen = function(e) {
    var docElm = document.documentElement
    if (docElm.requestFullscreen) {
      docElm.requestFullscreen()
    } else if (docElm.msRequestFullscreen) {
      docElm.msRequestFullscreen()
    } else if (docElm.mozRequestFullScreen) {
      docElm.mozRequestFullScreen()
    } else if (docElm.webkitRequestFullScreen) {
      docElm.webkitRequestFullScreen()
    }
    e.preventDefault()
  }
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
  .container {
    margin: 4rem;
  }
  .square {
    flex: 1;
  }
  .btn {
    width: 50px;
  }
  .arrow {
    font-size: 3rem;
  }
</style>

<div class="box">
  <div class="container">
    <div class="row">
      <div class="square">
        <img
          style="width:350px;"
          src="./src/01.02.typing/assets/engelbart/engelbart-3.png"
          alt="" />
      </div>
      <div class="arrow">➔</div>
      <div class="square">
        <img
          style="height:220px; box-shadow: none;"
          src="./src/05.focus/assets/keyboard.png"
          alt="" />
      </div>
    </div>

    <div class="row">
      <div class="square">
        <img
          style="width:300px; margin-top:4rem; box-shadow: none;"
          src="./src/05.focus/assets/loop.png"
          alt="" />
      </div>
      <div class="arrow">➔</div>
      <div class="square">
        <img
          style="width:450px; box-shadow: none;"
          src="./src/05.focus/assets/cursor.png"
          alt="" />
      </div>
    </div>
  </div>
</div>
<div class="notes" />
