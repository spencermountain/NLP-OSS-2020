<script>
  import Video from '../Components/Video.svelte'
  import wait from '../Components/wait'
  let video = {
    src: './src/02.markup/assets/glimpse.mp4',
    title: 'Glimpse',
    sub: 'UIST 2011: Dragicevic, Huot, Chevalier'
  }
</script>

<style>

</style>

<div class="box">
  <Video {...video} loop="true" />
</div>
<div class="notes">
  <li>ACM conference in 2011</li>
  <li>giving-up on wysiwyg</li>
</div>
