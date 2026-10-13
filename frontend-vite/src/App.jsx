import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:5000/api/opportunities'
const EMPTY_FORM = {
  title: '',
  description: '',
  department: '',
  deadline: '',
  status: 'open',
}

async function requestOpportunity(path = '', options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  const result = response.status === 204 ? null : await response.json()
  if (!response.ok) {
    throw new Error(result?.message || 'The opportunity request failed.')
  }
  return result
}

function OpportunityForm({ opportunityId }) {
  const isEditing = Boolean(opportunityId)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!opportunityId) return

    let active = true
    requestOpportunity(`/${opportunityId}`)
      .then(({ opportunity }) => {
        if (!active) return
        setFormData({
          title: opportunity.title,
          description: opportunity.description,
          department: opportunity.department,
          deadline: opportunity.deadline ? opportunity.deadline.slice(0, 10) : '',
          status: opportunity.status || 'open',
        })
      })
      .catch((loadError) => {
        if (active) setError(loadError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [opportunityId])

  function handleChange(event) {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    setSaving(true)
    const data = {
      ...formData,
      deadline: formData.deadline || null,
    }

    try {
      const result = await requestOpportunity(
        isEditing ? `/${opportunityId}` : '',
        {
          method: isEditing ? 'PUT' : 'POST',
          body: JSON.stringify(data),
        },
      )
      if (isEditing) {
        setMessage(result.message || 'Opportunity updated successfully.')
      } else {
        window.location.assign(`/opportunities/${result.opportunity.id}`)
      }
    } catch (submitError) {
      setError(submitError.message || 'Could not connect to the API.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="notice">Loading opportunity…</p>
  if (error && isEditing && !formData.title) {
    return <p className="error notice" role="alert">{error}</p>
  }

  return (
    <section className="form-card" aria-labelledby="form-title">
      <h2 id="form-title">{isEditing ? 'Edit opportunity' : 'Opportunity details'}</h2>
      <p className="form-intro">Fields marked with * are required.</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Research title <span>*</span></label>
        <input
          id="title"
          name="title"
          maxLength={200}
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Undergraduate Research Assistant"
          required
        />

        <label htmlFor="description">Description <span>*</span></label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the project and what the researcher will work on."
          required
        />

        <label htmlFor="department">Department <span>*</span></label>
        <input
          id="department"
          name="department"
          maxLength={120}
          value={formData.department}
          onChange={handleChange}
          placeholder="e.g. Biology"
          required
        />

        <label htmlFor="deadline">Application deadline</label>
        <input
          id="deadline"
          name="deadline"
          type="date"
          value={formData.deadline}
          onChange={handleChange}
        />

        <label htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>

        <button type="submit" disabled={saving}>
          {saving
            ? (isEditing ? 'Saving changes…' : 'Creating opportunity…')
            : (isEditing ? 'Save changes' : 'Create opportunity')}
        </button>
      </form>
      {message && <p className="success" role="status">{message}</p>}
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  )
}

function OpportunityList() {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    let active = true
    requestOpportunity()
      .then((result) => {
        if (active) setOpportunities(result.opportunities)
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Could not connect to the API.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  async function handleDelete(opportunity) {
    if (!window.confirm(`Delete "${opportunity.title}"? This cannot be undone.`)) return

    setDeletingId(opportunity.id)
    setError('')
    try {
      await requestOpportunity(`/${opportunity.id}`, { method: 'DELETE' })
      setOpportunities((current) =>
        current.filter((item) => item.id !== opportunity.id),
      )
    } catch (deleteError) {
      setError(deleteError.message || 'Could not delete the opportunity.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="opportunities-section" aria-labelledby="opportunities-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">EXPLORE THE PORTAL</p>
          <h2 id="opportunities-title">Research opportunities</h2>
        </div>
        <a className="primary-link" href="/create">Create opportunity</a>
      </div>

      {error && <p className="error notice" role="alert">{error}</p>}
      {loading ? (
        <p className="notice">Loading opportunities…</p>
      ) : opportunities.length === 0 && !error ? (
        <div className="empty-state">
          <h3>No opportunities yet</h3>
          <p>Create the first opportunity and it will appear here.</p>
          <a className="primary-link" href="/create">Create an opportunity</a>
        </div>
      ) : (
        <div className="opportunity-grid">
          {opportunities.map((opportunity) => (
            <article className="opportunity-card" key={opportunity.id}>
              <div className="card-topline">
                <span className={`status-badge ${opportunity.status === 'open' ? 'is-open' : 'is-closed'}`}>
                  {opportunity.status || 'open'}
                </span>
                {opportunity.deadline && (
                  <span className="deadline">
                    Deadline: {new Date(`${opportunity.deadline.slice(0, 10)}T00:00:00`).toLocaleDateString()}
                  </span>
                )}
              </div>
              <h3>{opportunity.title}</h3>
              <p className="department">{opportunity.department}</p>
              <p className="description-preview">{opportunity.description}</p>
              <div className="card-actions">
                <a className="text-link" href={`/opportunities/${opportunity.id}`}>View details</a>
                <a className="text-link" href={`/edit/${opportunity.id}`}>Edit</a>
                <button
                  className="delete-button"
                  type="button"
                  disabled={deletingId === opportunity.id}
                  onClick={() => handleDelete(opportunity)}
                >
                  {deletingId === opportunity.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function OpportunityDetails({ opportunityId }) {
  const [opportunity, setOpportunity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    requestOpportunity(`/${opportunityId}`)
      .then((result) => {
        if (active) setOpportunity(result.opportunity)
      })
      .catch((loadError) => {
        if (active) setError(loadError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [opportunityId])

  if (loading) return <p className="notice">Loading opportunity…</p>
  if (error) return <p className="error notice" role="alert">{error}</p>
  if (!opportunity) return null

  return (
    <article className="detail-card">
      <div className="card-topline">
        <span className={`status-badge ${opportunity.status === 'open' ? 'is-open' : 'is-closed'}`}>
          {opportunity.status || 'open'}
        </span>
        {opportunity.deadline && (
          <span className="deadline">
            Deadline: {new Date(`${opportunity.deadline.slice(0, 10)}T00:00:00`).toLocaleDateString()}
          </span>
        )}
      </div>
      <h2>{opportunity.title}</h2>
      <p className="department">{opportunity.department}</p>
      <p className="detail-description">{opportunity.description}</p>
      <div className="card-actions">
        <a className="primary-link" href={`/edit/${opportunity.id}`}>Edit opportunity</a>
        <a className="back-link" href="/">Back to opportunities</a>
      </div>
    </article>
  )
}

function App() {
  const path = window.location.pathname
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('research-portal-theme') === 'dark' ? 'dark' : 'light',
  )
  const editMatch = path.match(/^\/edit\/(\d+)\/?$/)
  const detailsMatch = path.match(/^\/opportunities\/(\d+)\/?$/)
  const isCreate = path === '/create' || path === '/create/'
  const isHome = path === '/' || path === ''

  useEffect(() => {
    localStorage.setItem('research-portal-theme', theme)
  }, [theme])

  return (
    <div className="app-shell" data-theme={theme}>
      <header className="site-header">
        <a className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">R</span>
          <span>Research Portal</span>
        </a>
        <nav aria-label="Main navigation">
          <a className={isHome ? 'nav-link active' : 'nav-link'} href="/">Opportunities</a>
          <a
            className={isCreate ? 'nav-link active' : 'nav-link'}
            href="/create"
          >
            Create opportunity
          </a>
        </nav>
        <button
          className="theme-toggle"
          type="button"
          aria-pressed={theme === 'dark'}
          onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'}
        </button>
      </header>

      {isHome ? (
        <main className="home-content">
          <p className="eyebrow">UNIVERSITY RESEARCH</p>
          <h1>Turn great questions into meaningful research.</h1>
          <p className="home-description">
            Discover research projects or create an opportunity to connect with students
            and researchers at your university.
          </p>
          <OpportunityList />
        </main>
      ) : isCreate || editMatch || detailsMatch ? (
        <main className="page-content">
          <a className="back-link" href="/">← Back to opportunities</a>
          <div className="page-heading">
            <p className="eyebrow">OPPORTUNITIES</p>
            <h1>
              {editMatch
                ? 'Update your opportunity'
                : detailsMatch
                  ? 'Opportunity details'
                  : 'Create a research opportunity'}
            </h1>
            <p>
              {detailsMatch
                ? 'Explore the project and its application information.'
                : 'Share a project with students and researchers at your university.'}
            </p>
          </div>
          {editMatch ? (
            <OpportunityForm opportunityId={editMatch[1]} />
          ) : detailsMatch ? (
            <OpportunityDetails opportunityId={detailsMatch[1]} />
          ) : (
            <OpportunityForm />
          )}
        </main>
      ) : (
        <main className="page-content">
          <div className="page-heading">
            <h1>Page not found</h1>
            <a className="back-link" href="/">Return to the opportunities</a>
          </div>
        </main>
      )}
    </div>
  )
}

export default App
