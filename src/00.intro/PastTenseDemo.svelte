<script>
  import Video from '../Components/Video.svelte'
  import wait from '../Components/wait'
  let src = './src/00.intro/assets/pasttense-demo.mp4'
</script>

<div class="box">
  <div class="size">
    <video style="width:700px;" class="vid" {src} loop="true" autoplay muted>
      <track kind="captions" />
    </video>
  </div>
</div>
