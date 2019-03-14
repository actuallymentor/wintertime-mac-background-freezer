const fs = require('fs').promises
const homedir = require('os').homedir()
const { name } = require( `${__dirname}/../package.json` )
const { block, unBlock, panicUnblockAll } = require( './process-management' )
const { app, BrowserWindow, ipcMain } = require('electron')

// WIndow management
const WindowListener = require( './events' )

class App {

  constructor() {

    // Backend functionality
    this.globalBlocklist = []
    this.defaultBlocklist = 'Google Chrome.*\nAdobe.*\nSafari.*\nMicrosoft.*\nMail\nFranz.*\nAffinity.*\nSublime Text.*\nBackup and sync.*'
    this.blocking = false
    this.debug = process.env.debug
    this.app = app
    this.currentWindow = new WindowListener( 500 )
    this.windowSize = { width: 400, height: 700 }

    // Initialisations
    this.configElectron()
    this.configIpc()
    this.configWindowcheck()

    
  }

  toggleBlocking( ) {
    this.blocking = !this.blocking
  }

  configElectron() {
    // Application configs
    this.app.on( 'ready', f => this.render() )
    this.app.on( 'window-all-closed', f => {
      this.globalBlocklist.map( item => unBlock( item ) )
      this.app.quit()
    } )
    this.app.on( 'activate', f => this.reload() )
  }

  configIpc() {
    // Event listeners
    ipcMain.on( 'restore-config', ( event, boolean ) => {

      if( this.debug ) console.log( 'Config restoration request received' )

      // Data inits
      return fs.readFile( `${ homedir }/Library/Application Support/${ name.toLowerCase() }/blocklist`, 'utf8' )
      .then( blocklist => {

        event.sender.send( 'restored-config-data', blocklist )
        this.globalBlocklist = blocklist.split( ',' )
        
      } )
      .catch( err => {

        // If the config file doesn't exist, return some defaults
        if( err.code == 'ENOENT' ) return event.sender.send( 'restored-config-data', this.defaultBlocklist )

        // if not, console
        if( this.debug ) console.log( 'File loading error ', err )

      } )
    } )

    // Start blocking
    ipcMain.on( 'block', ( event, blocklist ) => {

      if( this.debug ) console.log( 'Blocking start request received' )

      // Save text field to blocklist
      this.globalBlocklist = blocklist

      // Toggle on/off
      this.toggleBlocking()

      // If off restore all
      if( !this.blocking ) this.globalBlocklist.map( item => unBlock( item ) )
      // If blocking, manually trigger window check 
      if( this.blocking ) this.currentWindow.checkWindow().then( currentApp => this.doBlocking( currentApp ) )

      // Save new data to config
      fs.writeFile( `${ homedir }/Library/Application Support/${ name.toLowerCase() }/blocklist`, this.globalBlocklist, 'utf8' )
      .then( f => console.log( 'Saved configs' ) )

    } )

    // Panic button ( CONT ev erything )
    ipcMain.on( 'panic', ( event, boolean ) => panicUnblockAll() )

  }

  configWindowcheck() {

    this.currentWindow.emitter.on( 'change', current => {
      if( this.debug ) console.log( 'Window changed to ', current )
      this.doBlocking( current )
    } )

  }

  doBlocking( current ) {
    if( this.debug ) console.log( 'Not blocking ', current )
    if( this.blocking && this.globalBlocklist ) this.globalBlocklist.map( item => current.match( item ) ? unBlock( item ) : block( item ) )
  }

  render() {

    // Create the window
    this.window = new BrowserWindow( this.windowSize )
    this.window.loadFile( `${ __dirname }/../src/index.html` )

    // Listeners
    this.window.on( 'closed', f => this.window = null )

    // If devving open inspector
    if( process.env.debug ) this.window.webContents.openDevTools( )

  }

  reload() {
    if( this.window == null ) this.init()
  }

}

module.exports = new App()