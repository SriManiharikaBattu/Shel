import csv
import random

random.seed(7)

# ---- States with 3-4 popular cities each (fewer for smaller NE states where
# that many well-known cities don't realistically exist) ----
STATE_CITIES = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati"],
    "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat"],
    "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Durg"],
    "Goa": ["Panaji", "Margao", "Vasco da Gama"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
    "Haryana": ["Gurugram", "Faridabad", "Panipat", "Hisar"],
    "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Solan"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro"],
    "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi"],
    "Kerala": ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
    "Manipur": ["Imphal"],
    "Meghalaya": ["Shillong"],
    "Mizoram": ["Aizawl"],
    "Nagaland": ["Kohima", "Dimapur"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Puri"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
    "Sikkim": ["Gangtok"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
    "Tripura": ["Agartala"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Noida", "Varanasi"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Nainital"],
    "West Bengal": ["Kolkata", "Howrah", "Siliguri", "Durgapur"],
    "Delhi (NCT)": ["New Delhi", "Dwarka", "Rohini"],
    "Jammu and Kashmir": ["Srinagar", "Jammu"],
    "Puducherry": ["Puducherry"],
    "Chandigarh": ["Chandigarh"],
}

# ---- Name pools ----
TELUGU_GIRLS_NAMES = [
    "Hasini", "Sasi", "Lakshmi", "Sowjanya", "Bhargavi", "Manasa", "Sindhura",
    "Divya", "Keerthi", "Yamini", "Pranathi", "Sirisha", "Anjali", "Meghana",
    "Nikitha", "Sruthi", "Vasavi", "Sravani", "Chandana", "Swathi", "Deepika",
    "Harika", "Spandana", "Alekhya", "Nithya", "Varshini", "Charitha", "Jyothi",
    "Kavya", "Lasya", "Mounika", "Navya", "Prasanna", "Rajeswari", "Ramya",
    "Sahithi", "Sowmya", "Tejaswi", "Uma", "Vaishnavi",
]

TELUGU_BOYS_NAMES = [
    "Ramanandhana", "Sai Krishna", "Venkatesh", "Nagarjuna", "Chaitanya",
    "Vijay", "Harsha", "Karthikeya", "Siddharth", "Rohit", "Naveen", "Praveen",
    "Bhargav", "Kiran", "Sathwik", "Manikanta", "Yashwanth", "Vamsi", "Teja",
    "Charan", "Akhil", "Bharadwaj", "Dheeraj", "Gopichand", "Hemanth",
    "Jagadeesh", "Kalyan", "Lokesh", "Mahesh", "Narendra", "Omkar", "Pavan",
    "Raju", "Sandeep", "Trinath", "Uday", "Varun", "Yaswanth", "Adarsh", "Rakesh",
]

ENGLISH_NAMES = [
    "Sunrise", "Comfort", "Elite", "Royal", "Golden", "Silver", "Green", "Blue",
    "Crystal", "Diamond", "Pearl", "Maple", "Oak", "Sunshine", "Horizon",
    "Skyline", "Urban", "Metro", "Central", "Grand", "Star", "Moon", "Ocean",
    "Palm", "Rose", "Ivy", "Willow", "Cedar", "Birch", "Aspen", "Meadow",
    "Brook", "River", "Lake", "Hill", "Valley", "Garden", "Park", "Plaza",
]

SUFFIXES = [
    "PG", "Hostel", "Residency", "Nivas", "Nilayam", "Homes", "House", "Stay",
    "Lodge", "Living", "Comforts", "Palace", "Manor", "Villa", "Cottage",
    "Mansion",
]

AMENITIES_POOL = [
    "WiFi", "Food Included", "Laundry", "Power Backup", "CCTV Surveillance",
    "Parking", "Housekeeping", "Hot Water Geyser", "Refrigerator", "TV",
    "Washing Machine", "Study Table", "Wardrobe", "RO Water", "Lift",
    "Gym Access", "Attached Bathroom", "Balcony", "Security Guard", "Fire Safety",
]

SHARING_TYPES = ["Single", "Double", "Triple", "Four Sharing"]

BASE_PRICE_RANGE = {
    "Single": (8000, 22000),
    "Double": (5500, 15000),
    "Triple": (4200, 11000),
    "Four Sharing": (3200, 8500),
}

TIER1 = {"Mumbai", "Bengaluru", "Delhi (NCT)", "Hyderabad", "Chennai", "Pune", "Kolkata", "Gurugram"}

AC_TYPES = ["AC", "Non-AC"]

used_names = set()

def unique_hostel_name(gender):
    """Generate a unique hostel name, ~70% Telugu-style, ~30% English-style."""
    for _ in range(200):  # generous retry cap
        if random.random() < 0.7:
            pool = TELUGU_GIRLS_NAMES if gender == "Girls" else TELUGU_BOYS_NAMES
            given = random.choice(pool)
        else:
            given = random.choice(ENGLISH_NAMES)
        suffix = random.choice(SUFFIXES)
        name = f"{given} {suffix}"
        if name not in used_names:
            used_names.add(name)
            return name
    # Fallback: append a second word if the pool is exhausted
    given2 = random.choice(ENGLISH_NAMES)
    name = f"{given} {given2} {suffix}"
    used_names.add(name)
    return name


def random_amenities():
    n = random.randint(5, 10)
    return ", ".join(random.sample(AMENITIES_POOL, n))


def random_price(sharing_type, city):
    low, high = BASE_PRICE_RANGE[sharing_type]
    mult = 1.3 if city in TIER1 else 1.0
    base = random.randint(low, high)
    return int(base * mult / 100) * 100


def generate_hostel_rows(hostel_id, gender_type, state, city):
    name = unique_hostel_name(gender_type)
    ac_type = random.choices(AC_TYPES, weights=[0.45, 0.55])[0]
    sharing_options = random.sample(SHARING_TYPES, random.randint(2, 4))

    rows = []
    for sharing in sharing_options:
        price = random_price(sharing, city)
        total_beds = {"Single": 1, "Double": 2, "Triple": 3, "Four Sharing": 4}[sharing]
        vacant_beds = random.randint(0, total_beds)
        rows.append({
            "hostel_id": hostel_id,
            "hostel_name": name,
            "gender_type": gender_type,
            "state": state,
            "city": city,
            "ac_type": ac_type,
            "sharing_type": sharing,
            "price_per_month_inr": price,
            "total_beds": total_beds,
            "vacant_beds": vacant_beds,
            "vacancy_status": "Available" if vacant_beds > 0 else "Full",
            "food_included": random.choice(["Yes", "No"]),
            "rating": round(random.uniform(3.0, 5.0), 1),
            "verified": random.choice(["Yes", "No"]),
            "distance_from_city_center_km": round(random.uniform(0.2, 8.0), 1),
            "amenities": random_amenities(),
        })
    return rows


def generate_dataset(gender_type, start_id, hostels_per_city=2):
    all_rows = []
    hostel_id = start_id
    for state, cities in STATE_CITIES.items():
        for city in cities:
            for _ in range(hostels_per_city):
                rows = generate_hostel_rows(hostel_id, gender_type, state, city)
                all_rows.extend(rows)
                hostel_id += 1
    return all_rows


FIELDNAMES = [
    "hostel_id", "hostel_name", "gender_type", "state", "city",
    "ac_type", "sharing_type", "price_per_month_inr", "total_beds",
    "vacant_beds", "vacancy_status", "food_included", "rating",
    "verified", "distance_from_city_center_km", "amenities",
]


def write_csv(filename, rows):
    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows)} rows to {filename}")


if __name__ == "__main__":
    girls_rows = generate_dataset("Girls", start_id=1, hostels_per_city=2)
    boys_rows = generate_dataset("Boys", start_id=5001, hostels_per_city=2)

    write_csv("girls_pg_hostels_india_by_state.csv", girls_rows)
    write_csv("boys_pg_hostels_india_by_state.csv", boys_rows)

    unique_girls = len(set(r["hostel_name"] for r in girls_rows))
    unique_boys = len(set(r["hostel_name"] for r in boys_rows))
    total_unique = len(used_names)
    print(f"Unique girls hostel names: {unique_girls}")
    print(f"Unique boys hostel names: {unique_boys}")
    print(f"Total unique names across both files: {total_unique}")
    print(f"States/UTs covered: {len(STATE_CITIES)}")
