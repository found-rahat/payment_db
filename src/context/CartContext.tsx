"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import toast from "react-hot-toast";

interface CartItem {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string | null;
  category: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  itemCount: number;
  total: number;
}

interface CartAction {
  type: string;
  payload?: any;
}

const initialState: CartState = {
  items: [],
  itemCount: 0,
  total: 0,
};

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
}>({
  state: initialState,
  dispatch: () => {},
});

// Cart Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "INITIALIZE_CART": {
      const items = action.payload;
      const itemCount = items.reduce(
        (count: number, item: CartItem) => count + item.quantity,
        0
      );
      const total = items.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.quantity,
        0
      );

      return {
        ...state,
        items,
        itemCount,
        total,
      };
    }

    case "ADD_ITEM": {
      const newItem = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === newItem.id
      );

      let updatedItems;
      if (existingItemIndex !== -1) {
        updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedItems = [...state.items, { ...newItem, quantity: 1 }];
      }

      const itemCount = updatedItems.reduce(
        (count: number, item: CartItem) => count + item.quantity,
        0
      );
      const total = updatedItems.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.quantity,
        0
      );

      // Save to localStorage
      localStorage.setItem("cart", JSON.stringify(updatedItems));

      return {
        ...state,
        items: updatedItems,
        itemCount,
        total,
      };
    }

    case "ADD_ITEM_BUY_NOW": {
      const newItem = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === newItem.id
      );

      let updatedItems;
      if (existingItemIndex !== -1) {
        updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedItems = [...state.items, { ...newItem, quantity: 1 }];
      }

      const itemCount = updatedItems.reduce(
        (count: number, item: CartItem) => count + item.quantity,
        0
      );
      const total = updatedItems.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.quantity,
        0
      );

      // Save to localStorage
      localStorage.setItem("cart", JSON.stringify(updatedItems));

      return {
        ...state,
        items: updatedItems,
        itemCount,
        total,
      };
    }

    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload;
      if (quantity < 1) return state; // Don't allow quantities less than 1

      const updatedItems = state.items
        .map((item) => (item.id === id ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0); // Remove items with 0 quantity

      const itemCount = updatedItems.reduce(
        (count: number, item: CartItem) => count + item.quantity,
        0
      );
      const total = updatedItems.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.quantity,
        0
      );

      // Save to localStorage
      localStorage.setItem("cart", JSON.stringify(updatedItems));

      return {
        ...state,
        items: updatedItems,
        itemCount,
        total,
      };
    }

    case "REMOVE_ITEM": {
      const id = action.payload;
      const itemToRemove = state.items.find((item) => item.id === id);
      const updatedItems = state.items.filter((item) => item.id !== id);

      const itemCount = updatedItems.reduce(
        (count: number, item: CartItem) => count + item.quantity,
        0
      );
      const total = updatedItems.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.quantity,
        0
      );



      // Save to localStorage
      localStorage.setItem("cart", JSON.stringify(updatedItems));

      return {
        ...state,
        items: updatedItems,
        itemCount,
        total,
      };
    }

    case "CLEAR_CART": {
      localStorage.removeItem("cart");
      return {
        ...state,
        items: [],
        itemCount: 0,
        total: 0,
      };
    }

    default:
      return state;
  }
};

// Custom hook to handle notifications based on cart state changes
const useCartNotifications = (state: CartState, dispatch: React.Dispatch<CartAction>) => {
  const prevItemsRef = React.useRef(state.items);
  const prevItemCountRef = React.useRef(state.itemCount);
  const hasInitializedRef = React.useRef(false);

  React.useEffect(() => {
    // Skip notification on initial load
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      prevItemsRef.current = state.items;
      prevItemCountRef.current = state.itemCount;
      return;
    }

    const prevItems = prevItemsRef.current;
    const prevItemCount = prevItemCountRef.current;
    
    // Check if items were added (current has more items than previous)
    if (state.itemCount > prevItemCount) {
      // Find the new item that was added
      const currentIds = new Set(state.items.map(item => item.id));
      const prevIds = new Set(prevItems.map(item => item.id));
      
      // Look for items that are in current but not in previous
      for (const currentItem of state.items) {
        if (!prevIds.has(currentItem.id)) {
          // This is a newly added item
          toast.success(`${currentItem.name} added to cart!`);
          break;
        }
      }
      
      // Check if quantity of existing item was increased
      if (state.items.length === prevItems.length) {
        const addedItem = state.items.find(item => {
          const prevItem = prevItems.find(p => p.id === item.id);
          return prevItem && item.quantity > prevItem.quantity;
        });
        if (addedItem) {
          toast.success(`Updated ${addedItem.name} quantity in cart!`);
        }
      }
    }
    
    // Check if items were removed
    if (state.itemCount < prevItemCount) {
      const currentIds = new Set(state.items.map(item => item.id));
      const prevIds = new Set(prevItems.map(item => item.id));
      
      // Find item that was removed
      for (const prevItem of prevItems) {
        if (!currentIds.has(prevItem.id)) {
          toast.success(`${prevItem.name} removed from cart!`);
          break;
        }
        
        // Check if quantity decreased
        const currentItem = state.items.find(item => item.id === prevItem.id);
        if (currentItem && currentItem.quantity < prevItem.quantity) {
          if (currentItem.quantity === 0) {
            toast.success(`${prevItem.name} removed from cart!`);
          } else {
            toast.success(`Updated ${prevItem.name} quantity in cart!`);
          }
        }
      }
    }
    
    // Check if cart was cleared
    if (prevItems.length > 0 && state.items.length === 0) {
      toast.success("Cart cleared!");
    }
    
    // Update refs for next render
    prevItemsRef.current = state.items;
    prevItemCountRef.current = state.itemCount;
  }, [state]);
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  
  // Use the custom notification hook
  useCartNotifications(state, dispatch);

  // Initialize cart from localStorage on mount
  React.useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      const items = JSON.parse(storedCart);
      dispatch({ type: "INITIALIZE_CART", payload: items });
    }
  }, []);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
