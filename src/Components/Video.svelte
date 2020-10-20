<script>
  export let src = ''
  export let title = ''
  export let sub = ''
  export let loop = false
  export let mute = true
</script>

<style>
  .caption {
    position: absolute;
    top: 80%;
    left: 5%;
    z-index: 4;
    height: 5.8rem;
    width: 500px;
    background-color: #2d85a8;
    color: #d7d5d2;
    font-size: 4rem;
    box-shadow: 2px 2px 8px 0px rgba(45, 133, 168, 0.2);
    border-radius: 5px;
  }
  .title {
    top: 25px;
    left: 40px;
    position: absolute;
  }
  .sub {
    bottom: 5px;
    position: absolute;
    right: 10px;
    font-size: 0.9rem;
    margin-top: 20px;
    font-style: italic;
  }
  .vid {
    margin-bottom: 0px;
    border-radius: 5px;
    box-shadow: 2px 2px 8px 0px rgba(0, 0, 0, 0.2);
    width: 80%;
  }
</style>

{#if title}
  <div class="caption">
    <div class="title">{title}</div>
    <div class="sub">{sub}</div>
  </div>
{/if}
<div class="m3">
  <video class="vid" {src} {loop} autoplay muted={mute}>
    <track kind="captions" />
  </video>
</div>
