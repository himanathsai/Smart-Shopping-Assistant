document.addEventListener('DOMContentLoaded', () => {
    // Load Data from LocalStorage or use Mock Data
    let pantryItems = JSON.parse(localStorage.getItem('pantryItems')) || [
        { id: 1, name: 'Organic Milk', expiryDate: getOffsetDate(10), icon: 'milk' },
        { id: 2, name: 'Eggs (Dozen)', expiryDate: getOffsetDate(2), icon: 'egg' },
        { id: 3, name: 'Spinach', expiryDate: getOffsetDate(-1), icon: 'leaf' },
        { id: 4, name: 'Greek Yogurt', expiryDate: getOffsetDate(5), icon: 'cup-soda' },
        { id: 5, name: 'Sliced Bread', expiryDate: getOffsetDate(1), icon: 'croissant' },
        { id: 6, name: 'Apples', expiryDate: getOffsetDate(14), icon: 'apple' }
    ];

    let donatedItems = JSON.parse(localStorage.getItem('donatedItems')) || [];
    let shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || [];
    let analyticsData = JSON.parse(localStorage.getItem('analyticsData')) || {
        consumed: 12,
        wasted: 4,
        totalAdded: 16,
        monthlyWasted: [1, 2, 0, 1, 0, 4] // Last 6 months
    };

    let currentFilter = 'all';
    let searchQuery = '';

    // DOM Elements
    const inventoryGrid = document.getElementById('inventory-grid');
    const addItemForm = document.getElementById('add-item-form');
    const searchInput = document.getElementById('search-input');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const notificationBtn = document.getElementById('notification-btn');
    const notificationCount = document.getElementById('notification-count');
    const totalItemsCount = document.getElementById('total-items-count');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const generateRecipesBtn = document.getElementById('generate-recipes-btn');
    const recipesLoading = document.getElementById('recipes-loading');
    const recipesGrid = document.getElementById('recipes-grid');
    
    // Notification & Alert Elements
    const notificationPanel = document.getElementById('notification-panel');
    const notificationList = document.getElementById('notification-list');
    const clearAlertsBtn = document.getElementById('clear-alerts');
    const toastContainer = document.getElementById('toast-container');
    const testAlertBtn = document.getElementById('test-alert-btn');
    const toggleWhatsapp = document.getElementById('toggle-whatsapp');
    const toggleSms = document.getElementById('toggle-sms');
    const userPhone = document.getElementById('user-phone');
    const clearDataBtn = document.getElementById('clear-data-btn');

    // Donation Elements
    const donationModal = document.getElementById('donation-modal');
    const closeDonationBtn = document.getElementById('close-donation-btn');
    const submitDonationBtn = document.getElementById('submit-donation-btn');
    const donationItemNameEl = document.getElementById('donation-item-name');
    const donationsGrid = document.getElementById('donations-grid');
    let currentDonationItem = null;

    // Auth Elements
    const authContainer = document.getElementById('auth-container');
    const mainAppContainer = document.getElementById('main-app-container');
    const logoutBtn = document.getElementById('logout-btn');
    const authForm = document.getElementById('auth-form');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const authSubmitBtn = document.getElementById('auth-submit-btn');
    const authToggleLink = document.getElementById('auth-toggle-link');
    const authToggleText = document.getElementById('auth-toggle-text');
    const togglePasswordBtn = document.getElementById('toggle-password-btn');
    const authPassword = document.getElementById('auth-password');
    const authEmail = document.getElementById('auth-email');
    const googleSigninBtn = document.getElementById('google-signin-btn');
    const googleModal = document.getElementById('google-modal');
    const closeGoogleModal = document.getElementById('close-google-modal');
    const userProfileHeader = document.getElementById('user-profile-header');
    const userAvatar = document.getElementById('user-avatar');
    const userNameDisplay = document.getElementById('user-name-display');

    // Shopping Elements
    const generateShoppingBtn = document.getElementById('generate-shopping-btn');
    const shoppingListContainer = document.getElementById('shopping-list-container');
    const manualShoppingInput = document.getElementById('manual-shopping-item');
    const addManualShoppingBtn = document.getElementById('add-manual-shopping-btn');
    const clearShoppingBtn = document.getElementById('clear-shopping-btn');
    const shoppingStats = document.getElementById('shopping-stats');
    const shoppingCount = document.getElementById('shopping-count');

    const essentialItems = ['Milk', 'Eggs', 'Bread', 'Spinach', 'Yogurt', 'Apples'];
    
    let isLoginMode = true;

    // Utility: Get date offset by days
    function getOffsetDate(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    }

    // Utility: Calculate days remaining
    function calculateDaysRemaining(expiryDateStr) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiryDate = new Date(expiryDateStr);
        expiryDate.setHours(0, 0, 0, 0);
        
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    // Utility: Determine status based on days
    function getStatus(daysRemaining) {
        if (daysRemaining < 0) return 'expired';
        if (daysRemaining <= 3) return 'expiring';
        return 'fresh';
    }

    function getStatusText(status) {
        switch(status) {
            case 'expired': return 'Expired';
            case 'expiring': return 'Expiring Soon';
            case 'fresh': return 'Fresh';
            default: return 'Unknown';
        }
    }

    function getProgressPercentage(daysRemaining, maxLife = 14) {
        if (daysRemaining < 0) return 100;
        const progress = ((maxLife - daysRemaining) / maxLife) * 100;
        return Math.min(Math.max(progress, 0), 100);
    }

    // Auto-save Logic
    function saveToLocalStorage() {
        localStorage.setItem('pantryItems', JSON.stringify(pantryItems));
        localStorage.setItem('donatedItems', JSON.stringify(donatedItems));
        localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
        localStorage.setItem('analyticsData', JSON.stringify(analyticsData));
        localStorage.setItem('userSettings', JSON.stringify({
            phone: userPhone.value,
            whatsapp: toggleWhatsapp.checked,
            sms: toggleSms.checked
        }));
    }

    // Load Settings
    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('userSettings'));
        if (settings) {
            userPhone.value = settings.phone || '';
            toggleWhatsapp.checked = settings.whatsapp !== undefined ? settings.whatsapp : true;
            toggleSms.checked = settings.sms !== undefined ? settings.sms : true;
        }

        // Load Theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            isLightMode = true;
            document.documentElement.setAttribute('data-theme', 'light');
            themeToggleBtn.innerHTML = '<i data-lucide="moon"></i>';
            lucide.createIcons();
        }
    }

    loadSettings();

    // Render Items
    function renderItems() {
        inventoryGrid.innerHTML = '';
        
        // Filter and Search Logic
        let filteredItems = pantryItems.filter(item => {
            const days = calculateDaysRemaining(item.expiryDate);
            const status = getStatus(days);
            
            const matchesFilter = currentFilter === 'all' || status === currentFilter;
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
            
            return matchesFilter && matchesSearch;
        });

        // Sort: Expired -> Expiring -> Fresh
        filteredItems.sort((a, b) => {
            return new Date(a.expiryDate) - new Date(b.expiryDate);
        });

        if (filteredItems.length === 0) {
            inventoryGrid.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="inbox"></i>
                    <h3>No items found</h3>
                    <p>Try adjusting your search or filters, or add a new item.</p>
                </div>
            `;
        } else {
            filteredItems.forEach(item => {
                const daysRemaining = calculateDaysRemaining(item.expiryDate);
                const status = getStatus(daysRemaining);
                const statusText = getStatusText(status);
                const progress = getProgressPercentage(daysRemaining);
                
                let daysText = '';
                if (daysRemaining < 0) {
                    daysText = `${Math.abs(daysRemaining)} days ago`;
                } else if (daysRemaining === 0) {
                    daysText = 'Today';
                } else {
                    daysText = `In ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}`;
                }

                // Fallback icon if item.icon is not set
                const iconName = item.icon || 'box';

                // Donation button logic (only if not expired and expiring soon)
                let donateBtnHtml = '';
                if (daysRemaining >= 0 && daysRemaining <= 3) {
                    donateBtnHtml = `<button class="donate-btn" onclick="openDonationModal(${item.id})"><i data-lucide="heart"></i> Donate</button>`;
                }

                // Consume button logic
                let consumeBtnHtml = `<button class="consume-btn" onclick="consumeItem(${item.id})"><i data-lucide="check"></i> Use</button>`;

                const card = document.createElement('div');
                card.className = `item-card ${status}`;
                card.innerHTML = `
                    <div class="card-header">
                        <div class="item-icon-wrapper">
                            <i data-lucide="${iconName}"></i>
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            ${consumeBtnHtml}
                            <button class="delete-btn" onclick="deleteItem(${item.id}, true)">
                                <i data-lucide="trash-2"></i>
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <h3>${item.name}</h3>
                        <p><i data-lucide="calendar"></i> Exp: ${new Date(item.expiryDate).toLocaleDateString()}</p>
                        <p><i data-lucide="clock"></i> ${daysText}</p>
                    </div>
                    <div class="card-footer">
                        <div class="card-footer-top" style="display: flex; justify-content: space-between; width: 100%;">
                            <span class="status-badge">${statusText}</span>
                            ${donateBtnHtml}
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar" style="width: ${progress}%"></div>
                        </div>
                    </div>
                `;
                inventoryGrid.appendChild(card);
            });
        }

        // Re-initialize Lucide icons for dynamically added elements
        lucide.createIcons();
        updateDashboardStats();
    }

    // Update Notifications and Counts
    function updateDashboardStats() {
        totalItemsCount.textContent = `${pantryItems.length} item${pantryItems.length !== 1 ? 's' : ''}`;
        
        const expiringOrExpiredCount = pantryItems.filter(item => {
            const days = calculateDaysRemaining(item.expiryDate);
            return days <= 3;
        }).length;

        notificationCount.textContent = expiringOrExpiredCount;
        
        if(expiringOrExpiredCount > 0) {
            notificationCount.style.display = 'flex';
            notificationCount.style.background = 'var(--status-expired)';
        } else {
            notificationCount.style.display = 'none';
        }
    }

    // Add Item
    addItemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('item-name');
        const dateInput = document.getElementById('expiry-date');

        const newItem = {
            id: Date.now(),
            name: nameInput.value,
            expiryDate: dateInput.value,
            icon: 'box' // default icon for user added items
        };

        pantryItems.push(newItem);
        analyticsData.totalAdded++;
        
        // Reset form
        nameInput.value = '';
        dateInput.value = '';
        
        // Render
        renderItems();
        updateAnalytics();
        saveToLocalStorage();
        
        // Check alerts if the new item is expiring soon
        const days = calculateDaysRemaining(newItem.expiryDate);
        if (days <= 3) {
            triggerSmartAlerts([newItem]);
        }
    });

    // Delete Item (Global function so it can be called from onclick)
    window.deleteItem = function(id, isManual = false) {
        if (isManual) {
            const item = pantryItems.find(i => i.id === id);
            if (item) {
                const days = calculateDaysRemaining(item.expiryDate);
                if (days < 0) {
                    analyticsData.wasted++;
                    const monthIdx = new Date().getMonth() % 6;
                    analyticsData.monthlyWasted[monthIdx]++;
                }
            }
        }
        pantryItems = pantryItems.filter(item => item.id !== id);
        renderItems();
        updateAnalytics();
        saveToLocalStorage();
    };

    window.consumeItem = function(id) {
        const item = pantryItems.find(i => i.id === id);
        if (item) {
            analyticsData.consumed++;
            pantryItems = pantryItems.filter(i => i.id !== id);
            showToast('success', 'Enjoy!', `Marked ${item.name} as consumed.`);
            renderItems();
            updateAnalytics();
            saveToLocalStorage();
        }
    };

    // Search
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderItems();
    });

    // Filter
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked
            btn.classList.add('active');
            
            currentFilter = btn.dataset.filter;
            renderItems();
        });
    });

    // --- Barcode Scanning Logic ---
    const scanBtn = document.getElementById('scan-btn');
    const scannerModal = document.getElementById('scanner-modal');
    const closeScannerBtn = document.getElementById('close-scanner-btn');
    const itemNameInput = document.getElementById('item-name');
    const scannerHint = document.getElementById('scanner-hint');
    let html5Qrcode = null;

    const mockBarcodeDB = {
        "8901030922849": "Maggi Noodles",
        "0012000010041": "Pepsi Cola",
        "0049000000443": "Sprite",
        "0028400047685": "Cheetos",
        "8901491000845": "Lays Classic",
        "1234567890128": "Organic Almond Milk",
        "9876543210987": "Whole Wheat Bread",
        "123456": "Test Item"
    };

    function playSuccessSound() {
        if (!window.AudioContext && !window.webkitAudioContext) return;
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.1);
            if(navigator.vibrate) navigator.vibrate(100);
        } catch(e) { console.error("Audio error:", e); }
    }

    function playNotificationSound() {
        if (!window.AudioContext && !window.webkitAudioContext) return;
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(500, audioCtx.currentTime); 
            oscillator.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.1);
        } catch(e) { console.error("Audio error:", e); }
    }

    function stopScannerAndClose() {
        if (html5Qrcode) {
            html5Qrcode.stop().then(() => {
                html5Qrcode.clear();
                html5Qrcode = null;
                scannerModal.classList.add('hidden');
            }).catch(err => {
                console.error("Failed to stop scanner.", err);
                scannerModal.classList.add('hidden');
            });
        } else {
            scannerModal.classList.add('hidden');
        }
    }

    function onScanSuccess(decodedText, decodedResult) {
        playSuccessSound();
        stopScannerAndClose();
        
        // Lookup in DB or use raw barcode
        const productName = mockBarcodeDB[decodedText] || `Product ID: ${decodedText}`;
        itemNameInput.value = productName;
        
        // Add a subtle success highlight
        itemNameInput.style.borderColor = 'var(--status-fresh)';
        setTimeout(() => itemNameInput.style.borderColor = '', 1000);
    }

    scanBtn.addEventListener('click', () => {
        scannerModal.classList.remove('hidden');
        scannerHint.textContent = "Requesting camera permissions...";
        
        html5Qrcode = new Html5Qrcode("reader");
        
        html5Qrcode.start(
            { facingMode: "environment" },
            {
                fps: 10,
                qrbox: { width: 250, height: 150 }
            },
            onScanSuccess,
            (errorMessage) => {
                // Scanning in progress...
                scannerHint.textContent = "Scanning... Position the barcode inside the frame";
            }
        ).catch((err) => {
            console.error("Error starting camera", err);
            scannerHint.textContent = "Camera error or permission denied.";
        });
    });

    closeScannerBtn.addEventListener('click', stopScannerAndClose);

    // Theme Toggle Logic
    let isLightMode = false;
    themeToggleBtn.addEventListener('click', () => {
        isLightMode = !isLightMode;
        if (isLightMode) {
            document.documentElement.setAttribute('data-theme', 'light');
            themeToggleBtn.innerHTML = '<i data-lucide="moon"></i>';
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
            themeToggleBtn.innerHTML = '<i data-lucide="sun"></i>';
            localStorage.setItem('theme', 'dark');
        }
        lucide.createIcons();
    });

    // --- Smart Alert & Notification Logic ---

    function showToast(type, title, message) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = type === 'whatsapp' ? 'message-circle' : 'message-square';
        if(type === 'danger') icon = 'alert-triangle';
        if(type === 'success') icon = 'check-circle';

        toast.innerHTML = `
            <i data-lucide="${icon}"></i>
            <div class="toast-content">
                <span class="toast-title">${title}</span>
                <span class="toast-message">${message}</span>
            </div>
        `;
        toastContainer.appendChild(toast);
        lucide.createIcons();

        playNotificationSound();

        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    function addNotificationToPanel(title, message, isExpired) {
        const item = document.createElement('div');
        item.className = `notification-item ${isExpired ? 'danger' : 'warning'}`;
        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        item.innerHTML = `
            <div class="notification-message"><strong>${title}</strong>: ${message}</div>
            <div class="notification-meta"><span>ExpiryGuard System</span><span>${time}</span></div>
        `;
    notificationList.prepend(item);
    }

    // Settings listeners for auto-save
    [userPhone, toggleWhatsapp, toggleSms].forEach(el => {
        el.addEventListener('change', saveToLocalStorage);
    });

    function triggerSmartAlerts(itemsToCheck) {
        if (!itemsToCheck || itemsToCheck.length === 0) return;
        
        const wantWhatsapp = toggleWhatsapp.checked;
        const wantSms = toggleSms.checked;

        if (!wantWhatsapp && !wantSms) return; // No alerts enabled

        itemsToCheck.forEach(item => {
            const days = calculateDaysRemaining(item.expiryDate);
            if (days > 3) return;

            let message = '';
            let isExpired = false;

            if (days < 0) {
                message = `Alert: Your ${item.name} has expired!`;
                isExpired = true;
            } else if (days === 0) {
                message = `Urgent: Your ${item.name} expires TODAY! Consider donating it.`;
                isExpired = true;
            } else if (days === 1) {
                message = `Reminder: Your ${item.name} will expire in 1 day. Consider donating it.`;
            } else {
                message = `Reminder: Your ${item.name} will expire in ${days} days. Consider donating it.`;
            }

            // Simulate WhatsApp
            if (wantWhatsapp) {
                showToast('whatsapp', 'WhatsApp Alert Sent', message);
            }
            // Simulate SMS
            if (wantSms) {
                setTimeout(() => {
                    showToast('sms', 'SMS Alert Sent', message);
                }, wantWhatsapp ? 1000 : 0); // Stagger if both
            }

            addNotificationToPanel("Expiry Alert", message, isExpired);
        });
    }

    // Toggle Notification Panel
    notificationBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationPanel.classList.toggle('hidden');
    });

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!notificationPanel.contains(e.target) && !notificationBtn.contains(e.target)) {
            notificationPanel.classList.add('hidden');
        }
    });

    // Clear Alerts
    clearAlertsBtn.addEventListener('click', () => {
        notificationList.innerHTML = '';
        notificationCount.style.display = 'none';
        notificationCount.textContent = '0';
    });

    // Test Alert Button (Simulate Check)
    testAlertBtn.addEventListener('click', () => {
        if (!userPhone.value && (toggleWhatsapp.checked || toggleSms.checked)) {
            alert("Please enter a phone number to simulate alerts.");
            userPhone.focus();
            return;
        }

        const expiringItems = pantryItems.filter(item => calculateDaysRemaining(item.expiryDate) <= 3);
        if (expiringItems.length === 0) {
            alert("No items are expiring within 3 days. Add an expiring item first to test alerts!");
            return;
        }

        testAlertBtn.innerHTML = '<div class="spinner" style="width:16px;height:16px;display:inline-block;border:2px solid currentColor;border-top:2px solid transparent;border-radius:50%;animation:spin 1s linear infinite;"></div> Sending...';
        testAlertBtn.disabled = true;

        setTimeout(() => {
            triggerSmartAlerts(expiringItems);
            testAlertBtn.innerHTML = '<i data-lucide="send"></i> Save & Test Alert';
            testAlertBtn.disabled = false;
            lucide.createIcons();
        }, 1000);
    });

    // --- Donation Logic ---
    window.openDonationModal = function(id) {
        currentDonationItem = pantryItems.find(i => i.id === id);
        if (!currentDonationItem) return;
        
        donationItemNameEl.textContent = `Donating: ${currentDonationItem.name}`;
        donationModal.classList.remove('hidden');
    };

    closeDonationBtn.addEventListener('click', () => {
        donationModal.classList.add('hidden');
        submitDonationBtn.innerHTML = '<i data-lucide="heart"></i> Confirm Donation';
        currentDonationItem = null;
    });

    submitDonationBtn.addEventListener('click', () => {
        const location = document.getElementById('donation-location').value;
        const contact = document.getElementById('donation-contact').value;
        const time = document.getElementById('donation-time').value;
        if (!location || !time) {
            alert("Please fill in pickup location and time.");
            return;
        }

        if (donatedItems.find(i => i.id === currentDonationItem.id)) {
            // Update existing donation
            const index = donatedItems.findIndex(i => i.id === currentDonationItem.id);
            donatedItems[index] = {
                ...donatedItems[index],
                pickupLocation: location,
                contactNumber: contact,
                pickupTime: time
            };
            showToast('success', 'Update Saved', 'Donation details updated successfully.');
        } else {
            // Create new donation
            pantryItems = pantryItems.filter(i => i.id !== currentDonationItem.id);
            donatedItems.push({
                ...currentDonationItem,
                pickupLocation: location,
                contactNumber: contact,
                pickupTime: time,
                status: 'Available'
            });
            showToast('sms', 'Donation Listed', 'Thank you for reducing food waste! Your item is now available for pickup.');
        }

        donationModal.classList.add('hidden');
        document.getElementById('donation-location').value = '';
        document.getElementById('donation-contact').value = '';
        document.getElementById('donation-time').value = '';
        submitDonationBtn.innerHTML = '<i data-lucide="heart"></i> Confirm Donation';
        currentDonationItem = null;

        renderItems();
        renderDonations();
        saveToLocalStorage();
    });

    window.requestDonation = function(id) {
        const item = donatedItems.find(i => i.id === id);
        if (item) {
            item.status = 'Requested';
            renderDonations();
            saveToLocalStorage();
            showToast('whatsapp', 'Request Received', `Someone in your community has requested the ${item.name}!`);
        }
    };

    window.openEditDonationModal = function(id) {
        const item = donatedItems.find(i => i.id === id);
        if (!item) return;

        currentDonationItem = item;
        donationItemNameEl.textContent = `Editing Donation: ${item.name}`;
        document.getElementById('donation-location').value = item.pickupLocation;
        document.getElementById('donation-contact').value = item.contactNumber || '';
        document.getElementById('donation-time').value = item.pickupTime;
        
        // Change button text to indicate editing
        submitDonationBtn.innerHTML = '<i data-lucide="edit"></i> Update Donation';
        donationModal.classList.remove('hidden');
        lucide.createIcons();
    };

    function renderDonations() {
        donationsGrid.innerHTML = '';
        
        if (donatedItems.length === 0) {
            donationsGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i data-lucide="gift"></i>
                    <h3>No donations yet</h3>
                    <p>Be the first to donate an item instead of wasting it!</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        donatedItems.forEach(item => {
            const card = document.createElement('div');
            card.className = `donated-card ${item.status === 'Requested' ? 'requested' : ''}`;
            
            let statusBadgeClass = 'status-available';
            if (item.status === 'Requested') statusBadgeClass = 'status-requested';
            if (item.status === 'Completed') statusBadgeClass = 'status-completed';

            let actionHtml = '';
            if (item.status === 'Available') {
                actionHtml = `
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" onclick="openEditDonationModal(${item.id})">Edit</button>
                        <button class="btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" onclick="requestDonation(${item.id})">Simulate Request</button>
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="donated-header">
                    <div class="donated-info">
                        <h3>${item.name}</h3>
                        <p><i data-lucide="map-pin"></i> ${item.pickupLocation}</p>
                        <p><i data-lucide="clock"></i> ${item.pickupTime}</p>
                    </div>
                    <span class="donated-status ${statusBadgeClass}">${item.status}</span>
                </div>
                <div style="display: flex; justify-content: flex-end; margin-top: 0.5rem;">
                    ${actionHtml}
                </div>
            `;
            donationsGrid.appendChild(card);
        });
        lucide.createIcons();
    }

    // Smart Recipes Logic
    generateRecipesBtn.addEventListener('click', async () => {
        const expiringItems = pantryItems.filter(item => calculateDaysRemaining(item.expiryDate) <= 3);
        if (expiringItems.length === 0) {
            alert("No items are expiring soon! You don't need any rescue recipes right now.");
            return;
        }

        const ingredients = expiringItems.map(item => item.name);
        
        // UI State update
        generateRecipesBtn.disabled = true;
        recipesLoading.classList.remove('hidden');
        recipesGrid.classList.add('hidden');
        recipesGrid.innerHTML = '';

        try {
            const response = await fetch('http://localhost:5000/api/generate-recipes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ingredients: ingredients })
            });

            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();
            
            // Render recipes
            data.recipes.forEach(recipe => {
                const card = document.createElement('div');
                card.className = 'recipe-card';
                
                // Process ingredients to highlight expiring ones
                const ingredientsHtml = recipe.ingredients.map(ing => {
                    const isExpiring = ingredients.some(exp => ing.toLowerCase().includes(exp.toLowerCase()) || exp.toLowerCase().includes(ing.toLowerCase()));
                    return `<span class="ingredient-tag ${isExpiring ? 'expiring' : ''}">${ing}</span>`;
                }).join('');

                const stepsHtml = recipe.steps.map(step => `<li>${step}</li>`).join('');

                card.innerHTML = `
                    <div class="recipe-header">
                        <div class="recipe-icon">${recipe.icon || '🍳'}</div>
                        <div class="recipe-title">
                            <h3>${recipe.title}</h3>
                            <span class="recipe-badge">Uses Expiring Items</span>
                        </div>
                    </div>
                    <div>
                        <div class="recipe-section-title">Ingredients</div>
                        <div class="recipe-ingredients">
                            ${ingredientsHtml}
                        </div>
                    </div>
                    <div>
                        <div class="recipe-section-title">Instructions</div>
                        <ol class="recipe-steps">
                            ${stepsHtml}
                        </ol>
                    </div>
                `;
                recipesGrid.appendChild(card);
            });

            recipesLoading.classList.add('hidden');
            recipesGrid.classList.remove('hidden');
        } catch (error) {
            console.error("Failed to generate recipes:", error);
            alert("Failed to generate recipes. Is the Flask backend running?");
            recipesLoading.classList.add('hidden');
        } finally {
            generateRecipesBtn.disabled = false;
        }
    });

    // --- Auth Logic ---

    function checkAuthStatus() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedIn) {
            authContainer.style.display = 'none';
            mainAppContainer.style.display = 'block';
            
            // Display User Profile if available
            const userData = JSON.parse(localStorage.getItem('userData'));
            if (userData) {
                userProfileHeader.classList.remove('hidden');
                userAvatar.src = userData.photo;
                userNameDisplay.textContent = userData.name;
            } else {
                userProfileHeader.classList.add('hidden');
            }
            
            renderItems();
            renderDonations();
        } else {
            authContainer.style.display = 'flex';
            mainAppContainer.style.display = 'none';
            userProfileHeader.classList.add('hidden');
        }
    }

    googleSigninBtn.addEventListener('click', () => {
        googleModal.classList.remove('hidden');
    });

    closeGoogleModal.addEventListener('click', () => {
        googleModal.classList.add('hidden');
    });

    window.simulateGoogleLogin = function(name, email, photo) {
        googleModal.classList.add('hidden');
        
        // Show loading state on main auth button briefly
        authSubmitBtn.innerHTML = '<div class="spinner" style="width:16px;height:16px;display:inline-block;border:2px solid currentColor;border-top:2px solid transparent;border-radius:50%;animation:spin 1s linear infinite;"></div>';
        authSubmitBtn.disabled = true;

        setTimeout(() => {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userData', JSON.stringify({ name, email, photo }));
            
            authSubmitBtn.disabled = false;
            authSubmitBtn.textContent = isLoginMode ? 'Login' : 'Sign Up';
            
            showToast('success', 'Welcome', `Signed in as ${name}`);
            checkAuthStatus();
        }, 1000);
    };

    authToggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        if (isLoginMode) {
            authTitle.textContent = 'Welcome Back';
            authSubtitle.textContent = 'Login to manage your smart pantry';
            authSubmitBtn.textContent = 'Login';
            authToggleText.innerHTML = `Don't have an account? <a href="#" id="auth-toggle-link" style="color: var(--primary); font-weight: 600; text-decoration: none;">Sign up</a>`;
        } else {
            authTitle.textContent = 'Create an Account';
            authSubtitle.textContent = 'Join ExpiryGuard to reduce waste';
            authSubmitBtn.textContent = 'Sign Up';
            authToggleText.innerHTML = `Already have an account? <a href="#" id="auth-toggle-link" style="color: var(--primary); font-weight: 600; text-decoration: none;">Login</a>`;
        }
        
        // Re-attach listener since we replaced innerHTML
        document.getElementById('auth-toggle-link').addEventListener('click', arguments.callee);
    });

    togglePasswordBtn.addEventListener('click', () => {
        const type = authPassword.getAttribute('type') === 'password' ? 'text' : 'password';
        authPassword.setAttribute('type', type);
        togglePasswordBtn.innerHTML = type === 'password' ? '<i data-lucide="eye"></i>' : '<i data-lucide="eye-off"></i>';
        lucide.createIcons();
    });

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = authEmail.value;
        const pass = authPassword.value;
        
        if (pass.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }

        // Simulate API delay
        authSubmitBtn.innerHTML = '<div class="spinner" style="width:16px;height:16px;display:inline-block;border:2px solid currentColor;border-top:2px solid transparent;border-radius:50%;animation:spin 1s linear infinite;"></div>';
        authSubmitBtn.disabled = true;

        setTimeout(() => {
            localStorage.setItem('isLoggedIn', 'true');
            authSubmitBtn.disabled = false;
            authSubmitBtn.textContent = isLoginMode ? 'Login' : 'Sign Up';
            
            showToast('success', 'Success', isLoginMode ? 'Logged in successfully!' : 'Account created successfully!');
            checkAuthStatus();
        }, 800);
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userData');
        authEmail.value = '';
        authPassword.value = '';
        checkAuthStatus();
        showToast('success', 'Logged Out', 'You have been successfully logged out.');
    });

    clearDataBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            localStorage.removeItem('pantryItems');
            localStorage.removeItem('donatedItems');
            localStorage.removeItem('userSettings');
            location.reload();
        }
    });

    // Initial Render & Startup Check
    checkAuthStatus();
    renderShoppingList();
    updateAnalytics();

    // --- Analytics Dashboard Logic ---
    let usagePieChart = null;
    let wasteBarChart = null;

    function updateAnalytics() {
        // Update Metrics
        document.getElementById('metric-total').textContent = analyticsData.totalAdded;
        document.getElementById('metric-consumed').textContent = analyticsData.consumed;
        document.getElementById('metric-wasted').textContent = analyticsData.wasted;
        
        const moneySaved = analyticsData.consumed * 2.5; // Mock: $2.5 saved per item
        document.getElementById('metric-saved').textContent = `$${moneySaved.toFixed(0)}`;

        // Update Insight
        const insightText = document.getElementById('analytics-insight-text');
        const wasteRate = (analyticsData.wasted / (analyticsData.consumed + analyticsData.wasted) * 100) || 0;
        
        if (wasteRate < 10) {
            insightText.textContent = "Great job! Your food waste is exceptionally low this week.";
        } else if (wasteRate < 25) {
            insightText.textContent = "Not bad! You're using most of your items. Try using dairy faster.";
        } else {
            insightText.textContent = "Warning: Waste levels are high. Check your pantry more often!";
        }

        renderAnalyticsCharts();
    }

    function renderAnalyticsCharts() {
        const pieCtx = document.getElementById('usagePieChart').getContext('2d');
        const barCtx = document.getElementById('wasteBarChart').getContext('2d');

        // Destroy existing charts to avoid overlap
        if (usagePieChart) usagePieChart.destroy();
        if (wasteBarChart) wasteBarChart.destroy();

        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const textColor = isLight ? '#0f172a' : '#f5f5f5';

        usagePieChart = new Chart(pieCtx, {
            type: 'doughnut',
            data: {
                labels: ['Consumed', 'Wasted'],
                datasets: [{
                    data: [analyticsData.consumed, analyticsData.wasted],
                    backgroundColor: ['#34d399', '#f87171'],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: textColor, padding: 20 }
                    }
                },
                cutout: '70%'
            }
        });

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonthIdx = new Date().getMonth();
        const labels = [];
        for (let i = 5; i >= 0; i--) {
            let idx = (currentMonthIdx - i + 12) % 12;
            labels.push(months[idx]);
        }

        wasteBarChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Items Wasted',
                    data: analyticsData.monthlyWasted,
                    backgroundColor: '#3b82f6',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: textColor },
                        grid: { color: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }
                    },
                    x: {
                        ticks: { color: textColor },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    // Handle theme change for charts
    themeToggleBtn.addEventListener('click', () => {
        setTimeout(updateAnalytics, 100); // Wait for DOM attribute to update
    });

    // --- Shopping List Logic ---

    function renderShoppingList() {
        shoppingListContainer.innerHTML = '';
        
        if (shoppingList.length === 0) {
            shoppingListContainer.innerHTML = `
                <div class="shopping-empty">
                    <i data-lucide="list-checks"></i>
                    <h3>Your list is empty</h3>
                    <p>Click "Generate" to see what your pantry needs!</p>
                </div>
            `;
            shoppingStats.classList.add('hidden');
            lucide.createIcons();
            return;
        }

        shoppingStats.classList.remove('hidden');
        shoppingCount.textContent = shoppingList.length;

        shoppingList.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = `shopping-item ${item.checked ? 'checked' : ''}`;
            itemEl.innerHTML = `
                <div class="shopping-checkbox" onclick="toggleShoppingItem(${item.id})">
                    <i data-lucide="check"></i>
                </div>
                <div class="item-details">
                    <span class="item-name">${item.name}</span>
                    <span class="item-reason ${item.reason}">${item.reason === 'custom' ? 'User added' : item.reason}</span>
                </div>
                <div class="remove-shopping-item" onclick="removeShoppingItem(${item.id})">
                    <i data-lucide="x"></i>
                </div>
            `;
            shoppingListContainer.appendChild(itemEl);
        });
        lucide.createIcons();
    }

    window.toggleShoppingItem = function(id) {
        const item = shoppingList.find(i => i.id === id);
        if (item) {
            item.checked = !item.checked;
            renderShoppingList();
            saveToLocalStorage();
        }
    };

    window.removeShoppingItem = function(id) {
        shoppingList = shoppingList.filter(i => i.id !== id);
        renderShoppingList();
        saveToLocalStorage();
    };

    generateShoppingBtn.addEventListener('click', () => {
        const currentPantryNames = pantryItems.map(i => i.name.toLowerCase());
        let newItems = [];

        // 1. Check for missing essentials
        essentialItems.forEach(essential => {
            const isFound = currentPantryNames.some(pantryName => pantryName.includes(essential.toLowerCase()));
            const isAlreadyInList = shoppingList.some(shopItem => shopItem.name.toLowerCase().includes(essential.toLowerCase()));
            
            if (!isFound && !isAlreadyInList) {
                newItems.push({
                    id: Date.now() + Math.random(),
                    name: essential,
                    reason: 'missing',
                    checked: false
                });
            }
        });

        // 2. Check for expired or expiring soon
        pantryItems.forEach(item => {
            const days = calculateDaysRemaining(item.expiryDate);
            const isAlreadyInList = shoppingList.some(shopItem => shopItem.name.toLowerCase() === item.name.toLowerCase());
            
            if (days <= 3 && !isAlreadyInList) {
                newItems.push({
                    id: Date.now() + Math.random(),
                    name: item.name,
                    reason: days < 0 ? 'expired' : 'low-stock',
                    checked: false
                });
            }
        });

        if (newItems.length > 0) {
            shoppingList = [...shoppingList, ...newItems];
            renderShoppingList();
            saveToLocalStorage();
            showToast('success', 'List Updated', `Added ${newItems.length} smart suggestions!`);
        } else {
            showToast('whatsapp', 'Pantry Stocked', 'Your pantry is fully stocked! Nothing to add.');
        }
    });

    addManualShoppingBtn.addEventListener('click', () => {
        const name = manualShoppingInput.value.trim();
        if (name) {
            shoppingList.push({
                id: Date.now(),
                name: name,
                reason: 'custom',
                checked: false
            });
            manualShoppingInput.value = '';
            renderShoppingList();
            saveToLocalStorage();
        }
    });

    clearShoppingBtn.addEventListener('click', () => {
        if (confirm('Clear the entire shopping list?')) {
            shoppingList = [];
            renderShoppingList();
            saveToLocalStorage();
        }
    });

    // Auto-trigger alerts on load if enabled (simulated delay for demo)
    setTimeout(() => {
        if (localStorage.getItem('isLoggedIn') === 'true') {
            const expiringItems = pantryItems.filter(item => calculateDaysRemaining(item.expiryDate) <= 3);
            if (expiringItems.length > 0) {
                triggerSmartAlerts(expiringItems);
            }
        }
    }, 2000);
});
