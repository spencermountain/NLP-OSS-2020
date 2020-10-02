<script>
  import Image from '../Components/Image.svelte'
  let image = {
    src: './src/05.focus/assets/canon-cat.jpg',
    title: 'Canon Cat',
    sub: 'by Jef Raskin'
  }
</script>

<div class="box">
  <Image {...image} />
</div>
