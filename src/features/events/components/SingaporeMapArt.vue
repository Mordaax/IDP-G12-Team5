<script setup>
// Static, hand-drawn stand-in for a map tile layer (central Singapore).
// The centre (0,0 to 1300,1000) is the area events are placed on; the drawing
// carries on 650 / 500 units beyond it on every side (see utils/mapProjection.js).
// This file is throwaway: it goes away when the real map API is connected.
</script>

<template>
  <svg
    class="map-art"
    viewBox="-650 -500 2600 2000"
    width="2600"
    height="2000"
    role="img"
    aria-label="Illustrative map of central Singapore"
  >
    <defs>
      <pattern id="map-blocks" width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="rotate(24)">
        <rect width="64" height="64" fill="#efe8da" />
        <path d="M0 0 H64 M0 32 H64 M0 0 V64 M32 0 V64" stroke="#fbf8f1" stroke-width="3" />
        <rect x="6" y="6" width="20" height="20" rx="3" fill="#e8dfcd" />
        <rect x="38" y="38" width="20" height="20" rx="3" fill="#e8dfcd" />
      </pattern>
      <path id="r-bras-basah" d="M-20 760 C120 700 260 620 380 540 C460 480 520 420 600 360 C700 280 800 200 900 110 L960 40" />
      <path id="r-victoria" d="M240 900 C360 800 500 700 640 600 C760 510 880 430 1010 330" />
      <path id="r-bencoolen" d="M300 -20 C340 120 400 260 440 360 C480 470 540 600 620 700" />
      <path id="r-orchard" d="M-20 480 C100 460 240 440 360 400 C480 360 560 300 640 260 C740 210 840 190 920 190" />
      <path id="r-kallang" d="M560 -20 C590 100 620 220 680 320 C720 390 760 470 820 540" />
      <path id="r-river-valley" d="M100 640 C220 600 320 580 430 590 C520 598 600 590 700 560" />
      <path id="r-beach" d="M560 660 C620 600 700 560 780 500 C840 450 870 420 890 400" />
      <path id="r-serangoon" d="M380 150 C470 170 560 160 650 130 C760 100 840 60 920 -20" />
      <path id="r-minor-1" d="M120 300 C260 330 380 300 520 250" />
      <path id="r-minor-2" d="M700 120 C720 220 760 300 840 360" />
      <path id="r-minor-3" d="M480 700 C540 660 590 640 620 590" />
      <path id="r-minor-4" d="M60 880 C180 820 300 760 420 700" />
    </defs>

    <!-- land + city blocks -->
    <rect x="-650" y="-500" width="2600" height="2000" fill="url(#map-blocks)" />

    <!-- parks -->
    <g fill="#cfe7c1">
      <ellipse cx="400" cy="590" rx="108" ry="62" transform="rotate(-18 400 590)" />
      <path d="M430 320 q40 -34 92 -12 q32 34 -6 64 q-52 22 -88 -4 z" />
      <rect x="636" y="648" width="112" height="46" rx="18" />
      <path d="M850 120 q60 -22 122 20 q12 62 -42 92 q-72 10 -92 -42 z" />
      <path d="M560 880 q90 -56 190 -10 q44 66 -10 120 L580 1000 q-60 -50 -20 -120 z" />
      <ellipse cx="990" cy="470" rx="58" ry="36" />
      <ellipse cx="330" cy="690" rx="40" ry="22" />
      <ellipse cx="120" cy="540" rx="70" ry="40" />
      <!-- beyond the centre -->
      <ellipse cx="-300" cy="200" rx="120" ry="70" />
      <ellipse cx="-430" cy="760" rx="90" ry="55" />
      <ellipse cx="190" cy="-270" rx="110" ry="60" />
      <path d="M720 -350 q70 -30 140 6 q10 50 -50 74 q-80 8 -90 -80 z" />
      <ellipse cx="1480" cy="250" rx="100" ry="58" />
      <ellipse cx="1700" cy="-180" rx="130" ry="70" />
      <ellipse cx="-150" cy="1190" rx="130" ry="70" />
      <ellipse cx="520" cy="1250" rx="110" ry="55" />
      <ellipse cx="-480" cy="-130" rx="140" ry="90" />
      <ellipse cx="1560" cy="-420" rx="90" ry="45" />
    </g>

    <!-- roads: casing then fill -->
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <g stroke="#d6cdbb" stroke-width="13">
        <use href="#r-bras-basah" />
        <use href="#r-victoria" />
        <use href="#r-bencoolen" />
        <use href="#r-orchard" />
        <use href="#r-kallang" />
        <use href="#r-river-valley" />
        <use href="#r-beach" />
        <use href="#r-serangoon" />
      </g>
      <g stroke="#ffffff" stroke-width="9">
        <use href="#r-bras-basah" />
        <use href="#r-victoria" />
        <use href="#r-bencoolen" />
        <use href="#r-orchard" />
        <use href="#r-kallang" />
        <use href="#r-river-valley" />
        <use href="#r-beach" />
        <use href="#r-serangoon" />
      </g>
      <g stroke="#ffffff" stroke-width="5" opacity="0.9">
        <use href="#r-minor-1" />
        <use href="#r-minor-2" />
        <use href="#r-minor-3" />
        <use href="#r-minor-4" />
      </g>
    </g>


    <!-- streets beyond the centre -->
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <g stroke="#d6cdbb" stroke-width="13">
        <path d="M-650 -300 C -300 -330 100 -280 420 -200" />
        <path d="M-650 80 C -400 60 -200 100 -20 190" />
        <path d="M-650 480 C -450 470 -250 500 -60 520" />
        <path d="M-650 980 C -400 940 -150 900 60 880" />
        <path d="M-650 1300 C -300 1250 100 1180 520 1120" />
        <path d="M-400 -500 C -380 -200 -330 100 -300 400 C -280 700 -240 1100 -200 1500" />
        <path d="M150 -500 C 170 -300 200 -100 240 120" />
        <path d="M700 -500 C 690 -350 700 -200 720 -80" />
        <path d="M1300 -500 C 1320 -200 1360 100 1400 560" />
        <path d="M1150 -380 C 1400 -330 1650 -280 1950 -230" />
        <path d="M1330 160 C 1550 140 1750 190 1950 170" />
        <path d="M1400 400 C 1600 380 1800 420 1950 400" />
        <path d="M-650 1100 C -300 700 100 400 380 160" />
        <path d="M300 1000 C 200 1150 150 1300 120 1500" />
        <path d="M1700 -500 C 1680 -200 1720 100 1760 450" />
      </g>
      <g stroke="#ffffff" stroke-width="9">
        <path d="M-650 -300 C -300 -330 100 -280 420 -200" />
        <path d="M-650 80 C -400 60 -200 100 -20 190" />
        <path d="M-650 480 C -450 470 -250 500 -60 520" />
        <path d="M-650 980 C -400 940 -150 900 60 880" />
        <path d="M-650 1300 C -300 1250 100 1180 520 1120" />
        <path d="M-400 -500 C -380 -200 -330 100 -300 400 C -280 700 -240 1100 -200 1500" />
        <path d="M150 -500 C 170 -300 200 -100 240 120" />
        <path d="M700 -500 C 690 -350 700 -200 720 -80" />
        <path d="M1300 -500 C 1320 -200 1360 100 1400 560" />
        <path d="M1150 -380 C 1400 -330 1650 -280 1950 -230" />
        <path d="M1330 160 C 1550 140 1750 190 1950 170" />
        <path d="M1400 400 C 1600 380 1800 420 1950 400" />
        <path d="M-650 1100 C -300 700 100 400 380 160" />
        <path d="M300 1000 C 200 1150 150 1300 120 1500" />
        <path d="M1700 -500 C 1680 -200 1720 100 1760 450" />
      </g>
    </g>

    <!-- water -->
    <g fill="#a8d3f0">
      <path
        d="M1010 200 C1080 230 1120 300 1110 380 C1100 470 1180 540 1300 560 L1300 1000 L760 1000 C770 950 800 900 830 860 C860 820 840 770 800 740 C760 700 720 690 690 700 C660 710 640 725 600 722 L560 702 C600 664 680 642 740 612 C800 582 850 522 880 472 C910 412 930 332 960 272 C975 242 995 217 1010 200 Z"
      />
    </g>
    <!-- the bay and sea carry on to the south and east -->
    <g fill="#a8d3f0">
      <path d="M760 1000 L1300 1000 L1300 560 C1450 590 1650 680 1950 720 L1950 1500 L520 1500 C540 1350 700 1200 760 1000 Z" />
    </g>
    <g fill="none" stroke="#a8d3f0" stroke-linecap="round">
      <path d="M1070 -10 C1085 -150 1100 -300 1120 -500" stroke-width="20" />
      <path d="M590 712 C520 700 470 650 400 640 C340 630 290 600 230 560" stroke-width="12" />
      <path d="M1010 200 C1030 140 1050 70 1070 -10" stroke-width="20" />
    </g>

    <!-- expressway along the bay -->
    <path
      d="M770 990 C790 940 830 900 880 860 C960 800 1040 740 1130 700 C1190 672 1250 650 1300 640"
      fill="none"
      stroke="#f3c969"
      stroke-width="9"
      stroke-linecap="round"
      opacity="0.95"
    />

    <!-- MRT stations -->
    <g stroke-width="3" fill="#fff">
      <circle cx="470" cy="470" r="6" stroke="#f0a30a" />
      <circle cx="700" cy="468" r="6" stroke="#1f6feb" />
      <circle cx="560" cy="232" r="6" stroke="#1f6feb" />
      <circle cx="622" cy="640" r="6" stroke="#f0a30a" />
      <circle cx="432" cy="560" r="6" stroke="#1f6feb" />
      <circle cx="446" cy="620" r="6" stroke="#9b2fd6" />
      <circle cx="914" cy="360" r="6" stroke="#f0a30a" />
      <circle cx="820" cy="420" r="6" stroke="#f0a30a" />
      <circle cx="500" cy="384" r="6" stroke="#e5446d" />
    </g>

    <!-- area labels -->
    <g class="map-art__area" text-anchor="middle">
      <text x="560" y="206">LITTLE INDIA</text>
      <text x="900" y="62">KALLANG</text>
      <text x="270" y="650">RIVER VALLEY</text>
      <text x="690" y="430">KAMPONG GLAM</text>
      <text x="370" y="840">CHINATOWN</text>
      <text x="930" y="880">MARINA EAST</text>
      <text x="470" y="440">BRAS BASAH</text>
      <text x="1020" y="560">TANJONG RHU</text>
      <!-- beyond the centre -->
      <text x="260" y="-250">NOVENA</text>
      <text x="800" y="-300">BALESTIER</text>
      <text x="-260" y="300">ORCHARD</text>
      <text x="-230" y="960">TIONG BAHRU</text>
      <text x="1500" y="330">GEYLANG</text>
      <text x="1650" y="-120">PAYA LEBAR</text>
      <text x="260" y="1190">HARBOURFRONT</text>
      <text x="-440" y="-380">BUKIT TIMAH</text>
    </g>
    <g class="map-art__sea" text-anchor="middle">
      <text x="1350" y="1280">SINGAPORE STRAIT</text>
    </g>

    <!-- landmark labels -->
    <g class="map-art__poi" text-anchor="middle">
      <text x="400" y="600">Fort Canning Park</text>
      <text x="935" y="320">National Stadium</text>
      <text x="1010" y="440">Kallang Park</text>
      <text x="690" y="676">The Esplanade</text>
      <text x="690" y="950">Gardens by the Bay</text>
      <text x="790" y="640" transform="rotate(-28 790 640)">Marina Bay</text>
      <text x="880" y="760">Singapore Flyer</text>
      <text x="660" y="310">Plaka Centre</text>
      <text x="470" y="352">Mount Emily</text>
      <text x="330" y="730">Hong Lim Park</text>
      <text x="860" y="170">Kallang Riverside</text>
      <text x="340" y="120">Mustafa Centre</text>
    </g>
  </svg>
</template>

<style scoped>
.map-art {
  display: block;
  max-width: none;
}
.map-art__area text {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.12em;
  fill: #8a8f9f;
  paint-order: stroke;
  stroke: rgba(255, 255, 255, 0.7);
  stroke-width: 3px;
}
.map-art__sea text {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.25em;
  fill: #6fa4cf;
}
.map-art__poi text {
  font-size: 13px;
  font-weight: 600;
  fill: #4b73ad;
  paint-order: stroke;
  stroke: rgba(255, 255, 255, 0.8);
  stroke-width: 3px;
}
</style>
