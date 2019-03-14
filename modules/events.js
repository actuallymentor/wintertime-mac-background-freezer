const Emitter = require('events')
const { getWindow } = require( './process-management' )

class WindowListener {

	constructor( speed = 500 ) {

		this.window = 'none'
		this.emitter = new Emitter()

		setInterval( f => this.checkWindow(), speed )

	}

	checkWindow() {
		return getWindow()
		.then( currentApp => currentApp != this.window && this.updateWindow( currentApp ) )
	}

	updateWindow( current ) {
		this.window = current
		return this.emitter.emit( 'change', current )
	}

}

module.exports = WindowListener