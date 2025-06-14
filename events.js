import { domElements } from './dom.js';
import { getCurrentLanguage, getCurrentOrder, updateCurrentOrder, resetCurrentOrder, setCurrentOrderID, getCurrentOrderID, setSelectedPickupTime, getSelectedPickupTime, saveOrderToHistory, saveUserInfo, getUserInfo, getOrderHistory, isUserInfoSaved } from './state.js';
import { setLanguageUI, showScreen, populateItemList, updateTotalItemsCount, updateItemQuantitiesInUI, showConfirmationPopup, populateMyOrdersScreen, populatePickupTimeSlots, populateUserInfoOnOrderScreen, showViewOrderPopup } from './ui.js';
import { translations } from './translations.js';
import { WHATSAPP_NUMBER, laundryItemsData, PICKUP_TIME_SLOTS } from './config.js';

function handleUpdateQuantity(itemId, change) {
    const currentOrder = getCurrentOrder();
    const currentQty = currentOrder[itemId] || 0;
    let newQty = currentQty + change;
    if (newQty < 0) newQty = 0;

    updateCurrentOrder(itemId, newQty);
    
    updateItemQuantitiesInUI();
    updateTotalItemsCount();
}

function formatAMPM(date, lang = 'en') {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? (lang === 'ar' ? 'م' : 'PM') : (lang === 'ar' ? 'ص' : 'AM');
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function detectLocation() {
    const currentLang = getCurrentLanguage();
    if (!navigator.geolocation) {
        domElements.locationStatusP.textContent = translations[currentLang].locationDetectionFailed;
        return;
    }

    domElements.locationStatusP.textContent = translations[currentLang].locationDetecting;
    domElements.detectLocationBtn.disabled = true;

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const mapsLink = `https://maps.google.com/?q=${lat},${lon}`;
            domElements.customerAddressInput.value = mapsLink;
            domElements.locationStatusP.textContent = `${translations[currentLang].mapLink}: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
            domElements.detectLocationBtn.disabled = false;
        },
        (error) => {
            let messageKey;
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    messageKey = "locationPermissionDenied";
                    break;
                case error.POSITION_UNAVAILABLE:
                case error.TIMEOUT:
                default:
                    messageKey = "locationDetectionFailed";
                    break;
            }
            domElements.locationStatusP.textContent = translations[currentLang][messageKey];
            domElements.detectLocationBtn.disabled = false;
        },
        { timeout: 10000, enableHighAccuracy: true }
    );
}

function formatOrderForWhatsApp(orderToFormat = null) {
    const currentLang = getCurrentLanguage();
    
    let orderID, name, phone, location, itemsToFormat, selectedPickupTimeValue, orderDate, orderTime;

    if (orderToFormat) { // Resending historical order
        orderID = orderToFormat.id;
        name = orderToFormat.name;
        phone = orderToFormat.phone;
        location = orderToFormat.location;
        itemsToFormat = orderToFormat.items;
        selectedPickupTimeValue = orderToFormat.pickupTime;
        orderDate = orderToFormat.dateTime.date;
        orderTime = orderToFormat.dateTime.time;
    } else { // New order
        const userInfo = getUserInfo();
        name = domElements.customerNameInput.value.trim() || userInfo.name;
        phone = domElements.customerPhoneInput.value.trim() || userInfo.phone;
        location = domElements.customerAddressInput.value.trim();
        itemsToFormat = getCurrentOrder();
        selectedPickupTimeValue = getSelectedPickupTime();
        orderID = getCurrentOrderID(); 
        
        const now = new Date();
        orderDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
        orderTime = formatAMPM(now, currentLang);
    }

    if (!name || !phone) {
        alert(translations[currentLang].fillNamePhone);
        return null;
    }
     if (orderToFormat && !location && !domElements.customerAddressInput.value.trim()) { // Location might be optional for resend if not captured before
        // If resending and location was not part of historical order, it's fine
    } else if (!location) {
        alert(translations[currentLang].fillLocation);
        return null;
    }
    if (Object.keys(itemsToFormat).length === 0) {
        alert(translations[currentLang].noItemsSelected);
        return null;
    }

    let itemsListString = "";
    for (const itemId in itemsToFormat) {
        const itemData = laundryItemsData.find(item => item.id == itemId);
        const itemName = currentLang === 'ar' ? itemData.arName : itemData.enName;
        itemsListString += `- ${itemName} (${itemsToFormat[itemId]})\n`;
    }
    
    const pickupSlot = PICKUP_TIME_SLOTS.find(slot => slot.value === selectedPickupTimeValue);
    const pickupTimeText = pickupSlot ? (currentLang === 'ar' ? pickupSlot.arText : pickupSlot.enText) : (selectedPickupTimeValue || "N/A");
    
    const messageParts = [
        `${translations[currentLang].orderIDLabel} ${orderID}`,
        `${translations[currentLang].newLaundryOrder}:`, // Added this line based on spec for WhatsApp msg
        `${translations[currentLang].name}: ${name}`,
        `${translations[currentLang].phone}: ${phone}`,
        `${translations[currentLang].mapLink}: ${location || translations[currentLang].notAvailable || 'N/A'}`,
        `${translations[currentLang].pickupTimeWhatsApp}: ${pickupTimeText}`,
        `${translations[currentLang].items}:`,
        itemsListString.trim(),
        `${translations[currentLang].date}: ${orderDate} | ${translations[currentLang].time}: ${orderTime}`
    ];
    
    return messageParts.join('\n');
}

export function setupEventListeners() {
    domElements.langEnBtn.onclick = () => setLanguageUI('en');
    domElements.langArBtn.onclick = () => setLanguageUI('ar');

    // Event delegation for item list quantity controls
    domElements.itemListContainer.addEventListener('click', event => {
        const button = event.target.closest('.quantity-btn');
        if (!button) return;

        const itemId = button.dataset.itemId;
        if (button.classList.contains('increase-qty')) {
            handleUpdateQuantity(itemId, 1);
        } else if (button.classList.contains('decrease-qty')) {
            handleUpdateQuantity(itemId, -1);
        }
    });

    // Event delegation for my orders actions
    domElements.orderHistoryListContainer.addEventListener('click', event => {
        const viewBtn = event.target.closest('.view-summary-btn');
        if (viewBtn) {
            handleViewOrderSummary(viewBtn.dataset.orderId);
            return;
        }
        const resendBtn = event.target.closest('.resend-order-btn');
        if (resendBtn) {
            handleResendOrder(resendBtn.dataset.orderId);
        }
    });

    // User Info Screen
    if (domElements.saveUserInfoBtn) {
        domElements.saveUserInfoBtn.onclick = () => {
            const name = domElements.userFullNameInput.value.trim();
            const phone = domElements.userPhoneNumberInput.value.trim();
            const currentLang = getCurrentLanguage();
            const phoneRegex = /^(\+9665|05)[0-9]{8}$/;

            if (!name || !phone) {
                domElements.userInfoStatusP.textContent = translations[currentLang].fillAllFields;
                domElements.userInfoStatusP.className = 'status-message error';
                return;
            }
            if (!phoneRegex.test(phone)) {
                domElements.userInfoStatusP.textContent = translations[currentLang].invalidPhoneNumber;
                domElements.userInfoStatusP.className = 'status-message error';
                return;
            }

            saveUserInfo(name, phone);
            domElements.userInfoStatusP.textContent = translations[currentLang].infoSaved;
            domElements.userInfoStatusP.className = 'status-message';
            setTimeout(() => { // Show home screen after a brief moment
                populateUserInfoOnOrderScreen(); // Pre-fill order screen now that info is saved
                showScreen(domElements.homeScreen);
                domElements.userInfoStatusP.textContent = ''; // Clear status
            }, 1000);
        };
    }

    domElements.orderNowBtn.onclick = () => {
        if (!isUserInfoSaved()) { // Double check, though main.js should handle initial redirect
            showScreen(domElements.userInfoScreen);
        } else {
            populateUserInfoOnOrderScreen(); // Ensure fields are populated
            showScreen(domElements.itemSelectionScreen);
        }
    };
    domElements.backToHomeBtn.onclick = () => showScreen(domElements.homeScreen);
    
    domElements.proceedToOrderBtn.onclick = () => {
        if (Object.keys(getCurrentOrder()).length > 0) {
            populateUserInfoOnOrderScreen(); // Ensure name/phone are pre-filled
            if (!getSelectedPickupTime() && PICKUP_TIME_SLOTS.length > 0) {
                if (domElements.pickupTimeSelect.options.length > 0) {
                     setSelectedPickupTime(domElements.pickupTimeSelect.value);
                }
            }
            showScreen(domElements.orderScreen);
        } else {
            alert(translations[getCurrentLanguage()].noItemsSelected);
        }
    };
    domElements.backToItemsBtn.onclick = () => showScreen(domElements.itemSelectionScreen);

    domElements.detectLocationBtn.onclick = detectLocation;
    domElements.pickupTimeSelect.onchange = (event) => setSelectedPickupTime(event.target.value);

    domElements.sendWhatsAppOrderBtn.onclick = () => {
        const newOrderID = generateOrderID();
        setCurrentOrderID(newOrderID); 

        if (!getSelectedPickupTime() && domElements.pickupTimeSelect.options.length > 0) {
            setSelectedPickupTime(domElements.pickupTimeSelect.value);
        }

        const orderMessage = formatOrderForWhatsApp(); // Uses current DOM/state for new order
        if (orderMessage) {
            const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER.replace('+', '')}&text=${encodeURIComponent(orderMessage)}`;
            
            const userInfo = getUserInfo();
            const now = new Date();
            const orderData = {
                id: newOrderID,
                name: domElements.customerNameInput.value.trim() || userInfo.name, // Save name used for THIS order
                phone: domElements.customerPhoneInput.value.trim() || userInfo.phone, // Save phone used for THIS order
                location: domElements.customerAddressInput.value.trim(), // Save location used for THIS order
                items: { ...getCurrentOrder() }, 
                dateTime: { 
                    date: `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`,
                    time: formatAMPM(now, getCurrentLanguage())
                },
                pickupTime: getSelectedPickupTime(),
                status: "Sent" 
            };
            saveOrderToHistory(orderData);

            window.open(whatsappUrl, '_blank');
            showConfirmationPopup(orderMessage); 
        }
    };
    
    domElements.newOrderBtn.onclick = () => {
        domElements.confirmationPopup.style.display = 'none';
        
        // Do not clear name/phone if they are globally saved. They will be pre-filled.
        // domElements.customerNameInput.value = ''; 
        // domElements.customerPhoneInput.value = '';
        populateUserInfoOnOrderScreen(); // Re-populate with saved info

        domElements.customerAddressInput.value = '';
        domElements.locationStatusP.textContent = '';
        if (domElements.pickupTimeSelect.options.length > 0) {
            domElements.pickupTimeSelect.selectedIndex = 0; 
            setSelectedPickupTime(domElements.pickupTimeSelect.value); 
        } else {
            setSelectedPickupTime(null);
        }
        resetCurrentOrder();
        populateItemList(); 
        updateTotalItemsCount();
        showScreen(domElements.homeScreen);
    };

    // My Orders Screen button
    domElements.myOrdersBtn.onclick = () => {
        showScreen(domElements.myOrdersScreen);
        // populateMyOrdersScreen(); // showScreen will call it
    };
    domElements.backToHomeFromOrdersBtn.onclick = () => showScreen(domElements.homeScreen);

    // Support Button
    domElements.supportBtn.onclick = () => {
        const supportNumber = WHATSAPP_NUMBER.replace('+', '');
        window.open(`https://wa.me/${supportNumber}`, '_blank');
    };

    // Track Order Button (Home Screen)
    domElements.trackOrderBtnHome.onclick = () => {
        const currentLang = getCurrentLanguage();
        alert(`${translations[currentLang].comingSoonTitle}\n\n${translations[currentLang].comingSoonMessageTrack}`);
    };

    // Close View Order Popup
    if (domElements.closeViewOrderPopupBtn) {
        domElements.closeViewOrderPopupBtn.onclick = () => {
            domElements.viewOrderPopup.style.display = 'none';
        };
    }

    // Initialize pickup time from the first option if available
    if (domElements.pickupTimeSelect.options.length > 0) {
        setSelectedPickupTime(domElements.pickupTimeSelect.value);
    }
}

