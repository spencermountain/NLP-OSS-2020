<script>
  export let done = () => {}
  export let doEnd
  export let prev
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
</style>

<svelte:body on:keydown={done} on:click={done} />

<div class="box">
  <div class="container">
    <div class="row">
      <div class="square">
        <img
          style="width:450px;"
          src="./src/00.intro/assets/wolfram-desk.jpg"
          alt="" />
      </div>
      <div class="square">
        <img
          style="height:320px;"
          src="./src/02.markup/assets/injection.jpg"
          alt="" />
      </div>
    </div>

    <div class="row">
      <div class="square">
        <img
          style="width:450px;"
          src="./src/00.intro/assets/splash.png"
          alt="" />
      </div>
      <div class="square f4">
        On typing
        <div class="f1">
          NLP-OSS 2020
          <span class="blue ">@spencermountain</span>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="notes" />
