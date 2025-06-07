<template>
  <div class="orders-container">
    <h2>Orders</h2>

    <div class="filter-group" >
      <label for="statusFilter">Filter by Status:</label>
      <select id="statusFilter" v-model="filterStatus" @change="fetchOrders">
        <option value="">All</option>
        <option value="Placed">Placed</option>
        <option value="Preparing">Preparing</option>
        <option value="Out for Delivery">Out for Delivery</option>
        <option value="Delivered">Delivered</option>
        <option value="Cancelled">Cancelled</option>
      </select>
    </div>

    <div v-if="loading" class="loading">Loading orders...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="orders.length === 0" class="no-orders">No orders found.</div>

    <ul v-else class="orders-list">
      <li v-for="order in orders" :key="order._id" class="order-item">
        <strong>Customer:</strong> {{ order.customerName }} <br />
        <strong>Status:</strong> {{ order.status }} <br />

        <!-- Status update dropdown (only for active orders) -->
        <div v-if="user.role !== 'customer' && order.status !== 'Delivered' && order.status !== 'Cancelled'" class="status-update">
          <label>Update Status:</label>
          <select v-model="order.newStatus">
            <option disabled value="">Select status</option>
            <option>Placed</option>
            <option>Preparing</option>
            <option>Out for Delivery</option>
            <option>Delivered</option>
          </select>
          <button @click="updateStatus(order)" class="btn update-btn">Update</button>
        </div>

        <!-- Cancel Order -->
        <div v-if="user && (
          (user.role === 'customer' && order.status === 'Placed') ||
          (user.role !== 'customer' && order.status !== 'Delivered' && order.status !== 'Cancelled')
          )"class="cancel-order">
          <button @click="cancelOrder(order)" class="btn cancel-btn">Cancel Order</button>
        </div>

        <strong>Items:</strong>
        <ul class="items-list">
          <li v-for="item in order.items" :key="item._id">
            {{ item.itemId.name }} (Qty: {{ item.quantity }})
            <span v-if="item.customizations"> - Custom: {{ item.customizations }}</span>
          </li>
        </ul>

        <strong>Total:</strong> ₹{{ order.totalAmount }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'OrderList',
  data() {
    return {
      orders: [],
      user: null,
      loading: true,
      error: null,
      filterStatus: '',
    };
  },
  mounted() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }
    this.fetchOrders();
  },
  methods: {
    async fetchOrders() {
      this.loading = true;
      this.error = null;
      try {
        const token = localStorage.getItem('token'); 
        // Append the status query param only if filterStatus is set
        const url = this.filterStatus
          ? `${import.meta.env.VITE_API_BASE_URL}/api/orders?status=${encodeURIComponent(this.filterStatus)}`
          : `${import.meta.env.VITE_API_BASE_URL}/api/orders`;

        const res = await fetch(url,{
          headers: {
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'application/json'}
        });
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        this.orders = data.data.map(order => ({ ...order, newStatus: '' }));
      } catch (err) {
        this.error = err.message || 'Error fetching orders';
      } finally {
        this.loading = false;
      }
    },
    async updateStatus(order) {
      if (!order.newStatus) {
        alert('Please select a status');
        return;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${order._id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: order.newStatus }),
        });

        const data = await res.json();
        if (data.success) {
          order.status = order.newStatus;
          order.newStatus = '';
          alert('Status updated successfully');
        } else {
          alert(data.message || 'Failed to update status');
        }
      } catch (err) {
        alert('Error updating status');
      }
    },
    async cancelOrder(order) {
      const confirmCancel = confirm('Are you sure you want to cancel this order?');
      if (!confirmCancel) return;

      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${order._id}`, {
          method: 'DELETE',
        });
        const data = await res.json();

        if (data.success) {
          order.status = 'Cancelled';
          alert('Order cancelled successfully');
        } else {
          alert(data.message || 'Failed to cancel order');
        }
      } catch (err) {
        alert('Error cancelling order');
      }
    },
  },
};
</script>

<style scoped>
.orders-container {
  max-width: 600px;
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

.filter-group {
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.filter-group label {
  font-weight: 600;
  color: #555;
}

.filter-group select {
  padding: 0.4rem 0.6rem;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 1rem;
  cursor: pointer;
}

.loading,
.no-orders {
  text-align: center;
  color: #666;
  font-style: italic;
  margin-top: 1rem;
}

.error {
  color: #d9534f;
  font-weight: 600;
  margin-top: 1rem;
  text-align: center;
}

.orders-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.order-item {
  border: 1px solid #ccc;
  padding: 1rem 1.25rem;
  border-radius: 6px;
  margin-bottom: 1.2rem;
  background: #fafafa;
}

.status-update,
.cancel-order {
  margin-top: 0.7rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.status-update label {
  font-weight: 500;
}

.status-update select {
  padding: 0.3rem 0.5rem;
  border-radius: 5px;
  border: 1px solid #bbb;
  font-size: 0.95rem;
  cursor: pointer;
}

.btn {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.25s ease;
  font-size: 0.9rem;
  color: white;
}

.update-btn {
  background-color: #007bff;
}

.update-btn:hover {
  background-color: #0056b3;
}

.cancel-btn {
  background-color: #d9534f;
}

.cancel-btn:hover {
  background-color: #b52b27;
}

.items-list {
  list-style: disc;
  margin: 0.5rem 0 0 1.5rem;
  padding: 0;
  font-size: 0.95rem;
  color: #444;
}
</style> 
