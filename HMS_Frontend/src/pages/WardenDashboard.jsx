import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Users, Building, User, Clock, Calendar } from 'lucide-react';
import api from '../services/api';
import ChangePasswordForm from '../components/ChangePasswordForm';

const WardenOverview = () => {
  const [profile, setProfile] = useState(null);
  const [requestCount, setRequestCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, requestsRes] = await Promise.all([
          api.get('/profile/me'),
          api.get('/requests')
        ]);
        setProfile(profileRes.data);
        setRequestCount(requestsRes.data?.length || 0);
      } catch (err) {
        console.error('Failed to fetch warden data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="animate-pulse bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-32"></div>;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-2xl shadow-lg text-white">
        <h2 className="text-3xl font-extrabold mb-2">Welcome back, Warden {profile?.name || ''}! 👋</h2>
        <p className="text-indigo-100 text-lg opacity-90">Manage student allocations and keep track of daily attendance effectively.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="premium-card p-6">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Pending Requests</p>
          <div className="flex items-center gap-4">
            <div className="bg-amber-50 p-3 rounded-xl">
              <Clock className="text-amber-600" size={24} />
            </div>
            <div>
              <p className="text-3xl font-black text-amber-600">{requestCount}</p>
              <p className="text-xs text-slate-500 font-medium">Beds awaiting allocation</p>
            </div>
          </div>
        </div>
        <div className="premium-card p-6">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Today's Schedule</p>
          <div className="flex items-center gap-4">
            <div className="bg-indigo-50 p-3 rounded-xl">
              <Calendar className="text-indigo-600" size={24} />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              <p className="text-xs text-slate-500 font-medium">Ready for morning attendance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RequestsPanel = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/requests');
      setRequests(response.data);
    } catch (err) {
      console.error('Failed to fetch requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    try {
      await api.post(`/requests/${id}/${action}`);
      // Remove from list or refresh
      fetchRequests();
    } catch (err) {
      console.error(`Failed to ${action} request`, err);
      alert(`Error: Could not ${action} request.`);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Hostel Allocation Requests</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested Room</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td></tr>
            ) : requests.length > 0 ? (
              requests.map((req) => (
                <tr key={req._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.name || req.student?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.email || req.student?.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.year || req.student?.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {req.room ? `Room ${req.room.roomNumber} (Floor ${req.room.floor})` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => handleAction(req._id, 'approve')} className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md">Approve</button>
                    <button onClick={() => handleAction(req._id, 'reject')} className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md">Reject</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No pending requests</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AttendancePanel = () => {
  const [hostelId, setHostelId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [absentStudents, setAbsentStudents] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const response = await api.get('/hostels');
        setHostels(response.data.hostels || (Array.isArray(response.data) ? response.data : []));
      } catch (err) {
        console.error('Failed to fetch hostels', err);
      }
    };
    fetchHostels();
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      if (!hostelId) {
        setRooms([]);
        return;
      }
      try {
        const response = await api.get(`/rooms?hostelId=${hostelId}`);
        setRooms(response.data.rooms || (Array.isArray(response.data) ? response.data : []));
      } catch (err) {
        console.error('Failed to fetch rooms', err);
      }
    };
    fetchRooms();
  }, [hostelId]);

  const handleLoadStudents = async () => {
    if (!roomId) return;
    setLoading(true);
    setMessage('');
    try {
      const response = await api.get(`/profile/students?roomId=${roomId}`);
      setStudents(response.data);
      setAbsentStudents(new Set());
    } catch (err) {
      console.error('Failed to load students', err);
      setMessage('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = (studentId) => {
    const newAbsent = new Set(absentStudents);
    if (newAbsent.has(studentId)) {
      newAbsent.delete(studentId);
    } else {
      newAbsent.add(studentId);
    }
    setAbsentStudents(newAbsent);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setMessage('');
    try {
      await api.post('/attendance', {
        roomId,
        date,
        absentStudents: Array.from(absentStudents)
      });
      setMessage('Attendance submitted successfully');
      setStudents([]);
      setRoomId('');
      setHostelId('');
    } catch (err) {
      console.error('Failed to submit attendance', err);
      setMessage('Failed to submit attendance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Take Room Attendance</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hostel</label>
          <select 
            className="w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            value={hostelId} 
            onChange={e => {
              setHostelId(e.target.value);
              setRoomId('');
            }} 
          >
            <option value="">Select Hostel</option>
            {hostels.map(h => (
              <option key={h._id} value={h._id}>{h.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
          <select 
            className="w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            value={roomId} 
            onChange={e => setRoomId(e.target.value)}
            disabled={!hostelId}
          >
            <option value="">Select Room</option>
            {rooms.map(r => (
              <option key={r._id} value={r._id}>Room {r.roomNumber}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input 
            type="date" 
            className="w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            value={date} 
            onChange={e => setDate(e.target.value)} 
          />
        </div>
        <div className="flex items-end">
          <button 
            onClick={handleLoadStudents} 
            disabled={loading || !roomId} 
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
          >
            {loading ? 'Loading...' : 'Load Students'}
          </button>
        </div>
      </div>

      {message && <div className={`mb-4 text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</div>}

      {students.length > 0 && (
        <>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status (Uncheck if Absent)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map(item => (
                  <tr key={item.student._id} className={absentStudents.has(item.student._id) ? 'bg-red-50' : 'bg-green-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.profile?.roll || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input 
                        type="checkbox" 
                        className="h-5 w-5 text-indigo-600 rounded"
                        checked={!absentStudents.has(item.student._id)} 
                        onChange={() => toggleAttendance(item.student._id)} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 font-medium">
            {submitting ? 'Submitting...' : 'Submit Attendance'}
          </button>
        </>
      )}
    </div>
  );
};

const AbsenteesPanel = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hostelId, setHostelId] = useState('');
  const [hostels, setHostels] = useState([]);
  const [absentees, setAbsentees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const response = await api.get('/hostels');
        setHostels(response.data.hostels || (Array.isArray(response.data) ? response.data : []));
      } catch (err) {
        console.error('Failed to fetch hostels', err);
      }
    };
    fetchHostels();
  }, []);

  const fetchAbsentees = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/attendance/absent?date=${date}${hostelId ? `&hostelId=${hostelId}` : ''}`);
      setAbsentees(response.data);
    } catch (err) {
      console.error('Failed to fetch absentees', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsentees();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, hostelId]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Absentees List</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
          <input 
            type="date" 
            className="w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            value={date} 
            onChange={e => setDate(e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Hostel</label>
          <select 
            className="w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            value={hostelId} 
            onChange={e => setHostelId(e.target.value)} 
          >
            <option value="">All Hostels</option>
            {hostels.map(h => (
              <option key={h._id} value={h._id}>{h.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td></tr>
            ) : absentees.length > 0 ? (
              absentees.map((item, idx) => (
                <tr key={item.student?._id || idx}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.student?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.room?.roomNumber || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.profile?.department || 'N/A'}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">No absentees found for this date.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    try {
      const response = await api.get('/feedback');
      setFeedbacks(response.data);
    } catch (err) {
      console.error('Failed to fetch feedback', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleClose = async (id) => {
    try {
      await api.put(`/feedback/${id}/close`);
      fetchFeedback();
    } catch (err) {
      console.error('Failed to close feedback', err);
      alert('Could not close feedback.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Manage Feedback</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td></tr>
            ) : feedbacks.length > 0 ? (
              feedbacks.map((fb) => (
                <tr key={fb._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fb.student?.name || fb.studentName || 'Unknown'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">{fb.message}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${fb.status === 'closed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {fb.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {fb.status !== 'closed' && (
                      <button onClick={() => handleClose(fb._id)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md text-xs">
                        Mark as Closed
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No feedback found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StudentsPanel = () => {
  const [filters, setFilters] = useState({ hostelId: '', year: '', department: '' });
  const [students, setStudents] = useState([]);
  const [availableHostels, setAvailableHostels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchHostels = async () => {
    try {
      const response = await api.get('/hostels');
      setAvailableHostels(response.data.hostels || (Array.isArray(response.data) ? response.data : []));
    } catch (err) {
      console.error('Failed to fetch hostels for filtering', err);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.hostelId && filters.hostelId !== 'all') params.append('hostelId', filters.hostelId);
      if (filters.year) params.append('year', filters.year);
      if (filters.department) params.append('department', filters.department);

      const response = await api.get(`/profile/students?${params.toString()}`);
      setStudents(response.data);
    } catch (err) {
      console.error('Failed to fetch students', err);
      setError('Failed to fetch students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
    fetchStudents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Students List</h3>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <select 
          className="rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          value={filters.hostelId} 
          onChange={e => setFilters({...filters, hostelId: e.target.value})} 
        >
          <option value="">All Hostels</option>
          {availableHostels.map(h => (
            <option key={h._id} value={h._id}>{h.name}</option>
          ))}
        </select>
        <select 
          className="rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          value={filters.year} 
          onChange={e => setFilters({...filters, year: e.target.value})} 
        >
          <option value="">All Years</option>
          <option value="1">1st Year</option>
          <option value="2">2nd Year</option>
          <option value="3">3rd Year</option>
          <option value="4">4th Year</option>
        </select>
        <select 
          className="rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          value={filters.department} 
          onChange={e => setFilters({...filters, department: e.target.value})} 
        >
          <option value="">All Departments</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="EEE">EEE</option>
          <option value="CSM">CSM</option>
          <option value="CIV">CIV</option>
          <option value="MEC">MEC</option>
        </select>
        <button onClick={fetchStudents} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 text-sm font-medium">
          Filter
        </button>
      </div>

      {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td></tr>
            ) : students.length > 0 ? (
              students.map((item, idx) => (
                <tr key={item.student?._id || idx}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.student?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.profile?.roll || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.profile?.department || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.room?.roomNumber || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No students found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
 
const ProfilePanel = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
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
    fetchProfile();
  }, []);
 
  if (loading) return <div className="p-4 bg-white rounded shadow">Loading profile...</div>;
 
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
        <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <User className="text-indigo-600" size={24} />
          My Profile
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
          <div>
            <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Name</label>
            <p className="text-lg font-bold text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100">{profile?.name || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Email</label>
            <p className="text-lg font-bold text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100">{profile?.email || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Role</label>
            <p className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full w-max uppercase tracking-tight">{profile?.role || 'Warden'}</p>
          </div>
        </div>
      </div>
 
      <ChangePasswordForm />
    </div>
  );
};
 
const WardenDashboard = () => {
  return (
    <div className="space-y-6">
      <Routes>
        <Route path="/" element={<WardenOverview />} />
        <Route path="/requests" element={<RequestsPanel />} />
        <Route path="/attendance" element={<AttendancePanel />} />
        <Route path="/absentees" element={<AbsenteesPanel />} />
        <Route path="/students" element={<StudentsPanel />} />
        <Route path="/feedback" element={<FeedbackManagement />} />
        <Route path="/profile" element={<ProfilePanel />} />
      </Routes>
    </div>
  );
};

export default WardenDashboard;
