import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";

// Protected routes must reject requests that carry no auth cookie.
// The middleware bails out before any DB lookup, so this is DB-free too.

test("GET /api/v1/user/admin/me without a token is rejected", async () => {
    const res = await request(app).get("/api/v1/user/admin/me");

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Admin Not Authenticated/);
});

test("GET /api/v1/user/patient/me without a token is rejected", async () => {
    const res = await request(app).get("/api/v1/user/patient/me");

    assert.equal(res.status, 400);
    assert.match(res.body.message, /Patient Not Authenticated/);
});

test("GET /api/v1/message/getall without a token is rejected", async () => {
    const res = await request(app).get("/api/v1/message/getall");

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
});
