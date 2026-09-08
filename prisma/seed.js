const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Authentic hostel & room photo paths organized by distinct folders
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

const AMENITIES_POOL = [
  "WiFi", "Food Included", "Laundry", "Power Backup", "CCTV",
  "Parking", "Housekeeping", "Hot Water Geyser", "Refrigerator", "TV",
  "Washing Machine", "Study Table", "Wardrobe", "RO Water", "Lift",
  "Gym", "Attached Bathroom", "Balcony", "Security Guard", "Fire Safety"
];

const LOCALITY_NAMES = [
  "Central Enclave", "Near Metro Station", "University Road", "IT Corridor",
  "Civil Lines", "MG Road", "Tech Park Avenue", "Green Valley",
  "Gandhi Nagar", "City Center", "Lakeview Colony", "North Campus",
  "South Extension", "Royal Residency Area", "Station Road", "Park View",
  "Kaveri Nagar", "Ashok Nagar", "Sector 14", "Cyber Enclave"
];

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

const REVIEW_COMMENTS = [
  "Excellent location! Clean and spacious rooms with daily housekeeping. High-speed Wi-Fi is reliable for work and study.",
  "Homely hygienic food served on time 3 meals a day. Warden is very supportive and security is 24/7.",
  "Great value for money. Power backup works seamlessly during outages. Peaceful study environment.",
  "Very neat bathrooms with geyser, clean drinking RO water, and spacious wardrobe storage with locks.",
  "Close to main road and transport links. Friendly roommates, fast wifi, and safe biometric entrance.",
  "Well-maintained building with regular sanitization, quiet atmosphere, and courteous management staff.",
  "Spacious rooms with good ventilation. Laundry and cleaning services are handled promptly every week.",
  "Safe and comfortable stay with great food, regular water supply, and comfortable study desks."
];

