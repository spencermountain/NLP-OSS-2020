<script>
  import Image from '../Components/Image.svelte'
  let image = {
    src: './src/01.02.typing/assets/typewriter.jpg'
  }
</script>

<div class="box">
  <!-- <Image {...image} /> -->
  <img src={image.src} alt="" />
</div>

<div class="notes">
  <li>we romanticize them, but hellish</li>
  <li>undiagnosed domestic pain - defines modern working conditions</li>
  <li>professionalism</li>
</div>
