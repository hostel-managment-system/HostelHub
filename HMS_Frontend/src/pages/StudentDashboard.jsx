import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Building, Users, Calendar } from 'lucide-react';
import api from '../services/api';
import InternalAllocationModal from '../components/InternalAllocationModal';
import ChangePasswordForm from '../components/ChangePasswordForm';

const StudentOverview = () => {
  const [profile, setProfile] = useState(null);
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile/me');
      setProfile(response.data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  const fetchAllocation = async () => {
    try {
      const response = await api.get('/profile/allocation');
      setAllocation(response.data);
    } catch (err) {
      console.error('Failed to fetch allocation', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchAllocation()]);
      setLoading(false);
    };
    init();
  }, []);

  if (loading) return <div className="animate-pulse bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-32"></div>;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-900 p-8 rounded-2xl shadow-lg text-white">
        <div className="animate-fade-in-scale">
          <h2 className="text-3xl font-extrabold mb-2 text-white">Welcome back, {profile?.name || 'Student'}! 👋</h2>
          <p className="text-indigo-100 text-lg opacity-90 font-medium">Your personal HostelHub dashboard for managing residence life.</p>
        </div>
        {profile?.hostelStatus !== 'approved' && (
          <button 
            onClick={() => setShowApplyModal(true)}
            className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 shadow-md transition-all whitespace-nowrap"
          >
            Apply for Room
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.15em] mb-2">Hostel Status</p>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${profile?.hostelStatus === 'approved' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
              <Building className={profile?.hostelStatus === 'approved' ? 'text-emerald-600' : 'text-amber-600'} size={20} />
            </div>
            <p className={`text-2xl font-black ${profile?.hostelStatus === 'approved' ? 'text-emerald-600' : 'text-amber-600'}`}>
              {profile?.hostelStatus === 'approved' ? 'Allocated' : 'Not Allocated'}
            </p>
          </div>
        </div>
        <div className="premium-card p-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.15em] mb-2">Department</p>
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
              <Users size={20} />
            </div>
            <p className="text-2xl font-black text-slate-900">{profile?.department || 'Not Updated'}</p>
          </div>
        </div>
        <div className="premium-card p-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.15em] mb-2">Year of Study</p>
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
              <Calendar size={20} />
            </div>
            <p className="text-2xl font-black text-slate-900">{profile?.year ? `Year ${profile.year}` : 'Not Updated'}</p>
          </div>
        </div>
      </div>

      {profile?.hostelStatus === 'approved' && allocation?.allocated && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Building className="text-indigo-600" size={20} />
              My Room Details
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500">Hostel</span>
                <span className="font-semibold text-gray-800">{allocation.room?.hostel?.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Room Number</span>
                <span className="font-bold text-indigo-600 text-lg">{allocation.room?.roomNumber}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500">Floor</span>
                <span className="font-semibold text-gray-800">{allocation.room?.floor === 0 ? 'Ground' : `${allocation.room?.floor}${allocation.room?.floor === 1 ? 'st' : allocation.room?.floor === 2 ? 'nd' : allocation.room?.floor === 3 ? 'rd' : 'th'} Floor`}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">Capacity & Availability</span>
                <div className="text-right">
                  <span className="block font-semibold text-gray-800">{allocation.room?.capacity} Beds</span>
                  <span className="block text-xs text-gray-500">{allocation.room?.capacity - (allocation.room?.occupied || 0)} available</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="text-indigo-600" size={20} />
              Roommates
            </h3>
            {allocation.roommates?.length > 0 ? (
              <div className="space-y-3">
                {allocation.roommates.map((roommate, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                      {roommate.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{roommate.name}</p>
                      <p className="text-xs text-gray-500">{roommate.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <Users size={40} className="mb-2 opacity-20" />
                <p>No roommates found</p>
              </div>
            )}
          </div>
        </div>
      )}

      <InternalAllocationModal 
        isOpen={showApplyModal} 
        onClose={() => setShowApplyModal(false)} 
        userProfile={profile}
        onSuccess={fetchProfile}
      />
    </div>
  );
};

const ProfilePanel = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    roll: '',
    department: '',
    year: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile/me');
      setProfile(response.data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    // Extract only allowed fields
    const { roll, department, year, phone, address } = profile;
    
    try {
      await api.post('/profile/me', { roll, department, year, phone, address });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      fetchProfile();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4 bg-white rounded shadow">Loading profile...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-3xl">
      <h3 className="text-xl font-bold mb-4 text-gray-800">My Profile</h3>
      
      {message.text && (
        <div className={`p-4 mb-4 rounded-md ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Read Only Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" disabled className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm p-2 border" value={profile.name || ''} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" disabled className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm p-2 border" value={profile.email || ''} />
          </div>
          
          {/* Editable Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Roll/USN</label>
            <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" value={profile.roll || ''} onChange={e => setProfile({...profile, roll: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <select 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" 
              value={profile.department || ''} 
              onChange={e => setProfile({...profile, department: e.target.value})}
            >
              <option value="">Select Department</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="CSM">CSM</option>
              <option value="CIV">CIV</option>
              <option value="MEC">MEC</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Year</label>
            <select 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" 
              value={profile.year || ''} 
              onChange={e => setProfile({...profile, year: e.target.value})}
            >
              <option value="">Select Year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <textarea rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" value={profile.address || ''} onChange={e => setProfile({...profile, address: e.target.value})}></textarea>
        </div>

        <button type="submit" disabled={saving} className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {saving ? 'Updating...' : 'Update Profile'}
        </button>
      </form>

      <div className="mt-12 pt-8 border-t border-gray-100">
        <ChangePasswordForm />
      </div>
    </div>
  );
};

const AttendanceHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/attendance/my?days=7');
        setHistory(response.data);
      } catch (err) {
        console.error('Failed to fetch attendance history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Attendance History (Last 7 Days)</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="2" className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td></tr>
            ) : history.length > 0 ? (
              history.map((record, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="2" className="px-6 py-4 text-center text-sm text-gray-500">No attendance records found for the last 7 days.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const FeedbackPanel = () => {
  const [formData, setFormData] = useState({ message: '', category: 'complaint' });
  const [myFeedback, setMyFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const fetchMyFeedback = async () => {
    try {
      const response = await api.get('/feedback/my');
      setMyFeedback(response.data);
    } catch (err) {
      console.error('Failed to fetch my feedback', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyFeedback();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage({ type: '', text: '' });
    try {
      await api.post('/feedback', formData);
      setStatusMessage({ type: 'success', text: 'Feedback submitted successfully.' });
      setFormData({ message: '', category: 'complaint' });
      fetchMyFeedback(); // Refresh list
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit feedback.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-3xl">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Submit Feedback</h3>
        {statusMessage.text && (
          <div className={`p-4 mb-4 rounded-md ${statusMessage.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {statusMessage.text}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="complaint">Complaint</option>
              <option value="suggestion">Suggestion</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Message</label>
            <textarea required rows="4" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder="Describe your issue or suggestion..."></textarea>
          </div>
          <button type="submit" disabled={submitting} className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold mb-4 text-gray-800">My Feedback History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td></tr>
              ) : myFeedback.length > 0 ? (
                myFeedback.map((fb, idx) => (
                  <tr key={fb._id || idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(fb.createdAt || Date.now()).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{fb.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-sm truncate">{fb.message}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${fb.status === 'closed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {fb.status || 'open'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No feedback history found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  return (
    <div className="space-y-6">
      <Routes>
        <Route path="/" element={<StudentOverview />} />
        <Route path="/profile" element={<ProfilePanel />} />
        <Route path="/attendance" element={<AttendanceHistory />} />
        <Route path="/feedback" element={<FeedbackPanel />} />
      </Routes>
    </div>
  );
};

export default StudentDashboard;
