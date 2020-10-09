<script>
  import {
    Timeline,
    Column,
    Line,
    Label,
    Axis
  } from '/Users/spencer/mountain/somehow-timeline/src'
</script>

<style>
  .col {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    text-align: center;
    flex-wrap: wrap;
    align-self: stretch;
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
</style>

<div class="box">
  <div class="row">
    <div style="width:400px">
      <Timeline start="Jan 1 1900" end="Dec 30 2020" height="600">
        <Column>
          <Axis />
        </Column>
        <Column>
          <Label
            start="January 1 1900"
            end="Feb 20 1965"
            color="pink"
            label="Typewriters" />
          <Label
            start="January 1 1965"
            end="Feb 20 1984"
            color="blue"
            label="Command-line" />
          <Label
            start="March 1 1984"
            end="June 20 2020"
            color="red"
            label="Awkward relationships with markup" />
        </Column>
      </Timeline>
    </div>
  </div>
</div>
<div class="notes">
  <li>in CLI computer was under your fingers</li>
  <li>
    users are desperate for a powerful interface, we give them another GUI
  </li>
</div>
