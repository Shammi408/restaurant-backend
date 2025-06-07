<template>
  <nav class="navbar">
    <div class="text-xl font-bold text-green-600">
      Restaurant System
    </div>

    <!-- Desktop Menu -->
    <ul class="md:flex space-x-4 text-gray-700 font-medium" style="display: flex !important;">
      <li><RouterLink to="/" exact >View Menu</RouterLink></li>
      <li v-if="hasRole('admin', 'superadmin')"><RouterLink to="/add">Add Menu Item</RouterLink></li>
      <li><RouterLink to="/order">Place Order</RouterLink></li>
      <li v-if="isLoggedIn()"><RouterLink to="/orderList">{{ hasRole('user') === 'user' ? 'My Orders' : 'View Orders' }}</RouterLink></li>
      <li v-if="hasRole('admin', 'superadmin')"><RouterLink to="/dashboard">Dashboard</RouterLink></li>
      <li v-if="!isLoggedIn()"><RouterLink to="/register">Register</RouterLink></li>
      <li v-if="!isLoggedIn()"><RouterLink to="/login">Login</RouterLink></li>
      <li v-if="isLoggedIn()"><button @click="$emit('logout')" class="text-red-600 hover:underline">Logout</button></li>
      <li v-if="hasRole('superadmin')"><RouterLink to="/admin/create-restaurant">Add Restaurant</RouterLink></li>
    </ul>

    <!-- Mobile Menu Button -->
    <button class="md:hidden" @click="isOpen = !isOpen" aria-label="Toggle Menu">
      <svg v-if="!isOpen" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
      <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>

    <!-- Mobile Menu -->
    <ul v-show="isOpen"
        class="absolute top-full left-0 w-full bg-white shadow-md md:hidden flex flex-col space-y-2 p-4 text-gray-700 font-medium z-50">
      <li><RouterLink to="/" @click="isOpen = false">View Menu</RouterLink></li>
      <li v-if="hasRole('admin', 'superadmin')"><RouterLink to="/add" @click="isOpen = false">Add Menu Item</RouterLink></li>
      <li><RouterLink to="/order" @click="isOpen = false">Place Order</RouterLink></li>
      <li v-if="isLoggedIn()"><RouterLink to="/orderList" @click="isOpen = false">{{ hasRole('customer') ? 'My Orders' : 'View Orders' }}</RouterLink></li>
      <li v-if="hasRole('admin', 'superadmin')"><RouterLink to="/dashboard" @click="isOpen = false">Dashboard</RouterLink></li>
      <li v-if="!isLoggedIn()"><RouterLink to="/register" @click="isOpen = false">Register</RouterLink></li>
      <li v-if="!isLoggedIn()"><RouterLink to="/login" @click="isOpen = false">Login</RouterLink></li>
      <li v-if="isLoggedIn()"><button @click="logoutAndClose" class="text-red-600 hover:underline">Logout</button></li>
      <li v-if="hasRole('superadmin')"><RouterLink to="/admin/create-restaurant" @click="isOpen = false">Add Restaurant</RouterLink></li>
    </ul>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  user: Object,
  isLoggedIn: Function,
  hasRole: Function
})

const emit = defineEmits(['logout'])

const isOpen = ref(false)

const logoutAndClose = () => {
  emit('logout')
  isOpen.value = false
}
</script>
