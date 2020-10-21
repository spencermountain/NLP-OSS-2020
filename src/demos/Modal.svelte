<script>
  //export let name = ''

  import nlp from '/Users/spencer/mountain/compromise/src'
  import TextArea from '../Components/TextArea.svelte'
  let verb = 'called'
  let red = false
  let modal = ''
  let text = 'you called me on my cell-phone'
  const change = function(e) {
    let str = e.target.innerText
    let m = str.match(/(would|did|used to)/)
    if (m) {
      verb = 'call'
      modal = m[0]
      red = true
      return
    }
    verb = 'called'
    red = false
    console.log(text)
  }
</script>

<style>
  [contenteditable] {
    outline: 0px solid transparent;
  }
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
    padding: 2rem 3rem 2rem 3rem;
    margin: 0.3em 0.6em 0.3rem 5px;
    width: 60%;
    max-width: 50rem;
    /* line-height: 2; */
    outline: 0;
    border: 0;
    border-radius: 0.4rem;
    font-style: normal;
    box-shadow: 1px 1px 4px 0 rgba(0, 0, 0, 0.2);
    transition: box-shadow 100ms;
    color: #c4cad5;
    resize: none;
    border-bottom: 2px solid transparent;
    border-left: 4px solid lightgrey;
    color: #577c97;
    box-shadow: 2px 1px 5px 0 rgba(0, 0, 0, 0.2);
    border-bottom: 2px solid lightsteelblue;
  }
  .has {
    transition: 0.2s;
    padding: 5px;
    border-radius: 4px;
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
</style>

<div class="box row">
  <!-- <TextArea
    width="650px"
    height="25px"
    cb={change}
    bind:value={text}
    size="1.8rem" /> -->
  <div class="text">
    you
    <span class="has" contenteditable on:keyup={change} class:red>
      {modal} {verb}
    </span>
    me on my cell-phone
  </div>
</div>
