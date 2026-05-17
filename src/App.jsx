import { useState } from "react";

const Y0 = 2026, M0 = 4;
const today = new Date();
const D0 = today.getDate();
const todayKey = `2026-05-${String(D0).padStart(2, "0")}`;
const DAYS = ["일","월","화","수","목","금","토"];
const pad = n => String(n).padStart(2, "0");
const dk = (y, m, d) => `${y}-${pad(m+1)}-${pad(d)}`;
const dk5 = d => `2026-05-${pad(d)}`;

const shortP = p => {
  if (!p) return "";
  const s = p.split(" / ")[0].split(" · ")[0].split(" (")[0].trim();
  return s.length > 6 ? s.slice(0,6)+"…" : s;
};

function mkData() {
  const e = {};

  // ── 일요 지기 ──────────────────────────────
  e[dk5(3)] = {
    o:"11:00", c:"18:00",
    p:"책방,파도 (11:00-14:30) / 호세매니저 (14:30-18:00)",
    s:"confirmed", fb:[], open:false
  };
  e[dk5(10)] = {
    o:"11:00", c:"18:00",
    p:"소소안책방 (오전) / 오후 미정",
    s:"pending", fb:[], open:false,
    note:"소소안책방님 오후 가능 여부 확인 필요"
  };
  e[dk5(17)] = {
    o:"11:00", c:"18:00",
    p:"사소한수집소 (오전) / 책방,파도 (13:00-18:00)",
    s:"confirmed", fb:[], open:true,
    night:{ o:"20:00", c:"21:30", p:"썬북친구" }
  };
  e[dk5(24)] = {
    o:"11:00", c:"18:00",
    p:"복슬다람쥐 (오전) / 글꽃선비 (오후)",
    s:"confirmed", fb:[], open:false,
    night:{ o:"20:00", c:"21:30", p:"썬북친구" }
  };
  e[dk5(31)] = {
    o:"13:00", c:"18:00",
    p:"책방,파도 (13:00-18:00)",
    s:"pending", fb:[], open:false,
    note:"오전 지원자 없음 — 13:00 오픈 검토 중",
    night:{ o:"20:00", c:"21:30", p:"썬북친구" }
  };

  // ── 월 새미·아영 / 야간 썬북친구 (5/18~) ──
  e[dk5(4)]  = { o:"10:00", c:"18:00", p:"새미 · 아영", s:"confirmed", fb:[], open:false };
  e[dk5(11)] = { o:"10:00", c:"18:00", p:"새미 · 아영", s:"confirmed", fb:[], open:false };
  e[dk5(18)] = { o:"10:00", c:"18:00", p:"새미 · 아영", s:"confirmed", fb:[], open:false, night:{ o:"20:00", c:"21:30", p:"썬북친구" } };
  e[dk5(25)] = { o:"10:00", c:"18:00", p:"새미 · 아영", s:"confirmed", fb:[], open:false, night:{ o:"20:00", c:"21:30", p:"썬북친구" } };

  // ── 화 다온·미니 / 야간 화오두 (5/19~) ──
  e[dk5(5)]  = { o:"10:00", c:"18:00", p:"다온 · 미니", s:"confirmed", fb:[], open:false };
  e[dk5(12)] = { o:"10:00", c:"18:00", p:"다온 · 미니", s:"confirmed", fb:[], open:false };
  e[dk5(19)] = { o:"10:00", c:"18:00", p:"다온 · 미니", s:"confirmed", fb:[], open:false, night:{ o:"18:30", c:"21:30", p:"화오두" } };
  e[dk5(26)] = { o:"10:00", c:"18:00", p:"다온 · 미니", s:"confirmed", fb:[], open:false, night:{ o:"18:30", c:"21:30", p:"화오두" } };

  // ── 수 아영 / 야간 화오두 (5/20~) ──
  e[dk5(6)]  = { o:"10:00", c:"18:00", p:"아영", s:"confirmed", fb:[], open:false };
  e[dk5(13)] = { o:"10:00", c:"18:00", p:"아영", s:"confirmed", fb:[], open:false };
  e[dk5(20)] = { o:"10:00", c:"18:00", p:"아영", s:"confirmed", fb:[], open:false, night:{ o:"18:30", c:"21:30", p:"화오두" } };
  e[dk5(27)] = { o:"10:00", c:"18:00", p:"아영", s:"confirmed", fb:[], open:false, night:{ o:"18:30", c:"21:30", p:"화오두" } };

  // ── 목 새미 (1·3주 미니 오후3시~) / 야간없음 ──
  e[dk5(7)]  = { o:"10:00", c:"18:00", p:"새미 · 미니 (오후 3시~)", s:"confirmed", fb:[], open:false };
  e[dk5(14)] = { o:"10:00", c:"18:00", p:"새미", s:"confirmed", fb:[], open:false };
  e[dk5(21)] = { o:"10:00", c:"18:00", p:"새미 · 미니 (오후 3시~)", s:"confirmed", fb:[], open:false };
  e[dk5(28)] = { o:"10:00", c:"18:00", p:"새미", s:"confirmed", fb:[], open:false };

  // ── 금 다온·써든리(~17:00) / 야간 썬북친구 (5/22~) ──
  e[dk5(1)]  = { o:"10:00", c:"18:00", p:"다온 · 써든리 (~17:00)", s:"confirmed", fb:[], open:false };
  e[dk5(8)]  = { o:"10:00", c:"18:00", p:"다온 · 써든리 (~17:00)", s:"confirmed", fb:[], open:false };
  e[dk5(15)] = { o:"10:00", c:"18:00", p:"다온 · 써든리 (~17:00)", s:"confirmed", fb:[], open:false };
  e[dk5(22)] = { o:"10:00", c:"18:00", p:"다온 · 써든리 (~17:00)", s:"confirmed", fb:[], open:false, night:{ o:"20:00", c:"21:30", p:"썬북친구" } };
  e[dk5(29)] = { o:"10:00", c:"18:00", p:"다온 · 써든리 (~17:00)", s:"confirmed", fb:[], open:false,
    night:{ o:"20:00", c:"21:30", p:"썬북친구 · 책방,파도" }
  };

  // ── 토 용·미니 / 야간 화오두 (5/23~) ──
  e[dk5(2)]  = { o:"10:00", c:"18:00", p:"용 · 미니", s:"confirmed", fb:[], open:false };
  e[dk5(9)]  = { o:"10:00", c:"18:00", p:"용 · 미니", s:"confirmed", fb:[], open:false };
  e[dk5(16)] = { o:"10:00", c:"18:00", p:"용 · 미니", s:"confirmed", fb:[], open:false };
  e[dk5(23)] = { o:"10:00", c:"18:00", p:"용 · 미니", s:"confirmed", fb:[], open:false, night:{ o:"18:30", c:"21:30", p:"화오두" } };
  e[dk5(30)] = { o:"10:00", c:"18:00", p:"용 · 미니", s:"confirmed", fb:[], open:false,
    note:"행사 있음 (30일)", night:{ o:"18:30", c:"21:30", p:"화오두" }
  };

  return e;
}

