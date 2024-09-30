import express from 'express';
import bodyParser from 'body-parser';
import multer from 'multer';
import cors from 'cors'; // Import the cors package
import pkg from 'pg';  // Default import
const { Pool } = pkg;  // Destructure Pool from the imported package

const app = express();
const port = 5000; // You can change this port if needed

// PostgreSQL connection setup
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'dishes',
    password: 'Ravindu@2001',
    port: 5432,
});

app.use('/uploads', express.static('uploads'));

app.use(cors()); // Add this line to enable CORS

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint to get featured dishes
app.get('/api/featured-dishes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM featured_dishes');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to add a new dish
app.post('/api/featured-dishes', upload.single('image'), async (req, res) => {
  const { name, description } = req.body;
  const image = req.file ? req.file.filename : null; // Only store the filename
  
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
    res.status(500).json({ error: err.message });
  }
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
