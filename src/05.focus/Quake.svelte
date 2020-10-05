<script>
  import Image from '../Components/Image.svelte'
  let image = {
    src: './src/05.focus/assets/quake-wide.png',
    title: 'Quake',
    sub: 'id Software - 1996'
  }
</script>

<div class="box">
  <Image {...image} />
</div>
