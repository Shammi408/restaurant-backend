<template>
  <div class="register-container">
    <h2>Register User</h2>
    <form @submit.prevent="handleRegister">
      <label>Name:</label>
      <input type="text" v-model="form.name" required />

      <label>Email:</label>
      <input type="email" v-model="form.email" required />

      <label>Password:</label>
      <input type="password" v-model="form.password" required />

      <label>Role:</label>
      <select v-model="form.role" required>
        <option value="admin">Admin</option>
        <option value="staff">Staff</option>
        <option value="customer">Customer</option>
        <option value="delivery">Delivery</option>
      </select>
      
      <div v-if="form.role === 'admin' || form.role === 'staff'">
        <label>Restaurant ID:</label>
        <input
          type="text"
          v-model="form.restaurant"
          :required="form.role === 'admin' || form.role === 'staff'"
        />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Registering...' : 'Register' }}
      </button>
    </form>

    <div v-if="message" :class="messageClass">{{ message }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        name : '',
        email: '',
        password: '',
        role: 'staff',
        restaurant: ''
      },
      message: '',
      messageClass: '',
      loading: false
    };
  },
  methods: {
    async handleRegister() {
      this.message = '';
      this.messageClass = '';

      //  only staff and admin require restaurant
      const rolesNeedingRestaurant = ['admin', 'staff'];
      if (rolesNeedingRestaurant.includes(this.form.role) && !this.form.restaurant.trim()) {
        this.message = 'Restaurant ID is required for this role.';
        this.messageClass = 'error';
        return;
      }
      this.loading = true;
      try {
        // const token = localStorage.getItem('token'); // uncomment if auth required
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            name: this.form.name,
            email: this.form.email,
            password: this.form.password,
            role: this.form.role,
            restaurant: this.form.restaurant.trim() || null
          })
        });

        const data = await res.json();

        if (data.success) {
          this.message = 'User registered successfully.';
          this.messageClass = 'success';
          this.form.name = '',
          this.form.email = '';
          this.form.password = '';
          this.form.restaurant = '';
          this.form.role = 'staff';
          setTimeout(() => {
            this.message = '';
            this.messageClass = '';
          }, 4000);
        } else {
          this.message = data.message || 'Registration failed';
          this.messageClass = 'error';
        }
      } catch (err) {
        this.message = 'Something went wrong. Please try again.';
        this.messageClass = 'error';
      }
    }
  }
};
</script>


<style scoped>
.register-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: #f9f9f9;
  border-radius: 8px;
}
label {
  display: block;
  margin-top: 1rem;
}
input, select {
  display: block;
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.5rem;
}
button {
  margin-top: 1.5rem;
  padding: 0.5rem 1rem;
}
.success {
  color: green;
  margin-top: 1rem;
}
.error {
  color: red;
  margin-top: 1rem;
}
.message {
  margin-top: 1rem;
  color: green;
}
</style>
