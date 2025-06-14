export const domElements = {
    appContainer: document.getElementById('app-container'),
    screens: document.querySelectorAll('.screen'),
    userInfoScreen: document.getElementById('user-info-screen'),
    homeScreen: document.getElementById('home-screen'),
    itemSelectionScreen: document.getElementById('item-selection-screen'),
    orderScreen: document.getElementById('order-screen'),
    myOrdersScreen: document.getElementById('my-orders-screen'), 
    confirmationPopup: document.getElementById('confirmation-popup'),
    viewOrderPopup: document.getElementById('view-order-popup'), 

    appTitleText: document.getElementById('app-title-text'), 
    langEnBtn: document.getElementById('lang-en'),
    langArBtn: document.getElementById('lang-ar'),

    orderNowBtn: document.getElementById('order-now-btn'),
    myOrdersBtn: document.getElementById('my-orders-btn'),
    trackOrderBtnHome: document.getElementById('track-order-btn'),
    supportBtn: document.getElementById('support-btn'),
    installAppBtn: document.getElementById('install-app-btn'),

    backToHomeBtn: document.getElementById('back-to-home-btn'),
    proceedToOrderBtn: document.getElementById('proceed-to-order-btn'),
    backToItemsBtn: document.getElementById('back-to-items-btn'),
    detectLocationBtn: document.getElementById('detect-location-btn'),
    sendWhatsAppOrderBtn: document.getElementById('send-whatsapp-order-btn'),
    newOrderBtn: document.getElementById('new-order-btn'),
    backToHomeFromOrdersBtn: document.getElementById('back-to-home-from-orders-btn'), 

    // User Info Screen Elements
    userFullNameInput: document.getElementById('user-full-name'),
    userPhoneNumberInput: document.getElementById('user-phone-number'),
    saveUserInfoBtn: document.getElementById('save-user-info-btn'),
    userInfoStatusP: document.getElementById('user-info-status'),

    itemListContainer: document.getElementById('item-list'),
    totalItemsCountSpan: document.getElementById('total-items-count'),
    
    customerNameInput: document.getElementById('customer-name'),
    customerPhoneInput: document.getElementById('customer-phone'),
    customerAddressInput: document.getElementById('customer-address'),
    locationStatusP: document.getElementById('location-status'),
    pickupTimeSelect: document.getElementById('pickup-time'), 
    
    orderSummaryPopupDiv: document.getElementById('order-summary-popup'),
    popupOrderIDStrong: document.getElementById('popup-order-id'),
    popupPickupTimeStrong: document.getElementById('popup-pickup-time'), 

    // View Order Popup Elements
    viewPopupOrderID: document.getElementById('view-popup-order-id'),
    viewPopupName: document.getElementById('view-popup-name'),
    viewPopupPhone: document.getElementById('view-popup-phone'),
    viewPopupLocation: document.getElementById('view-popup-location'),
    viewPopupPickupTime: document.getElementById('view-popup-pickup-time'),
    viewPopupDate: document.getElementById('view-popup-date'),
    viewOrderSummaryPopupDiv: document.getElementById('view-order-summary-popup'),
    closeViewOrderPopupBtn: document.getElementById('close-view-order-popup-btn'), 

    orderHistoryListContainer: document.getElementById('order-history-list-container'), 
    noOrdersMessage: document.getElementById('no-orders-message') 
};