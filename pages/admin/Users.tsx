// src/pages/admin/UsersManagement.tsx

import { CheckCircle, ShieldAlert, UserCheck, User as UserIcon, XCircle } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { adminService } from '../../services/adminService';
import { AgentListItem, ApiResponse, CustomerListItem, VerificationStatus } from '../../types';

function unwrapArray<T>(res: unknown): T[] {
  // support kalau service return langsung array
  if (Array.isArray(res)) return res as T[];

  // support kalau service return { data: [] }
  const maybe = res as ApiResponse<T[]>;
  if (Array.isArray(maybe?.data)) return maybe.data;

  return [];
}

const UsersManagement: React.FC = () => {
  const [agents, setAgents] = useState<AgentListItem[]>([]);
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [activeTab, setActiveTab] = useState<'agents' | 'customers'>('agents');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ per-user loading untuk tombol approve/reject
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

  // ✅ anti setState setelah unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [agentRes, customerRes] = await Promise.all([
        adminService.getAllAgents(),
        adminService.getAllCustomers(),
      ]);

      const nextAgents = unwrapArray<AgentListItem>(agentRes);
      const nextCustomers = unwrapArray<CustomerListItem>(customerRes);

      if (!mountedRef.current) return;
      setAgents(nextAgents);
      setCustomers(nextCustomers);
    } catch (e: any) {
      console.error(e);
      if (!mountedRef.current) return;
      setError(e?.response?.data?.message || e?.message || 'Failed to load users');
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleVerify = useCallback(
    async (userId: number, action: 'approve' | 'reject') => {
      try {
        setError(null);
        setProcessingIds((prev) => new Set(prev).add(userId));

        const apiAction = action === 'approve' ? 'APPROVE' : 'REJECT';
        await adminService.updateAgentVerification(userId, apiAction);

        // reload list
        await loadData();
      } catch (e: any) {
        console.error(e);
        if (!mountedRef.current) return;
        setError(
          e?.response?.data?.message || e?.message || 'Failed to update verification status',
        );
      } finally {
        if (!mountedRef.current) return;
        setProcessingIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }
    },
    [loadData],
  );

  const getVerificationBadge = (status?: VerificationStatus | string | null) => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center w-fit font-bold">
            <CheckCircle className="w-3 h-3 mr-1" /> Verified
          </span>
        );
      case VerificationStatus.PENDING:
        return (
          <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center w-fit font-bold">
            <ShieldAlert className="w-3 h-3 mr-1" /> Pending
          </span>
        );
      case VerificationStatus.REJECTED:
        return (
          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center w-fit font-bold">
            <XCircle className="w-3 h-3 mr-1" /> Rejected
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full flex items-center w-fit font-bold">
            Unverified
          </span>
        );
    }
  };

  const formatEnum = (val?: string | null) => {
    if (!val) return '-';
    const s = String(val).replaceAll('_', ' ');
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  };

  const agentCount = agents.length;
  const customerCount = customers.length;

  const emptyStateText = useMemo(() => {
    if (isLoading) return '';
    if (activeTab === 'agents' && agentCount === 0) return 'No agents found.';
    if (activeTab === 'customers' && customerCount === 0) return 'No customers found.';
    return '';
  }, [activeTab, agentCount, customerCount, isLoading]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          <p className="text-gray-500 text-sm">Manage agents, customers, and verifications.</p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-6 pt-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('agents')}
              className={`pb-4 text-sm font-bold transition-all border-b-2 flex items-center ${
                activeTab === 'agents'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
              type="button"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Agents ({agentCount})
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`pb-4 text-sm font-bold transition-all border-b-2 flex items-center ${
                activeTab === 'customers'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
              type="button"
            >
              <UserIcon className="w-4 h-4 mr-2" />
              Customers ({customerCount})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-gray-500">Loading...</div>
          ) : emptyStateText ? (
            <div className="p-8 text-center text-sm text-gray-500">{emptyStateText}</div>
          ) : activeTab === 'agents' ? (
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Specialization
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {agents.map((u) => {
                  const agentType = u.verification?.agent_type ?? null;
                  const specialization = u.verification?.specialization ?? u.specialization ?? null;

                  // ✅ handle beberapa kemungkinan field dari backend
                  const status =
                    (u as any).verification_status ?? (u as any).verificationStatus ?? null;

                  const isPending = status === VerificationStatus.PENDING;
                  const isProcessing = processingIds.has(u.id);

                  return (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                            {u.avatar ? (
                              <img
                                src={u.avatar}
                                className="w-full h-full object-cover"
                                alt={u.name}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{u.name}</div>
                            <div className="text-xs text-gray-500">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                        {formatEnum(agentType)}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                        {formatEnum(specialization)}
                      </td>

                      <td className="px-6 py-4">{getVerificationBadge(status)}</td>

                      <td className="px-6 py-4 text-right">
                        {isPending ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleVerify(u.id, 'approve')}
                              className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                              title="Approve"
                              type="button"
                              disabled={isProcessing}
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleVerify(u.id, 'reject')}
                              className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                              title="Reject"
                              type="button"
                              disabled={isProcessing}
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {customers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              className="w-full h-full object-cover"
                              alt={u.name}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-bold text-gray-900">{u.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">#{u.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersManagement;
