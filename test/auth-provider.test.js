import { describe, it, before, after } from "node:test"
import assert from "node:assert"
import request from 'supertest';
import app from "../app.js"

import { query, pool, connectToDb, initialzeDbSchema } from "../config/db.js"

// Use a distinct email for testing to avoid collisions
const testUserEmail = `test_${Date.now()}@example.com`;
const testUserPassword = 'TestPassword123';
const testPhone = "+237675577884"
const testAdresse = "douala"
const testWork = "Doctor"
const testFullName = "nkanaou brice"
const testAboutMyself = "my name is dwekldewdjoiwcmlkewcnwkjc wckjnckjcenreckjrec cecre"
let testProviderId = null;
let testProviderToken = null;


describe('Authentication API (/auth-service-provider)', () => {

  // Clean up the test user before running tests (in case previous run failed)
  before(async () => {
    console.log('--- Cleaning up potential leftover test user ---');
    await connectToDb()
    await initialzeDbSchema()
    try {
      await query('DELETE FROM service_providers WHERE email = $1', [testUserEmail]);
    } catch (err) {
      console.error("Cleanup error (client might not exist, ignoring):", err.message);
    }
  });

  // Close the database pool after all tests in this file are done
  after(async () => {
    console.log('--- Closing database pool ---');
    await pool.end();
  });

  describe('POST /register', () => {
    it('should register a new client successfully', async () => {
      const res = await request(app)
        .post('/auth-service-provider/register')
        .send({
          fullName: testFullName,
          email: testUserEmail,
          password: testUserPassword,
          adresse:testAdresse,
          phone:testPhone,
          work:testWork,
          work:testAboutMyself
        })
        .expect('Content-Type', "application/json; charset=utf-8")
        .expect(201);

      assert(res.body.message, "servive provider registered successfully");
      assert(res.body.providerId, 'provider object should be returned');
      assert(res.body.providerId.id, 'provider ID should be returned');
      testProviderId = res.body.providerId.id; // Save for later tests
    });

    it('should fail to register with an existing email', async () => {
      const res = await request(app)
        .post('/auth-service-provider/register')
        .send({
          firstName: 'Another',
          lastName: 'User',
          email: testUserEmail, // Use the same email
          password: 'AnotherPassword1',
          adresse:testAdresse,
          phone:testPhone,
        })
        .expect('Content-Type', "application/json; charset=utf-8")
        .expect(409); // Conflict

      assert.strictEqual(res.body.message, "Email already in use");
    });
  });

  describe('POST /login', () => {
    it('should login the registered user successfully and return a token', async () => {
      // Ensure user is registered from previous test block
      assert(testProviderId, 'Test user ID should exist from registration test');

      const res = await request(app)
        .post('/auth-service-provider/login')
        .send({
          email: testUserEmail,
          password: testUserPassword,
        })
        .expect('Content-Type', "application/json; charset=utf-8")
        .expect(200);

      assert.strictEqual(res.body.message, 'Login Successfull!');
      assert(res.body.token, 'JWT token should be returned');
      assert.strictEqual(res.body.client.email, testUserEmail);
      assert.strictEqual(res.body.client.id, testProviderId);
      testProviderToken = res.body.token; // Save token for authenticated tests
    });

    it('should fail to login with incorrect password', async () => {
      const res = await request(app)
        .post('/auth-service-provider/login')
        .send({
          email: testUserEmail,
          password: 'WrongPassword1', // Incorrect password
        })
        .expect('Content-Type', "application/json; charset=utf-8")
        .expect(401); // Unauthorized

      assert.strictEqual(res.body.message, "Invalid password");
    });

    it('should fail to login with non-existent email', async () => {
      const res = await request(app)
        .post('/auth-service-provider/login')
        .send({
          email: 'nosuchuser@example.com',
          password: testUserPassword,
        })
        .expect('Content-Type', "application/json; charset=utf-8")
        .expect(401);

      assert.strictEqual(res.body.message, "Invalid Credentials");
    });
  });

  // Cleanup: Delete the test user after tests in this file run
  // Note: 'after' runs even if tests fail
  after(async () => {
    if (testProviderId) {
      console.log(`--- Cleaning up test user ID: ${testProviderId} ---`);
      try {
        await query('DELETE FROM service_providers WHERE id = $1', [testProviderId]);
      } catch (err) {
        console.error("Cleanup error:", err.message);
      }
    }
  });
});

export { }
