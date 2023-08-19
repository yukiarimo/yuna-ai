"use strict"

/*
    COPYRIGHT BY YUKI ARIMO
    KAWAI FRAMEWORK
*/

var cssId = 'myCss';  // you could encode the css path itself to generate id..
if (!document.getElementById(cssId))
{
    var head  = document.getElementsByTagName('head')[0];
    var link  = document.createElement('link');
    link.id   = cssId;
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = 'assets/css/kawai.css';
    link.media = 'all';
    head.appendChild(link);
}

// Variables and sub-processes
let getsideid = 'sidebar'
let checkSide = localStorage.getItem('side');
const toggleButton = document.getElementsByClassName('toggle-menu-block')[0]
const navbarLinks = document.getElementsByClassName('top-tab-block')[0]
const addclosers = document.querySelectorAll('.block-popup');
if (checkSide == '1') {
    SideDisabler();
}
let checkMode = localStorage.getItem('mode');
if (checkMode == '1') {
    DarkEnabler();
}

// Functions
function SideBarSwitch() {
    if (checkSide == 0) {
        SideDisabler('sidebar');
        document.location.reload(true);
    } else {
        localStorage.setItem('side', '0');
        document.location.reload(true);
    }
}

function SideDisabler() {
    localStorage.setItem('sideid', 'sidebar');
    document.getElementById(localStorage.getItem('sideid')).style = "display: none";
    document.getElementsByClassName('block-o')[0].classList.remove('uside')
    /*const howmanytabs = document.querySelectorAll('.tab-o');
    if (howmanytabs.length) {
        for (let step = 0; step < howmanytabs.length; step++) {
            const element = howmanytabs[step];
            element.style.display = 'block'
        }
    }*/
    localStorage.setItem('side', '1');
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

function DarkEnabler() {
    document.getElementsByTagName('body')[0].style = "background-color: rgb(30, 30, 30)";
    document.getElementsByClassName('topbar-o')[0].style = "color: white";
    document.getElementsByClassName('sidebar-o')[0].style = "background-color: rgb(36, 38, 38)";

    var text = document.querySelectorAll('.text-block');
    var blocksidetabse = document.querySelectorAll('.side-tab-block-e');
    var blockinput = document.querySelectorAll('.block-input');
    var blockliste = document.querySelectorAll('.block-list-e');
    var blockdropdowntab = document.querySelectorAll('.block-dropdown-tab')

    if (text.length) {
        for (let step = 0; step < text.length; step++) {
            var element = text[step];
            element.style = "color: white";
        }
    }

    if (blocksidetabse.length) {
        for (let step = 0; step < blocksidetabse.length; step++) {
            var element = blocksidetabse[step];
            element.style = "background-color: rgb(60, 62, 63); color: white";
        }
    }
    if (blockinput.length) {
        for (let step = 0; step < blockinput.length; step++) {
            var element = blockinput[step];
            element.style = "background-color: rgb(40, 40, 40); color: white";
        }
    }
    if (blockliste.length) {
        for (let step = 0; step < blockliste.length; step++) {
            var element = blockliste[step];
            element.style = "color: white";
        }
    }
    if (blockdropdowntab.length) {
        for (let step = 0; step < blockdropdowntab.length; step++) {
            var element = blockdropdowntab[step];
            element.style = "color: white";
        }
    }
}

function ThemeSwitch() {
    if (checkMode == '0') {
        DarkEnabler();
        localStorage.setItem('mode', '1');
        document.location.reload(true);
    } else {
        localStorage.setItem('mode', '0');
        document.location.reload(true);
    }
}

// Document element optimizers
document.getElementsByClassName('toggle-switch-block')[0].innerHTML = `
<label class="switch" onclick="ThemeSwitch()">
  <input type="checkbox">
  <span class="slider round"></span>
</label>`;

document.getElementsByClassName('toggle-menu-block')[0].innerHTML = `
<span class="bar"></span>
<span class="bar"></span>
<span class="bar"></span>`;

toggleButton.addEventListener('click', () => {
    navbarLinks.classList.toggle('active')
})

document.getElementsByClassName("block-button-close-e").onclick = function (e) {
    location.reload(true);
}

if (addclosers.length) {
    for (let step = 0; step < addclosers.length; step++) {
        const element = addclosers[step];
        let test = document.createElement("div")
        test.setAttribute('class', 'block-button-close')
        test.setAttribute('onclick', 'PopupClose()')
        test.textContent = 'X'
        element.appendChild(test);
    }
}

let sideBar = document.getElementsByClassName('sidebar-o')[0]

sideBar.style.display = "flex";
sideBar.classList.add('side-on');

var SideSwitcher = document.createElement('div');
SideSwitcher.classList.add('side-switch');
SideSwitcher.nodeValue = '='
SideSwitcher.appendChild(sideBar);

sideBar.addEventListener('click', () => {
    if (sideBar.classList.contains('side-on')) {
        sideBar.style.display = "none";
    } else {
        sideBar.style.display = "flex";
    }
})

/*
    COPYRIGHT BY YUKI ARIMO
    KAWAI FRAMEWORK
*/