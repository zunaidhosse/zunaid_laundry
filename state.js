export let currentLanguage = 'ar';
export let currentOrder = {}; // Stores { itemId: quantity }
export let currentOrderID = null;
export let selectedPickupTime = null; 
export let userName = ''; // New
export let userPhone = ''; // New

export const ORDER_HISTORY_KEY = 'zunaidLaundryOrderHistory';
export const USER_INFO_KEY = 'zunaidLaundryUserInfo'; // New
export const USER_INFO_SAVED_FLAG = '__DELETE_ME__';


export function setCurrentLanguage(lang) {
    currentLanguage = lang;
}

export function updateCurrentOrder(itemId, quantity) {
    if (quantity === 0) {
        delete currentOrder[itemId];
    } else {
        currentOrder[itemId] = quantity;
    }
}

export function resetCurrentOrder() {
    currentOrder = {};
    resetCurrentOrderID();
}

export function getCurrentOrder() {
    return currentOrder;
}

export function getCurrentLanguage() {
    return currentLanguage;
}

export function setCurrentOrderID(id) {
    currentOrderID = id;
}

export function getCurrentOrderID() {
    return currentOrderID;
}

export function resetCurrentOrderID() {
    currentOrderID = null;
}

export function setSelectedPickupTime(time) {
    selectedPickupTime = time;
}

export function getSelectedPickupTime() {
    return selectedPickupTime;
}

// User Info Management
export function saveUserInfo(name, phone) {
    userName = name;
    userPhone = phone;
    localStorage.setItem(USER_INFO_KEY, JSON.stringify({ name, phone }));
}

export function loadUserInfo() {
    const savedInfo = localStorage.getItem(USER_INFO_KEY);
    if (savedInfo) {
        const info = JSON.parse(savedInfo);
        userName = info.name;
        userPhone = info.phone;
        return info;
    }
    return null;
}

export function getUserInfo() {
    return { name: userName, phone: userPhone };
}

export function isUserInfoSaved() {
    return !!localStorage.getItem(USER_INFO_KEY);
}

// Order History Management
export function getOrderHistory() {
    const history = localStorage.getItem(ORDER_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
}

export function saveOrderToHistory(orderData) {
    const history = getOrderHistory();
    history.unshift(orderData); // Add new order to the beginning
    localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(history.slice(0, 50))); // Limit history size
}