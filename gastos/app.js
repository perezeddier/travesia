/* ==========================================================================
   Travesía · Control  —  gestor de viajes, gastos, vehículos y choferes
   Etapa 1: guarda todo en el propio aparato (localStorage).
   El código está armado para que la Etapa 2 (nube/sincronización) sea fácil:
   todo pasa por el objeto DB, así que luego cambiamos solo esa capa.
   ========================================================================== */
'use strict';

/* ---------------- Utilidades ---------------- */
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const todayISO = () => new Date().toISOString().slice(0, 10);
const monthOf = (iso) => (iso || '').slice(0, 7);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DIAS  = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];

function fmtMonth(ym){ const [y,m]=ym.split('-'); return `${MESES[+m-1]} ${y}`; }
function fmtDate(iso){
  if(!iso) return '';
  const d = new Date(iso+'T00:00:00');
  return `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()].slice(0,3)}`;
}

/* ---------------- Categorías de gasto ---------------- */
const CATS = [
  {id:'combustible', nom:'Combustible', em:'⛽'},
  {id:'mantenimiento', nom:'Mantenimiento', em:'🔧'},
  {id:'peaje', nom:'Peajes', em:'🛣️'},
  {id:'lavado', nom:'Lavado', em:'🧼'},
  {id:'comida', nom:'Comida', em:'🍽️'},
  {id:'seguro', nom:'Seguro / Marchamo', em:'📄'},
  {id:'salario', nom:'Pago a chofer', em:'👤'},
  {id:'repuesto', nom:'Repuestos / Llantas', em:'🛞'},
  {id:'otro', nom:'Otro', em:'📦'},
];
const catOf = (id) => CATS.find(c=>c.id===id) || CATS[CATS.length-1];

/* ---------------- Capa de datos (DB) ---------------- */
const DB = {
  KEY: 'travesia_control_v1',
  data: null,
  load(){
    try{ this.data = JSON.parse(localStorage.getItem(this.KEY)); }catch(e){ this.data = null; }
    if(!this.data) this.data = this._seed();
    // asegurar campos
    this.data.settings = Object.assign({moneda:'$', tc:510, pin:'', totalMoneda:'$'}, this.data.settings||{});
    ['vehiculos','choferes','proveedores','viajes','gastos','comisiones'].forEach(k=> this.data[k] = this.data[k]||[]);
    this._migrateFleet();
    return this.data;
  },
  save(){ localStorage.setItem(this.KEY, JSON.stringify(this.data)); },
  _seed(){
    return {
      settings:{moneda:'$', tc:510, pin:'', totalMoneda:'$', fleetV2:true},
      vehiculos: this._fleet(),
      choferes:[ {id:uid(), nombre:'Eddie', telefono:'85028476', notas:'Dueño'} ],
      proveedores:[],
      viajes:[], gastos:[], comisiones:[],
    };
  },
  // Flota real de Eddie
  _fleet(){
    return [
      {id:uid(), nombre:'Staria',       placa:'AB8168', capacidad:5,  notas:''},
      {id:uid(), nombre:'Techo bajo',   placa:'AB8791', capacidad:'', notas:''},
      {id:uid(), nombre:'Techo alto 1', placa:'AB8993', capacidad:'', notas:''},
      {id:uid(), nombre:'Techo alto 2', placa:'',       capacidad:'', notas:'Nueva'},
    ];
  },
  // Si la app trae los vehículos viejos de ejemplo (sin usar), los cambia por la flota real
  _migrateFleet(){
    const s = this.data.settings;
    if(s.fleetV2) return;
    const v = this.data.vehiculos;
    const fresh = !this.data.viajes.length && !this.data.gastos.length
               && !this.data.comisiones.length && !this.data.proveedores.length;
    const oldDefault = v.length===3 && v.every(x=>!x.placa)
               && ['Staria','Hiace','Maxus'].every(n=> v.some(x=>x.nombre===n));
    if(fresh && oldDefault) this.data.vehiculos = this._fleet();
    s.fleetV2 = true;
    this.save();
  },
  // colecciones
  all(col){ return this.data[col] || []; },
  get(col,id){ return this.all(col).find(x=>x.id===id); },
  upsert(col,obj){
    if(!obj.id){ obj.id = uid(); this.data[col].push(obj); }
    else{ const i=this.data[col].findIndex(x=>x.id===obj.id); i<0? this.data[col].push(obj) : this.data[col][i]=obj; }
    this.save(); return obj;
  },
  remove(col,id){ this.data[col] = this.all(col).filter(x=>x.id!==id); this.save(); },
};

/* ---------------- Conversión de moneda ---------------- */
// Guardamos cada monto con su moneda ('$' o '₡'). Para los totales convertimos
// todo a la "moneda para totales" usando el tipo de cambio (₡ por $).
function toBase(monto, moneda){
  const tc = +DB.data.settings.tc || 510;
  const base = DB.data.settings.totalMoneda;
  monto = +monto || 0;
  if(moneda === base) return monto;
  if(base === '$' && moneda === '₡') return monto / tc;   // colones -> dólares
  if(base === '₡' && moneda === '$') return monto * tc;   // dólares -> colones
  return monto;
}
function fmtMoney(n, moneda){
  moneda = moneda || DB.data.settings.totalMoneda;
  n = +n || 0;
  const dec = moneda === '₡' ? 0 : 2;
  const s = Math.abs(n).toLocaleString('es-CR', {minimumFractionDigits:dec, maximumFractionDigits:dec});
  return (n<0?'-':'') + moneda + s;
}

/* ---------------- Estado ---------------- */
const State = {
  tab: 'inicio',
  month: todayISO().slice(0,7),
  masView: 'vehiculos',
};

/* ---------------- Arranque ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  DB.load();
  initGate();
});

/* ==========================================================================
   PIN GATE
   ========================================================================== */
