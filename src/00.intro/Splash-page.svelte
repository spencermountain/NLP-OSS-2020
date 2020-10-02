<script>
  import Image from '../Components/Image.svelte'
  let image = {
    src: './src/00.intro/assets/wolfram-desk.jpg',
    title: 'On Typing',
    sub: 'EMNLP 2020'
  }
</script>

<div class="box">
  <Image {...image} width="800px" />
</div>

<div class="notes" />
