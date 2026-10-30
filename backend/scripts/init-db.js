require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const { Client } = require("pg");

async function init() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log("No DATABASE_URL found, skipping extension initialization.");
    return;
  }

  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log("--> Enabling pg_trgm extension for GIN indexes...");
    await client.query("CREATE EXTENSION IF NOT EXISTS pg_trgm;");
    console.log("✔ pg_trgm extension is active.");
  } catch (err) {
    console.warn("Notice: pg_trgm initialization:", err.message);
  } finally {
    await client.end().catch(() => {});
  }
}

init();
