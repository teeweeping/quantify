import { useState, useEffect, useCallback } from "react";

const DEFAULT_CATEGORIES = ["Health", "Family", "Career", "Learning", "Community", "Finance", "Personal Growth"];
const CATEGORY_COLORS = {
  Health: "#7eb8a4", Family: "#e88c7d", Career: "#f0c674", Learning: "#9b8fd4",
  Community: "#6db8d4", Finance: "#d4a96d", "Personal Growth": "#c47eb8",
};
const CUSTOM_CAT_COLORS = ["#e88c7d","#7eb8a4","#f0c674","#9b8fd4","#6db8d4","#d4a96d","#c47eb8","#a8d4b0","#d4a8a8","#a8b8d4"];
const QUICK_PICK_OPTIONS = [4, 6, 8, 10];
const RANGE_OPTIONS = [
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "all", label: "All" },
];

const ACHIEVEMENTS = [
  { id: "first_log", label: "First Step", desc: "Log your first activity", icon: "✦", check: (l) => l.length >= 1 },
  { id: "ten_logs", label: "10 Activities", desc: "Log 10 activities total", icon: "◈", check: (l) => l.length >= 10 },
  { id: "streak_3", label: "3-Day Streak", desc: "Log for 3 days in a row", icon: "⬡", check: (l) => calcStreak(l) >= 3 },
  { id: "first_1000", label: "RM1,000 Value", desc: "Create RM1,000 of contribution", icon: "◉", check: (l) => l.reduce((s, x) => s + x.value, 0) >= 1000 },
  { id: "balanced", label: "Balanced Day", desc: "Log in 3+ categories in one day", icon: "✿", check: (l) => checkBalancedAny(l) },
];

function calcStreak(logs) {
  if (!logs.length) return 0;
  const days = [...new Set(logs.map(l => l.date))].sort().reverse();
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const diff = (new Date(days[i-1]) - new Date(days[i])) / 86400000;
    if (diff === 1) streak++; else break;
  }
  return streak;
}

function checkBalancedAny(logs) {
  const byDay = {};
  logs.forEach(l => { if (!byDay[l.date]) byDay[l.date] = new Set(); byDay[l.date].add(l.category); });
  return Object.values(byDay).some(s => s.size >= 3);
}

function getTodayStr() { return new Date().toISOString().split("T")[0]; }

function formatDate(ds) {
  return new Date(ds + "T00:00:00").toLocaleDateString("en-MY", { weekday: "short", month: "short", day: "numeric" });
}

