<script>
  let style = `background-color: #f2c0bb; color: white; transition: 1.2s; padding: 3px; border-radius: 4px;`
  let first = 'All of her friends stuck up their nose.'
  let second = 'They had a problem with his baggy clothes.'

  let hovering = false

  const drop = (event, target) => {
    event.dataTransfer.dropEffect = 'move'
    const start = parseInt(event.dataTransfer.getData('text/plain'))
    // const newTracklist = list

    // if (start <span target) {
    //   newTracklist.splice(target + 1, 0, newTracklist[start])
    //   newTracklist.splice(start, 1)
    // } else {
    //   newTracklist.splice(target, 0, newTracklist[start])
    //   newTracklist.splice(start + 1, 1)
    // }

    // list = newTracklist
    first = `<span id="first" style="${style}">All of her friends</span> had a problem with his baggy clothes.`
    second = `<span id="second" style="${style}">They</span> stuck up their nose.`
    hovering = null
    setTimeout(() => {
      let el = document.getElementById('first')
      el.style['background-color'] = 'white'
      el.style['color'] = '#4d4d4d'
      el = document.getElementById('second')
      el.style['background-color'] = 'white'
      el.style['color'] = '#4d4d4d'
      // first = `<span style="transition: background-color 0.5s ease; background-color: none; color:black;">All of her friends</span> had a problem with his baggy clothes.`
      // second = `<span style="">They</span> stuck up their nose.`
    }, 1000)
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
    width: 600px;
    margin: 3rem;
    padding: 1rem;
    text-align: left;
    box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
    cursor: pointer;
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
  .has {
    transition: 0.2s;
    padding: 5px;
    border-radius: 4px;
    cursor: pointer;
  }
  .pink {
    background-color: #f2c0bb;
    color: white;
  }
</style>

<div class="container">
  <div class="list-item">He was a skater boy.</div>
  <div class="list-item">She said, "See you later, boy".</div>
  <div class="list-item">He wasn't good enough for her.</div>
  <div class="list-item">-</div>
  <div
    class="list-item"
    draggable={true}
    on:dragstart={event => dragstart(event, 0)}
    on:drop|preventDefault={event => drop(event, 0)}
    ondragover="return false"
    on:dragenter={() => (hovering = 0)}
    class:is-active={hovering === 0}>
    {@html first}
  </div>
  <div
    class="list-item"
    draggable={true}
    on:dragstart={event => dragstart(event, 1)}
    on:drop|preventDefault={event => drop(event, 1)}
    ondragover="return false"
    on:dragenter={() => (hovering = 1)}
    class:is-active={hovering === 1}>
    {@html second}
  </div>
  <div class="list-item">-</div>
  <div class="list-item">Five years from now</div>
  <div class="list-item">She sits at home</div>
  <div class="list-item">Feeding the baby, she's all alone.</div>
</div>
