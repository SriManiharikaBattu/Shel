'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import { Plus, Trash2, Check, RefreshCw, X, Sliders, LayoutDashboard, ToggleLeft, ToggleRight, ShieldAlert, Sparkles, CheckCircle2, MessageSquare, Pencil, IndianRupee, MapPin } from 'lucide-react';
import Link from 'next/link';

const AMENITIES_LIST = [
  'WiFi', 'Food Included', 'Laundry', 'CCTV', 'Power Backup', 'Gym', 'Parking',
  'Housekeeping', 'Hot Water Geyser', 'Refrigerator', 'TV', 'Washing Machine',
  'Study Table', 'Wardrobe', 'RO Water', 'Lift', 'Attached Bathroom', 'Balcony'
];

const PHOTO_OPTIONS = [
  { label: 'Building Exterior 1', path: '/images/exteriors/building-exterior-1.jpg' },
  { label: 'Building Exterior 2', path: '/images/exteriors/building-exterior-2.jpg' },
  { label: 'Hostel Main Front', path: '/images/boys/hostel-building-main.jpg' },
  { label: 'Boys Stay Facility', path: '/images/boys/pg-hostels-for-men.jpg' },
  { label: 'Backpackers Boys PG', path: '/images/boys/urban-backpackers-boys-pg.jpg' },
  { label: 'Youth Hostel View', path: '/images/boys/youth-hostel-kolkata-view.jpg' },
  { label: 'Girls Hostel Services', path: '/images/girls/girls-hostel-services.webp' },
  { label: 'Ladies Kakkanad', path: '/images/girls/ladies-hostel-kakkanad.webp' },
  { label: 'Deluxe Single Room', path: '/images/girls/room-deluxe-single.png' },
  { label: 'Double Sharing Room', path: '/images/girls/room-double-sharing.png' },
  { label: 'Single AC Room', path: '/images/rooms/room1.png' },
  { label: 'Double AC Room', path: '/images/rooms/room2.png' },
  { label: 'Triple Sharing Room', path: '/images/rooms/room3.png' },
  { label: 'Four Sharing Bed', path: '/images/rooms/room4.jpg' },
  { label: 'Dormitory Room', path: '/images/rooms/room5.png' },
  { label: 'Bunk Bed Room', path: '/images/coed/hostel-room-bunk.jpeg' },
  { label: 'Interior Lounge', path: '/images/coed/hostel-interior.jpg' },
  { label: 'Hallway Corridor', path: '/images/coed/hostel-corridor.jpeg' },
];

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
  const [newPropState, setNewPropState] = useState('Telangana');
  const [newPropLat, setNewPropLat] = useState('17.4849');
  const [newPropLng, setNewPropLng] = useState('78.3889');
  const [newPropGender, setNewPropGender] = useState('BOYS');
  const [newPropAC, setNewPropAC] = useState('AC');
  const [newPropDesc, setNewPropDesc] = useState('');
  const [newPropAmenities, setNewPropAmenities] = useState<string[]>(['WiFi', 'Food Included', 'Laundry', 'CCTV']);
  const [newPropRules, setNewPropRules] = useState<string[]>(['No smoking inside rooms', 'Gate closes at 10:30 PM']);
  const [newRuleInput, setNewRuleInput] = useState('');
  const [newPropImages, setNewPropImages] = useState<string[]>([
    '/images/boys/hostel-building-main.jpg',
    '/images/rooms/room1.png'
  ]);
  const [newRooms, setNewRooms] = useState<any[]>([
    { sharingType: 'SINGLE', price: 12000, totalBeds: 5, availableBeds: 2 },
    { sharingType: 'DOUBLE', price: 8500, totalBeds: 10, availableBeds: 4 },
    { sharingType: 'TRIPLE', price: 6200, totalBeds: 15, availableBeds: 6 },
    { sharingType: 'DORMITORY', price: 4500, totalBeds: 20, availableBeds: 8 },
  ]);

  // Edit property modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPropId, setEditPropId] = useState('');
  const [editPropName, setEditPropName] = useState('');
  const [editPropAddress, setEditPropAddress] = useState('');
  const [editPropCity, setEditPropCity] = useState('');
  const [editPropState, setEditPropState] = useState('');
  const [editPropLat, setEditPropLat] = useState('');
  const [editPropLng, setEditPropLng] = useState('');
  const [editPropGender, setEditPropGender] = useState('BOYS');
  const [editPropAC, setEditPropAC] = useState('AC');
  const [editPropDesc, setEditPropDesc] = useState('');
  const [editPropAmenities, setEditPropAmenities] = useState<string[]>([]);
  const [editPropRules, setEditPropRules] = useState<string[]>([]);
  const [editRuleInput, setEditRuleInput] = useState('');
  const [editPropImages, setEditPropImages] = useState<string[]>([]);
  const [editRooms, setEditRooms] = useState<any[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);

  // Manage rooms modal state (Quick Vacancy control)
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
        setTimeout(() => setSuccessMsg(''), 2500);
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
        setTimeout(() => setSuccessMsg(''), 2500);
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

  // Open Edit Modal with property data populated
  const handleOpenEditModal = (prop: any) => {
    setEditPropId(prop.id);
    setEditPropName(prop.name || '');
    setEditPropAddress(prop.address || '');
    setEditPropCity(prop.city || '');
    setEditPropState(prop.state || 'Telangana');
    setEditPropLat(prop.latitude?.toString() || '17.4');
    setEditPropLng(prop.longitude?.toString() || '78.4');
    setEditPropGender(prop.genderType || 'BOYS');
    setEditPropAC(prop.acType || 'AC');
    setEditPropDesc(prop.description || '');

    let ams: string[] = [];
    try {
      ams = typeof prop.amenities === 'string' ? JSON.parse(prop.amenities) : (prop.amenities || []);
    } catch (e) {
      ams = [];
    }
    setEditPropAmenities(ams);

    let rules: string[] = [];
    try {
      rules = typeof prop.houseRules === 'string' ? JSON.parse(prop.houseRules) : (prop.houseRules || []);
    } catch (e) {
      rules = [];
    }
    setEditPropRules(rules);

    let imgs: string[] = [];
    try {
      imgs = typeof prop.images === 'string' ? JSON.parse(prop.images) : (prop.images || []);
    } catch (e) {
      imgs = [];
    }
    setEditPropImages(imgs);

    setEditRooms(prop.rooms ? JSON.parse(JSON.stringify(prop.rooms)) : []);
    setShowEditModal(true);
  };

  // Save edits
  const handleSaveEditPropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPropId) return;
    setSavingEdit(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/owner/properties/${editPropId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editPropName,
          address: editPropAddress,
          city: editPropCity,
          state: editPropState,
          latitude: editPropLat,
          longitude: editPropLng,
          genderType: editPropGender,
          acType: editPropAC,
          description: editPropDesc,
          houseRules: editPropRules,
          images: editPropImages,
          amenities: editPropAmenities,
          rooms: editRooms,
        }),
      });

      if (res.ok) {
        setShowEditModal(false);
        setSuccessMsg(`"${editPropName}" updated successfully with new prices & features!`);
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchOwnerProperties();
      } else {
        const d = await res.json();
        setErrorMsg(d.error || 'Failed to update property');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating property');
    } finally {
      setSavingEdit(false);
    }
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
          state: newPropState,
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

      if (res.ok) {
        setShowAddModal(false);
        setSuccessMsg(`New PG "${newPropName}" created successfully!`);
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchOwnerProperties();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to create listing');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Error creating property');
    }
  };

  // Calculate Dashboard Summary
  const totalListings = properties.length;
  const activeListings = properties.filter((p) => p.isActive).length;
  const totalEnquiries = properties.reduce((acc, curr) => acc + (curr.enquiryCount || 0), 0);
  const averageOccupancy = properties.length > 0
    ? properties.reduce((acc, curr) => acc + curr.occupancyRate, 0) / properties.length
    : 0;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 pb-20 font-sans selection:bg-emerald-500 selection:text-black">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Messages */}
        {successMsg && (
          <div className="p-3 bg-emerald-950/70 text-emerald-300 text-sm rounded-xl border border-emerald-800 flex items-center gap-2">
            <Check size={16} />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-3 bg-rose-950/70 text-rose-300 text-sm rounded-xl border border-rose-800 flex items-center gap-2">
            <X size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Dashboard Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <LayoutDashboard className="text-emerald-400" />
              <span>Owner Management Panel</span>
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">Manage your hostels, edit prices & features, adjust bed vacancies, and chat with seekers.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="/owner/enquiries"
              className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-cyan-300 font-bold bg-cyan-950/70 border border-cyan-800/80 hover:bg-cyan-900/90 transition-all shadow-md text-sm"
            >
              <MessageSquare size={17} />
              <span>Customer Chats ({totalEnquiries})</span>
            </Link>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl text-slate-950 font-bold bg-emerald-500 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 text-sm"
            >
              <Plus size={18} />
              <span>List New PG / Hostel</span>
            </button>
          </div>
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
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Your Listed Accommodations ({properties.length})</h2>
            <span className="text-xs text-slate-400">Click "Edit" on any PG to change prices, room configs & features</span>
          </div>

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
                <div key={prop.id} className="bg-[#0e1424] rounded-2xl border border-slate-800 shadow-xl p-6 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all">
                  <div>
                    {/* Header: Name, Location, Status Toggle */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-extrabold text-white text-lg leading-tight">{prop.name}</h3>
                        <p className="text-emerald-400 text-xs font-semibold mt-1 flex items-center gap-1">
                          <MapPin size={12} />
                          <span>{prop.address}, {prop.city} ({prop.state})</span>
                        </p>
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
                      <span className="text-[10px] font-bold text-slate-300 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-md uppercase">
                        {prop.genderType} PG
                      </span>
                      <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded-md uppercase">
                        {prop.acType} Room
                      </span>
                      {prop.isVerified ? (
                        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700/80 flex items-center gap-1 py-0.5 px-2.5 rounded-md uppercase">
                          <CheckCircle2 size={11} className="text-emerald-400" /> Verified
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-rose-400 bg-rose-950/60 border border-rose-800/80 px-2.5 py-0.5 rounded-md uppercase">
                          Unverified
                        </span>
                      )}
                    </div>

                    {/* Room Summaries & Prices */}
                    <div className="space-y-1.5 mt-4">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Room Configurations & Pricing</h4>
                      {prop.rooms && prop.rooms.map((room: any) => (
                        <div key={room.id} className="flex justify-between items-center text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                          <span className="font-semibold capitalize text-white">{room.sharingType.toLowerCase()} room</span>
                          <span className="font-medium text-slate-400">
                            Rent: <strong className="text-emerald-400">₹{room.price.toLocaleString()}/mo</strong>
                          </span>
                          <span className={`font-bold text-xs ${room.availableBeds === 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {room.availableBeds} / {room.totalBeds} Beds Vacant
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800 mt-4">
                    {/* EDIT PROPERTY BUTTON */}
                    <button
                      onClick={() => handleOpenEditModal(prop)}
                      className="flex-grow flex items-center justify-center gap-1.5 py-2 px-3 border border-emerald-500/50 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 transition-colors focus:outline-none shadow-sm"
                      title="Edit property details, prices, and features"
                    >
                      <Pencil size={14} />
                      <span>Edit PG & Prices</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedProperty(prop);
                        setShowRoomsModal(true);
                      }}
                      className="flex-grow flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-700 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors focus:outline-none"
                    >
                      <Sliders size={14} className="text-emerald-400" />
                      <span>Quick Vacancy</span>
                    </button>

                    <Link
                      href="/owner/enquiries"
                      className="flex items-center justify-center gap-1.5 py-2 px-3 border border-cyan-800/80 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/80 transition-colors focus:outline-none shadow-sm"
                      title="View chats & voice notes for this PG"
                    >
                      <MessageSquare size={14} />
                      <span>Chats ({prop.enquiryCount || 0})</span>
                    </Link>
                    
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

      {/* ================= EDIT PROPERTY MODAL ================= */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e1424] rounded-2xl max-w-3xl w-full flex flex-col max-h-[92vh] shadow-2xl border border-slate-800 overflow-hidden text-slate-100 my-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/90 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-950 rounded-xl border border-emerald-800 text-emerald-400">
                  <Pencil size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Edit PG Hostel Details & Prices</h3>
                  <p className="text-xs text-slate-400">Update pricing, sharing capacities, amenities, and hostel information</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveEditPropertySubmit} className="p-6 overflow-y-auto space-y-6 flex-grow">
              {/* Section 1: Basic Information */}
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-wide">1. Basic Information & Location</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Hostel / PG Name</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                      value={editPropName}
                      onChange={(e) => setEditPropName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Locality / Address</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={editPropAddress}
                      onChange={(e) => setEditPropAddress(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={editPropCity}
                      onChange={(e) => setEditPropCity(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">State / UT</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={editPropState}
                      onChange={(e) => setEditPropState(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Latitude</label>
                      <input
                        type="text"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={editPropLat}
                        onChange={(e) => setEditPropLat(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Longitude</label>
                      <input
                        type="text"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={editPropLng}
                        onChange={(e) => setEditPropLng(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Gender Compatibility</label>
                    <select
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                      value={editPropGender}
                      onChange={(e) => setEditPropGender(e.target.value)}
                    >
                      <option value="BOYS">Boys Only PG</option>
                      <option value="GIRLS">Girls Only PG</option>
                      <option value="COED">Co-Ed / Unisex PG</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">AC Option</label>
                    <select
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                      value={editPropAC}
                      onChange={(e) => setEditPropAC(e.target.value)}
                    >
                      <option value="AC">AC Rooms Only</option>
                      <option value="NON_AC">Non-AC Only</option>
                      <option value="BOTH">Both AC & Non-AC Available</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Hostel Description</label>
                    <textarea
                      rows={3}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={editPropDesc}
                      onChange={(e) => setEditPropDesc(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Room Configurations & Pricing */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-wide">2. Room Sharing Types & Pricing (₹ / month)</h4>
                  <span className="text-[11px] text-slate-400">Edit rent, total beds & live vacancy</span>
                </div>

                <div className="space-y-3">
                  {editRooms.map((room, idx) => (
                    <div key={idx} className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                      <div>
                        <span className="block text-[11px] font-bold text-slate-400 uppercase">Sharing Type</span>
                        <span className="font-extrabold text-white text-sm capitalize">{room.sharingType.toLowerCase()}</span>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Rent (₹/month)</label>
                        <input
                          type="number"
                          required
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-sm font-bold text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          value={room.price}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setEditRooms((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, price: val } : r))
                            );
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Total Beds</label>
                        <input
                          type="number"
                          required
                          min="1"
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          value={room.totalBeds}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setEditRooms((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, totalBeds: val, availableBeds: Math.min(r.availableBeds, val) } : r))
                            );
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Available Beds</label>
                        <input
                          type="number"
                          required
                          min="0"
                          max={room.totalBeds}
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-sm font-bold text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          value={room.availableBeds}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setEditRooms((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, availableBeds: val } : r))
                            );
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Amenities */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-wide">3. Amenities & Facilities</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {AMENITIES_LIST.map((amenity) => (
                    <label key={amenity} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300 select-none p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700">
                      <input
                        type="checkbox"
                        className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                        checked={editPropAmenities.includes(amenity)}
                        onChange={() => {
                          setEditPropAmenities((prev) =>
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

              {/* Section 4: House Rules */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-wide">4. House Rules & Policies</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Visitors to be registered at gate"
                    className="flex-grow px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={editRuleInput}
                    onChange={(e) => setEditRuleInput(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (editRuleInput.trim()) {
                        setEditPropRules((prev) => [...prev, editRuleInput.trim()]);
                        setEditRuleInput('');
                      }
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs rounded-xl border border-slate-700"
                  >
                    Add Rule
                  </button>
                </div>

                <div className="space-y-1.5">
                  {editPropRules.map((rule, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs text-slate-300 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
                      <span>• {rule}</span>
                      <button
                        type="button"
                        onClick={() => setEditPropRules((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 5: Photos */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-wide">5. Photo Gallery Selection</h4>
                  <span className="text-[11px] text-slate-400">({editPropImages.length} selected)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PHOTO_OPTIONS.map((imgItem) => {
                    const isSelected = editPropImages.includes(imgItem.path);
                    return (
                      <div
                        key={imgItem.path}
                        onClick={() => {
                          setEditPropImages((prev) =>
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

              {/* Footer Save / Cancel */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 sticky bottom-0 bg-slate-900/95 py-3 -mb-6 -mx-6 px-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-2.5 px-6 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                >
                  {savingEdit ? <RefreshCw className="animate-spin" size={14} /> : <Check size={14} />}
                  <span>Save All Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= QUICK VACANCY MODAL ================= */}
      {showRoomsModal && selectedProperty && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1424] rounded-2xl max-w-lg w-full shadow-2xl border border-slate-800 overflow-hidden text-slate-100">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
              <div>
                <h3 className="font-bold text-white text-base">Quick Vacancy Control</h3>
                <p className="text-xs text-slate-400">{selectedProperty.name}</p>
              </div>
              <button onClick={() => setShowRoomsModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <p className="text-xs text-slate-400">Instantly increment or decrement available beds when seekers check in or vacate.</p>
              {selectedProperty.rooms.map((room: any) => (
                <div key={room.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white text-sm capitalize">{room.sharingType.toLowerCase()} room</h4>
                    <span className="text-xs text-slate-400">
                      Rent: <strong className="text-emerald-400">₹{room.price}/mo</strong>
                    </span>
                    <span className="block text-[11px] text-slate-500">Total capacity: {room.totalBeds} beds</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleAdjustVacancy(room.id, room.availableBeds, -1, room.totalBeds)}
                      disabled={room.availableBeds <= 0}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold flex items-center justify-center border border-slate-700"
                    >
                      -
                    </button>
                    <span className="font-bold text-white text-base w-6 text-center">{room.availableBeds}</span>
                    <button
                      onClick={() => handleAdjustVacancy(room.id, room.availableBeds, 1, room.totalBeds)}
                      disabled={room.availableBeds >= room.totalBeds}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold flex items-center justify-center border border-slate-700"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-900/60">
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

      {/* ================= ADD NEW PROPERTY MODAL ================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1424] rounded-2xl max-w-2xl w-full flex flex-col max-h-[90vh] shadow-2xl border border-slate-800 overflow-hidden text-slate-100">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
              <h3 className="font-bold text-white text-base">List New Hostel / PG</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddPropertySubmit} className="p-6 overflow-y-auto space-y-5 flex-grow">
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-wide">1. Property Overview</h4>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Property Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stanza Living Austin House"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newPropName}
                    onChange={(e) => setNewPropName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Locality / Address</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Madhapur Near Metro"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={newPropAddress}
                      onChange={(e) => setNewPropAddress(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hyderabad"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={newPropCity}
                      onChange={(e) => setNewPropCity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Gender Compatibility</label>
                    <select
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                      value={newPropGender}
                      onChange={(e) => setNewPropGender(e.target.value)}
                    >
                      <option value="BOYS">Boys PG</option>
                      <option value="GIRLS">Girls PG</option>
                      <option value="COED">Co-Ed / Unisex PG</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">AC Option</label>
                    <select
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                      value={newPropAC}
                      onChange={(e) => setNewPropAC(e.target.value)}
                    >
                      <option value="AC">AC Rooms</option>
                      <option value="NON_AC">Non-AC</option>
                      <option value="BOTH">Both Available</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newPropDesc}
                    onChange={(e) => setNewPropDesc(e.target.value)}
                  />
                </div>
              </div>

              {/* Step 2: Room Configurations */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-wide">2. Room Configurations & Rent</h4>
                <div className="space-y-2.5">
                  {newRooms.map((room, idx) => (
                    <div key={idx} className="bg-slate-900 p-3 rounded-xl border border-slate-800 grid grid-cols-3 gap-2.5 items-center">
                      <span className="font-bold text-xs capitalize text-white">{room.sharingType.toLowerCase()} sharing</span>
                      <div>
                        <label className="block text-[10px] text-slate-400">Rent (₹/mo)</label>
                        <input
                          type="number"
                          required
                          className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs font-bold text-emerald-400"
                          value={room.price}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setNewRooms((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, price: val } : r))
                            );
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400">Total Beds</label>
                        <input
                          type="number"
                          required
                          className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                          value={room.totalBeds}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setNewRooms((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, totalBeds: val, availableBeds: val } : r))
                            );
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

              {/* Step 4: Photos */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-wide">4. Select Photos from Folders</h4>
                  <span className="text-[11px] text-slate-400">({newPropImages.length} selected)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PHOTO_OPTIONS.slice(0, 8).map((imgItem) => {
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
                  Create Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
