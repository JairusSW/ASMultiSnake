import { Vector } from './Vector';
import { Renderer } from './Renderer';
import {
	iShip, DIRECTION,
	VEL_SQ, VELOCITY,
	MAX_TRAIL_LEN, TRAIL_DIST
} from './iShip';

import { MultiSnake } from './MultiSnake';

const ZERO_VEC: Vector = new Vector(0.0, 0.0);

export class GenericShip implements iShip {
	// readonly static properties of GenericShip

	// movement, position, scale and rotation
	public direction: DIRECTION = DIRECTION.DOWN;
	public visible: boolean = true;
	private _rotation: f32 = 0.0;
	private _position: Vector = new Vector(0.0, 0.0);
	public trail: StaticArray<f32> = new StaticArray<f32>(MAX_TRAIL_LEN * 2);
	public lastTrailDist: f32 = 0.0;
	private _scaledRadius: f32 = 0.05;
	private _scaledRadiusSQ: f32 = 0.0025;

    // colors

    public trailColor: i32 = 0xff_00_00_ff

    public shipColor: i32 = 0xff_00_00_ff

    public cockpitColor: i32 = 0x00_ff_ff_ff

    public gunColor: i32 = 0xff_00_00_ff

	// scale
	public scale: f32 = 0.05;
	// public rotation: f32 = 0.0; //3.14159;

	// position loop data
	public shipBody: StaticArray<f32> = [-0.1, -0.7,
		0.1, -0.7,
		0.5, 0.1,
		0.5, 0.5,
		0, 0.4,
	-0.5, 0.5,
	-0.5, 0.1,];
	public shipCockpit: StaticArray<f32> = [0, -0.6,
		-0.2, 0,
		0, -0.1,
		0.2, 0,];
	public leftGun: StaticArray<f32> = [-0.4, -0.1,
	-0.4, -0.5,
	-0.3, -0.5,
	-0.3, -0.3,];
	public rightGun: StaticArray<f32> = [0.3, -0.3,
		0.3, -0.5,
		0.4, -0.5,
		0.4, -0.1,];

	constructor() {
		for (let i: i32 = 0; i < MAX_TRAIL_LEN * 2; i += 2) {
			this.trail[i] = this.position.x;
			this.trail[i + 1] = this.position.y;
		}
	}

	get position(): Vector {
		return this._position;
	}
	set position(p: Vector) {
		this._position = p;
	}

	get scaledRadius(): f32 {
		return this._scaledRadius;
	}

	set scaledRadius(sr: f32) {
		this._scaledRadius = sr;
	}

	public shiftTrail(): void {
		for (let i: i32 = this.trail.length - 4; i >= 0; i -= 2) {
			this.trail[i + 2] = this.trail[i];
			this.trail[i + 3] = this.trail[i + 1];
		}
	}
	public hitTestPoint(x: f32, y: f32): boolean {
		// _scaledRadiusSQ
		let x_dist: f32 = x - this.position.x;
		let y_dist: f32 = y - this.position.y;
		let dist_sq: f32 = x_dist * x_dist + y_dist * y_dist;
		return (this._scaledRadiusSQ > dist_sq);
	}

	public explode(): void {
		this.visible = false;
		// Just turn invisible
		MultiSnake.SN.activateExplosion(this.position.x, this.position.y);
	}

	public move(): void {
		if (this.direction == DIRECTION.UP) {
			this.position.y += VELOCITY;
			this.trail[1] = this.position.y;
			this._rotation = 3.14159;
		}
		else if (this.direction == DIRECTION.DOWN) {
			this.position.y -= VELOCITY;
			this.trail[1] = this.position.y;
			this._rotation = 0.0;
		}
		else if (this.direction == DIRECTION.LEFT) {
			this.position.x -= VELOCITY;
			this.trail[0] = this.position.x;
			this._rotation = 1.570795;
		}
		else {
			this.position.x += VELOCITY;
			this.trail[0] = this.position.x;
			this._rotation = 4.712385;
		}

		this.lastTrailDist += VELOCITY;
		if (this.lastTrailDist >= TRAIL_DIST) {
			this.shiftTrail();
			this.lastTrailDist = 0.0;
		}

		if (this.position.x > 1.0) {
			this.position.x = 1.0;
		}
		else if (this.position.x < -1.0) {
			this.position.x = -1.0;
		}

		if (this.position.y > 1.0) {
			this.position.y = 1.0;
		}
		else if (this.position.y < -1.0) {
			this.position.y = -1.0;
		}

	}

	public draw(): void {
		if (this.visible == true) {
			Renderer.SN.renderLineLoop(this.shipBody, this.position, this._rotation, this.scale, this.shipColor);
			Renderer.SN.renderLineLoop(this.shipCockpit, this.position, this._rotation, this.scale, this.cockpitColor);
			Renderer.SN.renderLineLoop(this.leftGun, this.position, this._rotation, this.scale, this.gunColor);
			Renderer.SN.renderLineLoop(this.rightGun, this.position, this._rotation, this.scale, this.gunColor);

			// RENDER THE TRAIL
			Renderer.SN.renderLineLoop(this.trail, ZERO_VEC, 0.0, 1.0, this.trailColor, false);
		}
	}

	public changeDirection(dir: DIRECTION): void {
		this.direction = dir;
		this.shiftTrail();
	}
}