document.addEventListener('DOMContentLoaded', function() {
  // Dress Up Game Logic
  const dressedItems = document.getElementById('dressed-items');
  const characterArea = document.querySelector('.character-area');
  const items = document.querySelectorAll('.draggable-item');

  const itemImages = {
    shirt: 'assets/shirts/shirt.png',
    pants: 'assets/bottoms/pants.png',
    hair: 'assets/hair/hair.png',
    shoes: 'assets/shoes/shoes.png',
  };

  // Track which items are currently on the character
  const currentItems = {};

  items.forEach(item => {
    item.addEventListener('dragstart', e => {
      e.dataTransfer.setData('type', item.dataset.type);
    });
  });

  characterArea.addEventListener('dragover', e => {
    e.preventDefault();
  });

  characterArea.addEventListener('drop', e => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type');
    if (type && itemImages[type]) {
      currentItems[type] = itemImages[type];
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

  // Add event listener for reset button
  const resetBtn = document.getElementById('reset-btn');

  // Remove inline resetBtn styles (handled in CSS)
  resetBtn.style.position = '';
  resetBtn.style.top = '';
  resetBtn.style.right = '';
  resetBtn.style.left = '';
  resetBtn.style.bottom = '';
  resetBtn.style.transform = '';
  resetBtn.style.margin = '';

  resetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to remove all items?')) {
      Object.keys(currentItems).forEach(key => delete currentItems[key]);
      renderDressedItems();
    }
  });
});
