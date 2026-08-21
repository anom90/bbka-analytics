(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,99847,e=>{"use strict";let a=(0,e.i(56420).default)("circle-alert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);e.s(["AlertCircle",0,a],99847)},52330,e=>{"use strict";let a=(0,e.i(56420).default)("code-xml",[["path",{d:"m18 16 4-4-4-4",key:"1inbqp"}],["path",{d:"m6 8-4 4 4 4",key:"15zrgr"}],["path",{d:"m14.5 4-5 16",key:"e7oirm"}]]);e.s(["Code2",0,a],52330)},71136,35184,e=>{"use strict";var a=e.i(56420);let t=(0,a.default)("hash",[["line",{x1:"4",x2:"20",y1:"9",y2:"9",key:"4lhtct"}],["line",{x1:"4",x2:"20",y1:"15",y2:"15",key:"vyu0kd"}],["line",{x1:"10",x2:"8",y1:"3",y2:"21",key:"1ggp8o"}],["line",{x1:"16",x2:"14",y1:"3",y2:"21",key:"weycgp"}]]);e.s(["Hash",0,t],71136);let r=(0,a.default)("type",[["path",{d:"M12 4v16",key:"1654pz"}],["path",{d:"M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2",key:"e0r10z"}],["path",{d:"M9 20h6",key:"s66wpe"}]]);e.s(["Type",0,r],35184)},77071,e=>{"use strict";let a=(0,e.i(56420).default)("plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);e.s(["Plus",0,a],77071)},66595,e=>{"use strict";let a=(0,e.i(56420).default)("search",[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]]);e.s(["Search",0,a],66595)},4139,e=>{"use strict";let a=(0,e.i(56420).default)("terminal",[["path",{d:"M12 19h8",key:"baeox8"}],["path",{d:"m4 17 6-6-6-6",key:"1yngyt"}]]);e.s(["Terminal",0,a],4139)},53174,e=>{"use strict";var a=e.i(43476),t=e.i(71645),r=e.i(7921),i=e.i(21357),s=e.i(52330),n=e.i(51757),l=e.i(4139),d=e.i(84026),o=e.i(64569),c=e.i(95925),m=e.i(19455),u=e.i(15288),p=e.i(77572),f=e.i(98898),x=e.i(57086),h=e.i(87486),g=e.i(75157);function b({title:e="Gambar 1. Caterpillar Forest Plot: Distribusi Intercept Efek Acak Satuan Pendidikan (BLUPs)",subtitle:r="Estimasi performa sekolah dengan interval kepercayaan 95%. Seluruh satuan pendidikan diurutkan berdasarkan peringkat intercept (BLUP empirical Bayes).",clusterEstimates:i,overallMean:s}){let[n,l]=t.useState(null);if(!i||0===i.length)return null;let d=[...i].sort((e,a)=>e.blupIntercept-a.blupIntercept),o=d.length,c=Math.min(...d.map(e=>e.blupIntercept-1.96*e.se),s),m=Math.max(...d.map(e=>e.blupIntercept+1.96*e.se),s),p=m-c||1,f=Math.floor(c-.06*p),x=Math.ceil(m+.06*p),k=x-f||1,v=e=>75+(e-f)/k*730,y=Array.from({length:7},(e,a)=>{let t=f+a/6*(x-f);return{value:t,x:v(t)}}),N=v(s),j=d.filter(e=>e.blupIntercept-1.96*e.se>s).length,_=d.filter(e=>e.blupIntercept+1.96*e.se<s).length,$=o-j-_;return(0,a.jsxs)(u.Card,{className:"print-avoid-break break-inside-avoid page-break-inside-avoid shadow-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#101c1c] overflow-hidden",children:[(0,a.jsx)(u.CardHeader,{className:"pb-2 border-b border-zinc-100 dark:border-zinc-800",children:(0,a.jsxs)("div",{className:"flex flex-wrap items-center justify-between gap-2",children:[(0,a.jsxs)("div",{children:[(0,a.jsxs)(u.CardTitle,{className:"text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2",children:[e,(0,a.jsxs)(h.Badge,{variant:"teal",className:"text-[10px] font-mono font-normal",children:[o," Sekolah"]})]}),r&&(0,a.jsx)(u.CardDescription,{className:"text-xs mt-0.5",children:r})]}),(0,a.jsx)("div",{className:"flex items-center gap-3 text-xs font-mono text-zinc-600 dark:text-zinc-400",children:(0,a.jsxs)("span",{children:["Grand Mean (γ₀₀) = ",(0,a.jsx)("strong",{className:"text-red-600 dark:text-red-400",children:(0,g.formatNumber)(s,2)})]})})]})}),(0,a.jsxs)(u.CardContent,{className:"p-4 space-y-3",children:[(0,a.jsxs)("div",{className:"relative w-full rounded-xl bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 p-2",children:[(0,a.jsxs)("svg",{viewBox:"0 0 840 440",className:"w-full h-auto max-h-[420px] block font-sans",style:{shapeRendering:"geometricPrecision"},children:[y.map((e,t)=>(0,a.jsxs)("g",{children:[(0,a.jsx)("line",{x1:e.x,y1:35,x2:e.x,y2:385,stroke:"currentColor",className:"text-zinc-200 dark:text-zinc-800",strokeWidth:"1",strokeDasharray:"3 3"}),(0,a.jsx)("text",{x:e.x,y:403,textAnchor:"middle",className:"text-[10px] font-mono fill-zinc-500 dark:fill-zinc-400",children:(0,g.formatNumber)(e.value,1)})]},t)),(0,a.jsx)("line",{x1:75,y1:385,x2:805,y2:385,stroke:"currentColor",className:"text-zinc-400 dark:text-zinc-600",strokeWidth:"1.5"}),(0,a.jsx)("line",{x1:75,y1:35,x2:75,y2:385,stroke:"currentColor",className:"text-zinc-400 dark:text-zinc-600",strokeWidth:"1.5"}),(0,a.jsxs)("text",{x:-210,y:20,transform:"rotate(-90)",textAnchor:"middle",className:"text-[11px] font-medium fill-zinc-600 dark:fill-zinc-400",children:["Peringkat Satuan Pendidikan (Rank 1 s.d. ",o,")"]}),(0,a.jsx)("text",{x:440,y:428,textAnchor:"middle",className:"text-[11px] font-medium fill-zinc-600 dark:fill-zinc-400",children:"Estimasi Intercept BLUP Satuan Pendidikan (dengan 95% Confidence Interval)"}),(0,a.jsx)("line",{x1:N,y1:27,x2:N,y2:389,stroke:"#ef4444",strokeWidth:"2",strokeDasharray:"4 3"}),(0,a.jsxs)("text",{x:N,y:23,textAnchor:"middle",className:"text-[10px] font-bold fill-red-600 dark:fill-red-400",children:["γ₀₀ = ",(0,g.formatNumber)(s,1)]}),d.map((e,t)=>{let r=35+(o>1?(1-t/(o-1))*350:175),i=v(e.blupIntercept-1.96*e.se),d=v(e.blupIntercept+1.96*e.se),c=v(e.blupIntercept),m=e.blupIntercept-1.96*e.se>s,u=e.blupIntercept+1.96*e.se<s,p=m?"#10b981":u?"#f59e0b":"#008080",f=o>80?2:o>40?2.5:3.5,x=o>80?1:1.5;return(0,a.jsxs)("g",{className:"cursor-pointer transition-opacity hover:opacity-100",onMouseEnter:()=>l(e),onMouseLeave:()=>l(null),children:[(0,a.jsx)("line",{x1:i,y1:r,x2:d,y2:r,stroke:p,strokeWidth:x,strokeLinecap:"round",opacity:n&&n.clusterId!==e.clusterId?.3:.85}),(0,a.jsx)("circle",{cx:c,cy:r,r:n?.clusterId===e.clusterId?f+2:f,fill:p,stroke:"#ffffff",strokeWidth:o>60?.5:1}),(0,a.jsx)("title",{children:`ID Sekolah: ${e.clusterId}
Intercept (BLUP): ${(0,g.formatNumber)(e.blupIntercept,2)}
95% CI: [${(0,g.formatNumber)(e.blupIntercept-1.96*e.se,2)}, ${(0,g.formatNumber)(e.blupIntercept+1.96*e.se,2)}]
N Siswa: ${e.n}`})]},e.clusterId||t)})]}),n&&(0,a.jsxs)("div",{className:"no-print absolute top-3 right-3 p-2.5 rounded-lg bg-zinc-900/90 text-white text-xs shadow-lg border border-zinc-700 pointer-events-none font-mono",children:[(0,a.jsxs)("p",{className:"font-bold text-[#7fdcdc]",children:["Satuan Pendidikan: ",n.clusterId]}),(0,a.jsxs)("p",{className:"text-[11px] text-zinc-300",children:["BLUP Intercept: ",(0,a.jsx)("strong",{children:(0,g.formatNumber)(n.blupIntercept,2)})," (SE = ",(0,g.formatNumber)(n.se,2),")"]}),(0,a.jsxs)("p",{className:"text-[10px] text-zinc-400",children:["95% CI: [",(0,g.formatNumber)(n.blupIntercept-1.96*n.se,2),", ",(0,g.formatNumber)(n.blupIntercept+1.96*n.se,2),"] | N = ",n.n," siswa"]})]})]}),(0,a.jsxs)("div",{className:"flex flex-wrap items-center justify-center gap-6 pt-1 text-xs text-zinc-700 dark:text-zinc-300",children:[(0,a.jsxs)("div",{className:"flex items-center gap-2",children:[(0,a.jsx)("span",{className:"w-3 h-3 rounded-full bg-emerald-500"}),(0,a.jsxs)("span",{children:["Signifikan di Atas Rata-rata (n = ",j,")"]})]}),(0,a.jsxs)("div",{className:"flex items-center gap-2",children:[(0,a.jsx)("span",{className:"w-3 h-3 rounded-full bg-[#008080] dark:bg-[#14a3a3]"}),(0,a.jsxs)("span",{children:["Setara Rata-rata Nasional (n = ",$,")"]})]}),(0,a.jsxs)("div",{className:"flex items-center gap-2",children:[(0,a.jsx)("span",{className:"w-3 h-3 rounded-full bg-amber-500"}),(0,a.jsxs)("span",{children:["Signifikan di Bawah Rata-rata (n = ",_,")"]})]}),(0,a.jsxs)("div",{className:"flex items-center gap-2",children:[(0,a.jsx)("span",{className:"w-4 h-0.5 bg-red-500 border-t border-dashed"}),(0,a.jsx)("span",{children:"Garis Acuan Nasional (γ₀₀)"})]})]})]})]})}var k=e.i(36421),v=e.i(59009),y=e.i(68042),N=e.i(58841),j=e.i(48107),_=e.i(36841),$=e.i(71816),M=e.i(28783),w=e.i(54204);e.s(["default",0,function(){let{data:e,columns:h,fileName:S,loadDefaultDataset:T}=(0,_.useDatasetStore)(),{multilevelConfig:R,setMultilevelConfig:A,executeMultilevel:E,multilevelResult:C,isCalculating:P,error:z,clearSpecificAnalysis:I}=(0,$.useAnalysisStore)(),[L,U]=t.useState("tables"),[B,D]=t.useState(!0),[V,q]=t.useState(!1),F=t.useRef(!0);t.useEffect(()=>{$.useAnalysisStore.setState({error:null}),0!==e.length||S||T()},[]),t.useEffect(()=>{if(F.current&&(F.current=!1,C)||!B||0===e.length||!R.dv||!R.clusterVar)return;q(!0);let a=setTimeout(()=>{q(!1),E(e)},450);return()=>{clearTimeout(a),q(!1)}},[B,e,R.dv,R.clusterVar,R.level1Predictors,R.level2Predictors]);let K=C?.models||[],H=K.find(e=>"model_1"===e.modelId),O=K.find(e=>"model_2"===e.modelId),G=K.find(e=>"model_3"===e.modelId),W=K.find(e=>"model_4"===e.modelId)||(K.length>1?K[K.length-1]:void 0),J=[];if(C&&K.length>0){let e=(e,a)=>{if(!e)return"-";let t=(e.fixedEffects||[]).find(e=>"(Intercept)"===a||a.includes("Intercept")?"(Intercept)"===e.term||e.term.includes("Intercept")||e.term.includes("Grand Mean"):e.term===a||e.term.startsWith(a)||a.startsWith(e.term));if(!t)return"-";let r=t.pValue<.001?"***":t.pValue<.01?"**":t.pValue<.05?"*":"";return`${(0,g.formatNumber)(t.estimate)} (${(0,g.formatNumber)(t.se)})${r}`};J.push({param:"Intercept (γ₀₀ - Grand Mean)",m1:e(H,"(Intercept)"),m2:e(O,"(Intercept)"),m3:e(G,"(Intercept)"),m4:e(W,"(Intercept)")});let a=(C.fixedEffects||[]).filter(e=>"(Intercept)"!==e.term&&!e.term.includes("Grand Mean")),t=a.filter(e=>"Level 1 (Siswa)"===e.level||(0,g.ensureArray)(C.level1Predictors).some(a=>e.term.startsWith(a))),r=a.filter(e=>"Level 2 (Sekolah)"===e.level||(0,g.ensureArray)(C.level2Predictors).some(a=>e.term.startsWith(a)));t.length>0?t.forEach(a=>{J.push({param:`  [L1] ${a.term}`,m1:"-",m2:e(O,a.term),m3:"-",m4:e(W,a.term)})}):(0,g.ensureArray)(C.level1Predictors).length>0&&(0,g.ensureArray)(C.level1Predictors).forEach(a=>{J.push({param:`  [L1] ${a}`,m1:"-",m2:e(O,a),m3:"-",m4:e(W,a)})}),r.length>0?r.forEach(a=>{J.push({param:`  [L2] ${a.term}`,m1:"-",m2:"-",m3:e(G,a.term),m4:e(W,a.term)})}):(0,g.ensureArray)(C.level2Predictors).length>0&&(0,g.ensureArray)(C.level2Predictors).forEach(a=>{J.push({param:`  [L2] ${a}`,m1:"-",m2:"-",m3:e(G,a),m4:e(W,a)})}),J.push({param:"Varians Antar-Sekolah (τ₀₀ Between)",m1:H?(0,g.formatNumber)(H.tau00,2):"-",m2:O?(0,g.formatNumber)(O.tau00,2):"-",m3:G?(0,g.formatNumber)(G.tau00,2):"-",m4:W?(0,g.formatNumber)(W.tau00,2):(0,g.formatNumber)(C.tau00,2)}),J.push({param:"Varians Dalam-Sekolah (σ² Within)",m1:H?(0,g.formatNumber)(H.sigma2,2):"-",m2:O?(0,g.formatNumber)(O.sigma2,2):"-",m3:G?(0,g.formatNumber)(G.sigma2,2):"-",m4:W?(0,g.formatNumber)(W.sigma2,2):(0,g.formatNumber)(C.sigma2,2)}),J.push({param:"Intraclass Correlation (ICC - ρ)",m1:H?`${(100*H.icc).toFixed(2)}%`:`${(100*C.icc).toFixed(2)}%`,m2:O?`${(100*O.icc).toFixed(2)}%`:"-",m3:G?`${(100*G.icc).toFixed(2)}%`:"-",m4:W?`${(100*W.icc).toFixed(2)}%`:"-"}),J.push({param:"Reduksi Varians Siswa (Level-1 R² / R²_L1)",m1:"-",m2:O&&O.varExplainedL1?`${O.varExplainedL1.toFixed(1)}%`:"-",m3:"-",m4:void 0!==C.r2Level1&&null!==C.r2Level1?`${(C.r2Level1>1?C.r2Level1:100*C.r2Level1).toFixed(1)}%`:"-"}),J.push({param:"Reduksi Varians Sekolah (Level-2 R² / R²_L2)",m1:"-",m2:"-",m3:G&&G.varExplainedL2?`${G.varExplainedL2.toFixed(1)}%`:"-",m4:void 0!==C.r2Level2&&null!==C.r2Level2?`${(C.r2Level2>1?C.r2Level2:100*C.r2Level2).toFixed(1)}%`:"-"}),J.push({param:"Deviance (-2LL)",m1:H?(0,g.formatNumber)(H.deviance,1):"-",m2:O?(0,g.formatNumber)(O.deviance,1):"-",m3:G?(0,g.formatNumber)(G.deviance,1):"-",m4:W?(0,g.formatNumber)(W.deviance,1):(0,g.formatNumber)(C.deviance,1)}),J.push({param:"Akaike Information Criterion (AIC)",m1:H?(0,g.formatNumber)(H.aic,1):"-",m2:O?(0,g.formatNumber)(O.aic,1):"-",m3:G?(0,g.formatNumber)(G.aic,1):"-",m4:W?(0,g.formatNumber)(W.aic,1):(0,g.formatNumber)(C.aic,1)}),J.push({param:"Bayesian Information Criterion (BIC)",m1:H?(0,g.formatNumber)(H.bic,1):"-",m2:O?(0,g.formatNumber)(O.bic,1):"-",m3:G?(0,g.formatNumber)(G.bic,1):"-",m4:W?(0,g.formatNumber)(W.bic,1):(0,g.formatNumber)(C.bic,1)}),J.push({param:"Uji Peningkatan Model vs Model 1 (Δ -2LL)",m1:"Model Acuan (Baseline)",m2:O&&O.devianceDiff?`Δ = ${(0,g.formatNumber)(O.devianceDiff,1)} (p = ${(0,g.formatPValue)(O.chiSqPValue||.001)})`:"-",m3:G&&G.devianceDiff?`Δ = ${(0,g.formatNumber)(G.devianceDiff,1)} (p = ${(0,g.formatPValue)(G.chiSqPValue||.001)})`:"-",m4:W&&W.devianceDiff?`Δ = ${(0,g.formatNumber)(W.devianceDiff,1)} (p = ${(0,g.formatPValue)(W.chiSqPValue||.001)})`:"-"})}let Q=(C?.fixedEffects||[]).map(e=>({term:"(Intercept)"===e.term?"Intercept (γ₀₀)":e.term,level:e.level||(e.term.includes("Intercept")?"Intercept":"Prediktor"),estimate:(0,g.formatNumber)(e.estimate),se:(0,g.formatNumber)(e.se),stdBeta:void 0!==e.stdBeta&&"(Intercept)"!==e.term?(0,g.formatNumber)(e.stdBeta,3):"-",varExplained:void 0!==e.varExplainedPct&&"(Intercept)"!==e.term?`${e.varExplainedPct.toFixed(1)}%`:"-",tValue:(0,g.formatNumber)(e.tValue),pValue:(0,g.formatPValue)(e.pValue),ciLower:(0,g.formatNumber)(e.ciLower),ciUpper:(0,g.formatNumber)(e.ciUpper)})),X=(C?.clusterEstimates||[]).slice(0,20).map(e=>({clusterId:e.clusterId,n:e.n,rawMean:(0,g.formatNumber)(e.rawMean),blupIntercept:(0,g.formatNumber)(e.blupIntercept),se:(0,g.formatNumber)(e.se)})),Y=w.RSyntaxGenerator.getMultilevelCode(R.dv,R.clusterVar,R.level1Predictors,R.level2Predictors,S||"data_latihan_jasp_multilevel.csv");return(0,a.jsxs)("div",{className:"space-y-6",children:[(0,a.jsxs)(j.PageHeader,{icon:r.Network,title:"Multilevel Modeling (HLM)",badgeIcon:n.CheckCircle2,badgeText:"R Engine (lme4)",description:"Analisis data hierarkis siswa bersarang dalam sekolah dengan estimasi 4 tahap (Null, Level 1, Level 2, Full Model) dan ICC.",children:[(0,a.jsxs)(m.Button,{type:"button",variant:"outline",size:"sm",onClick:()=>{I("multilevel")},className:"text-xs h-9 px-3 gap-1.5 rounded-xl border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer shadow-2xs font-medium",title:"Bersihkan model dan reset hasil analisis",children:[(0,a.jsx)(c.RotateCcw,{className:"w-3.5 h-3.5"}),"Reset Analisis"]}),(0,a.jsxs)("button",{type:"button",onClick:()=>D(!B),className:(0,g.cn)("text-xs px-3 py-2 rounded-xl font-medium border flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs whitespace-nowrap h-9",B?"bg-teal-50 border-teal-300 text-teal-900 dark:bg-teal-950/80 dark:border-teal-700 dark:text-teal-200 ring-1 ring-teal-500/20":"bg-zinc-100 border-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400"),title:"Mode Komputasi Reaktif: Hitung otomatis saat variabel diubah seperti di JASP/Jamovi",children:[(0,a.jsx)(o.Zap,{className:(0,g.cn)("w-3.5 h-3.5",B?"text-amber-500 fill-amber-500":"text-zinc-400")}),(0,a.jsxs)("span",{children:["Auto-Run ",B?"Aktif":"Manual"]}),V&&(0,a.jsx)("span",{className:"w-2 h-2 rounded-full bg-amber-500 animate-ping ml-0.5"})]}),(0,a.jsxs)(m.Button,{onClick:()=>{e.length>0&&E(e)},disabled:P||0===e.length||!R.dv||!R.clusterVar,className:"bg-[#008080] hover:bg-[#006666] dark:bg-[#14a3a3] dark:hover:bg-[#0f8787] text-white dark:text-[#04211f] cursor-pointer gap-2 text-xs px-4 py-2 shadow-xs font-semibold rounded-xl whitespace-nowrap h-9",children:[(0,a.jsx)(i.Play,{className:"w-3.5 h-3.5 fill-current"}),P?"Mengestimasi...":"Estimasi Multilevel"]})]}),(0,a.jsxs)(u.Card,{children:[(0,a.jsxs)(u.CardHeader,{className:"pb-3",children:[(0,a.jsx)(u.CardTitle,{className:"text-sm",children:"Konfigurasi Variabel Hierarkis (Level 1 & Level 2)"}),(0,a.jsx)(u.CardDescription,{className:"text-xs",children:"Pilih Variabel Terikat (Outcome), ID Kluster Sekolah (Level 2), serta Prediktor Siswa (L1) dan Karakteristik Sekolah (L2)."})]}),(0,a.jsx)(u.CardContent,{children:(0,a.jsx)(f.VariableSelector,{columns:h,slots:[{id:"dv",label:"Dependent Variable (Outcome Kontinu Y)",description:"Capaian kontinu siswa (contoh: nilai_literasi atau nilai_numerasi)",typeFilter:"numeric",selected:R.dv?[R.dv]:[],onChange:e=>A({dv:e[0]||""})},{id:"clusterVar",label:"Cluster / Grouping ID (Level 2 Unit j)",description:"Kode identitas sekolah/kluster (contoh: kd_sekolah)",typeFilter:"nominal",selected:R.clusterVar?[R.clusterVar]:[],onChange:e=>A({clusterVar:e[0]||""})},{id:"level1Predictors",label:"Level 1 Predictors (Karakteristik Siswa X_ij)",description:"Variabel tingkat siswa (contoh: ses_siswa, jenis_kelamin)",typeFilter:"all",multi:!0,selected:R.level1Predictors,onChange:e=>A({level1Predictors:e})},{id:"level2Predictors",label:"Level 2 Predictors (Karakteristik Sekolah W_j)",description:"Variabel tingkat sekolah/guru (contoh: guru_iklim_kelas, guru_fokus_akademik, status_sekolah)",typeFilter:"all",multi:!0,selected:R.level2Predictors,onChange:e=>A({level2Predictors:e})}]})})]}),z&&(0,a.jsx)("div",{className:"p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs border border-red-200 dark:border-red-900",children:z}),(0,a.jsxs)(p.Tabs,{value:L,onValueChange:U,children:[(0,a.jsx)("div",{className:"flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2",children:(0,a.jsxs)(p.TabsList,{className:"bg-zinc-100 dark:bg-zinc-800/80 p-1",children:[(0,a.jsx)(p.TabsTrigger,{value:"tables",children:"Tabel Hasil & Caterpillar Plot"}),(0,a.jsxs)(p.TabsTrigger,{value:"assumptions",className:"flex items-center gap-1.5",children:[(0,a.jsx)(d.ShieldCheck,{className:"w-3.5 h-3.5 text-emerald-500"}),"Uji Asumsi Statistik"]}),(0,a.jsxs)(p.TabsTrigger,{value:"r_console",className:"flex items-center gap-1.5",children:[(0,a.jsx)(l.Terminal,{className:"w-3.5 h-3.5 text-emerald-500"}),"Output Konsol R (Terminal)"]}),(0,a.jsxs)(p.TabsTrigger,{value:"r_code",className:"flex items-center gap-1.5",children:[(0,a.jsx)(s.Code2,{className:"w-3.5 h-3.5 text-blue-500"}),"Sintaks Verifikasi R"]})]})}),(0,a.jsx)(p.TabsContent,{value:"tables",className:"space-y-6 mt-4",children:C?(0,a.jsxs)("div",{className:"space-y-6",children:[(0,a.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-4",children:[(0,a.jsxs)("div",{className:"p-4 rounded-xl border border-[#008080]/30 dark:border-[#14a3a3]/30 bg-gradient-to-br from-[#e6f2f2]/60 to-white dark:from-[#14312f]/40 dark:to-[#101c1c] shadow-xs",children:[(0,a.jsx)("p",{className:"text-[11px] font-medium text-[#0a6a6a] dark:text-[#7fdcdc]",children:"Intraclass Correlation (ICC - ρ)"}),(0,a.jsxs)("p",{className:"text-2xl font-extrabold text-[#008080] dark:text-[#14a3a3] font-mono mt-1",children:[(100*C.icc).toFixed(2),"%"]}),(0,a.jsxs)("p",{className:"text-[10px] text-zinc-500 mt-1",children:[C.pctBetweenVariance.toFixed(1),"% variasi di level sekolah vs ",C.pctWithinVariance.toFixed(1),"% di level siswa"]})]}),(0,a.jsxs)("div",{className:"p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs",children:[(0,a.jsx)("p",{className:"text-[11px] font-medium text-zinc-500",children:"Varians Antar-Sekolah (τ₀₀ Between)"}),(0,a.jsx)("p",{className:"text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono mt-1",children:(0,g.formatNumber)(C.tau00,2)}),(0,a.jsxs)("p",{className:"text-[10px] text-zinc-400 mt-1",children:["Reliabilitas Sekolah λ = ",(0,g.formatNumber)(C.schoolReliability||.95,3)]})]}),(0,a.jsxs)("div",{className:"p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs",children:[(0,a.jsx)("p",{className:"text-[11px] font-medium text-zinc-500",children:"Varians Siswa (σ² Within)"}),(0,a.jsx)("p",{className:"text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono mt-1",children:(0,g.formatNumber)(C.sigma2,2)}),(0,a.jsxs)("p",{className:"text-[10px] text-zinc-400 mt-1",children:["Total Varians = ",(0,g.formatNumber)(C.totalVariance,2)]})]}),(0,a.jsxs)("div",{className:"p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs",children:[(0,a.jsx)("p",{className:"text-[11px] font-medium text-zinc-500",children:"Kesesuaian Model Fit"}),(0,a.jsxs)("p",{className:"text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono mt-1",children:["AIC: ",(0,g.formatNumber)(C.aic,1)]}),(0,a.jsxs)("p",{className:"text-[10px] text-zinc-400 mt-1 font-mono",children:["Deviance (-2LL) = ",(0,g.formatNumber)(C.deviance,1)]})]})]}),C.clusterEstimates&&(0,a.jsx)(b,{clusterEstimates:C.clusterEstimates,overallMean:C.grandMean||50}),(0,a.jsx)(x.DataTableHasil,{title:"Tabel 1. Perbandingan Model Multilevel Berjenjang (Incremental Model Building: Model 1 s.d. Model 4)",subtitle:"Perbandingan estimasi parameter fixed effects b (SE), reduksi varians (R²_L1 & R²_L2), serta uji peningkatan kecocokan model (Δ -2LL).",columns:[{header:"Parameter / Komponen Model",accessorKey:"param"},{header:"Model 1 (Null)",accessorKey:"m1",align:"right"},{header:"Model 2 (Siswa L1)",accessorKey:"m2",align:"right"},{header:"Model 3 (Sekolah L2)",accessorKey:"m3",align:"right"},{header:"Model 4 (Model Penuh)",accessorKey:"m4",align:"right"}],data:J,notes:"Catatan: * p < .05, ** p < .01, *** p < .001. Angka di dalam tanda kurung adalah Standard Error (SE). Model 1 = Null Model; Model 2 = Student Predictors; Model 3 = School Predictors; Model 4 = Full Model."}),(0,a.jsx)(x.DataTableHasil,{title:"Tabel 2. Rincian Estimasi Koefisien Model Penuh (Full Multilevel Model Parameter Estimates)",subtitle:"Estimasi koefisien unstandardized (b), standardized (β*), kontribusi % varians terjelaskan unik per variabel, nilai t, p, dan 95% CI.",columns:[{header:"Prediktor / Parameter",accessorKey:"term"},{header:"Level Variabel",accessorKey:"level"},{header:"Koefisien (β / γ)",accessorKey:"estimate",align:"right"},{header:"Std. Error (SE)",accessorKey:"se",align:"right"},{header:"Standar (β*)",accessorKey:"stdBeta",align:"right"},{header:"% Var. Explained",accessorKey:"varExplained",align:"right"},{header:"t-value",accessorKey:"tValue",align:"right"},{header:"p-value",accessorKey:"pValue",align:"right"},{header:"95% CI Lower",accessorKey:"ciLower",align:"right"},{header:"95% CI Upper",accessorKey:"ciUpper",align:"right"}],data:Q,notes:"Catatan: Level 1 (Siswa) merujuk pada prediktor tingkat individu; Level 2 (Sekolah) merujuk pada karakteristik lingkungan/sekolah."}),X.length>0&&(0,a.jsx)(x.DataTableHasil,{title:`Tabel 3. Ranking Intercept Efek Acak Sekolah (Top 20 BLUP Empirical Bayes dari ${C.nClusters} Sekolah)`,subtitle:"Nilai estimasi empiris rata-rata performa sekolah setelah penyusutan (shrinkage correction)",columns:[{header:"ID Sekolah (Kluster)",accessorKey:"clusterId"},{header:"Jumlah Siswa (n)",accessorKey:"n",align:"right"},{header:"Raw Mean",accessorKey:"rawMean",align:"right"},{header:"BLUP Empirical Bayes Intercept",accessorKey:"blupIntercept",align:"right"},{header:"Std. Error (SE)",accessorKey:"se",align:"right"}],data:X}),(0,a.jsx)(v.AiCard,{analysisKey:`multilevel_${C.dv}_${C.clusterVar}`,defaultNarrative:(0,M.generateLocalMultilevelNarrative)(C),promptBuilder:()=>`
Tolong buatkan narasi laporan penelitian akademik berstandar APA 7th dalam Bahasa Indonesia untuk hasil Multilevel Model (HLM) menggunakan engine R (lme4) berikut:
- Outcome L1: ${C.dv}
- Cluster L2: ${C.clusterVar} (${C.nClusters} sekolah, ${C.nObservations} siswa)
- Intraclass Correlation Coefficient (ICC): ${(100*C.icc).toFixed(2)}% (${C.pctBetweenVariance.toFixed(1)}% antar sekolah, ${C.pctWithinVariance.toFixed(1)}% dalam sekolah)
- Varians Sekolah (tau00): ${(0,g.formatNumber)(C.tau00,2)}
- Varians Siswa (sigma2): ${(0,g.formatNumber)(C.sigma2,2)}
- Reliabilitas Sekolah: lambda = ${(0,g.formatNumber)(C.schoolReliability||.95,3)}
- Fixed Effects:
${(C.fixedEffects||[]).map(e=>`  * ${e.term} (${e.level}): B = ${(0,g.formatNumber)(e.estimate)}, SE = ${(0,g.formatNumber)(e.se)}, t = ${(0,g.formatNumber)(e.tValue)}, p = ${(0,g.formatPValue)(e.pValue)}`).join("\n")}
- Model Fit: AIC = ${(0,g.formatNumber)(C.aic,1)}, Deviance = ${(0,g.formatNumber)(C.deviance,1)}
                `.trim()})]}):(0,a.jsx)("div",{className:"py-12 text-center text-xs text-zinc-400",children:"Klik 'Estimasi Model Multilevel' di atas untuk menampilkan hasil tabel APA standar jurnal dan Caterpillar plot."})}),(0,a.jsx)(p.TabsContent,{value:"assumptions",className:"space-y-6 mt-4",children:(0,a.jsx)(k.AssumptionCard,{title:"Pemeriksaan Asumsi Diagnostik Multilevel Modeling (HLM)",subtitle:"Evaluasi asumsi kecukupan hierarki (ICC), normalitas residual Level 1, normalitas random effects Level 2, multikolinearitas VIF, dan homoskedastisitas.",assumptions:C?.assumptions||[]})}),(0,a.jsx)(p.TabsContent,{value:"r_console",className:"mt-4",children:(0,a.jsx)(N.RConsoleBlock,{title:"Output Konsol R - Multilevel HLM (Raw Text Output)",description:"Keluaran teks mentah resmi dari eksekusi fungsi lme4::lmer dan summary() di sesi R.",consoleOutput:C?.rConsoleOutput})}),(0,a.jsx)(p.TabsContent,{value:"r_code",className:"mt-4",children:(0,a.jsx)(y.RCodeBlock,{title:"Sintaks Verifikasi Multilevel Modeling (HLM) dengan lme4 di R",description:"Salin kode ini ke RStudio untuk memverifikasi nilai ICC, tau00, sigma2, Fixed Effects, dan BLUPs acak sekolah.",code:Y,packages:["lme4","lmerTest","performance"],fileName:"verifikasi_multilevel_lme4.R"})})]})]})}],53174)},36421,e=>{"use strict";var a=e.i(43476),t=e.i(84026),r=e.i(51757),i=e.i(56420);let s=(0,i.default)("triangle-alert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]),n=(0,i.default)("circle-x",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]]);var l=e.i(10818),d=e.i(15288),o=e.i(87486);e.s(["AssumptionCard",0,function({title:e="Evaluasi & Pemeriksaan Asumsi Statistik (Diagnostic Assumption Checks)",subtitle:i="Pemeriksaan asumsi parametrik untuk memastikan validitas inferensi dan memandu pemilihan uji alternatif jika asumsi terlanggar.",assumptions:c=[],className:m=""}){if(!c||0===c.length)return null;let u=c.filter(e=>"passed"===e.status).length,p=c.filter(e=>"warning"===e.status).length,f=c.filter(e=>"failed"===e.status).length;return(0,a.jsxs)(d.Card,{className:`shadow-sm border-zinc-200 dark:border-zinc-800 ${m}`,children:[(0,a.jsx)(d.CardHeader,{className:"pb-3",children:(0,a.jsxs)("div",{className:"flex flex-wrap items-center justify-between gap-2",children:[(0,a.jsxs)("div",{className:"flex items-center gap-2",children:[(0,a.jsx)("div",{className:"p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300",children:(0,a.jsx)(t.ShieldCheck,{className:"w-4 h-4"})}),(0,a.jsxs)("div",{children:[(0,a.jsx)(d.CardTitle,{className:"text-sm font-bold text-zinc-900 dark:text-zinc-100",children:e}),i&&(0,a.jsx)(d.CardDescription,{className:"text-xs mt-0.5",children:i})]})]}),(0,a.jsxs)("div",{className:"flex items-center gap-1.5",children:[u>0&&(0,a.jsxs)(o.Badge,{variant:"outline",className:"bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 text-[10px] font-mono",children:["✓ ",u," Terpenuhi"]}),p>0&&(0,a.jsxs)(o.Badge,{variant:"outline",className:"bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800 text-[10px] font-mono",children:["! ",p," Perhatian"]}),f>0&&(0,a.jsxs)(o.Badge,{variant:"outline",className:"bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-800 text-[10px] font-mono",children:["✕ ",f," Terlanggar"]})]})]})}),(0,a.jsx)(d.CardContent,{className:"space-y-3",children:(0,a.jsx)("div",{className:"grid grid-cols-1 gap-3",children:c.map((e,t)=>{let i="passed"===e.status,d="warning"===e.status;return(0,a.jsx)("div",{className:`p-3.5 rounded-xl border transition-colors ${i?"border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/10":d?"border-amber-200/80 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/10":"border-red-200/80 dark:border-red-900/40 bg-red-50/30 dark:bg-red-950/10"}`,children:(0,a.jsxs)("div",{className:"flex items-start justify-between gap-3",children:[(0,a.jsxs)("div",{className:"space-y-1 flex-1",children:[(0,a.jsxs)("div",{className:"flex items-center gap-2",children:[i?(0,a.jsx)(r.CheckCircle2,{className:"w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"}):d?(0,a.jsx)(s,{className:"w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0"}):(0,a.jsx)(n,{className:"w-4 h-4 text-red-600 dark:text-red-400 shrink-0"}),(0,a.jsx)("h4",{className:"text-xs font-bold text-zinc-900 dark:text-zinc-100",children:e.name}),e.category&&(0,a.jsx)("span",{className:"text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium",children:e.category})]}),(0,a.jsx)("p",{className:"text-[11.5px] text-zinc-700 dark:text-zinc-300 leading-relaxed pl-6",children:e.conclusion}),e.recommendation&&(0,a.jsxs)("div",{className:"flex items-center gap-1.5 pl-6 pt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium",children:[(0,a.jsx)(l.Info,{className:"w-3 h-3 text-[#008080] dark:text-[#14a3a3] shrink-0"}),(0,a.jsxs)("span",{children:[(0,a.jsx)("strong",{children:"Rekomendasi Tindakan:"})," ",e.recommendation]})]})]}),(0,a.jsxs)("div",{className:"text-right shrink-0",children:[(0,a.jsx)(o.Badge,{variant:"outline",className:`text-[10px] font-semibold ${i?"bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300":d?"bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300":"bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300"}`,children:i?"Terpenuhi":d?"Perhatian / Robust":"Terlanggar"}),e.threshold&&(0,a.jsxs)("p",{className:"text-[10px] text-zinc-400 font-mono mt-1",children:["Kriteria: ",e.threshold]})]})]})},t)})})})]})}],36421)},68042,e=>{"use strict";var a=e.i(43476),t=e.i(71645),r=e.i(8734),i=e.i(89664),s=e.i(62368),n=e.i(4139),l=e.i(19455),d=e.i(87486),o=e.i(75157);let c='ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';e.s(["RCodeBlock",0,function({title:e="Sintaks Verifikasi R (R Code)",description:m="Salin kode ini ke RStudio untuk memverifikasi dan mengonfirmasi hasil analisis 1:1.",code:u,packages:p=["stats"],fileName:f="analisis_verifikasi.R",className:x}){let[h,g]=t.useState(!1);return(0,a.jsxs)("div",{className:(0,o.cn)("rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100 shadow-md overflow-hidden",x),children:[(0,a.jsxs)("div",{className:"flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-zinc-900/90 border-b border-zinc-800",children:[(0,a.jsxs)("div",{className:"flex items-center gap-2",children:[(0,a.jsx)("div",{className:"p-1.5 rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30",children:(0,a.jsx)(n.Terminal,{className:"w-4 h-4"})}),(0,a.jsxs)("div",{children:[(0,a.jsxs)("h4",{className:"text-xs font-bold text-zinc-100 flex items-center gap-2",children:[e,(0,a.jsx)(d.Badge,{variant:"outline",className:"text-[10px] bg-blue-950/60 text-blue-300 border-blue-800 font-mono",style:{fontFamily:c},children:"R Script"})]}),m&&(0,a.jsx)("p",{className:"text-[11px] text-zinc-400 mt-0.5",children:m})]})]}),(0,a.jsxs)("div",{className:"flex items-center gap-2",children:[p&&p.length>0&&(0,a.jsxs)("div",{className:"hidden sm:flex items-center gap-1 text-[10px] text-zinc-400 mr-2",children:[(0,a.jsx)("span",{children:"Paket R:"}),p.map(e=>(0,a.jsx)("span",{className:"px-1.5 py-0.5 rounded bg-zinc-800 font-mono text-zinc-300",style:{fontFamily:c},children:e},e))]}),(0,a.jsxs)(l.Button,{size:"sm",variant:"ghost",onClick:()=>{navigator.clipboard.writeText(u),g(!0),setTimeout(()=>g(!1),2e3)},className:"h-8 text-xs cursor-pointer gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono",style:{fontFamily:c},children:[h?(0,a.jsx)(i.Check,{className:"w-3.5 h-3.5 text-emerald-400"}):(0,a.jsx)(r.Copy,{className:"w-3.5 h-3.5"}),h?"Tersalin":"Salin Kode R"]}),(0,a.jsxs)(l.Button,{size:"sm",variant:"ghost",onClick:()=>{let e=new Blob([u],{type:"text/plain;charset=utf-8"}),a=URL.createObjectURL(e),t=document.createElement("a");t.href=a,t.download=f,t.click(),URL.revokeObjectURL(a)},className:"h-8 text-xs cursor-pointer gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono",style:{fontFamily:c},title:"Download file .R",children:[(0,a.jsx)(s.Download,{className:"w-3.5 h-3.5"}),".R"]})]})]}),(0,a.jsx)("div",{className:"p-4 overflow-x-auto text-xs font-mono leading-relaxed",children:(0,a.jsx)("pre",{className:"text-zinc-200 whitespace-pre font-mono text-xs",style:{fontFamily:c},children:u})})]})}])},82235,e=>{"use strict";var a=e.i(43476),t=e.i(71645),r=e.i(74080),i=e.i(87486),s=e.i(75157);e.s(["VariableTooltip",0,function({item:e,children:n,side:l="right",className:d}){let[o,c]=t.useState(!1),[m,u]=t.useState(null),p=t.useRef(null),[f,x]=t.useState(!1);t.useEffect(()=>{x(!0)},[]);let h=e.dataType?.toLowerCase().includes("skala")||e.dataType?.toLowerCase().includes("kontinu")||e.dataType?.toLowerCase().includes("numeric");return(0,a.jsxs)("div",{ref:p,className:(0,s.cn)("inline-flex max-w-full",d),onMouseEnter:()=>{(()=>{if(!p.current)return;let e=p.current.getBoundingClientRect(),a=e.top,t=e.right+12;t+320>window.innerWidth-10&&(t=Math.max(10,e.left-320-12)),a+180>window.innerHeight-10&&(a=Math.max(10,window.innerHeight-180-12)),u({top:a,left:t})})(),c(!0)},onMouseLeave:()=>{c(!1)},children:[n,f&&o&&m&&"u">typeof document&&(0,r.createPortal)((0,a.jsxs)("div",{style:{position:"fixed",top:`${m.top}px`,left:`${m.left}px`,zIndex:999999},className:"w-72 md:w-80 p-3.5 rounded-2xl shadow-2xl border pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95 bg-zinc-950/95 dark:bg-zinc-900/98 text-zinc-100 border-zinc-700/80 backdrop-blur-md ring-1 ring-white/10",children:[(0,a.jsxs)("div",{className:"flex items-start justify-between gap-2 pb-2 border-b border-zinc-800",children:[(0,a.jsxs)("div",{className:"flex items-center gap-1.5 min-w-0",children:[h?(0,a.jsx)("span",{className:"flex items-center justify-center w-5 h-5 rounded-lg bg-teal-900/80 text-teal-300 font-bold font-mono text-[10px] shrink-0 border border-teal-700/60",children:"#"}):(0,a.jsx)("span",{className:"flex items-center justify-center w-5 h-5 rounded-lg bg-amber-900/80 text-amber-300 font-bold font-mono text-[10px] shrink-0 border border-amber-700/60",children:"T"}),(0,a.jsx)("span",{className:"font-mono font-bold text-xs text-white truncate",children:e.code})]}),(0,a.jsx)(i.Badge,{variant:"outline",className:(0,s.cn)("text-[9px] font-mono px-1.5 py-0 shrink-0 font-bold",e.level?.toLowerCase().includes("level 2")||e.level?.toLowerCase().includes("guru")||e.level?.toLowerCase().includes("sekolah")?"bg-teal-950 text-teal-300 border-teal-700":"bg-emerald-950 text-emerald-300 border-emerald-700"),children:e.level?.includes("Level 2")?"Level 2 (Sekolah/Guru)":"Level 1 (Siswa)"})]}),(0,a.jsxs)("div",{className:"pt-2 space-y-1.5",children:[(0,a.jsx)("p",{className:"text-xs font-bold text-teal-300 leading-snug",children:e.label}),(0,a.jsx)("p",{className:"text-[11px] text-zinc-300 leading-relaxed font-normal",children:e.operationalDefinition||e.label||"Indikator Asesmen Nasional."})]}),e.domain&&(0,a.jsxs)("div",{className:"mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-between text-[9.5px] text-zinc-400",children:[(0,a.jsx)("span",{className:"truncate max-w-[170px]",title:e.domain,children:e.domain}),(0,a.jsx)("span",{className:"font-mono text-zinc-400 font-semibold shrink-0",children:e.dataType})]})]}),document.body)]})}])},77572,e=>{"use strict";var a=e.i(43476),t=e.i(71645),r=e.i(75157);let i=t.createContext(void 0);e.s(["Tabs",0,function({value:e,onValueChange:s,defaultValue:n,className:l,children:d}){let[o,c]=t.useState(n||"");return(0,a.jsx)(i.Provider,{value:{value:void 0!==e?e:o,onValueChange:s||c},children:(0,a.jsx)("div",{className:(0,r.cn)("w-full",l),children:d})})},"TabsContent",0,function({value:e,className:s,children:n}){let l=t.useContext(i);if(!l)throw Error("TabsContent must be used within Tabs");return l.value!==e?null:(0,a.jsx)("div",{className:(0,r.cn)("mt-4 focus-visible:outline-none",s),children:n})},"TabsList",0,function({className:e,children:t}){return(0,a.jsx)("div",{className:(0,r.cn)("inline-flex h-10 items-center justify-center rounded-lg bg-zinc-100 p-1 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",e),children:t})},"TabsTrigger",0,function({value:e,className:s,children:n}){let l=t.useContext(i);if(!l)throw Error("TabsTrigger must be used within Tabs");let d=l.value===e;return(0,a.jsx)("button",{type:"button",onClick:()=>l.onValueChange(e),className:(0,r.cn)("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer",d?"bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-zinc-50 font-semibold":"hover:text-zinc-900 dark:hover:text-zinc-100",s),children:n})}])},54204,e=>{"use strict";e.s(["RSyntaxGenerator",0,{getTTestCode(e,a,t,r=50,i,s="data_latihan_jasp_multilevel.csv"){let n=`# ==============================================================================
# Verifikasi Uji-t (t-Test) di R
# Generated by BBKA Analytics Studio (Standar Akademik APA 7th)
# ==============================================================================

# 1. Memuat Paket
if (!requireNamespace("rstatix", quietly = TRUE)) install.packages("rstatix")
if (!requireNamespace("car", quietly = TRUE)) install.packages("car")
library(rstatix)
library(car)
library(dplyr)

# 2. Membaca Dataset
df <- read.csv("${s}", stringsAsFactors = TRUE)

`;return"independent"===e?n+=`# 3. Uji Asumsi Homogenitas Varians (Levene's Test)
levene_res <- car::leveneTest(${a} ~ as.factor(${t}), data = df)
print(levene_res)

# 4. Student's t-Test (Jika Asumsi Homogenitas Terpenuhi)
ttest_student <- t.test(${a} ~ ${t}, data = df, var.equal = TRUE)
print(ttest_student)

# 5. Welch's t-Test (Jika Asumsi Homogenitas Terlanggar)
ttest_welch <- t.test(${a} ~ ${t}, data = df, var.equal = FALSE)
print(ttest_welch)

# 6. Ukuran Pengaruh (Effect Size: Cohen's d)
effect_d <- rstatix::cohens_d(df, ${a} ~ ${t}, var.equal = TRUE)
print(effect_d)

# 7. Statistik Deskriptif per Kelompok
df %>%
  group_by(${t}) %>%
  summarise(
    N = n(),
    Mean = mean(${a}, na.rm = TRUE),
    SD = sd(${a}, na.rm = TRUE),
    SE = sd(${a}, na.rm = TRUE) / sqrt(n()),
    Median = median(${a}, na.rm = TRUE)
  )
`:"paired"===e?n+=`# 3. Paired Samples t-Test (Uji-t Berpasangan)
ttest_paired <- t.test(df$${a}, df$${i}, paired = TRUE)
print(ttest_paired)

# 4. Ukuran Pengaruh Cohen's d (Berpasangan)
diff_scores <- df$${a} - df$${i}
d_paired <- mean(diff_scores, na.rm = TRUE) / sd(diff_scores, na.rm = TRUE)
cat(sprintf("Cohen's d (Paired): %.4f\\n", d_paired))
`:n+=`# 3. One-Sample t-Test terhadap Nilai Acuan Standar (mu = ${r})
ttest_one <- t.test(df$${a}, mu = ${r})
print(ttest_one)

# 4. Cohen's d (One-sample)
d_one <- (mean(df$${a}, na.rm = TRUE) - ${r}) / sd(df$${a}, na.rm = TRUE)
cat(sprintf("Cohen's d (One Sample): %.4f\\n", d_one))
`,n},getAnovaCode(e,a,t="data_latihan_jasp_multilevel.csv"){let r=a.length>=2?`${e} ~ ${a[0]} * ${a[1]}`:`${e} ~ ${a[0]}`;return`# ==============================================================================
# Verifikasi ANOVA (Analysis of Variance) di R
# Generated by BBKA Analytics Studio (Standar Akademik APA 7th)
# ==============================================================================

# 1. Memuat Paket
if (!requireNamespace("car", quietly = TRUE)) install.packages("car")
if (!requireNamespace("effectsize", quietly = TRUE)) install.packages("effectsize")
library(car)
library(effectsize)

# 2. Membaca Dataset
df <- read.csv("${t}", stringsAsFactors = TRUE)

# 3. Estimasi Model ANOVA
fit_aov <- aov(${r}, data = df)
summary(fit_aov)

# 4. ANOVA Type III Sum of Squares (Standar JASP/SPSS untuk unbalanced design)
fit_lm <- lm(${r}, data = df)
car::Anova(fit_lm, type = "III")

# 5. Ukuran Pengaruh (Partial Eta Squared & Omega Squared)
eta_sq <- effectsize::eta_squared(fit_aov, partial = TRUE)
print(eta_sq)

# 6. Uji Lanjut Post-Hoc Tukey HSD
tukey_res <- TukeyHSD(fit_aov)
print(tukey_res)

# 7. Deskriptif Kelompok
aggregate(${e} ~ ${a.join(" + ")}, data = df, 
          FUN = function(x) c(N = length(x), Mean = mean(x), SD = sd(x)))
`},getAncovaCode(e,a,t,r="data_latihan_jasp_multilevel.csv"){let i=t.join(" + ");return`# ==============================================================================
# Verifikasi ANCOVA (Analysis of Covariance) di R
# Generated by BBKA Analytics Studio (Standar Akademik APA 7th)
# ==============================================================================

# 1. Memuat Paket
if (!requireNamespace("car", quietly = TRUE)) install.packages("car")
if (!requireNamespace("emmeans", quietly = TRUE)) install.packages("emmeans")
library(car)
library(emmeans)

# 2. Membaca Dataset
df <- read.csv("${r}", stringsAsFactors = TRUE)

# 3. Uji Asumsi Homogenitas Gradien Regresi (Homogeneity of Slopes)
fit_homog <- lm(${e} ~ ${a} * (${i}), data = df)
summary(aov(fit_homog))

# 4. Model Utama ANCOVA (Main Effects Model)
fit_ancova <- lm(${e} ~ ${a} + ${i}, data = df)
summary(fit_ancova)

# Tabel ANCOVA Type III Sum of Squares
car::Anova(fit_ancova, type = "III")

# 5. Rata-Rata Terkoreksi (Estimated Marginal Means / Adjusted Means)
adj_means <- emmeans::emmeans(fit_ancova, ~ ${a})
print(adj_means)

# Uji Perbandingan Pasangan Rata-Rata Terkoreksi
pairs(adj_means)
`},getManovaCode(e,a,t="data_latihan_jasp_multilevel.csv"){let r=`cbind(${e.join(", ")})`,i=a.join(" * ");return`# ==============================================================================
# Verifikasi MANOVA (Multivariate Analysis of Variance) di R
# Generated by BBKA Analytics Studio (Standar Akademik APA 7th)
# ==============================================================================

# 1. Memuat Paket
if (!requireNamespace("heplots", quietly = TRUE)) install.packages("heplots")
library(heplots)

# 2. Membaca Dataset
df <- read.csv("${t}", stringsAsFactors = TRUE)

# 3. Model MANOVA
fit_manova <- manova(${r} ~ ${i}, data = df)

# 4. Statistik Uji Multivariat
cat("=== 1. Wilks' Lambda ===\\n")
summary(fit_manova, test = "Wilks")

cat("\\n=== 2. Pillai's Trace ===\\n")
summary(fit_manova, test = "Pillai")

cat("\\n=== 3. Hotelling-Lawley Trace ===\\n")
summary(fit_manova, test = "Hotelling-Lawley")

cat("\\n=== 4. Roy's Largest Root ===\\n")
summary(fit_manova, test = "Roy")

# 5. Follow-up Univariate ANOVAs
cat("\\n=== 5. Follow-up Univariate ANOVAs ===\\n")
summary.aov(fit_manova)
`},getMultilevelCode(e,a,t=[],r=[],i="data_latihan_jasp_multilevel.csv"){let s=[...t,...r],n=s.length>0?s.join(" + "):"1";return`# ==============================================================================
# Verifikasi Multilevel Modeling (Linear Mixed Models / HLM) di R
# Generated by BBKA Analytics Studio (Standar Akademik APA 7th)
# Paket: lme4 & lmerTest
# ==============================================================================

# 1. Memuat Paket
if (!requireNamespace("lme4", quietly = TRUE)) install.packages("lme4")
if (!requireNamespace("lmerTest", quietly = TRUE)) install.packages("lmerTest")
if (!requireNamespace("performance", quietly = TRUE)) install.packages("performance")
library(lme4)
library(lmerTest)
library(performance)

# 2. Membaca Dataset
df <- read.csv("${i}", stringsAsFactors = TRUE)

# 3. Model 1: Null Model (Unconditional Model) untuk Menghitung ICC
null_model <- lmer(${e} ~ 1 + (1 | ${a}), data = df, REML = FALSE)
summary(null_model)

# Ekstraksi Komponen Varians & ICC
var_comp <- as.data.frame(VarCorr(null_model))
tau00   <- var_comp[var_comp$grp == "${a}", "vcov"]
sigma2  <- var_comp[var_comp$grp == "Residual", "vcov"]
icc     <- tau00 / (tau00 + sigma2)

cat(sprintf("\\n--- Intraclass Correlation Coefficient (ICC) ---\\n"))
cat(sprintf("Varians Antar-Sekolah (tau00)  : %.4f\\n", tau00))
cat(sprintf("Varians Dalam-Sekolah (sigma2) : %.4f\\n", sigma2))
cat(sprintf("Nilai ICC (rho)                : %.4f (%.2f%% varians di level sekolah)\\n", icc, icc * 100))

# 4. Model 2: Random Intercept Model dengan Prediktor Siswa & Sekolah
model_2 <- lmer(${e} ~ ${n} + (1 | ${a}), 
                data = df, REML = FALSE)
summary(model_2)

# Evaluasi Goodness of Fit & Snijders-Bosker R2
cat("\\n--- Indeks Kecocokan Model 2 ---\\n")
cat(sprintf("AIC: %.2f | BIC: %.2f | Deviance: %.2f\\n", 
            AIC(model_2), BIC(model_2), deviance(model_2)))

# Nilai R2 Marginal & Conditional (Nakagawa / Snijders-Bosker)
performance::r2(model_2)

# 5. Ekstraksi BLUP Random Intercept Sekolah (Top 10)
school_effects <- ranef(model_2)$${a}
head(school_effects, 10)
`},getMiceImputationCode:(e="data_latihan_jasp_multilevel.csv")=>`# ==============================================================================
# Analisis Pola Missing Data & Imputasi Machine Learning di R
# Paket Resmi: mice (Stef van Buuren), ranger, rpart & VIM
# ==============================================================================

# 1. Memuat Paket
if (!requireNamespace("mice", quietly = TRUE)) install.packages("mice")
if (!requireNamespace("ranger", quietly = TRUE)) install.packages("ranger")
if (!requireNamespace("rpart", quietly = TRUE)) install.packages("rpart")
if (!requireNamespace("VIM", quietly = TRUE)) install.packages("VIM")
library(mice)
library(ranger)
library(rpart)
library(VIM)

# 2. Membaca Dataset
df <- read.csv("${e}", stringsAsFactors = TRUE)

# 3. Diagnosis Pola Missing Data (MICE Pattern Table)
cat("=== Matriks Pola Missing Data (md.pattern) ===\\n")
pattern_matrix <- mice::md.pattern(df, plot = TRUE)
print(pattern_matrix)

# 4. METODE MACHINE LEARNING 1: Random Forest Imputation (mice.impute.rf via ranger)
# Non-parametrik, menangkap interaksi multi-variabel kompleks dan non-linear
cat("\\n=== 1. Menjalankan Imputasi Machine Learning: Random Forest (ranger) ===\\n")
imp_rf <- mice::mice(df, m = 5, method = "rf", rfPackage = "ranger", seed = 500)
df_imputed_rf <- mice::complete(imp_rf, 1)
write.csv(df_imputed_rf, "data_imputed_random_forest.csv", row.names = FALSE)

# 5. METODE MACHINE LEARNING 2: Decision Trees (CART - Classification & Regression Trees)
# Berbasis recursive partitioning (rpart) tanpa asumsi linearitas
cat("\\n=== 2. Menjalankan Imputasi Machine Learning: Decision Trees (CART) ===\\n")
imp_cart <- mice::mice(df, m = 5, method = "cart", seed = 500)
df_imputed_cart <- mice::complete(imp_cart, 1)
write.csv(df_imputed_cart, "data_imputed_cart.csv", row.names = FALSE)

# 6. METODE STANDAR MICE: Predictive Mean Matching (PMM)
cat("\\n=== 3. Menjalankan Imputasi Semi-Parametrik: PMM ===\\n")
imp_pmm <- mice::mice(df, m = 5, method = "pmm", seed = 500)
df_imputed_pmm <- mice::complete(imp_pmm, 1)
write.csv(df_imputed_pmm, "data_imputed_pmm.csv", row.names = FALSE)

cat("\\n✓ Selesai! Dataset hasil imputasi Machine Learning tersimpan siap dianalisis.\\n")
`,getMergeDataCode(e,a,t,r,i="left",s=[],n){let l=(a||"").endsWith(".xlsx")||(a||"").endsWith(".xls"),d=t===r?`by = "${t}"`:`by = c("${t}" = "${r}")`,o="inner"===i?"inner_join":"left_join",c=s.filter(e=>e!==r),m=c.length>0?`c("${r}", ${c.map(e=>`"${e}"`).join(", ")})`:"everything()";return`# ==============================================================================
# Script Penggabungan Data Multi-Level (Merge Siswa Level 1 & Guru Level 2) di R
# Generated by BBKA Analytics Studio (Standar Tidyverse R)
# ==============================================================================

# 1. Memuat Paket yang Diperlukan
if (!requireNamespace("dplyr", quietly = TRUE)) install.packages("dplyr")
if (!requireNamespace("readr", quietly = TRUE)) install.packages("readr")
${l?'if (!requireNamespace("readxl", quietly = TRUE)) install.packages("readxl")\n':""}library(dplyr)
library(readr)
${l?"library(readxl)\n":""}
# 2. Membaca Dataset Utama (Data Siswa / Level 1)
df_siswa <- read_csv("${e||"data_siswa_an.csv"}")

# 3. Membaca Dataset Sekunder (Data Guru / Satuan Pendidikan Level 2)
${l?`df_guru_raw <- read_excel("${a||"data_guru_sulingjar.xlsx"}"${n?`, sheet = "${n}"`:""})`:`df_guru_raw <- read_csv("${a||"data_guru_sulingjar.csv"}")`}

# 4. Agregasi Rata-Rata Data Guru per Satuan Pendidikan (${r})
# Jika 1 sekolah memiliki beberapa guru responden, nilai numerik diagregasikan ke rata-rata sekolah
df_guru_agg <- df_guru_raw %>%
  select(${m}) %>%
  group_by(${r}) %>%
  summarise(across(where(is.numeric), ~ mean(.x, na.rm = TRUE)), .groups = "drop")

# 5. Eksekusi Penggabungan Relasional (${o.toUpperCase()})
df_merged <- df_siswa %>%
  ${o}(df_guru_agg, ${d})

# 6. Ringkasan Diagnostik Hasil Penggabungan
cat("==============================================================================\\n")
cat("DIAGNOSTIK HASIL MERGE DATA MULTI-LEVEL:\\n")
cat(sprintf("  - Total Baris Awal (Siswa)       : %d baris\\n", nrow(df_siswa)))
cat(sprintf("  - Total Baris Akhir (Merged)     : %d baris\\n", nrow(df_merged)))
cat(sprintf("  - Total Kolom Bertambah          : %d variabel baru\\n", ncol(df_merged) - ncol(df_siswa)))
cat("==============================================================================\\n")

glimpse(df_merged)

# 7. Menyimpan Dataset Gabungan Siap Analisis HLM / Regresi
write_csv(df_merged, "data_merged_siswa_guru_clean.csv")
cat("\\n✓ File 'data_merged_siswa_guru_clean.csv' berhasil disimpan dan siap diverifikasi!\\n")
`},getDataPrepCode(e,a=[],t="data_asesmen_nasional_clean.csv",r){let i=e.length>0?e.map(e=>`"${e}"`).join(", "):"",s="";if(Array.isArray(a)&&a.length>0){let e=a.map(e=>"=="===e.op?`${e.col} == "${e.val}"`:"!="===e.op?`${e.col} != "${e.val}"`:">"===e.op?`${e.col} > ${e.val}`:">="===e.op?`${e.col} >= ${e.val}`:"<"===e.op?`${e.col} < ${e.val}`:"<="===e.op?`${e.col} <= ${e.val}`:"contains"===e.op?`grepl("${e.val}", as.character(${e.col}), ignore.case = TRUE)`:"not_null"===e.op?`!is.na(${e.col})`:`${e.col} ${e.op} ${e.val}`).join(" &\n    ");s=`
  # Filter Observasi Baris
  filter(
    ${e}
  ) %>%`}let n="";if(r&&r.isMerged&&r.secondaryFileName){let e=r.secondaryFileName.endsWith(".xlsx")||r.secondaryFileName.endsWith(".xls"),a=r.primaryKey||"kd_sekolah",t=r.secondaryKey||"kd_sekolah",i=a===t?`by = "${a}"`:`by = c("${a}" = "${t}")`,s="inner"===r.joinType?"inner_join":"left_join";n=`
# ------------------------------------------------------------------------------
# 2b. Penggabungan Data Sekunder (Data Guru / Satuan Pendidikan Level 2)
# ------------------------------------------------------------------------------
${e?`df_guru_raw <- readxl::read_excel("${r.secondaryFileName}"${r.sheetName?`, sheet = "${r.sheetName}"`:""})`:`df_guru_raw <- read_csv("${r.secondaryFileName}")`}

df_guru_agg <- df_guru_raw %>%
  group_by(${t}) %>%
  summarise(across(where(is.numeric), ~ mean(.x, na.rm = TRUE)), .groups = "drop")

df <- df %>%
  ${s}(df_guru_agg, ${i})
`}return`# ==============================================================================
# Script Persiapan & Pemrosesan Data Lanjutan di R (Data Wrangling Script)
# Generated by BBKA Analytics Studio (Standar Tidyverse R)
# ==============================================================================

# 1. Memuat Paket yang Diperlukan
if (!requireNamespace("dplyr", quietly = TRUE)) install.packages("dplyr")
if (!requireNamespace("readr", quietly = TRUE)) install.packages("readr")
library(dplyr)
library(readr)

# 2. Membaca Dataset Utama
df <- read_csv("${t}")
${n}
# 3. Tinjauan Struktur Data Awal
glimpse(df)

# 4. Pemrosesan Data (Filter & Subsetting Kolom)
df_clean <- df %>%${s}
  dplyr::select(${i||"everything()"})

# 5. Ringkasan Deskriptif Data Bersih
cat("=== Ringkasan Deskriptif Data Bersih ===\\n")
summary(df_clean)

# 6. Menyimpan Hasil Pembersihan Data
write_csv(df_clean, "data_clean_ready.csv")
cat("\\n✓ Data bersih berhasil disimpan ke 'data_clean_ready.csv'!\\n")
`},getRegressionCode(e,a,t="data_asesmen_nasional.csv"){let r=`# ==============================================================================
# Regresi Linier Berganda Berjenjang (Hierarchical Linear Regression) di R
# Estimasi Bertingkat (R\xb2 Change, Standardized Beta, VIF)
# Generated by BBKA Analytics Studio (Standar Akademik APA 7th)
# ==============================================================================

# 1. Memuat Paket
if (!requireNamespace("car", quietly = TRUE)) install.packages("car")
if (!requireNamespace("lm.beta", quietly = TRUE)) install.packages("lm.beta")
library(car)
library(lm.beta)

# 2. Membaca Dataset
df <- read.csv("${t}", stringsAsFactors = TRUE)

`,i=[],s=[];return a.forEach((a,t)=>{i=Array.from(new Set([...i,...a.variables]));let n=`model_${t+1}`;s.push(n),r+=`# Model ${t+1}: ${a.blockName||`Blok ${t+1}`}
${n} <- lm(${e} ~ ${i.join(" + ")}, data = df)
summary(${n})
summary(lm.beta(${n})) # Standardized Beta Coefficients
`,i.length>1?r+=`car::vif(${n}) # Multicollinearity Check (VIF)

`:r+=`
`}),s.length>1&&(r+=`# ==============================================================================
# 3. Uji Perbandingan Model Berjenjang (Hierarchical Model Comparison / F-Change)
# ==============================================================================
anova_comp <- anova(${s.join(", ")})
print(anova_comp)
`),r},getSEMCode:(e,a="data_asesmen_nasional.csv")=>`# ==============================================================================
# Structural Equation Modeling (SEM) & Path Analysis di R
# Package: lavaan (Latent Variable Analysis)
# Generated by BBKA Analytics Studio (Standar Akademik APA 7th)
# ==============================================================================

# 1. Memuat Paket
if (!requireNamespace("lavaan", quietly = TRUE)) install.packages("lavaan")
if (!requireNamespace("semPlot", quietly = TRUE)) install.packages("semPlot")
library(lavaan)
library(semPlot)

# 2. Membaca Dataset
df <- read.csv("${a}", stringsAsFactors = TRUE)

# 3. Spesifikasi Model Sintaks Lavaan
model_syntax <- '
${e.trim()}
'

# 4. Estimasi Model SEM
fit <- sem(model = model_syntax, data = df, missing = "fiml", estimator = "ML", fixed.x = FALSE)
summary(fit, fit.measures = TRUE, standardized = TRUE, rsquare = TRUE)

# 5. Ekstraksi Fit Indices Utama
fitMeasures(fit, c("chisq", "df", "pvalue", "cfi", "tli", "rmsea", "rmsea.ci.lower", "rmsea.ci.upper", "srmr", "aic", "bic"))

# 6. Parameter Estimates & Efek Mediasi
parameterEstimates(fit, standardized = TRUE, ci = TRUE)

# 7. Visualisasi Diagram Jalur (Path Diagram)
semPaths(fit, what = "std", edge.label.cex = 0.9, layout = "tree", style = "ram", nCharNodes = 0)
`,getIPDMetaCode(e,a,t,r=[],i="data_asesmen_nasional.csv"){let s=r.length>0?` + ${r.join(" + ")}`:"",n=`${e} ~ ${a}${s}`;return`# ==============================================================================
# Two-Stage Individual Participant Data (IPD) Meta-Analysis di R
# Standard: Brunner et al. (2022) & Eryilmaz & Strietholt (2025)
# Generated by BBKA Analytics Studio (Standar Publikasi Jurnal Q1)
# ==============================================================================

# 1. Memuat Paket
if (!requireNamespace("metafor", quietly = TRUE)) install.packages("metafor")
if (!requireNamespace("dplyr", quietly = TRUE)) install.packages("dplyr")
if (!requireNamespace("ggplot2", quietly = TRUE)) install.packages("ggplot2")
library(metafor)
library(dplyr)
library(ggplot2)

# 2. Membaca Dataset
df <- read.csv("${i}", stringsAsFactors = TRUE)

# 3. TAHAP 1: Estimasi Regresi OLS Terpisah per Klaster/Provinsi (${t})
cluster_results <- df %>%
  group_by(${t}) %>%
  filter(n() >= ${r.length+5}) %>%
  do({
    fit <- lm(${n}, data = .)
    s <- summary(fit)
    coefs <- coef(s)
    
    if ("${a}" %in% rownames(coefs)) {
      data.frame(
        cluster_id = unique(.[[ "${t}" ]]),
        n_obs      = nrow(.),
        beta       = coefs["${a}", "Estimate"],
        se         = coefs["${a}", "Std. Error"],
        t_val      = coefs["${a}", "t value"],
        p_val      = coefs["${a}", "Pr(>|t|)"]
      )
    } else {
      data.frame()
    }
  }) %>%
  ungroup()

cat("=== Ringkasan Estimasi Tahap 1 per Klaster (${t}) ===\\n")
print(cluster_results)

# 4. TAHAP 2: Random-Effects Meta-Analysis via REML (Restricted Maximum Likelihood)
meta_fit <- rma(
  yi = beta, 
  sei = se, 
  data = cluster_results, 
  method = "REML",
  slab = cluster_results$cluster_id
)

cat("\\n=== Ringkasan Model Meta-Analisis IPD (Tahap 2) ===\\n")
summary(meta_fit)

# 5. Visualisasi Forest Plot Standar Publikasi Internasional
forest(
  meta_fit,
  xlab = "Koefisien Efek (${a} -> ${e})",
  slab = cluster_results$cluster_id,
  showweights = TRUE,
  col = "#008080",
  border = "#004d4d",
  header = c("Klaster / Wilayah", "Estimasi [95% CI] (Bobot %)")
)

# 6. Diagnostik Heterogenitas & Uji Publikasi
cat("\\n--- Metrik Heterogenitas ---\\n")
cat(sprintf("I-squared (I^2) : %.2f%%\\n", meta_fit$I2))
cat(sprintf("Tau-squared (tau^2) : %.4f\\n", meta_fit$tau2))
cat(sprintf("Cochran Q Test  : Q = %.2f (df = %d, p = %.5f)\\n", meta_fit$QE, meta_fit$k - 1, meta_fit$QEp))
`}}])}]);