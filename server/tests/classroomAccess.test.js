const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const teacherId = '111111111111111111111111';
const otherId = '222222222222222222222222';
const classId = '333333333333333333333333';
const setId = '444444444444444444444444';
const secret = process.env.JWT_SECRET || 'mat_khau_bi_mat_cua_server';
const token = jwt.sign({ id: teacherId, role: 'teacher' }, secret);

function harness({ role = 'teacher', owner = teacherId, assistants = [], exists = true, setExists = true, setPublic = true, emptySet = false, initialLobbies = null } = {}) {
    const classDoc = { _id: classId, teacher: owner, teachers: assistants, classCode: 'abcdefgh', className: 'Test', questionSets: [setId] };
    const user = { _id: teacherId, role };
    const module = { exports: {} };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../classroomAccess.js'), 'utf8'), {
        module, process, require(name) {
            if (name === './models/User') return { findById: async id => ({ ...user, _id: id }) };
            if (name === './models/TeacherClass') return { findOne: async query => exists && (query._id === classId || query.classCode === 'abcdefgh') ? classDoc : null };
            return require(name);
        }
    });
    const access = module.exports;
    const roomModule = { exports: {} };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../roomSession.js'), 'utf8'), {
        module: roomModule, process, Buffer, require(name) {
            if (name === './models/User') return { findById: async id => ({ ...user, _id: id }) };
            if (name === './models/QuestionSet') return { findById: async id => id === setId && setExists ? { _id: setId, owner: otherId, title: 'Cozy quiz', isPublic: setPublic, questions: emptySet ? [] : ['question'] } : null };
            return require(name);
        }
    });
    const timers = [];
    const fakeTimeout = (fn, delay) => { const timer = { fn, delay, cleared: false }; timer.self = timer; timers.push(timer); return timer; };
    const fakeClear = timer => { if (timer) timer.cleared = true; };
    let connection;
    let saved = {};
    const broadcasts = [];
    const io = { on: (event, fn) => { if (event === 'connection') connection = fn; }, to: pin => ({ emit: (event, data) => { JSON.stringify(data); broadcasts.push({ pin, event, data }); } }), in: () => ({ socketsLeave() {}, allSockets: async () => new Set() }) };
    const apiRoutes = {};
    const express = () => ({ use() {}, get: (url, fn) => { apiRoutes[url] = fn; } });
    express.json = express.urlencoded = () => () => {};
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../index.js'), 'utf8'), {
        __dirname: path.join(__dirname, '..'), console: { log() {}, error() {} },
        process: { env: {}, on() {} }, setTimeout: fakeTimeout, clearTimeout: fakeClear,
        require(name) {
            if (name === './classroomAccess') return access;
            if (name === './roomSession') return roomModule.exports;
            if (name === './models/QuestionSet') return { findById: async () => ({ _id: setId, questions: ['q1'] }) };
            if (name === './models/Question') return { find: async () => [{ _id: 'q1', questionText: 'Room question' }] };
            if (name === 'express') return express;
            if (name === 'mongoose') return { ...mongoose, connect: () => new Promise(() => {}) };
            if (name === 'cors') return () => () => {};
            if (name === 'http') return { createServer: () => ({ listen() {} }) };
            if (name === 'socket.io') return { Server: function () { return io; } };
            if (name === 'dotenv') return { config() {} };
            if (name === 'fs') return { existsSync: () => Boolean(initialLobbies), readFileSync: () => JSON.stringify(initialLobbies), appendFileSync() {}, writeFileSync: (_, data) => { saved = JSON.parse(data); } };
            if (name.startsWith('./routes/')) return () => {};
            return require(name);
        }
    });
    function connect(id = 'socket-test') {
        const events = [], handlers = {};
        connection({ id, on: (event, fn) => { handlers[event] = fn; }, emit: (event, data) => events.push({ event, data }), join() {}, leave() {}, to: () => ({ emit() {} }) });
        const create = handlers.create_lobby;
        handlers.create_lobby = data => create({ setId, ...data });
        return { events, handlers };
    }
    const { events, handlers } = connect();
    const routes = {};
    const router = { use() {}, post() {}, put() {}, patch() {}, delete() {}, get: (url, ...fns) => { routes[url] = fns.at(-1); } };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../routes/classes.js'), 'utf8'), {
        module: { exports: {} }, console, require(name) {
            if (name === 'express') return { Router: () => router };
            if (name === '../classroomAccess') return access;
            if (name === '../verifyToken') return { verifyToken() {} };
            if (name.startsWith('../models/')) return {};
            return require(name);
        }
    });
    return { ...access, handlers, events, routes, apiRoutes, timers, broadcasts, connect, saved: () => saved };
}

