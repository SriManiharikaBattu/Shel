const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const CITY_COORDINATES = {
  "Hyderabad": { state: "Telangana", lat: 17.4065, lng: 78.4772 },
  "Bengaluru": { state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  "Mumbai": { state: "Maharashtra", lat: 19.0760, lng: 72.8777 },
  "Delhi": { state: "Delhi NCR", lat: 28.6139, lng: 77.2090 },
  "Pune": { state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  "Chennai": { state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  "Kolkata": { state: "West Bengal", lat: 22.5726, lng: 88.3639 },
  "Noida": { state: "Delhi NCR", lat: 28.5355, lng: 77.3910 },
  "Gurugram": { state: "Delhi NCR", lat: 28.4595, lng: 77.0266 },
  "Ahmedabad": { state: "Gujarat", lat: 23.0225, lng: 72.5714 },
};

const CITY_LOCALITIES = {
  "Hyderabad": ["Kukatpally", "Ameerpet", "Madhapur", "Gachibowli", "Miyapur", "SR Nagar", "Kondapur", "Uppal"],
  "Bengaluru": ["Koramangala", "BTM Layout", "Marathahalli", "Whitefield", "HSR Layout", "Electronic City", "Indiranagar", "Jayanagar"],
  "Mumbai": ["Andheri East", "Andheri West", "Powai", "Goregaon", "Malad", "Borivali", "Kandivali", "Kurla"],
  "Delhi": ["Laxmi Nagar", "Mukherjee Nagar", "Rajouri Garden", "Kalkaji", "Vasant Kunj", "Rohini", "Karol Bagh", "Dwarka"],
  "Pune": ["Kothrud", "Hinjewadi", "Viman Nagar", "Wakad", "Baner", "Katraj", "Aundh", "Hadapsar"],
  "Chennai": ["Adyar", "Velachery", "Anna Nagar", "Guindy", "OMR", "T Nagar", "Porur", "Tambaram"],
  "Kolkata": ["Salt Lake", "Jadavpur", "Park Street", "Behala", "Garia", "Dum Dum", "Howrah", "Ballygunge"],
  "Noida": ["Sector 62", "Sector 18", "Sector 15", "Sector 137", "Sector 63", "Greater Noida West"],
  "Gurugram": ["Sector 14", "DLF Phase 1", "Sushant Lok", "MG Road", "Sector 29", "Cyber City"],
  "Ahmedabad": ["Maninagar", "Navrangpura", "Satellite", "Bopal", "Vastrapur", "SG Highway"],
};

const MODERN_PREFIXES = [
  "Aura", "Zolo", "Stanza", "Housr", "LivSpace", "Nirvana", "Solace", "Komorebi", "Vibe",
  "Haven", "Oasis", "Lumina", "Canvas", "Flock", "Elysium", "Apex", "Nexus", "Vertex",
  "UrbanNest", "Casa", "Olive", "Zenith", "Terra", "Nova", "Cosmo", "Altus", "Velvet",
  "Bliss", "Prism", "Sonder", "Roam", "Aether", "Hyve", "Caelum", "Evolve", "Aster"
];

const GIRLS_MODERN_THEMES = [
  "Asteria", "Saffron", "Celeste", "Florence", "Seraphina", "Bloom", "Mirari", "Aurora",
  "Amethyst", "Zephyr", "Aria", "Willow", "Ivory", "Ember", "Iris", "Solstice", "Luna",
  "Dahlia", "Elan", "Velvet", "Opal", "Petal", "Adira", "Marigold", "Valence"
];

const BOYS_MODERN_THEMES = [
  "Vanguard", "Krypton", "Matrix", "Titan", "Forge", "Helios", "Strata", "Ironwood",
  "Pulse", "Cobalt", "Maverick", "Zenon", "Ranger", "Aero", "Summit", "Spartan",
  "Orion", "Volt", "Nomad", "Echo", "Atlas", "Garrison", "Beacon", "Torque"
];

const COED_MODERN_THEMES = [
  "Nexus", "Collective", "Synergy", "Latitude", "Equinox", "Meridian", "Arcadia", "Commons",
  "Habitat", "District", "Hive", "Atelier", "Spectrum", "Loft", "Quarters", "Silo",
  "CoSpace", "Mosaic", "Sanctuary", "Parallel", "Junction", "Metropolis"
];

const MODERN_SUFFIXES = [
  "Co-Living", "Residences", "Suites", "Living", "Studios", "House", "Stays",
  "Urban Living", "Hub", "Enclave", "Club", "Sanctuary", "Spaces", "Villas"
];

const AMENITIES_POOL = [
  "WiFi", "Food Included", "Laundry", "Power Backup", "CCTV Surveillance",
  "Parking", "Housekeeping", "Hot Water Geyser", "Refrigerator", "TV",
  "Washing Machine", "Study Table", "Wardrobe", "RO Water", "Lift",
  "Gym Access", "Attached Bathroom", "Balcony", "Security Guard", "Fire Safety"
];

// Authentic & realistic Indian hostel photos strictly sourced from the images & rooms folders
// Authentic hostel & room photo paths organized by distinct folders
const LOCAL_HOSTEL_IMAGES = [
  '/images/exteriors/building-exterior-1.jpg',
  '/images/exteriors/building-exterior-2.jpg',
  '/images/girls/girls-hostel-services.webp',
  '/images/girls/ladies-hostel-kakkanad.webp',
  '/images/boys/pg-hostels-for-men.jpg',
  '/images/boys/urban-backpackers-boys-pg.jpg',
  '/images/boys/youth-hostel-kolkata.jpg',
  '/images/boys/youth-hostel-kolkata-view.jpg',
  '/images/boys/hostel-building-main.jpg',
  '/images/coed/hostel-room-bunk.jpeg',
  '/images/coed/hostel-corridor.jpeg',
  '/images/coed/hostel-interior.jpg',
  '/images/coed/hostel-room-view.webp',
  '/images/rooms/room1.png',
  '/images/rooms/room2.png',
  '/images/rooms/room3.png',
  '/images/rooms/room4.jpg',
  '/images/rooms/room5.png',
];

const GIRLS_IMAGES_POOL = [
  '/images/girls/girls-hostel-services.webp',
  '/images/girls/ladies-hostel-kakkanad.webp',
  '/images/girls/room-deluxe-single.png',
  '/images/girls/room-double-sharing.png',
  '/images/rooms/room3.png',
  '/images/coed/hostel-interior.jpg',
  '/images/coed/hostel-room-view.webp',
  '/images/coed/hostel-corridor.jpeg',
  '/images/rooms/room5.png',
  '/images/exteriors/building-exterior-1.jpg',
];

const BOYS_IMAGES_POOL = [
  '/images/boys/pg-hostels-for-men.jpg',
  '/images/boys/urban-backpackers-boys-pg.jpg',
  '/images/boys/youth-hostel-kolkata.jpg',
  '/images/boys/youth-hostel-kolkata-view.jpg',
  '/images/boys/hostel-building-main.jpg',
  '/images/coed/hostel-room-bunk.jpeg',
  '/images/coed/hostel-corridor.jpeg',
  '/images/exteriors/building-exterior-2.jpg',
  '/images/rooms/room4.jpg',
  '/images/rooms/room2.png',
  '/images/rooms/room3.png',
];

const COED_IMAGES_POOL = [
  '/images/boys/hostel-building-main.jpg',
  '/images/boys/urban-backpackers-boys-pg.jpg',
  '/images/coed/hostel-interior.jpg',
  '/images/coed/hostel-room-bunk.jpeg',
  '/images/coed/hostel-corridor.jpeg',
  '/images/rooms/room1.png',
  '/images/rooms/room2.png',
  '/images/rooms/room4.jpg',
  '/images/rooms/room5.png',
  '/images/boys/youth-hostel-kolkata-view.jpg',
  '/images/exteriors/building-exterior-1.jpg',
];

// Linear congruential generator for reproducible pseudo-random numbers
let seedVal = 42;
function pseudoRandom() {
  seedVal = (seedVal * 9301 + 49297) % 233280;
  return seedVal / 233280;
}

function randChoice(arr) {
  return arr[Math.floor(pseudoRandom() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(pseudoRandom() * (max - min + 1)) + min;
}

function randSample(arr, n) {
  const shuffled = [...arr].sort(() => 0.5 - pseudoRandom());
  return shuffled.slice(0, n);
}

const BASE_PRICE_RANGE = {
  "Single": [9000, 22000],
  "Double": [6000, 15000],
  "Triple": [4500, 11000],
  "Four Sharing": [3500, 8500],
};

const CITY_MULTIPLIER = {
  "Mumbai": 1.5, "Bengaluru": 1.35, "Delhi": 1.3, "Gurugram": 1.3,
  "Pune": 1.15, "Hyderabad": 1.1, "Chennai": 1.05, "Noida": 1.1,
  "Kolkata": 0.9, "Ahmedabad": 0.85
};

function generateHostels(genderType, themesPool, numHostels, startId) {
  const hostels = [];
  const cities = Object.keys(CITY_LOCALITIES);

  for (let i = 0; i < numHostels; i++) {
    const hostelId = startId + i;
    const city = cities[i % cities.length];
    const localities = CITY_LOCALITIES[city];
    const locality = localities[i % localities.length];

    // Modern branding styles
    const nameFormatPattern = i % 4;
    let name = "";
    if (nameFormatPattern === 0) {
      // e.g. "Stanza Asteria Co-Living"
      name = `${randChoice(MODERN_PREFIXES)} ${randChoice(themesPool)} ${randChoice(MODERN_SUFFIXES)}`;
    } else if (nameFormatPattern === 1) {
      // e.g. "Housr Vanguard Residences"
      name = `${randChoice(MODERN_PREFIXES)} ${randChoice(themesPool)} ${randChoice(["Residences", "Living", "Suites"])}`;
    } else if (nameFormatPattern === 2) {
      // e.g. "The Solace Hub" or "Casa Seraphina Studios"
      name = `${randChoice(MODERN_PREFIXES)} ${randChoice(themesPool)} ${randChoice(MODERN_SUFFIXES)}`;
    } else {
      // e.g. "LivSpace Apex Suites"
      name = `${randChoice(MODERN_PREFIXES)} ${randChoice(themesPool)} ${randChoice(MODERN_SUFFIXES)}`;
    }

    const acType = pseudoRandom() < 0.45 ? "AC" : "NON_AC";
    const numSharing = randInt(2, 4);
    const sharingOptions = randSample(["Single", "Double", "Triple", "Four Sharing"], numSharing);
    const verified = pseudoRandom() < 0.6;
    const rating = Math.round((3.0 + pseudoRandom() * 2.0) * 10) / 10;
    const distKm = Math.round((0.5 + pseudoRandom() * 7.5) * 10) / 10;
    const amenities = randSample(AMENITIES_POOL, randInt(5, 9));

    const rooms = sharingOptions.map((sharing) => {
      const [low, high] = BASE_PRICE_RANGE[sharing];
      const mult = CITY_MULTIPLIER[city] || 1.0;
      const base = randInt(low, high);
      const price = Math.round((base * mult) / 100) * 100;
      const totalBeds = { "Single": 1, "Double": 2, "Triple": 3, "Four Sharing": 4 }[sharing];
      const vacantBeds = randInt(0, totalBeds);
      const sharingTypeEnum = { "Single": "SINGLE", "Double": "DOUBLE", "Triple": "TRIPLE", "Four Sharing": "DORMITORY" }[sharing];

      return {
        sharingType: sharingTypeEnum,
        price,
        totalBeds,
        availableBeds: vacantBeds,
      };
    });

    hostels.push({
      hostelId,
      name,
      genderType: genderType.toUpperCase(),
      city,
      locality,
      state: CITY_COORDINATES[city]?.state || "Telangana",
      acType,
      verified,
      rating,
      distKm,
      amenities,
      rooms,
    });
  }
  return hostels;
}

async function main() {
  console.log('Connecting to MongoDB and clearing collections...');
  await prisma.wishlist.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.enquiry.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Core Users
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@pgfinder.com',
      phone: '9999999999',
      password: passwordHash,
      role: 'ADMIN',
      gender: 'OTHER',
    },
  });

  const owner1 = await prisma.user.create({
    data: {
      name: 'Ramesh Kumar',
      email: 'ramesh@pgfinder.com',
      phone: '9876543210',
      password: passwordHash,
      role: 'OWNER',
      gender: 'MALE',
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      name: 'Anjali Sharma',
      email: 'anjali@pgfinder.com',
      phone: '8765432109',
      password: passwordHash,
      role: 'OWNER',
      gender: 'FEMALE',
    },
  });

  const seekerMale = await prisma.user.create({
    data: {
      name: 'Rahul Verma',
      email: 'rahul@pgfinder.com',
      phone: '7654321098',
      password: passwordHash,
      role: 'SEEKER',
      gender: 'MALE',
    },
  });

  const seekerFemale = await prisma.user.create({
    data: {
      name: 'Priya Reddy',
      email: 'priya@pgfinder.com',
      phone: '6543210987',
      password: passwordHash,
      role: 'SEEKER',
      gender: 'FEMALE',
    },
  });

  console.log('Core seed users created.');

  // 2. Generate Dataset with Modern Co-Living Branding (150 Girls + 150 Boys + 100 Co-ed = 400 Hostels total)
  const girlsHostels = generateHostels("GIRLS", GIRLS_MODERN_THEMES, 150, 1);
  const boysHostels = generateHostels("BOYS", BOYS_MODERN_THEMES, 150, 1001);
  const coedHostels = generateHostels("COED", COED_MODERN_THEMES, 100, 2001);
  const allHostels = [...girlsHostels, ...boysHostels, ...coedHostels];

  console.log(`Ingesting ${allHostels.length} hostels into MongoDB with unique and distinct pictures...`);

  let count = 0;

  for (let idx = 0; idx < allHostels.length; idx++) {
    const h = allHostels[idx];
    const coords = CITY_COORDINATES[h.city] || { lat: 17.4065, lng: 78.4772 };
    const angle = (h.hostelId * 137.5 * Math.PI) / 180;
    const radius = (h.distKm / 111.0);
    const lat = coords.lat + Math.sin(angle) * radius;
    const lng = coords.lng + Math.cos(angle) * radius;

    // Select images appropriately based on gender type to ensure realism from the uploaded images folder
    let activePool = LOCAL_HOSTEL_IMAGES;
    if (h.genderType === 'GIRLS') {
      activePool = GIRLS_IMAGES_POOL;
    } else if (h.genderType === 'BOYS') {
      activePool = BOYS_IMAGES_POOL;
    } else {
      activePool = COED_IMAGES_POOL;
    }
    const currentPoolLen = activePool.length;

    // Pick 3 distinct images for this specific hostel using distinct offsets from pool
    let hostelImages = [
      activePool[(idx * 3) % currentPoolLen],
      activePool[(idx * 3 + 1) % currentPoolLen],
      activePool[(idx * 3 + 2) % currentPoolLen]
    ];

    // Special custom assignments
    if (h.name.toLowerCase().includes('harmony house') || h.name.toLowerCase().includes('canvas meridian')) {
      hostelImages = [
        '/images/boys/hostel-building-main.jpg',
        '/images/rooms/room1.png',
        '/images/coed/hostel-interior.jpg',
        '/images/coed/hostel-room-bunk.jpeg'
      ];
    }

    const owner = h.hostelId % 2 === 0 ? owner1 : owner2;

    const property = await prisma.property.create({
      data: {
        name: h.name,
        address: `${h.locality}, ${h.city}`,
        city: h.city,
        state: h.state,
        latitude: lat,
        longitude: lng,
        genderType: h.genderType,
        acType: h.acType,
        description: `Welcome to ${h.name} located in ${h.locality}, ${h.city}. A high-standard ${h.genderType.toLowerCase()} accommodation featuring furnished beds with storage, study tables, clean washrooms, and housekeeping.`,
        houseRules: JSON.stringify([
          'Main gate closes at 10:30 PM',
          'Visitors to be registered at security desk',
          'Keep common areas clean',
          'No smoking inside rooms'
        ]),
        images: JSON.stringify(hostelImages),
        amenities: JSON.stringify(h.amenities),
        isVerified: h.verified,
        ownerId: owner.id,
        rooms: {
          create: h.rooms.map((r) => ({
            sharingType: r.sharingType,
            price: r.price,
            totalBeds: r.totalBeds,
            availableBeds: r.availableBeds,
          }))
        }
      }
    });

    if (h.rating >= 4.0) {
      await prisma.review.create({
        data: {
          seekerId: h.genderType === 'GIRLS' ? seekerFemale.id : seekerMale.id,
          propertyId: property.id,
          rating: Math.min(5, Math.round(h.rating)),
          comment: `Great location in ${h.locality}! The rooms are neat, good ventilation, and homely food.`,
        }
      });
    }

    count++;
    if (count % 50 === 0) {
      console.log(`Stored ${count}/${allHostels.length} hostels into MongoDB with distinct images...`);
    }
  }

  console.log('✅ Successfully stored all 400 hostels with distinct, diverse photos into MongoDB (shel_db)!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
