<script>
  import Video from '../Components/Video.svelte'
  import wait from '../Components/wait'
  let video = {
    src: './src/01.02.typing/assets/now-cli.mp4',
    title: 'Now CLI',
    sub: 'by Guillermo Rauch'
  }
</script>

<style>

</style>

<div class="box">
  <Video {...video} />
</div>