for (const role of ['user', 'guest', 'admin']) {
    test(`reject ${role}, even with a teacher role in JWT/payload`, async () => {
        const h = harness({ role });
        await h.handlers.create_lobby({ roomType: 'classroom', classId: 'abcdefgh', token, role: 'teacher', userId: teacherId });
        assert.match(h.events[0].data, /Chỉ tài khoản Giáo viên/);
        assert.deepEqual(h.saved(), {});
    });
}

for (const invalidToken of ['', 'invalid', jwt.sign({ id: teacherId }, secret, { expiresIn: -1 })]) {
    test(`reject missing/invalid/expired token (${invalidToken.slice(0, 7)}) without falling back to teacher identity`, async () => {
        const h = harness();
        await h.handlers.create_lobby({ roomType: 'classroom', classId: 'abcdefgh', token: invalidToken, userId: teacherId, hostName: 'Teacher', role: 'teacher' });
        assert.equal(h.events[0].event, 'error');
        assert.deepEqual(h.saved(), {});
    });
}

test('deny teacher from another class; report nonexistent codes separately', async () => {
    const h = harness({ owner: otherId });
    await h.handlers.create_lobby({ roomType: 'classroom', classId: 'abcdefgh', token });
    assert.match(h.events.pop().data, /không quản lý/);
    await h.handlers.create_lobby({ roomType: 'classroom', classId: 'missing', token });
    assert.match(h.events.pop().data, /không tồn tại/);
    assert.deepEqual(h.saved(), {});
});

for (const options of [{}, { owner: otherId, assistants: [teacherId] }]) {
    test(`allow managing teacher (${options.assistants ? 'assistant' : 'primary'}) and authenticated reconnect`, async () => {
        const h = harness(options);
        await h.handlers.create_lobby({ roomType: 'classroom', classId: ' ABCDEFGH ', token });
        const created = h.events.find(e => e.event === 'lobby_created').data;
        assert.equal(created.classId, classId);
        assert.equal(h.saved()[created.pin].hostUserId, teacherId);
        await h.handlers.reconnect_host({ pin: created.pin, roomType: 'classroom', token, resumeToken: created.resumeToken });
        assert.equal(h.events.at(-1).event, 'host_reconnected');
        await h.handlers.reconnect_host({ pin: created.pin, roomType: 'casual' });
        assert.equal(h.events.at(-1).event, 'room_session_expired');
    });
}

test('reconnect cannot recreate an unauthorized classroom', async () => {
    const h = harness({ owner: otherId });
    await h.handlers.reconnect_host({ pin: '123456', roomType: 'classroom', classId, token });
    assert.equal(h.events.at(-1).event, 'room_session_expired');
    assert.deepEqual(h.saved(), {});
});

test('another managing teacher cannot take over an existing room', async () => {
    const h = harness({ assistants: [otherId] });
    await h.handlers.create_lobby({ roomType: 'classroom', classId, token });
    const { pin, resumeToken } = h.events[0].data;
    await h.handlers.reconnect_host({ pin, roomType: 'classroom', resumeToken, token: jwt.sign({ id: otherId }, secret) });
    assert.match(h.events.at(-1).data, /không phải giáo viên đã tạo phòng/);
    assert.equal(h.saved()[pin].hostUserId, teacherId);
});

test('validate-code API enforces authentication, ownership, nonexistent code and success', async () => {
    const h = harness();
    let status, body;
    const res = { status(value) { status = value; return this; }, json(value) { body = value; } };
    const validate = h.routes['/validate-code/:code'];
    await validate({ headers: {}, params: { code: 'abcdefgh' } }, res);
    assert.equal(status, 401);
    await validate({ headers: { token: jwt.sign({ id: otherId }, secret) }, params: { code: 'abcdefgh' } }, res);
    assert.equal(status, 403);
    await validate({ headers: { token }, params: { code: 'missing' } }, res);
    assert.equal(status, 404);
    assert.match(body.message, /không tồn tại/);
    await validate({ headers: { authorization: 'Bearer ' + token }, params: { code: 'abcdefgh' } }, res);
    assert.equal(status, 200);
    assert.equal(body.valid, true);
    assert.equal(body.classId, classId);
});

test('casual rooms still work without a teacher account', async () => {
    const h = harness({ role: 'user' });
    await h.handlers.create_lobby({ roomType: 'casual' });
    assert.equal(h.events[0].event, 'lobby_created');
    assert.equal(h.events[0].data.classId, null);
});

