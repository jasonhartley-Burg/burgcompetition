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
  return '★';
}
function categoryIcon(name=''){
  const n=String(name).toLowerCase();
  if(n.includes('grill')) return '♨';
  if(n.includes('drink')) return '★';
  if(n.includes('sweet')) return '★';
  return '★';
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

    const categoryHtml=c=>`<section class="category ${String(c.name||'').toLowerCase().includes('sweet')?'sweet-category':''}"><h2><span class="heading-mark">${categoryIcon(c.name)}</span>${esc(c.name)}<span class="heading-mark">${categoryIcon(c.name)}</span></h2><div class="heading-rule"><span>★</span></div><div class="items">${(c.items||[]).map(i=>`<article class="item ${i.sold_out?'sold':''}"><div class="item-copy"><div class="item-top"><div class="item-price">${money(i.price_cents)}</div><div class="item-name">${esc(i.name)}</div></div>${i.description?`<div class="item-desc">${esc(i.description)}</div>`:''}</div><div class="item-icon" aria-hidden="true">${itemIcon(i.name)}</div>${i.sold_out?'<div class="sold-badge">SOLD OUT</div>':''}</article>`).join('')}</div></section>`;

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
      take(n=>n.includes('grill'),0);
      take(n=>n.includes('snack'),1);
      take(n=>n.includes('drink'),2);
      take(n=>n.includes('sweet treat'),2);

      // Any future categories are placed into the lightest column automatically.
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
