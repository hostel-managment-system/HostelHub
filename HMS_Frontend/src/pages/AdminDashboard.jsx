import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Plus, Users, Building, Trash2, RefreshCw, LogOut, ArrowLeft, Send, CheckCircle, Clock, Search, Filter, 
  Menu, X, User, LayoutDashboard, Settings, FileText, PieChart, Shield, History, Eye, EyeOff
} from 'lucide-react';
import ChangePasswordForm from '../components/ChangePasswordForm';

const AdminOverview = () => {
  const [profile, setProfile] = useState(null);
  const [hostelCount, setHostelCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, hostelsRes] = await Promise.all([
          api.get('/profile/me'),
          api.get('/hostels?all=true')
        ]);
        setProfile(profileRes.data);
        setHostelCount(hostelsRes.data.hostels?.length || (Array.isArray(hostelsRes.data) ? hostelsRes.data.length : 0));
      } catch (err) {
        console.error('Failed to fetch admin data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="animate-pulse bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-32"></div>;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-800 to-indigo-900 p-8 rounded-2xl shadow-lg text-white">
        <h2 className="text-3xl font-extrabold mb-2 text-white">Welcome, Admin! 👑</h2>
        <p className="text-indigo-100 text-lg opacity-90">Centralized control for all HostelHub activities across multiple hostels.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="premium-card p-6">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Hostels</p>
          <div className="flex items-center gap-4">
            <div className="bg-indigo-50 p-3 rounded-xl">
              <Building className="text-indigo-600" size={24} />
            </div>
            <p className="text-3xl font-black text-slate-900">{hostelCount}</p>
          </div>
        </div>
        <div className="premium-card p-6">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">System Status</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center bg-emerald-50 p-3 rounded-xl">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
            </div>
            <p className="text-lg font-bold text-slate-700">All systems operational</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const WardensPanel = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'warden' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/create-warden', formData);
      setMessage({ type: 'success', text: 'Warden created successfully!' });
      setFormData({ name: '', email: '', password: '', role: 'warden' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create warden.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Create New Warden</h3>
      {message.text && (
        <div className={`p-4 mb-4 rounded-md ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input required type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input required type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input required type="password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
        </div>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Warden'}
        </button>
      </form>
    </div>
  );
};

const HostelsPanel = () => {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'boys', floors: 1 });
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const fetchHostels = async () => {
    setLoading(true);
    try {
      const response = await api.get('/hostels?all=true');
      setHostels(response.data.hostels || (Array.isArray(response.data) ? response.data : []));
    } catch (err) {
      console.error('Failed to fetch hostels', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/hostels', { name: formData.name, gender: formData.type, totalFloors: Number(formData.floors) });
      setMessage({ type: 'success', text: 'Hostel created successfully!' });
      setFormData({ name: '', type: 'boys', floors: 1 });
      setShowCreate(false);
      fetchHostels();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create hostel.' });
    }
  };

  const handleReset = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('WARNING: This will remove all students from this hostel and empty all rooms. Student accounts will remain but they will need to be re-allocated. Are you sure?')) return;
    
    try {
      await api.post(`/hostels/${id}/reset`);
      setMessage({ type: 'success', text: 'Hostel reset successfully. All rooms are empty.' });
      fetchHostels();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to reset hostel.' });
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('WARNING: This will delete the hostel, all its rooms, and reset all student allocations for this hostel. This is intended for annual system resets. Are you sure you want to proceed?')) return;
    try {
      await api.delete(`/hostels/${id}`);
      setMessage({ type: 'success', text: 'Hostel and all associated data deleted successfully.' });
      fetchHostels();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete hostel.' });
    }
  };

  const handleToggleActive = async (e, id) => {
    e.stopPropagation();
    try {
      await api.patch(`/hostels/${id}/toggle-active`);
      fetchHostels();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to toggle hostel status.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Hostels Management</h2>
          <p className="text-gray-600 text-sm mt-1">Select a hostel to manage its rooms</p>
        </div>
        <button 
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Hostel
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-md ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message.text}
        </div>
      )}

      {showCreate && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-bold mb-4 text-gray-800">New Hostel Details</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Hostel Name</label>
              <input required type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Boys Hostel A" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="boys">Boys</option>
                <option value="girls">Girls</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Number of Floors</label>
              <input required type="number" min="1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" value={formData.floors} onChange={e => setFormData({...formData, floors: e.target.value})} />
            </div>
            <div className="md:col-span-3 flex justify-end mt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 mr-2 text-gray-600 hover:text-gray-800 bg-gray-100 rounded-md">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm">Save Hostel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : hostels.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
          <Building className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No hostels found</h3>
          <p className="mt-1 text-gray-500">Get started by creating a new hostel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hostels.map(hostel => (
            <div 
              key={hostel._id}
              onClick={() => navigate(`/admin-dashboard/hostels/${hostel._id}`)}
              className={`premium-card overflow-hidden cursor-pointer group ${!hostel.isActive ? 'opacity-75 grayscale-[0.5]' : ''}`}
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${hostel.gender === 'girls' ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'}`}>
                      <Building className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{hostel.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{hostel.gender} Hostel</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-medium text-gray-500 uppercase">Floors</span>
                    <span className="mt-1 block text-lg font-semibold text-gray-800">{hostel.totalFloors || 1}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-gray-500 uppercase">Status</span>
                    <span className={`mt-1 block text-sm font-medium rounded-full px-2 py-0.5 w-max ${hostel.isActive ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-100'}`}>
                      {hostel.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
                <span className="text-sm text-indigo-600 font-medium group-hover:underline">View Rooms</span>
                <div className="flex space-x-2">
                  <button 
                    onClick={(e) => handleToggleActive(e, hostel._id)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                    title={hostel.isActive ? "Deactivate Hostel" : "Activate Hostel"}
                  >
                    {hostel.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset(e, hostel._id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                    title="Annual Reset (Empty Rooms)"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, hostel._id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete Hostel"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const HostelDetails = () => {
  const { hostelId } = useParams();
  const navigate = useNavigate();
  const [hostel, setHostel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ floor: 1, roomNumber: '', capacity: 2 });
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchHostelData = async () => {
    setLoading(true);
    try {
      // Since specific endpoints map to generic ones, fall back gracefully
      let hostelData = null;
      let roomsData = [];

      try {
        const [hostelRes, roomsRes] = await Promise.all([
          api.get(`/hostels/${hostelId}`),
          api.get(`/rooms?hostelId=${hostelId}&all=true`)
        ]);
        hostelData = hostelRes.data;
        roomsData = roomsRes.data.rooms || roomsRes.data;
      } catch (err) {
        // Fallback for missing direct endpoints
        try {
          const allHostels = await api.get('/hostels?all=true');
          const hostelsList = allHostels.data.hostels || (Array.isArray(allHostels.data) ? allHostels.data : []);
          hostelData = hostelsList.find(h => h._id === hostelId) || { name: 'Unknown Hostel', _id: hostelId };
          
          const allRooms = await api.get('/rooms?all=true');
          const roomsList = allRooms.data.rooms || (Array.isArray(allRooms.data) ? allRooms.data : []);
          roomsData = roomsList.filter(r => r.hostel?._id === hostelId || r.hostel === hostelId);
        } catch (innerErr) {
          console.error("Failed fallback fetch", innerErr);
        }
      }

      setHostel(hostelData);
      setRooms(roomsData);
    } catch (err) {
      console.error('Failed to load hostel data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostelData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostelId]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      await api.post('/rooms', { 
        ...formData, 
        hostelId, // Inject the current hostel ID matching backend req.body
        floor: Number(formData.floor), 
        capacity: Number(formData.capacity) 
      });
      setMessage({ type: 'success', text: 'Room created successfully!' });
      setFormData({ floor: 1, roomNumber: '', capacity: 2 });
      setShowCreate(false);
      fetchHostelData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create room.' });
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      await api.delete(`/rooms/${roomId}`);
      fetchHostelData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete room.');
    }
  };

  const handleToggleRoomActive = async (roomId) => {
    try {
      await api.patch(`/rooms/${roomId}/toggle-active`);
      fetchHostelData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle room status.');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-4">
        <button onClick={() => navigate('/admin-dashboard/hostels')} className="p-2 bg-white rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{hostel?.name || 'Hostel Details'}</h2>
          <p className="text-sm text-gray-500">Manage rooms for this hostel</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div className="flex space-x-8">
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Rooms</span>
            <span className="mt-1 block text-2xl font-bold text-gray-900">{rooms.length}</span>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Hostel Type</span>
            <span className="mt-1 block text-lg font-medium text-gray-800 capitalize">{hostel?.gender || 'N/A'}</span>
          </div>
        </div>
        <button 
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Room
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-md ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message.text}
        </div>
      )}

      {showCreate && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4 text-gray-800">New Room Details</h3>
          <form onSubmit={handleCreateRoom} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Room Number</label>
              <input required type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" value={formData.roomNumber} onChange={e => setFormData({...formData, roomNumber: e.target.value})} placeholder="e.g. 101" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Floor</label>
              <input required type="number" min="0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" value={formData.floor} onChange={e => setFormData({...formData, floor: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Capacity (Beds)</label>
              <input required type="number" min="1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
            </div>
            <div className="md:col-span-3 flex justify-end mt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 mr-2 text-gray-600 hover:text-gray-800 bg-gray-100 rounded-md">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm">Save Room</button>
            </div>
          </form>
        </div>
      )}

      {rooms.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 flex items-center justify-center rounded-full mb-4">
            <Building className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No rooms generated</h3>
          <p className="mt-1 text-gray-500 max-w-sm mx-auto">This hostel doesn't have any rooms yet. Click 'Add Room' to create one.</p>
        </div>
      ) : (
        <div className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Room N°</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Floor</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rooms.map(room => (
                <tr key={room._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{room.roomNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">Floor {room.floor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-col">
                      <span className="flex items-center font-semibold text-gray-900">
                        <Users className="w-4 h-4 mr-1.5 text-indigo-400" />
                        {room.capacity} Beds
                      </span>
                      <span className={`text-xs mt-0.5 ml-5 ${room.capacity - (room.occupied || 0) === 0 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                        {room.capacity - (room.occupied || 0)} available
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${room.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                      {room.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                    <button 
                      onClick={() => handleToggleRoomActive(room._id)}
                      className={`p-2 rounded-lg transition-colors inline-flex ${room.isActive ? 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50' : 'text-indigo-600 bg-indigo-50'}`}
                      title={room.isActive ? "Deactivate Room" : "Activate Room"}
                    >
                      {room.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => handleDeleteRoom(room._id)}
                      className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors inline-flex"
                      title="Delete Room"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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

const FeedbackPanel = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchFeedback();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Student Feedback</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td></tr>
            ) : feedbacks.length > 0 ? (
              feedbacks.map((fb, idx) => (
                <tr key={fb._id || idx}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fb.student?.name || fb.studentName || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{fb.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{fb.message}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${fb.status === 'closed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {fb.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No feedback submitted</td></tr>
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
          Admin Profile
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
          <div>
            <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Name</label>
            <p className="text-lg font-bold text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100">Admin</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Email</label>
            <p className="text-lg font-bold text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100">{profile?.email || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">System Role</label>
            <p className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full w-max uppercase tracking-tight">{profile?.role || 'Administrator'}</p>
          </div>
        </div>
      </div>
 
      <ChangePasswordForm />
    </div>
  );
};
 
const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <Routes>
        <Route path="/" element={<AdminOverview />} />
        <Route path="/wardens" element={<WardensPanel />} />
        <Route path="/hostels" element={<HostelsPanel />} />
        <Route path="/hostels/:hostelId" element={<HostelDetails />} />
        <Route path="/students" element={<StudentsPanel />} />
        <Route path="/feedback" element={<FeedbackPanel />} />
        <Route path="/profile" element={<ProfilePanel />} />
      </Routes>
    </div>
  );
};

export default AdminDashboard;
