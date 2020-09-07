<script>
  import Image from '../Components/Image.svelte'
  let commits = {
    src: './src/00.intro/assets/commit-graph.png',
  }
  let arms = {
    src: './src/00.intro/assets/arms.png',
  }
</script>

<style>
  .background {
    position: absolute;
    left: 0px;
  }
  .img {
    margin: 0px;
  }
  .mid {
    z-index: 4;
    position: relative;
    top: 180px;
    /* transform: translate(0px -40px); */
  }
</style>

<div class="box">
  <div class="background">
    <img class="img" src="./src/00.intro/assets/arms.png" alt="" />
  </div>
  <div class="mid">
    <Image {...commits} />
  </div>
</div>
