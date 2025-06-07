<template>
  <div v-if="loading">Loading item...</div>
  <div v-else-if="error" class="error">{{ error }}</div>
  <div v-else>
    <h2>Edit Menu Item</h2>

    <form @submit.prevent="updateItem">
      <label>Name:</label>
      <input v-model="item.name" required />

      <label>Category:</label>
      <input v-model="item.category" required />

      <label>Price (₹):</label>
      <input type="number" v-model.number="item.price" required />

      <label>Tags (comma-separated):</label>
      <input v-model="tagsString" />

      <label>Available:</label>
      <input type="checkbox" v-model="item.available" />

      <br /><br />
      <button type="submit">Save Changes</button>
      <button @click.prevent="toggleAvailability" style="margin-left: 1rem;">
        {{ item.available ? 'Mark Unavailable' : 'Mark Available' }}
      </button>
      <button @click.prevent="softDeleteItem" style="margin-left: 1rem; color: red;">
        Delete Item
      </button>

    </form>

    <div v-if="successMsg" class="success">{{ successMsg }}</div>
  </div>
</template>

<script>
export default {
  name: 'UpdateMenuItem',
  data() {
    return {
      item: {},
      tagsString: '',
      loading: true,
      error: '',
      successMsg: ''
    };
  },
  mounted() {
    this.fetchItem();
  },
  methods: {
    async fetchItem() {
      try {
        const { id } = this.$route.params;
        const response = await fetch(`/api/menu/${id}`);
        if (!response.ok) throw new Error('Failed to load item');
        const data = await response.json();
        this.item = data.data || data;  // Adjust if your API wraps data
        this.tagsString = this.item.tags?.join(', ') || '';
        this.loading = false;
      } catch (err) {
        this.error = err.message || 'Failed to load item';
        this.loading = false;
      }
    },
    async updateItem() {
      try {
        const updatedItem = {
          ...this.item,
          tags: this.tagsString.split(',').map(tag => tag.trim())
        };
        delete updatedItem._id;
        const response = await fetch(`/api/menu/${this.item._id}`,{
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Update failed');
        }

        const resData = await response.json();
        this.successMsg = 'Item updated successfully';
        this.item = resData.data || resData;
        this.error = '';
      } catch (err) {
        this.error = err.message || 'Update failed';
        this.successMsg = '';
      }
    },
    async toggleAvailability() {
      try {
        // If you don't have a toggleAvailability backend route, 
        // just update with PUT (or you can adjust as needed)
        const response = await fetch(`/api/menu/${this.item._id}/availability`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ available: !this.item.available }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to update availability');
        }

        const resData = await response.json();
        this.item.available = resData.data?.available ?? resData.available;
        this.successMsg = `Item marked as ${this.item.available ? 'available' : 'unavailable'}`;
        this.error = '';
      } catch (err) {
        this.error = err.message || 'Failed to update availability';
        this.successMsg = '';
      }
    },
    async softDeleteItem() {
      if (!confirm('Are you sure you want to delete this item?')) return;

      try {
        const res = await fetch(`/api/menu/${this.item._id}/soft-delete`, {
          method: 'PATCH',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ isActive: false })
        });

        if (!res.ok) throw new Error('Failed to delete item');

        const data = await res.json();
        this.successMsg = 'Item deleted (soft) successfully';
        // Optional: navigate back to menu list or clear the form
        this.$router.push('/');
      } catch (err) {
        this.error = err.message || 'Soft delete failed';
      }
    }
  }
};
</script>

<style scoped>
input {
  display: block;
  margin-bottom: 0.5rem;
  padding: 0.4rem;
}
.success {
  margin-top: 1rem;
  color: green;
}
.error {
  color: red;
}
</style>
