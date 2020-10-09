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
    line-height: 35px;
    opacity: 0.7;
  }
  .onleft {
    position: absolute;
    left: 7%;
    top: 25%;
    text-align: left;
    font-size: 1.8rem;
    line-height: 3.5rem;
    color: #e6b3bc;
  }
</style>

<div class="box" style="position:relative; width:100%;">

  <div class="label red" style="top:40%; left:24%;">
    <div style="opacity:0;">{' -'}</div>
    <div class="f2 blue">CLI</div>
  </div>
  <div class="label red" style="top:40%; left:57%;">
    <div style="opacity:0;">{' -'}</div>
    <div class="f2">GUI</div>
  </div>
  <div class="label green" style="top:58%; left:7%;">
    <span class="sub i " style="font-size:1.2rem;">a somehow-good</span>
    <div class="f2">NLP</div>
    <span class="sub i " style="font-size:1.2rem;">interface</span>
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
        <marker
          id="triangle3"
          viewBox="0 0 10 10"
          refX="4"
          refY="6"
          markerUnits="strokeWidth"
          markerWidth="9"
          markerHeight="9"
          orient="auto">
          <path
            d="M 0 0 L 10 4 L 0 10 z"
            fill="#6accb2"
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

      <!-- pink parts -->
      <!-- <g transform="scale(0.8)">
        <path
          class="link svelte-1lnhtnf"
          d="M8.799847533485712,-32.84147809382832A34,34,0,0,1,32.84147809382832,-8.79984753348571L30.909626441250182,-8.282209443280669A32,32,0,0,0,8.28220944328067,-30.909626441250182Z"
          stroke="none"
          fill="#F2C0BB"
          stroke-width="1" />
        <path
          class="link svelte-1lnhtnf"
          d="M32.84147809382832,8.799847533485696A34,34,0,0,1,8.799847533485698,32.84147809382832L8.282209443280657,30.909626441250186A32,32,0,0,0,30.909626441250186,8.282209443280655Z"
          stroke="none"
          fill="#F2C0BB"
          stroke-width="1" />
      </g> -->
      <g style="scale: -1 1; transform: translate(-70px, 5px);">
        <path
          class="link svelte-1lnhtnf"
          d="M2.9632952534203763,33.87061973511935A34,34,0,0,0,33.87061973511935,2.9632952534203745L31.878230338935857,2.788983767925058A32,32,0,0,1,2.78898376792506,31.878230338935857Z"
          stroke="none"
          fill="#6accb2"
          stroke-width="1"
          marker-end="url(#triangle3)" />
      </g>
    </svg>
  </div>

</div>

<div class="notes">
  <li>never happened</li>
  <li>throw text at</li>
  <li>not question-answering!</li>
</div>
