import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../app.js'; // Import the Express app
import { pool, query } from '../config/db.js'; // Import pool for cleanup

const taskTestUser = {
  email: `tasktester_${Date.now()}@example.com`,
  password: 'TaskPassword123',
  firstName: 'Task',
  lastName: 'Tester',
};
let taskTestUserId = null;
let taskTestUserToken = null;

let createdTaskId = null; // To store the ID of a task created during tests

describe('Tasks API (/tasks)', () => {

  // Setup: Create a user and log them in to get a token
  before(async () => {
    console.log('--- Setting up test user for task tests ---');
    // Clean up potential leftovers
    await query('DELETE FROM users WHERE email = $1', [taskTestUser.email]);

    // Register user
    await request(app)
      .post('/auth/register')
      .send({ ...taskTestUser, confirmPassword: taskTestUser.password }); // Include confirmPassword

    // Login user to get token
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: taskTestUser.email, password: taskTestUser.password });

    taskTestUserToken = loginRes.body.token;
    taskTestUserId = loginRes.body.user.id;

    assert(taskTestUserToken, 'Failed to get token for task tests');
    assert(taskTestUserId, 'Failed to get user ID for task tests');
    console.log(`--- Test user ${taskTestUserId} set up with token ---`);
  });

  // Cleanup: Delete the test user (tasks should cascade delete) and close pool
  after(async () => {
    if (taskTestUserId) {
      console.log(`--- Cleaning up task test user ID: ${taskTestUserId} ---`);
      await query('DELETE FROM users WHERE id = $1', [taskTestUserId]);
    }
    console.log('--- Closing database pool after task tests ---');
    // Only close the pool if it's the last test file, or manage pool lifecycle differently
    await pool.end();
  });

  // Optional: Clean tasks before each test if needed, but cascade delete might be enough
  beforeEach(async () => {
    // console.log('--- Cleaning tasks before test ---');
    // await query('DELETE FROM tasks WHERE user_id = $1', [taskTestUserId]);
    createdTaskId = null; // Reset task ID holder
  });


  describe('POST /tasks', () => {
    it('should create a new task for the authenticated user', async () => {
      const taskData = { title: 'Test Task 1', description: 'Desc 1' };
      const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${taskTestUserToken}`) // Set auth header
        .send(taskData)
        .expect('Content-Type', /json/)
        .expect(201);

      assert.strictEqual(res.body.title, taskData.title);
      assert.strictEqual(res.body.description, taskData.description);
      assert.strictEqual(res.body.user_id, taskTestUserId);
      assert.strictEqual(res.body.completed, false); // Default
      assert(res.body.id, 'Task ID should be returned');
      createdTaskId = res.body.id; // Store for later tests
    });

    it('should fail to create a task without authentication', async () => {
      const taskData = { title: 'Unauthorized Task' };
      await request(app)
        .post('/tasks')
        // No Authorization header
        .send(taskData)
        .expect('Content-Type', /json/)
        .expect(401);
    });

    it('should fail to create a task with missing title', async () => {
      const taskData = { description: 'No title here' };
      await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${taskTestUserToken}`)
        .send(taskData)
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });

  describe('GET /tasks', () => {
    beforeEach(async () => {
      // Create a task first to ensure there's something to get
      const taskData = { title: 'Task to Get', description: 'Getting this one' };
      const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${taskTestUserToken}`)
        .send(taskData);
      createdTaskId = res.body.id;
    });

    it('should get all tasks for the authenticated user', async () => {
      const res = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${taskTestUserToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      assert(Array.isArray(res.body), 'Response should be an array');
      // Ensure the task created in beforeEach is present
      assert(res.body.some(task => task.id === createdTaskId && task.title === 'Task to Get'), 'Expected task not found in list');
      // Ensure all returned tasks belong to the user
      assert(res.body.every(task => task.user_id === taskTestUserId), 'Found tasks not belonging to the test user');
    });

    it('should fail to get tasks without authentication', async () => {
      await request(app)
        .get('/tasks')
        .expect('Content-Type', /json/)
        .expect(401);
    });
  });

  describe('GET /tasks/:id', () => {
    beforeEach(async () => {
      const taskData = { title: 'Specific Task', description: 'Get by ID' };
      const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${taskTestUserToken}`)
        .send(taskData);
      createdTaskId = res.body.id;
      assert(createdTaskId, 'Failed to create task in beforeEach for GET /:id tests');
    });

    it('should get a specific task by ID for the authenticated user', async () => {
      const res = await request(app)
        .get(`/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${taskTestUserToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      assert.strictEqual(res.body.id, createdTaskId);
      assert.strictEqual(res.body.title, 'Specific Task');
      assert.strictEqual(res.body.user_id, taskTestUserId);
    });

    it('should fail to get a task without authentication', async () => {
      await request(app)
        .get(`/tasks/${createdTaskId}`)
        .expect('Content-Type', /json/)
        .expect(401);
    });

    it('should return 404 if task ID does not exist', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'; // Valid UUID format, but likely non-existent
      await request(app)
        .get(`/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${taskTestUserToken}`)
        .expect('Content-Type', /json/)
        .expect(404);
    });

    // // Advanced: Test getting a task owned by another user (requires setting up a second user)
    // it('should return 404 if task ID belongs to another user', async () => {
    //     // 1. Create another user
    //     // 2. Create a task for that other user
    //     // 3. Try to GET that task ID using taskTestUserToken
    //     // 4. Expect 404
    // });
  });

  describe('PUT /tasks/:id', () => {
    beforeEach(async () => {
      const taskData = { title: 'Task to Update', description: 'Original Desc' };
      const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${taskTestUserToken}`)
        .send(taskData);
      createdTaskId = res.body.id;
      assert(createdTaskId, 'Failed to create task in beforeEach for PUT tests');
    });

    it('should update a specific task by ID for the authenticated user', async () => {
      const updates = { title: 'Updated Title', completed: true, description: 'Updated Desc' };
      const res = await request(app)
        .put(`/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${taskTestUserToken}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(200);

      assert.strictEqual(res.body.id, createdTaskId);
      assert.strictEqual(res.body.title, updates.title);
      assert.strictEqual(res.body.description, updates.description);
      assert.strictEqual(res.body.completed, updates.completed);
      assert.strictEqual(res.body.user_id, taskTestUserId);
      assert(res.body.updated_at !== res.body.created_at, 'Updated_at should change');
    });

    it('should fail to update a task without authentication', async () => {
      const updates = { title: 'Unauthorized Update' };
      await request(app)
        .put(`/tasks/${createdTaskId}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(401);
    });

    it('should return 404 if updating a non-existent task ID', async () => {
      const updates = { title: 'Wont Update' };
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .put(`/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${taskTestUserToken}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(404); // Or 403 depending on controller logic check order
    });

    // Add tests for updating task of another user (expect 403/404)
    // Add tests for invalid update data (expect 400)
  });

  describe('DELETE /tasks/:id', () => {
    beforeEach(async () => {
      const taskData = { title: 'Task to Delete' };
      const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${taskTestUserToken}`)
        .send(taskData);
      createdTaskId = res.body.id;
      assert(createdTaskId, 'Failed to create task in beforeEach for DELETE tests');
    });

    it('should delete a specific task by ID for the authenticated user', async () => {
      await request(app)
        .delete(`/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${taskTestUserToken}`)
        .expect('Content-Type', /json/)
        .expect(200); // Expecting { message: '...' }

      // Verify it's gone
      await request(app)
        .get(`/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${taskTestUserToken}`)
        .expect(404);
    });

    it('should fail to delete a task without authentication', async () => {
      await request(app)
        .delete(`/tasks/${createdTaskId}`)
        .expect('Content-Type', /json/)
        .expect(401);
    });

    it('should return 404 if deleting a non-existent task ID', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .delete(`/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${taskTestUserToken}`)
        .expect('Content-Type', /json/)
        .expect(404); // Or 403 depending on controller logic
    });
    // Add tests for deleting task of another user (expect 403/404)
  });

});

export { }
