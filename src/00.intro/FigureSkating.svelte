<script>
  import Video from '../Components/Video.svelte'
  import wait from '../Components/wait'
  let video = {
    src: './src/00.intro/assets/kurt-1994.mp4',
    loop: true,
  }
</script>

<style>
</style>

<div class="box">
  <Video {...video} />
</div>
