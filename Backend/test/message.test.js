import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";

// These tests only exercise the VALIDATION branch of the controller,
// which returns before ever touching MongoDB — so no database is needed in CI.

test("POST /api/v1/message/send rejects an empty body", async () => {
    const res = await request(app).post("/api/v1/message/send").send({});

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, "please fill full form");
});

test("POST /api/v1/message/send rejects a partially filled form", async () => {
    const res = await request(app)
        .post("/api/v1/message/send")
        .send({ firstName: "Yash", lastName: "Agrawal" }); // email/phone/message missing

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
});