let pinBuffer = '';
let pinMode = 'check'; // 'check' | 'set'
function initGate(){
  const hasPin = !!DB.data.settings.pin;
  if(!hasPin){ openApp(); return; }
  const gate = $('#gate'); gate.classList.add('show');
  $('#keypad').onclick = (e)=>{
    const b = e.target.closest('button'); if(!b || !b.dataset.k) return;
    const k = b.dataset.k;
    if(k==='del'){ pinBuffer = pinBuffer.slice(0,-1); }
    else if(pinBuffer.length<4){ pinBuffer += k; }
    renderPinDots();
    if(pinBuffer.length===4) setTimeout(checkPin, 120);
  };
  renderPinDots();
}
function renderPinDots(err){
  const dots = $('#pinDots'); dots.classList.toggle('err', !!err);
  $$('#pinDots span').forEach((s,i)=> s.classList.toggle('on', i<pinBuffer.length && !err));
}
function checkPin(){
  if(pinBuffer === DB.data.settings.pin){
    $('#gate').classList.remove('show'); pinBuffer=''; openApp();
  }else{
    renderPinDots(true); navigator.vibrate?.(120);
    setTimeout(()=>{ pinBuffer=''; renderPinDots(); }, 500);
  }
}
function openApp(){
  $('#app').classList.remove('hidden');
  wireChrome();
  updateMonthLabel();
  render();
}

/* ==========================================================================
   NAVEGACIÓN / CHROME
   ========================================================================== */
function wireChrome(){
  $('#tabbar').onclick = (e)=>{
    const b = e.target.closest('button'); if(!b) return;
    goTab(b.dataset.tab);
  };
  $('#gearBtn').onclick = ()=> goTab('ajustes');
  $('#fab').onclick = ()=> onFab();
  $('#monthPill').onclick = ()=> openMonthPicker();
  $('#sheetBack').onclick = (e)=>{ if(e.target.id==='sheetBack') closeSheet(); };
}
function goTab(tab){
  State.tab = tab;
  $$('#tabbar button').forEach(b=> b.classList.toggle('active', b.dataset.tab===tab));
  $('#gearBtn').classList.toggle('active', tab==='ajustes');
  $$('.screen').forEach(s=> s.classList.remove('active'));
  $('#scr-'+tab).classList.add('active');
  // el FAB no aplica en ajustes
  $('#fab').style.display = (tab==='ajustes') ? 'none' : 'grid';
  render();
  window.scrollTo(0,0);
}
function onFab(){
  if(State.tab==='gastos') openGastoForm();
  else if(State.tab==='comisiones') openComisionForm();
  else if(State.tab==='mas'){
    if(State.masView==='choferes') openChoferForm();
    else if(State.masView==='proveedores') openProveedorForm();
    else openVehiculoForm();
  }
  else openViajeForm(); // inicio y viajes -> nuevo viaje
}
function updateMonthLabel(){ $('#monthLabel').textContent = fmtMonth(State.month); }

/* ==========================================================================
   RENDER PRINCIPAL
   ========================================================================== */
function render(){
  updateMonthLabel();
  if(State.tab==='inicio') renderInicio();
  else if(State.tab==='viajes') renderViajes();
  else if(State.tab==='gastos') renderGastos();
  else if(State.tab==='comisiones') renderComisiones();
  else if(State.tab==='mas') renderMas();
  else if(State.tab==='ajustes') renderAjustes();
}

const inMonth = (arr) => arr.filter(x => monthOf(x.fecha) === State.month);
// El vehículo se identifica por su PLACA (si no tiene, usa el nombre)
const nombreVehiculo = (id)=>{ const v=DB.get('vehiculos',id); return v ? (v.placa || v.nombre) : '—'; };
const nombreChofer   = (id)=> DB.get('choferes',id)?.nombre || '—';
const nombreProveedor= (id)=> DB.get('proveedores',id)?.nombre || '—';

/* ---------------- INICIO (dashboard) ---------------- */
function renderInicio(){
  const viajes = inMonth(DB.all('viajes'));
  const gastos = inMonth(DB.all('gastos'));
  const comis  = inMonth(DB.all('comisiones'));
  const ingViajes = viajes.reduce((s,v)=> s + toBase(v.precio, v.moneda), 0);
  const ingComis  = comis.reduce((s,c)=> s + toBase(c.monto, c.moneda), 0);
  const gasto   = gastos.reduce((s,g)=> s + toBase(g.monto, g.moneda), 0);
  const ganancia = ingViajes + ingComis - gasto;
  const pend = viajes.filter(v=>v.estado==='pendiente').reduce((s,v)=> s + toBase(v.precio, v.moneda), 0)
             + comis.filter(c=>c.estado==='pendiente').reduce((s,c)=> s + toBase(c.monto, c.moneda), 0);

  // por vehículo
  const porVeh = DB.all('vehiculos').map(v=>{
    const ing = viajes.filter(t=>t.vehiculoId===v.id).reduce((s,t)=>s+toBase(t.precio,t.moneda),0);
    const gas = gastos.filter(g=>g.vehiculoId===v.id).reduce((s,g)=>s+toBase(g.monto,g.moneda),0);
    return {v, ing, gas, net:ing-gas, n:viajes.filter(t=>t.vehiculoId===v.id).length};
  }).filter(x=> x.ing||x.gas).sort((a,b)=>b.net-a.net);

  // gastos por categoría
  const porCat = {};
  gastos.forEach(g=>{ porCat[g.categoria]=(porCat[g.categoria]||0)+toBase(g.monto,g.moneda); });
  const cats = Object.entries(porCat).sort((a,b)=>b[1]-a[1]);
  const maxCat = cats.length ? cats[0][1] : 1;

  let h = `
  <div class="screen-head"><h2>Resumen</h2>
    <span class="count">${viajes.length} viaje${viajes.length!==1?'s':''} · ${comis.length} comis. · ${gastos.length} gasto${gastos.length!==1?'s':''}</span></div>
  <div class="kpi-grid">
    <div class="kpi income"><span class="bar"></span><div class="label">🚌 Viajes</div><div class="value small pos">${fmtMoney(ingViajes)}</div></div>
    <div class="kpi commission"><span class="bar"></span><div class="label">🤝 Comisiones</div><div class="value small pos">${fmtMoney(ingComis)}</div></div>
    <div class="kpi expense"><span class="bar"></span><div class="label">💸 Gastos</div><div class="value small neg">${fmtMoney(gasto)}</div></div>
    <div class="kpi profit ${ganancia>=0?'pos':'neg'}"><span class="bar"></span><div class="label">📈 Ganancia</div><div class="value small">${fmtMoney(ganancia)}</div></div>
    ${pend>0?`<div class="kpi wide" style="padding:12px 15px"><div class="label" style="margin:0;color:var(--gold-2)">⏳ Por cobrar: ${fmtMoney(pend)}</div></div>`:''}
  </div>`;

  if(porVeh.length){
    h += `<div class="section-label">Por unidad (vehículo)</div><div class="bd">`;
    porVeh.forEach(x=>{
      const sub = esc(x.v.placa && x.v.nombre ? x.v.nombre : '');
      h += `<div class="bd-row" onclick="openUnidad('${x.v.id}')" style="cursor:pointer">
        <div class="ic">🚐</div>
        <div class="nm"><div class="t">${esc(x.v.placa||x.v.nombre)}${sub?` <span style="color:var(--muted-2);font-weight:400;font-size:.78rem">${sub}</span>`:''}</div>
          <div class="s"><span style="color:var(--green)">▲ ${fmtMoney(x.ing)}</span> &nbsp;<span style="color:var(--red)">▼ ${fmtMoney(x.gas)}</span> &nbsp;· ${x.n} viaje${x.n!==1?'s':''}</div></div>
        <div class="amt ${x.net>=0?'pos':'neg'}">${fmtMoney(x.net)} ›</div>
      </div>`;
    });
    h += `</div>`;
  }

  if(cats.length){
    h += `<div class="section-label">Gastos por categoría</div><div class="bd">`;
    cats.forEach(([id,val])=>{
      const c = catOf(id);
      h += `<div class="bd-row">
        <div class="ic">${c.em}</div>
        <div class="nm"><div class="t">${esc(c.nom)}</div>
          <div class="mini-bar"><span style="width:${Math.max(6,val/maxCat*100)}%"></span></div></div>
        <div class="amt neg">${fmtMoney(val)}</div>
      </div>`;
    });
    h += `</div>`;
  }

  if(!viajes.length && !gastos.length && !comis.length){
    h += `<div class="empty"><div class="em">📊</div>
      <p>Aún no hay movimientos en <b>${fmtMonth(State.month)}</b>.<br>Tocá el botón <b>＋</b> para agregar tu primer viaje o gasto.</p>
      <button class="btn primary" onclick="openViajeForm()">＋ Nuevo viaje</button></div>`;
  }
  $('#scr-inicio').innerHTML = h;
}

