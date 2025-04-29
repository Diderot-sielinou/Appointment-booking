import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import request from "supertest";
import app from "../app.js";

import { query, pool, connectToDb, initialzeDbSchema } from "../config/db.js";
const client = {
  email: `test_c${Date.now()}@example.com`,
  password: "TestPassword123",
  phone: "+237675677889",
  adresse: "douala",
  firstName: "fonou",
  lastName: "yvan",
};

const provider = {
  email: `test_p${Date.now()}@example.com`,
  password: "TestPassword123",
  phone: "+237675577884",
  adresse: "douala",
  work: "Doctor",
  fullName: "nkanaou brice",
  work: "my name is dwekldewdjoiwcmlkewcnwkjc wckjnckjcenreckjrec cecre",
};
let testProviderId = null;
let testProviderToken = null;

let testClientId = null;
let testClientToken = null;

let tmeslotId = null;
describe("tme slot api (/time-slots)", () => {
  before(async () => {
    console.log(
      "--- Configuring a client and provider to test operations on timeslots ---"
    );
    // await connectToDb();
    // await initialzeDbSchema();
    // Clean up potential leftovers
    await query("DELETE FROM clients WHERE email = $1", [client.email]);
    await query("DELETE FROM service_providers WHERE email = $1", [
      provider.email,
    ]);

    // Register client
    await request(app)
      .post("/auth-client/register")
      .send({ ...client, confirmPassword: client.password }); // Include confirmPassword
    // login client
    const loginClient = await request(app).post("/auth-client/login").send({
      email: client.email,
      password: client.password,
    });
    testClientToken = loginClient.body.token;
    testClientId = loginClient.body.client.id;
    assert(testClientToken, "Failed to get token for client ");
    assert(testClientId, "Failed to get user ID for client ");
    console.log(`--- Test client ${testClientId} set up with token ---`);
    //----------------------------------------------------------------///

    // Register provider
    await request(app)
      .post("/auth-service-provider/register")
      .send({ ...provider, confirmPassword: provider.password }); // Include confirmPassword
    // login provider
    const loginProvider = await request(app)
      .post("/auth-service-provider/login")
      .send({
        email: provider.email,
        password: provider.password,
      });
    testProviderToken = loginProvider.body.token;
    testProviderId = loginProvider.body.providerId.id;
    assert(testProviderToken, "Failed to get token for provider ");
    assert(testProviderId, "Failed to get user ID for provider ");
    console.log(`--- Test provider ${testProviderId} set up with token ---`);
  });

  // Cleanup: Delete the test user (tasks should cascade delete) and close pool
  after(async () => {
    if (testClientId) {
      console.log(`--- Cleaning up client test  ID: ${testClientId} ---`);
      await query("DELETE FROM clients WHERE id = $1", [testClientId]);
    }
    if (testProviderId) {
      console.log(`--- Cleaning up provider test  ID: ${testProviderId} ---`);
      await query("DELETE FROM service_providers WHERE id = $1", [
        testProviderId,
      ]);
    }
    console.log("--- Closing database pool after task tests ---");
    // Only close the pool if it's the last test file, or manage pool lifecycle differently
    await pool.end();
  });
    // Optional: Clean tasks before each test if needed, but cascade delete might be enough
    beforeEach(async () => {
      
      tmeslotId = null; // Reset task ID holder
    });

  describe("POST /create", () => {
    it("should create a new time slot successfully for authenticated provider", async () => {
      const timeSlotData = {
        startTime: "2025-05-04T10:30:00.000Z",
        duration: 45,
      };
      const res = await request(app)
        .post("/time-slots/create")
        .set("Authorization", `Bearer ${testProviderToken}`) // Set auth header
        .send(timeSlotData)
        .expect("Content-Type", /json/)
        .expect(201);

      assert(res.body.message, "time slot created fail");
      assert(res.body.results, "fail to create new time slot object");
      assert.strictEqual(res.body.provider_id, testProviderId);
      assert.strictEqual(res.body.results.is_reserved , false); // Default
      assert(res.body.results.id, "Task ID should be returned");
      tmeslotId = res.body.results.id; // Store for later tests

    });
    it('should fail to create a time slot without authentication', async () => {
      const timeSlotData = {
        startTime: "2025-05-04T10:30:00.000Z",
        duration: 45,
      };
      await request(app)
        .post('/time-slots/create')
        // No Authorization header
        .send(timeSlotData)
        .expect('Content-Type', /json/)
        .expect(401);
    });
    it('should fail to create a task with missing startTime', async () => {
      const timeSlotData = { duration: 45, };
      await request(app)
        .post('/time-slots/create')
        .set('Authorization', `Bearer ${testProviderToken}`)
        .send(timeSlotData)
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });

  describe('GET /time-slots', () => {
    beforeEach(async () => {
      // Create a task first to ensure there's something to get
      const timeSlotData = {
        startTime: "2025-06-04T10:30:00.000Z",
        duration: 60,
      };
      const res = await request(app)
        .post('/time-slots/create')
        .set('Authorization', `Bearer ${testProviderToken}`)
        .send(timeSlotData);
        tmeslotId = res.body.results.id;
    });

    it('should get all tine slot create for the authenticated provider', async () => {
      const res = await request(app)
        .get('/time-slots')
        .set('Authorization', `Bearer ${testProviderToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      assert(Array.isArray(res.body.results), 'Response should be an array');
      // Ensure all returned time slot belong to the provider
      assert(res.body.results.every(timeSlot => timeSlot.provider_id === testProviderId), 'Found tinme slot not belonging to the test provider');
    });

    it('should fail to get time slots without authentication', async () => {
      await request(app)
        .get('/time-slots')
        .expect('Content-Type', /json/)
        .expect(401);
    });
  });

  describe('PUT /time-slots/:id', () => {
    beforeEach(async () => {
      // Create a time first to ensure there's something to get
      const timeSlotData = {
        startTime: "2025-07-04T10:30:00.000Z",
        duration: 120,
      };
      const res = await request(app)
        .post('/time-slots/create')
        .set('Authorization', `Bearer ${testProviderToken}`)
        .send(timeSlotData);
        tmeslotId = res.body.results.id;
        assert(tmeslotId, 'Failed to create task in beforeEach for PUT tests');
    });


    it('should update a specific task by ID for the authenticated provider', async () => {
      const timeSlotData = {
        startTime: "2025-07-04T10:30:00.000Z",
        duration: 30,
      };
      const res = await request(app)
        .put(`/time-slots/${tmeslotId}/update-time-slot`)
        .set('Authorization', `Bearer ${testProviderToken}`)
        .send(timeSlotData)
        .expect('Content-Type', /json/)
        .expect(200);

      assert.strictEqual(res.body.results.id, tmeslotId);
      assert.strictEqual(res.body.results.is_reserved, false);
      assert.strictEqual(res.body.results.provider_id, testProviderId);
    });

    it('should fail to update a task without authentication', async () => {
      const timeSlotData = {
        startTime: "2025-07-04T10:30:00.000Z",
        duration: 30,
      };
      await request(app)
        .put(`/time-slots/${tmeslotId}/update-time-slot`)
        .send(timeSlotData)
        .expect('Content-Type', /json/)
        .expect(401);
    });

    it('should return 404 if updating a non-existent task ID', async () => {
      const timeSlotData = {
        startTime: "2025-07-04T10:30:00.000Z",
        duration: 30,
      };
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .put(`/time-slots/${nonExistentId}/update-time-slot`)
        .set('Authorization', `Bearer ${testProviderToken}`)
        .send(timeSlotData)
        .expect('Content-Type', /json/)
        .expect(404); // Or 403 depending on controller logic check order
    });

    //  tests for updating time slot with data alredy exist
    it('should return 409 if updating with a existent data', async () => {
      const timeSlotData = {
        startTime: "2025-07-04T10:30:00.000Z",
        duration: 30,
      };

      await request(app)
        .put(`/time-slots/${tmeslotId}/update-time-slot`)
        .set('Authorization', `Bearer ${testProviderToken}`)
        .send(timeSlotData)
        .expect('Content-Type', /json/)
        .expect(409); // Or 409 depending on controller logic check order
    });
    // Add tests for invalid update data (expect 400)
    it('should return 400 if updating for invalid update data', async () => {
      const timeSlotData = {
        startTime: "2025-04-04T13:00:00.000Z",
        duration: 10,
      };

      await request(app)
        .put(`/time-slots/${tmeslotId}/update-time-slot`)
        .set('Authorization', `Bearer ${testProviderToken}`)
        .send(timeSlotData)
        .expect('Content-Type', /json/)
        .expect(400); // Or 409 depending on controller logic check order
    });
  });

  // booked time slot
  describe('GET /booked/:id', () => {
    beforeEach(async () => {
      // Create a time first to ensure there's something to get
      const timeSlotData = {
        startTime: "2025-07-04T10:30:00.000Z",
        duration: 120,
      };
      const res = await request(app)
        .post('/time-slots/create')
        .set('Authorization', `Bearer ${testProviderToken}`)
        .send(timeSlotData);
        tmeslotId = res.body.results.id;
        assert(tmeslotId, 'Failed to create task in beforeEach for PUT tests');
    });

    it('should book a free time slot and return appointment', async () => {
      const res = await request(app)
        .post(`/time-slots/booked/${tmeslotId}`)
        .set('Authorization', `Bearer ${testClientToken}`)
        .expect('Content-Type', /json/)
        .expect(200);
  
      assert(res.body.appointment);
      assert.strictEqual(res.body.appointment.time_slot_id, tmeslotId);
      assert.strictEqual(res.body.appointment.client_id, testClientId);
      assert.strictEqual(res.body.appointment.provider_id, testProviderId);
      assert.strictEqual(res.body.appointment.status, 'confirmed');
    });

    it('should fail booking same slot again (409)', async () => {
      const res = await request(app)
        .post(`/appointments/book/${tmeslotId}`)
        .set('Authorization', `Bearer ${testClientToken}`)
        .expect('Content-Type', /json/)
        .expect(409);
  
      assert.strictEqual(res.body.message,"time slot is already booked you can't book again");
    });

    it('should return 404 if time slot does not exist', async () => {
      const invalidId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .post(`/appointments/book/${invalidId}`)
        .set('Authorization', `Bearer ${testClientToken}`)
        .expect('Content-Type', /json/)
        .expect(404);
  
      assert.match(res.body.message, /no time slot found/i);
    });

    it('should return 401 if no token is provided', async () => {
      await request(app)
        .post(`/appointments/book/${tmeslotId}`)
        .expect('Content-Type', /json/)
        .expect(401);
    });

  });

  // search availeble time slot

  describe('GET /search', () => {
    beforeEach(async () => {
      // Create a time first to ensure there's something to get
      const timeSlotData = {
        startTime: "12/04/2025 14:30",
        duration: 30,
      };
      const res = await request(app)
        .post('/time-slots/create')
        .set('Authorization', `Bearer ${testProviderToken}`)
        .send(timeSlotData);
        tmeslotId = res.body.results.id;
        assert(tmeslotId, 'Failed to create task in beforeEach for PUT tests');
    });

    it('should return available time slots for a provider in a given date', async () => {
      const fromDate = "12/04/2025"
      const res = await request(app)
        .get('/time-slots/search')
        .query({
          providerId: testProviderId,
          fromDate: fromDate,
          toDate: fromDate,
        })
        .expect('Content-Type', /json/)
        .expect(200);
  
      assert(Array.isArray(res.body), 'Expected an array of time slots');
      assert(res.body.length > 0, 'Expected at least one time slot returned');
  
      res.body.forEach(slot => {
        assert.strictEqual(slot.provider_id, testProviderId, 'Slot does not belong to the test provider');
        assert.strictEqual(slot.is_reserved, false, 'Slot should not be reserved');
      });
    });

    it('should return (500) if providerId is missing', async () => {
      const fromDate = "12/04/2025"
  
      const res = await request(app)
        .get('/time-slots/search')
        .query({ fromDate })
        .expect('Content-Type', /json/)
        .expect(500);
    });

    it('should return an empty array if no slots found', async () => {
      const res = await request(app)
        .get('/time-slots/search')
        .query({
          providerId: testProviderId,
          fromDate: '01/01/2030',
          toDate: '03/12/2030'
        })
        .expect('Content-Type', /json/)
        .expect(200);
  
      assert.deepStrictEqual(res.body, []);
    });


  });

  describe('DELETE /:id/delete-time-slot', () => {
    beforeEach(async () => {
      // Create a time first to ensure there's something to get
      const timeSlotData = {
        startTime: "12/04/2025 14:30",
        duration: 30,
      };
      const res = await request(app)
        .post('/time-slots/create')
        .set('Authorization', `Bearer ${testProviderToken}`)
        .send(timeSlotData);
        tmeslotId = res.body.results.id;
        assert(tmeslotId, 'Failed to create task in beforeEach for PUT tests');
    });
  
    it('should delete a time slot successfully for the authenticated provider', async () => {
      const res = await request(app)
        .delete(`/time-slots/${tmeslotId}/update-time-slot`)
        .set('Authorization', `Bearer ${testProviderToken}`)
        .expect('Content-Type', /json/)
        .expect(200);
  
      assert.strictEqual(res.body.message, 'time slot deleted successfully');
    });
  
    it('should return 400 if id is wrong', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
  
      const res = await request(app)
        .delete(`/time-slots/${fakeId}/update-time-slot`)
        .set('Authorization', `Bearer ${testProviderToken}`)
        .expect('Content-Type', /json/)
        .expect(400);
  
      assert.match(res.body.message, /not found/i);
    });
  
    it('should return 401 if no token is provided', async () => {
      await request(app)
        .delete(`/time-slots/${tmeslotId}/update-time-slot`)
        .expect('Content-Type', /json/)
        .expect(401);
    });
  });

});

