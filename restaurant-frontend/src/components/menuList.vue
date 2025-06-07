<template>
  <div>
    <h2>Menu Items</h2>
    <div v-if="loading">Loading menu items...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <!-- <div style="margin-bottom: 1rem;">
        Logged in as: {{ user.email }} ({{ user.role }})
      </div> -->

      <!-- Filter Form -->
      <div style="margin-bottom: 1rem;">
        <input v-model="searchName" style="margin-right: 0.5rem;" placeholder=" Search by name" />

        <select v-model="selectedCategory">
          <option value="">All Categories</option>
          <option v-for="category in uniqueCategories" :key="category" :value="category"> {{ category }}</option>
        </select>
        <label  v-if="user.role !== 'customer' && user.role !== 'staff'">
          <input type="checkbox" v-model="showDeleted" /> Show Deleted Items
        </label>
        <label><input type="checkbox" value="vegetarian" v-model="selectedTags" /> Veg</label>
        <label><input type="checkbox" value="non vegetarian" v-model="selectedTags" /> Non Veg</label>
        <label><input type="checkbox" value="spicy"  v-model="selectedTags" /> Spicy</label>
        <label><input type="checkbox" value="sweets"  v-model="selectedTags" /> Sweets</label>

        <input type="number" v-model.number="minPrice" placeholder="Min Price"  style="margin-left: 0.5rem; margin-right: 0.5rem;" />
        <input type="number" v-model.number="maxPrice" placeholder="Max Price" />
      </div>
      <div style="margin-bottom: 1rem;">
        <label for="sortOrder">Sort by:</label>
        <select v-model="sortOrder" id="sortOrder">
          <option value="">None</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A to Z</option>
          <option value="name_desc">Name: Z to A</option>
        </select>
        <button @click="applyFilters" style="margin-left: 0.5rem;">Apply Filters</button>
      </div>
    </div>
    <div v-if="menuItems.length === 0">No items found.</div>
    <ul v-else>
      <li v-for="item in menuItems" :key="item._id" style="margin-bottom: 1rem;">
        <strong>{{ item.name }}</strong> - ₹{{ item.price }} <br />
        <small>{{ item.category }} | {{ item.available ? 'Available' : 'Unavailable' }}</small><br />
        <small> Restaurant: {{ item.restaurant ? item.restaurant.name : 'N/A' }}</small>
        <small>Tags: {{ item.tags?.join(', ') }}</small>
        <!-- <div>
          <p>Item restaurant: {{ item.restaurant }}</p>
          <p>User restaurant id: {{ user.restaurant?._id }}</p>
          <p>Compare: {{ item.restaurant._id === user.restaurant?._id }}</p>
        </div> -->
        <!-- <p>User restaurant object: {{ user.restaurant }}</p> -->
        <router-link
          v-if="(user.role === 'superadmin') || (user.role === 'admin' && item.restaurant._id.toString() === user.restaurant)"
          :to="`/menu/update/${item._id}`">
          <button style="margin-top: 0.5rem;">Edit / Delete</button>
        </router-link>

        <button 
          v-if="!item.isActive && showDeleted && user.role !== 'staff'" 
          @click="restoreItem(item._id)"
          class="restore-btn" style="margin-left: 1rem;"
        >Restore</button>

      </li>
    </ul>
  </div>
  <div v-if="totalPages > 1" class="pagination-controls" style="margin-top: 1rem;">
    <button 
      :disabled="currentPage === 1" 
      @click="changePage(currentPage - 1)">
      Previous
    </button>
    <span> Page {{ currentPage }} of {{ totalPages }} </span>
    <button 
      :disabled="currentPage === totalPages" 
      @click="changePage(currentPage + 1)">
      Next
    </button>
  </div>
  <div class="alert alert-warning mt-4" role="alert" style="margin-top: 1rem;">
    Want to list your restaurant? Contact the website admin at
    <a href="mailto:superadmin2@example.com" class="alert-link">superadmin2@example.com</a>
  </div>

</template>

