<script>
  import Video from '../Components/Video.svelte'
  import wait from '../Components/wait'
  let video = {
    src: './src/05.focus/assets/focus.mp4'
  }
</script>

<style>

</style>

<div class="box">
  <div style="align-self:flex-start">keyboard focus:</div>
  <Video {...video} />
</div>
