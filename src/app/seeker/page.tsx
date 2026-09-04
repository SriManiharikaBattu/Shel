'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import PropertyCard, { PropertyData } from '@/components/PropertyCard';
import { Search, MapPin, SlidersHorizontal, ArrowUpDown, HelpCircle, Columns, RefreshCw, X, Sparkles } from 'lucide-react';

// Dynamically import Leaflet map to prevent SSR issues in Next.js
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900/80 flex items-center justify-center rounded-2xl border border-slate-800">
      <div className="flex flex-col items-center gap-2 text-emerald-400">
        <RefreshCw className="animate-spin" />
        <span className="text-xs font-semibold text-slate-400">Loading map radar...</span>
      </div>
    </div>
  ),
});

interface CityData {
  name: string;
  lat: number;
  lng: number;
}

const STATE_CITY_DATA: Record<string, CityData[]> = {
  "Telangana": [
    { name: "Hyderabad", lat: 17.4065, lng: 78.4772 }
  ],
  "Karnataka": [
    { name: "Bengaluru", lat: 12.9716, lng: 77.5946 }
  ],
  "Maharashtra": [
    { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
    { name: "Pune", lat: 18.5204, lng: 73.8567 }
  ],
  "Delhi NCR": [
    { name: "Delhi", lat: 28.6139, lng: 77.2090 },
    { name: "Noida", lat: 28.5355, lng: 77.3910 },
    { name: "Gurugram", lat: 28.4595, lng: 77.0266 }
  ],
  "Tamil Nadu": [
    { name: "Chennai", lat: 13.0827, lng: 80.2707 }
  ],
  "West Bengal": [
    { name: "Kolkata", lat: 22.5726, lng: 88.3639 }
  ],
  "Gujarat": [
    { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 }
  ]
};

const AMENITIES_LIST = ['WiFi', 'Food Included', 'Laundry', 'CCTV', 'Power Backup', 'Gym', 'Parking'];

export default function SeekerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedState, setSelectedState] = useState('Telangana');
  const [selectedCity, setSelectedCity] = useState('Hyderabad');
  const [lat, setLat] = useState<number>(17.4065);
  const [lng, setLng] = useState<number>(78.4772);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sharingType, setSharingType] = useState('');
  const [acType, setAcType] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [availableNow, setAvailableNow] = useState(false);
  const [disableGenderFilter, setDisableGenderFilter] = useState(false);
  const [sort, setSort] = useState('price_asc');
  const [minRating, setMinRating] = useState('');
  const [maxDistance, setMaxDistance] = useState('');

  // UI state
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<PropertyData[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'LIST' | 'MAP'>('LIST'); // for mobile toggling
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Debouncing search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Auth redirect check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Fetch properties when filters change
  const fetchProperties = async () => {
    setLoadingProperties(true);
    setErrorMsg('');
    try {
      const query = new URLSearchParams({
        search: debouncedSearch,
        lat: lat.toString(),
        lng: lng.toString(),
        state: selectedState,
        city: selectedCity,
        sort,
      });

      if (minPrice) query.append('minPrice', minPrice);
      if (maxPrice) query.append('maxPrice', maxPrice);
      if (sharingType) query.append('sharingType', sharingType);
      if (acType) query.append('acType', acType);
      if (selectedAmenities.length > 0) query.append('amenities', selectedAmenities.join(','));
      if (availableNow) query.append('availableNow', 'true');
      if (disableGenderFilter) query.append('disableGenderFilter', 'true');
      if (minRating) query.append('minRating', minRating);
      if (maxDistance) query.append('maxDistance', maxDistance);

      const res = await fetch(`/api/seeker/properties?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to load listings');
      const data = await res.json();
      setProperties(data.properties || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error fetching properties');
    } finally {
      setLoadingProperties(false);
    }
  };

  // Fetch wishlist
  const fetchWishlist = async () => {
    try {
      const res = await fetch('/api/seeker/wishlist');
      if (res.ok) {
        const data = await res.json();
        setWishlistedIds((data.properties || []).map((p: any) => p.id));
      }
    } catch (e) {
      console.error('Error fetching wishlist ids:', e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProperties();
    }
  }, [
    debouncedSearch,
    lat,
    lng,
    selectedState,
    selectedCity,
    minPrice,
    maxPrice,
    sharingType,
    acType,
    selectedAmenities,
    availableNow,
    disableGenderFilter,
    sort,
    minRating,
    maxDistance,
    user
  ]);

  // Automatically update city and map center when state changes
  useEffect(() => {
    const cities = STATE_CITY_DATA[selectedState];
    if (cities && cities.length > 0) {
      const firstCity = cities[0];
      setSelectedCity(firstCity.name);
      setLat(firstCity.lat);
      setLng(firstCity.lng);
      setInfoMsg(`Radar active for ${firstCity.name}, ${selectedState}`);
    }
  }, [selectedState]);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16]">
        <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
          <RefreshCw className="animate-spin" />
          <span>Setting up workspace...</span>
        </div>
      </div>
    );
  }

  // Handle GPS detection
  const handleGPSDetect = () => {
    setErrorMsg('');
    setInfoMsg('');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLat(latitude);
          setLng(longitude);
          setSelectedState('GPS Location');
          setSelectedCity('GPS Location');
          setInfoMsg('Location detected using device GPS.');
        },
        () => {
          setErrorMsg('Failed to detect GPS location. Please choose a state and city.');
        }
      );
    } else {
      setErrorMsg('GPS is not supported by your browser.');
    }
  };

  // Toggle wishlist item
  const handleToggleWishlist = async (id: string) => {
    try {
      const res = await fetch('/api/seeker/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: id }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.action === 'added') {
          setWishlistedIds((prev) => [...prev, id]);
        } else {
          setWishlistedIds((prev) => prev.filter((item) => item !== id));
        }
      }
    } catch (e) {
      console.error('Error toggling wishlist:', e);
    }
  };

  // Toggle amenities checkbox
  const handleAmenityCheck = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  // Toggle Compare items
  const handleToggleCompare = (property: PropertyData) => {
    setCompareList((prev) => {
      const isChecked = prev.some((p) => p.id === property.id);
      if (isChecked) {
        return prev.filter((p) => p.id !== property.id);
      } else {
        if (prev.length >= 3) {
          alert('You can compare a maximum of 3 properties side by side.');
          return prev;
        }
        return [...prev, property];
      }
    });
  };

  const handleClearCompare = () => {
    setCompareList([]);
  };

  const handleNavigateToCompare = () => {
    if (compareList.length < 2) return;
    localStorage.setItem('compare_properties', JSON.stringify(compareList));
    router.push('/seeker/compare');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      <Navbar />

      {/* Info & Error Messages */}
      {(errorMsg || infoMsg) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
          {errorMsg && (
            <div className="p-3 bg-rose-950/70 text-rose-300 text-xs rounded-xl border border-rose-800 flex justify-between items-center">
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg('')} className="text-rose-400 hover:text-rose-200"><X size={15} /></button>
            </div>
          )}
          {infoMsg && (
            <div className="p-3 bg-cyan-950/70 text-cyan-300 text-xs rounded-xl border border-cyan-800 flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-cyan-400" />
                <span>{infoMsg}</span>
              </div>
              <button onClick={() => setInfoMsg('')} className="text-cyan-400 hover:text-cyan-200"><X size={15} /></button>
            </div>
          )}
        </div>
      )}

      {/* Main Filter & Search Area */}
      <section className="bg-[#0b0f19]/90 backdrop-blur-md border-b border-slate-800/80 py-3.5 shadow-xl sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* State & City selectors */}
          <div className="flex items-center gap-2 flex-grow max-w-xl">
            {/* State Select */}
            <div className="relative flex-grow">
              <select
                className="w-full pl-8 pr-3 py-2 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setInfoMsg('');
                }}
              >
                {Object.keys(STATE_CITY_DATA).map((stateName) => (
                  <option key={stateName} value={stateName} className="bg-slate-900 text-white">{stateName}</option>
                ))}
                {selectedState === 'GPS Location' && (
                  <option value="GPS Location">GPS Detected</option>
                )}
              </select>
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-emerald-400">
                <MapPin size={16} />
              </div>
            </div>

            {/* City Select */}
            <div className="relative flex-grow">
              <select
                className="w-full pl-8 pr-3 py-2 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                value={selectedCity}
                onChange={(e) => {
                  const cityVal = e.target.value;
                  setSelectedCity(cityVal);
                  const cities = STATE_CITY_DATA[selectedState];
                  const match = cities?.find((c) => c.name === cityVal);
                  if (match) {
                    setLat(match.lat);
                    setLng(match.lng);
                    setInfoMsg(`Radar active for ${match.name}, ${selectedState}`);
                  }
                }}
                disabled={selectedState === 'GPS Location'}
              >
                {selectedState === 'GPS Location' ? (
                  <option value="GPS Location">GPS ({lat.toFixed(2)}, {lng.toFixed(2)})</option>
                ) : (
                  STATE_CITY_DATA[selectedState]?.map((cityObj) => (
                    <option key={cityObj.name} value={cityObj.name} className="bg-slate-900 text-white">{cityObj.name}</option>
                  ))
                )}
              </select>
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-cyan-400">
                <MapPin size={16} />
              </div>
            </div>
            
            <button
              onClick={handleGPSDetect}
              className="py-2 px-3 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 flex items-center gap-1.5 transition-all whitespace-nowrap shadow-sm shadow-emerald-950/50"
            >
              GPS Auto
            </button>
          </div>

          {/* Search bar */}
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Search by PG name, landmarks..."
              className="w-full pl-9 pr-4 py-2 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white bg-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
          </div>

          {/* Quick Filters Toggles */}
          <div className="flex gap-2 items-center flex-wrap">
            <button
              onClick={() => setShowFiltersModal(true)}
              className="py-2 px-3.5 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <SlidersHorizontal size={14} className="text-emerald-400" />
              <span>Filters</span>
            </button>

            <div className="relative">
              <select
                className="pl-8 pr-3 py-2 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:bg-slate-800 cursor-pointer"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="price_asc" className="bg-slate-900 text-white">Price: Low to High</option>
                <option value="price_desc" className="bg-slate-900 text-white">Price: High to Low</option>
                <option value="rating_desc" className="bg-slate-900 text-white">Top Rated</option>
                <option value="distance_asc" className="bg-slate-900 text-white">Nearest First</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <ArrowUpDown size={13} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Auto-Gender filter Banner */}
      {!disableGenderFilter && user.gender !== 'OTHER' && (
        <div className="bg-emerald-950/60 border-b border-emerald-900/60 py-2.5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:center text-xs text-emerald-300 gap-2">
            <span>
              ℹ️ Auto-Filtered listings matching your profile gender (<strong>{user.gender === 'MALE' ? 'Boys/Co-ed' : 'Girls/Co-ed'} PGs</strong>).
            </span>
            <button
              onClick={() => setDisableGenderFilter(true)}
              className="underline font-bold text-emerald-400 hover:text-emerald-200 focus:outline-none"
            >
              Show all gender listings
            </button>
          </div>
        </div>
      )}

      {disableGenderFilter && (
        <div className="bg-slate-900/60 border-b border-slate-800 py-2.5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex justify-between items-center text-xs text-slate-400">
            <span>Showing all gender listings (Boys, Girls, and Co-ed).</span>
            <button
              onClick={() => setDisableGenderFilter(false)}
              className="underline font-bold text-slate-300 hover:text-white focus:outline-none"
            >
              Restore auto gender filter
            </button>
          </div>
        </div>
      )}

      {/* Mobile Tab Switcher (List vs Map) */}
      <div className="md:hidden flex border-b border-slate-800 bg-[#0b0f19]">
        <button
          className={`w-1/2 py-3 text-xs font-bold text-center focus:outline-none border-b-2 ${
            activeTab === 'LIST'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400'
          }`}
          onClick={() => setActiveTab('LIST')}
        >
          List View ({properties.length})
        </button>
        <button
          className={`w-1/2 py-3 text-xs font-bold text-center focus:outline-none border-b-2 ${
            activeTab === 'MAP'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400'
          }`}
          onClick={() => setActiveTab('MAP')}
        >
          Map Radar
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6 overflow-hidden">
        {/* Listings column */}
        <div
          className={`w-full md:w-3/5 lg:w-4/7 flex flex-col gap-4 overflow-y-auto ${
            activeTab === 'LIST' ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>Hostels in {selectedCity}</span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full">
                {selectedState}
              </span>
            </h2>
            <span className="text-xs font-semibold text-slate-400">
              {properties.length} verified listings
            </span>
          </div>

          {loadingProperties ? (
            <div className="flex flex-col gap-4 py-16 items-center text-emerald-400">
              <RefreshCw className="animate-spin" size={28} />
              <span className="font-semibold text-xs text-slate-400">Scanning accommodations...</span>
            </div>
          ) : properties.length === 0 ? (
            <div className="bg-[#0e1424] rounded-2xl p-10 border border-slate-800 text-center space-y-3">
              <HelpCircle className="mx-auto text-slate-600" size={44} />
              <h3 className="font-bold text-base text-white">No accommodations found</h3>
              <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                We couldn't find any hostels matching your exact criteria in this area. Try adjusting your price range or clearing filters.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 pb-24">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isWishlisted={wishlistedIds.includes(property.id)}
                  onToggleWishlist={handleToggleWishlist}
                  isCompareChecked={compareList.some((p) => p.id === property.id)}
                  onToggleCompare={handleToggleCompare}
                  showCompareCheckbox={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Map column */}
        <div
          className={`w-full md:w-2/5 lg:w-3/7 h-[calc(100vh-160px)] sticky top-36 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl ${
            activeTab === 'MAP' ? 'block' : 'hidden md:block'
          }`}
        >
          <Map
            center={[lat, lng]}
            zoom={13}
            properties={properties.map((p) => ({
              id: p.id,
              name: p.name,
              latitude: p.latitude,
              longitude: p.longitude,
              minPrice: p.minPrice,
              genderType: p.genderType,
              hasVacancy: p.hasVacancy,
            }))}
          />
        </div>
      </div>

      {/* Floating Compare Tray */}
      {compareList.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#0e1424]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl z-50 max-w-xl w-full mx-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <Columns size={16} />
              <span>Compare ({compareList.length}/3)</span>
            </div>
            <div className="flex gap-2">
              {compareList.map((item) => (
                <div key={item.id} className="flex items-center gap-1 bg-slate-800 py-1 px-2.5 rounded-lg text-xs font-semibold text-slate-200 border border-slate-700">
                  <span className="truncate max-w-[100px]">{item.name}</span>
                  <button onClick={() => handleToggleCompare(item)} className="text-slate-400 hover:text-white">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearCompare}
              className="text-xs font-bold text-slate-400 hover:text-white px-2.5 py-1.5"
            >
              Clear
            </button>
            <button
              onClick={handleNavigateToCompare}
              disabled={compareList.length < 2}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold py-1.5 px-4 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20"
            >
              Compare
            </button>
          </div>
        </div>
      )}

      {/* Filters Modal */}
      {showFiltersModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1424] rounded-2xl max-w-lg w-full flex flex-col max-h-[90vh] shadow-2xl border border-slate-800 overflow-hidden text-slate-100">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-emerald-400" />
                <span>Filter Accommodations</span>
              </h3>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-grow">
              {/* Price Range */}
              <div>
                <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider mb-2.5">Price Range (Monthly Rent)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Min Price (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 3000"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Max Price (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 15000"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Room Sharing Type */}
              <div>
                <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider mb-2.5">Sharing Type</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Single Room', value: 'SINGLE' },
                    { label: 'Double Sharing', value: 'DOUBLE' },
                    { label: 'Triple Sharing', value: 'TRIPLE' },
                    { label: 'Dormitory', value: 'DORMITORY' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                        sharingType === item.value
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-500/20'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      onClick={() => setSharingType(sharingType === item.value ? '' : item.value)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AC type */}
              <div>
                <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider mb-2.5">AC Option</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                      acType === 'AC'
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    onClick={() => setAcType(acType === 'AC' ? '' : 'AC')}
                  >
                    AC Rooms Only
                  </button>
                  <button
                    className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                      acType === 'NON_AC'
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    onClick={() => setAcType(acType === 'NON_AC' ? '' : 'NON_AC')}
                  >
                    Non-AC Only
                  </button>
                </div>
              </div>

              {/* Distance Range */}
              <div>
                <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider mb-2.5">Maximum Distance</h4>
                <select
                  className="block w-full px-3 py-2 border border-slate-700/80 rounded-xl text-sm text-white bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(e.target.value)}
                >
                  <option value="" className="bg-slate-900 text-white">Any distance (up to 10 km default)</option>
                  <option value="2" className="bg-slate-900 text-white">Within 2 km</option>
                  <option value="5" className="bg-slate-900 text-white">Within 5 km</option>
                  <option value="8" className="bg-slate-900 text-white">Within 8 km</option>
                  <option value="12" className="bg-slate-900 text-white">Within 12 km</option>
                  <option value="15" className="bg-slate-900 text-white">Within 15 km</option>
                </select>
              </div>

              {/* Minimum Rating */}
              <div>
                <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider mb-2.5">Minimum Rating</h4>
                <div className="flex gap-2">
                  {[
                    { label: 'Any', value: '' },
                    { label: '3★ +', value: '3' },
                    { label: '4★ +', value: '4' },
                    { label: '4.5★ +', value: '4.5' },
                  ].map((rate) => (
                    <button
                      key={rate.value}
                      type="button"
                      className={`flex-grow py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                        minRating === rate.value
                          ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      onClick={() => setMinRating(rate.value)}
                    >
                      {rate.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider mb-2.5">Amenities</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {AMENITIES_LIST.map((amenity) => (
                    <label key={amenity} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300 select-none">
                      <input
                        type="checkbox"
                        className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                        checked={selectedAmenities.includes(amenity)}
                        onChange={() => handleAmenityCheck(amenity)}
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Options */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-emerald-300 select-none">
                  <input
                    type="checkbox"
                    className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                    checked={availableNow}
                    onChange={(e) => setAvailableNow(e.target.checked)}
                  />
                  <span>Show only PGs with immediate bed vacancy</span>
                </label>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-between items-center bg-slate-900/60">
              <button
                onClick={() => {
                  setMinPrice('');
                  setMaxPrice('');
                  setSharingType('');
                  setAcType('');
                  setSelectedAmenities([]);
                  setAvailableNow(false);
                  setMinRating('');
                  setMaxDistance('');
                }}
                className="text-xs font-bold text-slate-400 hover:text-white focus:outline-none"
              >
                Reset All
              </button>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 px-5 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
