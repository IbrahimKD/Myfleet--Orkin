// المتغيرات العامة
let currentMTFNumber = 'M001';
let selectedItems = [];

// تحميل البيانات عند بدء الصفحة
document.addEventListener('DOMContentLoaded', function() {
    loadMTFs();
    loadStores();
    updateDateTime();
    setInterval(updateDateTime, 1000);
});

// تحديث التاريخ والوقت
function updateDateTime() {
    const now = new Date();
    document.getElementById('currentDate').value = now.toLocaleDateString();
    document.getElementById('currentTime').value = now.toLocaleTimeString();
}

// عرض نافذة MTF جديدة
function showNewMTFModal() {
    const modal = document.getElementById('mtfModal');
    document.getElementById('mtfNumber').value = generateMTFNumber();
    modal.style.display = 'block';
    loadStores();
}

// توليد رقم MTF جديد
function generateMTFNumber() {
    const mtfs = JSON.parse(localStorage.getItem('mtfs')) || [];
    if (mtfs.length > 0) {
        const lastNumber = parseInt(mtfs[mtfs.length - 1].number.substring(1));
        return `M${String(lastNumber + 1).padStart(3, '0')}`;
    }
    return 'M001';
}

// تحميل المستودعات
function loadStores() {
    const stores = JSON.parse(localStorage.getItem('stores')) || [];
    const select = document.getElementById('storeSelect');
    select.innerHTML = '<option value="">Select Store</option>';
    stores.forEach(store => {
        select.innerHTML += `<option value="${store.id}">${store.name}</option>`;
    });
}

// عرض نافذة اختيار المنتجات
function showItemSelector() {
    const modal = document.getElementById('itemSelectorModal');
    const stock = JSON.parse(localStorage.getItem('stock')) || [];
    const itemsGrid = document.getElementById('itemsGrid');
    itemsGrid.innerHTML = '';
    
    stock.forEach(item => {
        if (item.quantity > 0) {
            const itemCard = document.createElement('div');
            itemCard.className = 'item-card';
            itemCard.innerHTML = `
                <h4>${item.name}</h4>
                <p>Available: ${item.quantity} ${item.unit}</p>
                <button onclick="selectItem('${item.name}', ${item.quantity}, '${item.unit}')">Select</button>
            `;
            itemsGrid.appendChild(itemCard);
        }
    });
    
    modal.style.display = 'block';
}

// اختيار منتج
function selectItem(name, availableQty, unit) {
    if (!selectedItems.find(item => item.name === name)) {
        selectedItems.push({ name, availableQty, unit, requiredQty: 0 });
        updateSelectedItemsTable();
    }
}

// تحديث جدول المنتجات المختارة
function updateSelectedItemsTable() {
    const tbody = document.querySelector('#selectedItemsTable tbody');
    tbody.innerHTML = '';
    
    selectedItems.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.availableQty}</td>
            <td>
                <input type="number" 
                       min="1" 
                       max="${item.availableQty}" 
                       value="${item.requiredQty}"
                       onchange="updateQuantity('${item.name}', this.value)">
            </td>
            <td>${item.unit}</td>
            <td>
                <button onclick="removeItem('${item.name}')" class="remove-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// حفظ MTF
function saveMTF(event) {
    event.preventDefault();
    
    const mtfData = {
        number: document.getElementById('mtfNumber').value,
        date: document.getElementById('currentDate').value,
        time: document.getElementById('currentTime').value,
        store: document.getElementById('storeSelect').value,
        notes: document.getElementById('notes').value,
        items: selectedItems,
        status: 'Pending'
    };

    // تحديث المخزون
    updateStock(mtfData.items);

    // حفظ MTF
    const mtfs = JSON.parse(localStorage.getItem('mtfs')) || [];
    mtfs.push(mtfData);
    localStorage.setItem('mtfs', JSON.stringify(mtfs));

    // إغلاق النافذة وتحديث الجدول
    closeModal();
    loadMTFs();
}

// تحديث المخزون
function updateStock(items) {
    const stock = JSON.parse(localStorage.getItem('stock')) || [];
    
    items.forEach(mtfItem => {
        const stockItem = stock.find(item => item.name === mtfItem.name);
        if (stockItem) {
            stockItem.quantity -= parseInt(mtfItem.requiredQty);
        }
    });

    localStorage.setItem('stock', JSON.stringify(stock));
}

// تحميل MTFs
function loadMTFs() {
    const mtfs = JSON.parse(localStorage.getItem('mtfs')) || [];
    const tbody = document.querySelector('#mtfTable tbody');
    tbody.innerHTML = '';

    mtfs.forEach(mtf => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${mtf.number}</td>
            <td>${mtf.date}</td>
            <td>${mtf.time}</td>
            <td>${getStoreName(mtf.store)}</td>
            <td>${mtf.status}</td>
            <td>
                <button onclick="viewMTF('${mtf.number}')" class="view-btn">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// الدوال المساعدة
function closeModal() {
    document.getElementById('mtfModal').style.display = 'none';
    selectedItems = [];
}

function closeItemSelector() {
    document.getElementById('itemSelectorModal').style.display = 'none';
}

function removeItem(name) {
    selectedItems = selectedItems.filter(item => item.name !== name);
    updateSelectedItemsTable();
}

function updateQuantity(name, value) {
    const item = selectedItems.find(item => item.name === name);
    if (item) {
        item.requiredQty = parseInt(value);
    }
}

function getStoreName(storeId) {
    const stores = JSON.parse(localStorage.getItem('stores')) || [];
    const store = stores.find(s => s.id === storeId);
    return store ? store.name : 'Unknown';
}

function filterItems() {
    const searchText = document.getElementById('itemSearch').value.toLowerCase();
    const items = document.querySelectorAll('.item-card');
    
    items.forEach(item => {
        const itemName = item.querySelector('h4').textContent.toLowerCase();
        item.style.display = itemName.includes(searchText) ? '' : 'none';
    });
}