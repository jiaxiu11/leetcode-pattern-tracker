import express from "express";
import pg from "pg";
import cors from "cors";

const { Pool } = pg;
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create tables on startup
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS problems (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      link TEXT DEFAULT '',
      pattern TEXT DEFAULT 'Other',
      rating INT DEFAULT 2,
      time_minutes INT DEFAULT 0,
      pattern_note TEXT DEFAULT '',
      insight TEXT DEFAULT '',
      difficulty TEXT DEFAULT 'Medium',
      date TEXT,
      next_review TEXT,
      review_history JSONB DEFAULT '[]',
      last_updated TEXT
    );

    CREATE TABLE IF NOT EXISTS pattern_notes (
      pattern TEXT PRIMARY KEY,
      note TEXT DEFAULT ''
    );
  `);
  console.log("Database tables ready");
}

// Row → camelCase JS object
function rowToProblem(row) {
  return {
    id: row.id,
    name: row.name,
    link: row.link,
    pattern: row.pattern,
    rating: row.rating,
    time: row.time_minutes,
    patternNote: row.pattern_note,
    insight: row.insight,
    difficulty: row.difficulty,
    date: row.date,
    nextReview: row.next_review,
    reviewHistory: row.review_history ?? [],
    lastUpdated: row.last_updated,
  };
}

// GET /api/data — load all problems + pattern notes
app.get("/api/data", async (req, res) => {
  try {
    const [problemsRes, notesRes] = await Promise.all([
      pool.query("SELECT * FROM problems ORDER BY date DESC"),
      pool.query("SELECT * FROM pattern_notes"),
    ]);

    const problems = problemsRes.rows.map(rowToProblem);

    const patternNotes = {};
    notesRes.rows.forEach((r) => {
      patternNotes[r.pattern] = r.note;
    });

    res.json({ problems, patternNotes });
  } catch (err) {
    console.error("GET /api/data error:", err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/data — upsert all problems, sync deletions, upsert pattern notes
app.put("/api/data", async (req, res) => {
  const { problems = [], patternNotes = {} } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Upsert each problem
    for (const p of problems) {
      await client.query(
        `INSERT INTO problems
           (id, name, link, pattern, rating, time_minutes, pattern_note,
            insight, difficulty, date, next_review, review_history, last_updated)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT (id) DO UPDATE SET
           name          = EXCLUDED.name,
           link          = EXCLUDED.link,
           pattern       = EXCLUDED.pattern,
           rating        = EXCLUDED.rating,
           time_minutes  = EXCLUDED.time_minutes,
           pattern_note  = EXCLUDED.pattern_note,
           insight       = EXCLUDED.insight,
           difficulty    = EXCLUDED.difficulty,
           date          = EXCLUDED.date,
           next_review   = EXCLUDED.next_review,
           review_history= EXCLUDED.review_history,
           last_updated  = EXCLUDED.last_updated`,
        [
          p.id,
          p.name,
          p.link ?? "",
          p.pattern ?? "Other",
          p.rating,
          p.time ?? 0,
          p.patternNote ?? "",
          p.insight ?? "",
          p.difficulty ?? "Medium",
          p.date,
          p.nextReview,
          JSON.stringify(p.reviewHistory ?? []),
          p.lastUpdated,
        ]
      );
    }

    // Delete problems that are no longer in the list
    if (problems.length > 0) {
      const ids = problems.map((p) => p.id);
      await client.query("DELETE FROM problems WHERE id != ALL($1::text[])", [ids]);
    } else {
      await client.query("DELETE FROM problems");
    }

    // Upsert pattern notes
    for (const [pattern, note] of Object.entries(patternNotes)) {
      await client.query(
        `INSERT INTO pattern_notes (pattern, note) VALUES ($1, $2)
         ON CONFLICT (pattern) DO UPDATE SET note = EXCLUDED.note`,
        [pattern, note]
      );
    }

    await client.query("COMMIT");
    res.json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("PUT /api/data error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

const PORT = process.env.PORT || 3001;
initDb()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
