<script>
  import Video from '../Components/Video.svelte'
  import wait from '../Components/wait'
  let videos = [
    {
      src: './src/00.intro/assets/mercury-os.mp4',
      title: 'MercuryOs',
      sub: 'by Jason Yuan'
    },
    {
      src: './src/00.intro/assets/desktop-neo.mp4',
      title: 'Desktop Neo',
      sub: 'by Lennart Ziburski'
    },
    {
      src: './src/00.intro/assets/vr-os.mp4',
      title: 'VR-OS',
      sub: 'by Matthaeus Krenn'
    }
  ]
  let i = 0
  wait(9, () => {
    i += 1
    wait(5, () => {
      i += 1
    })
  })
</script>

<style>

</style>

<div class="box">
  <Video {...videos[i]} />
</div>
