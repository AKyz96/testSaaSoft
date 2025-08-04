import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    cartItems: [],
    favoriteItems: [],
    totalItems: 0,
    totalPrice: 0,

  }),
  
  getters: {
    totalItems: (state) => state.cartItems.length,
    totalPrice: (state) => state.cartItems.reduce((total, item) => total + item.price, 0)
  },
  
  actions: {
    addToCart(product, size) {
      
      this.cartItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        size: size,
        image: product.image,
        sizes: product.sizes
      })
    },

    addToFavorite(id, name, price, image) {
      this.favoriteItems.push({
        id: id,
        name: name,
        price: price,
        image: image
      })
      console.log(this.favoriteItems)
    },
    
    removeFromCart(itemId) {
      const index = this.cartItems.findIndex(item => item.id === itemId)
      if (index > -1) {
        this.cartItems.splice(index, 1)
      }
    }
  }
}) 