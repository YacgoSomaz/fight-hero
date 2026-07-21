// A map load is asynchronous, while requestAnimationFrame can be throttled
// when a tab is backgrounded or has just switched from the source menu.
// Commit the loaded scene synchronously so the player never sees the canvas
// CSS fallback colour between the menu and the first animation frame.
export function commitStartedGameFrame(render) {
  render();
}
