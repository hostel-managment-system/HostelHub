import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { X, User, Mail, Phone, Calendar, Building, Hash, CreditCard, Send } from 'lucide-react';

const AllocationRequestModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    year: '',
    hostelId: '',
    roomId: '',
    transactionId: ''
  });
  const [hostels, setHostels] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/hostels');
      setHostels(response.data.hostels || (Array.isArray(response.data) ? response.data : []));
    } catch (err) {
      console.error('Failed to fetch hostels', err);
      setMessage({ type: 'error', text: 'Failed to load hostel data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchRoomsForHostel = async () => {
      if (!formData.hostelId) {
        setFilteredRooms([]);
        return;
      }
      
      try {
        const response = await api.get(`/rooms?hostelId=${formData.hostelId}`);
        const allRooms = response.data.rooms || (Array.isArray(response.data) ? response.data : []);
        // Only show rooms with vacancy
        const available = allRooms.filter(r => (r.capacity > r.occupied));
        setFilteredRooms(available);
      } catch (err) {
        console.error('Failed to fetch rooms', err);
      }
    };

    fetchRoomsForHostel();
  }, [formData.hostelId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/requests', {
        ...formData,
        year: Number(formData.year)
      });
      setMessage({ type: 'success', text: 'Your application has been submitted successfully! Please wait for warden approval.' });
      setTimeout(() => {
        onClose();
        setFormData({ name: '', email: '', phone: '', year: '', hostelId: '', roomId: '', transactionId: '' });
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit application.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Request Room Allocation</h2>
            <p className="text-sm text-gray-500 mt-1">Fill in the details to apply for a hostel room</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {message.text && (
            <div className={`p-4 rounded-xl flex items-center space-x-3 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              <div className={`p-2 rounded-full ${message.type === 'error' ? 'bg-red-100' : 'bg-green-100'}`}>
                {message.type === 'error' ? <X className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              </div>
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  required
                  type="text"
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  required
                  type="email"
                  placeholder="john@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  required
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            {/* Year */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">Year of Study</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm appearance-none"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>

            {/* Hostel */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">Preferred Hostel</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Building className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm appearance-none"
                  value={formData.hostelId}
                  onChange={(e) => setFormData({...formData, hostelId: e.target.value, roomId: ''})}
                >
                  <option value="">Select Hostel</option>
                  {hostels.map(h => (
                    <option key={h._id} value={h._id}>{h.name} ({h.gender})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Room */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">Preferred Room</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Hash className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  required
                  disabled={!formData.hostelId}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                  value={formData.roomId}
                  onChange={(e) => setFormData({...formData, roomId: e.target.value})}
                >
                  <option value="">{formData.hostelId ? 'Select Room' : 'Select Hostel First'}</option>
                  {filteredRooms.map(r => (
                    <option key={r._id} value={r._id}>Room {r.roomNumber} (Floor {r.floor})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Transaction ID */}
          <div className="space-y-1.5 pt-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Transaction ID (Payment Verification)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <CreditCard className="h-4 w-4 text-gray-400" />
              </div>
              <input
                required
                type="text"
                placeholder="TRX12345678"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm font-mono"
                value={formData.transactionId}
                onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
              />
            </div>
            <p className="text-[10px] text-gray-400 ml-1">Please provide the transaction ID from your room allocation fee payment.</p>
          </div>

          <div className="pt-4 sticky bottom-0 bg-white bg-opacity-90 backdrop-blur-sm -mx-6 px-6 pb-2">
            <button
              type="submit"
              disabled={submitting || loading}
              className={`w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <Send className={`w-5 h-5 ${submitting ? 'animate-pulse' : ''}`} />
              <span>{submitting ? 'Submitting Application...' : 'Submit Room Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AllocationRequestModal;
