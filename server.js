import express from 'express';
import bodyParser from 'body-parser';
import multer from 'multer';
import cors from 'cors'; 
import pkg from 'pg';  // PostgreSQL package
const { Pool } = pkg;  
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 5000; // Default port 5000

// PostgreSQL connection setup
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'dishes',
  password: process.env.DB_PASSWORD || 'Ravindu@2001',
  port: process.env.DB_PORT || 5432,
});

// Static folder to serve uploaded images
app.use('/uploads', express.static('uploads'));

// Enable CORS to allow requests from your frontend
app.use(cors());

// Middleware to parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure multer for file uploads (dest = 'uploads' folder)
const upload = multer({ dest: 'uploads/' });

// Get all featured dishes
app.get('/api/featured-dishes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM featured_dishes');
    res.json(result.rows);  // Send the result as JSON
  } catch (err) {
    console.error('Error fetching featured dishes:', err);
    res.status(500).json({ error: 'Failed to retrieve featured dishes' });
  }
});

// Add a new dish
app.post('/api/featured-dishes', upload.single('image'), async (req, res) => {
  const { name, description } = req.body;
  const image = req.file ? req.file.filename : null; // Get the filename if the image is uploaded

  // Validate request body
  if (!name || !description) {
    return res.status(400).json({ error: 'Name and description are required' });
  }

  try {
    await pool.query(
      'INSERT INTO featured_dishes (name, description, image) VALUES ($1, $2, $3)',
      [name, description, image]
    );
    res.status(201).json({ message: 'Dish added successfully' });
  } catch (err) {
    console.error('Error adding new dish:', err);
    res.status(500).json({ error: 'Failed to add the new dish' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
