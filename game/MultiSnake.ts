import { Vector } from "./Vector";

import { Renderer } from "./Renderer"

import { Bullet } from "./Bullet";
import { Explosion } from "./Explosion";
import { DIRECTION } from "./iShip"
import { PlayerShip } from "./PlayerShip";
import { EnemyShip } from "./EnemyShip";
import { WebSocket } from "./WebSocket";

declare function playLaser(): void

declare function playEnemyLaser(): void

declare function playExplosion(): void

declare function log(message: string): void

declare function promptUsername(message: string): string

declare function promptRoom(message: string): string

declare function setTimeoutCall(pointer: i32, ms: i32): void

function setTimeout(callback: () => void, ms: i32): void {

	setTimeoutCall(load<i32>(changetype<usize>(callback)), ms)

}

let username: string = 'unknown'

let room: string = 'public'

export class MultiSnake {

	// singleton
	public static SN: MultiSnake;  // AsteroidShooter singleton

	// game objects
	public explosionArray: Array<Explosion> = new Array<Explosion>();
	public bulletArray: Array<Bullet> = new Array<Bullet>();
	public enemyBulletArray: Array<Bullet> = new Array<Bullet>()
	public playerShip: PlayerShip = new PlayerShip();
	public enemyShip: EnemyShip = new EnemyShip();

	// array indexes
	public explosionIndex: i32 = 0;
	public bulletIndex: i32 = 0;
	public enemyBulletIndex: i32 = 0;

	// shot cooldown variables
	static readonly LAUNCH_WAIT: i32 = 250;
	public bulletCoolDown: i32 = 50;

	public enemyBulletCoolDown: i32 = 50;

	// WebSocket

	public socket: WebSocket = new WebSocket('ws://localhost:3000')

	constructor() {

		// set the singleton
		if (MultiSnake.SN == null) {
			MultiSnake.SN = this;
		}

		// creating a renderer will set the singleton for the Renderer class
		// this constant will exit scope at the end of the constructor, so
		// I will access the Renderer using Renderer.SN
		new Renderer();


		// create the objects for the explosion object pool
		for (var i: i32 = 0; i < 30; i++) {
			this.explosionArray.push(new Explosion());
		}

		// create the objects for the bullet object pool
		for (i = 0; i < 30; i++) {
			this.bulletArray.push(new Bullet());
		}

		// create the objects for the enemy bullet object pool
		for (i = 0; i < 30; i++) {
			this.enemyBulletArray.push(new Bullet());
		}


		setTimeout(() => {

			username = promptUsername('Enter A Username')

			room = promptRoom('Enter A Room')

			MultiSnake.SN.socket.registerUsername(username)

			MultiSnake.SN.socket.on('message', data => {

				const context = data.split(':')
				// We have to use : to separate because AS-WS only supports strings

				const fromUser = context[1]

				log('From: ' + fromUser + 'Me: ' + username)

				if (!fromUser.startsWith(username)) {
		
					const content = context[2]

					log('Content: ' + content)

					if (!content) return

					let direction = content.split('.')[1]

					log('Moving Enemy: ' + direction)

					if (direction.startsWith('shoot')) {
						
						// Shoot Handler
						log('SHOOOOOOOOTTTTTTTTTTTTTTTTT!')

						MultiSnake.SN.launchEnemyBullet();
						
						playEnemyLaser();
						// Different sound

					}
					
					if (direction !== 'shoot') {
						
						// Move!

						MultiSnake.SN.enemyShip.changeDirection(i32(parseInt(direction)))

					}

				}
		
			})
			
		}, 500)

	}

	// each frame check to see if any asteroids remain
	public respawnCheck(): void {
	}

	// when an asteroid is destroyed, activate an explosion from the explosionArray
	public activateExplosion(x: f32, y: f32): void {
		let count: i32 = 0;
		// advance the explosion index to get the next explosion in the pool
		this.explosionIndex++;

		// if the index is greater than the number of objects in the pool, reset it to 0
		if (this.explosionIndex >= this.explosionArray.length) {
			this.explosionIndex = 0;
		}

		while (this.explosionArray[this.explosionIndex].visible == true) {
			this.explosionIndex++;
			if (this.explosionIndex >= this.explosionArray.length) {
				this.explosionIndex = 0;
			}
			if (count++ > this.explosionArray.length) return;
		}
		this.explosionArray[this.explosionIndex].activate(x, y);
	}

