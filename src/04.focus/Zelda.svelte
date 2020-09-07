<script>
  import Video from '../Components/Video.svelte'
  import wait from '../Components/wait'
  let video = {
    src: './src/04.focus/assets/zelda-2.mp4',
  }
</script>

<style>
</style>

<div class="box">
  <Video {...video} />
</div>
