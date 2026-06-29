import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Login from '../pages/Login.vue'
import Recharge from '../pages/Recharge.vue'
import MatchRoom from '../pages/MatchRoom.vue'
import GameBoard from '../components/GameBoard.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/recharge', name: 'Recharge', component: Recharge },
  { path: '/match', name: 'MatchRoom', component: MatchRoom },
  { path: '/game', name: 'GameBoard', component: GameBoard }
]

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})