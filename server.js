const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Database setup
const db = new sqlite3.Database('machines.db');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS machines (
    machine_id INTEGER PRIMARY KEY AUTOINCREMENT,
    machine_name TEXT NOT NULL,
    location TEXT NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS machine_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    machine_id INTEGER NOT NULL,
    log_date DATE DEFAULT (DATE('now')),
    current_in INTEGER NOT NULL,
    current_out INTEGER NOT NULL,
    last_in INTEGER,
    last_out INTEGER,
    FOREIGN KEY(machine_id) REFERENCES machines(machine_id)
  )`);
});

// Fetch machines
app.get('/machines', (req, res) => {
  db.all("SELECT * FROM machines", [], (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
});

// Add machine
app.post('/machines', (req, res) => {
  const { machine_name, location } = req.body;
  db.run("INSERT INTO machines (machine_name, location) VALUES (?, ?)",
    [machine_name, location],
    function(err) {
      if (err) return res.status(500).send(err);
      res.json({ machine_id: this.lastID, machine_name, location });
    }
  );
});

// Add daily log entry
app.post('/log', (req, res) => {
  const { machine_id, current_in, current_out } = req.body;

  // Get last values
  db.get(`SELECT current_in AS last_in, current_out AS last_out
          FROM machine_log 
          WHERE machine_id = ? 
          ORDER BY id DESC LIMIT 1`,
    [machine_id],
    (err, lastRow) => {
      if (err) return res.status(500).send(err);

      const last_in = lastRow ? lastRow.last_in : 0;
      const last_out = lastRow ? lastRow.last_out : 0;

      db.run(`INSERT INTO machine_log 
                (machine_id, current_in, current_out, last_in, last_out)
              VALUES (?, ?, ?, ?, ?)`,
        [machine_id, current_in, current_out, last_in, last_out],
        function(err) {
          if (err) return res.status(500).send(err);
          res.json({ id: this.lastID, machine_id, current_in, current_out, last_in, last_out });
        }
      );
    });
});

// Report per location/day
app.get('/report', (req, res) => {
  const { location, date } = req.query;
  const sql = `
    SELECT m.machine_name, ml.current_in, ml.current_out, ml.last_in, ml.last_out,
           (ml.current_in - ml.last_in) AS total_in,
           (ml.current_out - ml.last_out) AS total_out,
           ((ml.current_in - ml.last_in) - (ml.current_out - ml.last_out)) AS profit
    FROM machine_log ml
    JOIN machines m ON ml.machine_id = m.machine_id
    WHERE m.location = ? AND ml.log_date = ?
  `;
  db.all(sql, [location, date], (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
