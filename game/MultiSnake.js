
import { initASWebGLue, ASWebGLReady } from './ASWebGLue.js';

import * as loader from './loader.esm.js'

console.log(loader)

let room

let username

let sock

// The last_time variable is used to track the time between frame renders.
var last_time = 0;

// The exports object contains the functions exported from the WASM module
var exports = {};

// Are any of the arrow keys or the space bars pressed.
var leftKeyPress = false;
var rightKeyPress = false;
var upKeyPress = false;
var downKeyPress = false;
var spaceKeyPress = false;

// The Audio objects
var song = new Audio('/audio/song-hq.mp3')
var laser = new Audio('/audio/laserSmall_000.ogg')
var enemyLaser = new Audio('/audio/laserSmall_003.ogg')
var explosion = new Audio('/audio/explosion-hq.mp3')

// Happy music! 😀
song.play()

song.loop = true

let enemyKeys = {
    leftKeyPress: false,
    rightKeyPress: false,
    upKeyPress: false,
    downKeyPress: false,
    spaceKeyPress: false
}

// When a keydown event is pressed, set the bool for that key to true
document.addEventListener('keydown', (event) => {
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
        if (leftKeyPress === false) leftKeyPress = true
        if (enemyKeys['leftKeyPress'] === false) enemyKeys['leftKeyPress'] = true
    }
    if (event.code === 'ArrowUp' || event.code === 'KeyW') {
        if (upKeyPress === false) upKeyPress = true
        if (enemyKeys['upKeyPress'] === false) enemyKeys['upKeyPress'] = true
    }
    if (event.code === 'ArrowRight' || event.code === 'KeyD') {
        if (rightKeyPress === false) rightKeyPress = true
        if (enemyKeys['rightKeyPress'] === false) enemyKeys['rightKeyPress'] = true
    }
    if (event.code === 'ArrowDown' || event.code === 'KeyS') {
        if (downKeyPress === false) downKeyPress = true
        if (enemyKeys['downKeyPress'] === false) enemyKeys['downKeyPress'] = true
    }
    if (event.code === 'Space') {
        if (spaceKeyPress === false) spaceKeyPress = true
        if (enemyKeys['spaceKeyPress'] === false) enemyKeys['spaceKeyPress'] = true
    }

});

// When a keyup event is pressed, set the bool for that key to false
document.addEventListener('keyup', (event) => {
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
        if (leftKeyPress === true) leftKeyPress = false
        if (enemyKeys['leftKeyPress'] === true) enemyKeys['leftKeyPress'] = false
    }
    if (event.code === 'ArrowUp' || event.code === 'KeyW') {
        if (upKeyPress === true) upKeyPress = false
        if (enemyKeys['upKeyPress'] === true) enemyKeys['upKeyPress'] = false
    }
    if (event.code === 'ArrowRight' || event.code === 'KeyD') {
        if (rightKeyPress === true) rightKeyPress = false
        if (enemyKeys['rightKeyPress'] === true) enemyKeys['rightKeyPress'] = false
    }
    if (event.code === 'ArrowDown' || event.code === 'KeyS') {
        if (downKeyPress === true) downKeyPress = false
        if (enemyKeys['downKeyPress'] === true) enemyKeys['downKeyPress'] = false
    }
    if (event.code === 'Space') {
        if (spaceKeyPress === true) spaceKeyPress = false
        if (enemyKeys['spaceKeyPress'] === true) enemyKeys['spaceKeyPress'] = false
    }
});

// Each frame render runs this function
function renderFrame() {
	let delta = 0;
	if (last_time !== 0) {
		delta = (new Date().getTime() - last_time);
	}
	last_time = new Date().getTime();

	// call the LoopCallback function in the WASM module
	exports.LoopCallback(delta,
		leftKeyPress, rightKeyPress,
		upKeyPress, downKeyPress,
		spaceKeyPress, enemyKeys['leftKeyPress'], enemyKeys['rightKeyPress'], enemyKeys['upKeyPress'], enemyKeys['downKeyPress'], enemyKeys['spaceKeyPress']);

    // Turn of click-shoot

    spaceKeyPress = false

	// requestAnimationFrame calls renderFrame the next time a frame is rendered
	requestAnimationFrame(renderFrame);
}

