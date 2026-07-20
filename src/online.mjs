// Thin client for server-authoritative private two-player rooms.  Rendering
// remains local, but movement, hits, reloads, and scores are accepted only
// from the Node server's engine instance.
export async function joinPrivateRoom(room) {
  const response = await fetch(`./api/rooms/${encodeURIComponent(room)}/join`, { method: 'POST' });
  if (!response.ok) throw new Error((await response.json()).error || 'unable to join room');
  const { token, slot, state } = await response.json();
  return { room, token, slot, state, pending: false };
}

export async function sendRoomInput(connection, input, dt) {
  if (connection.pending) return null;
  connection.pending = true;
  try {
    const response = await fetch(`./api/rooms/${encodeURIComponent(connection.room)}/input`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: connection.token, input, dt }),
    });
    if (!response.ok) throw new Error((await response.json()).error || 'room update failed');
    return await response.json();
  } finally { connection.pending = false; }
}

export function applyRoomState(world, state) {
  world.elapsed = state.elapsed;
  world.score = state.score;
  for (const incoming of state.players) {
    const actor = world.players.find((player) => player.id === incoming.id);
    if (actor) Object.assign(actor, incoming, { weapon: { ...incoming.weapon } });
  }
  world.bullets = state.bullets;
}
