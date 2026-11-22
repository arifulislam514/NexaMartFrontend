import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

/**
 * useCart Hook
 * Provides direct access to global cart state, item quantities, total prices, and cart actions.
 *
 * @returns {{
 *   cart: Object|null,
 *   cartId: string|null,
 *   items: Array<Object>,
 *   itemCount: number,
 *   subtotal: number,
 *   total: number,
 *   loading: boolean,
 *   actionLoading: boolean,
 *   error: string|null,
 *   addToCart: (product: Object, quantity?: number) => Promise<{ success: boolean, requireAuth?: boolean, error?: string }>,
 *   updateQuantity: (itemId: number|string, quantity: number) => Promise<{ success: boolean, error?: string }>,
 *   removeFromCart: (itemId: number|string) => Promise<{ success: boolean, error?: string }>,
 *   clearCart: () => Promise<void>,
 *   refreshCart: () => Promise<Object|null>
 * }}
 */
export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
};

export default useCart;
