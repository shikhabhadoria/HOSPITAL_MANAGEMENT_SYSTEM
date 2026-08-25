// A "test file" is just a file that describes what the code SHOULD do.
// We use Node's built-in test runner (`node --test`) + supertest,
// which lets us call our Express app without actually starting a server.
import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";

test("GET /health returns 200 and success:true", async () => {
    const res = await request(app).get("/health");

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, "server is healthy");
});

test("unknown route returns 404", async () => {
    const res = await request(app).get("/this-route-does-not-exist");

    assert.equal(res.status, 404);
});
