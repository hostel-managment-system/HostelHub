import React, { useState, useEffect } from 'react';
import { X, Building, CheckCircle } from 'lucide-react';
import api from '../services/api';

const InternalAllocationModal = ({ isOpen, onClose, userProfile, onSuccess }) => {
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    hostelId: '',
    roomId: '',
    transactionId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchHostels();
    }
  }, [isOpen]);

  const fetchHostels = async () => {
    try {
      const response = await api.get('/hostels');
      setHostels(response.data.hostels || (Array.isArray(response.data) ? response.data : []));
    } catch (err) {
      console.error('Failed to fetch hostels', err);
    }
  };

  useEffect(() => {
    const fetchRooms = async () => {
      if (!formData.hostelId) {
        setRooms([]);
        return;
      }
      try {
        const response = await api.get(`/rooms?hostelId=${formData.hostelId}`);
        // Filter out full rooms
        const availableRooms = (response.data.rooms || (Array.isArray(response.data) ? response.data : []))
          .filter(r => r.occupied < r.capacity);
        setRooms(availableRooms);
      } catch (err) {
        console.error('Failed to fetch rooms', err);
      }
    };
    fetchRooms();
  }, [formData.hostelId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/requests', {
        name: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone || 'N/A',
        year: userProfile.year || 1,
        roomId: formData.roomId,
        transactionId: formData.transactionId
      });
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Apply for Room Allocation</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Request Submitted!</h3>
              <p className="text-gray-600 mb-6">Your room allocation request has been sent to the warden for approval.</p>
              <button 
                onClick={onClose}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Hostel</label>
                <select 
                  required
                  className="w-full rounded-xl border-gray-300 shadow-sm p-3 border focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  value={formData.hostelId}
                  onChange={e => setFormData({...formData, hostelId: e.target.value, roomId: ''})}
                >
                  <option value="">Select a Hostel</option>
                  {hostels.map(h => (
                    <option key={h._id} value={h._id}>{h.name} ({h.gender})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Room</label>
                <select 
                  required
                  disabled={!formData.hostelId}
                  className="w-full rounded-xl border-gray-300 shadow-sm p-3 border focus:ring-2 focus:ring-indigo-500 transition-all outline-none disabled:bg-gray-50"
                  value={formData.roomId}
                  onChange={e => setFormData({...formData, roomId: e.target.value})}
                >
                  <option value="">{formData.hostelId ? 'Select a Room' : 'Select Hostel first'}</option>
                  {rooms.map(r => (
                    <option key={r._id} value={r._id}>Room {r.roomNumber} (Floor {r.floor}) - {r.capacity - r.occupied} left</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fee Payment Transcation ID</label>
                <input 
                  required
                  type="text"
                  placeholder="Enter Transaction ID"
                  className="w-full rounded-xl border-gray-300 shadow-sm p-3 border focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  value={formData.transactionId}
                  onChange={e => setFormData({...formData, transactionId: e.target.value})}
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default InternalAllocationModal;
