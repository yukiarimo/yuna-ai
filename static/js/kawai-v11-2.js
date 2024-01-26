/*
    COPYRIGHT BY YUKI ARIMO
    KAWAI FRAMEWORK
*/

const toggleButton = document.getElementsByClassName('toggle-menu-block')[0]
const navbarLinks = document.getElementsByClassName('top-tab-block')[0]
const addclosers = document.querySelectorAll('.block-popup');
const modeElementList = '.block-text, p, a, ul, li, ol, h1, h2, h3, h4, h5, h6, .side-tab-block-e, .block-input, label, .block-list-e, .block-dropdown-tab'
const sidebar = document.getElementById('sidebar');
const blocko = document.querySelector('.block-o');

// Event listener for the toggle button
function toggleSidebar() {
    sidebar.classList.toggle('showside');
    sidebar.classList.toggle('hideside');
    blocko.classList.toggle('uside');
    kawaiAutoScale();
}

function PopupClose() {
    const howmanyclosers = document.querySelectorAll('.block-button-close');
    if (howmanyclosers.length) {
        for (let step = 0; step < howmanyclosers.length; step++) {
            const element = howmanyclosers[step].parentElement;
            element.style.display = 'none'
        }
    }
}

function OpenLink(getlink) {
    window.open(getlink, '_self');
}

function OpenPopup(getid) {
    document.getElementById(getid).style.display = 'flex';
}

function OpenTablo(tablo) {
    var tablos = document.querySelectorAll('.block-dropdown-tab-lo');

    if (tablos.length) {
        for (let step = 0; step < tablos.length; step++) {
            var element = tablos[step];
            element.style = "display: none";
        }
    }

    for (let step = 0; step < tablos.length; step++) {
        let element = tablos[step];
        if (element.get)
            element.style = "display: none";
    }

    if (getComputedStyle(document.getElementById(tablo)).display == 'flex') {
        document.getElementById(tablo).style = "display: none"
    } else if (getComputedStyle(document.getElementById(tablo)).display == 'none') {
        document.getElementById(tablo).style = "display: flex"
    }
}

document.querySelectorAll(".side-tab-block-e").forEach(function (element) {
    element.addEventListener('click', function () {
        document.querySelectorAll(".side-tab-block-e").forEach(function (e) {
            e.classList.remove('selected');
        });
        this.classList.add('selected')
    })
})

function highlightSelectedTab() {
    document.getElementsByClassName
}

function OpenTab(gettab) {

    const howmanytabs = document.querySelectorAll('.tab-o');
    if (howmanytabs.length) {
        for (let step = 0; step < howmanytabs.length; step++) {
            const element = howmanytabs[step];
            element.style.display = 'none'
        }
    }
    document.getElementById(gettab).style.display = 'flex';
}

function applyDarkModeStyles() {
    document.body.style.backgroundColor = "rgb(30, 30, 30)";
    document.querySelector('.topbar-o').style.color = 'white';
    document.querySelector('.sidebar-o').style.backgroundColor = 'rgb(36, 38, 38)';

    const blockCards = document.querySelectorAll('.block-card');
    blockCards.forEach(card => {
        card.style.background = 'rgb(36, 38, 38)';
    });

    const blockChats = document.querySelectorAll('.block-chat')
    blockChats.forEach(chat => {
        chat.style.background = '#1a1a1a';
    });

    const elementsToStyle = document.querySelectorAll(modeElementList);
    elementsToStyle.forEach(element => {
        element.style.color = 'white';
    });

    // Custom styles added by user, should be added in the future releases

    // Set the mode to dark for text inputs
    const textInputs = document.querySelectorAll('.block-input');
    textInputs.forEach(input => {
        input.style.backgroundColor = 'rgb(32, 35, 37);';
        input.style.color = 'white';
    });

    const textInputMsg = document.getElementById('input_text');
    if (textInputMsg) {
        textInputMsg.style.background = 'rgb(32, 35, 37);';
        textInputMsg.style.color = 'white';
    }

    // Invert the icons
    const icons = document.querySelectorAll('.block-icon');
    icons.forEach(icon => {
        icon.style.filter = 'invert(100%)';
    });

    // dark mode for side-tab-block-e
    const sideTabBlocks = document.querySelectorAll('.side-tab-block-e');
    sideTabBlocks.forEach(block => {
        block.style.backgroundColor = 'rgb(36, 38, 38)';
    });

    // dark mode for .modal-content
    const modalContent = document.querySelectorAll('.modal-content');
    modalContent.forEach(content => {
        content.style.backgroundColor = 'rgb(36, 38, 38)';
    });
}

function enableDarkMode() {
    applyDarkModeStyles();
    localStorage.setItem('mode', 'dark');
}

function enableLightMode() {
    // Reset styles to the default light mode styles
    document.body.style.backgroundColor = '';

    const topbar = document.querySelector('.topbar-o');
    if (topbar) {
        topbar.style.color = '';
    }

    const sidebar = document.querySelector('.sidebar-o');
    if (sidebar) {
        sidebar.style.backgroundColor = '';
    }

    const blockCards = document.querySelectorAll('.block-card');
    blockCards.forEach(card => {
        card.style.background = '';
    });

    const blockChats = document.querySelectorAll('.block-chat')
    blockChats.forEach(chat => {
        chat.style.background = '';
    });

    const elementsToStyle = document.querySelectorAll(modeElementList);
    elementsToStyle.forEach(element => {
        element.style.color = '';
    });

    localStorage.setItem('mode', 'light');
}

function initializeTheme() {
    const storedMode = localStorage.getItem('mode');
    if (storedMode === 'dark') {
        enableDarkMode();
    } else {
        enableLightMode();
    }
}

function toggleTheme() {
    const currentMode = localStorage.getItem('mode');
    if (currentMode === 'dark') {
        enableLightMode();
    } else {
        enableDarkMode();
    }
}

// Function to set margin-top for .block-o dynamically
function kawaiAutoScale() {
    var topbar = document.querySelector('.topbar-o');
    var sidebar = document.querySelector('.sidebar-o');
    var blocko = document.querySelector('.block-o');
    var sendMessageContainer = document.getElementById('sendMessageContainer');

    if (topbar && sidebar && blocko) {
        var topbarHeight = topbar.offsetHeight;
        var sidebarWidth = sidebar.offsetWidth;
        var sidebarWidth = sidebar.offsetWidth;
        var additionalMargin = 20;

        // Set margin-top for .block-o
        blocko.style.marginTop = `calc(${topbarHeight}px + ${additionalMargin}px)`;
        blocko.style.width = `calc(100% - ${sidebarWidth}px)`;
        blocko.style.marginLeft = `${sidebarWidth}px`;
        topbar.style.width = `calc(100% - ${sidebarWidth}px)`;
        topbar.style.marginLeft = `${sidebarWidth}px`;

        // for sendMessageContainer make width 100% - sidebarWidth and margin-left sidebarWidth
        if (sendMessageContainer) {
            sendMessageContainer.style.width = `calc(100% - ${sidebarWidth}px)`;
            sendMessageContainer.style.marginLeft = `${sidebarWidth}px`;
        }
    }
}

// Call the function on window load and resize
window.addEventListener('load', kawaiAutoScale);
window.addEventListener('resize', kawaiAutoScale);

// Call this function to initialize the theme when the page loads
initializeTheme();

/*
    COPYRIGHT BY YUKI ARIMO
    KAWAI FRAMEWORK
*/