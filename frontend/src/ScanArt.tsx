import { useId } from "react";

export type ScanKind = "gravity" | "stars" | "neural" | "signal" | "radar";
const captions: Record<ScanKind, string> = {
  gravity: "MODELING POSSIBILITY / GRAVITY FIELD",
  stars: "MAPPING THE INVISIBLE / SKY SURVEY",
  neural: "PATTERNS IN THE NOISE / NEURAL SCAN",
  signal: "PLAY · TEST · ITERATE / SIGNAL LAB",
  radar: "SENSE · ACT · LEARN / AGENT TRACKING",
};

// Seeded geometry keeps a cover stable until the visitor asks for a new variation.
export default function ScanArt({ kind, seed = 1 }: { kind: ScanKind; seed?: number }) {
  const id = useId();
  let state = seed + 37;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const points = Array.from({ length: 500 }, () => ({ x: random(), y: random(), r: random() }));
  const phase = seed * .31;
  return <div className={`project-art scan-art scan-${kind}`}>
    <svg viewBox="0 0 600 360" role="img" aria-label={`${kind} generative illustration, variation ${seed}`}>
      <defs>
        <pattern id={id} width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="currentColor" strokeWidth=".5" opacity=".22" /></pattern>
      </defs>
      <rect width="600" height="360" fill="#080609" />
      <rect x="14" y="14" width="572" height="332" fill={`url(#${id})`} stroke="currentColor" strokeOpacity=".35" />
      <g fill="none" stroke="currentColor">
        <path d="M80 55H520V302H80Z" opacity=".35" />
        <path d="M300 55V302M80 179H520" strokeDasharray="2 8" opacity=".5" />
        {kind === "gravity" && <g transform={`translate(300 177) rotate(${seed % 30 - 15})`}>
          {Array.from({length: 18}, (_, i) => <ellipse key={i} rx={20+i*11} ry={9+i*i*.35} cy={44-i*4} strokeWidth={i % 4 === 0 ? 1.7 : .7} />)}
          {Array.from({length: 28}, (_, i) => { const a = i*Math.PI/14; return <path key={i} d={`M0 44Q${Math.cos(a)*55} ${Math.sin(a)*32+30} ${Math.cos(a)*210} ${Math.sin(a)*135-20}`} opacity=".75" />; })}
          <ellipse cy="44" rx="21" ry="8" fill="#ef638e" stroke="none" />
        </g>}
        {kind === "signal" && Array.from({length: 22}, (_, j) => <path key={j} d={Array.from({length: 100}, (_, i) => { const x=80+i*4.44; const y=85+j*8+Math.sin(i*.12+phase+j*.16)*Math.sin(i*.036)*35; return `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`; }).join(" ")} opacity={.35+j/35} stroke={j % 5 === 0 ? "#ef638e" : "currentColor"} />)}
        {kind === "radar" && <g>
          {[35,70,105,140].map(r=><circle key={r} cx="300" cy="177" r={r} opacity=".6" />)}
          <path d={`M300 177L${300+Math.cos(phase)*140} ${177+Math.sin(phase)*140}`} strokeWidth="2" />
          {points.slice(0,12).map((p,i)=><g key={i} transform={`translate(${190+p.x*220} ${75+p.y*200})`}><circle r="5" fill="#ef638e" /><path d="M-9 -12H-13V-8M9 12H13V8" /></g>)}
          <path d="M190 110H410V145H190V180H410V215H190V250H410" strokeDasharray="4 5" opacity=".45" />
        </g>}
        {kind === "stars" && <g transform="rotate(-16 300 180)">
          {[0,1,2,3,4,5].map(i=><path key={i} d={`M75 ${90+i*34}Q300 ${-20+i*36} 535 ${110+i*34}`} opacity=".6" />)}
          {Array.from({length: 13},(_,i)=><path key={i} d={`M${90+i*35} 60L${135+i*30} 305`} opacity=".35" />)}
        </g>}
      </g>
      {(kind === "stars" || kind === "neural") && <g>
        {points.map((p,i)=> {
          if(kind === "stars") return <circle key={i} cx={85+p.x*430} cy={60+p.y*235} r={.4+p.r*1.4} fill={i%6 ? "#ffab4c" : "#ef638e"} opacity={.3+p.r*.7} />;
          const a=p.x*Math.PI*2; const r=Math.sqrt(p.y); const lobes=1+.12*Math.cos(a*7+phase);
          return <circle key={i} cx={300+Math.cos(a)*r*123*lobes} cy={178+Math.sin(a)*r*110*lobes} r={.6+p.r*1.3} fill="#ef638e" opacity={.3+p.r*.7} />;
        })}
        {kind === "neural" && <g fill="none" stroke="#ffab4c"><rect x={310+seed%25} y="116" width="47" height="43" /><path d="M358 116L402 85H461" /><path d="M300 75V281" strokeDasharray="3 5" opacity=".5" /></g>}
      </g>}
      <g fill="currentColor" fontFamily="monospace" fontSize="8">
        <text x="83" y="42">EXPLORATION / {kind.toUpperCase()}</text><text x="431" y="42">V.{String(seed).padStart(3,"0")}</text>
        {Array.from({length: 10}, (_,i)=><g key={i}><rect x="28" y={66+i*23} width={12+points[i].r*27} height="5" opacity={.3+points[i].r*.7} /><text x="535" y={73+i*23}>{Math.round(points[i].x*999).toString().padStart(3,"0")}</text></g>)}
        {Array.from({length: 42}, (_,i)=><rect key={i} x={82+i*10.4} y="315" width="4" height={4+points[i].r*10} opacity=".7" />)}
      </g>
    </svg>
    <span className="art-caption">{captions[kind]}</span>
  </div>;
}
