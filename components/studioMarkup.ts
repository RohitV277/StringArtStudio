// Markup the studio engine binds to by element id. Run `npm run test:catalog` after editing.
export const STUDIO_HTML = `<div id="sheet" hidden><div id="sbk"></div><div id="spn"><div id="stt"></div><div id="sit"></div><button class="b" id="scn">Cancel</button></div></div>
<div id="psheet" hidden><div id="pbk"></div><div id="ppn"><div id="ltt">My designs</div>
<div class="row"><input id="pnm" type="text" placeholder="Name this design" aria-label="Design name"><button class="b on" id="psv">Save</button></div>
<div id="plist"></div><div class="row"><button class="b" id="pnew">New design</button><button class="b on" id="pcl">Done</button></div></div></div>
<div id="lsheet" hidden><div id="lbk"></div><div id="lpn"><div id="ltt">Layers</div><div id="lbody"></div><div class="row"><button class="b" id="lall">Show everything</button><button class="b on" id="lcl">Done</button></div></div></div>
<div id="tsheet" hidden><div id="tbk"></div><div id="tpn"><div class="row" id="tsc"></div><textarea id="ttx" rows="3" aria-label="Text"></textarea><div id="tfonts"></div>
<label>Letter size <b id="tszv"></b> cm</label><input type="range" id="tsz" min="1" max="20" step="0.5"><div class="hint">Fonts come from your device. If a font looks plain, that script is using the closest one installed.</div>
<div class="row"><button class="b" id="tbd">Bold</button><button class="b on" id="tadd">Add text</button><button class="b" id="tcan">Cancel</button></div></div></div>
<div id="sbar" hidden></div>
<div id="toast" role="status"></div>
<div id="app">
<header id="nav"><div class="t"><svg id="logo" width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"></svg>String Art Studio</div><div><button class="ib" id="prj" aria-label="My designs"></button><button class="ib" id="lyr" aria-label="Layers"></button><button class="ib" id="undo" aria-label="Undo">↶</button><button class="ib" id="redo" aria-label="Redo">↷</button><button class="ib" id="clear" aria-label="Clear all">🗑</button></div></header>
<div id="steps4"></div>
<main id="stage"><canvas id="cv" aria-label="Board"></canvas><div class="row" id="zc"><button class="b" id="zout" aria-label="Zoom out">−</button><button class="b" id="zfit">Fit</button><button class="b" id="zin" aria-label="Zoom in">+</button><span id="zl">100%</span></div><div id="ro"></div></main>
<aside id="side">
<div class="hint" id="hint"></div>
<div id="p-draw">
 <div class="row tools" id="dt"></div>
 <div class="card" id="plasso"><h2>Lasso</h2><label>Smoothing <b id="lsv"></b></label><input type="range" id="lsm" min="0" max="6" step="1">
  <div class="row"><button class="b" id="lfin">Close shape</button></div>
  <div class="hint">Freehand: draw around a shape and it closes itself. Polygon: tap corners, tap the first corner to close. Magnetic: draw near edges and points snap to them (load a photo or trace picture first).</div></div>
 <div class="card" id="pcurve"><h2>Pen and mandala</h2>
  <label>Mandala symmetry <b id="symv"></b></label><input type="range" id="sym" min="1" max="24" step="1">
  <div class="row"><button class="b" id="mir">Mirror</button><button class="b" id="bdone">Finish curve</button><button class="b" id="bclose">Close curve</button><button class="b" id="pdel">Delete point</button><button class="b" id="pdelc">Delete curve</button></div>
 </div>
 </div>
<div id="p-nails" hidden>
 <div class="row tools" id="nt"></div>
 <div class="card"><h2>Space between nails</h2>
  <label><span>Nails now: <b id="ncount"></b></span><span><b id="spv"></b> mm</span></label>
  <input type="range" id="sp" min="3" max="20" step="1">
  <div class="row"><button class="b" id="regen">Place nails again</button><button class="b" id="deln">Remove all nails</button></div>
 </div>
 <div class="card"><h2>Angles for mounting</h2>
  <div class="row"><button class="b" id="cmb"></button><button class="b" id="protb">Protractor</button></div>
  <div class="hint">Tap a nail to read its angle (clockwise from the top) and distance from the centre. The Build tab lists them for every nail.</div>
 </div>
</div>
<div id="p-strings" hidden>
 <div class="row tools" id="stl"></div>
 <div class="card"><h2>Fill automatically</h2>
  <div class="row"><button class="b" id="oall">Outline every shape</button><button class="b" id="delt">Remove all threads</button></div>
  <div class="hint">For the highlighted shape (use Pick shape to change it):</div>
  <div class="row"><button class="b" id="gloop">Outline</button><button class="b" id="gjump">Jump pattern</button><button class="b" id="gmult">Multiply pattern</button><button class="b" id="grem">Remove its threads</button></div>
  <label>Jump or multiply number <b id="jkv"></b></label><input type="range" id="jk" min="2" max="60" step="1">
 </div>
</div>
<div id="p-build" hidden>
 <div class="card"><h2>Follow along on your board</h2><div class="hint">Colors or shapes you hid in Layers are skipped, so you can build one color at a time.</div>
  <div id="cur"></div>
  <input type="range" id="bs" min="0" max="0" step="1">
  <div class="row"><button class="b" id="first">Start</button><button class="b" id="prev">Back</button><button class="b" id="play">Play</button><button class="b" id="next">Next</button><button class="b" id="last">End</button></div>
 </div>
 <div class="card"><h2>Nail positions and thread list</h2>
  <div class="hint">x and y are cm from the bottom-left corner. Angle is clockwise from the top.</div>
  <textarea id="list" rows="10" readonly></textarea>
  <div class="row"><button class="b" id="copy">Copy list</button></div>
 </div>
</div>
<div id="edit">
 <div class="row" id="cols"></div>
 <div class="row"><button class="b" id="lift" hidden>Lift thread</button></div>
</div>
<div class="row"><button class="b" id="back">Back</button><button class="b on" id="next2">Next</button></div>
<details class="card"><summary>Board and view</summary>
 <div class="row">Width <input type="number" id="bw" min="10" max="100"> cm Height <input type="number" id="bh" min="10" max="100"> cm</div>
 <div class="row"><button class="b" id="snap">Snap to 5 mm</button><button class="b" id="grid">Grid</button><button class="b" id="nums">Numbers</button><button class="b" id="guide">Show drawing</button></div>
  <div class="hint">Board color</div><div class="row" id="bgs"></div>
 <div class="row"><button class="b" id="shot">Make image</button><button class="b" id="psave">Save project file</button></div>
 <div class="row"><label style="margin:0">Open project file <input type="file" id="popen" accept=".json,application/json"></label></div>
 <img id="img" alt="Board image. Press and hold to save.">
</details>
</aside></div>`;
