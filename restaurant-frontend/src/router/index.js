import { createRouter, createWebHistory } from 'vue-router';
import MenuList from '../components/menuList.vue';
import AddMenuItem from '../components/addMenuItem.vue';
import PlaceOrder from '../components/placeOrder.vue';
import OrderList from '../components/orderList.vue';
import Dashboard from '../components/dashboard.vue'; 
import Register from '../components/Register.vue';
import Login from '../components/Login.vue';
import CreateRestaurant from '../components/CreateRestaurant.vue';

const routes = [
  { path: '/', component: MenuList },
  { path: '/add', component: AddMenuItem, meta: { requiresAuth: true, allowedRoles: ['admin', 'superadmin'] } },
  { path: '/order', component: PlaceOrder },
  { path: '/orderList', component: OrderList, meta: { requiresAuth: true, allowedRoles: ['customer','staff','admin', 'superadmin'] } },
  { path: '/menu/update/:id', name: 'UpdateMenuItem', component: () => import('../components/updateMenuItem.vue'), meta: { requiresAuth: true, allowedRoles: ['admin', 'superadmin'] } },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true, allowedRoles: ['admin', 'superadmin'] } },
  { path: '/register', component: Register },
  { path: '/login', component: Login },
  { path: '/admin/create-restaurant', component: CreateRestaurant, meta: { requiresAuth: true, allowedRoles: ['superadmin'] } },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../components/NotFound.vue') }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 🌐 Global Navigation Guard
router.beforeEach((to, from, next) => {
  const userData = localStorage.getItem('user');
  let user = null;

  try {
    user = userData ? JSON.parse(userData) : null;
  } catch (e) {
    console.error('Failed to parse user from localStorage', e);
  }

  // 1. If route requires login but user is not logged in
  if (to.meta.requiresAuth && !user) {
    return next('/login');
  }

  // 2. If route is restricted to specific roles
  if (to.meta.allowedRoles && (!user || !to.meta.allowedRoles.includes(user.role))) {
    return next('/'); // Or redirect to /not-authorized if you have that page
  }

  next();
});

export default router;

