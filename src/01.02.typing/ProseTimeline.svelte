<script>
  import {
    Timeline,
    Column,
    Line,
    Label,
    Horizontal,
    Axis
  } from '/Users/spencer/mountain/somehow-timeline/src'
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
</style>

<div class="box">
  <div class="row">
    <div style="width:400px">
      <Timeline start="Jan 1 1900" end="Dec 30 2020" height="600">
        <Horizontal date="December 1968" left="30%" color="red" width="60%" />

        <Column>
          <Axis />
        </Column>
        <Column>
          <Label
            start="January 1 1900"
            end="December 1968"
            color="pink"
            label="Typewriters" />
          <Label
            start="January 1945"
            end="December 1968"
            color="blue"
            label="Command-line"
            dodge="50px" />
          <Label
            start="Aug 1969"
            end="June 20 2020"
            color="red"
            dodge="50px"
            label="Prose in computers" />
        </Column>
      </Timeline>
    </div>
  </div>
</div>
<div class="notes">
  <li>the command-line came before prose-editor</li>
  <li>20 years of commands-only.</li>
  <li>computer programmers determined the keyboard</li>
  <li>now people are writing novels with &lt; key</li>
</div>
