<script>
  import Image from '../Components/Image.svelte'
  let image = {
    src: './src/00.intro/assets/bear.png',
    title: 'Bear App',
    sub: 'by Shiny Frog'
  }
</script>

<div class="box">
  <Image {...image} />
</div>
<div class="notes">
  <li>product manager used it</li>
  <li>mesmerizing to watch</li>
</div>
