<script>
  import Video from '../Components/Video.svelte'
  import wait from '../Components/wait'
  let video = {
    src: './src/01.keyboards/assets/oscars-talk.mp4',
    title: 'Taika Waititi',
    sub: 'at the 2020 Oscars',
    mute: false,
  }
</script>

<style>
</style>

<div class="box">
  <Video {...video} />
</div>
