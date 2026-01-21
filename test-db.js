require("dotenv").config();
const pool = require("./src/config/db");

(async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("DB OK:", result.rows);
  } catch (err) {
    console.error("DB ERROR:", err);
  } finally {
    pool.end();
  }
})();
