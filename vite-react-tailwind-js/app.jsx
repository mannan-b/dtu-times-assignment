const { useState, useEffect, useCallback, useMemo } = React;

// Mock API service that simulates backend calls
const API_URL = 'http://localhost:4000'

const apiService = {
  delay: (ms = 300) => new Promise(resolve => setTimeout(resolve, ms)),

  async getEditions(params = {}) {
    await this.delay(400);
    
    const { q = '', sortBy = 'publishDate', sortOrder = 'desc', page = 1, limit = 9 } = params;
    
    // Get data from localStorage or use initial data
    const storedEditions = localStorage.getItem('dtu_editions');
    const editions = storedEditions ? JSON.parse(storedEditions) : initialData.editions;
    
    // Apply search filter
    let filtered = editions;
    if (q.trim()) {
      const query = q.toLowerCase();
      filtered = editions.filter(edition => 
        edition.title.toLowerCase().includes(query) ||
        edition.summary.toLowerCase().includes(query) ||
        edition.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      
      switch (sortBy) {
        case 'issueNumber':
          return (a.issueNumber - b.issueNumber) * multiplier;
        case 'title':
          return a.title.localeCompare(b.title) * multiplier;
        case 'publishDate':
        default:
          return (new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime()) * multiplier;
      }
    });
    
    // Apply pagination
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const startIndex = (page - 1) * limit;
    const data = filtered.slice(startIndex, startIndex + limit);
    
    return {
      data,
      meta: {
        total,
        totalPages,
        currentPage: page,
        limit
      }
    };
  },

  async createEdition(editionData) {
    await this.delay();
    
    const storedEditions = localStorage.getItem('dtu_editions');
    const editions = storedEditions ? JSON.parse(storedEditions) : initialData.editions;
    const maxId = Math.max(...editions.map(e => e.id), 0);
    
    const newEdition = {
      id: maxId + 1,
      ...editionData,
      issueNumber: parseInt(editionData.issueNumber)
    };
    
    editions.unshift(newEdition);
    localStorage.setItem('dtu_editions', JSON.stringify(editions));
    
    return newEdition;
  },

  async updateEdition(id, editionData) {
    await this.delay();
    
    const storedEditions = localStorage.getItem('dtu_editions');
    const editions = storedEditions ? JSON.parse(storedEditions) : initialData.editions;
    const index = editions.findIndex(e => e.id === id);
    
    if (index === -1) {
      throw new Error('Edition not found');
    }
    
    const updatedEdition = {
      ...editions[index],
      ...editionData,
      issueNumber: parseInt(editionData.issueNumber)
    };
    
    editions[index] = updatedEdition;
    localStorage.setItem('dtu_editions', JSON.stringify(editions));
    
    return updatedEdition;
  },

  async deleteEdition(id) {
    await this.delay();
    
    const storedEditions = localStorage.getItem('dtu_editions');
    const editions = storedEditions ? JSON.parse(storedEditions) : initialData.editions;
    const filtered = editions.filter(e => e.id !== id);
    
    localStorage.setItem('dtu_editions', JSON.stringify(filtered));
    
    return { success: true };
  }
};

