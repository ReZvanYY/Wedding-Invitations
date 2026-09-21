import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Set up the database connection pool using Railway credentials
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// --- SECURITY MIDDLEWARE ---
// Checks if the user has a valid access token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token after "Bearer "
  
  if (!token) return res.status(401).json({ message: 'Ingen tilgang. Token mangler.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Ugyldig eller utløpt token.' });
    req.user = user;
    next(); // Token is valid, proceed to the route
  });
};

// Health check endpoint to verify the server is running
app.get("/", (req, res) => {
  res.send("Wedding Auth API is running!");
});

// --- USER REGISTRATION ENDPOINT ---
app.post("/api/register", async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      "INSERT INTO users (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)",
      [first_name, last_name, email, hashedPassword],
    );

    const userId = result.insertId;

    const accessToken = jwt.sign(
      { id: userId, email: email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );

    return res.status(201).json({
      message: "User created successfully!",
      accessToken,
      user: {
        id: userId,
        first_name,
        last_name,
        email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "An account with this email address already exists.",
      });
    }

    return res.status(500).json({ message: "Internal server error during registration." });
  }
});

// --- USER LOGIN ENDPOINT ---
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    // 1. Check if the user exists in the database
    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];

    // If no user is found with that email
    if (!user) {
      return res.status(401).json({ message: "Ugyldig e-post eller passord." });
    }

    // 2. Compare the entered password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Ugyldig e-post eller passord." });
    }

    // 3. Generate a new JWT access token
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );

    // 4. Send the token and user data back to React
    return res.status(200).json({
      message: "Login successful!",
      accessToken,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Intern serverfeil under innlogging." });
  }
});

// --- GET MY REPLY (Fetch existing response for editing) ---
app.get('/api/my-reply', authenticateToken, async (req, res) => {
  try {
    // Check if the currently logged-in user already has a response
    const [responseRows] = await pool.execute(
      'SELECT id, comments FROM responses WHERE user_id = ?', 
      [req.user.id]
    );
    
    if (responseRows.length === 0) {
      return res.status(200).json(null); // No previous reply found
    }

    const responseId = responseRows[0].id;
    
    // Get all guests tied to this specific response
    const [guestRows] = await pool.execute(
      'SELECT full_name, is_attending FROM guests WHERE response_id = ?', 
      [responseId]
    );

    // Format data for React (convert TINYINT 1/0 back to boolean true/false)
    const formattedGuests = guestRows.map(g => ({
      full_name: g.full_name,
      is_attending: g.is_attending === 1
    }));

    return res.status(200).json({
      comments: responseRows[0].comments,
      guests: formattedGuests
    });
  } catch (error) {
    console.error('Error fetching user reply:', error);
    return res.status(500).json({ message: 'Kunne ikke hente tidligere svar.' });
  }
});

// --- SUBMIT OR UPDATE REPLY FORM ---
app.post('/api/submit-form', authenticateToken, async (req, res) => {
  const { guests, comments } = req.body;
  const userId = req.user.id; // Tied to the securely authenticated user

  if (!guests || guests.length === 0) {
    return res.status(400).json({ message: 'Du må legge til minst én gjest.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Check if user already has a response
    const [existingResponse] = await connection.execute(
      'SELECT id FROM responses WHERE user_id = ?',
      [userId]
    );

    let responseId;

    if (existingResponse.length > 0) {
      // USER EXISTS: Update comments and clear old guests to make room for the new list
      responseId = existingResponse[0].id;
      
      await connection.execute(
        'UPDATE responses SET comments = ? WHERE id = ?',
        [comments || null, responseId]
      );

      // Delete old guest list 
      await connection.execute('DELETE FROM guests WHERE response_id = ?', [responseId]);
    } else {
      // NEW USER: Create a brand new response linked to their user_id
      const [insertResult] = await connection.execute(
        'INSERT INTO responses (user_id, comments) VALUES (?, ?)',
        [userId, comments || null]
      );
      responseId = insertResult.insertId;
    }

    // 2. Insert the fresh guest list (works for both new and updated responses)
    for (const guest of guests) {
      await connection.execute(
        'INSERT INTO guests (response_id, full_name, is_attending) VALUES (?, ?, ?)',
        [responseId, guest.full_name, guest.is_attending ? 1 : 0]
      );
    }

    await connection.commit();
    return res.status(200).json({ message: 'Svar lagret med suksess!' });
  } catch (error) {
    await connection.rollback();
    console.error('Form submission error:', error);
    return res.status(500).json({ message: 'Kunne ikke lagre svaret.' });
  } finally {
    connection.release();
  }
});

// --- GET ALL RESPONSES (Protected & Admin Only) ---
app.get('/api/guests', authenticateToken, async (req, res) => {
  const adminId = 3;

  if (req.user.id !== adminId) {
    return res.status(403).json({ message: 'Tilgang nektet. Kun for administrator.' });
  }

  try {
    const [rows] = await pool.execute(`
      SELECT 
        r.id AS response_id, 
        r.comments, 
        r.created_at,
        g.id AS guest_id, 
        g.full_name, 
        g.is_attending
      FROM responses r
      JOIN guests g ON r.id = g.response_id
      ORDER BY r.created_at DESC
    `);
    
    const formattedResponses = rows.reduce((acc, row) => {
      let response = acc.find(r => r.response_id === row.response_id);
      
      if (!response) {
        response = { 
          response_id: row.response_id, 
          comments: row.comments, 
          created_at: row.created_at, 
          guests: [] 
        };
        acc.push(response);
      }
      
      response.guests.push({
        id: row.guest_id,
        full_name: row.full_name,
        is_attending: row.is_attending === 1
      });
      
      return acc;
    }, []);

    return res.status(200).json(formattedResponses);
  } catch (error) {
    console.error('Error fetching guest list data:', error);
    return res.status(500).json({ message: 'Kunne ikke hente gjestelisten.' });
  }
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});