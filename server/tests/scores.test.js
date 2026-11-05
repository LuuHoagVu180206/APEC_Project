const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function fixture() {
    const routes = {};
    const user = { username: 'account', playHistory: [], weeklyHistory: [], highScore: 0, weeklyScore: 0, save: async () => {} };
    let savedId;
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../routes/scores.js'), 'utf8'), {
        module: { exports: {} }, console: { log() {}, warn() {}, error() {} }, require(name) {
            if (name === 'express') return { Router: () => ({ post: (url, ...handlers) => { routes[url] = handlers.at(-1); }, get() {} }) };
            if (name === 'mongoose') return require('mongoose');
            if (name === '../models/User') return { findById: async id => { savedId = id; return user; }, countDocuments: async () => 0 };
            if (name === '../models/QuestionSet') return { findByIdAndUpdate: async () => {} };
            if (name === '../verifyToken') return { verifyToken() {} };
            throw Error(name);
        }
    });
    let status, body;
    const res = { status(code) { status = code; return this; }, json(value) { body = value; } };
    return { user, save: async values => {
        await routes['/score']({ user: { id: 'authenticated-account' }, body: { score: 1234, setId: 'set', timePlayed: 10, questionsAnswered: 4, ...values } }, res);
        return { status, body, savedId };
    } };
}

test('casual save records score/history for authenticated account, not host display name', async () => {
    const h = fixture();
    const result = await h.save({ roomType: 'casual', username: 'different-host-name', isWeekly: true });
    assert.equal(result.status, 200);
    assert.equal(result.savedId, 'authenticated-account');
    assert.equal(h.user.playHistory.length, 1);
    assert.equal(h.user.playHistory[0].mode, 'casual');
    assert.equal(h.user.playHistory[0].score, 1234);
    assert.equal(h.user.highScore, 1234);
    assert.equal(h.user.weeklyScore, 0);
    await h.save({ roomType: 'casual' });
    assert.equal(h.user.playHistory.length, 1);
});

test('solo and weekly scoring still persist; unsupported mode cannot report success', async () => {
    const h = fixture();
    await h.save({ roomType: 'solo', isWeekly: true });
    assert.equal(h.user.playHistory.length, 1);
    assert.equal(h.user.weeklyHistory.length, 1);
    assert.equal(h.user.weeklyScore, 1234);
    const result = await h.save({ roomType: 'unknown' });
    assert.equal(result.status, 400);
    assert.equal(h.user.playHistory.length, 1);
});
