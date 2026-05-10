import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppHeader from './AppHeader'
import { API_URL, getApiErrorMessage, getAuthHeaders, readJson } from '../utils/api'

// ─── Helpers ────────────────────────────────────────────────────────────────

function getProgress(sections) {
  const all = sections.flatMap((s) => s.items)
  return { total: all.length, checked: all.filter((i) => i.isCompleted).length }
}

// ─── ChecklistItem ───────────────────────────────────────────────────────────

function ChecklistItem({ item, onToggle, onDelete, onRename }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(item.title)
  const inputRef = useRef(null)

  const startEdit = () => {
    setDraft(item.title)
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const commitEdit = () => {
    const val = draft.trim()
    if (val && val !== item.title) onRename(item.id, val)
    else setDraft(item.title)
    setEditing(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') { setDraft(item.title); setEditing(false) }
  }

  return (
    <div className={`cl-item ${item.isCompleted ? 'cl-item-done' : ''}`}>
      <button
        type="button"
        className={`cl-checkbox ${item.isCompleted ? 'cl-checkbox-checked' : ''}`}
        aria-label={item.isCompleted ? 'Unpack item' : 'Pack item'}
        onClick={() => onToggle(item)}
      >
        {item.isCompleted && (
          <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {editing ? (
        <input
          ref={inputRef}
          className="cl-item-edit-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKey}
        />
      ) : (
        <span className="cl-item-title" onDoubleClick={startEdit}>
          {item.title}
        </span>
      )}

      <button
        type="button"
        className="cl-item-delete"
        aria-label="Delete item"
        onClick={() => onDelete(item.id)}
      >
        ×
      </button>
    </div>
  )
}

// ─── ChecklistSection ────────────────────────────────────────────────────────

function ChecklistSection({ section, onToggleItem, onDeleteItem, onRenameItem, onAddItem, onDeleteSection, onRenameSection }) {
  const [addingItem, setAddingItem] = useState(false)
  const [newItemTitle, setNewItemTitle] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(section.title)
  const addRef = useRef(null)

  const checkedCount = section.items.filter((i) => i.isCompleted).length

  useEffect(() => {
    if (addingItem) addRef.current?.focus()
  }, [addingItem])

  const commitTitle = () => {
    const val = titleDraft.trim()
    if (val && val !== section.title) onRenameSection(section.id, val)
    else setTitleDraft(section.title)
    setEditingTitle(false)
  }

  const handleAddItem = async () => {
    const val = newItemTitle.trim()
    if (!val) return
    await onAddItem(section.id, val)
    setNewItemTitle('')
    setAddingItem(false)
  }

  return (
    <div className="cl-section">
      {/* Section header */}
      <div className="cl-section-header">
        {editingTitle ? (
          <input
            className="cl-section-title-input"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitTitle()
              if (e.key === 'Escape') { setTitleDraft(section.title); setEditingTitle(false) }
            }}
            autoFocus
          />
        ) : (
          <span className="cl-section-title" onDoubleClick={() => setEditingTitle(true)}>
            {section.title}
          </span>
        )}
        <div className="cl-section-meta">
          <span className="cl-section-count">
            {checkedCount}/{section.items.length}
          </span>
          <button
            type="button"
            className="cl-section-delete"
            aria-label="Delete section"
            onClick={() => onDeleteSection(section.id)}
          >
            ×
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="cl-items">
        {section.items.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            onToggle={onToggleItem}
            onDelete={onDeleteItem}
            onRename={onRenameItem}
          />
        ))}
      </div>

      {/* Add item inline */}
      {addingItem ? (
        <div className="cl-add-inline">
          <input
            ref={addRef}
            className="cl-add-inline-input"
            placeholder="Item name…"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddItem()
              if (e.key === 'Escape') { setAddingItem(false); setNewItemTitle('') }
            }}
          />
          <button type="button" className="cl-inline-confirm" onClick={handleAddItem}>Add</button>
          <button type="button" className="cl-inline-cancel" onClick={() => { setAddingItem(false); setNewItemTitle('') }}>
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="cl-add-item-trigger"
          onClick={() => setAddingItem(true)}
        >
          + add item
        </button>
      )}
    </div>
  )
}

