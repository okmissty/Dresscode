// DressCode — Dress Up Game Logic

const dressedItemsEl = document.getElementById('dressed-items');
const characterArea   = document.querySelector('.character-area');
const itemsList       = document.getElementById('items-list');
const itemsTitle      = document.getElementById('items-title');
const menuBtns        = document.querySelectorAll('.menu-btn');
const resetBtn        = document.getElementById('reset-btn');
const characterBase   = document.getElementById('character-base');

const DEFAULT_CHARACTER = 'assets/character.png';

const allItems = [
  { type: 'skin',  src: 'assets/character.png', alt: 'Default skin' },
  { type: 'skin',  src: 'assets/skin1.png',     alt: 'Skin 1' },
  { type: 'skin',  src: 'assets/skin2.png',     alt: 'Skin 2' },
  { type: 'hair',  src: 'assets/hair.png',       alt: 'Hair' },
  { type: 'shirt', src: 'assets/shirt.png',      alt: 'Shirt' },
  { type: 'pants', src: 'assets/pants.png',      alt: 'Pants' },
  { type: 'shoes', src: 'assets/shoes.png',      alt: 'Shoes' },
];

// Which item is currently worn per category, keyed by type
const currentItems = {};

// Which item thumbnail is currently selected in the panel, keyed by category
let activeCategory = null;

// ── Rendering ─────────────────────────────────────────────────────────────────

function renderDressedItems() {
  dressedItemsEl.innerHTML = '';

  characterBase.src = currentItems['skin'] ?? DEFAULT_CHARACTER;

  Object.entries(currentItems).forEach(([type, src]) => {
    if (type === 'skin') return;
    const img = document.createElement('img');
    img.src = src;
    img.alt = type;
    img.className = 'dressed-item';
    // Use 100% so it always matches the character area size
    Object.assign(img.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      pointerEvents: 'none',
    });
    dressedItemsEl.appendChild(img);
  });
}

// ── Item panel ────────────────────────────────────────────────────────────────

function showItems(category) {
  activeCategory = category;
  itemsList.innerHTML = '';
  itemsTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);

  const items = allItems.filter(item => item.type === category);

  items.forEach(item => {
    const wrapper = document.createElement('div');
    wrapper.className = 'item-wrapper';

    const img = document.createElement('img');
    img.className = 'draggable-item';
    img.src = item.src;
    img.alt = item.alt;
    img.draggable = true;
    img.dataset.type = item.type;
    img.dataset.src  = item.src;
    img.title = item.alt;

    // Mark as selected if already worn
    if (currentItems[item.type] === item.src) {
      img.classList.add('selected');
    }

    // Click to equip (no drag required)
    img.addEventListener('click', () => equipItem(item.type, item.src));

    // Drag to equip
    img.addEventListener('dragstart', e => {
      e.dataTransfer.setData('type', item.type);
      e.dataTransfer.setData('src',  item.src);
      e.dataTransfer.effectAllowed = 'copy';
    });

    wrapper.appendChild(img);

    // Small "remove" badge if this item is currently worn
    if (currentItems[item.type] === item.src) {
      const badge = document.createElement('button');
      badge.className = 'remove-badge';
      badge.textContent = '✕';
      badge.title = 'Remove';
      badge.addEventListener('click', e => {
        e.stopPropagation();
        removeItem(item.type);
      });
      wrapper.appendChild(badge);
    }

    itemsList.appendChild(wrapper);
  });
}

function equipItem(type, src) {
  currentItems[type] = src;
  renderDressedItems();
  showItems(type); // refresh panel to update selected states
}

function removeItem(type) {
  delete currentItems[type];
  renderDressedItems();
  if (activeCategory) showItems(activeCategory);
}

// ── Menu buttons ──────────────────────────────────────────────────────────────

menuBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    menuBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    showItems(btn.dataset.category);
  });
});

// Auto-open the first category on load
const firstBtn = document.querySelector('.menu-btn');
if (firstBtn) {
  firstBtn.classList.add('active');
  showItems(firstBtn.dataset.category);
}

// ── Drag & drop onto character ────────────────────────────────────────────────

characterArea.addEventListener('dragover', e => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
  characterArea.classList.add('drag-over');
});

characterArea.addEventListener('dragleave', () => {
  characterArea.classList.remove('drag-over');
});

characterArea.addEventListener('drop', e => {
  e.preventDefault();
  characterArea.classList.remove('drag-over');
  const type = e.dataTransfer.getData('type');
  const src  = e.dataTransfer.getData('src');
  if (type && src) equipItem(type, src);
});

// ── Reset ─────────────────────────────────────────────────────────────────────

resetBtn.addEventListener('click', () => {
  Object.keys(currentItems).forEach(key => delete currentItems[key]);
  renderDressedItems();
  if (activeCategory) showItems(activeCategory);
});