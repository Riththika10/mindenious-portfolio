// Paste your Apps Script Web App URL here. Leave empty to use localStorage.
const SCRIPT_URL =  "https://script.google.com/macros/s/AKfycbzSLEkacAJWqkCFAGVqyhGPXKEDueNr6Gvlm5mzFlNa9Z1Z6z2TPMmoqTY3xQVFp8PFug/exec";
const KEY = "responses";
const ADMIN = { user: "admin", pass: "admin123" }; // demo only, change it

const $ = id => document.getElementById(id);

/* ---------- Theme ---------- */
function setTheme(t){
  document.documentElement.dataset.theme = t;
  $("themeBtn").textContent = t === "dark" ? "Light" : "Dark";
  try { localStorage.setItem("theme", t); } catch(e){}
}
setTheme(localStorage.getItem("theme") ||
  (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
$("themeBtn").onclick = () =>
  setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");

/* ---------- Storage (localStorage or Google Sheets) ---------- */
async function saveResponse(r){
  if (SCRIPT_URL){
    await fetch(SCRIPT_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(r) });
  } else {
    const all = JSON.parse(localStorage.getItem(KEY) || "[]");
    all.push(r);
    localStorage.setItem(KEY, JSON.stringify(all));
  }
}
async function getResponses(){
  if (SCRIPT_URL){
    const res = await fetch(SCRIPT_URL);
    return res.json();
  }
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}

/* ---------- Contact form ---------- */
$("contactForm").onsubmit = async e => {
  e.preventDefault();
  const f = e.target;
  const r = {
    timestamp: new Date().toLocaleString(),
    name: f.name.value.trim(),
    email: f.email.value.trim(),
    message: f.message.value.trim()
  };
  $("formMsg").textContent = "Sending...";
  try {
    await saveResponse(r);
    f.reset();
    $("formMsg").textContent = "Thanks! Your message was sent.";
  } catch (err){
    $("formMsg").textContent = "Could not send. Please try again.";
  }
};

/* ---------- Admin show / hide ---------- */
const admin = $("admin"), responses = $("responses");
$("adminLink").onclick = () => {
  if (!responses.classList.contains("hidden")) return; // already logged in
  admin.classList.remove("hidden");
};
$("loginForm").onsubmit = e => {
  e.preventDefault();
  if ($("user").value === ADMIN.user && $("pass").value === ADMIN.pass){
    admin.classList.add("hidden");       // replace login with responses
    responses.classList.remove("hidden");
    e.target.reset(); $("loginMsg").textContent = "";
    renderResponses();
    responses.scrollIntoView();
  } else {
    $("loginMsg").textContent = "Wrong username or password.";
  }
};
$("logoutBtn").onclick = () => {
  responses.classList.add("hidden");
  location.hash = "#home";
};

async function renderResponses(){
  const list = $("list");
  list.textContent = "Loading...";
  try {
    const data = (await getResponses()).slice().reverse();
    list.textContent = "";
    if (!data.length){ list.textContent = "No responses yet."; return; }
    data.forEach(r => {
      const c = document.createElement("article"); c.className = "card";
      const h = document.createElement("h3"); h.textContent = `${r.name} (${r.email})`;
      const p = document.createElement("p"); p.textContent = r.message;
      const t = document.createElement("span"); t.className = "time"; t.textContent = r.timestamp;
      c.append(h, p, t); list.append(c);
    });
  } catch (err){
    list.textContent = "Could not load responses.";
  }
}
