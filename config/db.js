import logger from "../utils/logger.js";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_NAME,
  DB_PORT,
  NODE_ENV,
  DB_NAME_TEST,
} = process.env;

if (!DB_HOST || !DB_PASSWORD || !DB_NAME || !DB_USER || !DB_PORT) {
  logger.error(
    "Database environment variables are missing! Check your .env file."
  );
  process.exit(1);
}

const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: NODE_ENV === "test" ? DB_NAME_TEST : DB_NAME,
  password: DB_PASSWORD,
  port: parseInt(DB_PORT, 10),
  connectionTimeoutMillis: 2000,
});

logger.info(`Database is configured for: ${DB_NAME}`);

pool.on("connect", (client) => {
  logger.info(`Client connected from Pool (Total count: ${pool.totalCount}`);
});

pool.on("error", (err, client) => {
  logger.error("Unexpected error on idle client in pool", err);
  process.exit(-1);
});

const initialzeDbSchema = async () => {
  const client = await pool.connect();
  try {
    logger.info("Initializing database schema...");
    await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto");

    await client.query(`
      CREATE TABLE IF NOT EXISTS service_providers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name VARCHAR(50) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        adresse VARCHAR(50),
        phone VARCHAR(20),
        work VARCHAR(50),
        about_myself VARCHAR(255),
        profile_image_url VARCHAR(255),
        created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    logger.info(`service_providers table has been created`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        adresse VARCHAR(50),
        phone VARCHAR(20),
        profile_image_url VARCHAR(255),
        created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    logger.info(`clients table has been created`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS time_slots (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE,
        start_time TIMESTAMPTZ NOT NULL,
        duration_minutes INTEGER NOT NULL,
        is_reserved BOOLEAN DEFAULT FALSE,
        created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    logger.info(`time_slots table has been created`);

    await client.query(`
        CREATE TABLE IF NOT EXISTS appointment (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
        provider_id UUID REFERENCES service_providers(id) ON DELETE SET NULL,
        time_slot_id UUID REFERENCES time_slots(id) ON DELETE SET NULL,
        status TEXT CHECK (
          status IN ('pending', 'confirmed', 'cancelled_by_client', 'cancelled_by_provider')
        ) DEFAULT 'pending',
        created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    logger.info(`appointment table has been created`);

    //Speeds up searches by date/time (e.g. available slots on a given day)
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_time_slots_start_time ON time_slots(start_time)`
    );
    //Allows you to retrieve slots from a specific provider
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_time_slots_provider ON time_slots(provider_id)`
    );
    //-- Quick search by email
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_providers_email ON service_providers(email)"
    );
    //Find all of a client's appointments
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_appointment_client ON appointment(client_id)"
    );
    //Find a reservation from a slot
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_appointment_timeslot ON appointment(time_slot_id)"
    );

    logger.info("successfully created index");

    //create the pg_trigger fuction
    await client.query(`
          CREATE OR REPLACE FUNCTION update_updated_at_column()
          RETURNS TRIGGER AS $$
          BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
        `);
    logger.debug("update_updated_at_column function ensured.");
    //----------------------------------
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS ( SELECT 1 FROM pg_trigger
          WHERE tgname = 'set_updated_at_service_providers') THEN 
          CREATE TRIGGER set_updated_at_service_providers
          BEFORE UPDATE ON service_providers 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
        END IF;
      END $$;
    `);
    logger.debug("service_providers update_at Trigger is checked and created");
      //----------------------------------------------
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS ( SELECT 1 FROM pg_trigger
          WHERE tgname = 'set_updated_at_clients') THEN 
          CREATE TRIGGER set_updated_at_clients
          BEFORE UPDATE ON clients
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
        END IF;
      END $$;
    `);
    logger.debug("clients update_at Trigger is checked and created");
      //--------------------------------------------------------------------
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS ( SELECT 1 FROM pg_trigger
          WHERE tgname = 'set_updated_at_time_slots') THEN 
          CREATE TRIGGER set_updated_at_time_slots
          BEFORE UPDATE ON time_slots
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
        END IF;
      END $$;
    `);
    logger.debug("time_slots update_at Trigger is checked and created");
    //----------------------------------------------------------------------------------------
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS ( SELECT 1 FROM pg_trigger
          WHERE tgname = 'set_updated_at_appointment') THEN 
          CREATE TRIGGER set_updated_at_appointment
          BEFORE UPDATE ON appointment
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
        END IF;
      END $$;
    `);
    logger.debug("appointment update_at Trigger is checked and created");

  } catch (error) {
    logger.error(`Error while initializing the schema`, error);
    process.exit(1);
  } finally {
    client.release();
  }
};

const connectToDb = async () => {
  try {
    const client = await pool.connect();
    logger.info(`Database connection pool established successfully`);
    client.release();
  } catch (error) {
    logger.error("Unable to establish database connection pool", error);
    process.exit(1);
  }
};

const query = async (text, params) => {
  const start = Date.now();
  try {
    const response = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.info(
      `Executed query: { text: ${text.substring(
        0,
        100
      )}..., params: ${JSON.stringify(
        params
      )}, duration: ${duration}ms, rows: ${response.rowCount}}`
    );
    return response;
  } catch (error) {
    logger.error(
      `Error executing query: { text: ${text.substring(
        0,
        100
      )}..., params: ${JSON.stringify(params)}, error: ${error.message}}`
    );
    throw error;
  }
};

export { pool, connectToDb, query, initialzeDbSchema };