/* ---------------- Detalle por unidad (vehículo) ---------------- */
function openUnidad(id){
  const v = DB.get('vehiculos', id); if(!v) return;
  const viajes = inMonth(DB.all('viajes')).filter(t=>t.vehiculoId===id).sort((a,b)=>b.fecha.localeCompare(a.fecha));
  const gastos = inMonth(DB.all('gastos')).filter(g=>g.vehiculoId===id).sort((a,b)=>b.fecha.localeCompare(a.fecha));
  const ing = viajes.reduce((s,t)=>s+toBase(t.precio,t.moneda),0);
  const gas = gastos.reduce((s,g)=>s+toBase(g.monto,g.moneda),0);
  const sub = v.placa && v.nombre ? `<span style="font-weight:400;color:var(--muted);font-size:.82rem">${esc(v.nombre)}</span>` : '';
  let h = `<h3>🚐 ${esc(v.placa||v.nombre)} ${sub}</h3>
    <div style="color:var(--muted);font-size:.82rem;margin:-8px 0 14px">${fmtMonth(State.month)}</div>
    <div class="kpi-grid">
      <div class="kpi income"><span class="bar"></span><div class="label">Ingresos</div><div class="value small pos">${fmtMoney(ing)}</div></div>
      <div class="kpi expense"><span class="bar"></span><div class="label">Gastos</div><div class="value small neg">${fmtMoney(gas)}</div></div>
      <div class="kpi profit wide ${ing-gas>=0?'pos':'neg'}"><span class="bar"></span><div class="label">Ganancia de esta unidad</div><div class="value small">${fmtMoney(ing-gas)}</div></div>
    </div>
    <div class="section-label">Viajes (${viajes.length})</div>`;
  if(viajes.length){ h+=`<div class="bd">`; viajes.forEach(t=>{
    h+=`<div class="bd-row" onclick="closeSheet();openViajeForm('${t.id}')" style="cursor:pointer"><div class="nm"><div class="t">${esc(t.origen||'?')} → ${esc(t.destino||'?')}</div><div class="s">${fmtDate(t.fecha)}${t.estado==='pendiente'?' · ⏳ por cobrar':''}</div></div><div class="amt pos">${fmtMoney(toBase(t.precio,t.moneda))}</div></div>`;
  }); h+=`</div>`; }
  else h += `<div style="color:var(--muted);font-size:.85rem;padding:2px 4px 8px">Sin viajes este mes.</div>`;
  h += `<div class="section-label">Gastos (${gastos.length})</div>`;
  if(gastos.length){ h+=`<div class="bd">`; gastos.forEach(g=>{ const c=catOf(g.categoria);
    h+=`<div class="bd-row" onclick="closeSheet();openGastoForm('${g.id}')" style="cursor:pointer"><div class="ic">${c.em}</div><div class="nm"><div class="t">${esc(c.nom)}</div><div class="s">${fmtDate(g.fecha)}${g.notas?' · '+esc(g.notas):''}</div></div><div class="amt neg">${fmtMoney(toBase(g.monto,g.moneda))}</div></div>`;
  }); h+=`</div>`; }
  else h += `<div style="color:var(--muted);font-size:.85rem;padding:2px 4px 8px">Sin gastos este mes.</div>`;
  h += `<div class="form-actions"><button class="btn ghost block" onclick="closeSheet()">Cerrar</button></div>`;
  openSheet(h);
}

