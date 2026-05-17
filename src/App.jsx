import { useEffect, useMemo, useState } from "react";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSMJxwu6fXxh7MkJ8yzKOUVnah-M_Zwt5RN3mh9rX-46BWH40HsBAT4VWFl83bF9I3N6je-XUspAZOc/pub?gid=0&single=true&output=csv";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const ROLES = [
  ["manager", "매니저"],
  ["crew", "크루"],
  ["daily", "일일지기"],
];
const today = new Date();

const pad = n => String(n).padStart(2, "0");
const dateKey = date =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const keyFromParts = (year, month, day) => `${year}-${pad(month + 1)}-${pad(day)}`;
const todayKey = dateKey(today);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"' && quoted && next === '"') {
      value += '"';
      i += 1;
    } else if (ch === '"') {
      quoted = !quoted;
    } else if (ch === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((ch === "\n" || ch === "\r") && !quoted) {
      if (ch === "\r" && next === "\n") i += 1;
      row.push(value);
      if (row.some(cell => cell.trim() !== "")) rows.push(row);
      row = [];
      value = "";
    } else {
      value += ch;
    }
  }

  row.push(value);
  if (row.some(cell => cell.trim() !== "")) rows.push(row);
  return rows;
}

function normalizeStatus(status) {
  const value = status.trim().toLowerCase();
  if (["확정", "confirmed", "confirm", "done", "true"].includes(value)) return "confirmed";
  return "pending";
}

function scheduleFromCsv(csv) {
  const rows = parseCsv(csv).slice(1);
  const entries = {};

  rows.forEach(cols => {
    const [date, open, close, person, status, memo, hasNight, nightOpen, nightClose, nightPerson] =
      cols.map(col => col.trim());

    if (!date) return;

    entries[date] = {
      date,
      open,
      close,
      person,
      status: normalizeStatus(status),
      memo,
      openNow: false,
      night:
        hasNight.toUpperCase() === "TRUE"
          ? {
              open: nightOpen,
              close: nightClose,
              person: nightPerson,
            }
          : null,
    };
  });

  return entries;
}

function splitSlots(value = "") {
  return value
    .split(/\s*\/\s*|\n/)
    .map(slot => slot.trim())
    .filter(Boolean);
}

