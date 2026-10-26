import { useEffect, useState } from "react";

const API = "http://localhost:3001";
const emptyNote = {
  patient: { id: "", name: "", age: 0 },
  assessment: [], diagnosis: [], intervention: [], monitoring: [],
};

export default function App() {
  const [terms, setTerms] = useState(null);
  const [note, setNote] = useState(emptyNote);
  const [status, setStatus] = useState("");

  const [a, setA] = useState({ code: "", value: "" });
  const [pes, setPes] = useState({ code: "", etiology: "", ss: "" });
  const [i, setI] = useState({ code: "", details: "" });
  const [m, setM] = useState({ code: "", criteria: "" });

  useEffect(() => {
    fetch(`${API}/terms`).then(r => r.json()).then(setTerms);
  }, []);
  if (!terms) return <p>Loading terms... (is the API running on port 3001?)</p>;

  const add = (key, item) => setNote(n => ({ ...n, [key]: [...n[key], item] }));

  const addAssessment = () => {
    const t = terms.assessment.find(x => x.code === a.code);
    if (!t || !a.value) return;
    add("assessment", { ...t, value: a.value });
    setA({ code: "", value: "" });
  };
  const addPES = () => {
    const t = terms.diagnosis.find(x => x.code === pes.code);
    if (!t || !pes.etiology || !pes.ss) return;
    add("diagnosis", {
      problem: t, etiology: pes.etiology,
      signsSymptoms: pes.ss.split(";").map(s => s.trim()).filter(Boolean),
    });
    setPes({ code: "", etiology: "", ss: "" });
  };
  const addIntervention = () => {
    const t = terms.intervention.find(x => x.code === i.code);
    if (!t || !i.details) return;
    add("intervention", { ...t, details: i.details });
    setI({ code: "", details: "" });
  };
  const addMonitoring = () => {
    const t = terms.monitoring.find(x => x.code === m.code);
    if (!t || !m.criteria) return;
    add("monitoring", { ...t, criteria: m.criteria });
    setM({ code: "", criteria: "" });
  };

  const generateText = () => [
    `PATIENT: ${note.patient.name} (ID ${note.patient.id}), age ${note.patient.age}`,
    `\nASSESSMENT`,
    ...note.assessment.map(x => `- [${x.code}] ${x.term}: ${x.value}`),
    `\nNUTRITION DIAGNOSIS (PES)`,
    ...note.diagnosis.map(d =>
      `- ${d.problem.term} [${d.problem.code}] related to ${d.etiology} as evidenced by ${d.signsSymptoms.join(", ")}.`),
    `\nINTERVENTION`,
    ...note.intervention.map(x => `- [${x.code}] ${x.term}: ${x.details}`),
    `\nMONITORING & EVALUATION`,
    ...note.monitoring.map(x => `- [${x.code}] ${x.indicator}: ${x.criteria}`),
  ].join("\n");

  const submit = async () => {
    const res = await fetch(`${API}/notes`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
    });
    const data = await res.json();
    setStatus(res.ok ? `Saved note #${data.id}` : `Validation failed: ${JSON.stringify(data.errors)}`);
  };

  const setPatient = (k, v) => setNote(n => ({ ...n, patient: { ...n.patient, [k]: v } }));

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 16, fontFamily: "sans-serif", textAlign: "left" }}>
      <h1>eNCPT Clinical Charting</h1>

      <h3>Patient</h3>
      <input placeholder="ID" value={note.patient.id} onChange={e => setPatient("id", e.target.value)} />
      <input placeholder="Name" value={note.patient.name} onChange={e => setPatient("name", e.target.value)} />
      <input type="number" placeholder="Age" value={note.patient.age}
        onChange={e => setPatient("age", parseInt(e.target.value || 0))} />

      <h3>1. Assessment</h3>
      <select value={a.code} onChange={e => setA({ ...a, code: e.target.value })}>
        <option value="">Select term...</option>
        {terms.assessment.map(t => <option key={t.code} value={t.code}>{t.code} - {t.term}</option>)}
      </select>
      <input placeholder="Value / finding" value={a.value} onChange={e => setA({ ...a, value: e.target.value })} />
      <button onClick={addAssessment}>Add</button>

      <h3>2. Diagnosis (PES)</h3>
      <select value={pes.code} onChange={e => setPes({ ...pes, code: e.target.value })}>
        <option value="">Problem...</option>
        {terms.diagnosis.map(t => <option key={t.code} value={t.code}>{t.code} - {t.term}</option>)}
      </select>
      <input placeholder="Etiology (related to...)" value={pes.etiology} onChange={e => setPes({ ...pes, etiology: e.target.value })} />
      <input placeholder="Signs/symptoms (separate with ;)" value={pes.ss} onChange={e => setPes({ ...pes, ss: e.target.value })} />
      <button onClick={addPES}>Add</button>

      <h3>3. Intervention</h3>
      <select value={i.code} onChange={e => setI({ ...i, code: e.target.value })}>
        <option value="">Select...</option>
        {terms.intervention.map(t => <option key={t.code} value={t.code}>{t.code} - {t.term}</option>)}
      </select>
      <input placeholder="Details" value={i.details} onChange={e => setI({ ...i, details: e.target.value })} />
      <button onClick={addIntervention}>Add</button>

      <h3>4. Monitoring & Evaluation</h3>
      <select value={m.code} onChange={e => setM({ ...m, code: e.target.value })}>
        <option value="">Select...</option>
        {terms.monitoring.map(t => <option key={t.code} value={t.code}>{t.code} - {t.indicator}</option>)}
      </select>
      <input placeholder="Criteria / goal" value={m.criteria} onChange={e => setM({ ...m, criteria: e.target.value })} />
      <button onClick={addMonitoring}>Add</button>

      <h3>Generated Note</h3>
      <pre style={{ background: "#f4f4f4", color: "#000", padding: 12, whiteSpace: "pre-wrap" }}>{generateText()}</pre>
      <button onClick={submit}>Validate & Save</button>
      <p>{status}</p>
    </div>
  );
}