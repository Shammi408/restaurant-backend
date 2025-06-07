<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <label>Email:</label>
      <input type="email" v-model="form.email" required />

      <label>Password:</label>
      <input type="password" v-model="form.password" required />

      <button type="submit">Login</button>
    </form>

    <div v-if="error" class="message">{{ error }}</div>
  </div>
</template>

<script>
import userSession from '../utils/userSession'; // path to your reactive store

export default {
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      error: ''
    };
  },
  methods: {
    async login() {
      this.error = '';
      try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.form.email,
            password: this.form.password
          })
        });
        const data = await response.json();

        if (!data.success) {
          this.error = data.message || 'Login failed';
          return;
        }

        // Save user info in reactive store (if you use it for state management)
        userSession.setUser(data.user);

        // Store JWT token in localStorage for future API calls
        localStorage.setItem('token', data.token);

        // Redirect to home or dashboard
        this.$router.push('/');
      } catch (err) {
        this.error = 'Something went wrong';
        console.error(err);
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: #f0f0f0;
  border-radius: 8px;
}
input {
  display: block;
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.5rem;
}
button {
  padding: 0.5rem 1rem;
}
.message {
  margin-top: 1rem;
  color: green;
}
</style>
