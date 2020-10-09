<script>
  import TextArea from '../Components/TextArea.svelte'
  let str = `iiiii iiiii iiiii iiiii iiiii
wwwww wwwww wwwww
🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️ 🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️ 
`
</script>

<style>
  .middle {
    align-items: center;
  }
</style>

<div class="box middle">
  <TextArea value={str} />
</div>
