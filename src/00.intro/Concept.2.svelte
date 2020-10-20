<script>
  import Video from '../Components/Video.svelte'
  import wait from '../Components/wait'
  let video = {
    src: './src/00.intro/assets/desktop-neo.mp4',
    title: 'Desktop Neo',
    sub: 'by Lennart Ziburski',
    loop: true
  }
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
