<script>
  let list = [
    { name: 'ugh.', id: 0 },
    { name: 'i still have a lot to do on this presentation.', id: 1 },
    { name: `it's pretty rambling still.`, id: 2 },
    { name: 'and the examples are confusing.', id: 3 }
  ]
  let hovering = false

  const drop = (event, target) => {
    event.dataTransfer.dropEffect = 'move'
    const start = parseInt(event.dataTransfer.getData('text/plain'))
    const newTracklist = list

    if (start < target) {
      newTracklist.splice(target + 1, 0, newTracklist[start])
      newTracklist.splice(start, 1)
    } else {
      newTracklist.splice(target, 0, newTracklist[start])
      newTracklist.splice(start + 1, 1)
    }
    list = newTracklist
    hovering = null
  }

  const dragstart = (event, i) => {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.dropEffect = 'move'
    const start = i
    event.dataTransfer.setData('text/plain', start)
  }
</script>

<style>
  .container {
    background-color: white;
    border-radius: 4px;
    width: 400px;
    margin: 3rem;
    text-align: left;
    box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
  }

  .list-item {
    display: block;
    margin: 0.5rem;
  }

  .list-item.is-active {
    border-bottom: 1px solid #3273dc;
    color: #fff;
  }
  .clicked {
    border-bottom: 2px solid darkred;
  }
</style>

<div class="container">
  {#each list as n, index (n.name)}
    <div
      class="list-item"
      draggable={true}
      on:dragstart={event => dragstart(event, index)}
      on:drop|preventDefault={event => drop(event, index)}
      ondragover="return false"
      on:dragenter={() => (hovering = index)}
      class:is-active={hovering === index}>
      {n.name}
    </div>
  {/each}
</div>
