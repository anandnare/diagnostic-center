let pass = '';

document.getElementById('loginForm').onsubmit = async e => {
  e.preventDefault();
  pass = document.getElementById('password').value;
  const ok = await loadData();
  if (!ok) {
    const m = document.getElementById('msg');
    m.textContent = 'चुकीचा पासवर्ड';
    m.className = 'msg err';
  }
};

async function api(url, method = 'GET') {
  return fetch(url, { method, headers: { 'x-admin-password': pass } });
}

async function loadData() {
  const r1 = await api('/api/admin/appointments');
  if (!r1.ok) return false;
  const appointments = await r1.json();
  const messages = await (await api('/api/admin/messages')).json();

  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('panel').style.display = 'block';

  document.getElementById('apTable').innerHTML = appointments.map(a => {
    const st = a.status || 'Pending';
    return `
    <tr>
      <td>${esc(a.name)}</td><td>${esc(a.phone)}</td><td>${esc(a.date)}</td>
      <td>${esc(a.category)}</td><td>${esc(a.test)}</td>
      <td><button class="badge ${st}" onclick="toggleStatus('${a.id}')">${st}</button></td>
      <td><button class="del" onclick="removeAp('${a.id}')">डिलीट</button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="7">अजून अपॉइंटमेंट नाही</td></tr>';

  document.getElementById('msgTable').innerHTML = messages.map(m => `
    <tr><td>${esc(m.name)}</td><td>${esc(m.email)}</td><td>${esc(m.message)}</td></tr>`).join('')
    || '<tr><td colspan="3">अजून संदेश नाही</td></tr>';
  return true;
}

async function toggleStatus(id) {
  await api('/api/admin/appointments/' + id, 'PATCH');
  loadData();
}

async function removeAp(id) {
  if (!confirm('खरंच डिलीट करायचे?')) return;
  await api('/api/admin/appointments/' + id, 'DELETE');
  loadData();
}

// HTML इंजेक्शनपासून सुरक्षा
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}