// Dress Up Game Logic
const dressedItems = document.getElementById('dressed-items');
const characterArea = document.querySelector('.character-area');
const itemsList = document.getElementById('items-list');
const itemsTitle = document.getElementById('items-title');
const menuBtns = document.querySelectorAll('.menu-btn');
const resetBtn = document.getElementById('reset-btn');

const allItems = [
  { type: 'skin', src: 'assets/skin/character.png', alt: 'Skin' },
  { type: 'hair', src: 'assets/hair/hair.png', alt: 'Hair' },
  { type: 'shirt', src: 'assets/shirts/shirt.png', alt: 'Shirt' },
  { type: 'pants', src: 'assets/bottoms/pants.png', alt: 'Pants' },
  { type: 'shoes', src: 'assets/shoes/shoes.png', alt: 'Shoes' },
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
    img.addEventListener('dragstart', e => {
      e.dataTransfer.setData('type', item.type);
    });
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
  const item = allItems.find(i => i.type === type);
  if (type && item) {
    currentItems[type] = item.src;
    renderDressedItems();
  }
});

function renderDressedItems() {
  dressedItems.innerHTML = '';
  Object.entries(currentItems).forEach(([type, src]) => {
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