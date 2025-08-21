import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Sample data for auto-seeding
const seedData = {
  "editions": [
    {
      "id": 1,
      "title": "DTU Times — Spring 2025",
      "issueNumber": 42,
      "coverImageUrl": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=300&fit=crop",
      "publishDate": "2025-03-15",
      "summary": "A look at campus innovation, research spotlights, and alumni stories.",
      "tags": ["innovation", "alumni", "research"]
    },
    {
      "id": 2,
      "title": "DTU Times — Summer 2025",
      "issueNumber": 43,
      "coverImageUrl": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop",
      "publishDate": "2025-06-10",
      "summary": "Festival recap, internship diaries, and startup features.",
      "tags": ["festival", "internships", "startups"]
    },
    {
      "id": 3,
      "title": "DTU Times — Autumn 2024",
      "issueNumber": 41,
      "coverImageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
      "publishDate": "2024-09-20",
      "summary": "New academic year highlights, faculty interviews, and tech trends.",
      "tags": ["academics", "technology", "faculty"]
    },
    {
      "id": 4,
      "title": "DTU Times — Winter 2024",
      "issueNumber": 40,
      "coverImageUrl": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
      "publishDate": "2024-12-01",
      "summary": "Year-end wrap-up, student achievements, and holiday traditions.",
      "tags": ["achievements", "traditions", "year-end"]
    },
    {
      "id": 5,
      "title": "DTU Times — Sports Special",
      "issueNumber": 39,
      "coverImageUrl": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop",
      "publishDate": "2024-08-15",
      "summary": "Athletic department highlights, team victories, and upcoming seasons.",
      "tags": ["sports", "athletics", "teams"]
    },
    {
      "id": 6,
      "title": "DTU Times — Research Edition",
      "issueNumber": 38,
      "coverImageUrl": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop",
      "publishDate": "2024-07-05",
      "summary": "Breakthrough discoveries, lab innovations, and doctoral dissertations.",
      "tags": ["research", "science", "innovation"]
    },
    {
      "id": 7,
      "title": "DTU Times — Career Guide",
      "issueNumber": 37,
      "coverImageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
      "publishDate": "2024-05-20",
      "summary": "Job market insights, career counseling, and industry partnerships.",
      "tags": ["careers", "industry", "guidance"]
    },
    {
      "id": 8,
      "title": "DTU Times — Cultural Fest",
      "issueNumber": 36,
      "coverImageUrl": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      "publishDate": "2024-04-10",
      "summary": "Annual cultural celebrations, performances, and artistic showcases.",
      "tags": ["culture", "arts", "performances"]
    },
    {
      "id": 9,
      "title": "DTU Times — Tech Symposium",
      "issueNumber": 35,
      "coverImageUrl": "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&h=300&fit=crop",
      "publishDate": "2024-03-25",
      "summary": "Latest in AI, robotics, and engineering breakthroughs from campus.",
      "tags": ["technology", "AI", "robotics"]
    },
    {
      "id": 10,
      "title": "DTU Times — Alumni Network",
      "issueNumber": 34,
      "coverImageUrl": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=300&fit=crop",
      "publishDate": "2024-02-15",
      "summary": "Alumni success stories, networking events, and mentorship programs.",
      "tags": ["alumni", "networking", "mentorship"]
    }
  ]
};

// Database functions
async function readDB() {
  try {
    const raw = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    if (e.code === 'ENOENT') {
      // Auto-seed database with sample data
      await fs.writeFile(DB_PATH, JSON.stringify(seedData, null, 2));
      return seedData;
    }
    throw e;
  }
}

async function writeDB(db) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

// Validation function
function validateEdition(payload, partial = false) {
  const errors = [];
  const required = ['title', 'issueNumber', 'coverImageUrl', 'publishDate', 'summary'];
  
  if (!partial) {
    for (const k of required) {
      if (payload[k] == null || payload[k] === '') {
        errors.push(`${k} is required`);
      }
    }
  }
  
  if (payload.issueNumber != null && Number.isNaN(Number(payload.issueNumber))) {
    errors.push('issueNumber must be a number');
  }
  
  if (payload.publishDate && !/^\d{4}-\d{2}-\d{2}$/.test(payload.publishDate)) {
    errors.push('publishDate must be YYYY-MM-DD format');
  }
  
  if (payload.tags && !Array.isArray(payload.tags)) {
    errors.push('tags must be an array of strings');
  }
  
  return errors;
}

