const $=s=>document.querySelector(s);
const fmt=n=>"Rp "+Math.round(n).toLocaleString("id-ID");
const sh=n=>Math.abs(n)>=1e6?(n<0?"-":"")+"Rp "+(Math.abs(n)/1e6).toFixed(1).replace(".",",")+" jt":fmt(n);
const ymd=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const pd=s=>new Date(s+"T00:00:00");
const mon=s=>{const d=pd(s);d.setDate(d.getDate()-(d.getDay()+6)%7);return ymd(d)};
const addD=(s,n)=>{const d=pd(s);d.setDate(d.getDate()+n);return ymd(d)};
const today=()=>ymd(new Date());
const DAYS=["Sen","Sel","Rab","Kam","Jum","Sab","Min"],MN=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const CI=["Penjualan","Pelunasan piutang","Modal","Lain-lain"],CO=["Operasional","Gaji","Bahan baku","Sewa","Lain-lain"],MET=["Tunai","Bank","E-wallet"];
const MIN=1e6,MAX=1.2e6;
let tx=[],DBX=null;try{tx=JSON.parse(localStorage.getItem("kas")||"[]")}catch(e){}
const save=()=>{try{localStorage.setItem("kas",JSON.stringify(tx))}catch(e){}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const opt=a=>a.map(x=>`<option>${x}</option>`).join("");
const sum=a=>a.reduce((s,x)=>s+x.amt,0);
const inCat=c=>tx.filter(x=>x.type=="out"&&x.cat==c);
const sumR=(a,f,t)=>sum(a.filter(x=>x.date>=f&&x.date<=t));
const wk=(a,m)=>sumR(a,m,addD(m,6));
const inM=(a,m)=>a.filter(x=>x.date.startsWith(m));
const st=v=>v==0?["Belum ada",""]:v<MIN?["Di bawah jatah",""]:v<=MAX?["Dalam jatah",""]:["Melebihi jatah","neg"];
const L6=()=>{const d=new Date(),a=[];for(let i=5;i>=0;i--){const t=new Date(d.getFullYear(),d.getMonth()-i,1);a.push([ymd(t).slice(0,7),MN[t.getMonth()]])}return a};
const wl=k=>{const a=pd(k),b=pd(addD(k,6));return a.getDate()+" "+MN[a.getMonth()]+"–"+b.getDate()+" "+MN[b.getMonth()]};
const ml=m=>pd(m+"-01").toLocaleDateString("id-ID",{month:"long",year:"numeric"});
const dl=s=>pd(s).toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
const dm=d=>pd(d).getDate()+"/"+(pd(d).getMonth()+1);

const hb=(a,mx,fn=v=>v+"%")=>a.length?a.map(([n,v])=>`<div class="r1"><span>${n}</span><span class="t"><i style="width:${mx?v/mx*100:0}%"></i></span><span>${fn(v)}</span></div>`).join(""):`<div class="e">Belum ada data</div>`;
const vb=(cols,ln=[])=>{const mx=Math.max(1,...cols.flatMap(c=>c.slice(1)),...ln.map(l=>l[0]*1.05));return `<div class="v">${ln.map(l=>`<p style="bottom:${l[0]/mx*100}%"><em>${l[1]}</em></p>`).join("")}${cols.map(c=>`<div>${c.slice(1).map((v,i)=>`<i class="${i?"s2":""}" style="height:${v/mx*100}%"></i>`).join("")}</div>`).join("")}</div><div class="vl">${cols.map(c=>`<span>${c[0]}</span>`).join("")}</div>`};
const LG=(a,b)=>`<div class="lg"><span><s></s>${a}</span><span><s class="d2"></s>${b}</span></div>`;
const P=(t,k,b)=>`<section><h2>${t}</h2><div class="k">${k.map(([l,v,c])=>`<div>${l}<b class="${c||""}">${v}</b></div>`).join("")}</div>${b}</section>`;
const rows=(a,n=5)=>a.length?`<table class="tb">${a.slice(0,n).map(x=>`<tr><td>${esc(x.desc)}<small>${x.date.slice(5)}</small></td><td>${fmt(x.amt)}</td></tr>`).join("")}</table>`:`<div class="e">Belum ada catatan</div>`;
const byDate=a=>a.slice().sort((x,y)=>y.date.localeCompare(x.date)||y.id-x.id);

function summary(){
 const M=today().slice(0,7),OUT=tx.filter(x=>x.type=="out"),INN=tx.filter(x=>x.type=="in"),O=inM(OUT,M),ti=sum(inM(INN,M)),to=sum(O);
 const cm={};O.forEach(x=>cm[x.cat]=(cm[x.cat]||0)+x.amt);const ce=Object.entries(cm).sort((a,b)=>b[1]-a[1]);
 const bal=sum(INN)-sum(OUT),pc=ce.map(([n,v])=>[n,to?Math.round(v/to*100):0]);
 const met=MET.map(m=>[m,sum(INN.filter(x=>x.met==m))-sum(OUT.filter(x=>x.met==m))]),mx=Math.max(1,...met.map(x=>Math.abs(x[1])));
 const pp=n=>to?Math.round((cm[n]||0)/to*100)+"%":"-";
 return P("Tekanan Pengeluaran per Kategori",[["Transaksi Keluar",O.length],["Kategori Terboros",ce[0]?ce[0][0]:"-"],["Rasio Keluar/Masuk",ti?(to/ti*100).toFixed(1).replace(".",",")+"%":"-"]],hb(pc,Math.max(1,...pc.map(x=>x[1]))))
 +P("Kas Masuk vs Kas Keluar",[["Saldo Kas",sh(bal),bal<0?"neg":""],["Masuk Bulan Ini",sh(ti)],["Keluar Bulan Ini",sh(to)]],vb(L6().map(([m,l])=>[l,sum(inM(INN,m)),sum(inM(OUT,m))]))+LG("Masuk","Keluar"))
 +P("Struktur Biaya Bulan Ini",[["Total Keluar",sh(to)],["Porsi Uang Makan",pp("Uang makan")],["Porsi Operasional",pp("Operasional")]],hb(ce,ce[0]?ce[0][1]:1,sh))
 +P("Saldo per Metode Bayar",[["Terendah",met.slice().sort((a,b)=>a[1]-b[1])[0][0]],["Margin Kas",ti?((ti-to)/ti*100).toFixed(1).replace(".",",")+"%":"-"],["Total Transaksi",tx.length]],hb(met.map(([n,v])=>[n,Math.abs(v)]),mx,sh))}

function meal(){
 const t=today(),m=mon(t),UM=inCat("Uang makan"),u=wk(UM,m),s=st(u),mx=Math.max(1.3e6,u*1.05);
 const wl7=byDate(UM.filter(x=>x.date>=m&&x.date<=addD(m,6)));
 const w6=[5,4,3,2,1,0].map(i=>{const k=addD(m,-7*i);return[dm(k),wk(UM,k)]});
 return P("Jatah Uang Makan Minggu Ini",[["Terpakai",sh(u)],["Sisa dari 1,2 jt",sh(MAX-u),MAX-u<0?"neg":""],["Status",s[0],s[1]]],
  `<div class="pg"><i style="width:${Math.min(u/mx*100,100)}%"></i><u style="left:${MIN/mx*100}%"></u><u style="left:${MAX/mx*100}%"></u></div><div class="pgl"><em style="left:${MIN/mx*100}%">1 jt</em><em style="left:${MAX/mx*100}%">1,2 jt</em></div><div class="pgt">Senin–Minggu: ${wl(m)}. Jatah Rp 1.000.000 sampai Rp 1.200.000 per minggu.</div>`)
 +P("Uang Makan per Hari",[["Total Minggu",sh(u)],["Rata-rata per Hari",sh(u/7)],["Hari Ini",sh(sumR(UM,t,t))]],vb(DAYS.map((d,i)=>[d,sumR(UM,addD(m,i),addD(m,i))])))
 +P("Riwayat Mingguan (6 Minggu)",[["Minggu Lalu",sh(wk(UM,addD(m,-7)))],["Rata-rata",sh(w6.reduce((a,b)=>a+b[1],0)/6)],["Jatah","1–1,2 jt"]],vb(w6,[[MIN,"1 jt"],[MAX,"1,2 jt"]]))
 +P("Rincian Minggu Ini",[["Jumlah Catatan",wl7.length],["Tertinggi",sh(Math.max(0,...wl7.map(x=>x.amt)))],["Terakhir",wl7[0]?dm(wl7[0].date):"-"]],rows(wl7))}

function ops(){
 const t=today(),m=mon(t),M=t.slice(0,7),OP=inCat("Operasional"),UM=inCat("Uang makan"),l6=L6(),a=sum(inM(OP,M)),b=sum(inM(OP,l6[4][0]));
 const l7=[0,1,2,3,4,5,6].map(i=>addD(t,i-6)),us=sumR(UM,l7[0],t),os=sumR(OP,l7[0],t);
 return P("Operasional Minggu Ini per Hari",[["Minggu Ini",sh(wk(OP,m))],["Hari Ini",sh(sumR(OP,t,t))],["Bulan Ini",sh(a)]],vb(DAYS.map((d,i)=>[d,sumR(OP,addD(m,i),addD(m,i))])))
 +P("Operasional per Bulan",[["Bulan Ini",sh(a)],["Bulan Lalu",sh(b)],["Selisih",sh(a-b),a>b?"neg":""]],vb(l6.map(([k,l])=>[l,sum(inM(OP,k))])))
 +P("Harian: Uang Makan vs Operasional",[["Uang Makan 7 Hari",sh(us)],["Operasional 7 Hari",sh(os)],["Total",sh(us+os)]],vb(l7.map(d=>[dm(d),sumR(UM,d,d),sumR(OP,d,d)]))+LG("Uang makan","Operasional"))
 +P("Operasional Terbaru",[["Jumlah Catatan",OP.length],["Terbesar",sh(Math.max(0,...OP.map(x=>x.amt)))],["Terakhir",OP.length?dm(byDate(OP)[0].date):"-"]],rows(byDate(OP)))}

let tab="Ringkasan";const V={"Ringkasan":summary,"Uang Makan":meal,"Operasional":ops},TB=["Ringkasan","Uang Makan","Operasional","Laporan"];
function go(k){if(k=="Laporan")openS("Laporan");else{tab=k;render()}}
function render(){
 $("#sd").innerHTML=TB.map(k=>`<button class="${k==tab?"on":""}" onclick="go('${k}')">${k}</button>`).join("");
 $("#ct").innerHTML=V[tab]();
 $("#ts").textContent=new Date().toLocaleString("id-ID",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}

/* Catat & laporan */
let sk="Uang Makan";
function openS(k){sk=k;$("#sh").style.display="flex";drawS()}
function closeS(){$("#sh").style.display="none"}
function drawS(){
 let b=`<div class="hh">Catat &amp; Laporan<button class="x" onclick="closeS()" aria-label="Tutup">×</button></div><div class="stb">${["Uang Makan","Pengeluaran","Pemasukan","Laporan"].map(k=>`<button class="${k==sk?"on":""}" onclick="sk='${k}';drawS()">${k}</button>`).join("")}</div>`;
 b+=sk=="Laporan"?rep():form()+hist();
 $("#sb").innerHTML=b;if(sk=="Uang Makan")mealCalc()}
function form(){if(sk=="Uang Makan")return mealForm();const um=false;
 return `<div class="f"><label>Tanggal<input type="date" id="d" value="${today()}" ${um?'onchange="inf()"':""}></label><label>Jumlah (Rp)<input type="number" id="a" inputmode="numeric" placeholder="0"></label><label class="full">Keterangan<input id="n" placeholder="${um?"Contoh: Makan siang tim gudang":"Keterangan"}"></label>${um?"":`<label>Kategori<select id="c">${opt(sk=="Pemasukan"?CI:CO)}</select></label>`}<label ${um?'class="full"':""}>Metode<select id="t">${opt(MET)}</select></label>${um?'<div class="inf" id="inf"></div>':""}<button class="btn" onclick="add()">Simpan</button></div>`}
function inf(){const m=mon($("#d").value||today()),u=wk(inCat("Uang makan"),m);$("#inf").innerHTML=`Minggu ${wl(m)}: terpakai <b>${fmt(u)}</b>, sisa dari 1,2 jt <b class="${MAX-u<0?"neg":""}">${fmt(MAX-u)}</b> (${st(u)[0]})`}
let mw=null;
const DAYN=["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"];
function mealForm(){
 if(!mw)mw=mon(today());
 const UM=inCat("Uang makan");
 return `<div class="f"><label>Minggu (pilih tanggal mana saja)<input type="date" id="mwd" value="${mw}" onchange="mw=mon(this.value||today());drawS()"></label><label>Metode<select id="t">${opt(MET)}</select></label>
<div class="dg full">${DAYN.map((n,i)=>{const d=addD(mw,i),v=sumR(UM,d,d);return `<label><span>${n} <small>${dm(d)}</small></span><input type="number" inputmode="numeric" min="0" placeholder="0" class="md" data-d="${d}" data-v="${v}" value="${v||""}" oninput="mealCalc()"></label>`}).join("")}</div>
<div class="inf" id="inf"></div><button class="btn" onclick="saveMeal()">Simpan uang makan minggu ini</button></div>`}
function mealCalc(){
 const u=[...document.querySelectorAll(".md")].reduce((s,e)=>s+(+e.value||0),0),s=st(u);
 $("#inf").innerHTML=`Minggu ${wl(mw)}: total <b>${fmt(u)}</b>, sisa dari 1,2 jt <b class="${MAX-u<0?"neg":""}">${fmt(MAX-u)}</b> (${s[0]})`}
function saveMeal(){
 const m=$("#t").value;let ch=0;
 document.querySelectorAll(".md").forEach((e,i)=>{
  const d=e.dataset.d,nv=+e.value||0,ov=+e.dataset.v||0;if(nv===ov)return;
  tx.filter(x=>x.type=="out"&&x.cat=="Uang makan"&&x.date==d).forEach(x=>{});
  tx=tx.filter(x=>!(x.type=="out"&&x.cat=="Uang makan"&&x.date==d));
  if(nv>0){const o={id:Date.now()+i,type:"out",date:d,desc:"Uang makan "+DAYN[i],amt:nv,cat:"Uang makan",met:m};tx.push(o);}
  ch++});
 if(!ch){alert("Belum ada perubahan.");return}
 save();drawS();render()}
function add(){
 const a=+$("#a").value,n=$("#n").value.trim();if(!(a>0)||!n){alert("Isi keterangan dan jumlah lebih dari 0.");return}
 const um=sk=="Uang Makan";
 tx.push({id:Date.now(),type:sk=="Pemasukan"?"in":"out",date:$("#d").value||today(),desc:n,amt:a,cat:um?"Uang makan":$("#c").value,met:$("#t").value});
 save();drawS();render()}
function hist(){
 const f=sk=="Uang Makan"?x=>x.cat=="Uang makan":sk=="Pemasukan"?x=>x.type=="in":x=>x.type=="out"&&x.cat!="Uang makan";
 const a=byDate(tx.filter(f)).slice(0,20);
 return `<h4>Riwayat terbaru</h4>`+(a.length?`<table class="tb2">${a.map(x=>`<tr><td>${esc(x.desc)}<small>${x.date} · ${x.cat} · ${x.met}</small></td><td class="${x.type=="out"?"neg":""}">${x.type=="out"?"-":""}${fmt(x.amt)}</td><td><button class="x" onclick="del(${x.id})" aria-label="Hapus">×</button></td></tr>`).join("")}</table>`:`<div class="e">Belum ada catatan.</div>`)}
function del(id){if(confirm("Hapus catatan ini?")){tx=tx.filter(x=>x.id!=id);save();drawS();render()}}

function rep(){let w="";try{w=localStorage.getItem("kaswa")||""}catch(e){}
 return `<div class="f"><label class="full">Nomor WhatsApp tujuan (boleh kosong)<input id="wn" inputmode="tel" placeholder="08xxxxxxxxxx" value="${esc(w)}"></label>
<label class="full">Rekap harian (uang makan dan operasional)<input type="date" id="dd" value="${today()}"></label>
<button class="btn" onclick="sendWA(daily($('#dd').value))">Kirim WA rekap harian</button>
<label class="full">Rekap bulanan<input type="month" id="mm" value="${today().slice(0,7)}"></label>
<button class="btn" onclick="sendWA(monthly($('#mm').value))">Kirim WA rekap bulanan</button>
<button class="btn alt" onclick="pdf()">Cetak PDF rekap bulanan</button>
<input type="file" id="imp" accept=".json,application/json" hidden onchange="importData(this)">
<button class="btn alt" onclick="exportData()">Ekspor cadangan data (JSON)</button>
<button class="btn alt" onclick="$('#imp').click()">Impor cadangan data</button></div>
<p class="hint">Tanpa nomor, WhatsApp meminta Anda memilih kontak. Untuk PDF, pilih "Simpan sebagai PDF" di layar cetak.</p>`}
function exportData(){
 const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(tx,null,1)],{type:"application/json"}));
 a.download="cadangan-kas-"+today()+".json";document.body.appendChild(a);a.click();a.remove()}
