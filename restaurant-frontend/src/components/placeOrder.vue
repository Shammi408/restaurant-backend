<template>
  <div class="form-container">
    <h2>Place a New Order</h2>

    <form @submit.prevent="submitOrder" class="form">
      <div class="form-group">
        <label>Customer Name:</label>
        <input v-model="customerName" required />
      </div>

      <div class="form-group">
        <label>Customer Contact:</label>
        <input v-model="customerContact" required />
      </div>

      <div v-if="menuItems.length === 0" class="loading">
        Loading menu...
      </div>

      <div v-else>
        <h3>Select Items:</h3>
        <div
          v-for="item in menuItems"
          :key="item._id"
          class="menu-item"
        >
          <label class="checkbox-label">
            <input type="checkbox" v-model="item.selected" />
            {{ item.name }} - ₹{{ item.price }}
          </label>

          <div v-if="item.selected" class="item-details">
            <label>
              Quantity:
              <input type="number" v-model.number="item.quantity" min="1" />
            </label>
            <label>
              Customizations:
              <input v-model="item.customizations" placeholder="Optional" />
            </label>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>Notes:</label>
        <textarea v-model="notes" rows="3" placeholder="Additional notes (optional)"></textarea>
      </div>

      <button type="submit" class="submit-btn">Place Order</button>
    </form>

    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script>
export default {
  name: "PlaceOrder",
  data() {
    return {
      customerName: "",
      customerContact: "",
      notes: "",
      menuItems: [],
      successMessage: "",
      errorMessage: "",
    };
  },
  async mounted() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/menu?order=true`);
      const data = await res.json();
      this.menuItems = data.data.map((item) => ({
        ...item,
        selected: false,
        quantity: 1,
        customizations: "",
      }));
    } catch (err) {
      this.errorMessage = "Failed to load menu.";
    }
  },
  methods: {
    async submitOrder() {
      this.successMessage = "";
      this.errorMessage = "";

      const token = localStorage.getItem("token");

      if (!token) {
        this.errorMessage = "Please register or login to order.";
        return;
      }

      const selectedItems = this.menuItems
        .filter((item) => item.selected)
        .map((item) => ({
          itemId: item._id,
          quantity: item.quantity,
          customizations: item.customizations,
        }));

      if (selectedItems.length === 0) {
        this.errorMessage = "Please select at least one item.";
        return;
      }

      const orderPayload = {
        customerName: this.customerName,
        customerContact: this.customerContact,
        notes: this.notes,
        items: selectedItems,
      };

      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderPayload),
        });

        const data = await res.json();
        if (data.success) {
          this.successMessage = "Order placed successfully!";
          this.errorMessage = "";
          this.resetForm();
        } else {
          this.errorMessage = data.message || "Failed to place order.";
        }
      } catch (err) {
        this.errorMessage = "Error placing order.";
      }
    },
    resetForm() {
      this.customerName = "";
      this.customerContact = "";
      this.notes = "";
      this.menuItems.forEach((item) => {
        item.selected = false;
        item.quantity = 1;
        item.customizations = "";
      });
    },
  },
};
</script>

<style scoped>
.form-container {
  max-width: 480px;
  margin: 2rem auto;
  padding: 1.5rem 1.75rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.1);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 0.35rem;
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
}

input[type="text"],
input[type="number"],
textarea {
  padding: 0.5rem 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  font-family: inherit;
  resize: vertical;
}

input[type="text"]:focus,
input[type="number"]:focus,
textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 3px #007bff;
}

.menu-item {
  padding: 0.75rem 0.8rem;
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 1rem;
  background: #fafafa;
}

.checkbox-label {
  cursor: pointer;
  display: flex;
  align-items: center;
  font-weight: 600;
  user-select: none;
  gap: 0.5rem;
  font-size: 1rem;
}

.checkbox-label input[type="checkbox"] {
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.item-details {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  font-weight: 500;
}

.item-details label {
  font-weight: 400;
  font-size: 0.9rem;
}

.item-details input {
  width: 100px;
}

.submit-btn {
  background-color: #007bff;
  color: white;
  padding: 0.7rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: #0056b3;
}

.success-message {
  color: #28a745;
  font-weight: 600;
  margin-top: 1rem;
  text-align: center;
}

.error-message {
  color: #d9534f;
  font-weight: 600;
  margin-top: 1rem;
  text-align: center;
}

.loading {
  color: #777;
  font-style: italic;
  text-align: center;
}
</style>