// Routes

// GET /editions - Get editions with search, sort, pagination
app.get('/editions', async (req, res) => {
  try {
    const { q = '', tag, sortBy = 'publishDate', sortOrder = 'desc', page = '1', limit = '9' } = req.query;
    
    const db = await readDB();
    let rows = db.editions.slice();

    // Apply search filter
    const term = String(q).trim().toLowerCase();
    if (term) {
      rows = rows.filter(e =>
        e.title.toLowerCase().includes(term) ||
        e.summary.toLowerCase().includes(term) ||
        (e.tags || []).some(t => String(t).toLowerCase().includes(term))
      );
    }

    // Apply tag filter
    if (tag) {
      const t = String(tag).toLowerCase();
      rows = rows.filter(e => (e.tags || []).some(x => String(x).toLowerCase() === t));
    }

    // Apply sorting
    const sby = ['publishDate', 'issueNumber', 'title'].includes(sortBy) ? sortBy : 'publishDate';
    const mul = sortOrder === 'asc' ? 1 : -1;
    
    rows.sort((a, b) => {
      const A = a[sby];
      const B = b[sby];
      if (sby === 'issueNumber') return (Number(A) - Number(B)) * mul;
      if (sby === 'publishDate') return (new Date(A).getTime() - new Date(B).getTime()) * mul;
      return String(A).localeCompare(String(B)) * mul;
    });

    // Apply pagination
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.max(1, Math.min(50, parseInt(limit, 10) || 9));
    const total = rows.length;
    const totalPages = Math.max(1, Math.ceil(total / l));
    const start = (p - 1) * l;
    const data = rows.slice(start, start + l);

    res.json({ 
      data, 
      page: p, 
      limit: l, 
      total, 
      totalPages 
    });

  } catch (error) {
    console.error('Error fetching editions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /editions - Create new edition
app.post('/editions', async (req, res) => {
  try {
    const payload = req.body || {};
    const errors = validateEdition(payload);
    
    if (errors.length) {
      return res.status(400).json({ errors });
    }

    const db = await readDB();
    const id = db.editions.length ? Math.max(...db.editions.map(e => Number(e.id))) + 1 : 1;
    
    const record = {
      id,
      title: String(payload.title),
      issueNumber: Number(payload.issueNumber),
      coverImageUrl: String(payload.coverImageUrl),
      publishDate: String(payload.publishDate),
      summary: String(payload.summary),
      tags: Array.isArray(payload.tags) ? payload.tags : []
    };
    
    db.editions.push(record);
    await writeDB(db);
    
    res.status(201).json(record);

  } catch (error) {
    console.error('Error creating edition:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /editions/:id - Update edition
app.put('/editions/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const payload = req.body || {};
    const errors = validateEdition(payload, true);
    
    if (errors.length) {
      return res.status(400).json({ errors });
    }

    const db = await readDB();
    const idx = db.editions.findIndex(e => Number(e.id) === id);
    
    if (idx === -1) {
      return res.status(404).json({ error: 'Edition not found' });
    }

    const current = db.editions[idx];
    const updated = {
      ...current,
      ...payload,
      issueNumber: payload.issueNumber != null ? Number(payload.issueNumber) : current.issueNumber,
    };
    
    db.editions[idx] = updated;
    await writeDB(db);
    
    res.json(updated);

  } catch (error) {
    console.error('Error updating edition:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /editions/:id - Delete edition
app.delete('/editions/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const db = await readDB();
    const before = db.editions.length;
    
    db.editions = db.editions.filter(e => Number(e.id) !== id);
    
    if (db.editions.length === before) {
      return res.status(404).json({ error: 'Edition not found' });
    }
    
    await writeDB(db);
    res.status(204).send();

  } catch (error) {
    console.error('Error deleting edition:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'DTU Times API is running'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 DTU Times API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log('\n📚 API Endpoints:');
  console.log(`   GET    /editions         - List editions with search/sort/pagination`);
  console.log(`   POST   /editions         - Create new edition`);
  console.log(`   PUT    /editions/:id     - Update edition`);
  console.log(`   DELETE /editions/:id     - Delete edition`);
  console.log(`   GET    /health           - Health check`);
  console.log('\n🎯 Ready to accept requests from React frontend!');
});