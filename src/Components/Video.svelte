<script>
  export let src = ''
  export let title = ''
  export let sub = ''
</script>

<style>
  video {
    border-radius: 4px;
    z-index: 1;
  }
  .caption {
    position: absolute;
    top: 80%;
    left: 5%;
    z-index: 4;
    height: 5.8rem;
    width: 500px;
    background-color: #914045;
    color: #d7d5d2;
    font-size: 4rem;
    box-shadow: 2px 2px 8px 0px rgba(0, 0, 0, 0.2);
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
</style>

<div class="caption">
  <div class="title">{title}</div>
  <div class="sub">{sub}</div>
</div>
<video style="margin-bottom:0px; " {src} autoplay mute>
  <track kind="captions" />
</video>
