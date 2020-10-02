<script>
  import {
    Timeline,
    Column,
    Line
  } from '/Users/spencer/mountain/somehow-timeline/src'

  import TextArea from '../Components/TextArea.svelte'
  let txt = `In West Philadelphia born and raised, on the playground is where I spent most of my days.

Chilling out, maxing, relaxing all cool, and all shooting some b-ball outside of the school.

When a couple of guys, who were up to no good, started making trouble in my neighborhood.`
</script>

<style>
  .middle {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    text-align: center;
    flex-wrap: wrap;
    align-self: stretch;

    position: relative;
    align-items: center;
    justify-content: center;
  }
</style>

<div class="box ">
  <div class="middle">
    <TextArea width="300px" height="400px" value={txt} size="1.3rem" />
    <Timeline start="Jan 1 2020" end="Dec 30 2020" height="470">
      <Column>
        <Line
          start="January 1 2020"
          end="Feb 20 2020"
          color="pink"
          dotted={true}
          label="Typing" />
        <Line
          start="Feb 20 2020"
          end="November 11 2020"
          dotted={true}
          color="#6699cc"
          label="Refactoring" />
        <Line
          start="November 11 2020"
          end="December 20 2020"
          dotted={true}
          color="fire"
          label="Proof-reading" />
      </Column>
    </Timeline>
  </div>
</div>

<div class="notes" />
<li />