function shortName(value = "") {
  const first = splitSlots(value)[0] || value;
  const clean = first.split(/[·,(]/)[0].trim();
  return clean.length > 8 ? `${clean.slice(0, 8)}...` : clean;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function startOfWeek(date) {
  return addDays(date, -date.getDay());
}

function prettyDate(date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export default function App() {
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [role, setRole] = useState("manager");
  const [tab, setTab] = useState("month");
  const [monthCursor, setMonthCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [weekStart, setWeekStart] = useState(startOfWeek(today));
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [isOpenNow, setIsOpenNow] = useState(false);
  const [feedback, setFeedback] = useState({});
  const [feedbackForm, setFeedbackForm] = useState({ author: "", role: "크루", text: "" });
  const [applications, setApplications] = useState([]);
  const [applicationForm, setApplicationForm] = useState({
    name: "",
    role: "크루",
    date: todayKey,
    time: "",
    note: "",
  });

  useEffect(() => {
    let ignore = false;

    async function loadSchedule() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(SHEET_URL);
        if (!res.ok) throw new Error(`CSV를 불러오지 못했습니다. (${res.status})`);
        const csv = await res.text();
        const nextSchedule = scheduleFromCsv(csv);
        if (!ignore) {
          setSchedule(nextSchedule);
          const firstDate = Object.keys(nextSchedule).sort()[0];
          if (!nextSchedule[todayKey] && firstDate) {
            const first = new Date(`${firstDate}T00:00:00`);
            setMonthCursor(new Date(first.getFullYear(), first.getMonth(), 1));
            setSelectedDate(firstDate);
          }
        }
      } catch (err) {
        if (!ignore) setError(err.message || "알 수 없는 오류가 발생했습니다.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadSchedule();
    return () => {
      ignore = true;
    };
  }, []);

  const selected = schedule[selectedDate];
  const todaySchedule = schedule[todayKey];
  const pendingCount = applications.filter(app => app.status === "pending").length;

  const monthCells = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const cells = Array.from({ length: firstDay }, () => null);

    for (let day = 1; day <= lastDate; day += 1) {
      const date = new Date(year, month, day);
      cells.push({ day, date, key: keyFromParts(year, month, day) });
    }

    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [monthCursor]);

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = addDays(weekStart, index);
        return { date, key: dateKey(date) };
      }),
    [weekStart],
  );

  function moveMonth(amount) {
    setMonthCursor(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
    setSelectedDate("");
  }

  function chooseDate(key) {
    setSelectedDate(key);
    setApplicationForm(prev => ({ ...prev, date: key }));
  }

  function statusLabel(entry) {
    return entry?.status === "confirmed" ? "확정" : "검토중";
  }

  function submitFeedback() {
    if (!selectedDate || !feedbackForm.author.trim() || !feedbackForm.text.trim()) return;
    setFeedback(prev => ({
      ...prev,
      [selectedDate]: [
        ...(prev[selectedDate] || []),
        { ...feedbackForm, createdAt: todayKey, id: crypto.randomUUID() },
      ],
    }));
    setFeedbackForm({ author: "", role: "크루", text: "" });
  }

  function submitApplication(event) {
    event.preventDefault();
    if (!applicationForm.name.trim()) return;
    setApplications(prev => [
      {
        ...applicationForm,
        id: crypto.randomUUID(),
        status: "pending",
        createdAt: todayKey,
      },
      ...prev,
    ]);
    setApplicationForm(prev => ({ ...prev, name: "", time: "", note: "" }));
  }

  function approveApplication(id) {
    setApplications(prev =>
      prev.map(app => (app.id === id ? { ...app, status: "approved" } : app)),
    );
  }

  function rejectApplication(id) {
    setApplications(prev =>
      prev.map(app => (app.id === id ? { ...app, status: "rejected" } : app)),
    );
  }

  return (
    <div className="app-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Noto+Sans+KR:wght@300;400;500;700&family=Playfair+Display:wght@600;700&display=swap');

        :root {
          --bg: #F6F1E9;
          --surface: #FFFCF6;
          --surface-2: #EFE7DA;
          --ink: #21170D;
          --muted: #786A59;
          --line: #D8CDBB;
          --green: #E4F4D8;
          --green-ink: #35662C;
          --yellow: #FFF1BF;
          --yellow-ink: #8B6A10;
          --orange: #D8752B;
          --purple: #7B61B0;
          --purple-bg: #EEE7FA;
          --red: #B84738;
        }

        * { box-sizing: border-box; }
        body { margin: 0; background: var(--bg); }
        button, input, textarea, select { font: inherit; }
        button { cursor: pointer; }
        .app-shell {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(255, 252, 246, 0.9), transparent 34rem),
            var(--bg);
          color: var(--ink);
          font-family: 'Noto Sans KR', sans-serif;
        }
        .header {
          display: flex;
          align-items: center;
          gap: 18px;
          min-height: 76px;
          padding: 18px 28px;
          background: rgba(255, 252, 246, 0.78);
          border-bottom: 1px solid var(--line);
          position: sticky;
          top: 0;
          z-index: 5;
          backdrop-filter: blur(12px);
        }
        .brand {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.02em;
          white-space: nowrap;
        }
        .today-strip {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--muted);
          font-size: 13px;
          flex-wrap: wrap;
        }
        .mono { font-family: 'DM Mono', monospace; }
        .time-pill {
          padding: 5px 10px;
          border-radius: 999px;
          background: var(--surface-2);
          color: var(--ink);
        }
        .night-text { color: var(--purple); }
        .role-switch {
          display: flex;
          gap: 6px;
          margin-left: auto;
          padding: 4px;
          border: 1px solid var(--line);
          border-radius: 999px;
          background: var(--bg);
        }
        .role-switch button, .tabs button, .ghost-btn, .solid-btn {
          border: 0;
          border-radius: 999px;
          background: transparent;
        }
        .role-switch button {
          padding: 8px 14px;
          color: var(--muted);
          font-size: 13px;
        }
        .role-switch button.active, .tabs button.active {
          background: var(--ink);
          color: var(--surface);
        }
        .open-toggle {
          padding: 7px 13px;
          border: 1px solid var(--line);
          border-radius: 999px;
          background: var(--surface);
          color: var(--muted);
        }
        .open-toggle.active {
          border-color: var(--green-ink);
          background: var(--green);
          color: var(--green-ink);
          font-weight: 700;
        }
        .main {
          width: min(1380px, calc(100vw - 36px));
          margin: 0 auto;
          padding: 24px 0 42px;
        }
        .tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
        }
        .tabs button {
          padding: 11px 18px;
          background: rgba(255, 252, 246, 0.7);
          color: var(--muted);
          border: 1px solid var(--line);
          font-weight: 700;
        }
        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .title {
          font-family: 'Playfair Display', serif;
          font-size: 34px;
          font-weight: 700;
          letter-spacing: -0.03em;
        }
        .nav-group {
          display: flex;
          gap: 8px;
        }
        .ghost-btn, .solid-btn {
          padding: 10px 14px;
          font-weight: 700;
        }
        .ghost-btn {
          border: 1px solid var(--line);
          background: var(--surface);
          color: var(--ink);
        }
        .solid-btn {
          background: var(--ink);
          color: var(--surface);
        }
        .status-card {
          padding: 28px;
          border: 1px solid var(--line);
          border-radius: 22px;
          background: var(--surface);
          color: var(--muted);
          text-align: center;
        }
        .month-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 360px;
          gap: 18px;
          align-items: start;
        }
        .calendar {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 8px;
        }
        .dow {
          padding: 7px 4px;
          color: var(--muted);
          font-size: 12px;
          font-weight: 700;
          text-align: center;
        }
        .day-cell {
          min-height: 132px;
          padding: 12px;
          border: 1px solid var(--line);
          border-radius: 18px;
          background: var(--surface);
          position: relative;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .day-cell:not(.empty):hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(33, 23, 13, 0.09);
        }
        .day-cell.confirmed { background: var(--green); }
        .day-cell.pending { background: var(--yellow); }
        .day-cell.selected {
          outline: 3px solid var(--ink);
          outline-offset: -3px;
        }
        .day-cell.empty {
          background: transparent;
          border-color: transparent;
        }
        .day-num {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: var(--muted);
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .today-badge {
          padding: 2px 7px;
          border-radius: 999px;
          background: var(--orange);
          color: white;
          font-size: 10px;
        }
        .month-time {
          font-family: 'DM Mono', monospace;
          font-size: clamp(18px, 1.8vw, 28px);
          line-height: 1.05;
          letter-spacing: -0.05em;
        }
        .person-short {
          margin-top: 8px;
          color: var(--muted);
          font-size: 13px;
          font-weight: 700;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .month-night {
          margin-top: 9px;
          color: var(--purple);
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          font-weight: 700;
        }
        .memo-dot {
          position: absolute;
          right: 12px;
          bottom: 12px;
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: var(--orange);
        }
        .detail {
          border: 1px solid var(--line);
          border-radius: 24px;
          background: rgba(255, 252, 246, 0.86);
          padding: 20px;
          position: sticky;
          top: 100px;
        }
        .detail h2, .apps h2 {
          margin: 0;
          font-family: 'Playfair Display', serif;
          font-size: 28px;
        }
        .muted {
          color: var(--muted);
          font-size: 13px;
        }
        .block {
          margin-top: 16px;
          padding: 16px;
          border-radius: 18px;
          background: var(--bg);
        }
        .block.day.confirmed { background: var(--green); }
        .block.day.pending { background: var(--yellow); }
        .block.night {
          border: 1px solid rgba(123, 97, 176, 0.25);
          background: var(--purple-bg);
        }
        .block-label {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          color: var(--muted);
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .detail-time {
          font-family: 'DM Mono', monospace;
          font-size: 26px;
          letter-spacing: -0.04em;
        }
        .slot {
          padding: 10px 0;
          border-top: 1px solid rgba(33, 23, 13, 0.12);
          color: var(--ink);
          font-size: 14px;
          line-height: 1.5;
        }
        .memo {
          color: var(--orange);
          line-height: 1.55;
        }
        .field {
          width: 100%;
          padding: 11px 12px;
          border: 1px solid var(--line);
          border-radius: 13px;
          background: var(--surface);
          color: var(--ink);
        }
        textarea.field { resize: vertical; }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 8px;
        }
        .feedback-item, .application-card {
          padding: 13px;
          border: 1px solid var(--line);
          border-radius: 16px;
          background: var(--surface);
        }
        .feedback-list {
          display: grid;
          gap: 8px;
          margin-top: 12px;
        }
        .weekly-grid {
          display: grid;
          grid-template-columns: repeat(7, minmax(150px, 1fr));
          gap: 14px;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .week-card {
          min-height: 430px;
          padding: 18px;
          border: 1px solid var(--line);
          border-radius: 24px;
          background: var(--surface);
        }
        .week-card.empty {
          background: #E9E1D5;
          color: var(--muted);
        }
        .week-card.today {
          border: 2px solid var(--orange);
        }
        .week-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 22px;
        }
        .week-date {
          font-family: 'Playfair Display', serif;
          font-size: 24px;
        }
        .week-time {
          font-family: 'DM Mono', monospace;
          font-size: 30px;
          line-height: 1.1;
          letter-spacing: -0.06em;
          margin-bottom: 22px;
        }
        .week-slot {
          padding: 13px 0;
          border-top: 1px solid var(--line);
          line-height: 1.5;
        }
        .week-night {
          margin-top: 18px;
          padding: 14px;
          border-radius: 16px;
          background: var(--purple-bg);
          color: var(--purple);
        }
        .apps {
          max-width: 900px;
        }
        .apps-list {
          display: grid;
          gap: 12px;
          margin-top: 18px;
        }
        .application-card {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 16px;
          align-items: center;
        }
        .app-actions {
          display: flex;
          gap: 8px;
        }
        .danger {
          background: #F9E4DF;
          color: var(--red);
        }
        @media (max-width: 980px) {
          .header { align-items: flex-start; flex-direction: column; }
          .role-switch { margin-left: 0; }
          .month-layout { grid-template-columns: 1fr; }
          .detail { position: static; }
        }
      `}</style>

      <header className="header">
        <div className="brand">BBOOKS Ops</div>
        <div className="today-strip">
          <strong>오늘</strong>
          {todaySchedule ? (
            <>
              <span className="time-pill mono">
                낮 {todaySchedule.open}-{todaySchedule.close}
              </span>
              {todaySchedule.night && (
                <span className="time-pill mono night-text">
                  야간 {todaySchedule.night.open}-{todaySchedule.night.close}
                </span>
              )}
            </>
          ) : (
            <span>등록된 일정 없음</span>
          )}
          <button
            className={`open-toggle ${isOpenNow ? "active" : ""}`}
            onClick={() => setIsOpenNow(prev => !prev)}
          >
            {isOpenNow ? "오픈중" : "오픈전"}
          </button>
        </div>
        <div className="role-switch" aria-label="역할 전환">
          {ROLES.map(([value, label]) => (
            <button
              className={role === value ? "active" : ""}
              key={value}
              onClick={() => {
                setRole(value);
                if (value !== "manager" && tab === "apps") setTab("month");
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="main">
        <nav className="tabs" aria-label="뷰 전환">
          {[
            ["month", "월간"],
            ["week", "주간"],
            ...(role === "manager" ? [["apps", `신청 관리${pendingCount ? ` ${pendingCount}` : ""}`]] : []),
          ].map(([value, label]) => (
            <button
              className={tab === value ? "active" : ""}
              key={value}
              onClick={() => setTab(value)}
            >
              {label}
            </button>
          ))}
        </nav>

        {loading && <div className="status-card">구글 시트에서 운영 일정을 불러오는 중입니다.</div>}
        {error && !loading && <div className="status-card">오류: {error}</div>}

        {!loading && !error && tab === "month" && (
          <section className="month-layout">
            <div>
              <div className="toolbar">
                <div className="title">
                  {monthCursor.getFullYear()}년 {monthCursor.getMonth() + 1}월
                </div>
                <div className="nav-group">
                  <button className="ghost-btn" onClick={() => moveMonth(-1)}>
                    이전 달
                  </button>
                  <button className="ghost-btn" onClick={() => moveMonth(1)}>
                    다음 달
                  </button>
                </div>
              </div>

              <div className="calendar">
                {DAYS.map(day => (
                  <div className="dow" key={day}>
                    {day}
                  </div>
                ))}
                {monthCells.map((cell, index) => {
                  if (!cell) return <div className="day-cell empty" key={`empty-${index}`} />;

                  const entry = schedule[cell.key];
                  const isToday = cell.key === todayKey;
                  const className = [
                    "day-cell",
                    entry?.status,
                    selectedDate === cell.key ? "selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <button className={className} key={cell.key} onClick={() => chooseDate(cell.key)}>
                      <div className="day-num">
                        <span>{cell.day}</span>
                        {isToday && <span className="today-badge">오늘</span>}
                      </div>
                      {entry ? (
                        <>
                          <div className="month-time">
                            {entry.open}-{entry.close}
                          </div>
                          <div className="person-short">{shortName(entry.person)}</div>
                          {entry.night && (
                            <div className="month-night">
                              {entry.night.open}-{entry.night.close}
                            </div>
                          )}
                          {entry.memo && <span className="memo-dot" aria-label="메모 있음" />}
                        </>
                      ) : (
                        <div className="muted">일정 없음</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <DetailPanel
              applicationForm={applicationForm}
              entry={selected}
              feedback={feedback[selectedDate] || []}
              feedbackForm={feedbackForm}
              role={role}
              selectedDate={selectedDate}
              setApplicationForm={setApplicationForm}
              setFeedbackForm={setFeedbackForm}
              statusLabel={statusLabel}
              submitApplication={submitApplication}
              submitFeedback={submitFeedback}
            />
          </section>
        )}

        {!loading && !error && tab === "week" && (
          <section>
            <div className="toolbar">
              <div className="title">
                {prettyDate(weekStart)}-{prettyDate(addDays(weekStart, 6))}
              </div>
              <div className="nav-group">
                <button className="ghost-btn" onClick={() => setWeekStart(prev => addDays(prev, -7))}>
                  이전 주
                </button>
                <button className="ghost-btn" onClick={() => setWeekStart(startOfWeek(today))}>
                  이번 주
                </button>
                <button className="ghost-btn" onClick={() => setWeekStart(prev => addDays(prev, 7))}>
                  다음 주
                </button>
              </div>
            </div>

            <div className="weekly-grid">
              {weekDays.map(({ date, key }, index) => {
                const entry = schedule[key];
                const isToday = key === todayKey;
                return (
                  <article
                    className={`week-card ${entry ? "" : "empty"} ${isToday ? "today" : ""}`}
                    key={key}
                  >
                    <div className="week-head">
                      <div>
                        <div className="week-date">{date.getDate()}</div>
                        <div className="muted">{DAYS[index]}요일</div>
                      </div>
                      {isToday && <span className="today-badge">오늘</span>}
                    </div>

                    {entry ? (
                      <>
                        <div className="week-time">
                          {entry.open}
                          <br />
                          {entry.close}
                        </div>
                        {splitSlots(entry.person).map(slot => (
                          <div className="week-slot" key={slot}>
                            {slot}
                          </div>
                        ))}
                        {entry.night && (
                          <div className="week-night">
                            <div className="mono">
                              야간 {entry.night.open}-{entry.night.close}
                            </div>
                            <strong>{entry.night.person}</strong>
                          </div>
                        )}
                        {entry.memo && <p className="memo">{entry.memo}</p>}
                      </>
                    ) : (
                      <div>일정 없는 날</div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {!loading && !error && tab === "apps" && role === "manager" && (
          <Applications
            applications={applications}
            approveApplication={approveApplication}
            rejectApplication={rejectApplication}
          />
        )}
      </main>
    </div>
  );
}

function DetailPanel({
  applicationForm,
  entry,
  feedback,
  feedbackForm,
  role,
  selectedDate,
  setApplicationForm,
  setFeedbackForm,
  statusLabel,
  submitApplication,
  submitFeedback,
}) {
  return (
    <aside className="detail">
      <h2>{selectedDate || "날짜 선택"}</h2>
      <div className="muted">월간 캘린더에서 날짜를 클릭하면 상세가 표시됩니다.</div>

      {entry ? (
        <>
          <div className={`block day ${entry.status}`}>
            <div className="block-label">
              <span>낮 운영</span>
              <span>{statusLabel(entry)}</span>
            </div>
            <div className="detail-time">
              {entry.open}-{entry.close}
            </div>
            {splitSlots(entry.person).map(slot => (
              <div className="slot" key={slot}>
                {slot}
              </div>
            ))}
          </div>

          {entry.night && (
            <div className="block night">
              <div className="block-label night-text">
                <span>야간 지기</span>
              </div>
              <div className="detail-time">
                {entry.night.open}-{entry.night.close}
              </div>
              <div className="slot">{entry.night.person}</div>
            </div>
          )}

          {entry.memo && (
            <div className="block">
              <div className="block-label">메모</div>
              <div className="memo">{entry.memo}</div>
            </div>
          )}
        </>
      ) : (
        <div className="block muted">선택한 날짜에 등록된 일정이 없습니다.</div>
      )}

      <div className="block">
        <div className="block-label">피드백</div>
        <div className="form-grid">
          <input
            className="field"
            onChange={event => setFeedbackForm(prev => ({ ...prev, author: event.target.value }))}
            placeholder="이름"
            value={feedbackForm.author}
          />
          <select
            className="field"
            onChange={event => setFeedbackForm(prev => ({ ...prev, role: event.target.value }))}
            value={feedbackForm.role}
          >
            <option>크루</option>
            <option>일일지기</option>
            <option>매니저</option>
          </select>
        </div>
        <textarea
          className="field"
          onChange={event => setFeedbackForm(prev => ({ ...prev, text: event.target.value }))}
          placeholder="운영 피드백을 남겨주세요."
          rows={3}
          value={feedbackForm.text}
        />
        <button className="solid-btn" onClick={submitFeedback} style={{ marginTop: 8, width: "100%" }}>
          피드백 등록
        </button>
        {feedback.length > 0 && (
          <div className="feedback-list">
            {feedback.map(item => (
              <div className="feedback-item" key={item.id}>
                <strong>
                  {item.author} · {item.role}
                </strong>
                <div className="muted">{item.createdAt}</div>
                <div>{item.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {role !== "manager" && (
        <form className="block" onSubmit={submitApplication}>
          <div className="block-label">운영 신청</div>
          <input
            className="field"
            onChange={event => setApplicationForm(prev => ({ ...prev, name: event.target.value }))}
            placeholder="이름"
            value={applicationForm.name}
          />
          <div className="form-grid" style={{ marginTop: 8 }}>
            <select
              className="field"
              onChange={event => setApplicationForm(prev => ({ ...prev, role: event.target.value }))}
              value={applicationForm.role}
            >
              <option>크루</option>
              <option>일일지기</option>
            </select>
            <input
              className="field"
              onChange={event => setApplicationForm(prev => ({ ...prev, time: event.target.value }))}
              placeholder="가능 시간"
              value={applicationForm.time}
            />
          </div>
          <textarea
            className="field"
            onChange={event => setApplicationForm(prev => ({ ...prev, note: event.target.value }))}
            placeholder="메모"
            rows={2}
            style={{ marginTop: 8 }}
            value={applicationForm.note}
          />
          <button className="solid-btn" style={{ marginTop: 8, width: "100%" }} type="submit">
            신청하기
          </button>
        </form>
      )}
    </aside>
  );
}

function Applications({ applications, approveApplication, rejectApplication }) {
  const pending = applications.filter(app => app.status === "pending");
  const completed = applications.filter(app => app.status !== "pending");

  return (
    <section className="apps">
      <h2>신청 관리</h2>
      <p className="muted">크루/일일지기 역할에서 등록한 신청을 승인하거나 반려합니다.</p>

      <div className="apps-list">
        {pending.length === 0 && <div className="status-card">대기 중인 신청이 없습니다.</div>}
        {pending.map(app => (
          <div className="application-card" key={app.id}>
            <div>
              <strong>
                {app.date} · {app.name} ({app.role})
              </strong>
              <div className="mono">{app.time || "시간 미입력"}</div>
              {app.note && <div className="memo">{app.note}</div>}
              <div className="muted">신청일 {app.createdAt}</div>
            </div>
            <div className="app-actions">
              <button className="solid-btn" onClick={() => approveApplication(app.id)}>
                승인
              </button>
              <button className="ghost-btn danger" onClick={() => rejectApplication(app.id)}>
                반려
              </button>
            </div>
          </div>
        ))}
      </div>

      {completed.length > 0 && (
        <div className="apps-list">
          <div className="block-label">처리 완료</div>
          {completed.map(app => (
            <div className="application-card" key={app.id}>
              <div>
                <strong>
                  {app.date} · {app.name} ({app.role})
                </strong>
                <div className="muted">{app.status === "approved" ? "승인됨" : "반려됨"}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
