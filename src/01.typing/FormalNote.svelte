<script>
  import Image from '../Components/Image.svelte'
  let image = {
    src: './src/01.typing/assets/spam.jpg'
  }
</script>

<style>
  .m2 {
    margin: 4rem;
    font-size: 1.5rem;
  }
  .intro {
    margin-top: 5rem;
    margin-left: 2rem;
    font-size: 1.5rem;
    line-height: 2.1rem;
  }
  .letter {
    width: 500px;
    height: 600px;
    background-color: #a8a094;
    font-family: monospace;
    padding: 1rem;

    text-align: left;
    font-style: italic;
    border-radius: 5px;
    box-shadow: 2px 2px 8px 0px rgba(0, 0, 0, 0.2);
    margin: 2rem;
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
</style>

<div class="box">
  <div class="row">
    <div>
      <img
        style="width:400px;"
        src="./src/01.typing/assets/secretary.jpg"
        alt="" />
    </div>
    <div class="letter">
      <div class="m2">
        Acme Inc
        <br />
        123 Main st
        <br />
        555-1234
      </div>
      <div class="intro">
        Dear _______,
        <br />
        I am writing you concerning a new opportunity. Here at Widgets co we are
        working on a new cutting-edge system...
      </div>
    </div>
  </div>
</div>

<div class="notes">
  <li>spam</li>
  <li>formality of letter-writing</li>
  <li>(unintended consequences)</li>
</div>
