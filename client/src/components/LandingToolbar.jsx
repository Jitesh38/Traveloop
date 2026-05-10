import { useState } from 'react'

const filterOptions = {
  groupBy: [
    { label: 'None', value: 'none' },
    { label: 'State', value: 'state' },
  ],
  budget: [
    { label: 'All budgets', value: 'all' },
    { label: 'Under Rs 10k', value: 'under-10' },
    { label: 'Rs 10k-20k', value: '10-20' },
    { label: 'Rs 20k+', value: '20-plus' },
  ],
  sortBy: [
    { label: 'Recommended', value: 'recommended' },
    { label: 'Low budget', value: 'budget-low' },
    { label: 'High budget', value: 'budget-high' },
    { label: 'Rating', value: 'rating' },
  ],
}

const dropdowns = [
  { key: 'groupBy', label: 'Group by' },
  { key: 'budget', label: 'Filter' },
  { key: 'sortBy', label: 'Sort by' },
]

const getLabel = (key, value) =>
  filterOptions[key].find((option) => option.value === value)?.label ?? value

function LandingToolbar({ filters, onFiltersChange }) {
  const [openMenu, setOpenMenu] = useState(null)

  const updateFilter = (key, value) => {
    onFiltersChange((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }))
    setOpenMenu(null)
  }

  return (
    <div className="toolbar" aria-label="Search and organize trips">
      <label className="search-field">
        <span className="sr-only">Search trips</span>
        <input
          type="search"
          placeholder="Search regions, trips, or activities"
          value={filters.search}
          onChange={(event) => updateFilter('search', event.target.value)}
        />
      </label>

      <div className="toolbar-actions">
        {dropdowns.map((dropdown) => (
          <div className="toolbar-menu" key={dropdown.key}>
            <button
              className="secondary-button"
              type="button"
              aria-expanded={openMenu === dropdown.key}
              onClick={() => setOpenMenu(openMenu === dropdown.key ? null : dropdown.key)}
            >
              <span>{dropdown.label}</span>
              <strong>{getLabel(dropdown.key, filters[dropdown.key])}</strong>
            </button>

            {openMenu === dropdown.key && (
              <div className="dropdown-menu" role="menu">
                {filterOptions[dropdown.key].map((option) => (
                  <button
                    className={option.value === filters[dropdown.key] ? 'dropdown-option active' : 'dropdown-option'}
                    type="button"
                    role="menuitem"
                    key={option.value}
                    onClick={() => updateFilter(dropdown.key, option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default LandingToolbar
