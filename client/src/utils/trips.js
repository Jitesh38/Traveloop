export const fallbackRegionImages = {
  'Paris, France':
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80',
  'Bali, Indonesia':
    'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=crop&w=900&q=80',
  'Tokyo, Japan':
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80',
  'New York, USA':
    'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=900&q=80',
  'Santorini, Greece':
    'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=900&q=80',
  'Nairobi, Kenya':
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=900&q=80',
  'Barcelona, Spain':
    'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=900&q=80',
  Maldives:
    'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=900&q=80',
  'Rajasthan, India':
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=80',
  'Patagonia, Chile':
    'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=900&q=80',
  'Rome, Italy':
    'https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=900&q=80',
  'Dubai, UAE':
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80',
}

export const fallbackTripImage =
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80'

export const getBudgetValue = (item) => {
  const numericValue = Number(item.price?.replace(/\D/g, ''))
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : null
}

export const formatCompactDate = (value) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(value))

export const formatDateRange = (startDate, endDate) =>
  `${formatCompactDate(startDate)} - ${formatCompactDate(endDate)}`

export const getDurationDays = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffInMs = end.getTime() - start.getTime()
  return Math.max(1, Math.round(diffInMs / (1000 * 60 * 60 * 24)) + 1)
}

export const formatBudgetLabel = (amount) => `Rs ${Math.round(amount).toLocaleString('en-IN')}`

export const getRegionImage = (region) =>
  region.images?.[0] || fallbackRegionImages[region.name] || fallbackTripImage

export const getTripImage = (trip) =>
  trip.tripActivities?.find((item) => item.activity?.images?.[0])?.activity?.images?.[0] ||
  trip.region?.images?.[0] ||
  fallbackRegionImages[trip.region?.name] ||
  fallbackTripImage

export const mapRegionToCard = (region) => ({
  id: `region-${region.id}`,
  title: region.name,
  subtitle: region.description || 'Explore curated activities, local highlights, and trip ideas.',
  meta: region.rating ? `Rated ${Number(region.rating).toFixed(1)} by travelers` : 'Region guide',
  rating: region.rating ? Number(region.rating).toFixed(1) : '',
  location: region.name.split(',').slice(-1)[0]?.trim() || 'Region',
  price: '',
  image: getRegionImage(region),
})

export const mapTripToCard = (trip, timeline) => {
  const totalBudget = trip.tripActivities?.reduce((sum, item) => {
    const activityBudget = Number(item.budget)
    return Number.isFinite(activityBudget) ? sum + activityBudget : sum
  }, 0) ?? 0
  const hasBudget = totalBudget > 0
  const activityCount = trip.tripActivities?.length ?? 0
  const durationDays = getDurationDays(trip.startDate, trip.endDate)

  let meta = `${formatDateRange(trip.startDate, trip.endDate)}`
  if (timeline === 'planned') meta = `Starts ${formatCompactDate(trip.startDate)}`
  if (timeline === 'previous') meta = `Completed ${formatCompactDate(trip.endDate)}`
  if (timeline === 'ongoing') meta = `In progress until ${formatCompactDate(trip.endDate)}`
  if (hasBudget) meta = `${meta} - Budget ${formatBudgetLabel(totalBudget)}`

  const averageRating = activityCount
    ? trip.tripActivities.reduce((sum, item) => sum + Number(item.activity?.rating || 0), 0) / activityCount
    : 0

  return {
    id: `trip-${trip.id}`,
    tripId: trip.id,
    title: trip.name || trip.region?.name || 'Untitled trip',
    subtitle: `${durationDays} day${durationDays > 1 ? 's' : ''}, ${activityCount} planned activit${activityCount === 1 ? 'y' : 'ies'}.`,
    meta,
    rating: averageRating > 0 ? averageRating.toFixed(1) : '',
    location: trip.region?.name || '',
    price: hasBudget ? formatBudgetLabel(totalBudget) : '',
    image: getTripImage(trip),
  }
}