// Import AssemblyScript WebSocket!

let sockets = []

const ws = require('ws')
// Browserified, in this case.

class Binding {
    
    constructor() {
        
        this._exports = null

        this.wasmImports = {
			MultiSnake: {
				playLaser: () => {
                    laser.pause()
                    laser.play()
                },
                playEnemyLaser: () => {
                    enemyLaser.pause()
                    enemyLaser.play()
                },
                playSong: () => {
                    song.play()
                    song.loop = true
                },
                playExplosion: () => {
                    explosion.pause()
                    explosion.play()
                },
                log: (message) => {

                    setTimeout(() => {

                        console.log(this._exports.__getString(message))
                        
                        return

                    }, 50);

                },
                promptUsername: (message) => {

                    username = prompt(this._exports.__getString(message))
                    
                    return this._exports.__newString(username)

                },
                promptRoom: (message) => {

                    room = prompt(this._exports.__getString(message))
                    
                    return this._exports.__newString(room)

                },
                setTimeoutCall: (pointer, ms) => {

                    setTimeout(() => {
                        
                        this._exports.table.get(pointer)()

                    }, ms);

                }
			},
            WebSocket: {
                sendPointer: (id, event, pointer) => {
                    if (!sockets[id]) return
                    sockets[id]['pointers'][this._exports.__getString(event)] = this._exports.table.get(pointer)
                },
                initWS: (address) => {

                    let socket = {
                        pointers: {
                            message: null,
                            error: null,
                            listening: null,
                            connect: null,
                            close: null,
                            data: null
                        },
                        socket: new WebSocket('ws://localhost:3000'),
                        // Change to ws://localhost:3000 if you want local.
                        // Public: ws://as-space-snake.herokuapp.com
                        cache: [],
                        ready: false
                    }

                    sock = socket.socket

                    socket.socket.onopen = () => {

                        console.log('ready!')

                        socket.ready = true

                        for (const message of socket.cache) {

                            socket.socket.send(message)

                        }

                    }

                    socket.socket.onmessage = ({ data }) => {

                        const func = socket.pointers['message']

                        if (typeof func === 'function') func(this._exports.__newString(data.toString()))

                    }

                    sockets.push(socket)
                    
                    return sockets.length - 1
                },
                sendWS: (id, message) => {
                    if (sockets[id].ready === false) {
                        
                        sockets[id].cache.push(this._exports.__getString(message))
                        return
                        
                    }
                    sockets[id]['socket'].send(this._exports.__getString(message))
                    return
                },
                closeWS: (id, number) => {
                    sockets[id]['socket'].close(number)
                }
            }   
        }
    }

    get wasmExports() {
		return this._exports
	}
	set wasmExports(e) {
		this._exports = e
	}
}

// the startGame function calls initASWebGLue and instantiates the wasm module
export function startGame(wasm_file) {

	// load the audio when the game is started.
	const memory = new WebAssembly.Memory({ initial: 100 }); // linear memory

	const bindings = new Binding()

	var importObject = {
		...bindings.wasmImports,
		env: {
			memory: memory,
			seed: Date.now,
		}
	};

	initASWebGLue(importObject);

	(async () => {
		// use WebAssembly.instantiateStreaming in combination with
		// fetch instead of WebAssembly.instantiate and fs.readFileSync

        const wasm = await fetch(wasm_file)

		loader.instantiateStreaming(
			wasm,
			importObject).then(obj => {

            // Set Bindings (WebSocket)
            bindings.wasmExports = obj.exports

            exports = obj.instance.exports;

            console.log('Loader: ', obj.exports)

            ASWebGLReady(obj, importObject);

            requestAnimationFrame(renderFrame);

        })

	})();
}