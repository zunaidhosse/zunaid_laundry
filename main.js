import { domElements } from './dom.js';
import { getCurrentLanguage, setSelectedPickupTime, loadUserInfo, isUserInfoSaved } from './state.js';
import { setLanguageUI, showScreen, populatePickupTimeSlots, populateUserInfoOnOrderScreen } from './ui.js';
import { setupEventListeners } from './events.js';
import { translations } from './translations.js';

let deferredInstallPrompt = null;

function showOfflineToast() {
    const toast = document.getElementById('offline-toast');
    if (!toast) return;

    const toastSpan = toast.querySelector('span');
    if (toastSpan) {
        const lang = getCurrentLanguage();
        toastSpan.textContent = translations[lang]?.offlineReady || 'App is ready for offline use!';
    }
    
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000); // Hide after 4 seconds
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
            .then(reg => {
                console.log('ServiceWorker registration successful.', reg);
                reg.onupdatefound = () => {
                    const installingWorker = reg.installing;
                    if (installingWorker) {
                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed') {
                                if (navigator.serviceWorker.controller) {
                                    // A new SW is installed, but not yet controlling the page.
                                    console.log('New content is available; please refresh.');
                                } else {
                                    // This is the first time a SW is installed.
                                    // Content is now cached and ready for offline use.
                                    console.log('Content is cached for offline use.');
                                    showOfflineToast();
                                }
                            }
                        };
                    }
                };
            }).catch(error => {
                console.log('Service Worker registration failed:', error);
            });
        });
    }
}

function setupPwaInstall() {
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredInstallPrompt = e;
        // Update UI notify the user they can install the PWA
        if (domElements.installAppBtn) {
            domElements.installAppBtn.style.display = 'flex';
        }
    });

    if (domElements.installAppBtn) {
        domElements.installAppBtn.addEventListener('click', async () => {
            if (deferredInstallPrompt) {
                // Show the install prompt
                deferredInstallPrompt.prompt();
                // Wait for the user to respond to the prompt
                const { outcome } = await deferredInstallPrompt.userChoice;
                // Optionally, send analytics event with outcome of user choice
                console.log(`User response to the install prompt: ${outcome}`);
                // We've used the prompt, and can't use it again, but we can listen for the event again
                deferredInstallPrompt = null;
                // Hide the install button
                domElements.installAppBtn.style.display = 'none';
            }
        });
    }

    window.addEventListener('appinstalled', () => {
        // Log install to analytics
        console.log('INSTALL: Success');
        deferredInstallPrompt = null;
        if (domElements.installAppBtn) {
            domElements.installAppBtn.style.display = 'none';
        }
    });
}

export function initializeApp() {
    loadUserInfo(); // Load user info from localStorage into state

    populatePickupTimeSlots(); 
    if (domElements.pickupTimeSelect.options.length > 0) { 
        setSelectedPickupTime(domElements.pickupTimeSelect.value);
    }
    setLanguageUI(getCurrentLanguage()); 
    
    if (!isUserInfoSaved()) {
        showScreen(domElements.userInfoScreen);
    } else {
        populateUserInfoOnOrderScreen(); // Pre-fill order screen if info exists
        showScreen(domElements.homeScreen); 
    }
    setupEventListeners(); 
    setupPwaInstall();
    registerServiceWorker();
}