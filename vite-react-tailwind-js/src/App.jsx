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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12 animate-in slide-in-from-top duration-700">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">
              DTU Times — Editions
            </h1>
            <p className="text-gray-400 text-lg font-medium">CRUD + Search + Sort + Pagination</p>
          </div>
          <div className="flex gap-4 animate-in slide-in-from-right duration-700 delay-200">
            <button 
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg border border-gray-700 hover:border-gray-600"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button 
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl shadow-blue-500/25"
              onClick={handleAddNew}
            >
              Add Edition
            </button>
          </div>
        </header>

        {/* Search and Filter Section */}
        <section className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 mb-12 animate-in fade-in-50 slide-in-from-bottom duration-700 delay-300">
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            <input
              type="text"
              placeholder="Search title, summary, tags..."
              className="lg:col-span-4 px-4 py-3 bg-gray-800/80 text-gray-200 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
              value={searchQuery}
              onChange={handleSearch}
            />
            <select
              className="lg:col-span-2 px-4 py-3 bg-gray-800/80 text-gray-200 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              value={sortBy}
              onChange={handleSortByChange}
            >
              <option value="publishDate">Sort by Publish Date</option>
              <option value="issueNumber">Sort by Issue Number</option>
              <option value="title">Sort by Title</option>
            </select>
            <select
              className="px-4 py-3 bg-gray-800/80 text-gray-200 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-300"
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
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-xl mb-8 animate-in shake">
            {error}
          </div>
        )}

        {/* Editions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
          {loading ? (
            // Loading skeleton cards
            Array.from({ length: itemsPerPage }).map((_, index) => (
              <div key={index} className="bg-gray-800/60 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-56 bg-gray-700/50"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-700/50 rounded mb-3"></div>
                  <div className="h-4 bg-gray-700/50 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-3/4 mb-4"></div>
                  <div className="h-20 bg-gray-700/50 rounded"></div>
                </div>
              </div>
            ))
          ) : editions.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-400 animate-in fade-in duration-1000">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-semibold text-gray-300 mb-2">No editions found</h3>
              <p>{searchQuery ? 'Try adjusting your search terms.' : 'Start by adding your first edition.'}</p>
            </div>
          ) : (
            editions.map((edition, index) => (
              <EditionCard 
                key={edition.id} 
                edition={edition}
                onEdit={handleEdit}
                onDelete={handleDelete}
                index={index}
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
const EditionCard = ({ edition, onEdit, onDelete, index }) => {
  const delayClass = `animate-in fade-in-50 slide-in-from-bottom duration-700 delay-[${(index % 6) * 100 + 400}ms]`
  
  return (
    <article className={`group bg-gray-800/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/20 ${delayClass}`}>
      {edition.coverImageUrl && (
        <div className="relative overflow-hidden">
          <img
            src={edition.coverImageUrl}
            alt={edition.title}
            className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      )}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-100 line-clamp-2 flex-1 group-hover:text-white transition-colors duration-300">
            {edition.title}
          </h3>
          <span className="text-sm text-gray-400 ml-3 font-mono bg-gray-700/50 px-2 py-1 rounded-lg">
            #{edition.issueNumber}
          </span>
        </div>
        
        <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
          {edition.summary}
        </p>
        
        {edition.tags && edition.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {edition.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full border border-blue-500/30 hover:bg-blue-500/30 hover:scale-105 transition-all duration-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400 font-medium">
            {new Date(edition.publishDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </span>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium rounded-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              onClick={() => onEdit(edition)}
            >
              Edit
            </button>
            <button
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-medium rounded-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg shadow-red-500/25"
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-gray-700/50 animate-in zoom-in-95 slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center p-8 border-b border-gray-700/50">
          <h2 className="text-2xl font-bold text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-all duration-300 hover:rotate-90 hover:bg-gray-800 p-2 rounded-xl"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
}

// Form Component
const EditionForm = ({ formData, onChange, onSubmit, onCancel, loading }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-3">
            Title *
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 bg-gray-800/80 text-gray-200 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            value={formData.title}
            onChange={(e) => onChange('title', e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-3">
            Issue Number *
          </label>
          <input
            type="number"
            required
            className="w-full px-4 py-3 bg-gray-800/80 text-gray-200 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            value={formData.issueNumber}
            onChange={(e) => onChange('issueNumber', e.target.value)}
          />
        </div>
        
        <div className="lg:col-span-2">
          <label className="block text-sm font-semibold text-gray-200 mb-3">
            Cover Image URL *
          </label>
          <input
            type="url"
            required
            className="w-full px-4 py-3 bg-gray-800/80 text-gray-200 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            value={formData.coverImageUrl}
            onChange={(e) => onChange('coverImageUrl', e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-3">
            Publish Date *
          </label>
          <input
            type="date"
            required
            className="w-full px-4 py-3 bg-gray-800/80 text-gray-200 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            value={formData.publishDate}
            onChange={(e) => onChange('publishDate', e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-3">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-gray-800/80 text-gray-200 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            value={formData.tags}
            onChange={(e) => onChange('tags', e.target.value)}
            placeholder="innovation, alumni, research"
          />
        </div>
        
        <div className="lg:col-span-2">
          <label className="block text-sm font-semibold text-gray-200 mb-3">
            Summary *
          </label>
          <textarea
            required
            rows={5}
            className="w-full px-4 py-3 bg-gray-800/80 text-gray-200 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
            value={formData.summary}
            onChange={(e) => onChange('summary', e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-700/50">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium rounded-xl transition-all duration-300 hover:-translate-y-0.5"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
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
    <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-gray-700/50 animate-in slide-in-from-bottom duration-700 delay-500">
      <div className="text-sm text-gray-400">
        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
      </div>
      
      <div className="flex items-center gap-4">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
        >
          Previous
        </button>
        
        <span className="text-sm text-gray-300 font-medium px-4">
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
        >
          Next
        </button>
        
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-4 py-2 bg-gray-800 text-gray-200 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-300"
        >
          <option value={6}>6 per page</option>
          <option value={9}>9 per page</option>
          <option value={12}>12 per page</option>
          <option value={18}>18 per page</option>
        </select>
      </div>
    </div>
  )
}

export default App