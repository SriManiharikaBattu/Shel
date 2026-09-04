'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import { Star, ShieldAlert, CheckCircle2, ChevronLeft, MapPin, Heart, Wifi, Coffee, Shield, Sparkles, Send, RefreshCw, X } from 'lucide-react';

const LeafletMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-900 flex items-center justify-center rounded-xl text-slate-400 text-xs font-semibold animate-pulse">Loading Map...</div>
});

const AMENITIES_LIST = [
  { name: 'WiFi', icon: <Wifi size={16} /> },
  { name: 'Food Included', icon: <Coffee size={16} /> },
  { name: 'CCTV', icon: <Shield size={16} /> },
  { name: 'Power Backup', icon: <Sparkles size={16} /> },
  { name: 'Laundry', icon: <Sparkles size={16} /> },
  { name: 'Gym', icon: <Sparkles size={16} /> },
  { name: 'Parking', icon: <Sparkles size={16} /> },
];

export default function PropertyDetailPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Enquiry modal state
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState('Hi, I am interested in this PG and want to know about bed availability. Please contact me.');
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
  const [hasEnquired, setHasEnquired] = useState(false);

  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchPropertyDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/seeker/properties/${id}`);
      if (!res.ok) throw new Error('Property details could not be loaded');
      const data = await res.json();
      setProperty(data.property);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading property');
    } finally {
      setLoading(false);
    }
  };

  // Check if user has already enquired for this property
  const checkEnquiryStatus = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/seeker/enquiries');
      if (res.ok) {
        const data = await res.json();
        const enqs = data.enquiries || [];
        const match = enqs.some((e: any) => e.propertyId === id);
        setHasEnquired(match);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (id) {
      fetchPropertyDetails();
    }
  }, [id]);

  useEffect(() => {
    if (user && id) {
      checkEnquiryStatus();
    }
  }, [user, id]);

  const handleToggleWishlist = async () => {
    if (!property) return;
    try {
      const res = await fetch('/api/seeker/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: property.id }),
      });
      if (res.ok) {
        setProperty((prev: any) => ({ ...prev, isWishlisted: !prev.isWishlisted }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryMessage.trim()) return;
    setSubmittingEnquiry(true);
    try {
      const res = await fetch('/api/seeker/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: property.id, message: enquiryMessage }),
      });
      if (!res.ok) throw new Error('Failed to send enquiry');
      setHasEnquired(true);
      setShowEnquiryModal(false);
      setSuccessMsg('Enquiry sent successfully! You can now chat directly with the owner in the Chats tab.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error sending enquiry');
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/seeker/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: property.id, rating, comment }),
      });
      if (!res.ok) throw new Error('Failed to post review');
      setComment('');
      setSuccessMsg('Thank you! Your verified review has been posted.');
      fetchPropertyDetails();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error posting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (authLoading || loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16]">
        <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
          <RefreshCw className="animate-spin" />
          <span>Loading property details...</span>
        </div>
      </div>
    );
  }

  if (errorMsg && !property) {
    return (
      <div className="min-h-screen bg-[#090d16] text-white">
        <Navbar />
        <div className="max-w-xl mx-auto mt-20 text-center p-8 bg-[#0e1424] border border-slate-800 rounded-2xl shadow-xl">
          <ShieldAlert className="mx-auto text-rose-500" size={48} />
          <h2 className="text-xl font-bold text-white mt-4">Error loading page</h2>
          <p className="text-slate-400 text-sm mt-1">{errorMsg}</p>
          <button onClick={() => router.push('/seeker')} className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-emerald-400 underline">
            Back to listings
          </button>
        </div>
      </div>
    );
  }

  let parsedImages: string[] = [];
  try {
    if (Array.isArray(property.images)) {
      parsedImages = property.images;
    } else if (typeof property.images === 'string') {
      parsedImages = JSON.parse(property.images);
    }
  } catch (e) {
    parsedImages = [];
  }

  const defaultDetailFallback = property.genderType === 'GIRLS'
    ? '/images/girls/girls-hostel-services.webp'
    : property.genderType === 'BOYS'
    ? '/images/boys/pg-hostels-for-men.jpg'
    : '/images/boys/hostel-building-main.jpg';

  const mainImage = (parsedImages && parsedImages.length > 0 && parsedImages[0]) ? parsedImages[0] : defaultDetailFallback;
  const remainingImages = (parsedImages && parsedImages.length > 1) ? parsedImages.slice(1) : [
    '/images/rooms/room1.png',
    '/images/coed/hostel-interior.jpg'
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 pb-20 font-sans selection:bg-emerald-500 selection:text-black">
      <Navbar />

      {/* Breadcrumb / Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={() => router.push('/seeker')}
          className="flex items-center gap-1 text-slate-400 hover:text-white font-semibold text-sm transition-colors focus:outline-none"
        >
          <ChevronLeft size={16} /> Back to Search
        </button>
      </div>

      {successMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <div className="p-3.5 bg-emerald-950/70 text-emerald-300 text-sm rounded-xl border border-emerald-800">
            {successMsg}
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <div className="p-3.5 bg-rose-950/70 text-rose-300 text-sm rounded-xl border border-rose-800">
            {errorMsg}
          </div>
        </div>
      )}

      {/* Main layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Media, Rooms, Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Images Grid */}
          <div className="bg-[#0e1424] rounded-2xl overflow-hidden border border-slate-800 shadow-lg">
            <div className="grid grid-cols-3 gap-2 p-2">
              <div className="col-span-3 md:col-span-2 h-64 md:h-96 rounded-xl overflow-hidden bg-slate-900">
                <img
                  src={mainImage}
                  alt={property.name}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = defaultDetailFallback;
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="col-span-3 md:col-span-1 grid grid-cols-2 md:grid-cols-1 gap-2">
                {remainingImages.slice(0, 2).map((img: string, idx: number) => (
                  <div key={idx} className="h-32 md:h-[11.7rem] rounded-xl overflow-hidden bg-slate-900">
                    <img
                      src={img}
                      alt={`${property.name} ${idx + 2}`}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/coed/hostel-interior.jpg';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Heading details card */}
          <div className="bg-[#0e1424] rounded-2xl border border-slate-800 p-6 shadow-lg space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold text-slate-200 bg-slate-800 border border-slate-700 uppercase">
                    {property.genderType === 'BOYS' ? 'Boys PG Only' :
                     property.genderType === 'GIRLS' ? 'Girls PG Only' : 'Co-ed Accommodation'}
                  </span>
                  <span className="text-xs text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded-md font-semibold uppercase">
                    {property.acType === 'BOTH' ? 'AC & Non-AC Available' : `${property.acType} Only`}
                  </span>
                  {property.isVerified && (
                    <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-700/70 flex items-center gap-1 py-0.5 px-2.5 rounded-md text-[11px] font-bold uppercase">
                      <CheckCircle2 size={12} className="text-emerald-400" /> Verified listing
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-black text-white mt-2.5">{property.name}</h1>
                <div className="flex items-center text-slate-400 text-sm mt-1.5 gap-1.5">
                  <MapPin size={16} className="text-emerald-400 flex-shrink-0" />
                  <span>{property.address}, {property.city}</span>
                </div>
              </div>

              {/* Wishlist toggle */}
              <button
                onClick={handleToggleWishlist}
                className={`p-3 rounded-full border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors shadow-sm focus:outline-none ${
                  property.isWishlisted ? 'text-rose-400 bg-rose-950/40 border-rose-800' : 'bg-slate-900'
                }`}
              >
                <Heart size={20} className={property.isWishlisted ? 'fill-rose-500 text-rose-500' : ''} />
              </button>
            </div>

            <hr className="border-slate-800" />
            <div>
              <h3 className="font-bold text-white text-sm">Description</h3>
              <p className="text-slate-300 text-sm leading-relaxed mt-1.5">{property.description}</p>
            </div>
          </div>

          {/* Room Pricing & Live Vacancy Table */}
          <div className="bg-[#0e1424] rounded-2xl border border-slate-800 p-6 shadow-lg">
            <h2 className="text-lg font-bold text-white mb-4">Room Pricing & Bed Vacancy</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-900/80">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Sharing Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Rent</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Beds</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Vacancy Status</th>
                  </tr>
                </thead>
                <tbody className="bg-[#0e1424] divide-y divide-slate-800/80">
                  {property.rooms.map((room: any) => (
                    <tr key={room.id} className="hover:bg-slate-900/40">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white capitalize">
                        {room.sharingType.toLowerCase()} sharing
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-400 font-bold">
                        ₹{room.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {room.totalBeds} beds
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {room.availableBeds > 0 ? (
                          <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-300">
                            {room.availableBeds} beds left (Available)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-rose-950/80 border border-rose-800 text-rose-300">
                            No beds available (Full)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Amenities and Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Amenities Card */}
            <div className="bg-[#0e1424] rounded-2xl border border-slate-800 p-6 shadow-lg">
              <h3 className="font-bold text-white text-base mb-3">Amenities Included</h3>
              <div className="grid grid-cols-2 gap-3.5">
                {property.amenities.map((amenity: string, idx: number) => {
                  const preset = AMENITIES_LIST.find((a) => a.name.toLowerCase() === amenity.toLowerCase());
                  return (
                    <div key={idx} className="flex items-center gap-2.5 text-slate-300 text-sm font-medium">
                      <span className="text-emerald-400 bg-emerald-950/60 p-1.5 rounded-lg border border-emerald-800/60">{preset?.icon || <Sparkles size={16} />}</span>
                      <span>{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rules Card */}
            <div className="bg-[#0e1424] rounded-2xl border border-slate-800 p-6 shadow-lg">
              <h3 className="font-bold text-white text-base mb-3">House Rules</h3>
              <ul className="space-y-2 text-slate-300 text-sm list-disc pl-4 font-medium">
                {property.houseRules.map((rule: string, idx: number) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Location Map Pin */}
          <div className="bg-[#0e1424] rounded-2xl border border-slate-800 p-6 shadow-lg space-y-3">
            <h3 className="font-bold text-white text-base">Location Map</h3>
            <div className="h-64 bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
              <LeafletMap
                properties={[{
                  id: property.id,
                  name: property.name,
                  latitude: property.latitude,
                  longitude: property.longitude,
                  minPrice: property.rooms[0]?.price || 0,
                  genderType: property.genderType,
                }]}
                center={[property.latitude, property.longitude]}
              />
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-[#0e1424] rounded-2xl border border-slate-800 p-6 shadow-lg space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-lg">Reviews & Ratings</h3>
              <div className="flex items-center text-sm font-bold bg-amber-950/60 border border-amber-700/60 text-amber-300 px-3 py-1 rounded-xl">
                <Star size={16} className="fill-amber-400 text-amber-400 mr-1.5" />
                <span>{property.avgRating > 0 ? property.avgRating.toFixed(1) : 'No Ratings'}</span>
                {property.totalReviews > 0 && (
                  <span className="text-amber-400/60 font-normal text-xs ml-1">({property.totalReviews} reviews)</span>
                )}
              </div>
            </div>

            {/* Review form */}
            {hasEnquired ? (
              <form onSubmit={handleSubmitReview} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-sm text-white">Write a Review (Verified Seeker)</h4>
                
                {/* Star rating selector */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-400 font-semibold mr-2">Rating:</span>
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRating(val)}
                      className="text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star size={20} className={val <= rating ? 'fill-amber-400' : 'text-slate-700'} />
                    </button>
                  ))}
                </div>

                {/* Comment area */}
                <textarea
                  required
                  placeholder="Share your stay experience, food quality, rooms condition..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-1.5 px-4 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20"
                  >
                    {submittingReview ? 'Submitting...' : 'Post Review'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 text-center font-medium">
                ℹ️ Reviews can only be submitted by seekers who have sent inquiries for this PG.
              </div>
            )}

            {/* Reviews List */}
            <div className="divide-y divide-slate-800/80">
              {property.reviews.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-6 font-medium">No reviews written yet. Be the first to enquired and write one!</p>
              ) : (
                property.reviews.map((rev: any) => (
                  <div key={rev.id} className="py-4 first:pt-0 last:pb-0 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white text-sm">{rev.seeker.name}</span>
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <Star key={val} size={13} className={val <= rev.rating ? 'fill-amber-400' : 'text-slate-700'} />
                        ))}
                      </div>
                    </div>
                    <span className="text-slate-500 text-[10px]">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    <p className="text-slate-300 text-sm mt-1">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Enquiry / Booking Sticky Card */}
        <div className="lg:col-span-1">
          <div className="bg-[#0e1424] rounded-2xl border border-slate-800 p-6 shadow-xl sticky top-24 space-y-6">
            <div>
              <span className="text-slate-400 text-xs block uppercase font-bold tracking-wider">Rent starts from</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-white font-black text-3xl">₹{property.rooms[0]?.price.toLocaleString() || '0'}</span>
                <span className="text-slate-400 text-sm">/month</span>
              </div>
            </div>

            <hr className="border-slate-800" />

            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 font-semibold">Verification badge:</span>
                {property.isVerified ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 size={15} /> Verified</span>
                ) : (
                  <span className="text-slate-500 font-medium">Under Review</span>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 font-semibold">Available beds:</span>
                <span className="font-bold text-white">
                  {property.rooms.reduce((acc: number, r: any) => acc + r.availableBeds, 0)} vacancies
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 font-semibold">PG Manager:</span>
                <span className="font-bold text-white">{property.owner.name}</span>
              </div>
            </div>

            {hasEnquired ? (
              <button
                onClick={() => router.push('/seeker/chat')}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 focus:outline-none"
              >
                <Send size={18} />
                <span>Open In-App Chat</span>
              </button>
            ) : (
              <button
                onClick={() => setShowEnquiryModal(true)}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 focus:outline-none"
              >
                <span>Send Booking Enquiry</span>
              </button>
            )}

            <p className="text-slate-500 text-[10px] text-center mt-2 leading-relaxed">
              Zero brokerage fee! Connect directly with the verified property manager.
            </p>
          </div>
        </div>
      </main>

      {/* Enquiry Modal */}
      {showEnquiryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1424] rounded-2xl max-w-md w-full shadow-2xl border border-slate-800 overflow-hidden text-slate-100">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
              <h3 className="font-bold text-white text-base">Booking Enquiry</h3>
              <button onClick={() => setShowEnquiryModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitEnquiry} className="p-6 space-y-4">
              <p className="text-xs text-slate-400 font-medium">
                Sending this enquiry starts a private in-app conversation with the owner.
              </p>
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Enquiry Message</label>
                <textarea
                  required
                  rows={4}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={enquiryMessage}
                  onChange={(e) => setEnquiryMessage(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEnquiryModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEnquiry}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 px-5 rounded-xl text-sm transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                >
                  {submittingEnquiry ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