/* ---------------- VIAJES ---------------- */
function renderViajes(){
  const viajes = inMonth(DB.all('viajes')).sort((a,b)=> b.fecha.localeCompare(a.fecha) || b.id.localeCompare(a.id));
  let h = `<div class="screen-head"><h2>Viajes</h2><span class="count">${fmtMonth(State.month)}</span></div>`;
  if(!viajes.length){
    h += emptyBox('🚌','No hay viajes este mes.','＋ Nuevo viaje','openViajeForm()');
  }else{
    h += `<div class="list">`;
    let lastDay='';
    viajes.forEach(v=>{
      if(v.fecha!==lastDay){ h += `<div class="day-head">${fmtDate(v.fecha)}</div>`; lastDay=v.fecha; }
      const ruta = `${esc(v.origen||'?')} → ${esc(v.destino||'?')}`;
      const meta = [nombreVehiculo(v.vehiculoId), v.pax?`${v.pax} pax`:'', v.cliente?esc(v.cliente):'']
                   .filter(Boolean).join(' · ');
      const tag = v.estado==='pendiente'
        ? `<span class="tag pending">Por cobrar</span>` : `<span class="tag paid">Pagado</span>`;
      h += `<div class="item" onclick="openViajeForm('${v.id}')">
        <div class="ic">🚌</div>
        <div class="body">
          <div class="top"><span class="title">${ruta}</span><span class="amt pos">${fmtMoney(toBase(v.precio,v.moneda))}</span></div>
          <div class="meta">${meta} ${tag}</div>
        </div></div>`;
    });
    h += `</div>`;
  }
  $('#scr-viajes').innerHTML = h;
}

/* ---------------- GASTOS ---------------- */
function renderGastos(){
  const gastos = inMonth(DB.all('gastos')).sort((a,b)=> b.fecha.localeCompare(a.fecha) || b.id.localeCompare(a.id));
  let h = `<div class="screen-head"><h2>Gastos</h2><span class="count">${fmtMonth(State.month)}</span></div>`;
  if(!gastos.length){
    h += emptyBox('💸','No hay gastos este mes.','＋ Nuevo gasto','openGastoForm()');
  }else{
    h += `<div class="list">`;
    let lastDay='';
    gastos.forEach(g=>{
      if(g.fecha!==lastDay){ h += `<div class="day-head">${fmtDate(g.fecha)}</div>`; lastDay=g.fecha; }
      const c = catOf(g.categoria);
      const meta = [nombreVehiculo(g.vehiculoId), g.notas?esc(g.notas):''].filter(Boolean).join(' · ');
      h += `<div class="item" onclick="openGastoForm('${g.id}')">
        <div class="ic exp">${c.em}</div>
        <div class="body">
          <div class="top"><span class="title">${esc(c.nom)}</span><span class="amt neg">${fmtMoney(toBase(g.monto,g.moneda))}</span></div>
          <div class="meta">${meta||'—'}</div>
        </div></div>`;
    });
    h += `</div>`;
  }
  $('#scr-gastos').innerHTML = h;
}

/* ---------------- COMISIONES ---------------- */
function renderComisiones(){
  const comis = inMonth(DB.all('comisiones')).sort((a,b)=> b.fecha.localeCompare(a.fecha) || b.id.localeCompare(a.id));
  const total = comis.reduce((s,c)=> s + toBase(c.monto,c.moneda), 0);
  let h = `<div class="screen-head"><h2>Comisiones</h2><span class="count">${fmtMoney(total)}</span></div>`;
  if(!DB.all('proveedores').length && !comis.length){
    h += `<div class="empty"><div class="em">🤝</div>
      <p>Acá anotás las <b>comisiones</b> que ganás cuando pasás un servicio a otro proveedor (tours, rafting, hoteles…).</p>
      <button class="btn primary" onclick="openComisionForm()">＋ Nueva comisión</button>
      <div style="margin-top:12px"><button class="btn ghost" onclick="openProveedorForm()">Primero agregar un proveedor</button></div></div>`;
  }else if(!comis.length){
    h += emptyBox('🤝','No hay comisiones este mes.','＋ Nueva comisión','openComisionForm()');
  }else{
    h += `<div class="list">`; let lastDay='';
    comis.forEach(c=>{
      if(c.fecha!==lastDay){ h += `<div class="day-head">${fmtDate(c.fecha)}</div>`; lastDay=c.fecha; }
      const meta = [nombreProveedor(c.proveedorId), c.cliente?esc(c.cliente):''].filter(Boolean).join(' · ');
      const tag = c.estado==='pendiente'
        ? `<span class="tag pending">Por cobrar</span>` : `<span class="tag paid">Cobrada</span>`;
      h += `<div class="item" onclick="openComisionForm('${c.id}')">
        <div class="ic">🤝</div>
        <div class="body">
          <div class="top"><span class="title">${esc(c.servicio||'Comisión')}</span><span class="amt pos">${fmtMoney(toBase(c.monto,c.moneda))}</span></div>
          <div class="meta">${meta} ${tag}</div>
        </div></div>`;
    });
    h += `</div>`;
  }
  $('#scr-comisiones').innerHTML = h;
}

