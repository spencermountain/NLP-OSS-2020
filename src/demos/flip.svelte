<script>
  //export let name = ''
  import { onMount } from 'svelte'

  onMount(() => {
    // var card = document.querySelector('.card')
    // console.log(card)
    // card.addEventListener('click', function() {
    //   card.classList.toggle('is-flipped')
    // })
  })
</script>

<style>
  .flip-container {
    -webkit-perspective: 1000;
    -moz-perspective: 1000;
    -o-perspective: 1000;
    perspective: 1000;
    border: 1px solid #ccc;
  }

  .flip-container:hover .flipper,
  .flip-container.hover .flipper {
    transform: rotateY(180deg);
  }

  .flip-container,
  .front,
  .back {
    width: 80px;
    height: 47px;
  }

  .flipper {
    transition: 0.6s;
    transform-style: preserve-3d;
    position: relative;
  }

  .front,
  .back {
    backface-visibility: hidden;
    position: absolute;
    top: 0;
    left: 0;
  }

  .front {
    z-index: 2;
  }

  .back {
    transform: rotateY(180deg);
    background: #f8f8f8;
  }
  .row {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    text-align: center;
    flex-wrap: nowrap;
    align-self: stretch;
  }
</style>

<div class="row">
  before
  <div
    class="flip-container"
    on:click={e => e.target.classList.toggle('flipped')}>
    <div class="flipper">
      <div class="front">front</div>
      <div class="back">backkkkk</div>
    </div>
  </div>
  after
</div>
