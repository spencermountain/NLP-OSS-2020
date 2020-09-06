<script>
  import Video from '../Components/Video.svelte'
  let videos = [
    { src: './mercury-os.mp4', title: 'MercuryOs', sub: 'by Jason Yuan' },
    { src: './vr-os.mp4', title: 'VR-OS', sub: 'by Matthaeus Krenn' },
    {
      src: './desktop-neo.mp4',
      title: 'Desktop Neo',
      sub: 'by Lennart Ziburski'
    }
  ]
  let i = 0
</script>

<style>

</style>

<div class="box">
  <Video {...videos[i]} />
</div>
