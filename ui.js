import { domElements } from './dom.js';
import { translations } from './translations.js';
import { laundryItemsData, PICKUP_TIME_SLOTS } from './config.js';
import { getCurrentOrder, getCurrentLanguage, setCurrentLanguage, getCurrentOrderID, getSelectedPickupTime, getOrderHistory, getUserInfo } from './state.js';

export function setLanguageUI(lang) {
    setCurrentLanguage(lang);
    const currentLang = getCurrentLanguage();
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';

    // Translate elements with `data-translate` (simple text content, labels, placeholders)
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (translations[currentLang]?.[key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translations[currentLang][key];
            } else {
                el.textContent = translations[currentLang][key];
            }
        }
    });

    // Translate elements with `data-translate-inner` (spans inside complex elements like buttons)
    document.querySelectorAll('[data-translate-inner]').forEach(el => {
        const key = el.getAttribute('data-translate-inner');
        if (translations[currentLang]?.[key]) {
            el.textContent = translations[currentLang][key];
        }
    });

    domElements.langEnBtn.classList.toggle('active', currentLang === 'en');
    domElements.langArBtn.classList.toggle('active', currentLang === 'ar');
    
    populateItemList();
    populatePickupTimeSlots(); 
    updateTotalItemsCount();

    domElements.customerNameInput.placeholder = currentLang === 'ar' ? "ادخل اسمك" : "Enter your name";
    domElements.customerPhoneInput.placeholder = currentLang === 'ar' ? "مثال: 05XXXXXXXX" : "E.g: 05XXXXXXXX";
    domElements.customerAddressInput.placeholder = currentLang === 'ar' ? "سيتم ملؤه تلقائيًا أو ادخل يدويًا" : "Auto-filled or enter manually";

    if (domElements.locationStatusP.textContent && !domElements.customerAddressInput.value) {
        domElements.locationStatusP.textContent = "";
    }
    
    // Update placeholders for User Info Screen
    if (domElements.userFullNameInput) { 
        domElements.userFullNameInput.placeholder = currentLang === 'ar' ? "مثال: عبدالله الأحمد" : "E.g: Abdullah Ahmed";
    }
    if (domElements.userPhoneNumberInput) { 
        domElements.userPhoneNumberInput.placeholder = currentLang === 'ar' ? "مثال: 05XXXXXXXX" : "E.g: 05XXXXXXXX";
    }

    if (domElements.myOrdersScreen.classList.contains('active-screen')) {
        populateMyOrdersScreen();
    }
    if (domElements.userInfoScreen.classList.contains('active-screen')) {
        const titleEl = domElements.userInfoScreen.querySelector('[data-translate="userInfoTitle"]');
        if(titleEl) titleEl.textContent = translations[currentLang].userInfoTitle;
        
        const nameLabel = domElements.userInfoScreen.querySelector('label[for="user-full-name"]');
        if(nameLabel) nameLabel.textContent = translations[currentLang].fullNameLabel;

        const phoneLabel = domElements.userInfoScreen.querySelector('label[for="user-phone-number"]');
        if(phoneLabel) phoneLabel.textContent = translations[currentLang].phoneNumberLabel;

        const saveBtnSpan = domElements.saveUserInfoBtn.querySelector('span');
        if(saveBtnSpan) saveBtnSpan.textContent = translations[currentLang].saveAndContinue;
    }
}

export function showScreen(screenToShow) {
    domElements.screens.forEach(screen => screen.classList.remove('active-screen'));
    screenToShow.classList.add('active-screen');
    window.scrollTo(0, 0);

    if (screenToShow === domElements.myOrdersScreen) {
        populateMyOrdersScreen();
    }
}

export function populateUserInfoOnOrderScreen() {
    const userInfo = getUserInfo();
    if (userInfo.name) {
        domElements.customerNameInput.value = userInfo.name;
    }
    if (userInfo.phone) {
        domElements.customerPhoneInput.value = userInfo.phone;
    }
}

export function populateItemList() {
    domElements.itemListContainer.innerHTML = '';
    laundryItemsData.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.innerHTML = `
            <div class="item-info">
                <span class="item-name-en">${item.enName}</span>
                <span class="item-name-ar">${item.arName}</span>
            </div>
            <div class="quantity-selector">
                <button class="neumorphic-button quantity-btn decrease-qty" data-item-id="${item.id}">
                    <img src="icon_minus.png" alt="-" class="button-icon">
                </button>
                <span class="quantity" id="qty-${item.id}">0</span>
                <button class="neumorphic-button quantity-btn increase-qty" data-item-id="${item.id}">
                    <img src="icon_plus.png" alt="+" class="button-icon">
                </button>
            </div>
        `;
        domElements.itemListContainer.appendChild(itemCard);
    });
    updateItemQuantitiesInUI();
}

export function populatePickupTimeSlots() {
    const currentLang = getCurrentLanguage();
    domElements.pickupTimeSelect.innerHTML = ''; 

    PICKUP_TIME_SLOTS.forEach(slot => {
        const option = document.createElement('option');
        option.value = slot.value;
        option.textContent = currentLang === 'ar' ? slot.arText : slot.enText;
        domElements.pickupTimeSelect.appendChild(option);
    });
}

export function updateItemQuantitiesInUI() {
    const currentOrder = getCurrentOrder();
    document.querySelectorAll('.quantity').forEach(span => {
        const itemId = span.id.split('-')[1];
        span.textContent = currentOrder[itemId] || 0;
    });
}

