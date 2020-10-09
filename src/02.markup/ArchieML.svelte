<script>
  import Image from '../Components/Image.svelte'
  let image = {
    src: './src/02.markup/assets/archie.png',
    title: 'ArchieML',
    sub: 'NYTimes'
  }
</script>

<div class="box">
  <Image {...image} />
</div>

<div class="notes" />