// ─── ChecklistPage ───────────────────────────────────────────────────────────

function ChecklistPage() {
  const navigate = useNavigate()
  const { tripId } = useParams()

  const [checklist,   setChecklist]   = useState(null)
  const [trips,       setTrips]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)

  // Toolbar
  const [search,     setSearch]     = useState('')
  const [filter,     setFilter]     = useState('all')   // all | packed | unpacked
  const [sortBy,     setSortBy]     = useState('default') // default | alpha
  const [openMenu,   setOpenMenu]   = useState(null)

  // Add section form
  const [addingSection,   setAddingSection]   = useState(false)
  const [newSectionTitle, setNewSectionTitle] = useState('')

  // ─── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    let ignore = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const headers = getAuthHeaders()
        const [clRes, tripsRes] = await Promise.allSettled([
          fetch(`${API_URL}/checklist?trip_id=${tripId}`, { headers }),
          fetch(`${API_URL}/activity/my-trips`, { headers }),
        ])

        if (ignore) return

        if (clRes.status === 'fulfilled' && clRes.value.ok) {
          setChecklist(await readJson(clRes.value))
        } else {
          const payload = clRes.status === 'fulfilled' ? await readJson(clRes.value) : null
          throw new Error(getApiErrorMessage(payload, 'Failed to load checklist.'))
        }

        if (tripsRes.status === 'fulfilled' && tripsRes.value.ok) {
          const d = await readJson(tripsRes.value)
          setTrips([...(d.ongoing || []), ...(d.planned || []), ...(d.previous || [])])
        }
      } catch (err) {
        if (!ignore) setError(err.message || 'Failed to load checklist.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    load()
    return () => { ignore = true }
  }, [tripId])

  // ─── Mutations ─────────────────────────────────────────────────────────────

  const toggleItem = async (item) => {
    const next = !item.isCompleted
    setChecklist((c) => patchItem(c, item.id, { isCompleted: next }))
    try {
      const res = await fetch(`${API_URL}/checklist/item/${item.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ isCompleted: next }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setChecklist((c) => patchItem(c, item.id, { isCompleted: item.isCompleted }))
    }
  }

  const deleteItem = async (itemId) => {
    const prev = checklist
    setChecklist((c) => removeItem(c, itemId))
    try {
      const res = await fetch(`${API_URL}/checklist/item/${itemId}`, {
        method: 'DELETE', headers: getAuthHeaders(),
      })
      if (!res.ok) throw new Error()
    } catch {
      setChecklist(prev)
    }
  }

  const renameItem = async (itemId, title) => {
    setChecklist((c) => patchItem(c, itemId, { title }))
    fetch(`${API_URL}/checklist/item/${itemId}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ title }),
    }).catch(() => {})
  }

  const addItem = async (sectionId, title) => {
    const res = await fetch(`${API_URL}/checklist/item`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ sectionId, title }),
    })
    const newItem = await readJson(res)
    if (!res.ok) return
    setChecklist((c) => ({
      ...c,
      sections: c.sections.map((s) =>
        s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s
      ),
    }))
  }

  const addSection = async () => {
    const title = newSectionTitle.trim()
    if (!title || !checklist) return
    const res = await fetch(`${API_URL}/checklist/section`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ checklistId: checklist.id, title }),
    })
    const section = await readJson(res)
    if (!res.ok) return
    setChecklist((c) => ({ ...c, sections: [...c.sections, { ...section, items: [] }] }))
    setNewSectionTitle('')
    setAddingSection(false)
  }

  const deleteSection = async (sectionId) => {
    const prev = checklist
    setChecklist((c) => ({ ...c, sections: c.sections.filter((s) => s.id !== sectionId) }))
    const res = await fetch(`${API_URL}/checklist/section/${sectionId}`, {
      method: 'DELETE', headers: getAuthHeaders(),
    })
    if (!res.ok) setChecklist(prev)
  }

  const renameSection = async (sectionId, title) => {
    setChecklist((c) => ({
      ...c,
      sections: c.sections.map((s) => s.id === sectionId ? { ...s, title } : s),
    }))
    fetch(`${API_URL}/checklist/section/${sectionId}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ title }),
    }).catch(() => {})
  }

  const resetAll = async () => {
    if (!checklist) return
    const done = checklist.sections.flatMap((s) => s.items).filter((i) => i.isCompleted)
    setChecklist((c) => ({
      ...c,
      sections: c.sections.map((s) => ({
        ...s, items: s.items.map((i) => ({ ...i, isCompleted: false })),
      })),
    }))
    await Promise.allSettled(
      done.map((i) =>
        fetch(`${API_URL}/checklist/item/${i.id}`, {
          method: 'PATCH',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ isCompleted: false }),
        })
      )
    )
  }

  const shareChecklist = async () => {
    if (!checklist) return
    const tripName = trips.find((t) => String(t.id) === String(tripId))?.name || `Trip #${tripId}`
    const lines = [
      `Packing Checklist — ${tripName}`,
      '',
      ...checklist.sections.flatMap((s) => [
        `── ${s.title} ──`,
        ...s.items.map((i) => `${i.isCompleted ? '✓' : '○'}  ${i.title}`),
        '',
      ]),
    ]
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      alert('Checklist copied to clipboard!')
    } catch {
      alert('Unable to copy. Try a different browser.')
    }
  }

  // ─── Derived ───────────────────────────────────────────────────────────────

  const { total, checked } = checklist
    ? getProgress(checklist.sections)
    : { total: 0, checked: 0 }
  const progressPct = total > 0 ? (checked / total) * 100 : 0

  const visibleSections = (checklist?.sections || []).map((s) => ({
    ...s,
    items: s.items
      .filter((i) => {
        const q = search.trim().toLowerCase()
        const matchSearch = !q || i.title.toLowerCase().includes(q)
        const matchFilter =
          filter === 'packed'   ? i.isCompleted :
          filter === 'unpacked' ? !i.isCompleted : true
        return matchSearch && matchFilter
      })
      .sort((a, b) => sortBy === 'alpha' ? a.title.localeCompare(b.title) : 0),
  })).filter((s) => !search.trim() || s.items.length > 0)

  const currentTripName =
    trips.find((t) => String(t.id) === String(tripId))?.name || `Trip #${tripId}`

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="app-shell">
      <section className="landing-page" aria-label="Packing checklist">
        <AppHeader onHomeClick={() => navigate('/home')} />

        <div className="landing-content" style={{ paddingBottom: 64 }}>

          {/* ── Toolbar ── */}
          <div className="toolbar" style={{ marginTop: 24 }}>
            <label className="search-field">
              <span className="sr-only">Search items</span>
              <input
                type="search"
                placeholder="Search items…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <div className="toolbar-actions">
              {[
                {
                  key: 'filter',
                  label: 'Filter',
                  value: filter,
                  options: [['all', 'All items'], ['packed', 'Packed'], ['unpacked', 'Unpacked']],
                  set: setFilter,
                },
                {
                  key: 'sort',
                  label: 'Sort by',
                  value: sortBy,
                  options: [['default', 'Default'], ['alpha', 'A–Z']],
                  set: setSortBy,
                },
              ].map((dd) => (
                <div className="toolbar-menu" key={dd.key}>
                  <button
                    type="button"
                    className="secondary-button"
                    aria-expanded={openMenu === dd.key}
                    onClick={() => setOpenMenu(openMenu === dd.key ? null : dd.key)}
                  >
                    <span>{dd.label}</span>
                    <strong>{dd.options.find(([v]) => v === dd.value)?.[1] ?? dd.value}</strong>
                  </button>
                  {openMenu === dd.key && (
                    <div className="dropdown-menu" role="menu">
                      {dd.options.map(([val, lbl]) => (
                        <button
                          key={val}
                          type="button"
                          role="menuitem"
                          className={`dropdown-option ${dd.value === val ? 'active' : ''}`}
                          onClick={() => { dd.set(val); setOpenMenu(null) }}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Trip selector + progress ── */}
          <div className="cl-header-block">
            <p className="cl-label">Packing checklist</p>

            <div className="cl-trip-select-wrap">
              <select
                className="cl-trip-select"
                value={tripId}
                onChange={(e) => navigate(`/trip/${e.target.value}/checklist`)}
              >
                {trips.length === 0 && <option value={tripId}>{currentTripName}</option>}
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name || t.region?.name || `Trip #${t.id}`}
                  </option>
                ))}
              </select>
              <span className="cl-select-arrow" aria-hidden="true">↓</span>
            </div>

            {!loading && checklist && (
              <div className="cl-progress-wrap">
                <p className="cl-progress-label">Progress: {checked}/{total} items packed</p>
                <div className="cl-progress-track" role="progressbar" aria-valuenow={checked} aria-valuemax={total}>
                  <div className="cl-progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            )}
          </div>

          {error && <p className="empty-row">{error}</p>}

          {loading ? (
            <p className="empty-row">Loading checklist…</p>
          ) : checklist ? (
            <>
              {/* ── Sections ── */}
              <div className="cl-sections">
                {visibleSections.length === 0 && !search.trim() && (
                  <p className="empty-row">No sections yet. Click "+ add section" below to get started.</p>
                )}
                {visibleSections.length === 0 && search.trim() && (
                  <p className="empty-row">No items match your search.</p>
                )}
                {visibleSections.map((section) => (
                  <ChecklistSection
                    key={section.id}
                    section={section}
                    onToggleItem={toggleItem}
                    onDeleteItem={deleteItem}
                    onRenameItem={renameItem}
                    onAddItem={addItem}
                    onDeleteSection={deleteSection}
                    onRenameSection={renameSection}
                  />
                ))}
              </div>

              {/* ── Add section ── */}
              {addingSection && (
                <div className="cl-add-section-row">
                  <input
                    className="cl-add-section-input"
                    placeholder="Section name (e.g. Documents, Clothing, Electronics)…"
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addSection()
                      if (e.key === 'Escape') { setAddingSection(false); setNewSectionTitle('') }
                    }}
                    autoFocus
                  />
                  <button type="button" className="trip-action-button trip-action-button-orange" onClick={addSection}>
                    Add
                  </button>
                  <button
                    type="button"
                    className="trip-action-button invoice-secondary-button"
                    onClick={() => { setAddingSection(false); setNewSectionTitle('') }}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* ── Footer actions ── */}
              <div className="cl-footer">
                <button
                  type="button"
                  className="trip-action-button invoice-secondary-button cl-footer-add"
                  onClick={() => setAddingSection(true)}
                >
                  + add item to checklist
                </button>
                <button
                  type="button"
                  className="trip-action-button invoice-secondary-button"
                  onClick={resetAll}
                >
                  Reset all
                </button>
                <button
                  type="button"
                  className="trip-action-button trip-action-button-orange"
                  onClick={shareChecklist}
                >
                  Share Checklist
                </button>
              </div>
            </>
          ) : null}
        </div>
      </section>
    </main>
  )
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function patchItem(checklist, itemId, patch) {
  return {
    ...checklist,
    sections: checklist.sections.map((s) => ({
      ...s,
      items: s.items.map((i) => i.id === itemId ? { ...i, ...patch } : i),
    })),
  }
}

function removeItem(checklist, itemId) {
  return {
    ...checklist,
    sections: checklist.sections.map((s) => ({
      ...s,
      items: s.items.filter((i) => i.id !== itemId),
    })),
  }
}

export default ChecklistPage