/* ---------------- MÁS (vehículos + choferes + proveedores) ---------------- */
function renderMas(){
  const vv = DB.all('vehiculos'), cc = DB.all('choferes'), pp = DB.all('proveedores');
  let h = `<div class="screen-head"><h2>Más</h2></div>
    <div class="seg" style="margin-bottom:16px">
      <button class="${State.masView==='vehiculos'?'on':''}" onclick="setMas('vehiculos')">🚐 Vehículos</button>
      <button class="${State.masView==='choferes'?'on':''}" onclick="setMas('choferes')">👤 Choferes</button>
      <button class="${State.masView==='proveedores'?'on':''}" onclick="setMas('proveedores')">🤝 Proveedores</button>
    </div>`;
  // botón "Agregar" siempre visible según el apartado
  const addBtn = {
    vehiculos:['＋ Agregar vehículo','openVehiculoForm()'],
    choferes:['＋ Agregar chofer','openChoferForm()'],
    proveedores:['＋ Agregar proveedor','openProveedorForm()'],
  }[State.masView];
  h += `<button class="btn primary block" style="margin-bottom:14px" onclick="${addBtn[1]}">${addBtn[0]}</button>`;
  if(State.masView==='vehiculos'){
    if(!vv.length) h += emptyBox('🚐','No hay vehículos.','＋ Agregar vehículo','openVehiculoForm()');
    else{ h += `<div class="list">`; vv.forEach(v=>{
      const meta = [v.nombre?esc(v.nombre):'', v.capacidad?`${v.capacidad} pax`:''].filter(Boolean).join(' · ');
      h += `<div class="item" onclick="openVehiculoForm('${v.id}')"><div class="ic">🚐</div>
        <div class="body"><div class="top"><span class="title">${esc(v.placa||v.nombre||'Vehículo')}</span></div>
        <div class="meta">${meta||'Sin datos'}</div></div></div>`;
    }); h += `</div>`; }
  }else if(State.masView==='choferes'){
    if(!cc.length) h += emptyBox('👤','No hay choferes.','＋ Agregar chofer','openChoferForm()');
    else{ h += `<div class="list">`; cc.forEach(c=>{
      h += `<div class="item" onclick="openChoferForm('${c.id}')"><div class="ic">👤</div>
        <div class="body"><div class="top"><span class="title">${esc(c.nombre)}</span></div>
        <div class="meta">${c.telefono?esc(c.telefono):'Sin teléfono'}</div></div></div>`;
    }); h += `</div>`; }
  }else{
    if(!pp.length) h += emptyBox('🤝','No hay proveedores.','＋ Agregar proveedor','openProveedorForm()');
    else{ h += `<div class="list">`; pp.forEach(p=>{
      const meta = [p.servicio?esc(p.servicio):'', p.telefono?esc(p.telefono):''].filter(Boolean).join(' · ');
      h += `<div class="item" onclick="openProveedorForm('${p.id}')"><div class="ic">🤝</div>
        <div class="body"><div class="top"><span class="title">${esc(p.nombre)}</span></div>
        <div class="meta">${meta||'Sin datos'}</div></div></div>`;
    }); h += `</div>`; }
  }
  $('#scr-mas').innerHTML = h;
}
function setMas(v){ State.masView=v; renderMas(); }

/* ---------------- AJUSTES ---------------- */
function renderAjustes(){
  const s = DB.data.settings;
  const nV = DB.all('viajes').length, nG = DB.all('gastos').length;
  let h = `<div class="screen-head"><h2>Ajustes</h2></div>

  <div class="section-label">Moneda</div>
  <div class="set-group">
    <div class="set-row"><span class="ic">💱</span><div class="lab"><div class="t">Moneda para totales</div><div class="s">En qué moneda ves los resúmenes</div></div></div>
    <div style="padding:0 15px 15px"><div class="seg">
      <button class="${s.totalMoneda==='$'?'on':''}" onclick="setTotalMoneda('$')">Dólares $</button>
      <button class="${s.totalMoneda==='₡'?'on':''}" onclick="setTotalMoneda('₡')">Colones ₡</button>
    </div></div>
    <div class="set-row"><span class="ic">🔁</span><div class="lab"><div class="t">Tipo de cambio</div><div class="s">Colones por 1 dólar</div></div>
      <input type="number" id="tcInput" value="${s.tc}" style="width:92px;background:var(--bg-3);border:1px solid var(--line-2);color:var(--text);border-radius:9px;padding:9px;text-align:right" onchange="setTC(this.value)"></div>
  </div>

  <div class="section-label">Seguridad</div>
  <div class="set-group">
    <div class="set-row"><span class="ic">🔒</span><div class="lab"><div class="t">PIN de acceso</div><div class="s">${s.pin?'Activado (4 dígitos)':'Desactivado'}</div></div>
      <button class="btn sm" onclick="openPinSetup()">${s.pin?'Cambiar':'Activar'}</button></div>
  </div>

  <div class="section-label">Datos</div>
  <div class="set-group">
    <div class="set-row"><span class="ic">📤</span><div class="lab"><div class="t">Exportar respaldo</div><div class="s">${nV} viajes · ${nG} gastos</div></div>
      <button class="btn sm" onclick="exportData()">Descargar</button></div>
    <div class="set-row"><span class="ic">📥</span><div class="lab"><div class="t">Importar respaldo</div><div class="s">Restaurar desde archivo</div></div>
      <button class="btn sm" onclick="$('#importFile').click()">Cargar</button>
      <input type="file" id="importFile" accept="application/json" class="hidden" onchange="importData(this)"></div>
  </div>

  <div class="section-label">Nube (próximamente)</div>
  <div class="set-group"><div class="set-row"><span class="ic">☁️</span>
    <div class="lab"><div class="t">Sincronizar celular ↔ compu</div><div class="s">Etapa 2 — te avisaré cuando esté listo</div></div></div></div>

  <p style="text-align:center;color:var(--muted-2);font-size:.78rem;margin-top:22px">Travesía · Control v1 — hecho para Eddie 🧡</p>`;
  $('#scr-ajustes').innerHTML = h;
}
function setTotalMoneda(m){ DB.data.settings.totalMoneda=m; DB.save(); renderAjustes(); toast('Moneda: '+ (m==='$'?'Dólares':'Colones')); }
function setTC(v){ DB.data.settings.tc = +v||510; DB.save(); toast('Tipo de cambio guardado'); }

/* ---------------- Helper: empty box ---------------- */
function emptyBox(em,txt,btn,fn){
  return `<div class="empty"><div class="em">${em}</div><p>${txt}</p>
    <button class="btn primary" onclick="${fn}">${btn}</button></div>`;
}

/* ==========================================================================
   FORMULARIOS (bottom sheets)
   ========================================================================== */
function openSheet(html){ $('#sheet').innerHTML = `<div class="grip"></div>`+html; $('#sheetBack').classList.add('open'); }
function closeSheet(){ $('#sheetBack').classList.remove('open'); }

function vehOptions(sel){ return DB.all('vehiculos').map(v=>`<option value="${v.id}" ${v.id===sel?'selected':''}>${esc(v.nombre)}</option>`).join(''); }
function choOptions(sel){ return `<option value="">— Sin asignar —</option>`+DB.all('choferes').map(c=>`<option value="${c.id}" ${c.id===sel?'selected':''}>${esc(c.nombre)}</option>`).join(''); }

