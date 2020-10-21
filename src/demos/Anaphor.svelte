<script>
  let showHe = false
  let showShe = false
  let showThey = false
  const onHover = function(bool) {
    console.log('here')
    bool = !onHover
  }
  let flip = false
  const toggle = function(e) {
    console.log(e)
    if (!flip) {
      e.target.innerHTML = 'Her friends'
    } else {
      e.target.innerHTML = 'They'
    }
    flip = !flip
  }
</script>

<style>
  .row {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    text-align: center;
    flex-wrap: wrap;
    align-self: stretch;
  }
  .text {
    width: 500px;
    font-family: Avenir Next Regular;
    font-size: 2rem;
    line-height: 2.5rem;
    color: #705e5c;
    text-align: left;
    position: relative;
    transition: transform 1s;
    transform-style: preserve-3d;
  }
  .has {
    transition: 0.2s;
    padding: 5px;
    border-radius: 4px;
    cursor: pointer;
  }
  .start {
    background-color: #cc7066;
  }
  .red {
    background-color: #cc7066;
    color: white;
  }
  .fire {
    background-color: #ab5850;
    color: white;
  }
  .orange {
    background-color: #cc8a66;
    color: white;
  }
  .rose {
    background-color: #d68881;
    color: white;
  }
  .blue {
    background-color: #2d85a8;
    color: white;
  }
  .pink {
    background-color: #f2c0bb;
    color: white;
  }
  .flip {
    /* transition: 0.6s; */
    /* transform-style: preserve-3d; */

    transform: rotateY(80deg);
  }
  .flipper {
    backface-visibility: hidden;
  }
</style>

<div class="box row">

  <div class="text">
    <span
      class="has"
      class:blue={showHe}
      on:mouseenter={() => (showHe = true)}
      on:mouseleave={() => (showHe = false)}>
      He
    </span>
    was a boy
    <br />
    <span
      class="has"
      class:rose={showShe}
      on:mouseenter={() => (showShe = true)}
      on:mouseleave={() => (showShe = false)}>
      She
    </span>
    was a girl
    <br />
    Can I make it any more obvious?
    <br />
    <span
      class="has"
      class:blue={showHe}
      on:mouseenter={() => (showHe = true)}
      on:mouseleave={() => (showHe = false)}>
      He
    </span>
    was a punk
    <br />
    <span
      class="has"
      class:rose={showShe}
      on:mouseenter={() => (showShe = true)}
      on:mouseleave={() => (showShe = false)}>
      She
    </span>
    did ballet
    <br />
    What more can I say?
    <br />
    <span
      class="has"
      class:blue={showHe}
      on:mouseenter={() => (showHe = true)}
      on:mouseleave={() => (showHe = false)}>
      He
    </span>
    wanted
    <span
      class="has"
      class:rose={showShe}
      on:mouseenter={() => (showShe = true)}
      on:mouseleave={() => (showShe = false)}>
      her
    </span>
    <br />
    <span
      class="has"
      class:rose={showShe}
      on:mouseenter={() => (showShe = true)}
      on:mouseleave={() => (showShe = false)}>
      She'd
    </span>
    never tell
    <br />
    Secretly
    <span
      class="has"
      class:rose={showShe}
      on:mouseenter={() => (showShe = true)}
      on:mouseleave={() => (showShe = false)}>
      she
    </span>
    wanted
    <span
      class="has"
      class:blue={showHe}
      on:mouseenter={() => (showHe = true)}
      on:mouseleave={() => (showHe = false)}>
      him
    </span>
    as well
    <br />
    But all of
    <span
      class="has"
      class:pink={showThey}
      on:mouseenter={() => (showThey = true)}
      on:mouseleave={() => (showThey = false)}>
      <span
        class="has"
        class:rose={showShe}
        on:mouseenter={() => (showShe = true)}
        on:mouseleave={() => (showShe = false)}>
        her
      </span>
      friends
    </span>
    <br />
    Stuck up their nose
    <br />
    <span
      class="has flipper"
      class:pink={showThey}
      class:flip
      on:mouseenter={() => (showThey = true)}
      on:mouseleave={() => (showThey = false)}
      on:click={toggle}>
      They
    </span>
    <span style="">had a problem with his baggy clothes</span>
    <br />
  </div>

</div>
