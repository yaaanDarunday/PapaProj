let customers = JSON.parse(localStorage.getItem('customers') || '[]');
let selectedId = null;
let editMode = false;

const listEl = document.getElementById('list');
const searchEl = document.getElementById('search');

function saveToStorage() {
    localStorage.setItem('customers', JSON.stringify(customers));
}

function renderList(filter = '') {
    listEl.innerHTML = '';
    const data = customers.filter(c => (c.name + ' ' + c.device + ' ' + c.problem).toLowerCase().includes(filter.toLowerCase()));
    if (data.length === 0) { listEl.innerHTML = '<div class="empty">No customers yet.</div>'; return; }
    data.forEach(c => {
        const item = document.createElement('div'); item.className = 'item';
        item.innerHTML = `
  <div class="meta">
    <div class="name">${c.name}</div>
    <div class="sub">${c.device} • ${c.problem}</div>
  </div>
  <div class="muted">
    In: ${c.checkin || '-'} <br> Out: ${c.checkout || '-'}
  </div>
`;

        item.onclick = () => selectCustomer(c.id);
        listEl.appendChild(item);
    })
}

function selectCustomer(id) {
    selectedId = id; editMode = false;
    const c = customers.find(x => x.id === id);
    document.getElementById('dname').textContent = c.name;
    document.getElementById('dsub').textContent = c.device + ' • ' + c.problem;
    document.getElementById('dphone').textContent = c.phone || '-';
    document.getElementById('ddevice').textContent = c.device || '-';
    document.getElementById('dproblem').textContent = c.problem || '-';
    document.getElementById('dcheckin').textContent = c.checkin || '-';
    document.getElementById('dcheckout').textContent = c.checkout || '-';
    document.getElementById('dnotes').textContent = c.notes || '-';
    document.getElementById('damount').textContent = c.amount ? ('₱' + c.amount) : '-';
    document.getElementById('detailFields').style.display = 'block';
    document.getElementById('editBtn').disabled = false;
    document.getElementById('deleteBtn').disabled = false;
}

function clearForm() {
    document.getElementById('custForm').reset();
    editMode = false; selectedId = null;
    document.getElementById('formMode').textContent = 'Mode: Add';
}

function openFormForEdit(id) {
    const c = customers.find(x => x.id === id);
    document.getElementById('name').value = c.name;
    document.getElementById('phone').value = c.phone || '';
    document.getElementById('device').value = c.device || '';
    document.getElementById('problem').value = c.problem || '';
    document.getElementById('checkin').value = c.checkin || '';
    document.getElementById('checkout').value = c.checkout || '';
    document.getElementById('amount').value = c.amount || '';
    document.getElementById('notes').value = c.notes || '';
    editMode = true; selectedId = id;
    document.getElementById('formMode').textContent = 'Mode: Edit';
}

document.getElementById('custForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const payload = {
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        device: document.getElementById('device').value.trim(),
        problem: document.getElementById('problem').value.trim(),
        checkin: document.getElementById('checkin').value,
        checkout: document.getElementById('checkout').value,
        amount: document.getElementById('amount').value ? Number(document.getElementById('amount').value) : 0,
        notes: document.getElementById('notes').value.trim()
    };
    if (!payload.name) { alert('Name is required'); return }
    if (editMode && selectedId) {
        const idx = customers.findIndex(x => x.id === selectedId);
        customers[idx] = { ...customers[idx], ...payload };
        editMode = false; selectedId = null;
    } else {
        const id = customers.length ? Math.max(...customers.map(x => x.id)) + 1 : 1;
        customers.push({ id, ...payload });
    }
    saveToStorage();
    renderList(searchEl.value);
    clearForm();
});

document.getElementById('cancel').addEventListener('click', () => clearForm());
document.getElementById('openAdd').addEventListener('click', () => { clearForm(); document.getElementById('name').focus(); });
document.getElementById('search').addEventListener('input', e => renderList(e.target.value));
document.getElementById('editBtn').addEventListener('click', () => { if (selectedId) openFormForEdit(selectedId) });
document.getElementById('deleteBtn').addEventListener('click', () => { if (!selectedId) return; if (!confirm('Delete this customer?')) return; customers = customers.filter(x => x.id !== selectedId); saveToStorage(); selectedId = null; renderList(searchEl.value); document.getElementById('dname').textContent = 'No customer selected'; document.getElementById('detailFields').style.display = 'none'; document.getElementById('editBtn').disabled = true; document.getElementById('deleteBtn').disabled = true; });

renderList();