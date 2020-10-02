<script>
  import Image from '../Components/Image.svelte'
  let image = {
    src: './src/02.markup/assets/einstein.jpg'
  }
</script>

<div class="box">
  <Image {...image} />
</div>

<div class="notes">
  <li>first two sentences</li>
  <li>dream of information-as-text</li>
</div>
