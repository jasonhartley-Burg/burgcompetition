const grid=document.getElementById('menuGrid');
const statusEl=document.getElementById('status');
const money=c=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format((c||0)/100);
function esc(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

function itemIcon(name=''){
  const n=String(name).toLowerCase();
  const icon=(file,label='')=>`<img class="menu-item-image" src="/menu-icons/${file}.png" alt="${label}">`;

  // These image assets are taken directly from the approved icon mockup so the
  // live menu matches that rendering rather than relying on platform emoji.
  const rules=[
    [/alumni.*shirt|shirt.*alumni/, 'alumni-shirt'],
    [/student meal.*hot dog|hot dog/, 'hot-dog'],
    [/cheeseburger|hamburger|burger/, 'burger'],
    [/student meal.*pizza|pizza/, 'pizza'],
    [/pretzel/, 'pretzel'],
    [/nacho/, 'nachos'],
    [/cheese cup/, 'cheese-cup'],
    [/chip/, 'chips'],
    [/pickle/, 'pickle'],
    [/popcorn/, 'popcorn'],
    [/pepsi|soda|pop\b/, 'pepsi'],
    [/gatorade|sports drink/, 'gatorade'],
    [/water/, 'water'],
    [/hot chocolate|hot cocoa|cocoa/, 'hot-chocolate'],
    [/coffee/, 'coffee'],
    [/ice cream sandwich/, 'ice-cream-sandwich'],
    [/popsicle/, 'popsicle'],
    [/cotton candy/, 'cotton-candy'],
    [/candy bar|chocolate bar/, 'candy-bar'],
    [/airhead|ring pop/, 'airheads-ring-pops'],
    [/small cand/, 'small-candies']
  ];
  for(const [re,file] of rules) if(re.test(n)) return icon(file);
  return icon('menu-generic');
}
function categoryIcon(name=''){
  const n=String(name).toLowerCase();
  const key=n.includes('grill')?'grill':
    n.includes('snack')?'snacks':
    n.includes('drink')?'drinks':
    n.includes('sweet')?'sweets':
    n.includes('add on')?'addons':
    n.includes('other')?'other':'other';
  // Inline the six SVG illustrations so deployment cannot serve an old image file.
  const illustrations={
    grill:`<path d="M8 20h36v8H8zM12 32h28M16 28l-4 14m24-14 4 14M15 12c0-4 5-4 5-8m6 8c0-4 5-4 5-8m6 8c0-4 5-4 5-8"/>`,
    snacks:`<path d="M8 22c3-8 9-10 18-10s15 2 18 10l-5 21H13L8 22zM16 22h20M20 32h12M23 12l-2-6m10 6 2-6"/>`,
    drinks:`<path d="M13 13h27l-4 30H17l-4-30zM11 13h31M25 13l8-9M20 25h13M22 32h9"/>`,
    sweets:`<path d="M26 8c11 0 18 7 18 17S36 42 26 42 8 35 8 25 15 8 26 8zM18 21l5 5-5 5m16-10-5 5 5 5m-11-5h6"/>`,
    addons:`<path d="M8 23h36l-5 18H13L8 23zM12 23c0-6 5-11 14-11s14 5 14 11M20 14l-3-7m9 5V5m8 9 3-7M18 31h16"/>`,
    other:`<path d="M10 19h32v24H10V19zM7 19h38M26 19v24M13 12c0-10 13-6 13 7 0-13 13-17 13-7 0 6-8 7-13 7s-13-1-13-7z"/>`
  };
  return `<svg class="heading-image" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="26" cy="26" r="24" fill="#e3f8f2" stroke="#29bdae" stroke-width="2"/>${illustrations[key]}</svg>`;
}

function categoryWeight(category){
  const items=category.items||[];
  const longest=items.reduce((m,i)=>Math.max(m,String(i.name||'').length,String(i.description||'').length),0);
  const descriptions=items.filter(i=>i.description).length;
  // Keep changes subtle: content-heavy categories get more horizontal room,
  // while short categories remain compact. Clamp avoids one box dominating.
  return Math.max(.85,Math.min(1.45,.88+(items.length*.055)+(descriptions*.05)+(longest*.004)));
}

function menuFits(){
  const shell=document.querySelector('.board-shell');
  const footer=document.querySelector('.board-footer');
  if(!shell||!footer)return true;
  const gridBox=grid.getBoundingClientRect();
  const footerBox=footer.getBoundingClientRect();
  // Keep a visible safety gap above the decorative footer/music area.
  return gridBox.bottom <= footerBox.top - 16;
}

function fitMenu(){
  // Progressive fit strategy for TV readability:
  // 1) natural content height, 2) rebalance width, 3) tighten spacing,
  // 4) gently reduce type, 5) use the minimum readable TV size.
  const stages=['fit-rebalance','fit-spacing','fit-type','fit-min'];
  grid.classList.remove(...stages,'compact');

  if(menuFits()) return;
  for(const stage of stages){
    grid.classList.add(stage);
    // Force layout before checking the next stage.
    void grid.offsetHeight;
    if(menuFits()) return;
  }
}

async function load(){
  try{
    const r=await fetch('/api/menu',{cache:'no-store'});
    if(!r.ok)throw new Error();
    const d=await r.json();
    const cats=d.categories||[];

    const categoryHtml=c=>`<section class="category ${String(c.name||'').toLowerCase().includes('sweet')?'sweet-category':''}"><h2><span class="heading-mark">${categoryIcon(c.name)}</span><span class="heading-label">${esc(c.name)}</span></h2><div class="heading-rule"><span class="rule-dot" aria-hidden="true"></span></div><div class="items">${(c.items||[]).map(i=>`<article class="item ${i.sold_out?'sold':''}"><div class="item-copy"><div class="item-top"><div class="item-price">${money(i.price_cents)}</div><div class="item-name">${esc(i.name)}</div></div>${i.description?`<div class="item-desc">${esc(i.description)}</div>`:''}</div><div class="item-icon" aria-hidden="true">${itemIcon(i.name)}</div>${i.sold_out?'<div class="sold-badge">SOLD OUT</div>':''}</article>`).join('')}</div></section>`;

    if(cats.length){
      // Keep the board balanced while allowing each column and panel to size to its content.
      // Drinks and Sweet Treats intentionally share the right-hand column so Sweet Treats
      // appears directly beneath Drinks & More.
      const columns=[[],[],[]];
      const used=new Set();
      const findCat=matcher=>cats.find((c,idx)=>!used.has(idx)&&matcher(String(c.name||'').toLowerCase()));
      const take=(matcher,col)=>{
        const c=findCat(matcher); if(!c)return;
        const idx=cats.indexOf(c); used.add(idx); columns[col].push(c);
      };
      // Fixed display order: Grill above Add Ons; Snacks above Other;
      // Drinks above Sweet Treats. Keep category contents admin-editable.
      take(n=>n.includes('grill'),0);
      take(n=>n.includes('add on'),0);
      take(n=>n.includes('snack'),1);
      take(n=>n.includes('other'),1);
      take(n=>n.includes('drink'),2);
      take(n=>n.includes('sweet'),2);

      // Future categories still go in the lightest column automatically.
      cats.forEach((c,idx)=>{
        if(used.has(idx))return;
        const scores=columns.map(col=>col.reduce((sum,x)=>sum+categoryWeight(x),0));
        const target=scores.indexOf(Math.min(...scores));
        columns[target].push(c);
      });

      // Give content-heavy columns more width. A stacked column (such as Drinks +
      // Sweet Treats) gets credit for both panels without being allowed to dominate.
      const weights=columns.map(col=>{
        const total=col.reduce((sum,c)=>sum+categoryWeight(c),0);
        return Math.max(.9,Math.min(1.6,.75+(total*.42)));
      });
      grid.innerHTML=columns.map((col,i)=>`<div class="menu-column" style="--column-grow:${weights[i].toFixed(2)}">${col.map(categoryHtml).join('')}</div>`).join('');
    }else{
      grid.innerHTML='<div class="empty">Menu coming soon</div>';
    }
    requestAnimationFrame(()=>requestAnimationFrame(fitMenu));
    statusEl.textContent='Updated '+new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
  }catch{
    statusEl.textContent='Reconnecting…';
  }
}

window.addEventListener('resize',fitMenu);
load();
setInterval(load,5000);