function getCatColor(cat, customCats) {
  if (CATEGORY_COLORS[cat]) return CATEGORY_COLORS[cat];
  const idx = customCats.indexOf(cat) % CUSTOM_CAT_COLORS.length;
  return CUSTOM_CAT_COLORS[Math.max(0, idx)];
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f0f1a; --surface: #1a1a2e; --surface2: #222240; --surface3: #2a2a50;
    --border: rgba(255,255,255,0.08); --text: #f0eefc; --text2: #9896b8; --text3: #5e5c80;
    --green: #7eb8a4; --coral: #e88c7d; --gold: #f0c674; --purple: #9b8fd4;
    --accent: #7eb8a4; --radius: 16px; --radius-sm: 10px;
  }
  body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; overscroll-behavior: none; }
  .app { max-width: 420px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; background: var(--bg); }
  .screen { flex: 1; overflow-y: auto; padding: 0 0 90px 0; }

  .header { padding: 52px 20px 16px; display: flex; align-items: flex-start; justify-content: space-between; }
  .header-title { font-size: 13px; color: var(--text2); font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; }
  .header-name { font-size: 24px; font-weight: 700; color: var(--text); margin-top: 2px; }
  .header-streak { display: flex; flex-direction: column; align-items: center; background: var(--surface2); border-radius: var(--radius-sm); padding: 8px 12px; gap: 2px; }
  .streak-num { font-size: 20px; font-weight: 700; color: var(--gold); }
  .streak-label { font-size: 10px; color: var(--text2); text-transform: uppercase; letter-spacing: 0.06em; }

  .score-card { margin: 0 16px 16px; background: var(--surface); border-radius: var(--radius); padding: 20px; border: 1px solid var(--border); }
  .score-card-title { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 14px; }
  .score-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
  .score-item { text-align: center; }
  .score-value { font-size: 22px; font-weight: 700; }
  .score-label { font-size: 10px; color: var(--text2); margin-top: 3px; }
  .value-color { color: var(--gold); } .happy-color { color: var(--purple); }
  .energy-pos { color: var(--green); } .energy-neg { color: var(--coral); }

  .section { padding: 0 16px; margin-bottom: 20px; }
  .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .section-title { font-size: 13px; font-weight: 600; color: var(--text2); text-transform: uppercase; letter-spacing: 0.08em; }
  .section-action { font-size: 12px; color: var(--accent); font-weight: 500; cursor: pointer; }

  .category-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .cat-label { font-size: 12px; color: var(--text2); width: 96px; flex-shrink: 0; }
  .cat-track { flex: 1; height: 6px; background: var(--surface2); border-radius: 3px; overflow: hidden; }
  .cat-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
  .cat-value { font-size: 11px; color: var(--text3); width: 44px; text-align: right; }

  .log-item { display: flex; align-items: center; gap: 12px; background: var(--surface); border-radius: var(--radius-sm); padding: 12px 14px; margin-bottom: 8px; border: 1px solid var(--border); animation: fadeIn 0.3s ease; cursor: pointer; transition: border-color 0.15s; }
  .log-item:hover { border-color: rgba(126,184,164,0.3); }
  .log-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .log-name { font-size: 14px; font-weight: 500; flex: 1; }
  .log-meta { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
  .log-badge { font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 20px; background: var(--surface2); }
  .log-time { font-size: 10px; color: var(--text3); }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .bottom-nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 420px; background: var(--surface); border-top: 1px solid var(--border); display: flex; align-items: center; padding: 8px 0 24px; z-index: 100; }
  .nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; padding: 6px 0; transition: opacity 0.15s; }
  .nav-item:hover { opacity: 0.8; }
  .nav-icon { font-size: 20px; line-height: 1; }
  .nav-label { font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; }
  .nav-item.active .nav-label { color: var(--accent); }
  .nav-item:not(.active) .nav-label { color: var(--text3); }
  .nav-item:not(.active) .nav-icon { filter: grayscale(0.6) opacity(0.5); }
  .nav-log-btn { width: 52px; height: 52px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 26px; line-height: 1; box-shadow: 0 4px 20px rgba(126,184,164,0.35); transition: transform 0.15s, box-shadow 0.15s; border: none; color: var(--bg); margin-top: -22px; }
  .nav-log-btn:hover { transform: scale(1.07); box-shadow: 0 6px 28px rgba(126,184,164,0.5); }

  /* Modal */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 200; display: flex; align-items: flex-end; backdrop-filter: blur(4px); }
  .modal { width: 100%; max-width: 420px; margin: 0 auto; background: var(--surface); border-radius: 24px 24px 0 0; padding: 20px 20px 40px; animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1); max-height: 94vh; overflow-y: auto; }
  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
  .modal-handle { width: 40px; height: 4px; background: var(--surface3); border-radius: 2px; margin: 0 auto 16px; }
  .modal-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
  .modal-back { background: var(--surface2); border: none; color: var(--text2); width: 36px; height: 36px; border-radius: 50%; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background 0.15s; }
  .modal-back:hover { background: var(--surface3); color: var(--text); }
  .modal-title { font-size: 18px; font-weight: 700; flex: 1; }

  .form-label { font-size: 12px; color: var(--text2); font-weight: 500; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }

  .qp-count-row { display: flex; gap: 6px; margin-bottom: 10px; }
  .qp-count-btn { padding: 4px 10px; border-radius: 20px; background: var(--surface2); border: 1.5px solid transparent; color: var(--text3); font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: inherit; }
  .qp-count-btn.active { border-color: var(--accent); color: var(--accent); background: rgba(126,184,164,0.1); }

  .preset-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
  .preset-btn { padding: 10px 12px; border-radius: var(--radius-sm); background: var(--surface2); border: 1.5px solid transparent; color: var(--text2); font-size: 13px; font-weight: 500; cursor: pointer; text-align: left; transition: all 0.15s; }
  .preset-btn:hover { border-color: var(--accent); color: var(--text); }
  .preset-btn.selected { border-color: var(--accent); background: rgba(126,184,164,0.12); color: var(--text); }

  .name-input-wrap { position: relative; margin-bottom: 16px; }
  .name-input { width: 100%; background: var(--surface2); border: 1.5px solid var(--border); border-radius: var(--radius-sm); padding: 12px 40px 12px 14px; color: var(--text); font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.15s; }
  .name-input:focus { border-color: var(--accent); }
  .name-input::placeholder { color: var(--text3); }
  .name-clear { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: var(--surface3); border: none; color: var(--text3); width: 22px; height: 22px; border-radius: 50%; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; line-height: 1; }
  .name-clear:hover { background: var(--coral); color: #fff; }

  /* Category chip with delete (×) for custom categories only */
  .cat-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
  .cat-chip-wrap { position: relative; display: inline-flex; }
  .cat-btn { padding: 7px 13px; border-radius: 20px; background: var(--surface2); border: 1.5px solid transparent; color: var(--text2); font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
  .cat-btn.selected { color: #fff; }
  .cat-btn.deletable { padding-right: 26px; }
  .cat-del { position: absolute; right: 4px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.15); border: none; color: inherit; width: 16px; height: 16px; border-radius: 50%; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1; padding: 0; }
  .cat-del:hover { background: var(--coral); color: #fff; }
  .add-cat-btn { padding: 7px 13px; border-radius: 20px; background: transparent; border: 1.5px dashed var(--text3); color: var(--text3); font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.15s; margin-bottom: 16px; }
  .add-cat-btn:hover { border-color: var(--accent); color: var(--accent); }
  .new-cat-row { display: flex; gap: 8px; margin-bottom: 16px; }
  .new-cat-input { flex: 1; background: var(--surface2); border: 1.5px solid var(--accent); border-radius: var(--radius-sm); padding: 10px 14px; color: var(--text); font-size: 13px; font-family: inherit; outline: none; }
  .new-cat-save { padding: 10px 16px; background: var(--accent); border: none; border-radius: var(--radius-sm); color: var(--bg); font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; }

  /* Delete category confirm banner */
  .confirm-banner { background: rgba(232,140,125,0.1); border: 1.5px solid var(--coral); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 16px; }
  .confirm-text { font-size: 13px; color: var(--text); line-height: 1.5; margin-bottom: 10px; }
  .confirm-actions { display: flex; gap: 8px; }
  .confirm-btn { flex: 1; padding: 9px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit; border: none; }
  .confirm-btn.danger { background: var(--coral); color: #1a1a2e; }
  .confirm-btn.cancel { background: var(--surface2); color: var(--text2); }

  .field-row { margin-bottom: 18px; }
  .field-row-label { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .field-row-label span:first-child { font-size: 12px; color: var(--text2); font-weight: 500; text-transform: uppercase; letter-spacing: 0.07em; }
  .field-row-label span:last-child { font-size: 15px; font-weight: 700; }
  .slider-track { display: flex; align-items: center; gap: 8px; }
  .slider-track input[type=range] { flex: 1; accent-color: var(--accent); cursor: pointer; height: 4px; }
  .slider-end { font-size: 11px; color: var(--text3); width: 60px; }
  .slider-end.right { text-align: right; }

  .value-input-row { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
  .value-prefix { font-size: 18px; font-weight: 700; color: var(--gold); }
  .value-input { flex: 1; background: var(--surface2); border: 1.5px solid var(--border); border-radius: var(--radius-sm); padding: 12px 14px; color: var(--gold); font-size: 22px; font-weight: 700; font-family: inherit; outline: none; transition: border-color 0.15s; }
  .value-input:focus { border-color: var(--gold); }

  .date-row { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
  .date-input { flex: 1; background: var(--surface2); border: 1.5px solid var(--border); border-radius: var(--radius-sm); padding: 12px 14px; color: var(--text); font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.15s; }
  .date-input:focus { border-color: var(--accent); }

  .submit-btn { width: 100%; padding: 16px; border-radius: var(--radius-sm); background: var(--accent); border: none; color: var(--bg); font-size: 15px; font-weight: 700; cursor: pointer; transition: opacity 0.15s, transform 0.1s; font-family: inherit; margin-top: 4px; }
  .submit-btn:hover { opacity: 0.9; transform: translateY(-1px); }
  .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .delete-btn { width: 100%; padding: 14px; border-radius: var(--radius-sm); background: transparent; border: 1.5px solid var(--coral); color: var(--coral); font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; margin-top: 10px; transition: background 0.15s; }
  .delete-btn:hover { background: rgba(232,140,125,0.1); }

  .insight-card { background: var(--surface); border-radius: var(--radius); padding: 16px; margin-bottom: 12px; border: 1px solid var(--border); }
  .insight-icon { font-size: 20px; margin-bottom: 8px; }
  .insight-text { font-size: 14px; color: var(--text); line-height: 1.5; }
  .insight-text strong { color: var(--accent); }

  .weekly-total { background: linear-gradient(135deg, var(--surface2), var(--surface3)); border-radius: var(--radius); padding: 24px 20px; margin: 0 16px 20px; border: 1px solid var(--border); text-align: center; }
  .weekly-big { font-size: 42px; font-weight: 700; color: var(--gold); }
  .weekly-sub { font-size: 13px; color: var(--text2); margin-top: 4px; }

  /* Range toggle for Insights */
  .range-toggle { display: flex; background: var(--surface2); border-radius: 20px; padding: 3px; margin: 0 16px 16px; }
  .range-btn { flex: 1; padding: 8px; border-radius: 17px; background: transparent; border: none; color: var(--text2); font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.15s; }
  .range-btn.active { background: var(--accent); color: var(--bg); }

  .evidence-header { padding: 52px 20px 0; display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
  .evidence-icon { font-size: 28px; }
  .evidence-title { font-size: 22px; font-weight: 700; }
  .evidence-count { font-size: 13px; color: var(--text2); margin-top: 2px; }

  .day-group { margin-bottom: 20px; }
  .day-label { font-size: 11px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.1em; padding: 0 16px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
  .day-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  .profile-hero { padding: 52px 20px 24px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .avatar { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--purple)); display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; color: var(--bg); margin-bottom: 4px; }
  .profile-name { font-size: 20px; font-weight: 700; }
  .profile-since { font-size: 13px; color: var(--text2); }

  .stat-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; padding: 0 16px; margin-bottom: 24px; }
  .stat-box { background: var(--surface); border-radius: var(--radius-sm); padding: 14px 10px; text-align: center; border: 1px solid var(--border); }
  .stat-n { font-size: 20px; font-weight: 700; color: var(--accent); }
  .stat-l { font-size: 10px; color: var(--text2); margin-top: 3px; text-transform: uppercase; letter-spacing: 0.05em; }

  .achievement-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 0 16px; }
  .achievement { background: var(--surface); border-radius: var(--radius-sm); padding: 14px; border: 1px solid var(--border); display: flex; flex-direction: column; gap: 6px; }
  .achievement.unlocked { border-color: rgba(126,184,164,0.3); background: rgba(126,184,164,0.06); }
  .achievement.locked { opacity: 0.4; }
  .ach-icon { font-size: 22px; } .ach-label { font-size: 13px; font-weight: 600; }
  .ach-desc { font-size: 11px; color: var(--text2); line-height: 1.4; }

  .empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 32px; text-align: center; gap: 10px; }
  .empty-icon { font-size: 40px; opacity: 0.4; }
  .empty-text { font-size: 15px; color: var(--text2); line-height: 1.5; }
  .glow-ring { width: 120px; height: 120px; border-radius: 50%; background: radial-gradient(circle, rgba(126,184,164,0.15) 0%, transparent 70%); display: flex; align-items: center; justify-content: center; font-size: 48px; margin-bottom: 8px; }
`;

// ── LogModal ──────────────────────────────────────────────────────────────────
function LogModal({ onClose, onSave, onDelete, logs, customCats, onAddCat, onDeleteCat, editEntry, quickPickCount, onSetQuickPickCount }) {
  const isEdit = !!editEntry;
  const allCats = [...DEFAULT_CATEGORIES, ...customCats];

  const pastActivities = [];
  const seen = new Set();
  [...logs].reverse().forEach(l => {
    if (!seen.has(l.name)) { seen.add(l.name); pastActivities.push({ name: l.name, category: l.category, defaultValue: l.value }); }
  });
  const staticPicks = [
    { name: "Exercise", category: "Health", defaultValue: 30 },
    { name: "Reading", category: "Learning", defaultValue: 20 },
    { name: "Cooking", category: "Family", defaultValue: 25 },
    { name: "Caring for family", category: "Family", defaultValue: 40 },
    { name: "Job Application", category: "Career", defaultValue: 50 },
    { name: "Volunteering", category: "Community", defaultValue: 35 },
    { name: "Meditation", category: "Health", defaultValue: 15 },
    { name: "Learning skill", category: "Personal Growth", defaultValue: 25 },
    { name: "Household chores", category: "Family", defaultValue: 20 },
    { name: "Walking", category: "Health", defaultValue: 15 },
  ];
  const sourceList = pastActivities.length > 0 ? pastActivities : staticPicks;
  const quickPicks = sourceList.slice(0, quickPickCount);

  const [name, setName] = useState(editEntry?.name || "");
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [category, setCategory] = useState(editEntry?.category || "Health");
  const [valueStr, setValueStr] = useState(String(editEntry?.value ?? 20));
  const [happiness, setHappiness] = useState(editEntry?.happiness ?? 3);
  const [energy, setEnergy] = useState(editEntry?.energy ?? 0);
  const [date, setDate] = useState(editEntry?.date || getTodayStr());
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [confirmDeleteCat, setConfirmDeleteCat] = useState(null); // category name pending deletion

  const selectPreset = (p) => { setSelectedPreset(p.name); setName(p.name); setCategory(p.category); setValueStr(String(p.defaultValue)); };

  const handleAddCat = () => {
    const trimmed = newCatName.trim();
    if (trimmed && !allCats.includes(trimmed)) { onAddCat(trimmed); setCategory(trimmed); }
    setShowNewCat(false); setNewCatName("");
  };

  // FIX: category deletion for custom categories
  const usageCount = (cat) => logs.filter(l => l.category === cat).length;

  const requestDeleteCat = (cat, e) => {
    e.stopPropagation();
    setConfirmDeleteCat(cat);
  };

  const confirmDelete = () => {
    if (category === confirmDeleteCat) setCategory("Health");
    onDeleteCat(confirmDeleteCat);
    setConfirmDeleteCat(null);
  };

  const handleValueFocus = (e) => e.target.select();
  const handleValueChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setValueStr(raw === "" ? "" : String(parseInt(raw)));
  };
  const handleValueBlur = () => { const n = parseInt(valueStr); setValueStr(isNaN(n) || n < 0 ? "0" : String(n)); };

  const numericValue = Math.max(0, parseInt(valueStr) || 0);
  const canSave = name.trim().length > 0;

  const handleSave = () => {
    onSave({
      id: editEntry?.id || Date.now(), name: name.trim(), category,
      value: numericValue, happiness, energy, date,
      time: editEntry?.time || new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" }),
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-handle" />
        <div className="modal-header">
          <button className="modal-back" onClick={onClose}>←</button>
          <div className="modal-title">{isEdit ? "Edit Activity" : "Log an Activity"}</div>
        </div>

        <label className="form-label">
          <span>{pastActivities.length > 0 ? "Quick Pick (your recent)" : "Quick Pick"}</span>
          <span style={{ color: "var(--text3)", fontSize: 10, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>Show</span>
        </label>
        <div className="qp-count-row">
          {QUICK_PICK_OPTIONS.map(n => (
            <button key={n} className={`qp-count-btn ${quickPickCount === n ? "active" : ""}`} onClick={() => onSetQuickPickCount(n)}>{n}</button>
          ))}
        </div>
        <div className="preset-grid">
          {quickPicks.map(p => (
            <button key={p.name} className={`preset-btn ${selectedPreset === p.name ? "selected" : ""}`} onClick={() => selectPreset(p)}>{p.name}</button>
          ))}
        </div>

        <label className="form-label"><span>Activity Name</span></label>
        <div className="name-input-wrap">
          <input className="name-input" placeholder="Or type your own…" value={name}
            onChange={e => { setName(e.target.value); setSelectedPreset(null); }} />
          {name.length > 0 && <button className="name-clear" onClick={() => { setName(""); setSelectedPreset(null); }}>×</button>}
        </div>

        <label className="form-label"><span>Category</span></label>
        <div className="cat-grid">
          {allCats.map(c => {
            const isCustom = customCats.includes(c);
            return (
              <div className="cat-chip-wrap" key={c}>
                <button className={`cat-btn ${category === c ? "selected" : ""} ${isCustom ? "deletable" : ""}`}
                  style={category === c ? { background: getCatColor(c, customCats) + "33", borderColor: getCatColor(c, customCats) } : {}}
                  onClick={() => setCategory(c)}>{c}</button>
                {isCustom && (
                  <button className="cat-del" onClick={(e) => requestDeleteCat(c, e)} title="Delete category">×</button>
                )}
              </div>
            );
          })}
        </div>

        {confirmDeleteCat && (
          <div className="confirm-banner">
            <div className="confirm-text">
              Delete <strong>{confirmDeleteCat}</strong>?
              {usageCount(confirmDeleteCat) > 0
                ? ` ${usageCount(confirmDeleteCat)} existing ${usageCount(confirmDeleteCat) === 1 ? "entry" : "entries"} will be moved to "Health".`
                : " No entries use this category."}
            </div>
            <div className="confirm-actions">
              <button className="confirm-btn cancel" onClick={() => setConfirmDeleteCat(null)}>Cancel</button>
              <button className="confirm-btn danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        )}

        {showNewCat ? (
          <div className="new-cat-row">
            <input className="new-cat-input" placeholder="Category name…" value={newCatName}
              onChange={e => setNewCatName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddCat()} autoFocus />
            <button className="new-cat-save" onClick={handleAddCat}>Add</button>
          </div>
        ) : (
          <button className="add-cat-btn" onClick={() => setShowNewCat(true)}>+ Create category</button>
        )}

        <label className="form-label"><span>Date</span></label>
        <div className="date-row">
          <input className="date-input" type="date" value={date} max={getTodayStr()} onChange={e => setDate(e.target.value)} />
        </div>

        <div className="field-row">
          <div className="field-row-label"><span>Contribution Value</span><span style={{ color: "var(--gold)" }}>RM {numericValue}</span></div>
          <div className="value-input-row" style={{ marginBottom: 0 }}>
            <span className="value-prefix">RM</span>
            <input className="value-input" type="number" inputMode="numeric" min="0" value={valueStr}
              onFocus={handleValueFocus} onChange={handleValueChange} onBlur={handleValueBlur} />
          </div>
        </div>

        <div className="field-row">
          <div className="field-row-label"><span>Happiness</span><span style={{ color: "var(--purple)" }}>{happiness} / 5</span></div>
          <div className="slider-track">
            <span className="slider-end">😞 Low</span>
            <input type="range" min="1" max="5" value={happiness} onChange={e => setHappiness(+e.target.value)} />
            <span className="slider-end right">😊 High</span>
          </div>
        </div>

        <div className="field-row">
          <div className="field-row-label"><span>Energy Impact</span><span style={{ color: energy >= 0 ? "var(--green)" : "var(--coral)" }}>{energy > 0 ? "+" : ""}{energy}</span></div>
          <div className="slider-track">
            <span className="slider-end">⚡ Drain</span>
            <input type="range" min="-5" max="5" value={energy} onChange={e => setEnergy(+e.target.value)} />
            <span className="slider-end right">✨ Boost</span>
          </div>
        </div>

        <button className="submit-btn" disabled={!canSave} onClick={handleSave}>{isEdit ? "Save Changes" : "Save Contribution"}</button>
        {isEdit && <button className="delete-btn" onClick={() => { onDelete(editEntry.id); onClose(); }}>Delete Entry</button>}
      </div>
    </div>
  );
}

// ── Screens ───────────────────────────────────────────────────────────────────
function ScoreCard({ logs }) {
  const today = getTodayStr();
  const tl = logs.filter(l => l.date === today);
  const totalValue = tl.reduce((s, l) => s + l.value, 0);
  const avgHappy = tl.length ? (tl.reduce((s, l) => s + l.happiness, 0) / tl.length).toFixed(1) : "—";
  const totalEnergy = tl.reduce((s, l) => s + l.energy, 0);
  return (
    <div className="score-card">
      <div className="score-card-title">Today's Contribution</div>
      <div className="score-grid">
        <div className="score-item"><div className="score-value value-color">RM{totalValue}</div><div className="score-label">Value Created</div></div>
        <div className="score-item"><div className="score-value happy-color">{avgHappy}</div><div className="score-label">Avg Happiness</div></div>
        <div className="score-item">
          <div className={`score-value ${totalEnergy >= 0 ? "energy-pos" : "energy-neg"}`}>{totalEnergy > 0 ? "+" : ""}{totalEnergy}</div>
          <div className="score-label">Energy Balance</div>
        </div>
      </div>
    </div>
  );
}

function TodayScreen({ logs, customCats, onEditEntry }) {
  const today = getTodayStr();
  const todayLogs = logs.filter(l => l.date === today).slice().reverse();
  const streak = calcStreak(logs);
  const catTotals = {};
  todayLogs.forEach(l => { catTotals[l.category] = (catTotals[l.category] || 0) + l.value; });
  const maxCat = Math.max(...Object.values(catTotals), 1);
  return (
    <div className="screen">
      <div className="header">
        <div><div className="header-title">Good work today</div><div className="header-name">Quantify</div></div>
        <div className="header-streak"><div className="streak-num">🔥 {streak}</div><div className="streak-label">Day Streak</div></div>
      </div>
      <ScoreCard logs={logs} />
      {Object.keys(catTotals).length > 0 && (
        <div className="section">
          <div className="section-header"><div className="section-title">By Category</div></div>
          {Object.entries(catTotals).sort((a, b) => b[1] - a[1]).map(([cat, val]) => (
            <div className="category-bar" key={cat}>
              <div className="cat-label" style={{ color: getCatColor(cat, customCats) }}>{cat}</div>
              <div className="cat-track"><div className="cat-fill" style={{ width: `${(val / maxCat) * 100}%`, background: getCatColor(cat, customCats) }} /></div>
              <div className="cat-value">RM{val}</div>
            </div>
          ))}
        </div>
      )}
      <div className="section">
        <div className="section-header"><div className="section-title">Today's Log</div><div className="section-action">{todayLogs.length} activities</div></div>
        {todayLogs.length === 0 ? (
          <div className="empty"><div className="glow-ring">✦</div><div className="empty-text">Tap <strong style={{ color: "var(--accent)" }}>+</strong> below to log your first contribution today.</div></div>
        ) : todayLogs.map(l => (
          <div className="log-item" key={l.id} onClick={() => onEditEntry(l)}>
            <div className="log-dot" style={{ background: getCatColor(l.category, customCats) }} />
            <div className="log-name">{l.name}</div>
            <div className="log-meta">
              <div className="log-badge" style={{ color: "var(--gold)" }}>RM{l.value}</div>
              <div className="log-badge" style={{ color: "var(--purple)" }}>😊 {l.happiness}</div>
              <div className="log-badge" style={{ color: l.energy >= 0 ? "var(--green)" : "var(--coral)" }}>{l.energy > 0 ? "+" : ""}{l.energy}⚡</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// FIX: Insights now supports Week / Month / All range toggle
function InsightsScreen({ logs }) {
  const [range, setRange] = useState("week");

  const now = new Date();
  const rangeStart = new Date();
  if (range === "week") rangeStart.setDate(now.getDate() - 7);
  else if (range === "month") rangeStart.setDate(now.getDate() - 30);
  else rangeStart.setFullYear(2000); // effectively "all"

  const rangeLogs = logs.filter(l => new Date(l.date) >= rangeStart);
  const rangeValue = rangeLogs.reduce((s, l) => s + l.value, 0);

  const catHappy = {}, catCount = {};
  rangeLogs.forEach(l => { catHappy[l.category] = (catHappy[l.category] || 0) + l.happiness; catCount[l.category] = (catCount[l.category] || 0) + 1; });
  const topHappy = Object.entries(catHappy).map(([c, h]) => ({ cat: c, avg: h / catCount[c] })).sort((a, b) => b.avg - a.avg)[0];

  const energyByAct = {};
  rangeLogs.forEach(l => { if (!energyByAct[l.name]) energyByAct[l.name] = { energy: 0, count: 0 }; energyByAct[l.name].energy += l.energy; energyByAct[l.name].count++; });
  const topEnergy = Object.entries(energyByAct).sort((a, b) => (b[1].energy / b[1].count) - (a[1].energy / a[1].count))[0];

  // Chart bucketing: week -> 7 days, month -> ~4-5 weekly buckets, all -> monthly buckets
  const CHART_H = 56;
  let buckets = [];
  if (range === "week") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      buckets.push({ label: d.toLocaleDateString("en-MY", { weekday: "short" }), value: logs.filter(l => l.date === ds).reduce((s, l) => s + l.value, 0) });
    }
  } else if (range === "month") {
    for (let i = 3; i >= 0; i--) {
      const end = new Date(); end.setDate(end.getDate() - i * 7);
      const start = new Date(end); start.setDate(end.getDate() - 6);
      const val = logs.filter(l => { const d = new Date(l.date); return d >= start && d <= end; }).reduce((s, l) => s + l.value, 0);
      buckets.push({ label: `Wk ${4 - i}`, value: val });
    }
  } else {
    const monthMap = {};
    logs.forEach(l => {
      const d = new Date(l.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!monthMap[key]) monthMap[key] = { label: d.toLocaleDateString("en-MY", { month: "short" }), value: 0, sortKey: d.getFullYear() * 12 + d.getMonth() };
      monthMap[key].value += l.value;
    });
    buckets = Object.values(monthMap).sort((a, b) => a.sortKey - b.sortKey).slice(-6);
    if (buckets.length === 0) buckets = [{ label: "—", value: 0 }];
  }
  const maxVal = Math.max(...buckets.map(d => d.value), 1);
  const getBarH = (v) => v === 0 ? 3 : Math.max(8, Math.round((v / maxVal) * CHART_H));

  const rangeSubLabel = range === "week" ? "this week" : range === "month" ? "this month" : "all time";
  const chartTitle = range === "week" ? "Daily Value" : range === "month" ? "Weekly Value" : "Monthly Value";

  return (
    <div className="screen">
      <div className="header"><div><div className="header-title">{RANGE_OPTIONS.find(r => r.id === range).label} View</div><div className="header-name">Insights</div></div></div>

      <div className="range-toggle">
        {RANGE_OPTIONS.map(r => (
          <button key={r.id} className={`range-btn ${range === r.id ? "active" : ""}`} onClick={() => setRange(r.id)}>{r.label}</button>
        ))}
      </div>

      <div className="weekly-total">
        <div className="weekly-big">RM{rangeValue}</div>
        <div className="weekly-sub">of contribution created {rangeSubLabel}</div>
      </div>
      <div className="section">
        <div className="section-header"><div className="section-title">{chartTitle}</div></div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: `${CHART_H + 20}px` }}>
          {buckets.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
              <div style={{ width: "100%", borderRadius: "4px 4px 0 0", height: `${getBarH(d.value)}px`, background: d.value > 0 ? "var(--accent)" : "var(--surface2)", transition: "height 0.5s ease" }} />
              <div style={{ fontSize: 9, color: "var(--text3)", textTransform: "uppercase", marginTop: 4 }}>{d.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="section">
        <div className="section-header"><div className="section-title">Patterns {rangeSubLabel}</div></div>
        {rangeLogs.length === 0 ? (
          <div className="empty"><div className="empty-icon">📊</div><div className="empty-text">Log activities to see your patterns here.</div></div>
        ) : (
          <>
            {topHappy && <div className="insight-card"><div className="insight-icon">😊</div><div className="insight-text"><strong>{topHappy.cat}</strong> activities brought you the highest happiness {rangeSubLabel} (avg {topHappy.avg.toFixed(1)}/5).</div></div>}
            {topEnergy && <div className="insight-card"><div className="insight-icon">⚡</div><div className="insight-text"><strong>{topEnergy[0]}</strong> was your most energising activity — avg {topEnergy[1].energy > 0 ? "+" : ""}{(topEnergy[1].energy / topEnergy[1].count).toFixed(1)} energy per session.</div></div>}
            <div className="insight-card"><div className="insight-icon">📈</div><div className="insight-text">You logged <strong>{rangeLogs.length} activities</strong> {rangeSubLabel} across {new Set(rangeLogs.map(l => l.category)).size} different life categories.</div></div>
          </>
        )}
      </div>
    </div>
  );
}

function EvidenceScreen({ logs, customCats, onEditEntry }) {
  const grouped = {};
  logs.forEach(l => { if (!grouped[l.date]) grouped[l.date] = []; grouped[l.date].push(l); });
  const sortedDates = Object.keys(grouped).sort().reverse();
  return (
    <div className="screen">
      <div className="evidence-header">
        <div className="evidence-icon">◈</div>
        <div><div className="evidence-title">Evidence Folder</div><div className="evidence-count">{logs.length} contributions recorded</div></div>
      </div>
      {logs.length === 0 ? (
        <div className="empty"><div className="glow-ring">◈</div><div className="empty-text">Your Evidence Folder is empty.<br />Every activity you log builds your record of contribution.</div></div>
      ) : sortedDates.map(date => (
        <div className="day-group" key={date}>
          <div className="day-label">{formatDate(date)}<span style={{ color: "var(--gold)", marginLeft: 6 }}>RM{grouped[date].reduce((s, l) => s + l.value, 0)}</span></div>
          <div className="section">
            {grouped[date].slice().reverse().map(l => (
              <div className="log-item" key={l.id} onClick={() => onEditEntry(l)}>
                <div className="log-dot" style={{ background: getCatColor(l.category, customCats) }} />
                <div><div className="log-name">{l.name}</div><div className="log-time" style={{ marginTop: 3 }}>{l.category} · {l.time}</div></div>
                <div className="log-meta" style={{ marginLeft: "auto" }}>
                  <div className="log-badge" style={{ color: "var(--gold)" }}>RM{l.value}</div>
                  <div className="log-badge" style={{ color: "var(--purple)" }}>😊{l.happiness}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileScreen({ logs }) {
  const totalValue = logs.reduce((s, l) => s + l.value, 0);
  const streak = calcStreak(logs);
  const days = new Set(logs.map(l => l.date)).size;
  const achievements = ACHIEVEMENTS.map(a => ({ ...a, unlocked: a.check(logs) }));
  return (
    <div className="screen">
      <div className="profile-hero">
        <div className="avatar">Q</div>
        <div className="profile-name">Your Journey</div>
        <div className="profile-since">{days > 0 ? `${days} day${days !== 1 ? "s" : ""} of contribution` : "Just getting started"}</div>
      </div>
      <div className="stat-row">
        <div className="stat-box"><div className="stat-n">RM{totalValue}</div><div className="stat-l">Total Value</div></div>
        <div className="stat-box"><div className="stat-n">{logs.length}</div><div className="stat-l">Activities</div></div>
        <div className="stat-box"><div className="stat-n">🔥{streak}</div><div className="stat-l">Streak</div></div>
      </div>
      <div className="section"><div className="section-header"><div className="section-title">Achievements</div></div></div>
      <div className="achievement-grid">
        {achievements.map(a => (
          <div key={a.id} className={`achievement ${a.unlocked ? "unlocked" : "locked"}`}>
            <div className="ach-icon">{a.icon}</div><div className="ach-label">{a.label}</div><div className="ach-desc">{a.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── App Shell ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("today");
  const [showLog, setShowLog] = useState(false);
  const [editEntry, setEditEntry] = useState(null);

  const [logs, setLogs] = useState(() => { try { return JSON.parse(localStorage.getItem("quantify_logs")) || []; } catch { return []; } });
  const [customCats, setCustomCats] = useState(() => { try { return JSON.parse(localStorage.getItem("quantify_custom_cats")) || []; } catch { return []; } });
  const [quickPickCount, setQuickPickCount] = useState(() => { try { return parseInt(localStorage.getItem("quantify_qp_count")) || 8; } catch { return 8; } });

  useEffect(() => { try { localStorage.setItem("quantify_logs", JSON.stringify(logs)); } catch {} }, [logs]);
  useEffect(() => { try { localStorage.setItem("quantify_custom_cats", JSON.stringify(customCats)); } catch {} }, [customCats]);
  useEffect(() => { try { localStorage.setItem("quantify_qp_count", String(quickPickCount)); } catch {} }, [quickPickCount]);

  const saveEntry = useCallback((entry) => {
    setLogs(prev => { const ex = prev.find(l => l.id === entry.id); return ex ? prev.map(l => l.id === entry.id ? entry : l) : [...prev, entry]; });
  }, []);
  const deleteEntry = useCallback((id) => { setLogs(prev => prev.filter(l => l.id !== id)); }, []);
  const addCat = useCallback((name) => { setCustomCats(prev => prev.includes(name) ? prev : [...prev, name]); }, []);

  // FIX: delete a custom category — reassign any entries using it to "Health"
  const deleteCat = useCallback((name) => {
    setCustomCats(prev => prev.filter(c => c !== name));
    setLogs(prev => prev.map(l => l.category === name ? { ...l, category: "Health" } : l));
  }, []);

  const openEdit = (entry) => { setEditEntry(entry); setShowLog(true); };
  const openNew = () => { setEditEntry(null); setShowLog(true); };
  const closeModal = () => { setShowLog(false); setEditEntry(null); };

  const navItems = [
    { id: "today", icon: "◉", label: "Today" },
    { id: "insights", icon: "◈", label: "Insights" },
    { id: "evidence", icon: "✦", label: "Evidence" },
    { id: "profile", icon: "⬡", label: "Profile" },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {tab === "today" && <TodayScreen logs={logs} customCats={customCats} onEditEntry={openEdit} />}
        {tab === "insights" && <InsightsScreen logs={logs} />}
        {tab === "evidence" && <EvidenceScreen logs={logs} customCats={customCats} onEditEntry={openEdit} />}
        {tab === "profile" && <ProfileScreen logs={logs} />}
        <nav className="bottom-nav">
          {navItems.slice(0, 2).map(n => (
            <div key={n.id} className={`nav-item ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}>
              <span className="nav-icon">{n.icon}</span><span className="nav-label">{n.label}</span>
            </div>
          ))}
          <button className="nav-log-btn" onClick={openNew}>+</button>
          {navItems.slice(2).map(n => (
            <div key={n.id} className={`nav-item ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}>
              <span className="nav-icon">{n.icon}</span><span className="nav-label">{n.label}</span>
            </div>
          ))}
        </nav>
        {showLog && (
          <LogModal
            onClose={closeModal} onSave={saveEntry} onDelete={deleteEntry}
            logs={logs} customCats={customCats} onAddCat={addCat} onDeleteCat={deleteCat}
            editEntry={editEntry}
            quickPickCount={quickPickCount} onSetQuickPickCount={setQuickPickCount}
          />
        )}
      </div>
    </>
  );
}
