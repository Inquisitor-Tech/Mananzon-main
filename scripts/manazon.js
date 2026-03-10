/**
 * Manazon - Main Product Grid Module
 * Handles product display, search, filtering, sorting, and cart functionality
 */

import { addToCart, updateCartQuantity } from '../data/cart.js';
import { products } from '../data/products.js';
import { formatMoney } from './utils/money.js';

// Global state management
let searchText = '';
let searchTimeout;
let currentSort = 'name-asc';
let currentCategory = 'all';

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} callback - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounceSearch(callback, delay = 300) {
  return (...args) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => callback(...args), delay);
  };
}

/**
 * Determine product category based on product properties
 * @param {Object} product - Product object
 * @returns {string} Category name
 */
function getCategory(product) {
  if (product.id.includes('wand')) return 'wand';
  if (product.id.includes('book')) return 'book';
  if (product.type === 'clothing') return 'clothing';
  if (product.keywords?.includes('plant') || product.keywords?.includes('ingredient')) return 'ingredient';
  if (product.keywords?.includes('dragon') || product.keywords?.includes('creature')) return 'creature';
  return 'other';
}

/**
 * Sort products based on selected sort criteria
 * @param {Array} products - Array of products to sort
 * @param {string} sortType - Sort type (name-asc, name-desc, price-low, price-high, rating)
 * @returns {Array} Sorted products array
 */
function sortProducts(products, sortType) {
  const sorted = [...products];
  
  switch (sortType) {
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'price-low':
      return sorted.sort((a, b) => a.priceCents - b.priceCents);
    case 'price-high':
      return sorted.sort((a, b) => b.priceCents - a.priceCents);
    case 'rating':
      return sorted.sort((a, b) => b.rating.stars - a.rating.stars);
    default:
      return sorted;
  }
}

/**
 * Filter products based on search text, category, and sort criteria
 * @returns {Array} Filtered and sorted products
 */
function getFilteredProducts() {
  const text = searchText.trim().toLowerCase();
  let filtered = products;

  // Filter by search text
  if (text) {
    filtered = filtered.filter((product) => {
      const nameMatches = product.name.toLowerCase().includes(text);
      const keywordMatches = product.keywords?.some((keyword) =>
        keyword.toLowerCase().includes(text)
      );
      return nameMatches || keywordMatches;
    });
  }

  // Filter by category
  if (currentCategory !== 'all') {
    filtered = filtered.filter(product => getCategory(product) === currentCategory);
  }

  // Apply sorting
  return sortProducts(filtered, currentSort);
}

/**
 * Render products to the grid with loading states and error handling
 */
function renderProducts() {
  const grid = document.querySelector('.js-product-grid');
  
  // Show loading state
  grid.innerHTML = `
    <div class="loading-state" style="grid-column: 1 / -1; padding: 40px; text-align: center;">
      <div style="font-size: 18px; color: #666;">Loading magical items...</div>
    </div>
  `;

  // Simulate loading for better UX (remove this in production)
  setTimeout(() => {
    const filteredProducts = getFilteredProducts();

    if (filteredProducts.length === 0) {
      grid.innerHTML = `
        <div class="no-results-message" style="grid-column: 1 / -1; padding: 40px; text-align: center;">
          <div style="font-size: 18px; margin-bottom: 10px;">
            No magical items matched "<strong>${searchText}</strong>".
          </div>
          <div style="color: #666; font-size: 14px;">
            Try searching for wands, spell books, or dragon eggs
          </div>
        </div>
      `;
      return;
    }

    let html = '';

    filteredProducts.forEach((product) => {
      html += `
        <div class="product-container" data-product-id="${product.id}">
          <div class="product-image-container">
            <a href="product-detail.html?id=${product.id}" class="product-link" aria-label="View details for ${product.name}">
              <img class="product-image" src="${product.image}" alt="${product.name}" 
                   onerror="this.src='images/products/placeholder.jpg'" />
            </a>
          </div>

          <div class="product-name limit-text-to-2-lines">
            <h3><a href="product-detail.html?id=${product.id}" class="product-link" style="text-decoration: none; color: inherit;">${product.name}</a></h3>
          </div>

          <div class="product-rating-container" role="img" aria-label="Rating: ${product.rating.stars} stars out of 5, based on ${product.rating.count} reviews">
            <img
              class="product-rating-stars"
              src="images/ratings/rating-${product.rating.stars * 10}.png"
              alt=""
              onerror="this.style.display='none'"
            />
            <div class="product-rating-count link-primary">${product.rating.count}</div>
          </div>

          <div class="product-price" aria-label="Price: $${formatMoney(product.priceCents)}">$${formatMoney(product.priceCents)}</div>

          <div class="product-quantity-container">
            <label for="qty-${product.id}" class="sr-only">Quantity</label>
            <select class="js-qty" id="qty-${product.id}" aria-label="Quantity for ${product.name}">
              ${Array.from({ length: 10 }, (_, i) => i + 1)
                .map((n) => `<option value="${n}" ${n === 1 ? 'selected' : ''}>${n}</option>`)
                .join('')}
            </select>
          </div>

          <div class="product-spacer"></div>

          <div class="added-to-cart js-added" aria-live="polite">
            <img src="images/icons/checkmark.png" alt="" />
            Added
          </div>

          <button
            class="add-to-cart-button button-primary js-add-to-cart"
            data-product-id="${product.id}"
            aria-label="Add ${product.name} to cart">
            Add to Cart
          </button>
        </div>
      `;
    });

    grid.innerHTML = html;
    wireProductEvents();
  }, 300);
}

