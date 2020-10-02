<script>
  import Video from '../Components/Video.svelte'
  import wait from '../Components/wait'
  let video = {
    src: './src/00.intro/assets/mercury-os.mp4',
    title: 'MercuryOs',
    sub: 'by Jason Yuan'
  }
  // {
  //   src: './src/00.intro/assets/desktop-neo.mp4',
  //   title: 'Desktop Neo',
  //   sub: 'by Lennart Ziburski',
  // },
  // {
  //   src: './src/00.intro/assets/vr-os.mp4',
  //   title: 'VR-OS',
  //   sub: 'by Matthaeus Krenn',
  // },
</script>

<style>

</style>

<div class="box">
  <Video {...video} />
</div>
