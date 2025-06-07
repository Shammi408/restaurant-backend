<template>
  <div class="form-container">
    <h2>Add Menu Item</h2>
    <form @submit.prevent="submitForm" class="form">
      <div class="form-group">
        <label>Name:</label>
        <input v-model="name" required />
      </div>

      <div class="form-group">
        <label>Category:</label>
        <input v-model="category" required />
      </div>

      <div class="form-group">
        <label>Price:</label>
        <input v-model.number="price" type="number" min="0" required />
      </div>

      <div class="form-group">
        <label>Ingredients (comma separated):</label>
        <input v-model="ingredients" />
      </div>

      <div class="form-group">
        <label>Tags (comma separated):</label>
        <input v-model="tags" />
      </div>

      <div class="form-group checkbox-group">
        <label>
          <input type="checkbox" v-model="available" />
          Available
        </label>
      </div>

      <button type="submit" :disabled="loading" class="submit-btn">
        {{ loading ? 'Adding...' : 'Add Item' }}
      </button>
    </form>

    <p v-if="error" class="error-message">{{ error }}</p>
    <p v-if="success" class="success-message">Menu item added successfully!</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: '',
      category: '',
      price: null,
      ingredients: '',
      tags: '',
      available: true,
      loading: false,
      error: '',
      success: false
    };
  },
  methods: {
    async submitForm() {
      this.error = '';
      this.success = false;
      this.loading = true;

      const payload = {
        name: this.name,
        category: this.category,
        price: this.price,
        ingredients: this.ingredients
          ? this.ingredients.split(',').map(i => i.trim())
          : [],
        tags: this.tags
          ? this.tags.split(',').map(t => t.trim())
          : [],
        available: this.available
      };

      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/menu`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok) {
          this.error = data.message || 'Failed to add menu item';
        } else {
          this.success = true;
          this.name = '';
          this.category = '';
          this.price = null;
          this.ingredients = '';
          this.tags = '';
          this.available = true;
          this.$emit('item-added');
        }
      } catch (err) {
        this.error = 'Network error: ' + err.message;
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.form-container {
  max-width: 450px;
  margin: 1.5rem auto;
  padding: 1.5rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
  font-weight: 600;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 0.3rem;
  color: #555;
  font-weight: 500;
  font-size: 0.9rem;
}

input[type="text"],
input[type="number"] {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

input[type="text"]:focus,
input[type="number"]:focus {
  outline: none;
  border-color: #007BFF;
  box-shadow: 0 0 3px #007BFF;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.checkbox-group input[type="checkbox"] {
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.submit-btn {
  background-color: #007BFF;
  color: white;
  padding: 0.7rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:disabled {
  background-color: #7aa7e9;
  cursor: not-allowed;
}

.submit-btn:not(:disabled):hover {
  background-color: #0056b3;
}

.error-message {
  color: #d9534f;
  font-weight: 600;
  margin-top: 1rem;
  text-align: center;
}

.success-message {
  color: #28a745;
  font-weight: 600;
  margin-top: 1rem;
  text-align: center;
}
</style>