function importData(inp){
 const f=inp.files[0];if(!f)return;const r=new FileReader();
 r.onload=()=>{try{const a=JSON.parse(r.result);if(!Array.isArray(a))throw 0;
  const ids=new Set(tx.map(x=>x.id));let n=0;
  a.forEach(x=>{if(x&&x.id&&x.date&&x.amt>0&&(x.type=="in"||x.type=="out")&&!ids.has(x.id)){tx.push(x);ids.add(x.id);n++}});
  save();render();drawS();alert(n+" catatan baru ditambahkan.")}catch(e){alert("File cadangan tidak valid.")}};
 r.readAsText(f);inp.value=""}
function sendWA(txt){let n=($("#wn").value||"").replace(/\D/g,"");if(n.startsWith("0"))n="62"+n.slice(1);
 try{localStorage.setItem("kaswa",$("#wn").value)}catch(e){}
 window.open("https://wa.me/"+n+"?text="+encodeURIComponent(txt),"_blank")}
function daily(d){
 const g=c=>tx.filter(x=>x.type=="out"&&x.cat==c&&x.date==d),u=g("Uang makan"),o=g("Operasional"),m=mon(d),w=wk(inCat("Uang makan"),m);
 const blk=(t,a)=>`*${t}*: ${fmt(sum(a))}\n`+(a.map(x=>`• ${x.desc}: ${fmt(x.amt)}`).join("\n")||"• tidak ada")+"\n";
 return `*REKAP HARIAN KAS*\n${dl(d)}\n\n${blk("Uang makan",u)}\n${blk("Operasional",o)}\n*Total pengeluaran*: ${fmt(sum(u)+sum(o))}\n\nUang makan minggu ini (${wl(m)}): ${fmt(w)}, sisa dari 1,2 jt: ${fmt(MAX-w)} (${st(w)[0]})`}
