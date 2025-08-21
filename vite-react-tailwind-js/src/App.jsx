import React, { useState, useEffect, useCallback } from 'react'

const API_URL = 'http://localhost:4000'

const emptyForm = {
  title: '',
  issueNumber: '',
  coverImageUrl: '',
  publishDate: '',
  summary: '',
  tags: ''
}

function App() {
  // State management
  const [editions, setEditions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('publishDate')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(9)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [editingEdition, setEditingEdition] = useState(null)
  const [formData, setFormData] = useState(emptyForm)

  // API functions
  const fetchEditions = useCallback(async () => {
    setLoading(true)
    setError('')
    
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: itemsPerPage
      })
      
      const response = await fetch(`${API_URL}/editions?${params}`)
      if (!response.ok) throw new Error('Failed to fetch editions')
      
      const data = await response.json()
      setEditions(data.data || [])
      setTotalPages(data.totalPages || 1)
      setTotalItems(data.total || 0)
    } catch (err) {
      setError('Failed to load editions. Make sure your backend is running.')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, sortBy, sortOrder, currentPage, itemsPerPage])

  const createEdition = async (data) => {
    try {
      const response = await fetch(`${API_URL}/editions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.errors?.join(', ') || 'Failed to create edition')
      }
      
      return await response.json()
    } catch (err) {
      throw new Error(err.message)
    }
  }

  const updateEdition = async (id, data) => {
    try {
      const response = await fetch(`${API_URL}/editions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.errors?.join(', ') || 'Failed to update edition')
      }
      
      return await response.json()
    } catch (err) {
      throw new Error(err.message)
    }
  }

  const deleteEdition = async (id) => {
    try {
      const response = await fetch(`${API_URL}/editions/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete edition')
    } catch (err) {
      throw new Error(err.message)
    }
  }

  // Event handlers
  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleSortByChange = (e) => {
    setSortBy(e.target.value)
  }

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit)
    setCurrentPage(1) // Reset to first page when changing limit
  }

  const handleAddNew = () => {
    setEditingEdition(null)
    setFormData(emptyForm)
    setShowModal(true)
  }

  const handleEdit = (edition) => {
    setEditingEdition(edition)
    setFormData({
      title: edition.title,
      issueNumber: edition.issueNumber,
      coverImageUrl: edition.coverImageUrl,
      publishDate: edition.publishDate,
      summary: edition.summary,
      tags: edition.tags?.join(', ') || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this edition?')) return
    
    try {
      await deleteEdition(id)
      await fetchEditions() // Refresh the list
    } catch (err) {
      setError(err.message)
    }
  }

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const payload = {
        title: formData.title.trim(),
        issueNumber: Number(formData.issueNumber),
        coverImageUrl: formData.coverImageUrl.trim(),
        publishDate: formData.publishDate,
        summary: formData.summary.trim(),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      }

      if (editingEdition) {
        await updateEdition(editingEdition.id, payload)
      } else {
        await createEdition(payload)
      }
      
      setShowModal(false)
      await fetchEditions() // Refresh the list
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchEditions()
  }

  // Effects
  useEffect(() => {
    fetchEditions()
  }, [fetchEditions])

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-50">DTU Times — Editions</h1>
            <p className="text-gray-200 mt-1">CRUD + Search + Sort + Pagination</p>
          </div>
          <div className="flex gap-3">
            <button 
              className="btn btn-secondary"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleAddNew}
            >
              Add Edition
            </button>
          </div>
        </header>

        {/* Search and Filter Section */}
        <section className=" rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search title, summary, tags..."
              className="bg-gray-800 text-gray-200 md:col-span-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={handleSearch}
            />
            <select
              className="bg-gray-800 text-gray-200 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={sortBy}
              onChange={handleSortByChange}
            >
              <option value="publishDate">Sort by Publish Date</option>
              <option value="issueNumber">Sort by Issue Number</option>
              <option value="title">Sort by Title</option>
            </select>
            <select
              className="bg-gray-800 text-gray-200 px-4 py-2 border border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={sortOrder}
              onChange={handleSortOrderChange}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Editions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Loading skeleton cards
            Array.from({ length: itemsPerPage }).map((_, index) => (
              <div key={index} className="bg-gray-800 rounded-lg shadow-sm border animate-pulse">
                <div className="h-48 bg-gray-800 rounded-t-lg"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-800 rounded mb-2"></div>
                  <div className="h-4 bg-gray-800 rounded mb-4"></div>
                  <div className="h-20 bg-gray-800 rounded"></div>
                </div>
              </div>
            ))
          ) : editions.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No editions found. {searchQuery && 'Try adjusting your search terms.'}
            </div>
          ) : (
            editions.map(edition => (
              <EditionCard 
                key={edition.id} 
                edition={edition}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && editions.length > 0 && (
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}

        {/* Modal */}
        <Modal 
          show={showModal}
          onClose={() => setShowModal(false)}
          title={editingEdition ? 'Edit Edition' : 'Add New Edition'}
        >
          <EditionForm
            formData={formData}
            onChange={handleFormChange}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowModal(false)}
            loading={loading}
          />
        </Modal>

      </div>
    </div>
  )
}

// Edition Card Component
const EditionCard = ({ edition, onEdit, onDelete }) => {
  return (
    <article className="bg-gray-800 rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
      {edition.coverImageUrl && (
        <img
          src={edition.coverImageUrl}
          alt={edition.title}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
      )}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-200 line-clamp-2 flex-1">
            {edition.title}
          </h3>
          <span className="text-sm text-gray-500 ml-2 flex-shrink-0">
            #{edition.issueNumber}
          </span>
        </div>
        
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
          {edition.summary}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {edition.tags?.map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {new Date(edition.publishDate).toLocaleDateString()}
          </span>
          <div className="flex gap-2">
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => onEdit(edition)}
            >
              Edit
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => onDelete(edition.id)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

// Modal Component
const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

// Form Component
const EditionForm = ({ formData, onChange, onSubmit, onCancel, loading }) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Title *
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.title}
            onChange={(e) => onChange('title', e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Issue Number *
          </label>
          <input
            type="number"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.issueNumber}
            onChange={(e) => onChange('issueNumber', e.target.value)}
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cover Image URL *
          </label>
          <input
            type="url"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.coverImageUrl}
            onChange={(e) => onChange('coverImageUrl', e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Publish Date *
          </label>
          <input
            type="date"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.publishDate}
            onChange={(e) => onChange('publishDate', e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.tags}
            onChange={(e) => onChange('tags', e.target.value)}
            placeholder="innovation, alumni, research"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Summary *
          </label>
          <textarea
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.summary}
            onChange={(e) => onChange('summary', e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  )
}

// Pagination Component
const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange, 
  onItemsPerPageChange 
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
      <div className="text-sm text-gray-600">
        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
      </div>
      
      <div className="flex items-center gap-4">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="btn btn-sm btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <span className="text-sm text-gray-200">
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="btn btn-sm btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
        
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-3 py-1 border bg-gray-800 text-gray-200 border-gray-200 rounded text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option className="text-gray-800" value={6}>6 per page</option>
          <option className="text-gray-800" value={9}>9 per page</option>
          <option className="text-gray-800" value={12}>12 per page</option>
          <option className="text-gray-800" value={18}>18 per page</option>
        </select>
      </div>
    </div>
  )
}

export default App