const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

// Exercise the exact JavaScript run by Godot's JavaScriptBridge.
const godotRoot = process.env.GODOT_PROJECT_PATH || path.resolve(__dirname, '../../../DEMO_MAZE_FOLDER/DEMOMAZE');
const source = fs.readFileSync(path.join(godotRoot, 'LobbyScene/lobby_control.gd'), 'utf8');
const script = source.match(/var js_check = """([\s\S]*?)"""/)[1];
function context(url) {
    const target = { location: { href: url, get search() { return new URL(this.href).search; } } };
    target.history = { state: { routerKey: 'preserved' }, replaceState(state, _, next) { this.state = state; target.location.href = next; } };
    return target;
}
function boot(frame, parent, storage) {
    frame.parent = parent;
    return JSON.parse(vm.runInNewContext(script, { window: frame, URL, URLSearchParams, localStorage: {
        getItem: key => storage[key] || null, removeItem: key => delete storage[key]
    } }));
}

test('weekly launch is consumed; refresh after completion stays in lobby', () => {
    const parent = context('http://localhost:3000/game?setId=weekly&isWeekly=true&mode=solo&autoStart=true');
    const frame = context('http://localhost:3000/game/v3.0/index.html?setId=weekly&isWeekly=true&autoStart=true');
    const storage = { apec_solo_launch: JSON.stringify({ setId: 'weekly', isWeekly: true, autoStart: true, timestamp: Date.now() }) };
    const first = boot(frame, parent, storage);
    assert.equal(first.autoStart, true);
    assert.equal(first.isWeekly, true);
    assert.equal(storage.apec_solo_launch, undefined);
    assert.equal(new URL(parent.location.href).searchParams.has('autoStart'), false);
    assert.equal(new URL(frame.location.href).searchParams.has('autoStart'), false);
    assert.equal(parent.history.state.routerKey, 'preserved');
    assert.equal(new URL(parent.location.href).searchParams.get('setId'), 'weekly');
    // A full web refresh builds a fresh iframe from the cleaned parent URL.
    const refreshed = context('http://localhost:3000/game/v3.0/index.html' + parent.location.search);
    assert.equal(boot(refreshed, parent, storage).autoStart, false);
    // Clicking a new weekly launch must still work.
    parent.location.href += '&autoStart=true';
    assert.equal(boot(refreshed, parent, storage).autoStart, true);
});

test('parent-only and localStorage-only launch commands are also one-shot', () => {
    for (const useStorage of [false, true]) {
        const parent = context('http://localhost:3000/game' + (useStorage ? '' : '?setId=quiz&autoStart=true'));
        const frame = context('http://localhost:3000/game/v3.0/index.html');
        const storage = useStorage ? { apec_solo_launch: JSON.stringify({ setId: 'quiz', autoStart: true, timestamp: Date.now() }) } : {};
        assert.equal(boot(frame, parent, storage).autoStart, true);
        assert.equal(boot(frame, parent, storage).autoStart, false);
    }
});
