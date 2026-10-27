const form = document.getElementById('complaint-form');
const message = document.getElementById('form-message');
document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('gps-btn').addEventListener('click', () => {
  const note = document.getElementById('gps-note');
  if (!navigator.geolocation) { note.textContent = 'Location is not supported by this browser.'; return; }
  note.textContent = 'Requesting location permission…';
  navigator.geolocation.getCurrentPosition(pos => {
    form.elements.latitude.value = pos.coords.latitude;
    form.elements.longitude.value = pos.coords.longitude;
    note.textContent = 'Location added successfully.';
  }, () => { note.textContent = 'Could not get location. Allow permission or enter address manually.'; }, { enableHighAccuracy: true, timeout: 10000 });
});
form.addEventListener('submit', async e => {
  e.preventDefault(); message.className = ''; message.textContent = 'Submitting…';
  const data = Object.fromEntries(new FormData(form).entries());
  if (data.latitude) data.latitude = Number(data.latitude); else delete data.latitude;
  if (data.longitude) data.longitude = Number(data.longitude); else delete data.longitude;
  try {
    const res = await fetch('/api/complaints', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Submission failed');
    message.className = 'success';
    message.innerHTML = 'Complaint submitted! Your tracking ID is <strong>' + result.complaint.trackingId + '</strong>. Save this ID to check status.';
    form.reset();
    document.getElementById('gps-note').textContent = 'Optional. Your browser will ask permission.';
  } catch (err) { message.className = 'error'; message.textContent = err.message + ' If this is a deployed site, check the server logs.'; }
});
