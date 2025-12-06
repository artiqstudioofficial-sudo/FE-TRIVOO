import { CheckCircle, ShieldAlert, UserCheck, User as UserIcon, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { mockService } from '../../services/mockService';
import { User, VerificationStatus } from '../../types';

const UsersManagement: React.FC = () => {
  const [agents, setAgents] = useState<User[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'agents' | 'customers'>('agents');
  const [_, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    const [agentData, customerData] = await Promise.all([
      mockService.getAllAgents(),
      mockService.getAllCustomers(),
    ]);
    setAgents(agentData);
    setCustomers(customerData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerify = async (userId: number, action: 'approve' | 'reject') => {
    if (action === 'approve') {
      await mockService.approveAgent(userId);
    } else {
      await mockService.rejectAgent(userId);
    }
    loadData();
  };

  const getVerificationBadge = (status?: VerificationStatus) => {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          <p className="text-gray-500 text-sm">Manage agents, customers, and verifications.</p>
        </div>
      </div>

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
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Agents ({agents.length})
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`pb-4 text-sm font-bold transition-all border-b-2 flex items-center ${
                activeTab === 'customers'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <UserIcon className="w-4 h-4 mr-2" />
              Customers ({customers.length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'agents' ? (
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
                {agents.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                          <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                      {user.agentType || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                      {user.specialization || '-'}
                    </td>
                    <td className="px-6 py-4">{getVerificationBadge(user.verificationStatus)}</td>
                    <td className="px-6 py-4 text-right">
                      {user.verificationStatus === VerificationStatus.PENDING && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleVerify(user.id, 'approve')}
                            className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleVerify(user.id, 'reject')}
                            className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
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
                {customers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                          <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="text-sm font-bold text-gray-900">{user.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">#{user.id}</td>
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
