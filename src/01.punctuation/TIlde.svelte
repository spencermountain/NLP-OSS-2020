<script>
  import Image from '../Components/Image.svelte'
  import wait from '../Components/wait'
  let image = {
    src: './src/01.punctuation/assets/tilde.png',
    title: '',
    sub: ''
  }
</script>

<style>

</style>

<div class="box">
  <Image {...image} />
</div>

<div class="notes">
  <li>Siegler ADM-3A</li>
</div>