// Linear congruential generator for reproducible pseudo-random numbers
let seedVal = 101;
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

  // Multiple Seeker Users for realistic community reviews
  const seekers = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Rahul Verma',
        email: 'rahul@pgfinder.com',
        phone: '7654321098',
        password: passwordHash,
        role: 'SEEKER',
        gender: 'MALE',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Priya Reddy',
        email: 'priya@pgfinder.com',
        phone: '6543210987',
        password: passwordHash,
        role: 'SEEKER',
        gender: 'FEMALE',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Ananya Iyer',
        email: 'ananya@pgfinder.com',
        phone: '6543210988',
        password: passwordHash,
        role: 'SEEKER',
        gender: 'FEMALE',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Vikram Malhotra',
        email: 'vikram@pgfinder.com',
        phone: '7654321099',
        password: passwordHash,
        role: 'SEEKER',
        gender: 'MALE',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Sneha Patel',
        email: 'sneha@pgfinder.com',
        phone: '6543210989',
        password: passwordHash,
        role: 'SEEKER',
        gender: 'FEMALE',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Rohan Gupta',
        email: 'rohan@pgfinder.com',
        phone: '7654321090',
        password: passwordHash,
        role: 'SEEKER',
        gender: 'MALE',
      },
    }),
  ]);

  console.log('Core seed users and reviewers created.');

  // 2. Load State and City Data (All 32 States & UTs, 99 Cities)
  const stateCityPath = path.join(__dirname, '..', 'data', 'csv', 'state_city_data.json');
  const stateCityData = JSON.parse(fs.readFileSync(stateCityPath, 'utf8'));

  // Tier multiplier for cities
  const TIER1_CITIES = ['Mumbai', 'Bengaluru', 'New Delhi', 'Delhi', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Gurugram', 'Noida'];
  const TIER2_CITIES = ['Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Indore', 'Bhopal', 'Kochi', 'Visakhapatnam', 'Coimbatore', 'Surat', 'Vadodara', 'Patna', 'Bhubaneswar'];

  let totalHostelsCreated = 0;
  let hostelIdCounter = 1000;

  for (const [stateName, citiesList] of Object.entries(stateCityData)) {
    for (const cityObj of citiesList) {
      const cityName = cityObj.name;
      const baseLat = cityObj.lat;
      const baseLng = cityObj.lng;

      // Tier price multiplier
      let baseSinglePrice = 11000;
      if (TIER1_CITIES.some(c => c.toLowerCase() === cityName.toLowerCase())) {
        baseSinglePrice = 14000 + randInt(0, 4) * 500;
      } else if (TIER2_CITIES.some(c => c.toLowerCase() === cityName.toLowerCase())) {
        baseSinglePrice = 10500 + randInt(0, 3) * 500;
      } else {
        baseSinglePrice = 8500 + randInt(0, 3) * 500;
      }

      // Generate minimum 6 hostels for this city (3 Boys, 2 Girls, 1 Co-ed)
      const cityHostelGenders = ['BOYS', 'GIRLS', 'BOYS', 'GIRLS', 'COED', 'BOYS'];

      for (let hIdx = 0; hIdx < cityHostelGenders.length; hIdx++) {
        hostelIdCounter++;
        const gender = cityHostelGenders[hIdx];
        
        let themesPool = BOYS_MODERN_THEMES;
        let imagesPool = BOYS_IMAGES_POOL;
        if (gender === 'GIRLS') {
          themesPool = GIRLS_MODERN_THEMES;
          imagesPool = GIRLS_IMAGES_POOL;
        } else if (gender === 'COED') {
          themesPool = COED_MODERN_THEMES;
          imagesPool = COED_IMAGES_POOL;
        }

        const name = `${randChoice(MODERN_PREFIXES)} ${randChoice(themesPool)} ${randChoice(MODERN_SUFFIXES)}`;
        const locality = LOCALITY_NAMES[(hostelIdCounter + hIdx) % LOCALITY_NAMES.length];

        // Coordinate calculation with jitter around city center
        const angle = (hostelIdCounter * 137.5 * Math.PI) / 180;
        const distKm = Math.round((0.8 + pseudoRandom() * 6.5) * 10) / 10;
        const radius = (distKm / 111.0);
        const lat = baseLat + Math.sin(angle) * radius;
        const lng = baseLng + Math.cos(angle) * radius;

        const acTypeChoice = hIdx % 3 === 0 ? 'AC' : hIdx % 3 === 1 ? 'BOTH' : 'NON_AC';
        const isVerified = (hostelIdCounter % 10) !== 0; // ~90% verified

        // STRICT ROOM PRICING: Single > Double > Triple > Four Sharing (Dormitory)
        const singlePrice = baseSinglePrice + (hIdx * 400);
        const doublePrice = Math.round((singlePrice * 0.70) / 100) * 100;
        const triplePrice = Math.round((doublePrice * 0.75) / 100) * 100;
        const fourSharingPrice = Math.round((triplePrice * 0.75) / 100) * 100;

        // Build room configurations with accurate vacancies
        const roomsData = [
          {
            sharingType: 'SINGLE',
            price: singlePrice,
            totalBeds: 1,
            availableBeds: pseudoRandom() < 0.65 ? 1 : 0,
          },
          {
            sharingType: 'DOUBLE',
            price: doublePrice,
            totalBeds: 2,
            availableBeds: randInt(0, 2),
          },
          {
            sharingType: 'TRIPLE',
            price: triplePrice,
            totalBeds: 3,
            availableBeds: randInt(0, 3),
          },
          {
            sharingType: 'DORMITORY',
            price: fourSharingPrice,
            totalBeds: 4,
            availableBeds: randInt(1, 4),
          },
        ];

        // Pick 3 distinct images for gallery
        const currentPoolLen = imagesPool.length;
        const hostelImages = [
          imagesPool[(hostelIdCounter * 3) % currentPoolLen],
          imagesPool[(hostelIdCounter * 3 + 1) % currentPoolLen],
          imagesPool[(hostelIdCounter * 3 + 2) % currentPoolLen]
        ];

        const selectedAmenities = randSample(AMENITIES_POOL, randInt(6, 11));
        const owner = hostelIdCounter % 2 === 0 ? owner1 : owner2;

        const property = await prisma.property.create({
          data: {
            name,
            address: `${locality}, ${cityName}`,
            city: cityName,
            state: stateName,
            latitude: lat,
            longitude: lng,
            genderType: gender,
            acType: acTypeChoice,
            description: `Welcome to ${name} situated in ${locality}, ${cityName}, ${stateName}. Premium ${gender.toLowerCase()} accommodation featuring furnished beds with under-bed storage, study workstations, attached washrooms, and daily housekeeping.`,
            houseRules: JSON.stringify([
              'Main gate closes at 10:30 PM',
              'Visitors must register at reception',
              'Maintain cleanliness in common spaces',
              'Quiet hours from 11:00 PM to 6:00 AM',
              'No smoking or alcohol inside premises'
            ]),
            images: JSON.stringify(hostelImages),
            amenities: JSON.stringify(selectedAmenities),
            isVerified,
            ownerId: owner.id,
            rooms: {
              create: roomsData
            }
          }
        });

        // Add 1 to 3 community reviews and ratings
        const numReviews = randInt(1, 3);
        const ratingScore = pseudoRandom() < 0.7 ? (pseudoRandom() < 0.5 ? 5 : 4) : 3;

        for (let r = 0; r < numReviews; r++) {
          const reviewerPool = gender === 'GIRLS'
            ? seekers.filter(s => s.gender === 'FEMALE')
            : seekers.filter(s => s.gender === 'MALE');
          const reviewer = reviewerPool[r % reviewerPool.length] || seekers[0];
          const commentText = REVIEW_COMMENTS[(hostelIdCounter + r) % REVIEW_COMMENTS.length];

          await prisma.review.create({
            data: {
              seekerId: reviewer.id,
              propertyId: property.id,
              rating: ratingScore,
              comment: commentText,
            }
          });
        }

        totalHostelsCreated++;
      }
    }
  }

  console.log(`✅ Successfully stored ${totalHostelsCreated} hostels (minimum 6 in all 99 cities) with strict price scaling and authentic reviews into MongoDB!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
