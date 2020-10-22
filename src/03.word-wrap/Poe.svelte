<script>
  import Video from '../Components/Video.svelte'
  import wait from '../Components/wait'
  let src = './src/03.word-wrap/assets/poe.mp4'
</script>

<style>

</style>

<div class="box">
  <!-- <div class="goleft i">date-parsing demo</div> -->
  <video {src} loop="true" autoplay muted={true}>
    <track kind="captions" />
  </video>
</div>
