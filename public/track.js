document.getElementById('year').textContent = new Date().getFullYear();
const form = document.getElementById('track-form');
form.addEventListener('submit', async e => {
  e.preventDefault(); const msg = document.getElementById('track-message'); const result = document.getElementById('track-result');
  msg.className = ''; msg.textContent = 'Looking up complaint…'; result.innerHTML = '';
  try {
    const id = form.elements.trackingId.value.trim();
    const res = await fetch('/api/complaints/' + encodeURIComponent(id)); const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Complaint not found');
    msg.textContent = 'Complaint found.'; msg.className = 'success';
    const card = document.createElement('section'); card.className = 'result-card';
    const title = document.createElement('h3'); title.textContent = data.category + ' · ' + data.trackingId;
    const status = document.createElement('span'); status.className = 'status'; status.textContent = data.status;
    const desc = document.createElement('p'); desc.textContent = data.description;
    const address = document.createElement('p'); address.textContent = 'Location: ' + data.address;
    const date = document.createElement('p'); date.className = 'muted small'; date.textContent = 'Submitted: ' + new Date(data.createdAt).toLocaleString();
    card.append(title, status, desc, address, date); result.append(card);
  } catch (err) { msg.className = 'error'; msg.textContent = err.message; }
});