/* ----- Viaje ----- */
function openViajeForm(id){
  const v = id ? Object.assign({}, DB.get('viajes',id)) : {fecha:todayISO(), moneda:DB.data.settings.moneda, estado:'pagado', pax:''};
  const del = id ? `<button class="del" onclick="delItem('viajes','${id}')">🗑 Borrar</button>` : '';
  openSheet(`
    <h3>${id?'Editar viaje':'Nuevo viaje'} ${del}</h3>
    <div class="field row2">
      <div><label>Fecha</label><input type="date" id="f_fecha" value="${v.fecha||todayISO()}"></div>
      <div><label>Pasajeros</label><input type="number" id="f_pax" inputmode="numeric" value="${v.pax||''}" placeholder="0"></div>
    </div>
    <div class="field row2">
      <div><label>De</label><input id="f_origen" value="${esc(v.origen||'')}" placeholder="La Fortuna"></div>
      <div><label>A</label><input id="f_destino" value="${esc(v.destino||'')}" placeholder="Aeropuerto SJO"></div>
    </div>
    <div class="field"><label>Precio cobrado</label>
      <div class="amount-wrap">
        <select id="f_moneda">${monedaOpts(v.moneda)}</select>
        <input type="number" id="f_precio" inputmode="decimal" value="${v.precio??''}" placeholder="0.00" style="flex:1">
      </div>
    </div>
    <div class="field"><label>Vehículo</label><select id="f_veh">${vehOptions(v.vehiculoId)}</select></div>
    <div class="field"><label>Chofer</label><select id="f_cho">${choOptions(v.choferId)}</select></div>
    <div class="field"><label>Cliente (opcional)</label><input id="f_cliente" value="${esc(v.cliente||'')}" placeholder="Nombre del cliente"></div>
    <div class="field"><label>Estado de pago</label>
      <div class="seg" id="f_estado">
        <button type="button" class="${v.estado!=='pendiente'?'on':''}" data-v="pagado">✅ Pagado</button>
        <button type="button" class="${v.estado==='pendiente'?'on':''}" data-v="pendiente">⏳ Por cobrar</button>
      </div></div>
    <div class="field"><label>Notas (opcional)</label><textarea id="f_notas" placeholder="Vuelo, hora, detalles…">${esc(v.notas||'')}</textarea></div>
    <div class="form-actions">
      <button class="btn ghost" onclick="closeSheet()">Cancelar</button>
      <button class="btn primary" onclick="saveViaje('${id||''}')">Guardar</button>
    </div>`);
  segClick('f_estado');
}
function saveViaje(id){
  const precio = parseFloat($('#f_precio').value);
  if(isNaN(precio)){ toast('Escribí el precio'); return; }
  const obj = {
    id: id||undefined,
    fecha: $('#f_fecha').value || todayISO(),
    pax: $('#f_pax').value ? +$('#f_pax').value : '',
    origen: $('#f_origen').value.trim(),
    destino: $('#f_destino').value.trim(),
    precio, moneda: $('#f_moneda').value,
    vehiculoId: $('#f_veh').value,
    choferId: $('#f_cho').value,
    cliente: $('#f_cliente').value.trim(),
    estado: $('#f_estado').dataset.val || 'pagado',
    notas: $('#f_notas').value.trim(),
  };
  DB.upsert('viajes', obj); closeSheet(); toast(id?'Viaje actualizado':'Viaje guardado ✅'); render();
}

/* ----- Gasto ----- */
function openGastoForm(id){
  const g = id ? Object.assign({}, DB.get('gastos',id)) : {fecha:todayISO(), moneda:'₡', categoria:'combustible'};
  const del = id ? `<button class="del" onclick="delItem('gastos','${id}')">🗑 Borrar</button>` : '';
  openSheet(`
    <h3>${id?'Editar gasto':'Nuevo gasto'} ${del}</h3>
    <div class="field"><label>Categoría</label>
      <div class="chips" id="g_cat">
        ${CATS.map(c=>`<button type="button" class="chip ${c.id===g.categoria?'on':''}" data-v="${c.id}">${c.em} ${c.nom}</button>`).join('')}
      </div></div>
    <div class="field"><label>Monto</label>
      <div class="amount-wrap">
        <select id="g_moneda">${monedaOpts(g.moneda)}</select>
        <input type="number" id="g_monto" inputmode="decimal" value="${g.monto??''}" placeholder="0" style="flex:1" autofocus>
      </div>
    </div>
    <div class="field row2">
      <div><label>Fecha</label><input type="date" id="g_fecha" value="${g.fecha||todayISO()}"></div>
      <div><label>Vehículo</label><select id="g_veh">${vehOptions(g.vehiculoId)}</select></div>
    </div>
    <div class="field"><label>Notas (opcional)</label><textarea id="g_notas" placeholder="Ej: gasolina llena, cambio de aceite…">${esc(g.notas||'')}</textarea></div>
    <div class="form-actions">
      <button class="btn ghost" onclick="closeSheet()">Cancelar</button>
      <button class="btn primary" onclick="saveGasto('${id||''}')">Guardar</button>
    </div>`);
  chipClick('g_cat');
}
function saveGasto(id){
  const monto = parseFloat($('#g_monto').value);
  if(isNaN(monto)){ toast('Escribí el monto'); return; }
  const obj = {
    id:id||undefined,
    fecha: $('#g_fecha').value || todayISO(),
    categoria: $('#g_cat').dataset.val || 'otro',
    monto, moneda: $('#g_moneda').value,
    vehiculoId: $('#g_veh').value,
    notas: $('#g_notas').value.trim(),
  };
  DB.upsert('gastos', obj); closeSheet(); toast(id?'Gasto actualizado':'Gasto guardado ✅'); render();
}