// Initial data
const initialData = {
  editions: [
    {
      id: 1,
      title: "DTU Times — Spring 2025",
      issueNumber: 42,
      coverImageUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=300&fit=crop",
      publishDate: "2025-03-15",
      summary: "A look at campus innovation, research spotlights, and alumni stories.",
      tags: ["innovation", "alumni", "research"]
    },
    {
      id: 2,
      title: "DTU Times — Summer 2025",
      issueNumber: 43,
      coverImageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop",
      publishDate: "2025-06-10",
      summary: "Festival recap, internship diaries, and startup features.",
      tags: ["festival", "internships", "startups"]
    },
    {
      id: 3,
      title: "DTU Times — Autumn 2024",
      issueNumber: 41,
      coverImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
      publishDate: "2024-09-20",
      summary: "New academic year highlights, faculty interviews, and tech trends.",
      tags: ["academics", "technology", "faculty"]
    },
    {
      id: 4,
      title: "DTU Times — Winter 2024",
      issueNumber: 40,
      coverImageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
      publishDate: "2024-12-01",
      summary: "Year-end wrap-up, student achievements, and holiday traditions.",
      tags: ["achievements", "traditions", "year-end"]
    },
    {
      id: 5,
      title: "DTU Times — Sports Special",
      issueNumber: 39,
      coverImageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop",
      publishDate: "2024-08-15",
      summary: "Athletic department highlights, team victories, and upcoming seasons.",
      tags: ["sports", "athletics", "teams"]
    },
    {
      id: 6,
      title: "DTU Times — Research Edition",
      issueNumber: 38,
      coverImageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop",
      publishDate: "2024-07-05",
      summary: "Breakthrough discoveries, lab innovations, and doctoral dissertations.",
      tags: ["research", "science", "innovation"]
    },
    {
      id: 7,
      title: "DTU Times — Career Guide",
      issueNumber: 37,
      coverImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
      publishDate: "2024-05-20",
      summary: "Job market insights, career counseling, and industry partnerships.",
      tags: ["careers", "industry", "guidance"]
    },
    {
      id: 8,
      title: "DTU Times — Cultural Fest",
      issueNumber: 36,
      coverImageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      publishDate: "2024-04-10",
      summary: "Annual cultural celebrations, performances, and artistic showcases.",
      tags: ["culture", "arts", "performances"]
    },
    {
      id: 9,
      title: "DTU Times — Tech Symposium",
      issueNumber: 35,
      coverImageUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&h=300&fit=crop",
      publishDate: "2024-03-25",
      summary: "Latest in AI, robotics, and engineering breakthroughs from campus.",
      tags: ["technology", "AI", "robotics"]
    },
    {
      id: 10,
      title: "DTU Times — Alumni Network",
      issueNumber: 34,
      coverImageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=300&fit=crop",
      publishDate: "2024-02-15",
      summary: "Alumni success stories, networking events, and mentorship programs.",
      tags: ["alumni", "networking", "mentorship"]
    }
  ]
};

// Loading skeleton component
const LoadingSkeleton = ({ itemsPerPage }) => (
  <div className="loading-skeleton">
    {Array.from({ length: itemsPerPage }).map((_, index) => (
      <div key={index} className="skeleton-card" />
    ))}
  </div>
);