function stats(m){
 const a=inM(tx,m),O=a.filter(x=>x.type=="out"),cm={},ws={};
 O.forEach(x=>cm[x.cat]=(cm[x.cat]||0)+x.amt);inM(inCat("Uang makan"),m).forEach(x=>{const k=mon(x.date);ws[k]=(ws[k]||0)+x.amt});
 return{a,ti:sum(a.filter(x=>x.type=="in")),to:sum(O),cm:Object.entries(cm).sort((x,y)=>y[1]-x[1]),ws:Object.entries(ws).sort()}}
function monthly(m){const s=stats(m);
 return `*REKAP BULANAN KAS*\n${ml(m)}\n\nPemasukan: ${fmt(s.ti)}\nPengeluaran: ${fmt(s.to)}\nSaldo bulan ini: ${fmt(s.ti-s.to)}\n\n*Pengeluaran per kategori*\n${s.cm.map(([n,v])=>`• ${n}: ${fmt(v)}`).join("\n")||"• tidak ada"}\n\n*Uang makan per minggu*\n${s.ws.map(([k,v])=>`• ${wl(k)}: ${fmt(v)} (${st(v)[0]})`).join("\n")||"• tidak ada"}`}
function pdf(){
 const m=$("#mm").value,s=stats(m),T=(h,r)=>`<h3>${h}</h3><table>${r||"<tr><td>Tidak ada data</td><td></td></tr>"}</table>`,R=(a,b)=>`<tr><td>${a}</td><td>${b}</td></tr>`;
 $("#pr").innerHTML=`<h1>Rekap Bulanan Kas</h1><p>${ml(m)}</p>`+T("Ringkasan",R("Pemasukan",fmt(s.ti))+R("Pengeluaran",fmt(s.to))+R("Saldo bulan ini",fmt(s.ti-s.to)))
 +T("Pengeluaran per kategori",s.cm.map(([n,v])=>R(n,fmt(v))).join(""))+T("Uang makan per minggu (jatah Rp 1.000.000–1.200.000)",s.ws.map(([k,v])=>R(wl(k),fmt(v)+" ("+st(v)[0]+")")).join(""))
 +T("Semua transaksi",s.a.slice().sort((x,y)=>x.date.localeCompare(y.date)).map(x=>R(x.date+" · "+esc(x.desc)+" ("+x.cat+")",(x.type=="out"?"-":"")+fmt(x.amt))).join(""));
 window.print()}
addEventListener("storage",e=>{if(e.key=="kas"){try{tx=JSON.parse(e.newValue||"[]")}catch(_){}render()}});
render();
