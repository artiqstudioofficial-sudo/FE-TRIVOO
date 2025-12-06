
import React from 'react';
import { useAuth } from '../../AuthContext';
import { DollarSign, TrendingUp, Users, AlertTriangle, CheckCircle, Circle, ArrowRight, Lock, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { VerificationStatus } from '../../types';

const data = [
  { name: 'Mon', sales: 400 },
  { name: 'Tue', sales: 300 },
  { name: 'Wed', sales: 200 },
  { name: 'Thu', sales: 278 },
  { name: 'Fri', sales: 189 },
  { name: 'Sat', sales: 239 },
  { name: 'Sun', sales: 349 },
];

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const AgentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isVerified = user?.verificationStatus === VerificationStatus.VERIFIED;
  const isPending = user?.verificationStatus === VerificationStatus.PENDING;

  // Determine active step index (0: Account Created, 1: Verification, 2: First Product)
  // Assuming if they are here, step 0 is done.
  const currentStep = isVerified ? 2 : 1; 

  const steps = [
    {
      title: "Create Account",
      description: "Sign up as an agent",
      status: "completed",
      icon: CheckCircle
    },
    {
      title: "Verify Business",
      description: "Submit ID & Bank details",
      status: isVerified ? "completed" : isPending ? "pending" : "current",
      actionLabel: isPending ? "Under Review" : "Verify Now",
      actionLink: "/agent/verification",
      icon: isVerified ? CheckCircle : isPending ? Clock : Circle
    },
    {
      title: "Add First Product",
      description: "List your first service",
      status: isVerified ? "current" : "locked",
      actionLabel: "Add Product",
      actionLink: "/agent/products/new",
      icon: isVerified ? Circle : Lock
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h2>
        <p className="text-gray-500">Here is your sales performance overview.</p>
      </div>

      {/* Onboarding Progress Card */}
      {!isVerified && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-primary-600 px-6 py-4">
            <h3 className="text-white font-bold text-lg flex items-center">
              🚀 Let's get you set up!
            </h3>
            <p className="text-primary-100 text-sm">Complete these steps to start earning.</p>
          </div>
          <div className="p-6">
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
              {/* Connector Line (Desktop) */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 hidden md:block transform -translate-y-1/2"></div>
              
              {steps.map((step, index) => (
                <div key={index} className={`relative flex flex-row md:flex-col items-center gap-4 md:gap-0 md:text-center w-full md:w-1/3 bg-white md:bg-transparent p-2 md:p-0 rounded-lg ${step.status === 'locked' ? 'opacity-50' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm flex-shrink-0 z-10 
                    ${step.status === 'completed' ? 'bg-green-500 text-white' : 
                      step.status === 'pending' ? 'bg-amber-500 text-white' :
                      step.status === 'current' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'}`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 md:mt-3">
                    <h4 className={`text-sm font-bold ${step.status === 'current' ? 'text-primary-700' : 'text-gray-900'}`}>{step.title}</h4>
                    <p className="text-xs text-gray-500 mb-2">{step.description}</p>
                    
                    {step.status !== 'completed' && step.status !== 'locked' && step.actionLabel && (
                      <button 
                        onClick={() => navigate(step.actionLink || '#')}
                        disabled={step.status === 'pending'}
                        className={`text-xs font-bold px-4 py-1.5 rounded-full transition-colors inline-flex items-center
                          ${step.status === 'pending' 
                            ? 'bg-amber-100 text-amber-700 cursor-default' 
                            : 'bg-primary-600 text-white hover:bg-primary-700 shadow-md'}`}
                      >
                        {step.actionLabel}
                        {step.status !== 'pending' && <ArrowRight className="w-3 h-3 ml-1" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid - Blurred if unverified to tease features */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${!isVerified ? 'filter blur-[2px] opacity-70 pointer-events-none select-none' : ''}`}>
        <StatCard title="Total Commission" value={`$${user?.balance || 0}`} icon={DollarSign} color="bg-green-500" />
        <StatCard title="Bookings This Month" value="24" icon={TrendingUp} color="bg-blue-500" />
        <StatCard title="Active Customers" value="156" icon={Users} color="bg-indigo-500" />
      </div>

      <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${!isVerified ? 'filter blur-[2px] opacity-70 pointer-events-none select-none' : ''}`}>
        <h3 className="text-lg font-bold text-gray-900 mb-6">Weekly Sales Performance</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