export function updateTotalItemsCount() {
    const currentOrder = getCurrentOrder();
    const totalCount = Object.values(currentOrder).reduce((sum, qty) => sum + qty, 0);
    domElements.totalItemsCountSpan.textContent = `(${totalCount})`;
    domElements.proceedToOrderBtn.disabled = totalCount === 0;
}

export function showConfirmationPopup(orderMessage) {
    const currentOrderID = getCurrentOrderID();
    if (currentOrderID) {
        domElements.popupOrderIDStrong.textContent = currentOrderID;
    } else {
        domElements.popupOrderIDStrong.textContent = ''; 
    }
    const selectedTimeValue = getSelectedPickupTime();
    const currentLang = getCurrentLanguage();
    const selectedSlot = PICKUP_TIME_SLOTS.find(slot => slot.value === selectedTimeValue);
    if (selectedSlot) {
        domElements.popupPickupTimeStrong.textContent = currentLang === 'ar' ? selectedSlot.arText : selectedSlot.enText;
        domElements.popupPickupTimeStrong.parentElement.style.display = ''; 
    } else {
        domElements.popupPickupTimeStrong.textContent = '';
        domElements.popupPickupTimeStrong.parentElement.style.display = 'none'; 
    }

    domElements.orderSummaryPopupDiv.innerHTML = orderMessage.replace(/\n/g, '<br>');
    domElements.confirmationPopup.style.display = 'flex';
}

export function populateMyOrdersScreen() {
    const history = getOrderHistory();
    const currentLang = getCurrentLanguage();
    domElements.orderHistoryListContainer.innerHTML = ''; 

    if (history.length === 0) {
        domElements.noOrdersMessage.style.display = 'block';
        domElements.noOrdersMessage.textContent = translations[currentLang].noOrdersYet;
        return;
    }

    domElements.noOrdersMessage.style.display = 'none';

    history.forEach(order => {
        const itemCard = document.createElement('div');
        itemCard.className = 'order-history-item neumorphic';

        let itemsSummary = "";
        for (const itemId in order.items) {
            const itemData = laundryItemsData.find(item => item.id == itemId);
            if (itemData) {
                const itemName = currentLang === 'ar' ? itemData.arName : itemData.enName;
                itemsSummary += `${itemName} (${order.items[itemId]}), `;
            }
        }
        itemsSummary = itemsSummary.replace(/, $/, ""); 

        const pickupSlot = PICKUP_TIME_SLOTS.find(slot => slot.value === order.pickupTime);
        const pickupTimeText = pickupSlot ? (currentLang === 'ar' ? pickupSlot.arText : pickupSlot.enText) : (order.pickupTime || "N/A");
        
        const orderDate = order.dateTime ? order.dateTime.date : "N/A";
        const orderTime = order.dateTime ? order.dateTime.time : "N/A";

        itemCard.innerHTML = `
            <h4>${translations[currentLang].orderIDLabel} ${order.id}</h4>
            <p><strong>${translations[currentLang].date}:</strong> ${orderDate} | <strong>${translations[currentLang].time}:</strong> ${orderTime}</p>
            <p><strong>${translations[currentLang].pickupTimeShort}:</strong> ${pickupTimeText}</p>
            <p><strong>${translations[currentLang].items}:</strong> <span class="order-items-summary">${itemsSummary}</span></p>
            <p><strong>${translations[currentLang].orderStatus}:</strong> <span class="status-${(order.status || 'sent').toLowerCase()}">${translations[currentLang].statusSent}</span></p>
            <div class="order-actions">
                <button class="neumorphic-button view-summary-btn" data-order-id="${order.id}">
                    <img src="icon_view_summary.png" alt="" class="button-icon"> <span data-translate-inner="viewSummary">${translations[currentLang].viewSummary}</span>
                </button>
                <button class="neumorphic-button resend-order-btn" data-order-id="${order.id}">
                    <img src="icon_resend.png" alt="" class="button-icon"> <span data-translate-inner="resendOrder">${translations[currentLang].resendOrder}</span>
                </button>
            </div>
        `;
        domElements.orderHistoryListContainer.appendChild(itemCard);
    });
}

export function showViewOrderPopup(order, orderMessageString) {
    const currentLang = getCurrentLanguage();
    domElements.viewPopupOrderID.textContent = order.id;
    domElements.viewPopupName.textContent = order.name || translations[currentLang].notAvailable || "N/A";
    domElements.viewPopupPhone.textContent = order.phone || translations[currentLang].notAvailable || "N/A";
    domElements.viewPopupLocation.textContent = order.location || translations[currentLang].notAvailable || "N/A";
    
    const pickupSlot = PICKUP_TIME_SLOTS.find(slot => slot.value === order.pickupTime);
    const pickupTimeText = pickupSlot ? (currentLang === 'ar' ? pickupSlot.arText : pickupSlot.enText) : (order.pickupTime || "N/A");
    domElements.viewPopupPickupTime.textContent = pickupTimeText;

    domElements.viewPopupDate.textContent = `${order.dateTime.date} | ${order.dateTime.time}`;
    
    domElements.viewOrderSummaryPopupDiv.innerHTML = `<strong style="display:block; margin-bottom:5px;">${translations[currentLang].whatsAppMessage}:</strong>` + orderMessageString.replace(/\n/g, '<br>');
    domElements.viewOrderPopup.style.display = 'flex';
}