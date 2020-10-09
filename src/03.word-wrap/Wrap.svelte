<script>
  import Video from '../Components/Video.svelte'
  import wait from '../Components/wait'
  let video = {
    src: './src/03.word-wrap/assets/word-wrap.mp4',
    loop: true
  }
</script>

<style>

</style>

<div class="box">
  <video class="vid" src={video.src} loop autoplay muted>
    <track kind="captions" />
  </video>
</div>