for (const options of [
    { setId: null }, { setId: 'invalid' }, { setId: otherId },
    { fixture: { emptySet: true } }, { fixture: { setPublic: false } }
]) {
    test(`reject an unusable question set: ${JSON.stringify(options)}`, async () => {
        const h = harness(options.fixture);
        await h.handlers.create_lobby({ roomType: 'casual', ...('setId' in options ? { setId: options.setId } : {}) });
        assert.equal(h.events.at(-1).event, 'error');
        assert.deepEqual(h.saved(), {});
    });
}

test('casual host keeps authenticated role; host is a separate flag', async () => {
    for (const role of ['user', 'teacher', 'admin']) {
        const h = harness({ role });
        await h.handlers.create_lobby({ roomType: 'casual', token, role: 'teacher' });
        const created = h.events[0].data;
        assert.equal(created.players[0].role, role);
        assert.equal(created.players[0].isHost, true);
        assert.equal(created.players[0].isParticipating, true);
        assert.equal(created.setTitle, 'Cozy quiz');
    }
    const h = harness();
    await h.handlers.create_lobby({ roomType: 'casual', role: 'teacher' });
    assert.equal(h.events[0].data.players[0].role, 'guest');
});

test('host refresh reconnects the existing roster with one host and cancels expiry', async () => {
    const h = harness();
    await h.handlers.create_lobby({ roomType: 'casual', hostName: 'Host' });
    const created = h.events[0].data;
    const player = h.connect('player-socket');
    await player.handlers.join_lobby({ pin: created.pin, playerName: 'Player', username: 'Player' });
    await h.handlers.disconnect('refresh');
    assert.equal(h.saved()[created.pin].hostConnected, false);
    const expiry = h.timers.at(-1);
    assert.ok(expiry.delay > 0 && expiry.delay <= 90000);
    const refreshed = h.connect('new-host-socket');
    await refreshed.handlers.reconnect_host({ pin: created.pin, resumeToken: created.resumeToken });
    const restored = refreshed.events[0];
    assert.equal(restored.event, 'host_reconnected');
    assert.equal(restored.data.players.length, 2);
    assert.equal(restored.data.players.filter(p => p.isHost).length, 1);
    assert.equal(h.saved()[created.pin].hostId, 'new-host-socket');
    assert.equal(expiry.cleared, true);
    assert.equal(JSON.stringify(restored.data.players).includes('resumeToken'), false);
    expiry.fn(); // A stale timer must never destroy the restored room.
    assert.equal(h.saved()[created.pin].hostConnected, true);
});

test('player refresh preserves identity and score without duplicating a player', async () => {
    const h = harness();
    await h.handlers.create_lobby({ roomType: 'casual' });
    const created = h.events[0].data;
    const player = h.connect('player-old');
    await player.handlers.join_lobby({ pin: created.pin, playerName: 'Player' });
    const joined = player.events[0].data;
    await h.handlers.start_game(created.pin);
    await player.handlers.submit_score({ pin: created.pin, score: 42, timePlayed: 5, questionsAnswered: 2, completed: false });
    await player.handlers.disconnect('refresh');
    const refreshed = h.connect('player-new');
    await refreshed.handlers.reconnect_lobby({ pin: created.pin, playerId: joined.playerId, resumeToken: joined.resumeToken });
    const restored = refreshed.events[0];
    assert.equal(restored.event, 'reconnect_success');
    assert.equal(restored.data.gameState, 'PLAYING');
    assert.equal(restored.data.players.length, 2);
    assert.equal(restored.data.players.find(p => p.playerId === joined.playerId).score, 42);
    const fake = h.connect('impostor');
    await fake.handlers.reconnect_lobby({ pin: created.pin, playerId: joined.playerId, username: 'Player' });
    assert.equal(fake.events[0].event, 'room_session_expired');
});

test('host absence expires the room and reconnect cannot resurrect it', async () => {
    const h = harness();
    await h.handlers.create_lobby({ roomType: 'casual' });
    const created = h.events[0].data;
    await h.handlers.disconnect('closed');
    h.timers.at(-1).fn();
    assert.deepEqual(h.saved(), {});
    assert.equal(h.broadcasts.some(e => e.event === 'room_destroyed'), true);
    const refreshed = h.connect();
    await refreshed.handlers.reconnect_host({ pin: created.pin, resumeToken: created.resumeToken });
    assert.equal(refreshed.events[0].event, 'room_session_expired');
    assert.deepEqual(h.saved(), {});
});

test('backend restart also expires orphaned rooms', async () => {
    const h = harness({ initialLobbies: { '123456': { createdAt: Date.now(), players: [], hostConnected: true } } });
    assert.equal(h.timers.length, 1);
    h.timers[0].fn();
    assert.deepEqual(h.saved(), {});
});

