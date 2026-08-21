(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,99847,e=>{"use strict";let a=(0,e.i(56420).default)("circle-alert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);e.s(["AlertCircle",0,a],99847)},52330,e=>{"use strict";let a=(0,e.i(56420).default)("code-xml",[["path",{d:"m18 16 4-4-4-4",key:"1inbqp"}],["path",{d:"m6 8-4 4 4 4",key:"15zrgr"}],["path",{d:"m14.5 4-5 16",key:"e7oirm"}]]);e.s(["Code2",0,a],52330)},71136,35184,e=>{"use strict";var a=e.i(56420);let t=(0,a.default)("hash",[["line",{x1:"4",x2:"20",y1:"9",y2:"9",key:"4lhtct"}],["line",{x1:"4",x2:"20",y1:"15",y2:"15",key:"vyu0kd"}],["line",{x1:"10",x2:"8",y1:"3",y2:"21",key:"1ggp8o"}],["line",{x1:"16",x2:"14",y1:"3",y2:"21",key:"weycgp"}]]);e.s(["Hash",0,t],71136);let i=(0,a.default)("type",[["path",{d:"M12 4v16",key:"1654pz"}],["path",{d:"M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2",key:"e0r10z"}],["path",{d:"M9 20h6",key:"s66wpe"}]]);e.s(["Type",0,i],35184)},77071,e=>{"use strict";let a=(0,e.i(56420).default)("plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);e.s(["Plus",0,a],77071)},66595,e=>{"use strict";let a=(0,e.i(56420).default)("search",[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]]);e.s(["Search",0,a],66595)},4139,e=>{"use strict";let a=(0,e.i(56420).default)("terminal",[["path",{d:"M12 19h8",key:"baeox8"}],["path",{d:"m4 17 6-6-6-6",key:"1yngyt"}]]);e.s(["Terminal",0,a],4139)},13953,e=>{"use strict";var a=e.i(43476),t=e.i(71645),i=e.i(92150),s=e.i(21357),r=e.i(52330),n=e.i(51757),l=e.i(4139),d=e.i(84026),o=e.i(64569),c=e.i(95925),m=e.i(19455),u=e.i(15288),p=e.i(77572),f=e.i(87486),g=e.i(98898),x=e.i(57086),h=e.i(36421),b=e.i(59009),k=e.i(68042),v=e.i(58841),y=e.i(48107),_=e.i(36841),j=e.i(71816),N=e.i(75157),$=e.i(54204);e.s(["default",0,function(){let{data:e,columns:A,fileName:T,loadDefaultDataset:M}=(0,_.useDatasetStore)(),{manovaConfig:R,setManovaConfig:S,executeManova:E,manovaResult:w,isCalculating:C,error:P,clearSpecificAnalysis:z}=(0,j.useAnalysisStore)(),[U,V]=t.useState("tables"),[q,D]=t.useState(!0),[L,B]=t.useState(!1),F=t.useRef(!0);t.useEffect(()=>{j.useAnalysisStore.setState({error:null}),0!==e.length||T||M()},[]),t.useEffect(()=>{if(F.current&&(F.current=!1,w)||!q||0===e.length||!R.dvs||R.dvs.length<2||!R.factors||0===R.factors.length)return;B(!0);let a=setTimeout(()=>{B(!1),E(e)},450);return()=>{clearTimeout(a),B(!1)}},[q,e,R.dvs,R.factors]);let I=[];if(w?.multivariateEffects)for(let e of(0,N.ensureArray)(w.multivariateEffects))for(let a of(0,N.ensureArray)(e.stats))I.push({source:e.source,testName:"Wilks"===a.test?"Wilks' Lambda (Λ)":"Pillai"===a.test?"Pillai's Trace (V)":"Hotelling"===a.test?"Hotelling-Lawley (T)":"Roy's Largest Root (θ)",statValue:(0,N.formatNumber)(a.value,4),approxF:(0,N.formatNumber)(a.approxF),numDf:(0,N.formatNumber)(a.numDf,1),denDf:(0,N.formatNumber)(a.denDf,1),pValue:(0,N.formatPValue)(a.pValue),partialEtaSq:(0,N.formatNumber)(a.partialEtaSq)});let K=(0,N.ensureArray)(w?.dvs),H=(0,N.ensureArray)(w?.factors),O=$.RSyntaxGenerator.getManovaCode((0,N.ensureArray)(R.dvs),(0,N.ensureArray)(R.factors),T||"data_latihan_jasp_multilevel.csv");return(0,a.jsxs)("div",{className:"space-y-6",children:[(0,a.jsxs)(y.PageHeader,{icon:i.Boxes,title:"Analisis Multivariat (MANOVA)",badgeIcon:n.CheckCircle2,badgeText:"R Engine (stats::manova)",description:"Uji pengaruh faktor kelompok terhadap multivariat variabel dependen kontinu secara simultan (Pillai, Wilks, Hotelling, Roy).",children:[(0,a.jsxs)(m.Button,{type:"button",variant:"outline",size:"sm",onClick:()=>{z("manova")},className:"text-xs h-9 px-3 gap-1.5 rounded-xl border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer shadow-2xs font-medium",title:"Bersihkan model dan reset hasil analisis",children:[(0,a.jsx)(c.RotateCcw,{className:"w-3.5 h-3.5"}),"Reset Analisis"]}),(0,a.jsxs)("button",{type:"button",onClick:()=>D(!q),className:(0,N.cn)("text-xs px-3 py-2 rounded-xl font-medium border flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs whitespace-nowrap h-9",q?"bg-teal-50 border-teal-300 text-teal-900 dark:bg-teal-950/80 dark:border-teal-700 dark:text-teal-200 ring-1 ring-teal-500/20":"bg-zinc-100 border-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400"),title:"Mode Komputasi Reaktif: Hitung otomatis saat variabel diubah seperti di JASP/Jamovi",children:[(0,a.jsx)(o.Zap,{className:(0,N.cn)("w-3.5 h-3.5",q?"text-amber-500 fill-amber-500":"text-zinc-400")}),(0,a.jsxs)("span",{children:["Auto-Run ",q?"Aktif":"Manual"]}),L&&(0,a.jsx)("span",{className:"w-2 h-2 rounded-full bg-amber-500 animate-ping ml-0.5"})]}),(0,a.jsxs)(m.Button,{onClick:()=>{e.length>0&&E(e)},disabled:C||0===e.length,className:"bg-[#008080] hover:bg-[#006666] dark:bg-[#14a3a3] dark:hover:bg-[#0f8787] text-white dark:text-[#04211f] cursor-pointer gap-2 text-xs px-4 py-2 shadow-xs font-semibold rounded-xl whitespace-nowrap h-9",children:[(0,a.jsx)(s.Play,{className:"w-3.5 h-3.5 fill-current"}),"Jalankan MANOVA"]})]}),(0,a.jsxs)(u.Card,{children:[(0,a.jsxs)(u.CardHeader,{className:"pb-3",children:[(0,a.jsx)(u.CardTitle,{className:"text-sm",children:"Konfigurasi Variabel MANOVA"}),(0,a.jsx)(u.CardDescription,{className:"text-xs",children:"Pilih minimal 2 variabel dependen simultan dan faktor kelompok."})]}),(0,a.jsx)(u.CardContent,{children:(0,a.jsx)(g.VariableSelector,{columns:A,slots:[{id:"dvs",label:"Dependent Variables (Minimal 2 Variabel Terikat)",description:"Variabel hasil simultan (contoh: nilai_literasi dan nilai_numerasi)",typeFilter:"numeric",multi:!0,selected:R.dvs,onChange:e=>S({dvs:e})},{id:"factors",label:"Fixed Factor (Faktor Kelompok)",description:"Faktor pengelompokan (contoh: status_sekolah atau status_wilayah)",typeFilter:"nominal",multi:!0,selected:R.factors,onChange:e=>S({factors:e.slice(0,1)})}]})})]}),P&&(0,a.jsx)("div",{className:"p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs border border-red-200 dark:border-red-900",children:P}),(0,a.jsxs)(p.Tabs,{value:U,onValueChange:V,children:[(0,a.jsx)("div",{className:"flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2",children:(0,a.jsxs)(p.TabsList,{className:"bg-zinc-100 dark:bg-zinc-800/80 p-1",children:[(0,a.jsx)(p.TabsTrigger,{value:"tables",children:"Tabel Hasil & Narasi APA"}),(0,a.jsxs)(p.TabsTrigger,{value:"assumptions",className:"flex items-center gap-1.5",children:[(0,a.jsx)(d.ShieldCheck,{className:"w-3.5 h-3.5 text-emerald-500"}),"Uji Asumsi Statistik"]}),(0,a.jsxs)(p.TabsTrigger,{value:"r_console",className:"flex items-center gap-1.5",children:[(0,a.jsx)(l.Terminal,{className:"w-3.5 h-3.5 text-emerald-500"}),"Output Konsol R (Terminal)"]}),(0,a.jsxs)(p.TabsTrigger,{value:"r_code",className:"flex items-center gap-1.5",children:[(0,a.jsx)(r.Code2,{className:"w-3.5 h-3.5 text-blue-500"}),"Sintaks Verifikasi R"]})]})}),(0,a.jsx)(p.TabsContent,{value:"tables",className:"space-y-6 mt-4",children:w?(0,a.jsxs)("div",{className:"space-y-6",children:[(0,a.jsx)(x.DataTableHasil,{title:`Tabel 1. Uji Multivariat MANOVA untuk [${K.join(", ")}]`,columns:[{header:"Efek (Source)",accessorKey:"source"},{header:"Uji Multivariat",accessorKey:"testName"},{header:"Nilai Statistik (Value)",accessorKey:"statValue",align:"right"},{header:"Approx. F",accessorKey:"approxF",align:"right"},{header:"Num df",accessorKey:"numDf",align:"right"},{header:"Den df",accessorKey:"denDf",align:"right"},{header:"p-value",accessorKey:"pValue",align:"right"},{header:"Partial η²",accessorKey:"partialEtaSq",align:"right"}],data:I,notes:"Catatan: Wilks' Lambda mengukur proporsi varians yang tidak dijelaskan. Pillai's Trace paling kuat terhadap deviasi asumsi. * p < .05, ** p < .01, *** p < .001."}),w.boxM&&(0,a.jsxs)("div",{className:"p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex items-center justify-between text-xs",children:[(0,a.jsxs)("div",{children:[(0,a.jsx)("span",{className:"font-semibold text-zinc-900 dark:text-zinc-100",children:"Uji Homogenitas Matriks Kovarians (Box's M Test):"})," ",(0,a.jsxs)("span",{className:"font-mono text-zinc-700 dark:text-zinc-300",children:["M = ",(0,N.formatNumber)(w.boxM.mValue),", F(",w.boxM.df1,", ",(0,N.formatNumber)(w.boxM.df2,0),") = ",(0,N.formatNumber)(w.boxM.approxF),", p = ",(0,N.formatPValue)(w.boxM.pValue)]})]}),(0,a.jsx)(f.Badge,{variant:w.boxM.pValue>=.001?"success":"warning",className:"text-[11px]",children:w.boxM.pValue>=.001?"Kovarians Homogen (p > .001)":"Peringatan: Asumsi Kovarians Heterogen (Gunakan Pillai)"})]}),w.univariateAnovas&&(0,a.jsxs)("div",{className:"space-y-4",children:[(0,a.jsx)("h4",{className:"font-serif text-sm font-bold text-zinc-900 dark:text-zinc-100",children:"Uji Lanjut Univariate ANOVA (Follow-up Post-Hoc per DV):"}),Object.entries(w.univariateAnovas).map(([e,t])=>(0,a.jsx)(x.DataTableHasil,{title:`Tabel 2. Follow-up Univariate ANOVA: ${e}`,columns:[{header:"Sumber Variasi",accessorKey:"source"},{header:"SS",accessorKey:"ss",align:"right"},{header:"df",accessorKey:"df",align:"right"},{header:"MS",accessorKey:"ms",align:"right"},{header:"F",accessorKey:"f",align:"right"},{header:"p-value",accessorKey:"pValue",align:"right"},{header:"Partial η²",accessorKey:"partialEtaSq",align:"right"}],data:(0,N.ensureArray)(t?.table).map(e=>({source:e.source,ss:(0,N.formatNumber)(e.ss),df:e.df,ms:(0,N.formatNumber)(e.ms),f:isNaN(e.f)?"-":(0,N.formatNumber)(e.f),pValue:isNaN(e.pValue)?"-":(0,N.formatPValue)(e.pValue),partialEtaSq:void 0!==e.partialEtaSquared?(0,N.formatNumber)(e.partialEtaSquared):"-"}))},e))]}),(0,a.jsx)(b.AiCard,{analysisKey:`manova_${K.join("_")}_${H.join("_")}`,defaultNarrative:`
### Ringkasan Hasil Analisis MANOVA (APA 7th Format)

Analisis **Multivariate Analysis of Variance (MANOVA)** satu jalur diterapkan untuk menguji pengaruh **${H.join(" & ")}** secara simultan terhadap dua variabel capaian: **${K.join(" & ")}**.

1. **Hasil Uji Statistik Multivariat**:
   - **Wilks' Lambda ($\\Lambda$)**: $\\Lambda = ${(0,N.formatNumber)(w.multivariateEffects?.[0]?.stats?.[0]?.value,4)}$, $F = ${(0,N.formatNumber)(w.multivariateEffects?.[0]?.stats?.[0]?.approxF)}$, $p = ${(0,N.formatPValue)(w.multivariateEffects?.[0]?.stats?.[0]?.pValue)}$, $\\eta^2_p = ${(0,N.formatNumber)(w.multivariateEffects?.[0]?.stats?.[0]?.partialEtaSq)}$.
   - **Pillai's Trace ($V$)**: $V = ${(0,N.formatNumber)(w.multivariateEffects?.[0]?.stats?.[1]?.value,4)}$, $F = ${(0,N.formatNumber)(w.multivariateEffects?.[0]?.stats?.[1]?.approxF)}$, $p = ${(0,N.formatPValue)(w.multivariateEffects?.[0]?.stats?.[1]?.pValue)}$.

2. **Kesimpulan Multivariat**:
   Terdapat pengaruh gabungan yang **signifikan secara statistik** dari ${H.join(" & ")} terhadap vektor komposit capaian ${K.join(" & ")} ($p < .05$).

3. **Uji Univariat Lanjutan (Follow-up ANOVAs)**:
   Pengujian univariat terpisah menunjukkan bahwa kelompok berbeda secara signifikan baik pada masing-masing dimensi capaian asesmen.
                `.trim()})]}):(0,a.jsx)("div",{className:"py-12 text-center text-xs text-zinc-400",children:"Klik 'Jalankan MANOVA' di atas untuk menampilkan hasil tabel APA."})}),(0,a.jsx)(p.TabsContent,{value:"assumptions",className:"space-y-6 mt-4",children:(0,a.jsx)(h.AssumptionCard,{title:"Pemeriksaan Asumsi MANOVA",subtitle:"Pemeriksaan homogenitas matriks kovarians (Box's M test) dan multikolinearitas antar variabel dependen.",assumptions:w?.assumptions||[]})}),(0,a.jsx)(p.TabsContent,{value:"r_console",className:"mt-4",children:(0,a.jsx)(v.RConsoleBlock,{title:"Output Konsol R - MANOVA (Raw Text Output)",description:"Keluaran teks mentah resmi dari eksekusi fungsi stats::manova dan summary() di sesi R.",consoleOutput:w?.rConsoleOutput})}),(0,a.jsx)(p.TabsContent,{value:"r_code",className:"mt-4",children:(0,a.jsx)(k.RCodeBlock,{title:"Sintaks Verifikasi MANOVA di R",description:"Salin kode ini ke RStudio untuk memverifikasi nilai Wilks' Lambda, Pillai, Hotelling, Roy, dan Box's M.",code:O,packages:["heplots","biotools"],fileName:"verifikasi_manova.R"})})]})]})}])},36421,e=>{"use strict";var a=e.i(43476),t=e.i(84026),i=e.i(51757),s=e.i(56420);let r=(0,s.default)("triangle-alert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]),n=(0,s.default)("circle-x",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]]);var l=e.i(10818),d=e.i(15288),o=e.i(87486);e.s(["AssumptionCard",0,function({title:e="Evaluasi & Pemeriksaan Asumsi Statistik (Diagnostic Assumption Checks)",subtitle:s="Pemeriksaan asumsi parametrik untuk memastikan validitas inferensi dan memandu pemilihan uji alternatif jika asumsi terlanggar.",assumptions:c=[],className:m=""}){if(!c||0===c.length)return null;let u=c.filter(e=>"passed"===e.status).length,p=c.filter(e=>"warning"===e.status).length,f=c.filter(e=>"failed"===e.status).length;return(0,a.jsxs)(d.Card,{className:`shadow-sm border-zinc-200 dark:border-zinc-800 ${m}`,children:[(0,a.jsx)(d.CardHeader,{className:"pb-3",children:(0,a.jsxs)("div",{className:"flex flex-wrap items-center justify-between gap-2",children:[(0,a.jsxs)("div",{className:"flex items-center gap-2",children:[(0,a.jsx)("div",{className:"p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300",children:(0,a.jsx)(t.ShieldCheck,{className:"w-4 h-4"})}),(0,a.jsxs)("div",{children:[(0,a.jsx)(d.CardTitle,{className:"text-sm font-bold text-zinc-900 dark:text-zinc-100",children:e}),s&&(0,a.jsx)(d.CardDescription,{className:"text-xs mt-0.5",children:s})]})]}),(0,a.jsxs)("div",{className:"flex items-center gap-1.5",children:[u>0&&(0,a.jsxs)(o.Badge,{variant:"outline",className:"bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 text-[10px] font-mono",children:["✓ ",u," Terpenuhi"]}),p>0&&(0,a.jsxs)(o.Badge,{variant:"outline",className:"bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800 text-[10px] font-mono",children:["! ",p," Perhatian"]}),f>0&&(0,a.jsxs)(o.Badge,{variant:"outline",className:"bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-800 text-[10px] font-mono",children:["✕ ",f," Terlanggar"]})]})]})}),(0,a.jsx)(d.CardContent,{className:"space-y-3",children:(0,a.jsx)("div",{className:"grid grid-cols-1 gap-3",children:c.map((e,t)=>{let s="passed"===e.status,d="warning"===e.status;return(0,a.jsx)("div",{className:`p-3.5 rounded-xl border transition-colors ${s?"border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/10":d?"border-amber-200/80 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/10":"border-red-200/80 dark:border-red-900/40 bg-red-50/30 dark:bg-red-950/10"}`,children:(0,a.jsxs)("div",{className:"flex items-start justify-between gap-3",children:[(0,a.jsxs)("div",{className:"space-y-1 flex-1",children:[(0,a.jsxs)("div",{className:"flex items-center gap-2",children:[s?(0,a.jsx)(i.CheckCircle2,{className:"w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"}):d?(0,a.jsx)(r,{className:"w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0"}):(0,a.jsx)(n,{className:"w-4 h-4 text-red-600 dark:text-red-400 shrink-0"}),(0,a.jsx)("h4",{className:"text-xs font-bold text-zinc-900 dark:text-zinc-100",children:e.name}),e.category&&(0,a.jsx)("span",{className:"text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium",children:e.category})]}),(0,a.jsx)("p",{className:"text-[11.5px] text-zinc-700 dark:text-zinc-300 leading-relaxed pl-6",children:e.conclusion}),e.recommendation&&(0,a.jsxs)("div",{className:"flex items-center gap-1.5 pl-6 pt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium",children:[(0,a.jsx)(l.Info,{className:"w-3 h-3 text-[#008080] dark:text-[#14a3a3] shrink-0"}),(0,a.jsxs)("span",{children:[(0,a.jsx)("strong",{children:"Rekomendasi Tindakan:"})," ",e.recommendation]})]})]}),(0,a.jsxs)("div",{className:"text-right shrink-0",children:[(0,a.jsx)(o.Badge,{variant:"outline",className:`text-[10px] font-semibold ${s?"bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300":d?"bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300":"bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300"}`,children:s?"Terpenuhi":d?"Perhatian / Robust":"Terlanggar"}),e.threshold&&(0,a.jsxs)("p",{className:"text-[10px] text-zinc-400 font-mono mt-1",children:["Kriteria: ",e.threshold]})]})]})},t)})})})]})}],36421)},68042,e=>{"use strict";var a=e.i(43476),t=e.i(71645),i=e.i(8734),s=e.i(89664),r=e.i(62368),n=e.i(4139),l=e.i(19455),d=e.i(87486),o=e.i(75157);let c='ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';e.s(["RCodeBlock",0,function({title:e="Sintaks Verifikasi R (R Code)",description:m="Salin kode ini ke RStudio untuk memverifikasi dan mengonfirmasi hasil analisis 1:1.",code:u,packages:p=["stats"],fileName:f="analisis_verifikasi.R",className:g}){let[x,h]=t.useState(!1);return(0,a.jsxs)("div",{className:(0,o.cn)("rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100 shadow-md overflow-hidden",g),children:[(0,a.jsxs)("div",{className:"flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-zinc-900/90 border-b border-zinc-800",children:[(0,a.jsxs)("div",{className:"flex items-center gap-2",children:[(0,a.jsx)("div",{className:"p-1.5 rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30",children:(0,a.jsx)(n.Terminal,{className:"w-4 h-4"})}),(0,a.jsxs)("div",{children:[(0,a.jsxs)("h4",{className:"text-xs font-bold text-zinc-100 flex items-center gap-2",children:[e,(0,a.jsx)(d.Badge,{variant:"outline",className:"text-[10px] bg-blue-950/60 text-blue-300 border-blue-800 font-mono",style:{fontFamily:c},children:"R Script"})]}),m&&(0,a.jsx)("p",{className:"text-[11px] text-zinc-400 mt-0.5",children:m})]})]}),(0,a.jsxs)("div",{className:"flex items-center gap-2",children:[p&&p.length>0&&(0,a.jsxs)("div",{className:"hidden sm:flex items-center gap-1 text-[10px] text-zinc-400 mr-2",children:[(0,a.jsx)("span",{children:"Paket R:"}),p.map(e=>(0,a.jsx)("span",{className:"px-1.5 py-0.5 rounded bg-zinc-800 font-mono text-zinc-300",style:{fontFamily:c},children:e},e))]}),(0,a.jsxs)(l.Button,{size:"sm",variant:"ghost",onClick:()=>{navigator.clipboard.writeText(u),h(!0),setTimeout(()=>h(!1),2e3)},className:"h-8 text-xs cursor-pointer gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono",style:{fontFamily:c},children:[x?(0,a.jsx)(s.Check,{className:"w-3.5 h-3.5 text-emerald-400"}):(0,a.jsx)(i.Copy,{className:"w-3.5 h-3.5"}),x?"Tersalin":"Salin Kode R"]}),(0,a.jsxs)(l.Button,{size:"sm",variant:"ghost",onClick:()=>{let e=new Blob([u],{type:"text/plain;charset=utf-8"}),a=URL.createObjectURL(e),t=document.createElement("a");t.href=a,t.download=f,t.click(),URL.revokeObjectURL(a)},className:"h-8 text-xs cursor-pointer gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono",style:{fontFamily:c},title:"Download file .R",children:[(0,a.jsx)(r.Download,{className:"w-3.5 h-3.5"}),".R"]})]})]}),(0,a.jsx)("div",{className:"p-4 overflow-x-auto text-xs font-mono leading-relaxed",children:(0,a.jsx)("pre",{className:"text-zinc-200 whitespace-pre font-mono text-xs",style:{fontFamily:c},children:u})})]})}])},82235,e=>{"use strict";var a=e.i(43476),t=e.i(71645),i=e.i(74080),s=e.i(87486),r=e.i(75157);e.s(["VariableTooltip",0,function({item:e,children:n,side:l="right",className:d}){let[o,c]=t.useState(!1),[m,u]=t.useState(null),p=t.useRef(null),[f,g]=t.useState(!1);t.useEffect(()=>{g(!0)},[]);let x=e.dataType?.toLowerCase().includes("skala")||e.dataType?.toLowerCase().includes("kontinu")||e.dataType?.toLowerCase().includes("numeric");return(0,a.jsxs)("div",{ref:p,className:(0,r.cn)("inline-flex max-w-full",d),onMouseEnter:()=>{(()=>{if(!p.current)return;let e=p.current.getBoundingClientRect(),a=e.top,t=e.right+12;t+320>window.innerWidth-10&&(t=Math.max(10,e.left-320-12)),a+180>window.innerHeight-10&&(a=Math.max(10,window.innerHeight-180-12)),u({top:a,left:t})})(),c(!0)},onMouseLeave:()=>{c(!1)},children:[n,f&&o&&m&&"u">typeof document&&(0,i.createPortal)((0,a.jsxs)("div",{style:{position:"fixed",top:`${m.top}px`,left:`${m.left}px`,zIndex:999999},className:"w-72 md:w-80 p-3.5 rounded-2xl shadow-2xl border pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95 bg-zinc-950/95 dark:bg-zinc-900/98 text-zinc-100 border-zinc-700/80 backdrop-blur-md ring-1 ring-white/10",children:[(0,a.jsxs)("div",{className:"flex items-start justify-between gap-2 pb-2 border-b border-zinc-800",children:[(0,a.jsxs)("div",{className:"flex items-center gap-1.5 min-w-0",children:[x?(0,a.jsx)("span",{className:"flex items-center justify-center w-5 h-5 rounded-lg bg-teal-900/80 text-teal-300 font-bold font-mono text-[10px] shrink-0 border border-teal-700/60",children:"#"}):(0,a.jsx)("span",{className:"flex items-center justify-center w-5 h-5 rounded-lg bg-amber-900/80 text-amber-300 font-bold font-mono text-[10px] shrink-0 border border-amber-700/60",children:"T"}),(0,a.jsx)("span",{className:"font-mono font-bold text-xs text-white truncate",children:e.code})]}),(0,a.jsx)(s.Badge,{variant:"outline",className:(0,r.cn)("text-[9px] font-mono px-1.5 py-0 shrink-0 font-bold",e.level?.toLowerCase().includes("level 2")||e.level?.toLowerCase().includes("guru")||e.level?.toLowerCase().includes("sekolah")?"bg-teal-950 text-teal-300 border-teal-700":"bg-emerald-950 text-emerald-300 border-emerald-700"),children:e.level?.includes("Level 2")?"Level 2 (Sekolah/Guru)":"Level 1 (Siswa)"})]}),(0,a.jsxs)("div",{className:"pt-2 space-y-1.5",children:[(0,a.jsx)("p",{className:"text-xs font-bold text-teal-300 leading-snug",children:e.label}),(0,a.jsx)("p",{className:"text-[11px] text-zinc-300 leading-relaxed font-normal",children:e.operationalDefinition||e.label||"Indikator Asesmen Nasional."})]}),e.domain&&(0,a.jsxs)("div",{className:"mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-between text-[9.5px] text-zinc-400",children:[(0,a.jsx)("span",{className:"truncate max-w-[170px]",title:e.domain,children:e.domain}),(0,a.jsx)("span",{className:"font-mono text-zinc-400 font-semibold shrink-0",children:e.dataType})]})]}),document.body)]})}])},77572,e=>{"use strict";var a=e.i(43476),t=e.i(71645),i=e.i(75157);let s=t.createContext(void 0);e.s(["Tabs",0,function({value:e,onValueChange:r,defaultValue:n,className:l,children:d}){let[o,c]=t.useState(n||"");return(0,a.jsx)(s.Provider,{value:{value:void 0!==e?e:o,onValueChange:r||c},children:(0,a.jsx)("div",{className:(0,i.cn)("w-full",l),children:d})})},"TabsContent",0,function({value:e,className:r,children:n}){let l=t.useContext(s);if(!l)throw Error("TabsContent must be used within Tabs");return l.value!==e?null:(0,a.jsx)("div",{className:(0,i.cn)("mt-4 focus-visible:outline-none",r),children:n})},"TabsList",0,function({className:e,children:t}){return(0,a.jsx)("div",{className:(0,i.cn)("inline-flex h-10 items-center justify-center rounded-lg bg-zinc-100 p-1 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",e),children:t})},"TabsTrigger",0,function({value:e,className:r,children:n}){let l=t.useContext(s);if(!l)throw Error("TabsTrigger must be used within Tabs");let d=l.value===e;return(0,a.jsx)("button",{type:"button",onClick:()=>l.onValueChange(e),className:(0,i.cn)("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer",d?"bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-zinc-50 font-semibold":"hover:text-zinc-900 dark:hover:text-zinc-100",r),children:n})}])},54204,e=>{"use strict";e.s(["RSyntaxGenerator",0,{getTTestCode(e,a,t,i=50,s,r="data_latihan_jasp_multilevel.csv"){let n=`# ==============================================================================
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
df <- read.csv("${r}", stringsAsFactors = TRUE)

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
ttest_paired <- t.test(df$${a}, df$${s}, paired = TRUE)
print(ttest_paired)

# 4. Ukuran Pengaruh Cohen's d (Berpasangan)
diff_scores <- df$${a} - df$${s}
d_paired <- mean(diff_scores, na.rm = TRUE) / sd(diff_scores, na.rm = TRUE)
cat(sprintf("Cohen's d (Paired): %.4f\\n", d_paired))
`:n+=`# 3. One-Sample t-Test terhadap Nilai Acuan Standar (mu = ${i})
ttest_one <- t.test(df$${a}, mu = ${i})
print(ttest_one)

# 4. Cohen's d (One-sample)
d_one <- (mean(df$${a}, na.rm = TRUE) - ${i}) / sd(df$${a}, na.rm = TRUE)
cat(sprintf("Cohen's d (One Sample): %.4f\\n", d_one))
`,n},getAnovaCode(e,a,t="data_latihan_jasp_multilevel.csv"){let i=a.length>=2?`${e} ~ ${a[0]} * ${a[1]}`:`${e} ~ ${a[0]}`;return`# ==============================================================================
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
fit_aov <- aov(${i}, data = df)
summary(fit_aov)

# 4. ANOVA Type III Sum of Squares (Standar JASP/SPSS untuk unbalanced design)
fit_lm <- lm(${i}, data = df)
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
`},getAncovaCode(e,a,t,i="data_latihan_jasp_multilevel.csv"){let s=t.join(" + ");return`# ==============================================================================
# Verifikasi ANCOVA (Analysis of Covariance) di R
# Generated by BBKA Analytics Studio (Standar Akademik APA 7th)
# ==============================================================================

# 1. Memuat Paket
if (!requireNamespace("car", quietly = TRUE)) install.packages("car")
if (!requireNamespace("emmeans", quietly = TRUE)) install.packages("emmeans")
library(car)
library(emmeans)

# 2. Membaca Dataset
df <- read.csv("${i}", stringsAsFactors = TRUE)

# 3. Uji Asumsi Homogenitas Gradien Regresi (Homogeneity of Slopes)
fit_homog <- lm(${e} ~ ${a} * (${s}), data = df)
summary(aov(fit_homog))

# 4. Model Utama ANCOVA (Main Effects Model)
fit_ancova <- lm(${e} ~ ${a} + ${s}, data = df)
summary(fit_ancova)

# Tabel ANCOVA Type III Sum of Squares
car::Anova(fit_ancova, type = "III")

# 5. Rata-Rata Terkoreksi (Estimated Marginal Means / Adjusted Means)
adj_means <- emmeans::emmeans(fit_ancova, ~ ${a})
print(adj_means)

# Uji Perbandingan Pasangan Rata-Rata Terkoreksi
pairs(adj_means)
`},getManovaCode(e,a,t="data_latihan_jasp_multilevel.csv"){let i=`cbind(${e.join(", ")})`,s=a.join(" * ");return`# ==============================================================================
# Verifikasi MANOVA (Multivariate Analysis of Variance) di R
# Generated by BBKA Analytics Studio (Standar Akademik APA 7th)
# ==============================================================================

# 1. Memuat Paket
if (!requireNamespace("heplots", quietly = TRUE)) install.packages("heplots")
library(heplots)

# 2. Membaca Dataset
df <- read.csv("${t}", stringsAsFactors = TRUE)

# 3. Model MANOVA
fit_manova <- manova(${i} ~ ${s}, data = df)

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
`},getMultilevelCode(e,a,t=[],i=[],s="data_latihan_jasp_multilevel.csv"){let r=[...t,...i],n=r.length>0?r.join(" + "):"1";return`# ==============================================================================
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
df <- read.csv("${s}", stringsAsFactors = TRUE)

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
`,getMergeDataCode(e,a,t,i,s="left",r=[],n){let l=(a||"").endsWith(".xlsx")||(a||"").endsWith(".xls"),d=t===i?`by = "${t}"`:`by = c("${t}" = "${i}")`,o="inner"===s?"inner_join":"left_join",c=r.filter(e=>e!==i),m=c.length>0?`c("${i}", ${c.map(e=>`"${e}"`).join(", ")})`:"everything()";return`# ==============================================================================
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

# 4. Agregasi Rata-Rata Data Guru per Satuan Pendidikan (${i})
# Jika 1 sekolah memiliki beberapa guru responden, nilai numerik diagregasikan ke rata-rata sekolah
df_guru_agg <- df_guru_raw %>%
  select(${m}) %>%
  group_by(${i}) %>%
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
`},getDataPrepCode(e,a=[],t="data_asesmen_nasional_clean.csv",i){let s=e.length>0?e.map(e=>`"${e}"`).join(", "):"",r="";if(Array.isArray(a)&&a.length>0){let e=a.map(e=>"=="===e.op?`${e.col} == "${e.val}"`:"!="===e.op?`${e.col} != "${e.val}"`:">"===e.op?`${e.col} > ${e.val}`:">="===e.op?`${e.col} >= ${e.val}`:"<"===e.op?`${e.col} < ${e.val}`:"<="===e.op?`${e.col} <= ${e.val}`:"contains"===e.op?`grepl("${e.val}", as.character(${e.col}), ignore.case = TRUE)`:"not_null"===e.op?`!is.na(${e.col})`:`${e.col} ${e.op} ${e.val}`).join(" &\n    ");r=`
  # Filter Observasi Baris
  filter(
    ${e}
  ) %>%`}let n="";if(i&&i.isMerged&&i.secondaryFileName){let e=i.secondaryFileName.endsWith(".xlsx")||i.secondaryFileName.endsWith(".xls"),a=i.primaryKey||"kd_sekolah",t=i.secondaryKey||"kd_sekolah",s=a===t?`by = "${a}"`:`by = c("${a}" = "${t}")`,r="inner"===i.joinType?"inner_join":"left_join";n=`
# ------------------------------------------------------------------------------
# 2b. Penggabungan Data Sekunder (Data Guru / Satuan Pendidikan Level 2)
# ------------------------------------------------------------------------------
${e?`df_guru_raw <- readxl::read_excel("${i.secondaryFileName}"${i.sheetName?`, sheet = "${i.sheetName}"`:""})`:`df_guru_raw <- read_csv("${i.secondaryFileName}")`}

df_guru_agg <- df_guru_raw %>%
  group_by(${t}) %>%
  summarise(across(where(is.numeric), ~ mean(.x, na.rm = TRUE)), .groups = "drop")

df <- df %>%
  ${r}(df_guru_agg, ${s})
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
df_clean <- df %>%${r}
  dplyr::select(${s||"everything()"})

# 5. Ringkasan Deskriptif Data Bersih
cat("=== Ringkasan Deskriptif Data Bersih ===\\n")
summary(df_clean)

# 6. Menyimpan Hasil Pembersihan Data
write_csv(df_clean, "data_clean_ready.csv")
cat("\\n✓ Data bersih berhasil disimpan ke 'data_clean_ready.csv'!\\n")
`},getRegressionCode(e,a,t="data_asesmen_nasional.csv"){let i=`# ==============================================================================
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

`,s=[],r=[];return a.forEach((a,t)=>{s=Array.from(new Set([...s,...a.variables]));let n=`model_${t+1}`;r.push(n),i+=`# Model ${t+1}: ${a.blockName||`Blok ${t+1}`}
${n} <- lm(${e} ~ ${s.join(" + ")}, data = df)
summary(${n})
summary(lm.beta(${n})) # Standardized Beta Coefficients
`,s.length>1?i+=`car::vif(${n}) # Multicollinearity Check (VIF)

`:i+=`
`}),r.length>1&&(i+=`# ==============================================================================
# 3. Uji Perbandingan Model Berjenjang (Hierarchical Model Comparison / F-Change)
# ==============================================================================
anova_comp <- anova(${r.join(", ")})
print(anova_comp)
`),i},getSEMCode:(e,a="data_asesmen_nasional.csv")=>`# ==============================================================================
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
`,getIPDMetaCode(e,a,t,i=[],s="data_asesmen_nasional.csv"){let r=i.length>0?` + ${i.join(" + ")}`:"",n=`${e} ~ ${a}${r}`;return`# ==============================================================================
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
df <- read.csv("${s}", stringsAsFactors = TRUE)

# 3. TAHAP 1: Estimasi Regresi OLS Terpisah per Klaster/Provinsi (${t})
cluster_results <- df %>%
  group_by(${t}) %>%
  filter(n() >= ${i.length+5}) %>%
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