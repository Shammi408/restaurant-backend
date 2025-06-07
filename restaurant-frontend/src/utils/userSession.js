
import { reactive } from 'vue';

const state = reactive({
  user: JSON.parse(localStorage.getItem('user')) || null
});

export default {
  state,
  setUser(user) {
    state.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  },
  clearUser() {
    state.user = null;
    localStorage.removeItem('user');
    // localStorage.removeItem('token');
  }
};
