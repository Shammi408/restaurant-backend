<template>
  <div class="dashboard-container">
      <div>
        <h2>📊 Analytics Dashboard</h2>
         <!-- Export PDF Button for admins only -->
          <label>Start Date:</label>
          <input type="date" v-model="startDate" />

          <label>End Date:</label>
          <input type="date" v-model="endDate" />
          <button @click="exportPdf" class="export-pdf-btn">
            Export Orders PDF
          </button>
        <div v-if="loading">Loading analytics...</div>
          <div v-else-if="error" class="error">{{ error }}</div>
          <div v-else>
            <div class="metrics">
              <div class="metric">Total Orders: {{ data.totalOrders }}</div>
              <div class="metric">Total Revenue: ₹{{ data.totalRevenue }}</div>
          </div>

          <h3>Status Breakdown</h3>
          <ul>
            <li v-for="status in data.statusBreakdown" :key="status._id">
              {{ status._id }}: {{ status.count }}
            </li>
          </ul>

          <h3>Top 5 Ordered Items</h3>
          <ul>
            <li v-for="item in data.topItems" :key="item.name">
              {{ item.name }} ({{ item.totalOrdered }} orders)
            </li>
          </ul>

          <h3>Orders Per Day (Last 30 Days)</h3>
          <line-chart :chart-data="chartData" />
        </div>
      </div>
  </div>
</template>

<script>
// import { Line } from 'vue-chartjs'
import LineChart from './LineChart.vue'; // Import from separate file
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
   Filler
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler )

export default {
  components: {
    LineChart
  },
  data() {
    return {
      loading: true,
      error: '',
      data: {},
      chartData: null,
      startDate: '',
      endDate: ''
    };
  },
  methods: {
    async exportPdf() {
      try {
        // const token = localStorage.getItem('token');

        // Build query string from dates
        const query = new URLSearchParams();
        if (this.startDate) query.append('startDate', this.startDate);
        if (this.endDate) query.append('endDate', this.endDate);
        const url = `/api/analytics/export/orders/pdf?${query.toString()}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) throw new Error('PDF download failed');

        const blob = await response.blob();
        const urlBlob = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = urlBlob;
        a.download = 'orders-report.pdf';
        a.click();
        window.URL.revokeObjectURL(urlBlob);
      } catch (err) {
        alert('Error exporting PDF: ' + err.message);
      }
    }
  },
  async mounted() {
    try {
      const res = await fetch('/api/analytics/dashboard',{
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const json = await res.json();

      if (!json.success) throw new Error(json.message || 'Failed to load');

      this.data = json.data;
      this.chartData = {
        labels: json.data.ordersPerDay.map(item => item._id),
        datasets: [
          {
            label: 'Orders',
            data: json.data.ordersPerDay.map(item => item.orders),
            backgroundColor: 'rgba(75, 192, 192, 0.4)',
            borderColor: 'rgba(75, 192, 192, 1)',
            fill: true,
            tension: 0.4
          }
        ]
      };

      this.loading = false;
    } catch (err) {
      this.error = err.message;
      this.loading = false;
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 2rem;
  max-width: 900px;
  margin: auto;
  font-family: 'Segoe UI', sans-serif;
}

h2 {
  margin-bottom: 1rem;
  color: #333;
}

label {
  margin-right: 0.5rem;
  font-weight: bold;
}
input[type="date"] {
  margin-right: 1rem;
  padding: 0.4rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.export-pdf-btn {
  padding: 0.5rem 1rem;
  margin-left: 1rem;
  margin-bottom: 1rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.export-pdf-btn:hover {
  background-color: #218838;
}
.dashboard-container {
  padding: 1rem;
}
.metrics {
  display: flex;
  gap: 2rem;
  margin: 1.5rem 0;
  flex-wrap: wrap;
}
.metric {
  padding: 1rem;
  background: #f2f2f2;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-weight: bold;
  flex: 1;
  min-width: 150px;
}
ul {
  padding-left: 1.2rem;
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
}

li {
  margin-bottom: 0.3rem;
}

h3 {
  margin-top: 1.5rem;
  color: #444;
}
.error {
  color: red;
}
</style>
