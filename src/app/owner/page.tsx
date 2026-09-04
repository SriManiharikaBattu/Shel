'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import { Plus, Trash2, Check, RefreshCw, X, Sliders, LayoutDashboard, ToggleLeft, ToggleRight, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

const AMENITIES_LIST = ['WiFi', 'Food Included', 'Laundry', 'CCTV', 'Power Backup', 'Gym', 'Parking'];

export default function OwnerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Add property modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPropName, setNewPropName] = useState('');
  const [newPropAddress, setNewPropAddress] = useState('');
  const [newPropCity, setNewPropCity] = useState('Hyderabad');
  const [newPropLat, setNewPropLat] = useState('17.4849');
  const [newPropLng, setNewPropLng] = useState('78.3889');
  const [newPropGender, setNewPropGender] = useState('BOYS');
  const [newPropAC, setNewPropAC] = useState('AC');
  const [newPropDesc, setNewPropDesc] = useState('');
  const [newPropAmenities, setNewPropAmenities] = useState<string[]>([]);
  const [newPropRules, setNewPropRules] = useState<string[]>(['No smoking inside rooms', 'Gate closes at 10:30 PM']);
  const [newRuleInput, setNewRuleInput] = useState('');
  const [newPropImages, setNewPropImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80'
  ]);
  const [newImageInput, setNewImageInput] = useState('');
  
  // New property initial rooms config
  const [newRooms, setNewRooms] = useState<any[]>([
    { sharingType: 'SINGLE', price: 10000, totalBeds: 5 },
    { sharingType: 'DOUBLE', price: 7500, totalBeds: 10 },
  ]);

  // Manage rooms modal state (Vacancy control)
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showRoomsModal, setShowRoomsModal] = useState(false);

  const fetchOwnerProperties = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/owner/properties');
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
      }
    } catch (e) {
      console.error('Error fetching owner properties:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'OWNER')) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchOwnerProperties();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16]">
        <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
          <RefreshCw className="animate-spin" />
          <span>Opening Owner Dashboard...</span>
        </div>
      </div>
    );
  }

  // Toggle active/inactive status
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/owner/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        setProperties((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isActive: !currentStatus } : p))
        );
        setSuccessMsg(`Status updated successfully.`);
        setTimeout(() => setSuccessMsg(''), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete property
  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property? This cannot be undone.')) return;

    try {
      const res = await fetch(`/api/owner/properties/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProperties((prev) => prev.filter((p) => p.id !== id));
        setSuccessMsg('Property removed.');
        setTimeout(() => setSuccessMsg(''), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Adjust Room Available Beds (Quick Vacancy controller)
  const handleAdjustVacancy = async (roomId: string, currentBeds: number, delta: number, maxBeds: number) => {
    const newBeds = currentBeds + delta;
    if (newBeds < 0 || newBeds > maxBeds) return;

    try {
      const res = await fetch(`/api/owner/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availableBeds: newBeds }),
      });
      if (res.ok) {
        setSelectedProperty((prev: any) => ({
          ...prev,
          rooms: prev.rooms.map((r: any) =>
            r.id === roomId ? { ...r, availableBeds: newBeds } : r
          ),
        }));
        fetchOwnerProperties();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add rule in form
  const handleAddRule = () => {
    if (newRuleInput.trim()) {
      setNewPropRules((prev) => [...prev, newRuleInput.trim()]);
      setNewRuleInput('');
    }
  };

  const handleRemoveRule = (idx: number) => {
    setNewPropRules((prev) => prev.filter((_, i) => i !== idx));
  };

  // Add image in form
  const handleAddImage = () => {
    if (newImageInput.trim()) {
      setNewPropImages((prev) => [...prev, newImageInput.trim()]);
      setNewImageInput('');
    }
  };

  const handleRemoveImage = (idx: number) => {
    setNewPropImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Handle Create Property Submit
  const handleAddPropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newRooms.some((r) => !r.price || !r.totalBeds)) {
      setErrorMsg('Please specify rent and total beds for all room configurations.');
      return;
    }

    try {
      const res = await fetch('/api/owner/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPropName,
          address: newPropAddress,
          city: newPropCity,
          latitude: newPropLat,
          longitude: newPropLng,
          genderType: newPropGender,
          acType: newPropAC,
          description: newPropDesc,
          houseRules: newPropRules,
          images: newPropImages,
          amenities: newPropAmenities,
          rooms: newRooms,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to list property');
      
      setSuccessMsg('New PG Listed successfully! Under verification process.');
      setShowAddModal(false);
      
      setNewPropName('');
      setNewPropAddress('');
      setNewPropDesc('');
      setNewPropAmenities([]);
      
      fetchOwnerProperties();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error listing property');
    }
  };

  // Calculate Dashboard Summary Stats
  const totalListings = properties.length;
  const activeListings = properties.filter((p) => p.isActive).length;
  const totalEnquiries = properties.reduce((acc, p) => acc + p.enquiryCount, 0);
  
  const totalBedsListed = properties.reduce((acc, p) => acc + p.totalBeds, 0);
  const totalBedsOccupied = properties.reduce((acc, p) => acc + p.occupiedBeds, 0);
  const averageOccupancy = totalBedsListed > 0 ? (totalBedsOccupied / totalBedsListed) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 pb-20 font-sans selection:bg-emerald-500 selection:text-black">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Banner messages */}
        {successMsg && (
          <div className="p-3 bg-emerald-950/70 text-emerald-300 text-sm rounded-xl border border-emerald-800">
            {successMsg}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <LayoutDashboard className="text-emerald-400" />
              <span>Owner Management Panel</span>
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">Manage your PGs, adjust beds availability, and reply to seeker inquiries.</p>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl text-slate-950 font-bold bg-emerald-500 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 text-sm"
          >
            <Plus size={18} />
            <span>List New PG / Hostel</span>
          </button>
        </div>

        {/* Analytics Summary */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-[#0e1424] p-5 rounded-2xl border border-slate-800 shadow-xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Listings</span>
            <span className="block text-3xl font-black text-white mt-1">{totalListings}</span>
          </div>

          <div className="bg-[#0e1424] p-5 rounded-2xl border border-slate-800 shadow-xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Listings</span>
            <span className="block text-3xl font-black text-emerald-400 mt-1">{activeListings}</span>
          </div>

          <div className="bg-[#0e1424] p-5 rounded-2xl border border-slate-800 shadow-xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Enquiries</span>
            <span className="block text-3xl font-black text-cyan-400 mt-1">{totalEnquiries}</span>
          </div>

          <div className="bg-[#0e1424] p-5 rounded-2xl border border-slate-800 shadow-xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Occupancy Rate</span>
            <span className="block text-3xl font-black text-amber-400 mt-1">
              {averageOccupancy.toFixed(0)}%
            </span>
          </div>
        </section>

        {/* Properties Listings Grid */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">Listed Accommodations</h2>

          {properties.length === 0 ? (
            <div className="bg-[#0e1424] rounded-2xl p-12 border border-slate-800 text-center shadow-xl space-y-3">
              <ShieldAlert className="mx-auto text-slate-600" size={48} />
              <h2 className="text-lg font-bold text-white">No properties listed yet</h2>
              <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                Click on the "List New PG / Hostel" button to create your first PG listing on Shel.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {properties.map((prop) => (
                <div key={prop.id} className="bg-[#0e1424] rounded-2xl border border-slate-800 shadow-xl p-6 space-y-4 flex flex-col justify-between">
                  <div>
                    {/* Header: Name, Verification, Status Toggle */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-extrabold text-white text-lg">{prop.name}</h3>
                        <p className="text-slate-400 text-xs mt-0.5">{prop.address}</p>
                      </div>
                      
                      {/* Active Toggle Button */}
                      <button
                        onClick={() => handleToggleActive(prop.id, prop.isActive)}
                        className={`focus:outline-none transition-colors ${
                          prop.isActive ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-600 hover:text-slate-500'
                        }`}
                        title={prop.isActive ? 'Deactivate listing' : 'Activate listing'}
                      >
                        {prop.isActive ? <ToggleRight size={38} /> : <ToggleLeft size={38} />}
                      </button>
                    </div>

                    {/* Quick Info Badges */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-[10px] font-bold text-slate-300 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded uppercase">
                        {prop.genderType} PG
                      </span>
                      <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded uppercase">
                        {prop.acType} Room
                      </span>
                      {prop.isVerified ? (
                        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700/80 flex items-center gap-1 py-0.5 px-2 rounded uppercase">
                          <CheckCircle2 size={11} className="text-emerald-400" /> Verified
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded uppercase">
                          Reviewing Verify
                        </span>
                      )}
                    </div>

                    {/* Analytics Preview */}
                    <div className="grid grid-cols-3 gap-3 border-y border-slate-800 py-3.5 my-4">
                      <div className="text-center">
                        <span className="text-slate-500 text-[10px] font-bold uppercase block">Views</span>
                        <span className="text-white font-black text-lg">{prop.views}</span>
                      </div>
                      <div className="text-center border-x border-slate-800">
                        <span className="text-slate-500 text-[10px] font-bold uppercase block">Enquiries</span>
                        <span className="text-cyan-400 font-black text-lg">{prop.enquiryCount}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-slate-500 text-[10px] font-bold uppercase block">Occupancy</span>
                        <span className="text-amber-400 font-black text-lg">{prop.occupancyRate.toFixed(0)}%</span>
                      </div>
                    </div>

                    {/* Room Summaries */}
                    <div className="space-y-1.5">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Vacancy Configuration</h4>
                      {prop.rooms.map((room: any) => (
                        <div key={room.id} className="flex justify-between items-center text-xs text-slate-300 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                          <span className="font-semibold capitalize text-white">{room.sharingType.toLowerCase()} sharing</span>
                          <span className="font-medium text-slate-400">
                            Rent: <strong className="text-emerald-400">₹{room.price}</strong>
                          </span>
                          <span className={`font-bold ${room.availableBeds === 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {room.availableBeds} / {room.totalBeds} Vacant
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-3 pt-4 border-t border-slate-800 mt-4">
                    <button
                      onClick={() => {
                        setSelectedProperty(prop);
                        setShowRoomsModal(true);
                      }}
                      className="flex-grow flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-700 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors focus:outline-none"
                    >
                      <Sliders size={14} className="text-emerald-400" />
                      <span>Manage Vacancy</span>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteProperty(prop.id)}
                      className="p-2 border border-rose-900/60 rounded-xl text-rose-400 hover:bg-rose-950/40 transition-colors focus:outline-none"
                      title="Delete PG listing"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Vacancy Management Modal */}
      {showRoomsModal && selectedProperty && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1424] rounded-2xl max-w-lg w-full shadow-2xl border border-slate-800 overflow-hidden text-slate-100">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
              <div>
                <h3 className="font-extrabold text-white text-base">{selectedProperty.name}</h3>
                <p className="text-slate-400 text-xs">Live Bed Vacancy Adjuster</p>
              </div>
              <button onClick={() => setShowRoomsModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-400 font-medium">
                Adjust the available beds counter below. This updates room vacancy counters for seekers in real-time.
              </p>

              <div className="space-y-3.5">
                {selectedProperty.rooms.map((room: any) => (
                  <div key={room.id} className="flex justify-between items-center p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
                    <div>
                      <span className="font-bold text-white text-sm capitalize">{room.sharingType.toLowerCase()} sharing</span>
                      <div className="text-xs text-slate-400 font-semibold mt-0.5">Rent: ₹{room.price}</div>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-950 border border-slate-700 rounded-xl p-1.5">
                      <button
                        onClick={() => handleAdjustVacancy(room.id, room.availableBeds, -1, room.totalBeds)}
                        disabled={room.availableBeds <= 0}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-30 focus:outline-none text-xl font-bold"
                      >
                        -
                      </button>
                      <span className="w-12 text-center text-sm font-extrabold text-white">
                        {room.availableBeds} / {room.totalBeds}
                      </span>
                      <button
                        onClick={() => handleAdjustVacancy(room.id, room.availableBeds, 1, room.totalBeds)}
                        disabled={room.availableBeds >= room.totalBeds}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-30 focus:outline-none text-xl font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex justify-end">
              <button
                onClick={() => setShowRoomsModal(false)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 px-6 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1424] rounded-2xl max-w-xl w-full flex flex-col max-h-[90vh] shadow-2xl border border-slate-800 overflow-hidden text-slate-100">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
              <h3 className="font-bold text-white text-base">List New PG / Hostel</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddPropertySubmit} className="flex-grow overflow-y-auto p-6 space-y-6">
              {errorMsg && (
                <div className="p-3 bg-rose-950/60 text-rose-300 text-xs rounded-xl border border-rose-800/80">
                  {errorMsg}
                </div>
              )}

              {/* Step 1: Basic Info */}
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-wide">1. Basic Details</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">PG/Hostel Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Royal Co-living Space"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={newPropName}
                      onChange={(e) => setNewPropName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
                    <select
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={newPropCity}
                      onChange={(e) => setNewPropCity(e.target.value)}
                    >
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Pune">Pune</option>
                      <option value="New Delhi">New Delhi</option>
                      <option value="Noida">Noida</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Kolkata">Kolkata</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Address / Landmark</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Plot 45, Near Cyber Towers, Hitech City"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newPropAddress}
                    onChange={(e) => setNewPropAddress(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Gender Compatibility</label>
                    <select
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={newPropGender}
                      onChange={(e) => setNewPropGender(e.target.value)}
                    >
                      <option value="BOYS">Boys Only</option>
                      <option value="GIRLS">Girls Only</option>
                      <option value="COED">Co-Ed (Unisex)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">AC Type</label>
                    <select
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={newPropAC}
                      onChange={(e) => setNewPropAC(e.target.value)}
                    >
                      <option value="AC">AC Rooms</option>
                      <option value="NON_AC">Non-AC</option>
                      <option value="BOTH">Both AC & Non-AC</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe amenities, food menu, proximity to metro..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newPropDesc}
                    onChange={(e) => setNewPropDesc(e.target.value)}
                  />
                </div>
              </div>

              {/* Step 2: Rooms & Pricing */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-wide">2. Room Configuration</h4>
                
                <div className="space-y-3">
                  {newRooms.map((room, idx) => (
                    <div key={idx} className="flex gap-3 items-center bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <div className="w-1/3">
                        <label className="block text-[10px] text-slate-400 uppercase font-bold">Sharing</label>
                        <select
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                          value={room.sharingType}
                          onChange={(e) => {
                            const updated = [...newRooms];
                            updated[idx].sharingType = e.target.value;
                            setNewRooms(updated);
                          }}
                        >
                          <option value="SINGLE">Single</option>
                          <option value="DOUBLE">Double</option>
                          <option value="TRIPLE">Triple</option>
                          <option value="DORMITORY">Dormitory</option>
                        </select>
                      </div>

                      <div className="w-1/3">
                        <label className="block text-[10px] text-slate-400 uppercase font-bold">Rent (₹/mo)</label>
                        <input
                          type="number"
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                          value={room.price}
                          onChange={(e) => {
                            const updated = [...newRooms];
                            updated[idx].price = Number(e.target.value);
                            setNewRooms(updated);
                          }}
                        />
                      </div>

                      <div className="w-1/3">
                        <label className="block text-[10px] text-slate-400 uppercase font-bold">Total Beds</label>
                        <input
                          type="number"
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                          value={room.totalBeds}
                          onChange={(e) => {
                            const updated = [...newRooms];
                            updated[idx].totalBeds = Number(e.target.value);
                            setNewRooms(updated);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 3: Amenities */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-wide">3. Amenities</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {AMENITIES_LIST.map((amenity) => (
                    <label key={amenity} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300 select-none">
                      <input
                        type="checkbox"
                        className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                        checked={newPropAmenities.includes(amenity)}
                        onChange={() => {
                          setNewPropAmenities((prev) =>
                            prev.includes(amenity)
                              ? prev.filter((a) => a !== amenity)
                              : [...prev, amenity]
                          );
                        }}
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Step 4: Photo Gallery Selection */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-wide">4. Select Photos from Image Folders</h4>
                  <span className="text-[11px] text-slate-400">({newPropImages.length} selected)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Building Front', path: '/images/boys/hostel-building-main.jpg' },
                    { label: 'Boys Stay', path: '/images/boys/pg-hostels-for-men.jpg' },
                    { label: 'Girls Stay', path: '/images/girls/girls-hostel-services.webp' },
                    { label: 'Ladies Kakkanad', path: '/images/girls/ladies-hostel-kakkanad.webp' },
                    { label: 'Single AC Room', path: '/images/rooms/room1.png' },
                    { label: 'Double Sharing', path: '/images/rooms/room2.png' },
                    { label: 'Triple Sharing', path: '/images/rooms/room3.png' },
                    { label: 'Bunk Dormitory', path: '/images/coed/hostel-room-bunk.jpeg' },
                    { label: 'Interior Lounge', path: '/images/coed/hostel-interior.jpg' },
                    { label: 'Hallway Corridor', path: '/images/coed/hostel-corridor.jpeg' },
                  ].map((imgItem) => {
                    const isSelected = newPropImages.includes(imgItem.path);
                    return (
                      <div
                        key={imgItem.path}
                        onClick={() => {
                          setNewPropImages((prev) =>
                            isSelected ? prev.filter((p) => p !== imgItem.path) : [...prev, imgItem.path]
                          );
                        }}
                        className={`relative cursor-pointer rounded-xl overflow-hidden border p-1 transition-all ${
                          isSelected ? 'border-emerald-500 bg-emerald-950/40 ring-2 ring-emerald-500/40' : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                        }`}
                      >
                        <img src={imgItem.path} alt={imgItem.label} className="w-full h-16 object-cover rounded-lg" />
                        <div className="mt-1 flex items-center justify-between text-[10px]">
                          <span className="text-slate-300 font-medium truncate">{imgItem.label}</span>
                          <span className={isSelected ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                            {isSelected ? '✓' : '+'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 px-6 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20"
                >
                  Submit for Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
