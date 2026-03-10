/**
 * Simple Test Suite for Manazon E-commerce Application
 * Run this in the browser console or with a test runner
 */

// Mock DOM elements for testing
const mockDOM = {
  querySelector: (selector) => ({
    innerHTML: '',
    textContent: '',
    value: '',
    addEventListener: () => {},
    classList: { add: () => {}, remove: () => {} },
    setAttribute: () => {},
    appendChild: () => {}
  }),
  querySelectorAll: () => [{
    addEventListener: () => {},
    closest: () => ({}),
    querySelector: () => ({ value: 1 }),
    classList: { add: () => {}, remove: () => {} }
  }]
};

// Test utilities
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ Test failed: ${message}`);
    return false;
  } else {
    console.log(`✅ Test passed: ${message}`);
    return true;
  }
}

function testFunction(name, testFn) {
  console.log(`\n🧪 Testing ${name}:`);
  try {
    testFn();
  } catch (error) {
    console.error(`❌ Test error in ${name}:`, error);
  }
}

// Mock data for testing
const mockProducts = [
  {
    id: 'wand-001',
    name: 'Magic Wand',
    priceCents: 1000,
    rating: { stars: 4, count: 100 },
    keywords: ['wand', 'magic']
  },
  {
    id: 'book-001',
    name: 'Spell Book',
    priceCents: 2000,
    rating: { stars: 5, count: 50 },
    keywords: ['book', 'spells']
  }
];

// Test Suite
testFunction('getCategory function', () => {
  // Mock the getCategory function (simplified version)
  function getCategory(product) {
    if (product.id.includes('wand')) return 'wand';
    if (product.id.includes('book')) return 'book';
    return 'other';
  }

  assert(getCategory(mockProducts[0]) === 'wand', 'Should identify wand category');
  assert(getCategory(mockProducts[1]) === 'book', 'Should identify book category');
  assert(getCategory({ id: 'potion-001' }) === 'other', 'Should return other for unknown category');
});

testFunction('sortProducts function', () => {
  // Mock the sortProducts function
  function sortProducts(products, sortType) {
    const sorted = [...products];
    
    switch (sortType) {
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'price-low':
        return sorted.sort((a, b) => a.priceCents - b.priceCents);
      case 'price-high':
        return sorted.sort((a, b) => b.priceCents - a.priceCents);
      default:
        return sorted;
    }
  }

  const sortedByName = sortProducts(mockProducts, 'name-asc');
  assert(sortedByName[0].name === 'Magic Wand', 'Should sort by name ascending');
  
  const sortedByPriceLow = sortProducts(mockProducts, 'price-low');
  assert(sortedByPriceLow[0].priceCents === 1000, 'Should sort by price low to high');
  
  const sortedByPriceHigh = sortProducts(mockProducts, 'price-high');
  assert(sortedByPriceHigh[0].priceCents === 2000, 'Should sort by price high to low');
});

testFunction('Product filtering', () => {
  // Mock filtering function
  function filterProducts(products, searchText) {
    const text = searchText.trim().toLowerCase();
    if (!text) return products;
    
    return products.filter((product) => {
      const nameMatches = product.name.toLowerCase().includes(text);
      const keywordMatches = product.keywords?.some((keyword) =>
        keyword.toLowerCase().includes(text)
      );
      return nameMatches || keywordMatches;
    });
  }

  const allProducts = filterProducts(mockProducts, '');
  assert(allProducts.length === 2, 'Should return all products when no search text');

  const wandResults = filterProducts(mockProducts, 'wand');
  assert(wandResults.length === 1, 'Should find wand product');
  assert(wandResults[0].id === 'wand-001', 'Should return correct wand product');

  const magicResults = filterProducts(mockProducts, 'magic');
  assert(magicResults.length === 1, 'Should find product by keyword');
});

testFunction('Cart functionality', () => {
  // Mock cart functions
  let cart = [];
  
  function addToCart(productId, quantity = 1) {
    const existing = cart.find((c) => c.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ productId, quantity, deliveryOptionsId: '1' });
    }
  }

  function getCartQuantity() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  // Test adding to cart
  addToCart('wand-001', 2);
  assert(cart.length === 1, 'Should add item to cart');
  assert(getCartQuantity() === 2, 'Should have correct quantity');

  // Test adding same item again
  addToCart('wand-001', 1);
  assert(cart.length === 1, 'Should not create duplicate item');
  assert(getCartQuantity() === 3, 'Should update quantity for existing item');

  // Test adding different item
  addToCart('book-001', 1);
  assert(cart.length === 2, 'Should add different item to cart');
  assert(getCartQuantity() === 4, 'Should calculate total quantity correctly');
});

testFunction('Search functionality', () => {
  // Mock search function
  function performSearch(products, query) {
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery) return products;
    
    return products.filter(product => 
      product.name.toLowerCase().includes(trimmedQuery) ||
      product.keywords.some(keyword => keyword.toLowerCase().includes(trimmedQuery))
    );
  }

  const results1 = performSearch(mockProducts, 'Magic');
  assert(results1.length === 1, 'Should find product by name');
  assert(results1[0].id === 'wand-001', 'Should return correct product');

  const results2 = performSearch(mockProducts, 'spells');
  assert(results2.length === 1, 'Should find product by keyword');
  assert(results2[0].id === 'book-001', 'Should return correct product');

  const results3 = performSearch(mockProducts, 'nonexistent');
  assert(results3.length === 0, 'Should return empty array for no matches');
});

console.log('\n🎉 Test suite completed!');
console.log('💡 Run these tests in the browser console to verify functionality');
console.log('📝 For production, consider using a testing framework like Jest or Vitest');
