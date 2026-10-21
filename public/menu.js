const grid=document.getElementById('menuGrid');
const statusEl=document.getElementById('status');
const money=c=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format((c||0)/100);
function esc(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

function itemIcon(name=''){
  const n=String(name).toLowerCase();
  const icon=(file,label='')=>{
    const cls=file==='alumni-shirt' ? 'menu-item-image alumni-shirt-icon' : 'menu-item-image';
    return `<img class="${cls}" src="/menu-icons/${file}.png" alt="${label}">`;
  };

  const rules=[
    [/alumni.*shirt|shirt.*alumni/, 'alumni-shirt'],
    [/student meal.*hot dog|all beef hot dog|hot dog/, 'hot-dog'],
    [/cheeseburger|hamburger|beyond burger|burger/, 'burger'],
    [/student meal.*pizza|pappa.*pizza|pizza/, 'pizza'],
    [/marching taco|\btaco\b/, 'taco'],
    [/baked potato/, 'baked-potato'],
    [/whole pickle|pickle/, 'pickle'],
    [/granola bar/, 'granola-bars'],
    [/fruit\/?veggie cup|fruit cup|veggie cup/, 'fruit-veggie-cup'],
    [/aaron.*popcorn|popcorn/, 'popcorn'],
    [/soft pretzel.*cheese|soft pretzel|pretzel/, 'pretzel'],
    [/nachos?/, 'nachos'],
    [/deluxe add-?on/, 'deluxe-addon'],
    [/chili style add-?on|chili add-?on/, 'chili-addon'],
    [/3d fidget|fidget/, 'fidgets'],
    [/baked sale/, 'baked-sale'],
    [/heart spinner/, 'heart-spinners'],
    [/pepsi|soda|pop\b/, 'pepsi'],
    [/gatorade|sports drink/, 'gatorade'],
    [/water/, 'water'],
    [/hot chocolate|hot cocoa|cocoa/, 'hot-chocolate'],
    [/coffee/, 'coffee'],
    [/ice cream bars?|ice cream sandwich/, 'ice-cream-bar'],
    [/popsicle/, 'popsicle'],
    [/cotton candy/, 'cotton-candy'],
    [/\bchips\b/, 'chips'],
    [/candy bars?|chocolate bars?/, 'candy-bar'],
    [/airheads?|ring pops?/, 'airheads-ring-pops'],
    [/small cand/, 'small-candies'],
    [/cheese cup/, 'cheese-cup']
  ];
  for(const [re,file] of rules) if(re.test(n)) return icon(file, name);
  return icon('menu-generic', name);
}

function categoryIcon(name=''){
  const n=String(name).toLowerCase();
  const file=n.includes('grill') ? 'heading-grill'
    : n.includes('snack') ? 'heading-snacks'
    : n.includes('drink') ? 'heading-drinks'
    : n.includes('sweet') ? 'heading-sweets'
    : n.includes('add on') ? 'heading-addons'
    : n.includes('other') ? 'heading-other'
    : 'heading-other';
  return `<img class="heading-image" src="/menu-icons/${file}.png" alt="">`;
}

function categoryWeight(category){
  const items=category.items||[];
  const longest=items.reduce((m,i)=>Math.max(m,String(i.name||'').length,String(i.description||'').length),0);
  const descriptions=items.filter(i=>i.description).length;
  return Math.max(.85,Math.min(1.45,.88+(items.length*.055)+(descriptions*.05)+(longest*.004)));
}

function menuFits(){
  const shell=document.querySelector('.board-shell');
  const footer=document.querySelector('.board-footer');
  if(!shell||!footer)return true;
  const gridBox=grid.getBoundingClientRect();
  const footerBox=footer.getBoundingClientRect();
  return gridBox.bottom <= footerBox.top - 16;
}

function fitMenu(){
  // The footer is an absolute overlay. Reserve its actual onscreen height so
  // the last rows cannot end up behind the payment and thank-you messages.
  const stages=['fit-rebalance','fit-spacing','fit-type','fit-min'];
  grid.classList.remove(...stages,'compact');
  grid.style.removeProperty('transform');
  grid.style.removeProperty('width');
  grid.style.removeProperty('transform-origin');

  if(menuFits()) return;
  for(const stage of stages){
    grid.classList.add(stage);
    void grid.offsetHeight;
    if(menuFits()) return;
  }

  // Last resort for shorter displays: fit the whole menu into the measured
  // region above the footer. Transform is visual, so preserve full width.
  const footer=document.querySelector('.board-footer');
  if(!footer)return;
  const top=grid.getBoundingClientRect().top;
  const allowed=Math.max(1,footer.getBoundingClientRect().top-top-18);
  const height=grid.getBoundingClientRect().height;
  if(height>allowed){
    const scale=Math.max(.70,Math.min(1,allowed/height));
    grid.style.transformOrigin='top left';
    grid.style.width=`${(100/scale).toFixed(3)}%`;
    grid.style.transform=`scale(${scale.toFixed(4)})`;
  }
}

async function load(){
  try{
    const r=await fetch('/api/menu',{cache:'no-store'});
    if(!r.ok)throw new Error();
    const d=await r.json();
    const cats=d.categories||[];

    const categoryHtml=c=>`<section class="category ${String(c.name||'').toLowerCase().includes('sweet')?'sweet-category':''}"><h2><span class="heading-mark" aria-hidden="true">${categoryIcon(c.name)}</span><span class="heading-label">${esc(c.name)}</span></h2><div class="heading-rule"></div><div class="items">${(c.items||[]).map(i=>`<article class="item ${i.sold_out?'sold':''}"><div class="item-copy"><div class="item-top"><div class="item-price">${money(i.price_cents)}</div><div class="item-name">${esc(i.name)}</div></div>${i.description?`<div class="item-desc">${esc(i.description)}</div>`:''}</div><div class="item-icon" aria-hidden="true">${itemIcon(i.name)}</div>${i.sold_out?'<div class="sold-badge">SOLD OUT</div>':''}</article>`).join('')}</div></section>`;

    if(cats.length){
      const columns=[[],[],[]];
      const used=new Set();
      const findCat=matcher=>cats.find((c,idx)=>!used.has(idx)&&matcher(String(c.name||'').toLowerCase()));
      const take=(matcher,col)=>{
        const c=findCat(matcher); if(!c)return;
        const idx=cats.indexOf(c); used.add(idx); columns[col].push(c);
      };

      take(n=>n.includes('grill'),0);
      take(n=>n.includes('add on'),0);
      take(n=>n.includes('snack'),1);
      take(n=>n.includes('other'),1);
      take(n=>n.includes('drink'),2);
      take(n=>n.includes('sweet'),2);

      cats.forEach((c,idx)=>{
        if(used.has(idx))return;
        const scores=columns.map(col=>col.reduce((sum,x)=>sum+categoryWeight(x),0));
        const target=scores.indexOf(Math.min(...scores));
        columns[target].push(c);
      });

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
