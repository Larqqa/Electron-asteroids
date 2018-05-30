const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');

const {app, BrowserWindow, Menu, ipcMain} = electron;

//set ENV
//process.env.NODE_ENV = 'production';

let mainWindow;

function mainApplication(){
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file',
    slashes: true
  }));
}

// App ready
app.on('ready', function(){
  mainWindow = new BrowserWindow({fullscreen: true});

  mainApplication();

  // Quit when close
  mainWindow.on('closed', function(){
    app.quit();
  });

  // Build menu
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert Menu
  Menu.setApplicationMenu(mainMenu);
});

//If file on read gives error, the file is not created
fs.readFile('leaderboards.txt', 'utf8',function(e, item){
  if(e) {
    //Create the file, if file is not created
    fs.appendFile('leaderboards.txt', '', function(err){
      if(err) throw err;
      console.log('file made!');
    });
  }
});

//Save sent score from credits to file
ipcMain.on('score:add', function(e, item){
  //Save to file, create file if not already made
  fs.appendFile('leaderboards.txt', item, function(err){
    if(err) throw err;
    console.log('score saved!');
  });
  //After score is saved, go to leaderboards
  mainWindow.loadURL(path.join(__dirname, 'leaderboards.html'));
});

//On request for file data
ipcMain.on('getLeaderBoard:add', function(e){
  let scores;
  let sendScore = [];
  let score;

  //Read file
  fs.readFile('leaderboards.txt', 'utf8', function(err, lbData) {
    //Splice from new line
    scores = lbData.split('\n');
    //Separate values
    score = scores.map(x => x.split(', '));
    //Remove empty spot from last index
    score.splice(score.length-1, 1);
    //Sort by score
    //Convert score from string to integer
    for (let i = 0; i < score.length; i++) {
      score[i][1] = parseInt(score[i][1]);
    }

    //Sort by scores
    score.sort(sortFunction);
    function sortFunction(a, b) {

        //If self, do nothing
        if (a[1] === b[1]) {
            return 0;
        }
        else {
            //Else return sorted position
            return (a[1] > b[1]) ? -1 : 1;
        }
    }

    //Remove indexes over 100
    score.splice(10);

    //Format leaderboard score to index - name : score
    for (let i = 0; i < score.length; i++) {
      sendScore.push(i + 1 + ' - ' + score[i][0] + ' : ' + score[i][1]);
    }

    //If no scores yet
    if (sendScore == 0) {
      sendScore.push('Ei tuloksia vielä!');
    }

    //Send file data to leaderboards
    mainWindow.webContents.send('file:add', sendScore);
  });
});

// Make menu
const mainMenuTemplate = [
  {
    label:'Valikko',
    submenu:[
      {
        label: 'Peli valikko',
        accelerator: process.platform == 'darwin' ? 'Command+B' : 'Ctrl+B',
        click(){
          mainApplication();
        }
      },
      {
        label: 'Tulostaulukko',
        accelerator: process.platform == 'darwin' ? 'Command+L' : 'Ctrl+L',
        click(){
          //Go to leaderboards
          mainWindow.loadURL(path.join(__dirname, 'leaderboards.html'));
        }
      },
      {
        label: 'Lopeta',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit();
        }
      }
    ]
  }
];

// If mac add empty menu item
if(process.platform == 'darwin') {
  mainMenuTemplate.unshift({});
  leaderboardsMenuTemplate.unshift({});
}

//Add devtools if not in production
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Dev tools',
    submenu: [
      {
        label: 'Toggle dev tools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  });
}
