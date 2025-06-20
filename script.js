// Dress Up Game Logic
const dressedItems = document.getElementById('dressed-items');
const characterArea = document.querySelector('.character-area');
const itemsList = document.getElementById('items-list');
const itemsTitle = document.getElementById('items-title');
const menuBtns = document.querySelectorAll('.menu-btn');
const resetBtn = document.getElementById('reset-btn');

const allItems = [
  { type: 'skin', src: 'assets/character.png', alt: 'Skin' },
  { type: 'skin', src: 'assets/skin1.png', alt: 'Skin' },
  { type: 'skin', src: 'assets/skin2.png', alt: 'Skin' },
  { type: 'hair', src: 'assets/hair.png', alt: 'Hair' },
  { type: 'shirt', src: 'assets/shirt.png', alt: 'Shirt' },
  { type: 'pants', src: 'assets/pants.png', alt: 'Pants' },
  { type: 'shoes', src: 'assets/shoes.png', alt: 'Shoes' },
  // Add more items as needed
];

// Track which items are currently on the character
const currentItems = {};

function showItems(category) {
  itemsList.innerHTML = '';
  itemsTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);
  allItems.filter(item => item.type === category).forEach(item => {
    const img = document.createElement('img');
    img.className = 'draggable-item';
    img.src = item.src;
    img.alt = item.alt;
    img.draggable = true;
    img.dataset.type = item.type;
    // Store the actual item src for skin
    img.addEventListener('dragstart', e => {
      e.dataTransfer.setData('type', item.type);
      e.dataTransfer.setData('src', item.src);
    });
    // Allow click to select skin as well
    if (item.type === 'skin') {
      img.addEventListener('click', () => {
        currentItems['skin'] = item.src;
        renderDressedItems();
      });
    }
    itemsList.appendChild(img);
  });
}

menuBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    menuBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    showItems(btn.dataset.category);
  });
});

// Show the first category by default
if (document.querySelector('.menu-btn[data-category=\"skin\"]')) {
  document.querySelector('.menu-btn[data-category=\"skin\"]').click();
}

characterArea.addEventListener('dragover', e => {
  e.preventDefault();
});

characterArea.addEventListener('drop', e => {
  e.preventDefault();
  const type = e.dataTransfer.getData('type');
  let src = e.dataTransfer.getData('src');
  const item = allItems.find(i => i.type === type && (!src || i.src === src));
  if (type && item) {
    currentItems[type] = item.src;
    renderDressedItems();
  }
});

function renderDressedItems() {
  dressedItems.innerHTML = '';
  // Handle skin (base character) separately
  if (currentItems['skin']) {
    document.getElementById('character-base').src = currentItems['skin'];
  } else {
    document.getElementById('character-base').src = 'assets/character.png';
  }
  // Render other dressed items (not skin)
  Object.entries(currentItems).forEach(([type, src]) => {
    if (type === 'skin') return;
    const img = document.createElement('img');
    img.src = src;
    img.alt = type;
    img.className = 'dressed-item';
    img.style.position = 'absolute';
    img.style.top = '0px';
    img.style.left = '0px';
    img.style.width = '400px';
    img.style.pointerEvents = 'none';
    dressedItems.appendChild(img);
  });
}

resetBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to remove all items?')) {
    Object.keys(currentItems).forEach(key => delete currentItems[key]);
    renderDressedItems();
  }
});