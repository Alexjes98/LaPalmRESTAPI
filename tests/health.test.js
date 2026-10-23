const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const makeApp = require("../src/app.js");

const app = makeApp();

describe("Health & Core Server Middlewares", () => {
  it("GET / returns 200 OK with health check body", async () => {
    const res = await request(app).get("/");
    assert.equal(res.status, 200);
    assert.equal(res.text, "API RUNNIN CORRECTLY!");
  });

  it("GET / non-existent route returns 404 handler", async () => {
    const res = await request(app).get("/api/non-existent-route-404");
    assert.equal(res.status, 404);
    assert.equal(res.text, "Sorry can't find that!");
  });

  it("Helmet sets standard security headers", async () => {
    const res = await request(app).get("/");
    assert.equal(res.headers["x-content-type-options"], "nosniff");
    assert.equal(res.headers["x-frame-options"], "SAMEORIGIN");
    assert.ok(res.headers["content-security-policy"]);
  });

  it("CORS headers are present on requests", async () => {
    const res = await request(app).get("/");
    assert.equal(res.headers["access-control-allow-origin"], "*");
  });

  it("Rate limit headers are attached", async () => {
    const res = await request(app).get("/");
    assert.ok(res.headers["ratelimit-limit"]);
    assert.ok(res.headers["ratelimit-remaining"]);
    assert.equal(res.headers["ratelimit-limit"], "100");
  });

  it("Custom response.json formatter wraps responses with status, message, and data", () => {
    let output = "";
    const mockRes = {
      statusCode: 200,
      contentType() {
        return this;
      },
      end(data) {
        output = data;
      },
    };
    app.response.json.call(mockRes, {
      message: "Testing formatter",
      data: { success: true },
    });
    const parsed = JSON.parse(output);
    assert.equal(parsed.status, 200);
    assert.equal(parsed.message, "Testing formatter");
    assert.deepEqual(parsed.data, { success: true });
  });
});