// Edition Card Component
const EditionCard = ({ edition, onEdit, onDelete }) => {
  const formattedDate = useMemo(() => {
    return new Date(edition.publishDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, [edition.publishDate]);

  return (
    <article className="card edition-card">
      <img 
        src={edition.coverImageUrl} 
        alt={edition.title} 
        className="edition-card__image"
        loading="lazy"
      />
      <div className="edition-card__content">
        <div className="edition-card__header">
          <h3 className="edition-card__title">{edition.title}</h3>
          <span className="edition-card__issue">#{edition.issueNumber}</span>
        </div>
        
        <p className="edition-card__summary">{edition.summary}</p>
        
        <div className="edition-card__tags">
          {edition.tags.map((tag, index) => (
            <span key={index} className="edition-card__tag">{tag}</span>
          ))}
        </div>
        
        <div className="edition-card__footer">
          <span className="edition-card__date">{formattedDate}</span>
          <div className="edition-card__actions">
            <button 
              className="btn btn--sm btn--secondary" 
              onClick={() => onEdit(edition)}
            >
              Edit
            </button>
            <button 
              className="btn btn--sm btn--outline" 
              onClick={() => onDelete(edition.id)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

// Modal Component
const Modal = ({ show, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (show) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [show, onClose]);

  if (!show) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal" onClick={handleBackdropClick}>
      <div className="modal__content">
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button className="modal__close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal__body">
          {children}
        </div>
      </div>
    </div>
  );
};

// Edition Form Component
const EditionForm = ({ formData, onChange, onSubmit, onCancel, loading }) => {
  const [errors, setErrors] = useState({});

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.issueNumber || isNaN(parseInt(formData.issueNumber))) {
      newErrors.issueNumber = 'Valid issue number is required';
    }
    if (!formData.coverImageUrl?.trim()) {
      newErrors.coverImageUrl = 'Cover image URL is required';
    }
    if (!formData.publishDate) {
      newErrors.publishDate = 'Publish date is required';
    }
    if (!formData.summary?.trim()) {
      newErrors.summary = 'Summary is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit();
    }
  };

  const handleInputChange = (field, value) => {
    onChange(field, value);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="title">Title *</label>
          <input
            type="text"
            className="form-control"
            id="title"
            value={formData.title || ''}
            onChange={(e) => handleInputChange('title', e.target.value)}
            required
          />
          {errors.title && <div className="form-group__error">{errors.title}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="issueNumber">Issue Number *</label>
          <input
            type="number"
            className="form-control"
            id="issueNumber"
            value={formData.issueNumber || ''}
            onChange={(e) => handleInputChange('issueNumber', e.target.value)}
            required
          />
          {errors.issueNumber && <div className="form-group__error">{errors.issueNumber}</div>}
        </div>

        <div className="form-group form-group--span-2">
          <label className="form-label" htmlFor="coverImageUrl">Cover Image URL *</label>
          <input
            type="url"
            className="form-control"
            id="coverImageUrl"
            value={formData.coverImageUrl || ''}
            onChange={(e) => handleInputChange('coverImageUrl', e.target.value)}
            required
          />
          {errors.coverImageUrl && <div className="form-group__error">{errors.coverImageUrl}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="publishDate">Publish Date *</label>
          <input
            type="date"
            className="form-control"
            id="publishDate"
            value={formData.publishDate || ''}
            onChange={(e) => handleInputChange('publishDate', e.target.value)}
            required
          />
          {errors.publishDate && <div className="form-group__error">{errors.publishDate}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="tags">Tags (comma-separated)</label>
          <input
            type="text"
            className="form-control"
            id="tags"
            value={formData.tags || ''}
            onChange={(e) => handleInputChange('tags', e.target.value)}
            placeholder="innovation, alumni, research"
          />
        </div>

        <div className="form-group form-group--span-2">
          <label className="form-label" htmlFor="summary">Summary *</label>
          <textarea
            className="form-control"
            id="summary"
            rows="4"
            value={formData.summary || ''}
            onChange={(e) => handleInputChange('summary', e.target.value)}
            required
          />
          {errors.summary && <div className="form-group__error">{errors.summary}</div>}
        </div>
      </div>

      <div className="modal__footer">
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

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
    <div className="pagination">
      <div className="pagination__info">
        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
      </div>
      
      <div className="pagination__controls">
        <button
          className="btn btn--sm btn--secondary"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Previous
        </button>
        
        <span className="pagination__pages">
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          className="btn btn--sm btn--secondary"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
        </button>
        
        <select
          className="form-control"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        >
          <option value={6}>6 per page</option>
          <option value={9}>9 per page</option>
          <option value={12}>12 per page</option>
          <option value={18}>18 per page</option>
        </select>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  // State Management
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('publishDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingEdition, setEditingEdition] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    issueNumber: '',
    coverImageUrl: '',
    publishDate: '',
    summary: '',
    tags: ''
  });

  // Fetch editions with better error handling and state management
  const fetchEditions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        q: searchQuery,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: itemsPerPage
      };
      
      const response = await apiService.getEditions(params);
      setEditions(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalItems(response.meta.total);
    } catch (err) {
      setError('Failed to fetch editions. Please try again.');
      console.error('Fetch error:', err);
      setEditions([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortBy, sortOrder, currentPage, itemsPerPage]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    fetchEditions();
  }, [fetchEditions]);

  // Handle search with debouncing and reset page
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, currentPage]);

  // Reset page when sort options change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [sortBy, sortOrder, itemsPerPage, currentPage]);

  // Modal handlers
  const handleAddNew = () => {
    setEditingEdition(null);
    setFormData({
      title: '',
      issueNumber: '',
      coverImageUrl: '',
      publishDate: '',
      summary: '',
      tags: ''
    });
    setShowModal(true);
  };

  const handleEdit = (edition) => {
    setEditingEdition(edition);
    setFormData({
      title: edition.title,
      issueNumber: edition.issueNumber.toString(),
      coverImageUrl: edition.coverImageUrl,
      publishDate: edition.publishDate,
      summary: edition.summary,
      tags: edition.tags.join(', ')
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const handleFormDataChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // CRUD operations
  const createEdition = async () => {
    try {
      setSubmitting(true);
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      };
      await apiService.createEdition(submitData);
      setShowModal(false);
      setCurrentPage(1);
      await fetchEditions();
    } catch (err) {
      setError('Failed to create edition. Please try again.');
      console.error('Create error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const updateEdition = async () => {
    try {
      setSubmitting(true);
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      };
      await apiService.updateEdition(editingEdition.id, submitData);
      setShowModal(false);
      await fetchEditions();
    } catch (err) {
      setError('Failed to update edition. Please try again.');
      console.error('Update error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteEdition = async () => {
    try {
      setSubmitting(true);
      await apiService.deleteEdition(deletingId);
      setShowDeleteModal(false);
      
      // Adjust current page if necessary
      const newTotalPages = Math.max(1, Math.ceil((totalItems - 1) / itemsPerPage));
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }
      
      await fetchEditions();
    } catch (err) {
      setError('Failed to delete edition. Please try again.');
      console.error('Delete error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (editingEdition) {
      updateEdition();
    } else {
      createEdition();
    }
  };

  const handleRefresh = () => {
    fetchEditions();
  };

  // Event handlers with proper state updates
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSortByChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header__info">
          <h1>DTU Times — Editions</h1>
          <p>CRUD + Search + Sort + Pagination</p>
        </div>
        <div className="header__actions">
          <button className="btn btn--secondary" onClick={handleRefresh}>
            Refresh
          </button>
          <button className="btn btn--primary" onClick={handleAddNew}>
            Add Edition
          </button>
        </div>
      </header>

      {/* Search and Filter Section */}
      <section className="card search-section">
        <div className="search-controls">
          <input
            type="text"
            className="form-control"
            placeholder="Search title, summary, tags..."
            value={searchQuery}
            onChange={handleSearch}
          />
          <select
            className="form-control"
            value={sortBy}
            onChange={handleSortByChange}
          >
            <option value="publishDate">Sort by Publish Date</option>
            <option value="issueNumber">Sort by Issue Number</option>
            <option value="title">Sort by Title</option>
          </select>
          <select
            className="form-control"
            value={sortOrder}
            onChange={handleSortOrderChange}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </section>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && <LoadingSkeleton itemsPerPage={itemsPerPage} />}

      {/* Editions Grid */}
      {!loading && (
        <div className="editions-grid">
          {editions.length === 0 ? (
            <div className="empty-state">
              <h3>No editions found</h3>
              <p>Try adjusting your search criteria or add a new edition.</p>
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
      )}

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

      {/* Edition Form Modal */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editingEdition ? 'Edit Edition' : 'Add Edition'}
      >
        <EditionForm
          formData={formData}
          onChange={handleFormDataChange}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
          loading={submitting}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Edition"
      >
        <p>Are you sure you want to delete this edition? This action cannot be undone.</p>
        <div className="modal__footer">
          <button className="btn btn--secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </button>
          <button
            className="btn btn--danger"
            onClick={deleteEdition}
            disabled={submitting}
          >
            {submitting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

// Initialize the React app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);