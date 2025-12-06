
import React, { useEffect, useState } from 'react';
import { mockService } from '../../services/mockService';
import { Booking, BookingStatus } from '../../types';
import { Search, MessageCircle, Calendar, User, Phone, Mail, CheckCircle, Clock, XCircle, Filter } from 'lucide-react';
import { useAuth } from '../../AuthContext';

const CustomerBookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
        mockService.getAgentBookings(user.id).then(data => {
            setBookings(data);
            setFilteredBookings(data);
            setIsLoading(false);
        });
    }
  }, [user]);

  useEffect(() => {
    let result = bookings;

    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(b => 
            (b.contactDetails?.name || '').toLowerCase().includes(query) ||
            b.productName.toLowerCase().includes(query) ||
            b.id.toString().includes(query)
        );
    }

    if (statusFilter !== 'all') {
        result = result.filter(b => b.status === statusFilter);
    }

    setFilteredBookings(result);
  }, [searchQuery, statusFilter, bookings]);

  const getStatusBadge = (status: BookingStatus) => {
      switch(status) {
          case BookingStatus.CONFIRMED: return <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1"/> Confirmed</span>;
          case BookingStatus.PENDING: return <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700"><Clock className="w-3 h-3 mr-1"/> Pending</span>;
          case BookingStatus.CANCELLED: return <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1"/> Cancelled</span>;
          case BookingStatus.COMPLETED: return <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700"><CheckCircle className="w-3 h-3 mr-1"/> Completed</span>;
          default: return null;
      }
  };

  const handleWhatsApp = (phone?: string) => {
      if (!phone) return;
      // Basic sanitization
      const cleanPhone = phone.replace(/\D/g, ''); 
      // Ensure international format (simplified for demo, assuming ID)
      const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
      
      window.open(`https://wa.me/${formattedPhone}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">Customer List</h2>
            <p className="text-gray-500 text-sm">Manage participants and contact them directly.</p>
        </div>
        
        <div className="flex gap-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search name, product..." 
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full md:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select 
                    className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white appearance-none cursor-pointer"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                </select>
            </div>
        </div>
      </div>

      {isLoading ? (
          <div className="text-center py-20 text-gray-500">Loading customers...</div>
      ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50">
                          <tr>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Service Details</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {filteredBookings.length === 0 ? (
                              <tr>
                                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm">
                                      No bookings found.
                                  </td>
                              </tr>
                          ) : (
                              filteredBookings.map((booking) => (
                                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                      <td className="px-6 py-4">
                                          <div className="flex items-center">
                                              <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold mr-3">
                                                  <User className="w-5 h-5" />
                                              </div>
                                              <div>
                                                  <div className="text-sm font-bold text-gray-900">{booking.contactDetails?.name || 'Unknown'}</div>
                                                  <div className="text-xs text-gray-500 flex items-center mt-0.5">
                                                      <Mail className="w-3 h-3 mr-1" /> {booking.contactDetails?.email}
                                                  </div>
                                                  <div className="text-xs text-gray-500 flex items-center mt-0.5">
                                                      <Phone className="w-3 h-3 mr-1" /> {booking.contactDetails?.phone}
                                                  </div>
                                              </div>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <div className="text-sm font-bold text-gray-900">{booking.productName}</div>
                                          <div className="text-xs text-gray-500 mt-1 flex items-center">
                                              <Calendar className="w-3 h-3 mr-1" /> {booking.date}
                                          </div>
                                          <div className="text-xs text-gray-500 mt-0.5">
                                              Qty: {booking.quantity} Guest(s)
                                          </div>
                                      </td>
                                      <td className="px-6 py-4">
                                          {getStatusBadge(booking.status)}
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                          {booking.contactDetails?.phone && (
                                              <button 
                                                  onClick={() => handleWhatsApp(booking.contactDetails?.phone)}
                                                  className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors border border-green-200"
                                              >
                                                  <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                                                  WhatsApp
                                              </button>
                                          )}
                                      </td>
                                  </tr>
                              ))
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      )}
    </div>
  );
};

export default CustomerBookings;
