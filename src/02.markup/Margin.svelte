<script>
  import Image from '../Components/Image.svelte'
  let image = {
    src: './src/02.markup/assets/margin.png',
    title: 'Margin.love',
    sub: 'Alex Gamburg'
  }
</script>

<div class="box">
  <Image {...image} />
</div>

<div class="notes">
  <li>non-programmers writing data</li>
  <li>nytimes uses archieML</li>
</div>
