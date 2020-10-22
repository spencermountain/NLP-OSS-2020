<script>
  import Video from '../Components/Video.svelte'
  import wait from '../Components/wait'
  let src = './src/04.text-editor/assets/dates.mp4'
</script>

<style>
  .goleft {
    align-self: flex-start;
    margin-left: 8rem;
    margin-top: 4rem;
  }
</style>

<div class="box">
  <div class="goleft i">date-parsing demo</div>
  <video {src} loop="true" autoplay muted={true}>
    <track kind="captions" />
  </video>
</div>
