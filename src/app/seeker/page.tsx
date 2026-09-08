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
  "Andhra Pradesh": [
    { name: "Visakhapatnam", lat: 17.6868, lng: 83.2185 },
    { name: "Vijayawada", lat: 16.5062, lng: 80.6480 },
    { name: "Guntur", lat: 16.3067, lng: 80.4365 },
    { name: "Tirupati", lat: 13.6288, lng: 79.4192 }
  ],
  "Arunachal Pradesh": [
    { name: "Itanagar", lat: 27.0844, lng: 93.6053 },
    { name: "Naharlagun", lat: 27.1084, lng: 93.6934 },
    { name: "Pasighat", lat: 28.0668, lng: 95.3267 }
  ],
  "Assam": [
    { name: "Guwahati", lat: 26.1445, lng: 91.7362 },
    { name: "Silchar", lat: 24.8333, lng: 92.7789 },
    { name: "Dibrugarh", lat: 27.4728, lng: 94.9120 },
    { name: "Jorhat", lat: 26.7509, lng: 94.2037 }
  ],
  "Bihar": [
    { name: "Patna", lat: 25.5941, lng: 85.1376 },
    { name: "Gaya", lat: 24.7914, lng: 85.0002 },
    { name: "Bhagalpur", lat: 25.2425, lng: 86.9842 },
    { name: "Muzaffarpur", lat: 26.1209, lng: 85.3647 }
  ],
  "Chhattisgarh": [
    { name: "Raipur", lat: 21.2514, lng: 81.6296 },
    { name: "Bhilai", lat: 21.1938, lng: 81.3509 },
    { name: "Bilaspur", lat: 22.0797, lng: 82.1409 },
    { name: "Durg", lat: 21.1904, lng: 81.2849 }
  ],
  "Goa": [
    { name: "Panaji", lat: 15.4909, lng: 73.8278 },
    { name: "Margao", lat: 15.2832, lng: 73.9862 },
    { name: "Vasco da Gama", lat: 15.3995, lng: 73.8155 }
  ],
  "Gujarat": [
    { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
    { name: "Surat", lat: 21.1702, lng: 72.8311 },
    { name: "Vadodara", lat: 22.3072, lng: 73.1812 },
    { name: "Rajkot", lat: 22.3039, lng: 70.8022 }
  ],
  "Haryana": [
    { name: "Gurugram", lat: 28.4595, lng: 77.0266 },
    { name: "Faridabad", lat: 28.4089, lng: 77.3178 },
    { name: "Panipat", lat: 29.3909, lng: 76.9635 },
    { name: "Hisar", lat: 29.1492, lng: 75.7217 }
  ],
  "Himachal Pradesh": [
    { name: "Shimla", lat: 31.1048, lng: 77.1734 },
    { name: "Manali", lat: 32.2432, lng: 77.1892 },
    { name: "Dharamshala", lat: 32.2190, lng: 76.3234 },
    { name: "Solan", lat: 30.9084, lng: 77.0999 }
  ],
  "Jharkhand": [
    { name: "Ranchi", lat: 23.3441, lng: 85.3096 },
    { name: "Jamshedpur", lat: 22.8046, lng: 86.2029 },
    { name: "Dhanbad", lat: 23.7957, lng: 86.4304 },
    { name: "Bokaro", lat: 23.6693, lng: 86.1511 }
  ],
  "Karnataka": [
    { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
    { name: "Mysuru", lat: 12.2958, lng: 76.6394 },
    { name: "Mangaluru", lat: 12.9141, lng: 74.8560 },
    { name: "Hubballi", lat: 15.3647, lng: 75.1240 }
  ],
  "Kerala": [
    { name: "Kochi", lat: 9.9312, lng: 76.2673 },
    { name: "Thiruvananthapuram", lat: 8.5241, lng: 76.9366 },
    { name: "Kozhikode", lat: 11.2588, lng: 75.7804 },
    { name: "Thrissur", lat: 10.5276, lng: 76.2144 }
  ],
  "Madhya Pradesh": [
    { name: "Bhopal", lat: 23.2599, lng: 77.4126 },
    { name: "Indore", lat: 22.7196, lng: 75.8577 },
    { name: "Gwalior", lat: 26.2183, lng: 78.1828 },
    { name: "Jabalpur", lat: 23.1815, lng: 79.9864 }
  ],
  "Maharashtra": [
    { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
    { name: "Pune", lat: 18.5204, lng: 73.8567 },
    { name: "Nagpur", lat: 21.1458, lng: 79.0882 },
    { name: "Nashik", lat: 19.9975, lng: 73.7898 }
  ],
  "Manipur": [
    { name: "Imphal", lat: 24.8170, lng: 93.9368 }
  ],
  "Meghalaya": [
    { name: "Shillong", lat: 25.5788, lng: 91.8933 }
  ],
  "Mizoram": [
    { name: "Aizawl", lat: 23.7271, lng: 92.7176 }
  ],
  "Nagaland": [
    { name: "Kohima", lat: 25.6751, lng: 94.1086 },
    { name: "Dimapur", lat: 25.9094, lng: 93.7266 }
  ],
  "Odisha": [
    { name: "Bhubaneswar", lat: 20.2961, lng: 85.8245 },
    { name: "Cuttack", lat: 20.4625, lng: 85.8828 },
    { name: "Rourkela", lat: 22.2604, lng: 84.8536 },
    { name: "Puri", lat: 19.8135, lng: 85.8312 }
  ],
  "Punjab": [
    { name: "Ludhiana", lat: 30.9010, lng: 75.8573 },
    { name: "Amritsar", lat: 31.6340, lng: 74.8723 },
    { name: "Jalandhar", lat: 31.3260, lng: 75.5762 },
    { name: "Patiala", lat: 30.3398, lng: 76.3869 }
  ],
  "Rajasthan": [
    { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
    { name: "Jodhpur", lat: 26.2389, lng: 73.0243 },
    { name: "Udaipur", lat: 24.5854, lng: 73.7125 },
    { name: "Kota", lat: 25.2138, lng: 75.8648 }
  ],
  "Sikkim": [
    { name: "Gangtok", lat: 27.3389, lng: 88.6065 }
  ],
  "Tamil Nadu": [
    { name: "Chennai", lat: 13.0827, lng: 80.2707 },
    { name: "Coimbatore", lat: 11.0168, lng: 76.9558 },
    { name: "Madurai", lat: 9.9252, lng: 78.1198 },
    { name: "Tiruchirappalli", lat: 10.7905, lng: 78.7047 }
  ],
  "Telangana": [
    { name: "Hyderabad", lat: 17.4065, lng: 78.4772 },
    { name: "Warangal", lat: 17.9689, lng: 79.5941 },
    { name: "Nizamabad", lat: 18.6725, lng: 78.0941 },
    { name: "Karimnagar", lat: 18.4386, lng: 79.1288 }
  ],
  "Tripura": [
    { name: "Agartala", lat: 23.8315, lng: 91.2868 }
  ],
  "Uttar Pradesh": [
    { name: "Lucknow", lat: 26.8467, lng: 80.9462 },
    { name: "Kanpur", lat: 26.4499, lng: 80.3319 },
    { name: "Noida", lat: 28.5355, lng: 77.3910 },
    { name: "Varanasi", lat: 25.3176, lng: 82.9739 }
  ],
  "Uttarakhand": [
    { name: "Dehradun", lat: 30.3165, lng: 78.0322 },
    { name: "Haridwar", lat: 29.9457, lng: 78.1642 },
    { name: "Nainital", lat: 29.3919, lng: 79.4542 }
  ],
  "West Bengal": [
    { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
    { name: "Howrah", lat: 22.5958, lng: 88.2636 },
    { name: "Siliguri", lat: 26.7271, lng: 88.3953 },
    { name: "Durgapur", lat: 23.5204, lng: 87.3119 }
  ],
  "Delhi (NCT)": [
    { name: "New Delhi", lat: 28.6139, lng: 77.2090 },
    { name: "Dwarka", lat: 28.5921, lng: 77.0460 },
    { name: "Rohini", lat: 28.7495, lng: 77.0565 }
  ],
  "Jammu and Kashmir": [
    { name: "Srinagar", lat: 34.0837, lng: 74.7973 },
    { name: "Jammu", lat: 32.7266, lng: 74.8570 }
  ],
  "Puducherry": [
    { name: "Puducherry", lat: 11.9416, lng: 79.8083 }
  ],
  "Chandigarh": [
    { name: "Chandigarh", lat: 30.7333, lng: 76.7794 }
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

  // Sync compare list from localStorage on mount / focus
  useEffect(() => {
    const syncCompare = () => {
      const saved = localStorage.getItem('compare_properties');
      if (saved) {
        try {
          setCompareList(JSON.parse(saved));
        } catch (e) {
          setCompareList([]);
        }
      } else {
        setCompareList([]);
      }
    };
    syncCompare();
    window.addEventListener('focus', syncCompare);
    return () => window.removeEventListener('focus', syncCompare);
  }, []);

  // Toggle Compare items immediately
  const handleToggleCompare = (property: PropertyData) => {
    setCompareList((prev) => {
      const isChecked = prev.some((p) => p.id === property.id);
      let updated: PropertyData[];
      if (isChecked) {
        updated = prev.filter((p) => p.id !== property.id);
      } else {
        if (prev.length >= 3) {
          alert('You can compare a maximum of 3 properties side by side.');
          return prev;
        }
        updated = [...prev, property];
      }
      if (updated.length > 0) {
        localStorage.setItem('compare_properties', JSON.stringify(updated));
      } else {
        localStorage.removeItem('compare_properties');
      }
      return updated;
    });
  };

  const handleClearCompare = () => {
    setCompareList([]);
    localStorage.removeItem('compare_properties');
  };

  const handleNavigateToCompare = () => {
    if (compareList.length < 2) return;
    localStorage.setItem('compare_properties', JSON.stringify(compareList));
    router.push('/seeker/compare');
  };

  // Open direct chat / voice note thread with owner
  const handleOpenChat = async (property: PropertyData) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    try {
      const res = await fetch('/api/seeker/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          message: `Hi, I am interested in ${property.name} and would like to know about bed availability and terms.`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const enqId = data.enquiry?.id || data.newMessage?.enquiryId;
        if (enqId) {
          localStorage.setItem('active_chat_enquiry_id', enqId);
        }
      }
      router.push('/seeker/chat');
    } catch (e) {
      router.push('/seeker/chat');
    }
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
                  onOpenChat={handleOpenChat}
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
