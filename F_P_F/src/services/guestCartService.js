// Guest Cart Service - handles cart for non-authenticated users
class GuestCartService {
  constructor() {
    this.storageKey = 'guest_cart';
  }

  // Get cart from localStorage
  getCart() {
    try {
      const cart = localStorage.getItem(this.storageKey);
      return cart ? JSON.parse(cart) : { items: [], is_guest: true };
    } catch (error) {
      console.error('Error parsing guest cart:', error);
      return { items: [], is_guest: true };
    }
  }

  // Save cart to localStorage
  saveCart(cart) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(cart));
      // Dispatch custom event to notify components of cart changes
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
      return true;
    } catch (error) {
      console.error('Error saving guest cart:', error);
      return false;
    }
  }

  // Add item to cart
  addItem(product, quantity = 1) {
    const cart = this.getCart();
    const existingItem = cart.items.find(item => item.product_id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        id: Date.now(), // Temporary ID for guest cart
        product_id: product.id,
        product: product,
        quantity: quantity
      });
    }

    this.saveCart(cart);
    return cart;
  }

  // Update item quantity
  updateQuantity(itemId, quantity) {
    const cart = this.getCart();
    const item = cart.items.find(item => item.id === itemId);

    if (item) {
      if (quantity <= 0) {
        cart.items = cart.items.filter(item => item.id !== itemId);
      } else {
        item.quantity = quantity;
      }
    }

    this.saveCart(cart);
    return cart;
  }

  // Remove item from cart
  removeItem(itemId) {
    const cart = this.getCart();
    cart.items = cart.items.filter(item => item.id !== itemId);
    this.saveCart(cart);
    return cart;
  }

  // Clear cart
  clearCart() {
    localStorage.removeItem(this.storageKey);
    return { items: [], is_guest: true };
  }

  // Get cart totals
  getTotals() {
    const cart = this.getCart();
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + (item.product?.discount_price || item.product?.price || 0) * item.quantity;
    }, 0);
    
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    return { subtotal, tax, total };
  }
}

export default new GuestCartService();
