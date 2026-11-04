const assert = require('node:assert/strict');
function peer() {
 const ws = new WebSocket('ws://localhost:5000/socket.io/?EIO=4&transport=websocket');
 const events = [], pending = [];
 function dispatch(event, data) {
  const index = pending.findIndex(p => p.event === event && p.matches(data));
  if (index < 0) events.push({ event, data });
  else { const p = pending.splice(index, 1)[0]; clearTimeout(p.timer); p.resolve(data); }
 }
 ws.addEventListener('message', ({data}) => {
  if (data.startsWith('0')) ws.send('40');
  else if (data === '2') ws.send('3');
  else if (data.startsWith('40')) dispatch('connected', null);
  else if (data.startsWith('42')) { const [event, value] = JSON.parse(data.slice(2)); dispatch(event, value); }
 });
 return { close: () => ws.close(), emit: (event, data) => ws.send('42'+JSON.stringify([event,data])), wait(event, matches = () => true) {
  const i = events.findIndex(e => e.event === event && matches(e.data));
  if (i >= 0) return Promise.resolve(events.splice(i,1)[0].data);
  return new Promise((resolve,reject) => { const p={event,matches,resolve}; p.timer=setTimeout(()=>{pending.splice(pending.indexOf(p),1);reject(Error('Timed out: '+event));},4000); pending.push(p); });
 }};
}
(async () => {
 const host=peer(), member=peer(); let pin;
 try {
  await Promise.all([host.wait('connected'),member.wait('connected')]);
  const sets=await (await fetch('http://localhost:5000/api/sets/defaults')).json();
  host.emit('create_lobby',{roomType:'casual',hostName:'Member regression host',setId:sets[0]._id});
  const created=await host.wait('lobby_created'); pin=created.pin;
  async function join() {
   member.emit('join_lobby',{pin,playerName:'Member regression guest'});
   const joined=await member.wait('join_success');
   await host.wait('players_update',p=>p.length===2);
   return joined;
  }
  await join(); member.emit('leave_lobby',{pin});
  await member.wait('room_session_expired');
  await host.wait('players_update',p=>p.length===1);
  console.log('PASS: leave immediately removes member on host');
  const joined=await join(); host.emit('kick_member',{pin,playerId:joined.playerId});
  await member.wait('room_session_expired');
  await host.wait('players_update',p=>p.length===1);
  member.emit('reconnect_lobby',{pin,playerId:joined.playerId,resumeToken:joined.resumeToken});
  await member.wait('room_session_expired');
  console.log('PASS: kick removes member and revokes reconnect session');
 } finally { if(pin)host.emit('destroy_room',pin); host.close();member.close(); }
})().catch(e=>{console.error(e.message);process.exitCode=1;});
