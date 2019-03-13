const { app, BrowserWindow, ipcMain } = require('electron')
require('electron-reload')( __dirname )
const { exec } = require('child_process')
const fs = require('fs').promises
const homedir = require('os').homedir()
const { name } = require( `${__dirname}/package.json` )


// Helpers
const block = regex => new Promise( ( resolve, reject ) => {
  exec( `pkill -STOP -u $(whoami) ${ regex }`, ( error, stdout, stderr ) => {
      // No process found results in error
      // if( error || stderr ) return reject( error, stderr )
      if( stdout ) return resolve( stdout )
    } )
} )

const unBlock = regex => new Promise( ( resolve, reject ) => {
  exec( `pkill -CONT -u $(whoami) ${ regex }`, ( error, stdout, stderr ) => {
      // No process found results in error
      // if( error || stderr ) return reject( error, stderr )
      if( stdout ) return resolve( stdout )
    } )
} )

const currentWindow = f => new Promise( ( resolve, reject ) => {
  exec( `osascript -e 'tell application "System Events"' \
          -e 'set frontApp to name of first application process whose frontmost is true' \
          -e 'end tell'`, ( error, stdout, stderr ) => {
        if( error || stderr ) return reject( error, stderr )
        if( stdout ) return resolve( stdout.trim() )
      } )
} )

class Window {

  constructor() {

    this.debug = process.env.debug

  }

  init() {

    // Create the window
    this.window = new BrowserWindow( { width: 800, height: 600 } )
    this.window.loadFile( `${ __dirname }/src/index.html` )

    // Listeners
    this.window.on( 'closed', f => this.window = null )

    // If devving open inspector
    if( process.env.debug ) this.window.webContents.openDevTools( )

  }

  reload() {
    if( this.window == null ) this.init()
  }

}

const view = new Window()

// Application configs
app.on( 'ready', f => view.init() )
app.on( 'window-all-closed', f => {
  globalBlocklist.map( item => unBlock( item ) )
  app.quit()
} )
app.on( 'activate', f => view.reload() )

// Backend functionality
let globalBlocklist = []
let blocking = false



// Event listeners
ipcMain.on( 'restore', ( event, boolean ) => {
  // Data inits
  fs.readFile( `${ homedir }/Library/Application Support/${ name.toLowerCase() }/blocklist`, 'utf8' )
  .then( blocklist => {

    event.sender.send( 'blocklist', blocklist.replace( ',', '\n' ) )
    globalBlocklist = blocklist.split( ',' )
    
  } )
  .catch( err => console.log( 'Config file not loaded, ', err ) )
} )
ipcMain.on( 'block', ( event, blocklist ) => {

  globalBlocklist = blocklist
  blocking = true
  fs.writeFile( `${ homedir }/Library/Application Support/${ name.toLowerCase() }/blocklist`, globalBlocklist, 'utf8' )
  .then( f => console.log( 'Saved configs' ) )

} )
ipcMain.on( 'stop', ( event, boolean ) => {

  blocking = false
  globalBlocklist.map( item => unBlock( item ) )

} )


setInterval( f => {

  // Unblock current window every second
  currentWindow()
  .then( current => {
    if( process.env.debug ) console.log( 'Blocking', blocking, current, globalBlocklist )
    // Block everything, except when the blocklist item is the currently open window
    if( blocking && globalBlocklist ) globalBlocklist.map( item => current.match( item ) ? unBlock( item ) : block( item ) )
  } )

}, 500 )