	public launchBullet(): void {
		let count: i32 = 0;
		this.bulletIndex++;
		if (this.bulletIndex >= this.bulletArray.length) {
			this.bulletIndex = 0;
		}
		while (this.bulletArray[this.bulletIndex].visible == true) {
			this.bulletIndex++;
			if (this.bulletIndex >= this.bulletArray.length) {
				this.bulletIndex = 0;
			}
			if (count++ > this.bulletArray.length) return;
		}
		this.bulletArray[this.bulletIndex].launch(MultiSnake.SN.playerShip.direction,
			MultiSnake.SN.playerShip.position);
	}

	public launchEnemyBullet(): void {
		let enemyCount: i32 = 0;
		this.enemyBulletIndex++;
		if (this.enemyBulletIndex >= this.enemyBulletArray.length) {
			this.enemyBulletIndex = 0;
		}
		while (this.enemyBulletArray[this.bulletIndex].visible == true) {
			this.enemyBulletIndex++;
			if (this.enemyBulletIndex >= this.enemyBulletArray.length) {
				this.enemyBulletIndex = 0;
			}
			if (enemyCount++ > this.enemyBulletArray.length) return;
		}
		this.enemyBulletArray[this.bulletIndex].launch(MultiSnake.SN.enemyShip.direction,
			MultiSnake.SN.enemyShip.position);
	}
}

new MultiSnake();

class EnemyMovementTracker {
	public leftKeyPress: boolean = false
	public rightKeyPress: boolean = false
	public upKeyPress: boolean = false
	public downKeyPress: boolean = false
	public spaceKeyPress: boolean = false
	constructor() {}
}

const enemyMovement = new EnemyMovementTracker()

export function LoopCallback(delta_ms: i32,
	leftKeyPress: bool, rightKeyPress: bool,
	upKeyPress: bool, downKeyPress: bool,
	spaceKeyPress: bool): void {
	MultiSnake.SN.bulletCoolDown -= delta_ms;

	Renderer.SN.clear();
	Renderer.DELTA = <f32>delta_ms / 1000.0;
	//RunAI();

	if (leftKeyPress) {
		MultiSnake.SN.playerShip.changeDirection(DIRECTION.LEFT)
	}
	else if (rightKeyPress) {
		MultiSnake.SN.playerShip.changeDirection(DIRECTION.RIGHT)
	}
	else if (upKeyPress) {
		MultiSnake.SN.playerShip.changeDirection(DIRECTION.UP)
	}
	else if (downKeyPress) {
		MultiSnake.SN.playerShip.changeDirection(DIRECTION.DOWN)
	}

	//socket.sendMessage('position.PLAYER-ID.' + leftKeyPress.toString() + '.' + rightKeyPress.toString() + '.' + upKeyPress.toString() + '.' + downKeyPress.toString())

	if (spaceKeyPress && MultiSnake.SN.bulletCoolDown <= 0) {
		MultiSnake.SN.bulletCoolDown = MultiSnake.LAUNCH_WAIT;
		MultiSnake.SN.launchBullet();

		playLaser();

		//socket.sendMessage('shoot.PLAYER-ID.')

	}


	// Player -> Enemy Hit
	for (var i: i32 = 0; i < MultiSnake.SN.bulletArray.length; i++) {
		if (MultiSnake.SN.bulletArray[i].visible == true) {
			MultiSnake.SN.bulletArray[i].move();
			MultiSnake.SN.bulletArray[i].draw();

			const Shiphit = MultiSnake.SN.bulletArray[i].hitTest(MultiSnake.SN.enemyShip)

			if (Shiphit) {
				playExplosion();
				MultiSnake.SN.enemyShip.explode();
			}
			// check if bullet hits other player (I)
			//playExplosion();

		}

	}

	// Enemy -> Player Hit
	for (var ii: i32 = 0; ii < MultiSnake.SN.enemyBulletArray.length; ii++) {
		if (MultiSnake.SN.enemyBulletArray[ii].visible == true) {
			MultiSnake.SN.enemyBulletArray[ii].move();
			MultiSnake.SN.enemyBulletArray[ii].draw();

			const Shiphit = MultiSnake.SN.enemyBulletArray[ii].hitTest(MultiSnake.SN.playerShip)

			if (Shiphit) {
				playExplosion();
				MultiSnake.SN.playerShip.explode();
			}
			// check if bullet hits other player (I)
			//playExplosion();

		}

	}
	
	for (i = 0; i < MultiSnake.SN.explosionArray.length; i++) {
		MultiSnake.SN.explosionArray[i].move();
		MultiSnake.SN.explosionArray[i].draw();
	}
	MultiSnake.SN.playerShip.move();
	MultiSnake.SN.playerShip.draw();

	MultiSnake.SN.enemyShip.move();
	MultiSnake.SN.enemyShip.draw();

	MultiSnake.SN.respawnCheck();

}