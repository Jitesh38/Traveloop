import { getBudgetValue } from './trips'

export const defaultTripFilters = {
  search: '',
  groupBy: 'none',
  budget: 'all',
  sortBy: 'recommended',
}

export const matchesSearch = (item, search) => {
  const query = search.trim().toLowerCase()

  if (!query) {
    return true
  }

  return [item.title, item.subtitle, item.meta, item.location]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(query))
}

export const matchesBudget = (item, budget) => {
  const value = getBudgetValue(item)

  if (budget !== 'all' && value === null) {
    return false
  }

  if (budget === 'under-10') {
    return value < 10
  }

  if (budget === '10-20') {
    return value >= 10 && value <= 20
  }

  if (budget === '20-plus') {
    return value > 20
  }

  return true
}

export const sortItems = (items, sortBy) => {
  const sortedItems = [...items]
  const sortableBudget = (item, direction) => {
    const value = getBudgetValue(item)
    if (value === null) {
      return direction === 'low' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY
    }
    return value
  }

  if (sortBy === 'budget-low') {
    return sortedItems.sort((a, b) => sortableBudget(a, 'low') - sortableBudget(b, 'low'))
  }

  if (sortBy === 'budget-high') {
    return sortedItems.sort((a, b) => sortableBudget(b, 'high') - sortableBudget(a, 'high'))
  }

  if (sortBy === 'rating') {
    return sortedItems.sort((a, b) => Number(b.rating) - Number(a.rating))
  }

  return sortedItems
}

export const filterItems = (items, filters) =>
  sortItems(
    items.filter((item) => matchesSearch(item, filters.search) && matchesBudget(item, filters.budget)),
    filters.sortBy,
  )

export const getGroupedTitle = (title, items, groupBy) => {
  if (groupBy !== 'state' || items.length === 0) {
    return title
  }

  const locations = [...new Set(items.map((item) => item.location))]
  return `${title} by State (${locations.join(', ')})`
}
