const { exec } = require('child_process')
const activeWin = require('active-win')

// Helpers
const block = regex => new Promise( resolve => {
  exec( `pkill -STOP -u $(whoami) -f "${ regex }"`, ( error, stdout, stderr ) => {
      return resolve( stdout, error, stderr )
    } )
} )

const unBlock = regex => new Promise( resolve => {
  exec( `pkill -CONT -u $(whoami) -f "${ regex }"`, ( error, stdout, stderr ) => {
      return resolve( stdout, error, stderr )
    } )
} )

const panicUnblockAll = f => new Promise( resolve => {
  exec( `pkill -CONT -u $(whoami) -f ".*"`, ( error, stdout, stderr ) => {
      return resolve( stdout, error, stderr )
    } )
} )

const getWindow = f => activeWin().then( theWindow => theWindow.owner.name ).catch( err => {
  if( process.env.debug ) console.log( 'Failed to grab window, probably because you switched while in expose mode.\n\n', err )
} )

const say = phrase => new Promise( resolve => {
  exec( `say ${ phrase }`, ( error, stdout, stderr ) => {
      return resolve( stdout, error, stderr )
    } )
} )

module.exports = { block: block, unBlock: unBlock, getWindow: getWindow, panicUnblockAll: panicUnblockAll, say: say }