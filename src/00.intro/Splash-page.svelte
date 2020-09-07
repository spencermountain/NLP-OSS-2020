<script>
  import Image from '../Components/Image.svelte'
  let image = {
    src: './src/00.intro/assets/splash.png',
    title: 'On Typing',
    sub: 'EMNLP 2020',
  }
</script>

<div class="box">
  <Image {...image} />
</div>
