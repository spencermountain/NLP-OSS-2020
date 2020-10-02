<script>
  import Image from '../Components/Image.svelte'
  let image = {
    src: './src/02.markup/assets/injection.jpg'
  }
</script>

<div class="box">
  <Image {...image} />
</div>

<div class="notes">
  <li>maybe the largest single failure of information technology</li>
</div>
