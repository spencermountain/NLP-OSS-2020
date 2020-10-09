<script>
  import Image from '../Components/Image.svelte'
  import wait from '../Components/wait'
  let images = {
    src: './src/03.word-wrap/assets/jared-crdt.png',
    title: 'text-crdt',
    sub: 'Jared Forsyth'
  }
</script>

<style>

</style>

<div class="box">
  <Image {...images} />
</div>
