<script>
  //export let name = ''
</script>

<style>
  .screen {
    width: 100%;
    height: 100%;
    background-image: url('../src/05.focus/assets/background.png');
    border-top: 20px solid black;
  }
  .row {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    text-align: center;
    flex-wrap: nowrap;
    align-self: stretch;
  }
  .window {
    position: relative;
    height: 70%;
    top: 2%;
    width: 600px;
    background-color: white;
    border: 1px solid grey;
    border-top: 22px solid grey;
    border-radius: 5px;
    box-shadow: 2px 2px 8px 0px rgba(0, 0, 0, 0.2);
    text-align: left;
  }
  .text {
    margin: 20px;
    margin-top: 5px;
  }
  .word {
    color: grey;
    margin-top: 3rem;
    /* margin-left: 3rem; */
  }
  .address {
    position: relative;
    left: 5%;
    width: 90%;
    margin: 3px;
    border: 1px solid grey;
  }
  .border {
    width: 100%;
    border-top: 3px solid grey;
  }
  .col {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    text-align: center;
    flex-wrap: wrap;
    align-self: stretch;
  }
  .mid {
    text-align: center;
  }
</style>

<div class="box">
  <div class="screen row">
    <div class="window">
      <input class="address" value="coolwebsite.com" />
      <div class="border col">

        <!-- <img
        src="./src/demos/assets/asdf.png"
        style="width:700px; margin:0px; box-shadow:none; border-top:3px solid
        grey;"
        alt="" /> -->
        <div class="mid">
          <div class="word i">username</div>
          <input class="text" />
        </div>
        <div class="mid">
          <div class="word i">password</div>
          <input class="text" />
        </div>
      </div>
    </div>
  </div>
</div>
<div class="notes">
  <li>ambiguous</li>
</div>
