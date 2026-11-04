const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const jwt = require("jsonwebtoken");

process.env.SECRET_KEY = process.env.SECRET_KEY || "test_jwt_secret_key_12345";

const makeApp = require("../src/app.js");
const db = require("../src/models");
const {
  computeSimpleAverageFromSubmissions,
} = require("../src/controllers/organization_censo.js");

const app = makeApp();

function createBearerToken(payload) {
  return (
    "Bearer " +
    jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: "1h",
    })
  );
}

describe("Organization & Censo Pre Cosecha Backend Suite", () => {
  describe("computeSimpleAverageFromSubmissions", () => {
    it("Computes accurate simple arithmetic mean across two same-day census submissions", () => {
      const submissions = [
        {
          usuario: "user1@example.com",
          hour: "08:15",
          finalizedTime: "08:45",
          palmsCounted: 20,
          includesPintones: true,
          densidadConPintones: 2.0,
          hojasConPintones: 1.5,
          pepasConPintones: 4.0,
          densidadSinPintones: 1.5,
          hojasSinPintones: 1.2,
          pepasSinPintones: 3.0,
          totalRff: 40,
          totalHojas: 60,
          totalPepas: 80,
          longitud: -74.1,
          latitud: 4.6,
        },
        {
          usuario: "user2@example.com",
          hour: "10:00",
          finalizedTime: "10:30",
          palmsCounted: 30,
          includesPintones: true,
          densidadConPintones: 3.0,
          hojasConPintones: 2.5,
          pepasConPintones: 6.0,
          densidadSinPintones: 2.5,
          hojasSinPintones: 1.8,
          pepasSinPintones: 5.0,
          totalRff: 90,
          totalHojas: 225,
          totalPepas: 270,
          longitud: -74.3,
          latitud: 4.8,
        },
      ];

      const avg = computeSimpleAverageFromSubmissions(submissions);

      assert.equal(avg.submissionCount, 2);
      assert.equal(avg.palmsCounted, 25);
      assert.equal(avg.densidadConPintones, 2.5);
      assert.equal(avg.hojasConPintones, 2.0);
      assert.equal(avg.pepasConPintones, 5.0);
      assert.equal(avg.densidadSinPintones, 2.0);
      assert.equal(avg.hojasSinPintones, 1.5);
      assert.equal(avg.pepasSinPintones, 4.0);
      assert.equal(avg.totalRff, 65);
      assert.equal(avg.totalHojas, 143);
      assert.equal(avg.totalPepas, 175);
      assert.equal(avg.hour, "08:15");
      assert.equal(avg.finalizedTime, "10:30");
      assert.deepEqual(avg.contributors, [
        "user1@example.com",
        "user2@example.com",
      ]);
      assert.ok(Math.abs(avg.longitud - -74.2) < 1e-6);
      assert.ok(Math.abs(avg.latitud - 4.7) < 1e-6);
    });

    it("Computes accurate simple average across 3 submissions without weighting distortion", () => {
      const submissions = [
        {
          usuario: "u1",
          hour: "07:00",
          finalizedTime: "07:20",
          palmsCounted: 10,
          includesPintones: true,
          densidadConPintones: 1.0,
          hojasConPintones: 1.0,
          pepasConPintones: 2.0,
          densidadSinPintones: 1.0,
          hojasSinPintones: 1.0,
          pepasSinPintones: 2.0,
          totalRff: 10,
          totalHojas: 10,
          totalPepas: 10,
        },
        {
          usuario: "u2",
          hour: "08:00",
          finalizedTime: "08:20",
          palmsCounted: 20,
          includesPintones: true,
          densidadConPintones: 2.0,
          hojasConPintones: 2.0,
          pepasConPintones: 4.0,
          densidadSinPintones: 2.0,
          hojasSinPintones: 2.0,
          pepasSinPintones: 4.0,
          totalRff: 40,
          totalHojas: 80,
          totalPepas: 80,
        },
        {
          usuario: "u3",
          hour: "09:00",
          finalizedTime: "09:20",
          palmsCounted: 30,
          includesPintones: true,
          densidadConPintones: 6.0,
          hojasConPintones: 3.0,
          pepasConPintones: 6.0,
          densidadSinPintones: 6.0,
          hojasSinPintones: 3.0,
          pepasSinPintones: 6.0,
          totalRff: 100,
          totalHojas: 210,
          totalPepas: 210,
        },
      ];

      const avg = computeSimpleAverageFromSubmissions(submissions);
      assert.equal(avg.submissionCount, 3);
      assert.equal(avg.densidadConPintones, 3.0);
      assert.equal(avg.hojasConPintones, 2.0);
      assert.equal(avg.pepasConPintones, 4.0);
      assert.equal(avg.palmsCounted, 20);
      assert.equal(avg.totalRff, 50);
    });
  });

  describe("Organization Routes Auth & Role Enforcement", () => {
    let originalFindOneMember;
    let originalSequelizeTransaction;

    beforeEach(() => {
      originalFindOneMember = db.OrganizationMember.findOne;
      originalSequelizeTransaction = db.sequelize.transaction;
      db.sequelize.transaction = async () => ({
        commit: async () => {},
        rollback: async () => {},
      });
    });

    afterEach(() => {
      db.OrganizationMember.findOne = originalFindOneMember;
      db.sequelize.transaction = originalSequelizeTransaction;
    });

    it("Rejects unauthenticated requests to /api/organizations with 401", async () => {
      const res = await request(app).get("/api/organizations");
      assert.equal(res.status, 401);
    });

    it("Rejects POST /api/organizations when name is empty with 400", async () => {
      const token = createBearerToken({
        userId: 1,
        username: "owner",
        email: "owner@example.com",
      });
      const res = await request(app)
        .post("/api/organizations")
        .set("Authorization", token)
        .send({ name: "   " });

      assert.equal(res.status, 400);
    });

    it("Blocks invited MEMBER from deleting a lote (403 Forbidden)", async () => {
      db.OrganizationMember.findOne = async () => ({
        id: 10,
        organizationId: 5,
        userId: 2,
        role: "MEMBER",
        status: "ACCEPTED",
      });

      const memberToken = createBearerToken({
        userId: 2,
        username: "member",
        email: "member@example.com",
      });

      const res = await request(app)
        .delete("/api/organizations/5/lotes/LOTE-01")
        .set("Authorization", memberToken);

      assert.equal(res.status, 403);
    });

    it("Blocks invited MEMBER from deleting a census result (403 Forbidden)", async () => {
      db.OrganizationMember.findOne = async () => ({
        id: 10,
        organizationId: 5,
        userId: 2,
        role: "MEMBER",
        status: "ACCEPTED",
      });

      const memberToken = createBearerToken({
        userId: 2,
        username: "member",
        email: "member@example.com",
      });

      const res = await request(app)
        .delete("/api/organizations/5/lotes/LOTE-01/censos/daily_12")
        .set("Authorization", memberToken);

      assert.equal(res.status, 403);
    });

    it("Blocks invited MEMBER from creating a new lote (403 Forbidden)", async () => {
      db.OrganizationMember.findOne = async () => ({
        id: 10,
        organizationId: 5,
        userId: 2,
        role: "MEMBER",
        status: "ACCEPTED",
      });

      const memberToken = createBearerToken({
        userId: 2,
        username: "member",
        email: "member@example.com",
      });

      const res = await request(app)
        .post("/api/organizations/5/lotes")
        .set("Authorization", memberToken)
        .send({ code: "LOTE-02" });

      assert.equal(res.status, 403);
    });
  });
});

