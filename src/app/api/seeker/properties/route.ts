import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const city = searchParams.get('city') || '';
    const state = searchParams.get('state') || '';
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');
    const maxDistanceStr = searchParams.get('maxDistance');
    const minPriceStr = searchParams.get('minPrice');
    const maxPriceStr = searchParams.get('maxPrice');
    const sharingType = searchParams.get('sharingType'); // SINGLE, DOUBLE, TRIPLE, DORMITORY
    const acType = searchParams.get('acType'); // AC, NON_AC, BOTH
    const targetGenderType = searchParams.get('genderType'); // BOYS, GIRLS, COED
    const amenities = searchParams.get('amenities') ? searchParams.get('amenities')?.split(',') : [];
    const minRatingStr = searchParams.get('minRating');
    const availableNow = searchParams.get('availableNow') === 'true';
    const sort = searchParams.get('sort') || ''; // price_asc, price_desc, rating_desc, distance_asc
    const disableGenderFilter = searchParams.get('disableGenderFilter') === 'true';

    // 1. Determine user gender for auto-filtering
    const payload = getUserFromRequest(request);
    let userGender = '';
    if (payload && !disableGenderFilter) {
      userGender = payload.gender;
    }

    // 2. Build where conditions
    const where: any = {
      isActive: true, // Only show active listings
    };

    if (state) {
      where.state = state;
    }

    if (city) {
      where.city = city;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { address: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Auto gender filtering based on seeker's profile gender
    if (userGender && !targetGenderType) {
      if (userGender === 'MALE') {
        where.genderType = { in: ['BOYS', 'COED'] };
      } else if (userGender === 'FEMALE') {
        where.genderType = { in: ['GIRLS', 'COED'] };
      }
    } else if (targetGenderType) {
      where.genderType = targetGenderType;
    }

    if (acType && acType !== 'BOTH') {
      where.acType = { in: [acType, 'BOTH'] };
    }

    // Fetch properties including rooms and reviews
    let properties = await prisma.property.findMany({
      where,
      include: {
        rooms: true,
        reviews: {
          select: { rating: true }
        }
      }
    });

    // 3. Process records in JS (Price filter, distance, ratings, amenities, sorting)
    let results = properties.map((prop) => {
      // Calculate average rating
      const totalRatings = prop.reviews.length;
      const avgRating = totalRatings > 0
        ? prop.reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings
        : 0;

      // Extract min price and room status
      const prices = prop.rooms.map((r) => r.price);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
      const hasVacancy = prop.rooms.some((r) => r.availableBeds > 0);

      // Amenities parsing
      let propAmenities: string[] = [];
      try {
        propAmenities = JSON.parse(prop.amenities);
      } catch (e) {
        propAmenities = [];
      }

      // Calculate distance if lat/lng is passed
      let distance = 0;
      if (latStr && lngStr) {
        distance = getDistance(
          parseFloat(latStr),
          parseFloat(lngStr),
          prop.latitude,
          prop.longitude
        );
      }

      return {
        ...prop,
        amenities: propAmenities,
        avgRating,
        totalReviews: totalRatings,
        minPrice,
        maxPrice,
        hasVacancy,
        distance,
      };
    });

    // Apply Price filter (ensure at least one room price falls within the range)
    if (minPriceStr || maxPriceStr) {
      const minP = minPriceStr ? parseFloat(minPriceStr) : 0;
      const maxP = maxPriceStr ? parseFloat(maxPriceStr) : Infinity;
      results = results.filter((p) =>
        p.rooms.some((r) => r.price >= minP && r.price <= maxP)
      );
    }

    // Apply Sharing Type filter (strictly requires available beds > 0 for that sharing type)
    if (sharingType) {
      results = results.filter((p) =>
        p.rooms.some((r) => r.sharingType === sharingType && r.availableBeds > 0)
      );
    }

    // Apply Amenities filter (all requested amenities must be present)
    if (amenities && amenities.length > 0) {
      results = results.filter((p) =>
        amenities.every((amenity) => p.amenities.includes(amenity))
      );
    }

    // Apply Rating filter
    if (minRatingStr) {
      const minR = parseFloat(minRatingStr);
      results = results.filter((p) => p.avgRating >= minR);
    }

    // Apply Distance filter (Default to 10 km if coordinates are provided)
    if (latStr && lngStr) {
      const maxD = maxDistanceStr ? parseFloat(maxDistanceStr) : 10;
      results = results.filter((p) => p.distance <= maxD);
    }

    // Apply Available Now filter
    if (availableNow) {
      if (sharingType) {
        results = results.filter((p) =>
          p.rooms.some((r) => r.sharingType === sharingType && r.availableBeds > 0)
        );
      } else {
        results = results.filter((p) => p.hasVacancy);
      }
    }

    // Apply Sorting
    if (sort === 'price_asc') {
      results.sort((a, b) => a.minPrice - b.minPrice);
    } else if (sort === 'price_desc') {
      results.sort((a, b) => b.minPrice - a.minPrice);
    } else if (sort === 'rating_desc') {
      results.sort((a, b) => b.avgRating - a.avgRating);
    } else if (sort === 'distance_asc' && latStr && lngStr) {
      results.sort((a, b) => a.distance - b.distance);
    }

    return NextResponse.json({ properties: results });
  } catch (error: any) {
    console.error('Fetch properties error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
