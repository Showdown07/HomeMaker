import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";
import Review from "../models/Review.js";
import Notification from "../models/Notification.js";
import LocalContact from "../models/LocalContact.js";
import { createAuthFixtures } from "./helpers.js";
import { clearTestDatabase, setupTestDatabase, teardownTestDatabase } from "./setup.js";

const tests = [];

const addTest = (name, fn) => {
  tests.push({ name, fn });
};

addTest("registers a new user", async () => {
  const response = await request(app).post("/api/auth/register").send({
    name: "Test User",
    email: "test@example.com",
    password: "password123",
    role: "user",
  });

  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.email, "test@example.com");
});

addTest("rejects invalid email during login", async () => {
  const response = await request(app).post("/api/auth/login").send({
    email: "bad-email",
    password: "password123",
  });

  assert.equal(response.status, 400);
  assert.match(response.body.message, /valid email/i);
});

addTest("creates a booking, updates status, and stores notifications", async () => {
  const { provider, user, service } = await createAuthFixtures();

  const userLogin = await request(app).post("/api/auth/login").send({
    email: user.email,
    password: "password123",
  });
  const providerLogin = await request(app).post("/api/auth/login").send({
    email: provider.email,
    password: "password123",
  });

  const bookingResponse = await request(app)
    .post("/api/bookings")
    .set("Authorization", `Bearer ${userLogin.body.data.token}`)
    .send({
      serviceId: service._id.toString(),
      bookingDate: "2026-04-13",
      slotStart: "10:00",
      slotEnd: "11:00",
      address: "Demo Address",
      city: "Bengaluru",
      pincode: "560001",
      notes: "Please bring supplies",
    });

  assert.equal(bookingResponse.status, 201);
  assert.equal(bookingResponse.body.data.payment.status, "paid");

  const statusResponse = await request(app)
    .put(`/api/bookings/${bookingResponse.body.data._id}/status`)
    .set("Authorization", `Bearer ${providerLogin.body.data.token}`)
    .send({ status: "confirmed" });

  assert.equal(statusResponse.status, 200);
  assert.equal(statusResponse.body.data.status, "confirmed");

  const providerNotifications = await Notification.find({ recipient: provider._id });
  const userNotifications = await Notification.find({ recipient: user._id });

  assert.equal(providerNotifications.length, 1);
  assert.equal(userNotifications.length, 1);
});

addTest("allows a completed booking to be reviewed exactly once", async () => {
  const { provider, user, service } = await createAuthFixtures();

  const userLogin = await request(app).post("/api/auth/login").send({
    email: user.email,
    password: "password123",
  });
  const providerLogin = await request(app).post("/api/auth/login").send({
    email: provider.email,
    password: "password123",
  });

  const bookingResponse = await request(app)
    .post("/api/bookings")
    .set("Authorization", `Bearer ${userLogin.body.data.token}`)
    .send({
      serviceId: service._id.toString(),
      bookingDate: "2026-04-14",
      slotStart: "10:00",
      slotEnd: "11:00",
      address: "Demo Address",
      city: "Bengaluru",
      pincode: "560001",
    });

  await request(app)
    .put(`/api/bookings/${bookingResponse.body.data._id}/status`)
    .set("Authorization", `Bearer ${providerLogin.body.data.token}`)
    .send({ status: "completed" });

  const reviewResponse = await request(app)
    .post("/api/reviews")
    .set("Authorization", `Bearer ${userLogin.body.data.token}`)
    .send({
      bookingId: bookingResponse.body.data._id,
      rating: 5,
      comment: "Excellent service",
    });

  assert.equal(reviewResponse.status, 201);

  const duplicateReviewResponse = await request(app)
    .post("/api/reviews")
    .set("Authorization", `Bearer ${userLogin.body.data.token}`)
    .send({
      bookingId: bookingResponse.body.data._id,
      rating: 4,
      comment: "Second review",
    });

  assert.equal(duplicateReviewResponse.status, 400);
  assert.match(duplicateReviewResponse.body.message, /already been submitted/i);

  const reviews = await Review.find({});
  assert.equal(reviews.length, 1);
});

addTest("rejects invalid booking slot format", async () => {
  const { user, service } = await createAuthFixtures();

  const userLogin = await request(app).post("/api/auth/login").send({
    email: user.email,
    password: "password123",
  });

  const response = await request(app)
    .post("/api/bookings")
    .set("Authorization", `Bearer ${userLogin.body.data.token}`)
    .send({
      serviceId: service._id.toString(),
      bookingDate: "2026-04-14",
      slotStart: "1000",
      slotEnd: "11:00",
      address: "Demo Address",
    });

  assert.equal(response.status, 400);
  assert.match(response.body.message, /HH:MM/i);
});

addTest("admin can add a local contact and users can see it in the public directory", async () => {
  const { admin } = await createAuthFixtures();

  const adminLogin = await request(app).post("/api/auth/login").send({
    email: admin.email,
    password: "password123",
  });

  const createResponse = await request(app)
    .post("/api/admin/local-contacts")
    .set("Authorization", `Bearer ${adminLogin.body.data.token}`)
    .send({
      name: "Metro Electric Works",
      category: "electrician",
      phone: "9000011111",
      city: "Bengaluru",
      pincode: "560001",
      area: "Indiranagar",
      notes: "Field collected offline electrician contact",
    });

  assert.equal(createResponse.status, 201);

  const publicResponse = await request(app).get("/api/local-contacts").query({
    city: "Bengaluru",
    pincode: "560001",
    category: "electrician",
  });

  assert.equal(publicResponse.status, 200);
  assert.equal(publicResponse.body.data.length, 1);

  const contacts = await LocalContact.find({});
  assert.equal(contacts.length, 1);
});

addTest("user can submit a help request and admin can review it", async () => {
  const { user, admin } = await createAuthFixtures();

  const userLogin = await request(app).post("/api/auth/login").send({
    email: user.email,
    password: "password123",
  });
  const adminLogin = await request(app).post("/api/auth/login").send({
    email: admin.email,
    password: "password123",
  });

  const createResponse = await request(app)
    .post("/api/help-requests")
    .set("Authorization", `Bearer ${userLogin.body.data.token}`)
    .send({
      category: "electrician",
      title: "Urgent wiring issue",
      description: "Need an electrician for a short circuit issue",
      city: "Bengaluru",
      pincode: "560001",
      area: "Indiranagar",
      address: "12 Demo Street",
      phone: "9999999999",
      lat: 12.9784,
      lng: 77.6408,
    });

  assert.equal(createResponse.status, 201);

  const adminListResponse = await request(app)
    .get("/api/admin/help-requests")
    .set("Authorization", `Bearer ${adminLogin.body.data.token}`);

  assert.equal(adminListResponse.status, 200);
  assert.equal(adminListResponse.body.data.length, 1);

  const statusUpdateResponse = await request(app)
    .put(`/api/admin/help-requests/${createResponse.body.data._id}/status`)
    .set("Authorization", `Bearer ${adminLogin.body.data.token}`)
    .send({ status: "reviewing" });

  assert.equal(statusUpdateResponse.status, 200);
  assert.equal(statusUpdateResponse.body.data.status, "reviewing");
});

let failures = 0;

try {
  await setupTestDatabase();

  for (const { name, fn } of tests) {
    await clearTestDatabase();
    try {
      await fn();
      console.log(`PASS ${name}`);
    } catch (error) {
      failures += 1;
      console.error(`FAIL ${name}`);
      console.error(error);
    }
  }
} finally {
  await teardownTestDatabase();
}

if (failures > 0) {
  process.exit(1);
}

console.log(`\n${tests.length} tests passed`);
