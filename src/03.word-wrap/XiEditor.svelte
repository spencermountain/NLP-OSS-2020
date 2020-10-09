<script>
  import Image from '../Components/Image.svelte'
  let images = {
    src: './src/03.word-wrap/assets/xi-editor.png',
    title: 'Xi-editor',
    sub: 'Raph Levien'
  }
</script>

<style>

</style>

<div class="box">
  <Image {...images} />
</div>
