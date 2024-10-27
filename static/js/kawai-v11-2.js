/*
    COPYRIGHT BY YUKI ARIMO
    KAWAI FRAMEWORK
*/

const navbarLinks = document.querySelector('.top-tab-block');
const addClosers = document.querySelectorAll('.block-popup');
const modeElementList = '.block-text, p, a, ul, li, ol, h1, h2, h3, h4, h5, h6, .side-tab-block-e, .block-input, label, .block-list-e, .block-dropdown-tab';
const sidebar = document.getElementById('sidebar');
const blocko = document.querySelector('.block-o');
const sendMessageContainer = document.querySelector('.input-container');
const topbar = document.querySelector('.topbar-o');

// Toggle Sidebar
function toggleSidebar() {
    sidebar.classList.toggle('showside');
    sidebar.classList.toggle('hideside');
    blocko.classList.toggle('uside');
    kawaiAutoScale();
};

// Close Popups
document.querySelectorAll('.block-button-close').forEach(btn => {
    btn.parentElement.style.display = 'none';
});

// Open Link
const OpenLink = link => window.open(link, '_self');

// Open Popup
const OpenPopup = id => document.getElementById(id).style.display = 'flex';

// Toggle Dropdown Tab
const OpenTablo = tablo => {
    document.querySelectorAll('.block-dropdown-tab-lo').forEach(el => {
        el.style.display = el.id === tablo && getComputedStyle(el).display !== 'flex' ? 'flex' : 'none';
    });
};

// Tab Selection
document.querySelectorAll(".side-tab-block-e").forEach(el => {
    el.addEventListener('click', () => {
        document.querySelectorAll(".side-tab-block-e").forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
    });
});

// Open Tab
const OpenTab = tab => {
    document.querySelectorAll('.tab-o').forEach(el => el.style.display = 'none');
    document.getElementById(tab).style.display = 'flex';
};

// Dark Mode Styles
const applyDarkModeStyles = () => {
    const darkStyles = {
        'backgroundColor': 'rgb(30, 30, 30)',
        'color': 'white'
    };
    document.body.style.backgroundColor = darkStyles.backgroundColor;
    topbar.style.color = darkStyles.color;
    sidebar.style.backgroundColor = 'rgb(36, 38, 38)';

    document.querySelectorAll('.block-card, .block-dropdown-tab-lo, .modal-content, .side-tab-block-e').forEach(el => {
        el.style.backgroundColor = 'rgb(36, 38, 38)';
    });

    document.querySelectorAll('.block-chat').forEach(chat => chat.style.background = '#1a1a1a');
    document.querySelectorAll(modeElementList).forEach(el => el.style.color = darkStyles.color);
    document.querySelectorAll('.block-input').forEach(input => {
        input.style.backgroundColor = 'rgb(32, 35, 37)';
        input.style.color = darkStyles.color;
    });
    const textInputMsg = document.getElementById('input_text');
    if (textInputMsg) {
        textInputMsg.style.background = 'rgb(32, 35, 37)';
        textInputMsg.style.color = darkStyles.color;
    }
    document.querySelectorAll('.block-icon').forEach(icon => icon.style.filter = 'invert(100%)');
};

// Enable Dark Mode
const enableDarkMode = () => {
    applyDarkModeStyles();
    localStorage.setItem('mode', 'dark');
};

// Enable Light Mode
const enableLightMode = () => {
    document.body.style.backgroundColor = '';
    topbar.style.color = '';
    sidebar.style.backgroundColor = '';
    document.querySelectorAll('.block-card, .block-dropdown-tab-lo, .modal-content, .side-tab-block-e').forEach(el => el.style.backgroundColor = '');
    document.querySelectorAll('.block-chat').forEach(chat => chat.style.background = '');
    document.querySelectorAll(modeElementList).forEach(el => el.style.color = '');
    document.querySelectorAll('.block-input').forEach(input => {
        input.style.backgroundColor = '';
        input.style.color = '';
    });
    const textInputMsg = document.getElementById('input_text');
    if (textInputMsg) {
        textInputMsg.style.background = '';
        textInputMsg.style.color = '';
    }
    document.querySelectorAll('.block-icon').forEach(icon => icon.style.filter = '');
    localStorage.setItem('mode', 'light');
};

// Initialize Theme
const initializeTheme = () => {
    localStorage.getItem('mode') === 'dark' ? enableDarkMode() : enableLightMode();
};

// Toggle Theme
const toggleTheme = () => {
    localStorage.getItem('mode') === 'dark' ? enableLightMode() : enableDarkMode();
};

// Adjust Visible Height
const getVisibleHeight = () => {
    const msgContainer = document.getElementById('message-container');
    const inputWrapper = document.querySelector('.input-wrapper');
    msgContainer.style.height = `calc(100% - ${topbar.offsetHeight}px - ${inputWrapper.offsetHeight}px)`;
};

// Auto Scale Function
const kawaiAutoScale = () => {
    if (topbar && sidebar && blocko) {
        const additionalMargin = 20;
        const sidebarWidth = sidebar.offsetWidth;
        blocko.style.marginTop = `calc(${topbar.offsetHeight}px + ${additionalMargin}px)`;
        blocko.style.width = `calc(100% - ${sidebarWidth}px)`;
        blocko.style.marginLeft = `${sidebarWidth}px`;
        topbar.style.width = `calc(100% - ${sidebarWidth}px)`;
        topbar.style.marginLeft = `${sidebarWidth}px`;
        if (sendMessageContainer) {
            sendMessageContainer.style.width = `calc(100% - ${sidebarWidth}px)`;
            sendMessageContainer.style.marginLeft = `${sidebarWidth}px`;
        }
        if (sidebar.classList.contains('showside')) sidebar.style.display = 'none';
        getVisibleHeight();
    }
};

// Event Listeners
window.addEventListener('load', kawaiAutoScale);
window.addEventListener('resize', kawaiAutoScale);
setTimeout(kawaiAutoScale, 10);

// Initialize Theme on Load
initializeTheme();
toggleSidebar();