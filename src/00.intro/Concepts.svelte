<script>
  import Video from '../Components/Video.svelte'
  let videos = [
    { src: './mercury-os.mp4', title: 'MercuryOs', sub: 'by Jason Yuan' }
  ]
  let i = 0
</script>

<style>

</style>

<Video {...videos[i]} />
