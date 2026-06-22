/* Shared state + data loading for SafeDPI Simulator */
const STORAGE_KEY = "safedpi_state_v1";

const Engine = {
  defaultState() {
    return {
      org: "",
      role: "",
      scenarioId: null,
      countryId: null,
      scores: { trust: 50, inclusion: 50, privacy: 50, security: 50, governance: 50 },
      decisions: [],
      eventChoices: [],
      lifecycle: {},
      riskFlags: []
    };
  },

  getState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return this.defaultState();
    try {
      return { ...this.defaultState(), ...JSON.parse(raw) };
    } catch {
      return this.defaultState();
    }
  },

  setState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },

  resetState() {
    localStorage.removeItem(STORAGE_KEY);
  },

  clamp(n) {
    return Math.max(0, Math.min(100, Math.round(n)));
  },

  applyDelta(state, delta) {
    const scores = { ...state.scores };
    for (const key of Object.keys(delta || {})) {
      if (scores[key] !== undefined) {
        scores[key] = this.clamp(scores[key] + delta[key]);
      }
    }
    state.scores = scores;
    return state;
  },

  overallScore(scores) {
    const vals = Object.values(scores);
    return this.clamp(vals.reduce((a, b) => a + b, 0) / vals.length);
  },

  async loadJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    return res.json();
  }
};

function renderDashboard(containerEl, scores) {
  const labels = {
    trust: "Trust",
    inclusion: "Inclusion",
    privacy: "Privacy",
    security: "Security",
    governance: "Governance"
  };
  const overall = Engine.overallScore(scores);
  let html = "";
  for (const key of Object.keys(labels)) {
    html += `
      <div class="score-box">
        <div class="label">${labels[key]}</div>
        <div class="value">${scores[key]}%</div>
        <div class="bar"><i style="width:${scores[key]}%"></i></div>
      </div>`;
  }
  html += `
    <div class="score-box">
      <div class="label">Overall Safeguards</div>
      <div class="value">${overall}%</div>
      <div class="bar"><i style="width:${overall}%;background:var(--accent-warn)"></i></div>
    </div>`;
  containerEl.innerHTML = html;
}
