const {
  app,
  BrowserWindow,
  Menu,
} = require('electron');
const path = require('path');



let currentPath = app.getAppPath();

if (currentPath.includes('/yuna-ai')) {
  currentPath = currentPath.substring(0, currentPath.indexOf('/yuna-ai') + '/yuna-ai'.length);
} else {
  if (currentPath[currentPath.length - 1] !== '/') {
    currentPath += '/';
  }
  currentPath += 'yuna-ai';
}

console.log(currentPath);

let mainWindow; // Keep a global reference to avoid garbage collection

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: `${currentPath}/preload.js`,
      webSecurity: false,
    },
    transparent: true,
    resizable: true,
    titleBarStyle: 'hidden',
    title: 'Yuna AI',
    icon: `${currentPath}/img/yuna-ai.png`,
    openDevTools: false,
    vibrancy: 'appearance-based',
    darkTheme: true,
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.loadURL('http://localhost:4848/yuna');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

app.on('ready', () => {
  createWindow();

  const menuTemplate = [{
      label: 'Yuna',
      submenu: [{
          label: 'About',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.executeJavaScript('OpenTab("3")');
          }
        },
        {
          label: 'Home',
          click: () => {
            mainWindow.webContents.executeJavaScript('OpenTab("1")');
          }
        },
        {
          label: 'Library',
          click: () => {
            mainWindow.webContents.executeJavaScript('OpenTab("2")');
          }
        },
        {
          label: 'Prompts',
          click: () => {
            mainWindow.webContents.executeJavaScript('OpenTab("1")');
          }
        },
        {
          label: 'Settings',
          click: () => {
            mainWindow.webContents.executeJavaScript('OpenTab("3")');
          }
        },
        {
          label: 'Quit',
          click: () => {
            app.quit();
          }
        }
      ],
    },
    {
      label: 'Controls',
      submenu: [{
          label: 'Toggle Side',
          click: () => {
            mainWindow.webContents.executeJavaScript('toggleSidebar()');
          }
        },
        {
          label: 'Call Yuna',
          click: () => {
            mainWindow.webContents.executeJavaScript('OpenPopup("call")');
          }
        },
        {
          label: 'Open Settings',
          click: () => {
            mainWindow.webContents.executeJavaScript('OpenTab("3")');
          }
        }
      ],
    },
    {
      label: 'Home',
      submenu: [{
          label: 'Open Home',
          click: () => {
            mainWindow.webContents.executeJavaScript('OpenTab("1")');
          }
        },
        {
          label: 'Send Message',
          click: () => {
            mainWindow.webContents.executeJavaScript('sendMessage("")');
          }
        },
        {
          label: 'Call Yuna',
          click: () => {
            mainWindow.webContents.executeJavaScript('OpenPopup("call")');
          }
        },
        {
          label: 'Toggle Sidebar',
          click: () => {
            mainWindow.webContents.executeJavaScript('toggleSidebar()');
          }
        }
      ],
    },
    {
      label: 'Library',
      submenu: [{
          label: 'Open Library',
          click: () => {
            mainWindow.webContents.executeJavaScript('OpenTab("2")');
          }
        },
        {
          label: 'Chats',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              OpenTab("2");
              document.getElementsByClassName('tab')[0].click()`);
          }
        },
        {
          label: 'Collections',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              OpenTab("2");
              document.getElementsByClassName('tab')[1].click()`);
          }
        },
        {
          label: 'Toggle Sidebar',
          click: () => {
            mainWindow.webContents.executeJavaScript('toggleSidebar()');
          }
        }
      ],
    },
    {
      label: 'Prompts',
      submenu: [{
          label: 'Open Prompts',
          click: () => {
            mainWindow.webContents.executeJavaScript('OpenTab("1")');
          }
        },
        {
          label: 'Default',
          click: () => {
            mainWindow.webContents.executeJavaScript('');
          }
        },
        {
          label: 'Writer',
          click: () => {
            mainWindow.webContents.executeJavaScript('');
          }
        },
        {
          label: 'Paraphrase',
          click: () => {
            mainWindow.webContents.executeJavaScript('');
          }
        },
      ],
    },
    {
      label: 'Settings',
      submenu: [{
          label: 'Open Settings',
          click: () => {
            mainWindow.webContents.executeJavaScript('OpenTab("3")');
          }
        },
        {
          label: 'Account',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              OpenTab("3");
              document.getElementsByClassName('tab')[2].click()`);
          }
        },
        {
          label: 'Params',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              OpenTab("3");
              document.getElementsByClassName('tab')[3].click()`);
          }
        },
        {
          label: 'API',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              OpenTab("3");
              document.getElementsByClassName('tab')[4].click()`);
          }
        },
        {
          label: 'Yuna+',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              OpenTab("3");
              document.getElementsByClassName('tab')[5].click()`);
          }
        },
        {
          label: 'Dark Mode',
          click: () => {
            mainWindow.webContents.executeJavaScript('toggleTheme()');
          }
        },
        {
          label: 'Toggle Sidebar',
          click: () => {
            mainWindow.webContents.executeJavaScript('toggleSidebar()');
          }
        },
        {
          label: 'Toggle DevTools',
          click: () => {
            mainWindow.webContents.openDevTools();
          }
        },
        {
          label: 'Reload',
          click: () => {
            mainWindow.webContents.executeJavaScript('location.reload();');
          }
        },
        {
          label: 'Reset',
          click: () => {
            mainWindow.webContents.executeJavaScript('localStorage.clear(); location.reload();');
          }
        },
        {
          label: 'Quit',
          click: () => {
            app.quit();
          }
        }
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});