const C = {
  bg:"#F6F1E9", surface:"#FEFCF8", primary:"#243B1A",
  accent:"#B8531F", muted:"#7A6B52", border:"#D6CCBA",
  green:"#2F7B2A", amber:"#C47C1A", red:"#B83B3B",
  text:"#1A1208", lightGreen:"#E8F5E4", lightAmber:"#FDF0E0",
  night:"rgba(70,45,120,0.07)", nightBorder:"rgba(90,55,150,0.18)", nightText:"#7B5EAE"
};

const inp = {
  width:"100%", padding:"8px 10px", border:`1px solid ${C.border}`,
  borderRadius:6, background:C.surface, color:C.text,
  fontFamily:"'Noto Sans KR',sans-serif", fontSize:13, boxSizing:"border-box"
};
const btn = (bg, color="#fff") => ({
  padding:"8px 16px", border:"none", borderRadius:6, cursor:"pointer",
  background:bg, color, fontFamily:"'Noto Sans KR',sans-serif", fontSize:13, fontWeight:600
});

export default function App() {
  const [Y, setY] = useState(Y0);
  const [M, setM] = useState(M0);
  const [sch, setSch] = useState(mkData);
  const [apps, setApps] = useState([]);
  const [sel, setSel] = useState(null);
  const [role, setRole] = useState("manager");
  const [tab, setTab] = useState("cal");
  const [editing, setEditing] = useState(false);
  const [ef, setEf] = useState({ o:"11:00", c:"18:00", p:"", s:"confirmed", hasNight:false, no:"18:30", nc:"21:30", np:"", note:"" });
  const [af, setAf] = useState({ o:"11:00", c:"18:00", name:"", role:"크루", note:"" });
  const [ff, setFf] = useState({ author:"", role:"크루", text:"" });
  const [applyDone, setApplyDone] = useState(false);
  const [fbDone, setFbDone] = useState(false);

  const dims = new Date(Y, M+1, 0).getDate();
  const fday = new Date(Y, M, 1).getDay();
  const selKey = sel ? dk(Y, M, sel) : null;
  const selSch = selKey ? sch[selKey] : null;
  const todSch = sch[todayKey];
  const pendingCount = apps.filter(a => a.status === "pending").length;

  function nav(dir) {
    let m = M+dir, y = Y;
    if (m<0){m=11;y--;} if(m>11){m=0;y++;}
    setM(m); setY(y); setSel(null); setEditing(false);
  }

  function clickDay(d) {
    setSel(d); setEditing(false); setApplyDone(false); setFbDone(false);
    const s = sch[dk(Y, M, d)];
    setEf(s
      ? { o:s.o, c:s.c, p:s.p, s:s.s, hasNight:!!s.night,
          no:s.night?.o||"18:30", nc:s.night?.c||"21:30", np:s.night?.p||"", note:s.note||"" }
      : { o:"11:00", c:"18:00", p:"", s:"confirmed", hasNight:false, no:"18:30", nc:"21:30", np:"", note:"" }
    );
  }

  function save() {
    const existing = sch[selKey] || { fb:[], open:false };
    const entry = { ...existing, o:ef.o, c:ef.c, p:ef.p, s:ef.s };
    if (ef.note) entry.note = ef.note; else delete entry.note;
    if (ef.hasNight) entry.night = { o:ef.no, c:ef.nc, p:ef.np };
    else delete entry.night;
    setSch(prev => ({ ...prev, [selKey]: entry }));
    setEditing(false);
  }

  function del() {
    setSch(p => { const n={...p}; delete n[selKey]; return n; });
    setEditing(false); setSel(null);
  }

  function approve(id) {
    const a = apps.find(x => x.id===id);
    if (!a) return;
    setSch(p => ({ ...p, [a.date]:{ o:a.o, c:a.c, p:`${a.name} (${a.role})`, s:"confirmed", fb:p[a.date]?.fb||[], open:false } }));
    setApps(p => p.map(x => x.id===id ? {...x,status:"approved"} : x));
  }
  function reject(id) { setApps(p => p.map(x => x.id===id ? {...x,status:"rejected"} : x)); }

  function submitApp() {
    if (!selKey || !af.name) return;
    setApps(p => [...p, { id:Date.now(), date:selKey, o:af.o, c:af.c, name:af.name, role:af.role, note:af.note, status:"pending", at:todayKey }]);
    setAf({ o:"11:00", c:"18:00", name:"", role:"크루", note:"" });
    setApplyDone(true);
  }

  function submitFb() {
    if (!selKey || !ff.text || !ff.author) return;
    setSch(p => ({ ...p, [selKey]:{ ...p[selKey], fb:[...(p[selKey]?.fb||[]), {...ff, date:todayKey}] } }));
    setFf({ author:"", role:"크루", text:"" });
    setFbDone(true);
    setTimeout(() => setFbDone(false), 2000);
  }

  function toggleOpen() {
    if (!todSch) return;
    setSch(p => ({ ...p, [todayKey]:{ ...p[todayKey], open:!p[todayKey].open } }));
  }

  const cells = [];
  for (let i=0;i<fday;i++) cells.push(null);
  for (let d=1;d<=dims;d++) cells.push(d);

  const isToday = d => Y===Y0 && M===M0 && d===D0;
  const isPast = d => new Date(Y,M,d) < new Date(Y0,M0,D0);
  const schColor = s => s?.s==="confirmed" ? C.lightGreen : s?.s==="pending" ? C.lightAmber : C.bg;
  const dotColor = s => s?.s==="confirmed" ? C.green : C.amber;

  return (
    <div style={{ background:C.bg, minHeight:"100vh", fontFamily:"'Noto Sans KR',sans-serif", color:C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,600;1,500&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        button:hover{filter:brightness(0.92)}
        input:focus,select:focus,textarea:focus{border-color:${C.primary}!important;outline:none}
        .dc:hover{transform:translateY(-1px);box-shadow:0 2px 8px rgba(36,59,26,0.12)}
        .dc{transition:all 0.15s ease}
        .fi{animation:fi 0.2s ease}
        @keyframes fi{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* ── Header ── */}
      <div style={{ background:C.primary, padding:"0 20px", display:"flex", alignItems:"center", height:56, gap:14, flexWrap:"wrap" }}>
        <div style={{ fontFamily:"'Playfair Display',serif", color:"#fff", fontSize:18, letterSpacing:0.5, flexShrink:0 }}>
          비북스 <span style={{ opacity:0.5, fontSize:12, fontStyle:"italic", fontWeight:400 }}>오픈 관리</span>
        </div>
        {todSch && Y===Y0 && M===M0 && (
          <div style={{ display:"flex", alignItems:"center", gap:10, marginLeft:6 }}>
            <span style={{ color:"rgba(255,255,255,0.55)", fontSize:11 }}>오늘</span>
            <span style={{ fontFamily:"'DM Mono',monospace", color:"#fff", fontSize:12 }}>{todSch.o}–{todSch.c}</span>
            {todSch.night && (
              <span style={{ fontFamily:"'DM Mono',monospace", color:"rgba(200,175,255,0.8)", fontSize:11 }}>
                야간 {todSch.night.o}–{todSch.night.c}
              </span>
            )}
            <button onClick={toggleOpen} style={{
              padding:"3px 12px", borderRadius:20, cursor:"pointer", fontSize:11, fontWeight:600,
              border:`1.5px solid ${todSch.open?"#6EE26B":"rgba(255,255,255,0.3)"}`,
              background:todSch.open?"rgba(46,123,42,0.5)":"transparent", color:"#fff"
            }}>{todSch.open?"● 오픈 중":"○ 오픈 전"}</button>
          </div>
        )}
        <div style={{ marginLeft:"auto", display:"flex", gap:4 }}>
          {[["manager","매니저"],["crew","크루"],["daily","일일지기"]].map(([r,l]) => (
            <button key={r} onClick={() => setRole(r)} style={{
              padding:"4px 11px", borderRadius:20, cursor:"pointer", fontSize:11,
              fontWeight:role===r?600:400, border:"1px solid rgba(255,255,255,0.3)",
              background:role===r?"rgba(255,255,255,0.18)":"transparent", color:"#fff"
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* ── Tab Nav ── */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"0 20px", display:"flex" }}>
        {[{id:"cal",label:"캘린더"}, role==="manager"?{id:"apps",label:`신청 관리${pendingCount?` (${pendingCount})`:""}`}:null].filter(Boolean).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:"12px 18px", border:"none", cursor:"pointer", fontSize:13,
            borderBottom:tab===t.id?`2.5px solid ${C.primary}`:"2.5px solid transparent",
            background:"transparent", color:tab===t.id?C.primary:C.muted,
            fontWeight:tab===t.id?600:400, fontFamily:"'Noto Sans KR',sans-serif", marginBottom:-1
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ display:"flex", gap:18, padding:18, maxWidth:1100, margin:"0 auto" }}>

        {/* ═══ CALENDAR TAB ═══ */}
        {tab==="cal" && (<>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <button onClick={() => nav(-1)} style={{ ...btn(C.surface,C.text), border:`1px solid ${C.border}`, padding:"5px 13px" }}>‹</button>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:21 }}>{Y}년 {M+1}월</div>
              <button onClick={() => nav(1)} style={{ ...btn(C.surface,C.text), border:`1px solid ${C.border}`, padding:"5px 13px" }}>›</button>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3, marginBottom:5 }}>
              {DAYS.map((d,i) => (
                <div key={d} style={{ textAlign:"center", fontSize:11, fontWeight:500, padding:"3px 0",
                  color:i===0?"#B83B3B":i===6?"#2B5AB8":C.muted }}>{d}</div>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3 }}>
              {cells.map((d,i) => {
                if (!d) return <div key={`e${i}`}/>;
                const key = dk(Y,M,d);
                const s = sch[key];
                const isTod = isToday(d);
                const isPst = isPast(d);
                const isSel = sel===d;
                const dow = (fday+d-1)%7;
                return (
                  <div key={d} className="dc" onClick={() => clickDay(d)} style={{
                    background:isSel?C.primary:s?schColor(s):C.surface,
                    border:`1.5px solid ${isTod?C.accent:isSel?"transparent":C.border}`,
                    borderRadius:8, padding:"6px 6px 5px", cursor:"pointer", minHeight:78,
                    opacity:isPst&&!s?0.35:1, position:"relative"
                  }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
                      <span style={{ fontSize:12, fontWeight:isTod?700:400,
                        color:isSel?"#fff":dow===0?"#B83B3B":dow===6?"#2B5AB8":isPst?C.muted:C.text }}>{d}</span>
                      <div style={{ display:"flex", gap:3 }}>
                        {s?.open && <span style={{ width:5,height:5,borderRadius:"50%",background:"#6EE26B",display:"block" }}/>}
                        {!s?.open && s?.s==="pending" && !isSel && <span style={{ width:5,height:5,borderRadius:"50%",background:C.amber,display:"block" }}/>}
                      </div>
                    </div>
                    {s && (<>
                      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, lineHeight:1.3,
                        color:isSel?"rgba(255,255,255,0.9)":dotColor(s) }}>{s.o}–{s.c}</div>
                      <div style={{ fontSize:9.5, color:isSel?"rgba(255,255,255,0.65)":C.muted,
                        marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {shortP(s.p)}
                      </div>
                      {s.night && (
                        <div style={{ fontSize:9, marginTop:2,
                          color:isSel?"rgba(205,185,255,0.85)":C.nightText }}>
                          야간 {s.night.p.split(" · ")[0]}
                        </div>
                      )}
                    </>)}
                    {isTod && <div style={{ position:"absolute",top:4,right:5,width:5,height:5,borderRadius:"50%",background:C.accent }}/>}
                    {s?.note && !isSel && <div style={{ position:"absolute",bottom:4,right:5,width:4,height:4,borderRadius:"50%",background:C.amber,opacity:0.8 }}/>}
                  </div>
                );
              })}
            </div>

            <div style={{ display:"flex", gap:14, marginTop:12, fontSize:11, color:C.muted, flexWrap:"wrap" }}>
              {[[C.green,"낮 확정"],[C.amber,"검토중"],[C.nightText,"야간있음"],[C.accent,"오늘"],["#6EE26B","오픈중"]].map(([col,label]) => (
                <div key={label} style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <span style={{ width:7,height:7,borderRadius:"50%",background:col,display:"inline-block" }}/>{label}
                </div>
              ))}
            </div>
          </div>

          {/* ── Detail Panel ── */}
          {sel && (
            <div className="fi" style={{ width:316, flexShrink:0, background:C.surface, borderRadius:12, border:`1px solid ${C.border}`, padding:18, alignSelf:"flex-start" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:15 }}>
                <div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20 }}>{M+1}월 {sel}일</div>
                  <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{DAYS[(fday+sel-1)%7]}요일</div>
                </div>
                <button onClick={() => { setSel(null); setEditing(false); }} style={{ background:"none",border:"none",cursor:"pointer",fontSize:20,color:C.muted,lineHeight:1,padding:2 }}>×</button>
              </div>

              {/* Day block */}
              {selSch && !editing && (
                <div style={{ background:schColor(selSch), borderRadius:10, padding:13, marginBottom:selSch.night||selSch.note?8:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:7 }}>
                    <div>
                      <div style={{ fontSize:10, color:dotColor(selSch), fontWeight:600, letterSpacing:0.5, marginBottom:3 }}>낮 운영</div>
                      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:17, fontWeight:500 }}>{selSch.o} — {selSch.c}</div>
                    </div>
                    <span style={{ fontSize:10, padding:"3px 9px", borderRadius:12, background:dotColor(selSch), color:"#fff", fontWeight:600, flexShrink:0, marginLeft:8 }}>
                      {selSch.s==="confirmed"?"확정":"검토중"}
                    </span>
                  </div>
                  {selSch.p.split(" / ").map((slot,i) => (
                    <div key={i} style={{ fontSize:12, color:C.muted, marginTop:i===0?4:3,
                      paddingLeft:8, borderLeft:`2px solid ${dotColor(selSch)}`, lineHeight:1.45 }}>
                      {slot}
                    </div>
                  ))}
                  {selSch.open && <div style={{ fontSize:12, color:C.green, fontWeight:600, marginTop:8 }}>● 현재 오픈 중</div>}
                </div>
              )}

              {/* Night block */}
              {selSch?.night && !editing && (
                <div style={{ background:C.night, border:`1px solid ${C.nightBorder}`, borderRadius:10, padding:13, marginBottom:selSch.note?8:12 }}>
                  <div style={{ fontSize:10, color:C.nightText, fontWeight:600, letterSpacing:0.5, marginBottom:5 }}>야간 지기</div>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:17, fontWeight:500, color:C.text }}>{selSch.night.o} — {selSch.night.c}</div>
                  <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>{selSch.night.p}</div>
                </div>
              )}

              {/* Note */}
              {selSch?.note && !editing && (
                <div style={{ background:C.lightAmber, borderRadius:8, padding:"9px 11px", marginBottom:12, fontSize:12, color:C.amber, lineHeight:1.5 }}>
                  ※ {selSch.note}
                </div>
              )}

              {!selSch && !editing && (
                <div style={{ background:"#F3EFE7", borderRadius:10, padding:14, marginBottom:12, textAlign:"center", color:C.muted, fontSize:13 }}>일정 없음</div>
              )}

              {/* Edit form */}
              {editing && role==="manager" && (
                <div style={{ marginBottom:12 }} className="fi">
                  <div style={{ fontSize:11, color:C.primary, fontWeight:600, marginBottom:7 }}>낮 운영</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                    <div><label style={{ fontSize:10, color:C.muted, display:"block", marginBottom:3 }}>오픈</label>
                      <input type="time" value={ef.o} onChange={e => setEf(p => ({...p,o:e.target.value}))} style={inp}/></div>
                    <div><label style={{ fontSize:10, color:C.muted, display:"block", marginBottom:3 }}>마감</label>
                      <input type="time" value={ef.c} onChange={e => setEf(p => ({...p,c:e.target.value}))} style={inp}/></div>
                  </div>
                  <textarea value={ef.p} onChange={e => setEf(p => ({...p,p:e.target.value}))}
                    placeholder={"담당자 (' / '로 구분)\n예: 새미 · 아영 / 추가지기 (13:00~)"} rows={2}
                    style={{ ...inp, resize:"vertical", marginBottom:8 }}/>
                  <select value={ef.s} onChange={e => setEf(p => ({...p,s:e.target.value}))} style={{ ...inp, marginBottom:12 }}>
                    <option value="confirmed">확정</option>
                    <option value="pending">검토중</option>
                  </select>

                  <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:10, marginBottom:10 }}>
                    <label style={{ display:"flex", alignItems:"center", gap:7, cursor:"pointer", fontSize:12, color:C.nightText, fontWeight:600, marginBottom:ef.hasNight?10:0 }}>
                      <input type="checkbox" checked={ef.hasNight} onChange={e => setEf(p => ({...p,hasNight:e.target.checked}))} style={{ width:13,height:13 }}/>
                      야간 지기 등록
                    </label>
                    {ef.hasNight && (
                      <div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:7 }}>
                          <div><label style={{ fontSize:10, color:C.muted, display:"block", marginBottom:3 }}>야간 시작</label>
                            <input type="time" value={ef.no} onChange={e => setEf(p => ({...p,no:e.target.value}))} style={inp}/></div>
                          <div><label style={{ fontSize:10, color:C.muted, display:"block", marginBottom:3 }}>야간 종료</label>
                            <input type="time" value={ef.nc} onChange={e => setEf(p => ({...p,nc:e.target.value}))} style={inp}/></div>
                        </div>
                        <input value={ef.np} onChange={e => setEf(p => ({...p,np:e.target.value}))}
                          placeholder="야간 지기 이름 (' · '로 구분)" style={inp}/>
                      </div>
                    )}
                  </div>

                  <textarea value={ef.note||""} onChange={e => setEf(p => ({...p,note:e.target.value}))}
                    placeholder="메모 (선택)" rows={1} style={{ ...inp, resize:"vertical", marginBottom:10 }}/>

                  <div style={{ display:"flex", gap:8, marginBottom:6 }}>
                    <button onClick={save} style={{ ...btn(C.primary), flex:1 }}>저장</button>
                    <button onClick={() => setEditing(false)} style={{ ...btn("#EDE8E0",C.muted), flex:1 }}>취소</button>
                  </div>
                  {selSch && <button onClick={del} style={{ ...btn("#FDF0F0",C.red), width:"100%", border:`1px solid ${C.red}` }}>일정 삭제</button>}
                </div>
              )}

              {role==="manager" && !editing && (
                <button onClick={() => setEditing(true)} style={{ ...btn(C.primary), width:"100%", marginBottom:14 }}>
                  {selSch?"✏️ 수정":"+ 일정 추가"}
                </button>
              )}

              {/* Apply (crew/daily) */}
              {role!=="manager" && !applyDone && (
                <div style={{ marginBottom:14, borderBottom:`1px solid ${C.border}`, paddingBottom:16 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:C.primary, marginBottom:10 }}>오픈 신청</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                    <div><label style={{ fontSize:11, color:C.muted, display:"block", marginBottom:3 }}>오픈</label>
                      <input type="time" value={af.o} onChange={e => setAf(p => ({...p,o:e.target.value}))} style={inp}/></div>
                    <div><label style={{ fontSize:11, color:C.muted, display:"block", marginBottom:3 }}>마감</label>
                      <input type="time" value={af.c} onChange={e => setAf(p => ({...p,c:e.target.value}))} style={inp}/></div>
                  </div>
                  <input value={af.name} onChange={e => setAf(p => ({...p,name:e.target.value}))} placeholder="이름" style={{ ...inp, marginBottom:8 }}/>
                  <select value={af.role} onChange={e => setAf(p => ({...p,role:e.target.value}))} style={{ ...inp, marginBottom:8 }}>
                    <option value="크루">크루</option><option value="일일지기">일일지기</option><option value="점주">점주</option>
                  </select>
                  <textarea value={af.note} onChange={e => setAf(p => ({...p,note:e.target.value}))} placeholder="전달 사항 (선택)" rows={2} style={{ ...inp, resize:"vertical", marginBottom:8 }}/>
                  <button onClick={submitApp} disabled={!af.name} style={{ ...btn(af.name?C.primary:C.border), width:"100%" }}>신청하기</button>
                </div>
              )}
              {role!=="manager" && applyDone && (
                <div className="fi" style={{ background:C.lightGreen, borderRadius:8, padding:12, marginBottom:14, fontSize:13, color:C.green, fontWeight:500, textAlign:"center", borderBottom:`1px solid ${C.border}`, paddingBottom:16 }}>
                  ✓ 신청 완료! 매니저 검토 후 반영됩니다.
                </div>
              )}

              {/* Feedback */}
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:C.primary, marginBottom:10 }}>
                  피드백{(selSch?.fb?.length||0)>0?` (${selSch.fb.length})`:""}
                </div>
                {selSch?.fb?.length>0 && (
                  <div style={{ marginBottom:12 }}>
                    {selSch.fb.map((f,i) => (
                      <div key={i} style={{ background:C.bg, borderRadius:8, padding:10, marginBottom:6 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3, fontSize:11 }}>
                          <span style={{ fontWeight:600 }}>{f.author} <span style={{ color:C.muted, fontWeight:400 }}>({f.role})</span></span>
                          <span style={{ color:C.muted }}>{f.date}</span>
                        </div>
                        <div style={{ fontSize:12, lineHeight:1.55 }}>{f.text}</div>
                      </div>
                    ))}
                  </div>
                )}
                {fbDone && <div className="fi" style={{ background:C.lightGreen, borderRadius:6, padding:"8px 12px", marginBottom:8, fontSize:12, color:C.green }}>✓ 피드백이 등록되었습니다</div>}
                {!fbDone && (<>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                    <input value={ff.author} onChange={e => setFf(p => ({...p,author:e.target.value}))} placeholder="이름" style={inp}/>
                    <select value={ff.role} onChange={e => setFf(p => ({...p,role:e.target.value}))} style={inp}>
                      <option value="크루">크루</option><option value="일일지기">일일지기</option>
                      <option value="점주">점주</option><option value="매니저">매니저</option>
                    </select>
                  </div>
                  <textarea value={ff.text} onChange={e => setFf(p => ({...p,text:e.target.value}))} placeholder="운영 피드백을 남겨주세요..." rows={3} style={{ ...inp, resize:"vertical", marginBottom:8 }}/>
                  <button onClick={submitFb} disabled={!ff.text||!ff.author} style={{ ...btn(!ff.text||!ff.author?C.border:"#EDE8E0",C.primary), width:"100%", fontWeight:500 }}>피드백 남기기</button>
                </>)}
              </div>
            </div>
          )}
        </>)}

        {/* ═══ APPS TAB ═══ */}
        {tab==="apps" && role==="manager" && (
          <div style={{ flex:1 }} className="fi">
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:21, marginBottom:20 }}>신청 관리</div>
            <div style={{ marginBottom:28 }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.primary, marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
                대기 중
                {pendingCount>0 && <span style={{ background:C.amber, color:"#fff", borderRadius:12, fontSize:11, padding:"2px 8px" }}>{pendingCount}</span>}
              </div>
              {pendingCount===0 && (
                <div style={{ background:C.surface, borderRadius:10, padding:24, textAlign:"center", color:C.muted, fontSize:13, border:`1px solid ${C.border}` }}>대기 중인 신청이 없습니다</div>
              )}
              {apps.filter(a => a.status==="pending").map(a => (
                <div key={a.id} style={{ background:C.surface, borderRadius:10, padding:16, marginBottom:10, border:`1px solid ${C.border}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:14 }}>{a.date} <span style={{ color:C.muted, fontWeight:400, fontSize:12 }}>— {a.name} ({a.role})</span></div>
                      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:15, color:C.primary, marginTop:4 }}>{a.o} — {a.c}</div>
                      <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>신청일: {a.at}</div>
                    </div>
                    <span style={{ fontSize:10, background:C.lightAmber, color:C.amber, padding:"3px 9px", borderRadius:12, fontWeight:600, flexShrink:0 }}>대기중</span>
                  </div>
                  {a.note && <div style={{ fontSize:12, color:C.muted, background:C.bg, borderRadius:6, padding:"8px 10px", marginBottom:12, lineHeight:1.5 }}>{a.note}</div>}
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={() => approve(a.id)} style={{ ...btn(C.green), flex:1 }}>✓ 승인</button>
                    <button onClick={() => reject(a.id)} style={{ ...btn("#FDF0F0",C.red), flex:1, border:`1px solid ${C.red}` }}>✗ 반려</button>
                  </div>
                </div>
              ))}
            </div>
            {apps.filter(a => a.status!=="pending").length>0 && (
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:C.muted, marginBottom:12 }}>처리 완료</div>
                {apps.filter(a => a.status!=="pending").map(a => (
                  <div key={a.id} style={{ background:C.surface, borderRadius:10, padding:14, marginBottom:8, border:`1px solid ${C.border}`, opacity:0.6 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:500 }}>{a.date} — {a.name} <span style={{ color:C.muted, fontWeight:400 }}>({a.role})</span></div>
                        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:C.muted, marginTop:3 }}>{a.o}–{a.c}</div>
                      </div>
                      <span style={{ fontSize:10, padding:"3px 9px", borderRadius:12, fontWeight:600,
                        background:a.status==="approved"?C.lightGreen:"#FDF0F0", color:a.status==="approved"?C.green:C.red }}>
                        {a.status==="approved"?"승인":"반려"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