/* ----- Vehículo ----- */
function openVehiculoForm(id){
  const v = id ? Object.assign({}, DB.get('vehiculos',id)) : {};
  const del = id ? `<button class="del" onclick="delItem('vehiculos','${id}')">🗑 Borrar</button>` : '';
  openSheet(`
    <h3>${id?'Editar vehículo':'Nuevo vehículo'} ${del}</h3>
    <div class="field"><label>Placa</label><input id="v_placa" value="${esc(v.placa||'')}" placeholder="Ej: CL 123456"></div>
    <div class="field row2">
      <div><label>Nombre / modelo</label><input id="v_nombre" value="${esc(v.nombre||'')}" placeholder="Staria, Hiace…"></div>
      <div><label>Capacidad (pax)</label><input type="number" id="v_cap" value="${v.capacidad||''}" placeholder="5"></div>
    </div>
    <div class="field"><label>Notas</label><textarea id="v_notas" placeholder="Color, año, detalles…">${esc(v.notas||'')}</textarea></div>
    <div class="form-actions">
      <button class="btn ghost" onclick="closeSheet()">Cancelar</button>
      <button class="btn primary" onclick="saveVehiculo('${id||''}')">Guardar</button>
    </div>`);
}
function saveVehiculo(id){
  const placa = $('#v_placa').value.trim();
  const nombre = $('#v_nombre').value.trim();
  if(!placa && !nombre){ toast('Escribí la placa o el nombre'); return; }
  DB.upsert('vehiculos', {id:id||undefined, placa, nombre, capacidad:$('#v_cap').value?+$('#v_cap').value:'', notas:$('#v_notas').value.trim()});
  closeSheet(); toast(id?'Vehículo actualizado':'Vehículo guardado ✅'); render();
}

/* ----- Chofer ----- */
function openChoferForm(id){
  const c = id ? Object.assign({}, DB.get('choferes',id)) : {};
  const del = id ? `<button class="del" onclick="delItem('choferes','${id}')">🗑 Borrar</button>` : '';
  openSheet(`
    <h3>${id?'Editar chofer':'Nuevo chofer'} ${del}</h3>
    <div class="field"><label>Nombre</label><input id="c_nombre" value="${esc(c.nombre||'')}" placeholder="Nombre del chofer"></div>
    <div class="field"><label>Teléfono</label><input id="c_tel" inputmode="tel" value="${esc(c.telefono||'')}" placeholder="8888 8888"></div>
    <div class="field"><label>Notas</label><textarea id="c_notas" placeholder="Detalles…">${esc(c.notas||'')}</textarea></div>
    <div class="form-actions">
      <button class="btn ghost" onclick="closeSheet()">Cancelar</button>
      <button class="btn primary" onclick="saveChofer('${id||''}')">Guardar</button>
    </div>`);
}
function saveChofer(id){
  const nombre = $('#c_nombre').value.trim();
  if(!nombre){ toast('Escribí el nombre'); return; }
  DB.upsert('choferes', {id:id||undefined, nombre, telefono:$('#c_tel').value.trim(), notas:$('#c_notas').value.trim()});
  closeSheet(); toast(id?'Chofer actualizado':'Chofer guardado ✅'); render();
}

/* ----- Proveedor ----- */
function openProveedorForm(id){
  const p = id ? Object.assign({}, DB.get('proveedores',id)) : {};
  const del = id ? `<button class="del" onclick="delItem('proveedores','${id}')">🗑 Borrar</button>` : '';
  openSheet(`
    <h3>${id?'Editar proveedor':'Nuevo proveedor'} ${del}</h3>
    <div class="field"><label>Nombre</label><input id="p_nombre" value="${esc(p.nombre||'')}" placeholder="Ej: Tours El Volcán"></div>
    <div class="field"><label>Servicio que ofrece</label><input id="p_servicio" value="${esc(p.servicio||'')}" placeholder="Ej: Rafting, Tours, Hotel"></div>
    <div class="field"><label>Teléfono</label><input id="p_tel" inputmode="tel" value="${esc(p.telefono||'')}" placeholder="8888 8888"></div>
    <div class="field"><label>Notas</label><textarea id="p_notas" placeholder="Comisión acordada, contacto…">${esc(p.notas||'')}</textarea></div>
    <div class="form-actions">
      <button class="btn ghost" onclick="closeSheet()">Cancelar</button>
      <button class="btn primary" onclick="saveProveedor('${id||''}')">Guardar</button>
    </div>`);
}
function saveProveedor(id){
  const nombre = $('#p_nombre').value.trim();
  if(!nombre){ toast('Escribí el nombre'); return; }
  DB.upsert('proveedores', {id:id||undefined, nombre, servicio:$('#p_servicio').value.trim(), telefono:$('#p_tel').value.trim(), notas:$('#p_notas').value.trim()});
  closeSheet(); toast(id?'Proveedor actualizado':'Proveedor guardado ✅'); render();
}
function provOptions(sel){
  const list = DB.all('proveedores');
  return `<option value="">— Sin proveedor —</option>`+list.map(p=>`<option value="${p.id}" ${p.id===sel?'selected':''}>${esc(p.nombre)}</option>`).join('');
}

/* ----- Comisión ----- */
function openComisionForm(id){
  const c = id ? Object.assign({}, DB.get('comisiones',id)) : {fecha:todayISO(), moneda:DB.data.settings.moneda, estado:'cobrada'};
  const del = id ? `<button class="del" onclick="delItem('comisiones','${id}')">🗑 Borrar</button>` : '';
  const sinProv = !DB.all('proveedores').length;
  openSheet(`
    <h3>${id?'Editar comisión':'Nueva comisión'} ${del}</h3>
    <div class="field"><label>Servicio pasado</label><input id="k_servicio" value="${esc(c.servicio||'')}" placeholder="Ej: Tour volcán, Rafting, Canopy"></div>
    <div class="field"><label>Comisión ganada</label>
      <div class="amount-wrap">
        <select id="k_moneda">${monedaOpts(c.moneda)}</select>
        <input type="number" id="k_monto" inputmode="decimal" value="${c.monto??''}" placeholder="0.00" style="flex:1">
      </div>
    </div>
    <div class="field"><label>Proveedor</label>
      <select id="k_prov">${provOptions(c.proveedorId)}</select>
      ${sinProv?`<div style="margin-top:8px"><button type="button" class="btn sm ghost" onclick="closeSheet();openProveedorForm()">＋ Crear proveedor</button></div>`:''}
    </div>
    <div class="field row2">
      <div><label>Fecha</label><input type="date" id="k_fecha" value="${c.fecha||todayISO()}"></div>
      <div><label>Cliente (opcional)</label><input id="k_cliente" value="${esc(c.cliente||'')}" placeholder="Nombre"></div>
    </div>
    <div class="field"><label>Estado de pago</label>
      <div class="seg" id="k_estado">
        <button type="button" class="${c.estado!=='pendiente'?'on':''}" data-v="cobrada">✅ Cobrada</button>
        <button type="button" class="${c.estado==='pendiente'?'on':''}" data-v="pendiente">⏳ Por cobrar</button>
      </div></div>
    <div class="field"><label>Notas (opcional)</label><textarea id="k_notas" placeholder="Detalles…">${esc(c.notas||'')}</textarea></div>
    <div class="form-actions">
      <button class="btn ghost" onclick="closeSheet()">Cancelar</button>
      <button class="btn primary" onclick="saveComision('${id||''}')">Guardar</button>
    </div>`);
  segClick('k_estado');
}
function saveComision(id){
  const monto = parseFloat($('#k_monto').value);
  if(isNaN(monto)){ toast('Escribí la comisión'); return; }
  const obj = {
    id:id||undefined,
    fecha: $('#k_fecha').value || todayISO(),
    servicio: $('#k_servicio').value.trim(),
    monto, moneda: $('#k_moneda').value,
    proveedorId: $('#k_prov').value,
    cliente: $('#k_cliente').value.trim(),
    estado: $('#k_estado').dataset.val || 'cobrada',
    notas: $('#k_notas').value.trim(),
  };
  DB.upsert('comisiones', obj); closeSheet(); toast(id?'Comisión actualizada':'Comisión guardada ✅'); render();
}