function generateOrderID() {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    return `#LS${randomNumber}`;
}

// Handlers for My Orders actions (called from ui.js event attachments)
export function handleResendOrder(orderId) {
    const history = getOrderHistory();
    const orderToResend = history.find(order => order.id === orderId);
    const currentLang = getCurrentLanguage();

    if (orderToResend) {
        // Pre-fill order screen inputs with historical data for consistency if needed,
        // or ensure formatOrderForWhatsApp can take all necessary data directly.
        // The latter is implemented in formatOrderForWhatsApp.
        const orderMessage = formatOrderForWhatsApp(orderToResend);
        if (orderMessage) {
            const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER.replace('+', '')}&text=${encodeURIComponent(orderMessage)}`;
            window.open(whatsappUrl, '_blank');
            alert(translations[currentLang].orderResent);
        }
    } else {
        alert("Error: Order not found."); // Should not happen if UI is correct
    }
}

export function handleViewOrderSummary(orderId) {
    const history = getOrderHistory();
    const orderToView = history.find(order => order.id === orderId);

    if (orderToView) {
        // Generate the message string as it would appear in WhatsApp for viewing
        const orderMessageString = formatOrderForWhatsApp(orderToView);
        if (orderMessageString) {
            showViewOrderPopup(orderToView, orderMessageString);
        } else {
             alert("Error: Could not generate order summary.");
        }
    } else {
        alert("Error: Order not found.");
    }
}