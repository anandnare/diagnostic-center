// ---------- Header आणि Footer ----------
const pages = [
  ['index.html', 'होम'], ['about.html', 'आमच्याबद्दल'], ['tests.html', 'टेस्ट्स'],
  ['appointment.html', 'अपॉइंटमेंट'], ['contact.html', 'संपर्क']
];
const current = location.pathname.split('/').pop() || 'index.html';

document.getElementById('header').innerHTML = `
<header><div class="container nav">
  <div class="logo">🩺 लाईफकेअर डायग्नोस्टिक</div>
  <ul>${pages.map(p => `<li><a href="${p[0]}" class="${p[0] === current ? 'active' : ''}">${p[1]}</a></li>`).join('')}</ul>
</div></header>`;

document.getElementById('footer').innerHTML =
  `<footer>© 2026 लाईफकेअर डायग्नोस्टिक सेंटर | फोन: 98765 43210 | सोलापूर, महाराष्ट्र</footer>`;

// ---------- Tests पेज ----------
const testBox = document.getElementById('testList');
if (testBox) {
  fetch('/api/tests').then(r => r.json()).then(data => {
    const tabs = document.getElementById('tabs');
    const show = cat => {
      testBox.innerHTML = data[cat].map(t =>
        `<div class="test-item"><span>${t.name}</span><span class="price">₹${t.price}</span></div>`).join('');
      [...tabs.children].forEach(b => b.classList.toggle('active', b.textContent === cat));
    };
    Object.keys(data).forEach(cat => {
      const b = document.createElement('button');
      b.className = 'tab'; b.textContent = cat;
      b.onclick = () => show(cat);
      tabs.appendChild(b);
    });
    show(Object.keys(data)[0]);
  });
}

// ---------- Appointment पेज ----------
const apForm = document.getElementById('appointmentForm');
if (apForm) {
  const catSel = document.getElementById('category');
  const testSel = document.getElementById('test');
  document.getElementById('date').min = new Date().toISOString().split('T')[0];

  fetch('/api/tests').then(r => r.json()).then(data => {
    catSel.innerHTML = '<option value="">-- निवडा --</option>' +
      Object.keys(data).map(c => `<option>${c}</option>`).join('');
    catSel.onchange = () => {
      testSel.innerHTML = (data[catSel.value] || []).map(t => `<option>${t.name}</option>`).join('');
    };
  });

  apForm.onsubmit = e => {
    e.preventDefault();
    sendForm('/api/appointments', {
      name: apForm.name.value, phone: apForm.phone.value, date: apForm.date.value,
      category: catSel.value, test: testSel.value
    }, apForm);
  };
}

// ---------- Contact पेज ----------
const ctForm = document.getElementById('contactForm');
if (ctForm) {
  ctForm.onsubmit = e => {
    e.preventDefault();
    sendForm('/api/contact', {
      name: ctForm.name.value, email: ctForm.email.value, message: ctForm.message.value
    }, ctForm);
  };
}

// ---------- Backend ला डेटा पाठवणे ----------
async function sendForm(url, body, form) {
  const msg = document.getElementById('msg');
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    msg.textContent = data.message;
    msg.className = 'msg ' + (res.ok ? 'ok' : 'err');
    if (res.ok) form.reset();
  } catch {
    msg.textContent = 'सर्व्हरशी कनेक्ट होता आले नाही.';
    msg.className = 'msg err';
  }
}