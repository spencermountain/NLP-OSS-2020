<script>
  import Image from '../Components/Image.svelte'
  import wait from '../Components/wait'
  let images = [
    {
      src: './src/03.word-wrap/assets/insert-1.png'
    },
    {
      src: './src/03.word-wrap/assets/insert-2.png'
    }
  ]
  let i = 0
  wait(1, () => {
    i += 1
  })
</script>

<style>

</style>

<div class="box">
  <Image {...images[i]} />
</div>