<script>
export default {
  name: 'MenuList',
  data() {
    return {
      menuItems: [],
      loading: false,
      user: JSON.parse(localStorage.getItem('user')) || {},
      error: null,
      selectedCategory: '',
      searchName: '',
      selectedTags: [],
      showDeleted: false,
      minPrice: null,
      maxPrice: null,
      sortOrder: '',
      currentPage: 1,  // Pagination
      pageSize: 5,  // items per page can be changed
      totalPages: 1,
    };
  },
  computed: {
    uniqueCategories() {
      const categories = this.menuItems.map(item => item.category);
      // Return unique categories only
      return [...new Set(categories)].sort();
    }
  },
  methods: {
    async loadMenuItems() {
      this.loading = true;
      this.error = null;

      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/menu`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        this.menuItems = data.data;
      } catch (err) {
        this.error = 'Failed to fetch menu items. Please try again later.';
        console.error('Error fetching menu:', err);
      } finally {
        this.loading = false;
      }
    },
    async applyFilters() {
      this.loading = true;
      this.error = null;

      try {
        const params = new URLSearchParams();

        if (this.searchName) params.append('name', this.searchName);
        if (this.selectedCategory) params.append('category', this.selectedCategory);
        if (this.selectedTags.length) params.append('tags', this.selectedTags.join(','));
        if (this.sortOrder) params.append('sort', this.sortOrder);
        if (this.minPrice != null) params.append('minPrice', this.minPrice);
        if (this.maxPrice != null) params.append('maxPrice', this.maxPrice);

        params.append('page', this.currentPage);
        params.append('limit', this.pageSize);
        params.append('showDeleted', this.showDeleted ? 'true' : 'false');

        const url = `${import.meta.env.VITE_API_BASE_URL}/api/menu?${params.toString()}`;

        console.log('Fetch URL:', url);

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();

        if (data.success) {
          this.menuItems = data.data;
          this.totalPages = data.totalPages;
        } else {
          this.error = 'Failed to load menu items';
        }
      } catch (err) {
        this.error = 'Error loading menu items. Please try again later.';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    async restoreItem(id) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/menu/${id}/soft-delete`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: true })
        });

        const data = await res.json();

        if (data.success) {
          alert('Item restored!');
          this.applyFilters(); // Re-fetch items with current filters
        } else {
          alert('Failed to restore item: ' + data.message);
        }
      } catch (err) {
        console.error('Restore error:', err);
        alert('Error restoring item. Check console for details.');
      }
    },
    async changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        await this.applyFilters();
      }
    }
  },
  mounted() {
    this.loadMenuItems();
    // this.applyFilters();
  }
};
</script>


<style scoped>
/* Base font & spacing */
div, label, input, select, button, ul, li {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 14px;
  color: #333;
}

/* Container */
h2 {
  margin-bottom: 1.5rem;
  font-weight: 600;
  color: #222;
}

/* Filter section */
div[style*="margin-bottom: 1rem"] {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

/* Inputs and selects */
input[type="text"],
input[type="number"],
select {
  padding: 0.4rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: border-color 0.2s ease;
  min-width: 120px;
}

input[type="text"]:focus,
input[type="number"]:focus,
select:focus {
  outline: none;
  border-color: #0078d7;
  box-shadow: 0 0 3px rgba(0, 120, 215, 0.5);
}

/* Checkboxes label spacing */
label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
  user-select: none;
  color: #555;
}

/* Buttons */
button {
  background-color: #0078d7;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.45rem 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

button:hover:not(:disabled) {
  background-color: #005fa3;
}

button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}

/* Menu list */
ul {
  list-style: none;
  padding: 0;
  margin-top: 1rem;
}

li {
  padding: 1rem;
  border: 1px solid #e1e1e1;
  border-radius: 6px;
  margin-bottom: 1rem;
  background: #fafafa;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
li small {
  margin-right: 1rem;
  display: inline-block; /* so margin works horizontally */
}


/* Item text */
strong {
  font-weight: 600;
  font-size: 1.1rem;
  color: #111;
}

small {
  color: #666;
  font-size: 0.85rem;
}

/* Tags styling */
small:last-child {
  display: block;
  margin-top: 0.3rem;
}

small:last-child span.tag {
  display: inline-block;
  margin-right: 6px;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 0.75rem;
  color: white;
  font-weight: 600;
  user-select: none;
}

.tag.vegetarian {
  background-color: #4caf50; /* green */
}

.tag.non vegetarian {
  background-color: #d32f2f; /* red */
}

.tag.spicy {
  background-color: #f57c00; /* orange */
}

/* Pagination */
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.pagination-controls button {
  min-width: 80px;
}

/* Error message */
.error {
  color: #b00020;
  font-weight: 700;
  margin: 1rem 0;
}
</style>

