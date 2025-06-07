<template>
  <div>
    <Navbar :user="user" :isLoggedIn="isLoggedIn" :hasRole="hasRole" @logout="logout" />

    <div class="container">
      <h1 class="container">Restaurant Order Management</h1>

      <p v-if="isLoggedIn()" class="italic text-sm text-gray-600 mb-4">
        Logged in as: {{ user.email }} ({{ user.role }})
      </p>

      <router-view />
    </div>
  </div>
</template>


<script>
import Navbar from './components/Navbar.vue';
// import Navbar from './components/Navbar.vue'
import userSession from './utils/userSession.js';

export default {
  name: 'App',
  components: {
    Navbar,   // Register Navbar here
  },
  computed: {
    user() {
      return userSession.state.user;
    }
  },
  methods: {
    isLoggedIn() {
      return !!this.user;
    },
    hasRole(...roles) {
      return this.user && roles.includes(this.user.role);
    },
    logout() {
      userSession.clearUser();
      localStorage.removeItem('token');
      this.$router.push('/login');
    }
  }
};
</script>

<style>
.router-link-active {
  font-weight: bold;
  color: #3498db;
}
.router-link-exact-active {
  text-decoration: underline;
}
.active {
  font-weight: bold;
  text-decoration: underline;
}

</style>