test('room questions endpoint denies callers without a room session', async () => {
    const h = harness();
    let status;
    const res = { status(value) { status = value; return this; }, json() {} };
    await h.apiRoutes['/api/rooms/:pin/questions']({ params: { pin: 'missing' }, headers: {} }, res);
    assert.equal(status, 403);
});

test('private class questions load only with an accepted member session', async () => {
    const h = harness({ setPublic: false });
    await h.handlers.create_lobby({ roomType: 'classroom', classId, token });
    const created = h.events[0].data;
    let body, status;
    const res = { status(value) { status = value; return this; }, json(value) { body = value; } };
    await h.apiRoutes['/api/rooms/:pin/questions']({ params: { pin: created.pin }, headers: { 'x-room-token': created.resumeToken } }, res);
    assert.equal(body.questions[0].questionText, 'Room question');
    await h.apiRoutes['/api/rooms/:pin/questions']({ params: { pin: created.pin }, headers: { 'x-room-token': 'é'.repeat(64) } }, res);
    assert.equal(status, 403);
});

test('member can leave; only host can kick and revoked sessions cannot reconnect', async () => {
 const h = harness();
 await h.handlers.create_lobby({roomType:'casual'});
 const pin=h.events[0].data.pin;
 const member=h.connect('member');
 await member.handlers.join_lobby({pin,playerName:'Guest123'});
 const joined=member.events[0].data;
 member.handlers.kick_member({pin,playerId:h.events[0].data.playerId});
 assert.equal(h.saved()[pin].players.length,2);
 h.handlers.kick_member({pin,playerId:joined.playerId});
 assert.equal(h.saved()[pin].players.length,1);
 member.handlers.reconnect_lobby({pin,playerId:joined.playerId,resumeToken:joined.resumeToken});
 assert.equal(member.events.at(-1).event,'room_session_expired');
 await member.handlers.join_lobby({pin,playerName:'Guest123'});
 member.handlers.leave_lobby({pin});
 assert.equal(h.saved()[pin].players.length,1);
});

test('starting the match blocks new joins but permits an existing member to reconnect', async () => {
    const h = harness();
    await h.handlers.create_lobby({ roomType: 'casual' });
    const pin = h.events[0].data.pin;
    const member = h.connect('original-member');
    await member.handlers.join_lobby({ pin, playerName: 'Member' });
    const joined = member.events[0].data;
    h.handlers.start_game(pin);
    const late = h.connect('late-member');
    await late.handlers.join_lobby({ pin, playerName: 'Late' });
    assert.equal(late.events[0].event, 'error');
    assert.match(late.events[0].data, /đã bắt đầu/);
    assert.equal(h.saved()[pin].players.length, 2);
    const reconnected = h.connect('reconnected-member');
    reconnected.handlers.reconnect_lobby({ pin, playerId: joined.playerId, resumeToken: joined.resumeToken });
    assert.equal(reconnected.events[0].event, 'reconnect_success');
    assert.equal(h.saved()[pin].players.length, 2);
});

test('finished rooms also reject new members', async () => {
    const h = harness({ initialLobbies: { '123456': { createdAt: Date.now(), gameState: 'FINISHED', players: [] } } });
    await h.handlers.join_lobby({ pin: '123456', playerName: 'Late' });
    assert.equal(h.events[0].event, 'error');
    assert.match(h.events[0].data, /đã kết thúc/);
});

for (const event of ['request_end_game', 'trigger_end_game']) {
 test(event + ' finishes while a member is refreshing, without serializing reconnect timers', async () => {
  const h = harness();
  await h.handlers.create_lobby({roomType:'casual'});
  const pin = h.events[0].data.pin;
  const member = h.connect('refreshing-member');
  await member.handlers.join_lobby({pin,playerName:'Member'});
  const joined = member.events[0].data;
  h.handlers.start_game(pin);
  member.handlers.disconnect('refresh');
  await h.handlers[event](pin);
  assert.equal(h.saved()[pin].gameState, 'FINISHED');
  assert.ok(h.broadcasts.some(e=>e.event==='game_ended'));
  const board = h.broadcasts.filter(e=>e.event==='live_leaderboard_update').at(-1).data;
  assert.equal(board.length,2);
  assert.ok(board.every(p=>!('disconnectTimeout' in p)));
  const refreshed = h.connect('refreshed-member');
  refreshed.handlers.reconnect_lobby({pin,playerId:joined.playerId,resumeToken:joined.resumeToken});
  assert.equal(refreshed.events[0].data.gameState,'FINISHED');
 });
}
