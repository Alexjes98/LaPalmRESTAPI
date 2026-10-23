const { describe, it, before } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const validateToken = require("../src/middlewares/auth.js");
const makeApp = require("../src/app.js");

const TEST_SECRET = "test_jwt_secret_key_12345";
process.env.SECRET_KEY = process.env.SECRET_KEY || TEST_SECRET;

const app = makeApp();

describe("Authentication Middleware (validateToken)", () => {
  it("Rejects request without Authorization header with 401", async () => {
    let status = null;
    let responseBody = null;
    const req = { headers: {} };
    const res = {
      status(s) {
        status = s;
        return {
          send(body) {
            responseBody = body;
          },
        };
      },
    };
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    validateToken(req, res, next);
    assert.equal(status, 401);
    assert.equal(responseBody, "Access denied, token missing!");
    assert.equal(nextCalled, false);
  });

  it("Rejects request with invalid or tampered token with 400", async () => {
    let status = null;
    let responseBody = null;
    const req = {
      headers: {
        authorization: "Bearer invalid.token.payload",
      },
    };
    const res = {
      status(s) {
        status = s;
        return {
          send(body) {
            responseBody = body;
          },
        };
      },
    };
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    validateToken(req, res, next);
    assert.equal(status, 400);
    assert.equal(responseBody, "Invalid token!");
    assert.equal(nextCalled, false);
  });

  it("Rejects request with expired token with 400", async () => {
    const expiredToken = jwt.sign(
      { userId: 1, username: "expired" },
      process.env.SECRET_KEY,
      { expiresIn: "-1s" }
    );

    let status = null;
    let responseBody = null;
    const req = {
      headers: {
        authorization: `Bearer ${expiredToken}`,
      },
    };
    const res = {
      status(s) {
        status = s;
        return {
          send(body) {
            responseBody = body;
          },
        };
      },
    };
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    validateToken(req, res, next);
    assert.equal(status, 400);
    assert.equal(responseBody, "Invalid token!");
    assert.equal(nextCalled, false);
  });

  it("Accepts valid JWT, attaches user and calls next()", async () => {
    const validToken = jwt.sign(
      { userId: 42, username: "secureuser" },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    const req = {
      headers: {
        authorization: `Bearer ${validToken}`,
      },
    };
    const res = {};
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    validateToken(req, res, next);
    assert.equal(nextCalled, true);
    assert.equal(req.authenticated, true);
    assert.equal(req.user.userId, 42);
    assert.equal(req.user.username, "secureuser");
  });
});

describe("Route Protection Integration (All Protected Resources)", () => {
  const protectedRoutes = [
    "/api/users",
    "/api/companies",
    "/api/gondolas",
    "/api/fronts",
    "/api/positions",
    "/api/equipments",
    "/api/employees",
    "/api/batches",
    "/api/daily_registers",
  ];

  for (const route of protectedRoutes) {
    it(`Blocks unauthenticated access to ${route} with 401`, async () => {
      const res = await request(app).get(route);
      assert.equal(res.status, 401);
      assert.match(res.text, /Access denied, token missing!/i);
    });
  }
});
