<script>
  import Video from '../Components/Video.svelte'
  import wait from '../Components/wait'
  let video = {
    src: './src/00.intro/assets/kurt-1994.mp4',
    loop: true
  }
</script>

<style>

</style>

<div class="box">
  <Video {...video} />
</div>
<div class="notes">
  <li>bicyle for the mind</li>
  <li>smooth and comfortable fig skating routine</li>
  <li>how much of this is the keyboard?</li>
</div>
