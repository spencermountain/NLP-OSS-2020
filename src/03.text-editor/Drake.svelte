<script>
  import Video from '../Components/Video.svelte'
  import wait from '../Components/wait'
  let video = {
    src: './src/03.text-editor/assets/drake.mp4'
  }
</script>

<style>

</style>

<div class="box">
  <Video {...video} />
</div>
