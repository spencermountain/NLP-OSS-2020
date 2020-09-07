<script>
  import Image from '../Components/Image.svelte'
  import wait from '../Components/wait'
  let image = {
    src: './src/01.keyboards/assets/iss-laptop.jpg',
    title: '',
    sub: '',
  }
</script>

<style>
</style>

<div class="box">
  <Image {...image} />
</div>