/* ----- Borrar (con confirmación) ----- */
function delItem(col,id){
  const labels = {viajes:'este viaje', gastos:'este gasto', vehiculos:'este vehículo', choferes:'este chofer', proveedores:'este proveedor', comisiones:'esta comisión'};
  if(confirm(`¿Seguro que querés borrar ${labels[col]}? No se puede deshacer.`)){
    DB.remove(col,id); closeSheet(); toast('Borrado'); render();
  }
}

/* ---------------- Componentes de formulario ---------------- */
function monedaOpts(sel){ return ['$','₡'].map(m=>`<option value="${m}" ${m===sel?'selected':''}>${m}</option>`).join(''); }
// segmentos (estado de pago)
function segClick(wrapId){
  const wrap = $('#'+wrapId);
  wrap.dataset.val = $('.on',wrap)?.dataset.v || wrap.querySelector('button').dataset.v;
  wrap.onclick = (e)=>{ const b=e.target.closest('button'); if(!b) return;
    $$('button',wrap).forEach(x=>x.classList.remove('on')); b.classList.add('on'); wrap.dataset.val=b.dataset.v; };
}
// chips (categoría)
function chipClick(wrapId){
  const wrap = $('#'+wrapId);
  wrap.dataset.val = $('.on',wrap)?.dataset.v || wrap.querySelector('button').dataset.v;
  wrap.onclick = (e)=>{ const b=e.target.closest('button'); if(!b) return;
    $$('button',wrap).forEach(x=>x.classList.remove('on')); b.classList.add('on'); wrap.dataset.val=b.dataset.v; };
}

/* ==========================================================================
   SELECTOR DE MES
   ========================================================================== */
function openMonthPicker(){
  const now = new Date();
  let opts='';
  for(let i=0;i<18;i++){
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    opts += `<button class="chip ${ym===State.month?'on':''}" style="margin:4px" onclick="pickMonth('${ym}')">${fmtMonth(ym)}</button>`;
  }
  openSheet(`<h3>Elegí el mes</h3><div class="chips" style="gap:8px">${opts}</div>
    <div class="form-actions"><button class="btn ghost block" onclick="closeSheet()">Cerrar</button></div>`);
}
function pickMonth(ym){ State.month=ym; closeSheet(); render(); }

/* ==========================================================================
   PIN SETUP  (desde ajustes)
   ========================================================================== */
function openPinSetup(){
  openSheet(`<h3>PIN de acceso</h3>
    <div class="field"><label>Nuevo PIN (4 dígitos)</label>
      <input type="number" id="pin1" inputmode="numeric" maxlength="4" placeholder="••••"></div>
    <div class="field"><label>Repetí el PIN</label>
      <input type="number" id="pin2" inputmode="numeric" maxlength="4" placeholder="••••"></div>
    <p style="color:var(--muted);font-size:.82rem">Dejá los campos vacíos y guardá para <b>quitar</b> el PIN.</p>
    <div class="form-actions">
      <button class="btn ghost" onclick="closeSheet()">Cancelar</button>
      <button class="btn primary" onclick="savePin()">Guardar</button>
    </div>`);
}
function savePin(){
  const a=$('#pin1').value.trim(), b=$('#pin2').value.trim();
  if(!a && !b){ DB.data.settings.pin=''; DB.save(); closeSheet(); toast('PIN desactivado'); renderAjustes(); return; }
  if(a.length!==4){ toast('El PIN debe tener 4 dígitos'); return; }
  if(a!==b){ toast('Los PIN no coinciden'); return; }
  DB.data.settings.pin=a; DB.save(); closeSheet(); toast('PIN guardado 🔒'); renderAjustes();
}

/* ==========================================================================
   EXPORTAR / IMPORTAR
   ========================================================================== */
function exportData(){
  const blob = new Blob([JSON.stringify(DB.data,null,2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `travesia-control-${todayISO()}.json`;
  a.click(); URL.revokeObjectURL(a.href);
  toast('Respaldo descargado 📤');
}
function importData(input){
  const file = input.files[0]; if(!file) return;
  const r = new FileReader();
  r.onload = ()=>{
    try{
      const d = JSON.parse(r.result);
      if(!d.vehiculos && !d.viajes && !d.gastos) throw 0;
      if(!confirm('Esto reemplazará todos los datos actuales por los del archivo. ¿Continuar?')) return;
      localStorage.setItem(DB.KEY, JSON.stringify(d));  // guardar crudo
      DB.load();                                        // recargar + normalizar campos faltantes
      DB.save();
      goTab('inicio'); toast('Datos importados ✅');
    }catch(e){ toast('Archivo no válido'); }
  };
  r.readAsText(file); input.value='';
}

/* ==========================================================================
   TOAST
   ========================================================================== */
let toastT;
function toast(msg){
  const t=$('#toast'); t.textContent=msg; t.classList.add('show');
  clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'), 2200);
}

/* ==========================================================================
   Service worker (para instalar como app / offline)
   ========================================================================== */
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=> navigator.serviceWorker.register('sw.js').catch(()=>{}));
}