/**
 * Wire up event handlers for product interactions
 */
function wireProductEvents() {
  document.querySelectorAll('.js-add-to-cart').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const container = btn.closest('.product-container');
      const productId = btn.dataset.productId;
      const qty = Number(container.querySelector('.js-qty').value) || 1;

      try {
        // Disable button temporarily to prevent double-clicks
        btn.disabled = true;
        btn.textContent = 'Adding...';
        
        addToCart(productId, qty);
        updateCartQuantity();

        const added = container.querySelector('.js-added');
        added.classList.add('visible');
        setTimeout(() => added.classList.remove('visible'), 1200);
        
      } catch (error) {
        console.error('Failed to add item to cart:', error);
        // Show error message to user
        const errorMsg = document.createElement('div');
        errorMsg.textContent = 'Failed to add item to cart. Please try again.';
        errorMsg.style.cssText = 'color: red; font-size: 12px; margin-top: 5px;';
        container.appendChild(errorMsg);
        setTimeout(() => errorMsg.remove(), 3000);
      } finally {
        // Re-enable button
        btn.disabled = false;
        btn.textContent = 'Add to Cart';
      }
    });

    // Add keyboard support
    btn.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        btn.click();
      }
    });
  });

  // Add keyboard navigation to product containers
  document.querySelectorAll('.product-container').forEach((container) => {
    container.setAttribute('tabindex', '0');
    container.setAttribute('role', 'article');
    container.setAttribute('aria-label', `Product: ${container.querySelector('h3').textContent}`);
    
    container.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        const addToCartBtn = container.querySelector('.js-add-to-cart');
        addToCartBtn.focus();
        addToCartBtn.click();
      }
    });
  });
}

/**
 * Trigger search with current search input value
 */
function runSearch() {
  const input = document.querySelector('.search-bar');
  searchText = input.value;
  renderProducts();
}

/**
 * Wire up search, sort, and filter event handlers
 */
function wireSearchEvents() {
  const searchInput = document.querySelector('.search-bar');
  const searchButton = document.querySelector('.search-button');
  const sortSelect = document.getElementById('sort-select');
  const categorySelect = document.getElementById('category-select');

  searchButton.addEventListener('click', runSearch);

  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      runSearch();
    }
  });

  // Debounced search for better performance
  const debouncedSearch = debounceSearch(() => {
    searchText = searchInput.value;
    renderProducts();
  });

  searchInput.addEventListener('input', debouncedSearch);

  // Sort and category change handlers
  sortSelect.addEventListener('change', (event) => {
    currentSort = event.target.value;
    renderProducts();
  });

  categorySelect.addEventListener('change', (event) => {
    currentCategory = event.target.value;
    renderProducts();
  });
}

// Initialize the application
renderProducts();
wireSearchEvents();
updateCartQuantity();