<script>
  import nlp from '/Users/spencer/mountain/compromise'
  import TextArea from '../Components/TextArea.svelte'
  let txt = `don't speak -  I know just what you're saying.`
  let result = []
  const change = function(str) {
    result = []
    let doc = nlp(str || '')
    let ids = doc.termList().reduce((h, t) => {
      h[t.id] = true
      return h
    }, {})
    doc.verbs().toPastTense()
    let json = doc.json({ terms: { id: true } })[0] || {}
    json = json.terms || []
    json.forEach(o => {
      if (!ids[o.id]) {
        o.tags.push('dirty')
      }
    })
    result = json
  }
  change(txt)
</script>

<style>
  .middle {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    text-align: center;
    flex-wrap: wrap;
    align-self: stretch;

    position: relative;
    align-items: center;
    justify-content: center;
  }
  .word {
    margin: 0.1rem;
    padding: 0.2rem;
  }
  .back {
    background-color: #ab5850;
    color: white;
    border-radius: 5px;
  }
  .result {
    margin-top: 2rem;
    font-size: 1.6rem;
  }
</style>

<div class="box ">
  <div class="middle">
    <TextArea
      width="600px"
      height="20px"
      cb={change}
      bind:value={txt}
      size="1.3rem" />
    <!-- <pre class="result">{JSON.stringify(result)}</pre> -->
    <div class="result">
      {#each result as o}
        {#if o.tags.includes('dirty')}
          <span class="word back">{o.text}</span>
        {:else}
          <span class="word">{o.text + (o.post.trim() || '')}</span>
        {/if}
      {/each}

    </div>
  </div>
</div>

<div class="notes" />
<li />
