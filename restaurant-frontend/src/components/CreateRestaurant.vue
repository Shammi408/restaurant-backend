<template>
  <div class="container">
    <h2>Create New Restaurant</h2>

    <form @submit.prevent="createRestaurant">
      <div>
        <label>Name:</label>
        <input v-model="form.name" required />
      </div>

      <div>
        <label>Location:</label>
        <input v-model="form.location" required />
      </div>

      <div>
        <label>Cuisine Types (comma-separated):</label>
        <input v-model="form.cuisineTypes" />
      </div>

      <button type="submit">Create Restaurant</button>
    </form>

    <p v-if="successMessage" class="success">{{ successMessage }}</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: '',
        location: '',
        cuisineTypes: ''
      },
      successMessage: '',
      errorMessage: ''
    };
  },
  methods: {
    async createRestaurant() {
      this.successMessage = '';
      this.errorMessage = '';
      try {
        const token = localStorage.getItem('token'); // ensure token is stored on login
        const response = await fetch('/api/admin/restaurant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: this.form.name,
            location: this.form.location,
            cuisineTypes: this.form.cuisineTypes.split(',').map(type => type.trim())
          })
        });

        const data = await response.json();
        if (data.success) {
          this.successMessage = `Restaurant created successfully! New ID: ${data.restaurantId}`;
          this.form.name = '';
          this.form.location = '';
          this.form.cuisineTypes = '';
        } else {
          this.errorMessage = data.message || 'Error creating restaurant.';
        }
      } catch (err) {
        this.errorMessage = 'Request failed: ' + err.message;
      }
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 500px;
  margin: 2rem auto;
}
input {
  display: block;
  margin: 0.5rem 0 1rem;
  width: 100%;
  padding: 0.5rem;
}
button {
  padding: 0.5rem 1rem;
}
.success {
  color: green;
}
.error {
  color: red;
}
</style>
