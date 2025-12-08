// src/services/adminService.ts
import http from './http';

export const adminService = {
  async getAllAgents() {
    const res = await http.get('/admin/users/agents');
    return res.data.data || [];
  },

  async getAllCustomers() {
    const res = await http.get('/admin/users/customers');
    return res.data.data || [];
  },

  async updateAgentVerification(userId: number, action: 'APPROVE' | 'REJECT') {
    await http.post(`/admin/agents/${userId}/verification`, { action });
  },
};
