<script>
  import {
    Timeline,
    Column,
    Horizontal,
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
        <Horizontal date="December 1968" left="30%" color="red" width="50%" />
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
            label="Command-line" />
          <Label
            start="Aug 1969"
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
