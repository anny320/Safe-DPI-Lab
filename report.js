function gradeFromScore(score) {
  if (score >= 90) return "A";
  if (score >= 85) return "A-";
  if (score >= 80) return "B+";
  if (score >= 75) return "B";
  if (score >= 70) return "B-";
  if (score >= 60) return "C+";
  if (score >= 50) return "C";
  if (score >= 40) return "D";
  return "F";
}

const SCENARIO_LABELS = {
  digital_id: "Digital ID",
  health_exchange: "National Health Exchange",
  payments: "Digital Payments System",
  education: "Education Records Platform",
  agriculture: "Agriculture Registry"
};

async function init() {
  const state = Engine.getState();
  if (!state.scenarioId || state.decisions.length === 0) {
    window.location.href = "scenarios.html";
    return;
  }

  const [countries, safeguards, risksData] = await Promise.all([
    Engine.loadJSON("countries.json"),
    Engine.loadJSON("safeguards.json"),
    Engine.loadJSON("risks.json")
  ]);

  const country = countries.find(c => c.id === state.countryId) || {};
  const overall = Engine.overallScore(state.scores);
  const grade = gradeFromScore(overall);
  const scenarioLabel = SCENARIO_LABELS[state.scenarioId] || state.scenarioId;

  document.getElementById("resultHeadline").textContent =
    `You built a ${scenarioLabel} serving ${country.population || "millions of"} citizens in the ${country.name || "country"}.`;
  document.getElementById("finalScore").textContent = `${overall}/100`;
  document.getElementById("gradeLabel").textContent = `Grade: ${grade}`;

  renderDashboard(document.getElementById("dashboard"), state.scores);

  const sortedScores = Object.entries(state.scores).sort((a, b) => b[1] - a[1]);
  const strong = sortedScores.filter(([, v]) => v >= 65).slice(0, 3);
  const weak = sortedScores.filter(([, v]) => v < 65).slice(0, 3);

  const strongList = document.getElementById("strongList");
  const weakList = document.getElementById("weakList");
  strongList.innerHTML = strong.length
    ? strong.map(([k]) => `<li class="good">${safeguards[k].label}</li>`).join("")
    : `<li class="muted">No standout strengths — every area needs attention.</li>`;
  weakList.innerHTML = weak.length
    ? weak.map(([k]) => `<li class="bad">${safeguards[k].label}</li>`).join("")
    : `<li class="muted">No critical weaknesses identified.</li>`;

  const recommendList = document.getElementById("recommendList");
  const recs = weak.flatMap(([k]) => safeguards[k].recommendations.slice(0, 2)).slice(0, 5);
  recommendList.innerHTML = (recs.length ? recs : ["Maintain current safeguards and continue regular audits."])
    .map(r => `<li>${r}</li>`).join("");

  const allRiskIds = new Set(state.riskFlags);
  const riskLabelMap = {};
  Object.values(risksData).flat().forEach(r => { riskLabelMap[r.id] = r.label; });
  const riskTags = document.getElementById("riskTags");
  riskTags.innerHTML = allRiskIds.size
    ? [...allRiskIds].map(id => `<span class="tag">${riskLabelMap[id] || id}</span>`).join("")
    : `<span class="muted">No major risk flags raised — well navigated.</span>`;

  const decisionLog = document.getElementById("decisionLog");
  const allChoices = [...state.decisions, ...state.eventChoices];
  decisionLog.innerHTML = allChoices.map(d => `
    <div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
      <strong>${d.title}</strong><br/>
      <span class="muted">Chose ${d.optionId}: ${d.label}</span>
    </div>`).join("");

  const shareText =
    `I just built a ${scenarioLabel} serving ${country.population || "millions of"} citizens in SafeDPI Simulator.\n` +
    `Trust: ${state.scores.trust}% | Inclusion: ${state.scores.inclusion}% | Safeguards: ${overall}% | Grade: ${grade}\n` +
    `Try it yourself:`;

  const pageUrl = window.location.origin + window.location.pathname.replace("report.html", "index.html");
  document.getElementById("shareSummary").textContent = shareText.replace("\n", " ");

  document.getElementById("whatsappShare").href =
    `https://wa.me/?text=${encodeURIComponent(shareText + " " + pageUrl)}`;

  document.getElementById("emailShare").href =
    `mailto:?subject=${encodeURIComponent("My SafeDPI Simulator Report")}&body=${encodeURIComponent(shareText + " " + pageUrl)}`;

  document.getElementById("linkedinShare").href =
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;

  document.getElementById("restartBtn").addEventListener("click", () => {
    Engine.resetState();
  });
}

init();
