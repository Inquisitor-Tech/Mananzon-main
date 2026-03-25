/**
 * Manazon - Main Product Grid Module
 * Handles product display, search, filtering, sorting, and cart functionality
 */

import { updateCartQuantity } from '../data/cart.js';
import { formatMoney } from './utils/money.js';
import apiService from './api.js';

// Global state management
let searchText = '';
let searchTimeout;
let currentSort = 'name-asc';
let currentCategory = 'all';
let allProducts = [];
let isLoading = false;

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
  return product.category || 'other';
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
  let filtered = allProducts;

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
 * Load products from API
 */
async function loadProducts() {
  if (isLoading) return;
  
  isLoading = true;
  try {
    const response = await apiService.getProducts({
      limit: 100, // Get all products for client-side filtering
      sort: currentSort,
      category: currentCategory === 'all' ? undefined : currentCategory,
      search: searchText || undefined
    });

    if (response.success) {
      allProducts = response.data.products;
      renderProducts();
    }
  } catch (error) {
    console.error('Error loading products:', error);
    showError('Failed to load products. Please try again.');
  } finally {
    isLoading = false;
  }
}

/**
 * Show error message to user
 */
function showError(message) {
  const grid = document.querySelector('.js-product-grid');
  grid.innerHTML = `
    <div class="error-message" style="grid-column: 1 / -1; padding: 40px; text-align: center; color: red;">
      <div style="font-size: 18px; margin-bottom: 10px;">${message}</div>
      <button onclick="loadProducts()" class="button-primary" style="margin-top: 10px;">Retry</button>
    </div>
  `;
}

/**
 * Render products to the grid with loading states and error handling
 */
function renderProducts() {
  const grid = document.querySelector('.js-product-grid');
  
  if (isLoading) {
    grid.innerHTML = `
      <div class="loading-state" style="grid-column: 1 / -1; padding: 40px; text-align: center;">
        <div style="font-size: 18px; color: #666;">Loading magical items...</div>
      </div>
    `;
    return;
  }

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
            <img class="product-image" src="${product.images[0]?.url || 'images/products/placeholder.jpg'}" alt="${product.name}" 
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

        <div class="product-price" aria-label="Price: ${product.formattedPrice}">${product.formattedPrice}</div>

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
        
        // Add to cart via API
        await apiService.addToCart(productId, qty);
        
        // Update cart quantity display
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
  loadProducts();
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
    loadProducts();
  });

  searchInput.addEventListener('input', debouncedSearch);

  // Sort and category change handlers
  sortSelect.addEventListener('change', (event) => {
    currentSort = event.target.value;
    loadProducts();
  });

  categorySelect.addEventListener('change', (event) => {
    currentCategory = event.target.value;
    loadProducts();
  });
}

// Initialize the application
loadProducts();
wireSearchEvents();
updateCartQuantity();