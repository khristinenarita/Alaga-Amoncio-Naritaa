"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import "./alaga.css";

type Role = "" | "p" | "f";
type Screen =
  | "role" | "auth"
  | "home" | "meds" | "sos" | "sent"
  | "fhome" | "fmeds" | "fadd" | "fmsgs";
type Profile = { id: string; role: "patient" | "family"; full_name: string; family_code: string | null; patient_id: string | null };
type MedRow = { id: string; name: string; note: string; time_of_day: string; added_by: string | null; added_by_name: string | null };
type LogRow = { medicine_id: string; taken_at: string };
type MsgRow = { id: string; kind: "info" | "sos" | "sos_cancel"; text: string; created_at: string };

const NAV_P: [Screen, string, string][] = [["home", "⌂", "Home"], ["meds", "✚", "Medicines"], ["sos", "!", "SOS"]];
const NAV_F: [Screen, string, string][] = [["fhome", "⌂", "Overview"], ["fmeds", "✚", "Medicines"], ["fmsgs", "✉", "Messages"]];

const first = (n: string) => n.split(" ")[0];
const clock = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
const label = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return ((h + 11) % 12 + 1) + ":" + String(m).padStart(2, "0") + (h < 12 ? " AM" : " PM");
};

export default function Page() {
  const [booting, setBooting] = useState(true);
  const [busy, setBusy] = useState(false);
  const [cur, setCur] = useState<Screen>("role");
  const [role, setRole] = useState<Role>("");
  const [authMode, setAuthMode] = useState<"in" | "up">("in");

  const [me, setMe] = useState<Profile | null>(null);
  const [patient, setPatient] = useState<Profile | null>(null);
  const [family, setFamily] = useState<Profile[]>([]);
  const [meds, setMeds] = useState<MedRow[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [msgs, setMsgs] = useState<MsgRow[]>([]);
  const [unread, setUnread] = useState(0);

  const [iName, setIName] = useState("");
  const [iEmail, setIEmail] = useState("");
  const [iPass, setIPass] = useState("");
  const [iCode, setICode] = useState("");
  const [err, setErr] = useState("");

  const [mName, setMName] = useState("");
  const [mNote, setMNote] = useState("");
  const [mTime, setMTime] = useState("09:00");
  const [mErr, setMErr] = useState("");

  const [modal, setModal] = useState(false);
  const [banner, setBanner] = useState<{ head: string; text: string; sos: boolean } | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const bannerTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const curRef = useRef<Screen>("role");
  curRef.current = cur;

  const pid = me ? (me.role === "patient" ? me.id : me.patient_id) : null;
  const pName = patient ? first(patient.full_name) : "Remy";
  const fName =
    me?.role === "family"
      ? first(me.full_name)
      : family.length
        ? family.map((f) => first(f.full_name)).join(" and ")
        : "your family";

  /* ---------- small helpers ---------- */
  function toast(m: string) {
    setToastMsg(m);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 2200);
  }
  function showBanner(head: string, text: string, isSos: boolean, ms = 3400) {
    setBanner({ head, text, sos: isSos });
    clearTimeout(bannerTimer.current);
    bannerTimer.current = setTimeout(() => setBanner(null), ms);
  }
  function go(id: Screen) {
    if (id === "fadd") { setMName(""); setMNote(""); setMTime("09:00"); setMErr(""); }
    if (id === "fmsgs") setUnread(0);
    setCur(id);
  }

  /* ---------- loading data ---------- */
  const loadAll = useCallback(async (patientId: string) => {
    const [m, l, g, p] = await Promise.all([
      supabase.from("medicines").select("*").eq("patient_id", patientId).order("time_of_day"),
      supabase.from("dose_logs").select("medicine_id,taken_at").eq("patient_id", patientId).eq("taken_on", today()),
      supabase.from("messages").select("*").eq("patient_id", patientId).order("created_at", { ascending: false }).limit(50),
      supabase.from("profiles").select("*").or(`id.eq.${patientId},patient_id.eq.${patientId}`),
    ]);
    if (m.data) setMeds(m.data as MedRow[]);
    if (l.data) setLogs(l.data as LogRow[]);
    if (g.data) setMsgs(g.data as MsgRow[]);
    if (p.data) {
      const rows = p.data as Profile[];
      setPatient(rows.find((r) => r.id === patientId) ?? null);
      setFamily(rows.filter((r) => r.role === "family"));
    }
  }, []);

  // Opens the app for a signed-in user. Returns an error text or "".
  const bootstrap = useCallback(
    async (userId: string, expected: Role | "any"): Promise<string> => {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
      const prof = data as Profile | null;
      if (!prof) { await supabase.auth.signOut(); return "We could not find this account. Try creating it again."; }
      const r: Role = prof.role === "patient" ? "p" : "f";
      if (expected !== "any" && expected !== r) {
        await supabase.auth.signOut();
        return "This is a " + prof.role + " account. Go back and pick “I'm " + (r === "p" ? "the patient" : "family") + "”.";
      }
      const patientId = prof.role === "patient" ? prof.id : prof.patient_id!;
      setMe(prof);
      setRole(r);
      await loadAll(patientId);
      setCur(r === "p" ? "home" : "fhome");
      return "";
    },
    [loadAll]
  );

  // Keep the user signed in after a refresh
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) await bootstrap(data.session.user.id, "any");
      setBooting(false);
    })();
  }, [bootstrap]);

  // Real-time: the screen updates by itself when something changes
  useEffect(() => {
    if (!pid || !me) return;
    const ch = supabase
      .channel("alaga-" + pid)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "medicines", filter: "patient_id=eq." + pid },
        (payload: { new: unknown }) => {
          loadAll(pid);
          const row = payload.new as MedRow;
          if (me.role === "patient" && row.added_by !== me.id)
            showBanner("New medicine", (row.added_by_name ?? "Your family") + " added " + row.name + " at " + label(row.time_of_day) + ".", false, 4200);
        })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "dose_logs", filter: "patient_id=eq." + pid },
        () => loadAll(pid))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: "patient_id=eq." + pid },
        (payload: { new: unknown }) => {
          loadAll(pid);
          const row = payload.new as MsgRow;
          if (me.role === "family") {
            if (curRef.current !== "fmsgs") setUnread((u) => u + 1);
            showBanner("New message", row.text, row.kind === "sos");
          }
        })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [pid, me, loadAll]);

  /* ---------- accounts ---------- */
  function pickRole(r: Role) {
    setRole(r); setAuthMode("in");
    setIName(""); setIEmail(""); setIPass(""); setICode(""); setErr("");
    go("auth");
  }

  async function submitAuth() {
    if (!role || busy) return;
    const email = iEmail.trim().toLowerCase();
    const name = iName.trim();
    const code = iCode.trim().toUpperCase();
    setErr("");

    if (authMode === "in") {
      if (!email || !iPass) return setErr("Please fill in every box.");
      setBusy(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: iPass });
      if (error || !data.user) { setBusy(false); return setErr("Wrong email or password. Please try again."); }
      const problem = await bootstrap(data.user.id, role);
      setBusy(false);
      if (problem) setErr(problem);
      return;
    }

    if (!name || !email || !iPass) return setErr("Please fill in every box.");
    if (iPass.length < 6) return setErr("Password needs at least 6 characters.");
    setBusy(true);
    if (role === "f") {
      const { data: ok } = await supabase.rpc("code_exists", { c: code });
      if (!ok) { setBusy(false); return setErr("Family code not found. Ask the patient for their code."); }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password: iPass,
      options: { data: { role: role === "p" ? "patient" : "family", full_name: name, family_code: code } },
    });
    if (error) {
      setBusy(false);
      return setErr(/registered|already/i.test(error.message) ? "That email is already used. Try logging in." : error.message);
    }
    if (!data.session) {
      setBusy(false);
      return setErr("Account created. Check your email to confirm it, then log in.");
    }
    const problem = await bootstrap(data.user!.id, role);
    setBusy(false);
    if (problem) return setErr(problem);
    toast(role === "p" ? "Account created." : "Account created. You are linked.");
  }

  async function logout() {
    await supabase.auth.signOut();
    setMe(null); setPatient(null); setFamily([]); setMeds([]); setLogs([]); setMsgs([]);
    setUnread(0); setRole(""); setBanner(null);
    setCur("role");
  }

  /* ---------- patient actions ---------- */
  async function sendMessage(kind: "info" | "sos" | "sos_cancel", text: string) {
    if (!me) return;
    const { error } = await supabase.from("messages").insert({ patient_id: me.id, kind, text });
    if (error) return toast("Could not send. Check your internet.");
    showBanner("Message sent to " + fName, text, kind === "sos");
    loadAll(me.id);
  }
  async function take(m: MedRow) {
    if (!me) return;
    const { error } = await supabase.from("dose_logs").insert({ medicine_id: m.id, patient_id: me.id, taken_on: today() });
    if (error) return toast("Could not save. Check your internet.");
    await sendMessage("info", pName + " took " + m.name + " at " + clock(new Date().toISOString()) + ".");
  }
  async function sendSos() {
    setModal(false);
    go("sent");
    await sendMessage("sos", "SOS from " + pName + " at " + clock(new Date().toISOString()) + ". Location: Davao City. Please call now.");
  }
  async function cancelSos() {
    go("home");
    await sendMessage("sos_cancel", pName + " is okay. The SOS alert was cancelled.");
  }
  function speak() {
    try {
      const n = meds.find((m) => !logs.some((l) => l.medicine_id === m.id));
      speechSynthesis.speak(new SpeechSynthesisUtterance(
        n ? "Your next medicine is " + n.name + " at " + label(n.time_of_day) : "You have taken all your medicines today."));
    } catch { toast("Voice not available"); }
  }

  /* ---------- family action ---------- */
  async function assignMed() {
    if (!me || !pid || busy) return;
    const n = mName.trim();
    if (!n || !mTime) return setMErr("Please enter the medicine name and the time.");
    setBusy(true);
    const { error } = await supabase.from("medicines").insert({
      patient_id: pid, name: n, note: mNote.trim() || "Take as directed",
      time_of_day: mTime + ":00", added_by: me.id, added_by_name: first(me.full_name),
    });
    setBusy(false);
    if (error) return setMErr("Could not save. Please try again.");
    await loadAll(pid);
    go("fmeds");
    toast(n + " assigned to " + pName);
  }

  /* ---------- derived ---------- */
  const doneAt = (id: string) => {
    const l = logs.find((x) => x.medicine_id === id);
    return l ? clock(l.taken_at) : null;
  };
  const next = meds.find((m) => !doneAt(m.id));
  const taken = meds.filter((m) => doneAt(m.id)).length;
  const lastAlert = msgs.find((m) => m.kind === "sos" || m.kind === "sos_cancel");
  const sosOn = lastAlert?.kind === "sos";
  const sosAt = lastAlert ? clock(lastAlert.created_at) : "";
  const f = role === "f";
  const up = authMode === "up";

  let title = "", sub = "";
  switch (cur) {
    case "role": title = "Alaga"; sub = "Who is using the app?"; break;
    case "auth": title = up ? "Create account" : "Log in"; sub = (f ? "Family" : "Patient") + " account"; break;
    case "home": title = "Home"; sub = "Good morning, " + pName; break;
    case "meds": title = "Medicines"; sub = "Reminders and dose log"; break;
    case "sos": title = "SOS"; sub = "Emergency help"; break;
    case "sent": title = "Alert sent"; sub = "SOS"; break;
    case "fhome": title = "Family Dashboard"; sub = fName + " · Caregiver"; break;
    case "fmeds": title = "Medicines"; sub = pName + "'s dose log"; break;
    case "fadd": title = "Assign a medicine"; sub = "For " + pName; break;
    case "fmsgs": title = "Messages"; sub = "From " + pName; break;
  }
  const back: Screen | "" = cur === "sent" ? "sos" : cur === "auth" ? "role" : cur === "fadd" ? "fmeds" : "";
  const showNav = cur !== "role" && cur !== "auth";
  const nav = f ? NAV_F : NAV_P;

  if (booting)
    return (
      <div className="alaga-shell"><main className="alaga"><div className="top"><h2>Alaga</h2><div className="row"><span>Loading…</span></div></div></main></div>
    );

  return (
    <div className="alaga-shell">
      <main className="alaga">
        <div className="top">
          {back && (<><button className="back" onClick={() => go(back)}>‹ Back</button><br /></>)}
          <h2>{title}</h2>
          <div className="row">
            <span>{sub}</span>
            {cur !== "role" && !back && (
              <button className="back sw" onClick={me ? logout : () => go("role")}>Log out</button>
            )}
          </div>
        </div>

        <div className="body">
          {cur === "role" && (
            <section>
              <div className="card" style={{ textAlign: "center" }}>
                <h3 style={{ fontSize: 28 }}>Welcome to Alaga</h3>
                <p>Choose how you will use the app.</p>
              </div>
              <button className="btn" onClick={() => pickRole("p")}>I&apos;m the patient<small>Medicines and SOS</small></button>
              <button className="btn alt" onClick={() => pickRole("f")}>I&apos;m family<small>Check on your loved one</small></button>
            </section>
          )}

          {cur === "auth" && (
            <section>
              <div className="seg">
                <button className={up ? "" : "on"} onClick={() => { setAuthMode("in"); setErr(""); }}>Log in</button>
                <button className={up ? "on" : ""} onClick={() => { setAuthMode("up"); setErr(""); }}>Create account</button>
              </div>
              <div className="card">
                {up && (<>
                  <label htmlFor="iName">Full name</label>
                  <input id="iName" autoComplete="off" value={iName} onChange={(e) => setIName(e.target.value)} />
                </>)}
                <label htmlFor="iEmail">Email</label>
                <input id="iEmail" type="email" autoComplete="off" autoCapitalize="none" value={iEmail} onChange={(e) => setIEmail(e.target.value)} />
                <label htmlFor="iPass">Password</label>
                <input id="iPass" type="password" autoComplete="off" value={iPass} onChange={(e) => setIPass(e.target.value)} />
                {up && f && (<>
                  <label htmlFor="iCode">Patient&apos;s family code</label>
                  <input id="iCode" placeholder="Example: ALG-4821" autoComplete="off" value={iCode} onChange={(e) => setICode(e.target.value)} />
                </>)}
              </div>
              <p className="err" role="alert">{err}</p>
              <button className="btn" disabled={busy} onClick={submitAuth}>{busy ? "Please wait…" : up ? "Create account" : "Log in"}</button>
              {up && !f && <p className="hint">Your family code appears on your Home screen after you sign up.</p>}
            </section>
          )}

          {cur === "home" && (
            <section>
              <div className="card">
                <div className="row"><h3>Next medicine</h3><span className="pill">{next ? label(next.time_of_day) : meds.length ? "Done" : "None yet"}</span></div>
                <p>{next ? next.name : meds.length ? "All medicines taken today. Well done!" : "No medicines yet. Ask your family to assign one."}</p>
                <button className="btn" onClick={() => go("meds")}>Open my medicines</button>
              </div>
              <button className="btn red" onClick={() => go("sos")}>SOS – I need help</button>
              <button className="btn alt" onClick={speak}>Read this aloud</button>
              <p className="hint">Your family code: <b>{me?.family_code}</b></p>
            </section>
          )}

          {cur === "meds" && (
            <section>
              <div className="card">
                <div className="row"><h3>Today</h3><span className="pill">{taken} of {meds.length} taken</span></div>
                <p>Tap the big button after you take each medicine.</p>
              </div>
              {meds.length === 0 && <div className="card"><p>No medicines yet. Share your family code <b>{me?.family_code}</b> so your family can add them.</p></div>}
              {meds.map((m) => {
                const d = doneAt(m.id);
                return (
                  <div className="card" key={m.id}>
                    <div className="row"><h3>{m.name}</h3><span className={"pill" + (d ? " ok" : "")}>{label(m.time_of_day)}</span></div>
                    <p>{m.note}{m.added_by_name ? " · Added by " + m.added_by_name : ""}</p>
                    {d ? (
                      <button className="btn alt" disabled>✓ Taken at {d}</button>
                    ) : (<>
                      <button className="btn" onClick={() => take(m)}>I took it</button>
                      <p className="hint">Your family gets a message.</p>
                    </>)}
                  </div>
                );
              })}
            </section>
          )}

          {cur === "sos" && (
            <section>
              <div className="card"><h3>Emergency help</h3><p>Press once. Your family gets your location right away.</p></div>
              <button className="sosbtn" aria-label="Send SOS" onClick={() => setModal(true)}>SOS</button>
              <p className="hint">Only press if you need help.</p>
            </section>
          )}

          {cur === "sent" && (
            <section>
              <div className="alert"><h3>Help is on the way</h3><span>Alert sent at <b>{sosAt}</b></span></div>
              <div className="card"><h3>Sent to your family</h3><p>Sent to {fName}.</p></div>
              <div className="card"><h3>What they can see</h3><p>Your location in Davao City.</p></div>
              <button className="btn alt" onClick={cancelSos}>I&apos;m okay – cancel alert</button>
            </section>
          )}

          {cur === "fhome" && (
            <section>
              {sosOn ? (<>
                <div className="alert"><h3>SOS from {pName}</h3>Sent at {sosAt}. Location received.</div>
                <button className="btn red" onClick={() => toast("Calling " + pName + "…")}>Call now</button>
              </>) : (
                <div className="safe"><h3>{pName} is safe</h3>No alerts right now.</div>
              )}
              <div className="card">
                <div className="row"><h3>{patient?.full_name}</h3></div>
                <p>Home, Davao City</p>
              </div>
              <div className="card">
                <h3>Today</h3>
                <p>{taken} of {meds.length} medicines taken today.</p>
                <button className="btn alt" onClick={() => go("fmeds")}>See medicines</button>
              </div>
              <button className="btn" onClick={() => toast("Calling " + pName + "…")}>Call {pName}</button>
            </section>
          )}

          {cur === "fmeds" && (
            <section>
              <div className="card">
                <h3>Medicines today</h3>
                {meds.length === 0 && <p>No medicines yet. Tap “Assign a medicine” to add one.</p>}
                {meds.map((m) => {
                  const d = doneAt(m.id);
                  return (
                    <div className="row" style={{ padding: "5px 0" }} key={m.id}>
                      <span>{m.name}</span>
                      <span className={"pill" + (d ? " ok" : "")}>{d ? "Taken " + d : "Due " + label(m.time_of_day)}</span>
                    </div>
                  );
                })}
              </div>
              <button className="btn" onClick={() => go("fadd")}>Assign a medicine</button>
            </section>
          )}

          {cur === "fadd" && (
            <section>
              <div className="card">
                <label htmlFor="mName">Medicine name and dose</label>
                <input id="mName" placeholder="Example: Aspirin 81 mg" autoComplete="off" value={mName} onChange={(e) => setMName(e.target.value)} />
                <label htmlFor="mNote">What it is for (optional)</label>
                <input id="mNote" placeholder="Example: For the heart" autoComplete="off" value={mNote} onChange={(e) => setMNote(e.target.value)} />
                <label htmlFor="mTime">Time to take it</label>
                <input id="mTime" type="time" value={mTime} onChange={(e) => setMTime(e.target.value)} />
              </div>
              <p className="err" role="alert">{mErr}</p>
              <button className="btn" disabled={busy} onClick={assignMed}>Assign to {pName}</button>
            </section>
          )}

          {cur === "fmsgs" && (
            <section>
              <div className="card">
                <h3>Messages from {pName}</h3>
                {msgs.length ? msgs.map((m) => (
                  <div className="msg" key={m.id}>{m.kind === "sos" ? "🚨 " : ""}{m.text}<small>{clock(m.created_at)}</small></div>
                )) : <p>No messages yet. They appear when {pName} confirms a medicine or sends SOS.</p>}
              </div>
            </section>
          )}
        </div>

        {showNav && (
          <nav className="nav" aria-label="Main">
            {nav.map(([id, icon, lbl]) => {
              const on = cur === id || (cur === "sent" && id === "sos") || (cur === "fadd" && id === "fmeds");
              return (
                <button key={id} className={(id === "sos" ? "sos " : "") + (on ? "on" : "")} onClick={() => go(id)}>
                  {id === "fmsgs" && unread > 0 && <em className="dot" />}
                  <b>{icon}</b>{lbl}
                </button>
              );
            })}
          </nav>
        )}

        <div className={"modal" + (modal ? " show" : "")}>
          <div className="card">
            <h3>Send SOS to your family?</h3>
            <p>They will get your location right now.</p>
            <button className="btn red" onClick={sendSos}>Yes, send help</button>
            <button className="btn alt" onClick={() => setModal(false)}>No, go back</button>
          </div>
        </div>

        <div className={"banner" + (banner ? " show" : "") + (banner?.sos ? " sos" : "")} role="status">
          {banner && (<><b>{banner.head}</b>{banner.text}</>)}
        </div>
        {toastMsg && <div className="toast">{toastMsg}</div>}
      </main>
    </div>
  );
}