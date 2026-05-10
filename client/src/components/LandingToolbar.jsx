const filterOptions = {
  groupBy: ['none', 'state'],
  budget: ['all', 'under-10', '10-20', '20-plus'],
  sortBy: ['recommended', 'budget-low', 'budget-high', 'rating'],
}

const labels = {
  '10-20': 'Rs 10k-20k',
  '20-plus': 'Rs 20k+',
  'budget-high': 'High budget',
  'budget-low': 'Low budget',
  all: 'All budgets',
  none: 'None',
  rating: 'Rating',
  recommended: 'Recommended',
  state: 'State',
  'under-10': 'Under Rs 10k',
}

const getNextValue = (values, currentValue) => {
  const index = values.indexOf(currentValue)
  return values[(index + 1) % values.length]
}

function LandingToolbar({ filters, onFiltersChange }) {
  const updateFilter = (key, value) => {
    onFiltersChange((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }))
  }

  const cycleFilter = (key) => {
    updateFilter(key, getNextValue(filterOptions[key], filters[key]))
  }

  return (
    <div className="toolbar" aria-label="Search and organize trips">
      <label className="search-field">
        <span className="sr-only">Search trips</span>
        <input
          type="search"
          placeholder="Search Indian cities, stays, or stops"
          value={filters.search}
          onChange={(event) => updateFilter('search', event.target.value)}
        />
      </label>

      <div className="toolbar-actions">
        <button className="secondary-button" type="button" onClick={() => cycleFilter('groupBy')}>
          Group: {labels[filters.groupBy]}
        </button>
        <button className="secondary-button" type="button" onClick={() => cycleFilter('budget')}>
          Filter: {labels[filters.budget]}
        </button>
        <button className="secondary-button" type="button" onClick={() => cycleFilter('sortBy')}>
          Sort: {labels[filters.sortBy]}
        </button>
      </div>
    </div>
  )
}

export default LandingToolbar
