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
    height: 90%;
    top: 2%;
    width: 530px;
    padding: 10px;
    background-color: white;
    border: 1px solid grey;
    border-top: 22px solid grey;
    border-radius: 5px;
    box-shadow: 2px 2px 8px 0px rgba(0, 0, 0, 0.2);
    text-align: left;
    overflow: hidden;
  }
  .text {
    margin: 15px;
    color: grey;
  }
  .bottom {
    background-color: #333333;
    color: #fbfbfb;
    width: 90%;
    height: 250px;
    margin-left: 10px;
    padding: 10px;
    border-radius: 5px;
    font-size: 25px;
    box-shadow: 2px 2px 8px 0px rgba(0, 0, 0, 0.2);
    align-items: flex-start !important;
  }
  .col {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    text-align: center;
    flex-wrap: wrap;
    align-self: stretch;
  }
  .textside {
    flex: 1;
    border: 2px solid grey;
    padding: 10px;
    margin: 10px;
    height: 190px;
    text-align: left;
    border-radius: 5px;
  }
  .button {
    background-color: #978ba3;
    color: white;
    font-size: 23px;
    height: 40px;
    border-radius: 5px;
    margin: 5px;
    padding: 5px;
    align-self: flex-end;
    box-shadow: 2px 2px 8px 0px rgba(0, 0, 0, 0.2);
  }
</style>

<div class="box">
  <div class="screen col">
    <div class="row mt2">
      <div class="window">
        <div class="text i">window A</div>
        <textarea class="area" />
      </div>
      <div class="window">
        <div class="text i">window B</div>
        <textarea class="area" />
      </div>
    </div>

    <div class="bottom row">
      <div class="textside">
        in west philidelphia born and raised, on the playground is
      </div>
      <div style="width:150px;">
        <div class="button">keep</div>
      </div>
    </div>
  </div>
</div>
<div class="notes">
  <li>ambiguous</li>
</div>
