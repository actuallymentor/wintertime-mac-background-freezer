const { name } = require( `${__dirname}/../package.json` )
const { ipcRenderer } = require( 'electron' )

const q = query => document.querySelector( query )

// ///////////////////////////////
// Initialisation
// ///////////////////////////////
document.addEventListener( 'DOMContentLoaded',  f => {

	// Inits
	document.title = name
	q('#title' ).innerHTML = name

	// Listeners
	const helpfield = q( '#help' )
	q( '#askhelp').addEventListener( 'click' , f => {
		helpfield.style.display == 'none' ? helpfield.style.display = 'block' : helpfield.style.display = 'none'
	} )

	// On restore response, parse data
	ipcRenderer.on( 'blocklist', ( event, blocklist ) => {
		q( '#blocklist' ).value = blocklist
	} )
	// make restore request
	ipcRenderer.send( 'restore', true )

	// Resize test window
	q( '#blocklist' ).addEventListener( 'keyup', ( { target } ) => target.style.height = `${ target.scrollHeight }px` )


	// On form submit
	q( '#form' ).addEventListener( 'submit', event => {

		event.preventDefault()
		const { value } = event.target.blocklist
		
		ipcRenderer.send( 'block', value.split( '\n' ) )

	} )

	// On cancel
	q( '#stop' ).addEventListener( 'click', f => ipcRenderer.send( 'stop', true ) )

} )