// Decoded from Arena (symbol 1413), labelled frame 2 "foundry".  Values are
// SWF twips converted to pixels; names retain Arena's original id_connector
// convention so spawn nodes and AI action nodes can refer to waypoints.
const makePoints = (items, kind) => Object.freeze(items.map(([name, x, y]) => {
  const [id, connections = ''] = name.split('_');
  return Object.freeze({ kind, name, id, connections, x, y });
}));

export const FOUNDRY_LAYOUT = Object.freeze({
  width: 2874,
  height: 863,
  // symbol 1273: NodeWaypoint (the white/grey route markers in debug view)
  navigation: makePoints([
    ['a_q', 127.05, 704.25], ['b_qp', 486, 703.25], ['c_pd', 968, 701.25], ['d_ce', 1576, 701.25],
    ['e_dfk', 1689.05, 666.25], ['f_eg', 1865, 702.25], ['g_fh', 2333, 702.25], ['h_igk', 2488, 584.3],
    ['i_hj', 2714, 506.3], ['j_kil', 2427, 352.3], ['k_lefgh', 2095.05, 553.3], ['l_kjcm', 1771.05, 412.3],
    ['m_ldno', 826.1, 413.3], ['n_qpm', 478.1, 496.3], ['o_ma', 474.1, 306.3], ['p_bcn', 730.1, 607.25], ['q_abn', 267.1, 659.2],
  ], 'waypoint'),
  // symbol 1268: NodeAiAction. j=jump, c=crouch, fp/fc/fd=AI correction actions.
  actions: makePoints([
    ['c_a', 276.8, 216.8], ['j_n', 305.8, 590.75], ['j_m', 517.8, 424.75], ['j_n', 619.75, 545.75],
    ['j_p', 549.75, 630.75], ['j_l', 1131.7, 383.75], ['j_m', 1408.7, 387.75], ['j_d', 1149.7, 615.7],
    ['j_c', 1389.7, 618.7], ['j_k', 1726.7, 604.7], ['j_ki', 2447.65, 520.75], ['j_h', 2190.7, 488.75],
    ['j_l', 2008.7, 484.75], ['j_j', 1928.7, 352.75], ['j_j', 2653.65, 433.75], ['j_h', 2344.7, 625.75],
    ['j_l', 2206.7, 293.75], ['j_o', 636.8, 336.75], ['fp_hkgjeil', 547.95, 666.9], ['fc_bapqn', 1440.4, 635.4], ['fd_hkgjeil', 1110.9, 630.9],
  ], 'action'),
  // symbol 1276: NodeSpawn. The suffix is the team id; id points to its waypoint.
  spawns: makePoints([
    ['a_1', 96.95, 706.45], ['a_1', 146.9, 706.45], ['a_1', 178.9, 706.45], ['b_1', 408.8, 706.45],
    ['b_1', 464.8, 706.45], ['b_1', 518.8, 706.45], ['b_1', 578.75, 706.45], ['j_2', 2572, 354.6],
    ['j_2', 2516.05, 354.6], ['j_2', 2458.05, 354.6], ['j_2', 2378.1, 354.6], ['j_2', 2322.1, 354.6],
    ['i_2', 2749.95, 506.5], ['i_2', 2710, 506.5], ['n_1', 459.8, 497.5], ['n_1', 508.8, 497.5],
    ['h_2', 2483, 584.5], ['g_2', 2332.1, 702.55], ['g_2', 2280.1, 703.55], ['a_0', 136.95, 706.45],
    ['b_0', 484.8, 702.45], ['c_0', 1071.6, 696.45], ['d_0', 1576.4, 702.45], ['f_0', 1906.25, 702.45],
    ['g_0', 2322.1, 702.45], ['i_0', 2716, 508.5], ['j_0', 2430.1, 352.55], ['k_0', 2096.25, 552.5],
    ['l_0', 1770.35, 414.55], ['m_0', 826.7, 414.55], ['o_0', 472.85, 308.6],
  ], 'spawn'),
  // symbol 1280: NodePickup; suffix is its original respawn time in seconds.
  pickups: makePoints([
    ['health_15', 966.3, 704.2], ['ammo_15', 404.3, 286.2], ['health_15', 1989.5, 556], ['ammo_10', 2582.45, 507.05],
  ], 'pickup'),
});
