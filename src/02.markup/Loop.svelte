<script>
  //export let name = ''
</script>

<style>
  .col {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    text-align: center;
    flex-wrap: wrap;
    align-self: stretch;
  }
  .label {
    left: 41%;
    font-size: 1.5rem;
    margin: 30px;
    position: absolute;
    text-align: center;
    width: 180px;
  }
  .sub {
    font-size: 0.9rem;
    min-width: 200px;
    line-height: 30px;
    opacity: 0.7;
  }
</style>

<div class="box" style="position:relative; with:100%;">
  <div class="label blue" style="top:40%; left:24%;">
    <span class="sub i">deeply arcane</span>
    <div class="f2">CLI</div>
  </div>
  <div class="label red" style="top:40%; left:57%;">
    <span class="sub i">deeply patronizing</span>
    <br />
    <div class="f2">GUI</div>
  </div>
  <div class="label blue" style="top:50px;">
    <span class="sub i " style="font-size:1.2rem;">add commands</span>
    <div>create a markup</div>
  </div>
  <div class="label red" style="bottom:50px;">
    <span class="sub i " style="font-size:1.2rem;">"wysiwyg"</span>
    <div>build a UI</div>
  </div>
  <div class="col" style="transform:scaleX(-1); height:600px;">

    <svg
      viewBox="-50,-50,100,100"
      shape-rendering="geometricPrecision"
      width="100%"
      height="100%">
      <defs>
        <marker
          id="triangle"
          viewBox="0 0 10 10"
          refX="4"
          refY="6"
          markerUnits="strokeWidth"
          markerWidth="9"
          markerHeight="9"
          orient="auto">
          <path
            d="M 0 0 L 10 4 L 0 10 z"
            fill="#D68881"
            transform="rotate(23)"
            class="svelte-1lnhtnf" />
        </marker>
        <marker
          id="triangle2"
          viewBox="0 0 10 10"
          refX="4"
          refY="6"
          markerUnits="strokeWidth"
          markerWidth="9"
          markerHeight="9"
          orient="auto">
          <path
            d="M 0 0 L 10 4 L 0 10 z"
            fill="#6699cc"
            transform="rotate(23)"
            class="svelte-1lnhtnf" />
        </marker>
      </defs>
      <path
        class="link svelte-1lnhtnf"
        d="M30.8144647592461,-14.369020899183779A34,34,0,0,0,-32.84147809382832,-8.7998475334857L-30.909626441250186,-8.282209443280658A32,32,0,0,1,29.0018491851728,-13.52378437570238Z"
        stroke="none"
        fill="#6699cc"
        stroke-width="1"
        marker-end="url(#triangle2)" />
      <path
        class="link svelte-1lnhtnf"
        d="M-32.84147809382832,8.7998475334857A34,34,0,0,0,32.84147809382832,8.799847533485696L30.909626441250186,8.282209443280655A32,32,0,0,1,-30.909626441250186,8.282209443280658Z"
        stroke="none"
        fill="#D68881"
        stroke-width="1"
        marker-end="url(#triangle)" />

    </svg>
  </div>

</div>

<div class="notes">
  <li>people hate our UIs, especially if they're beautiful</li>
  <li>i've been both the blue and red arrows in my career</li>
</div>
