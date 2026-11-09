/* ===== EDIT HERE ===== */
const SHOP = {
  mapLink:  'https://maps.app.goo.gl/apWe1pZ33tqqvjPx9',
  facebook: 'https://www.facebook.com/profile.php?id=61594351956609',
  timezone: 'Asia/Manila',
  open:  17,   // 5 PM  (24-hour)
  close: 24    // 12 AM (midnight)
};

/* prices: one number per size. sizes: label for each price. */
const DRINK_GROUPS = [
  [
    { id:'iced-latte',     name:'Iced Latte',      img:'iced-latte.jpg',     sizes:['12oz','16oz'], prices:[49,59] },
    { id:'salted-caramel', name:'Salted Caramel',  img:'salted-caramel.jpg', sizes:['12oz','16oz'], prices:[69,79] },
    { id:'mocha',          name:'Mocha',           img:'mocha.jpg',          sizes:['12oz','16oz'], prices:[69,79] }
  ],
  [
    { id:'dark-choco',  name:'Dark Choco',      img:'dark-choco.jpg',  sizes:['12oz','16oz'], prices:[45,55] },
    { id:'oreo-choco',  name:'Oreo Choco',      img:'oreo-choco.jpg',  sizes:['12oz','16oz'], prices:[59,69] },
    { id:'oreo-cream',  name:'Oreo C\u2019n Cream', img:'oreo-cream.jpg', sizes:['12oz'],        prices:[59] }
  ],
  [
    { id:'black-coffee',  name:'Black Coffee',  img:'black-coffee.jpg',  sizes:['16oz'], prices:[45] },
    { id:'coffee-matcha', name:'Coffee Matcha', img:'coffee-matcha.jpg', sizes:['16oz'], prices:[79] },
    { id:'milky-matcha',  name:'Milky Matcha',  img:'milky-matcha.jpg',  sizes:['16oz'], prices:[69] }
  ]
];

const FOODS = [
  { id:'siomai', name:'Siomai', emoji:'\u{1F95F}', price:6,  unit:'each' },
  { id:'siopao', name:'Siopao', emoji:'\u{1F35E}', price:15, unit:'each' }
];
/* ===================== */

const $  = (s, r=document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const peso = n => '\u20B1' + Number(n||0).toLocaleString('en-PH');
const tray = [];   // { key, name, size, price, qty }

const squig = side => `<svg class="squig ${side}" viewBox="0 0 110 40" aria-hidden="true"><path d="M8 24 C20 4 32 4 44 20 S68 36 80 18 S98 8 104 16" fill="none" stroke="#F5D2AE" stroke-width="14" stroke-linecap="round"/></svg>`;

function sizeBtn(id, name, size, price){
  return `<button class="sz" type="button" data-add="${esc(id)}|${esc(name)}|${esc(size)}|${price}" aria-label="Add ${esc(name)} ${esc(size)} for ${price} pesos">${esc(size)} <span>${peso(price)}</span></button>`;
}

function renderMenu(){
  $('#drinkGroups').innerHTML = DRINK_GROUPS.map(g => `
    <div class="panel">${squig('l')}${squig('r')}
      <div class="grid">${g.map(d => `
        <article class="drink">
          <div class="ph"><img src="${d.img}" alt="${esc(d.name)}" loading="lazy" width="320" height="400"></div>
          <h3>${esc(d.name)}</h3>
          <div class="sizes">${d.sizes.map((s,i) => sizeBtn(d.id, d.name, s, d.prices[i])).join('')}</div>
        </article>`).join('')}
      </div>
    </div>`).join('');

  $('#foodList').innerHTML = FOODS.map(f => `
    <article class="food">
      <div class="emoji" aria-hidden="true">${f.emoji}</div>
      <h3>${esc(f.name)}</h3>
      <div class="price">${peso(f.price)} ${esc(f.unit)}</div>
      <button class="sz" type="button" data-add="${esc(f.id)}|${esc(f.name)}||${f.price}" aria-label="Add ${esc(f.name)}">Add</button>
    </article>`).join('');
}

function toast(msg){
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 1400);
}

function renderTray(){
  const total = tray.reduce((s,l) => s + l.price*l.qty, 0);
  const count = tray.reduce((s,l) => s + l.qty, 0);
  $('#trayList').innerHTML = tray.length ? tray.map((l,i) => `
    <li><div><strong>${esc(l.name)}</strong><span class="muted">${esc(l.size || peso(l.price)+' each')}</span></div>
      <div class="qty"><button type="button" data-dec="${i}" aria-label="Remove one ${esc(l.name)}">\u2212</button><span>${l.qty}</span><button type="button" data-inc="${i}" aria-label="Add one ${esc(l.name)}">+</button></div>
      <span class="lp">${peso(l.price*l.qty)}</span></li>`).join('')
    : '<li class="empty">Nothing yet. Tap a size or Add on any item.</li>';
  $('#trayTotal').textContent = peso(total);
  $('#clearTray').hidden = !tray.length;
  const pill = $('#cartPill');
  pill.hidden = !count;
  $('#pillText').textContent = `View order (${count})`;
  $('#pillTotal').textContent = peso(total);
  if (!count && $('#tray').open) $('#tray').close();
}

document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.add){
    const [id, name, size, price] = b.dataset.add.split('|');
    const key = id + size;
    const f = tray.find(l => l.key === key);
    f ? f.qty++ : tray.push({ key, name, size, price:Number(price), qty:1 });
    renderTray(); toast(`${name}${size ? ' '+size : ''} added`);
  } else if (b.dataset.inc){ tray[+b.dataset.inc].qty++; renderTray(); }
  else if (b.dataset.dec){ const i = +b.dataset.dec; if (--tray[i].qty <= 0) tray.splice(i,1); renderTray(); }
  else if (b.id === 'clearTray'){ tray.length = 0; renderTray(); $('#tray').close(); }
  else if (b.id === 'cartPill'){ $('#tray').showModal(); }
  else if (b.id === 'closeTray'){ $('#tray').close(); }
});
$('#tray').addEventListener('click', e => { if (e.target === e.currentTarget) e.currentTarget.close(); });

/* links */
['#dirTop','#mapBtn'].forEach(s => $(s).href = SHOP.mapLink);
$('#fbBtn').href = SHOP.facebook;

/* hours + open now, using the shop's time zone */
(function(){
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: SHOP.timezone, weekday:'long', hour:'numeric', minute:'numeric', hour12:false });
  const p = Object.fromEntries(fmt.formatToParts(new Date()).map(x => [x.type, x.value]));
  const nowH = (Number(p.hour) % 24) + Number(p.minute)/60;
  const today = p.weekday;
  const order = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  $('#hours').innerHTML = order.map(d =>
    `<tr class="${d === today ? 'today' : ''}"><th scope="row">${d}</th><td>5:00 PM \u2013 12:00 AM</td></tr>`).join('');
  const isOpen = nowH >= SHOP.open && nowH < SHOP.close;
  const st = $('#status');
  st.textContent = isOpen ? 'Open now until 12:00 AM' : 'Closed now \u00B7 opens at 5:00 PM';
  st.classList.toggle('open', isOpen); st.hidden = false;
})();

$('#yr').textContent = new Date().getFullYear();
renderMenu(); renderTray();
