const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const makeApp = require("../src/app.js");

const app = makeApp();
process.env.SECRET_KEY = process.env.SECRET_KEY || "test_jwt_secret_key_12345";

describe("Auth Controller Endpoint Validation", () => {
  describe("POST /api/auth/register", () => {
    it("Rejects request with empty body (400 All input is required)", async () => {
      const res = await request(app).post("/api/auth/register").send({});
      assert.equal(res.status, 400);
    });

    it("Rejects request when mandatory fields are missing", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "john" });
      assert.equal(res.status, 400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("Rejects login when username or password is missing (400 All input is required)", async () => {
      const res = await request(app).post("/api/auth/login").send({});
      assert.equal(res.status, 400);
      assert.equal(res.text, "All input is required");
    });

    it("Rejects login when only username is supplied", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "testuser" });
      assert.equal(res.status, 400);
      assert.equal(res.text, "All input is required");
    });
  });

  describe("POST /api/auth/resetPasswordRequest", () => {
    it("Rejects request without email with 400 Email is required", async () => {
      const res = await request(app)
        .post("/api/auth/resetPasswordRequest")
        .send({});
      assert.equal(res.status, 400);
      assert.equal(res.text, "Email is required");
    });
  });
});

describe("Password Hashing & Cryptographic Security", () => {
  it("Bcrypt generates valid salt and hash", async () => {
    const password = "SuperSecretPassword123!";
    const hash = await bcrypt.hash(password, 10);

    assert.ok(hash.startsWith("$2b$10$") || hash.startsWith("$2a$10$"));
    assert.equal(hash.length, 60);

    const matches = await bcrypt.compare(password, hash);
    assert.equal(matches, true);

    const wrongMatches = await bcrypt.compare("WrongPassword", hash);
    assert.equal(wrongMatches, false);
  });

  it("JWT generates token with valid signature and expiration", () => {
    const payload = { userId: 99, username: "admin" };
    const token = jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    assert.equal(decoded.userId, 99);
    assert.equal(decoded.username, "admin");
    assert.ok(decoded.exp > Math.floor(Date.now() / 1000));

    assert.throws(
      () => {
        jwt.verify(token, "different_secret_key");
      },
      { name: "JsonWebTokenError" }
    );
  });
});
