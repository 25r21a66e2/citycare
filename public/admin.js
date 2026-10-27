document.getElementById('year').textContent = new Date().getFullYear();
const form = document.getElementById('admin-form');
const msg = document.getElementById('admin-message'); const results = document.getElementById('admin-results');
let adminKey = '';
async function loadComplaints() {
  msg.className = ''; msg.textContent = 'Loading complaints…'; results.innerHTML = '';
  try {
    const res = await fetch('/api/admin/complaints', { headers: { 'x-admin-key': adminKey } }); const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not load complaints');
    msg.className = 'success'; msg.textContent = `${data.length} complaint(s) loaded.`;
    if (!data.length) { results.textContent = 'No complaints submitted yet.'; return; }
    data.forEach(item => {
      const section = document.createElement('section'); section.className = 'admin-item';
      const heading = document.createElement('h3'); heading.textContent = `${item.trackingId} · ${item.category}`;
      const details = document.createElement('p'); details.textContent = `${item.name} | ${item.address} | ${new Date(item.createdAt).toLocaleString()}`;
      const description = document.createElement('p'); description.textContent = item.description;
      const current = document.createElement('p'); current.textContent = 'Current status: ' + item.status;
      const select = document.createElement('select'); ['Submitted','In Progress','Resolved','Rejected'].forEach(s => { const o = document.createElement('option'); o.value = s; o.textContent = s; if (s === item.status) o.selected = true; select.append(o); });
      const button = document.createElement('button'); button.type = 'button'; button.className = 'btn'; button.textContent = 'Update status';
      button.addEventListener('click', async () => {
        button.disabled = true;
        try { const r = await fetch('/api/admin/complaints/' + encodeURIComponent(item.trackingId), { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey }, body: JSON.stringify({ status: select.value }) }); const out = await r.json(); if (!r.ok) throw new Error(out.error || 'Update failed'); await loadComplaints(); }
        catch (err) { msg.className = 'error'; msg.textContent = err.message; button.disabled = false; }
      });
      section.append(heading, details, description, current, select, document.createTextNode(' '), button); results.append(section);
    });
  } catch (err) { msg.className = 'error'; msg.textContent = err.message; }
}
form.addEventListener('submit', e => { e.preventDefault(); adminKey = form.elements.key.value; loadComplaints(); });
