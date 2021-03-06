import { Vector } from './Vector';
import { Renderer } from './Renderer';

export class Explosion {
	static readonly FRAME_TIME: f32 = 0.04;
	public frameTimeRemaining: f32 = 0.04;

	// these four loops will be used in the animation
	public exp1Loop: StaticArray<f32> = [0, 0.2,
		-0.1, 0,
		0, -0.2,
		0.1, 0,];
	public exp2Loop: StaticArray<f32> = [0, 0.3,
		-0.1, 0.1,
		-0.3, 0,
		-0.1, -0.1,
		0, -0.3,
		0.1, -0.1,
		0.3, 0,
		0.1, 0.1,];
	public exp3Loop: StaticArray<f32> = [0.3, 0.3,
		0, 0.2,
		-0.3, 0.3,
		-0.2, 0,
		-0.3, -0.3,
		0, -0.2,
		0.3, -0.3,
		0.2, 0,];
	public exp4Loop: StaticArray<f32> = [0.6, 0.6,
		0.1, 0.3,
		0, 0.8,
		-0.1, 0.3,
		-0.6, 0.6,
		-0.3, 0.1,
		-0.8, 0,
		-0.3, -0.1,
		-0.6, -0.6,
		-0.1, -0.3,
		0, -0.8,
		0.1, -0.3,
		0.6, -0.6,
		0.3, -0.1,
		0.8, 0,
		0.3, 0.1,];

	public position: Vector = new Vector(0.0, 0.0);
	public visible: bool = false;
	public currentFrame: i32 = 0;
	public rotation: f32 = 0.0;
	public scale: f32 = 0.2;

	public move(): void {
		if (this.visible == true) {
			this.frameTimeRemaining -= Renderer.DELTA;
			if (this.frameTimeRemaining < 0) {
				this.frameTimeRemaining = Explosion.FRAME_TIME
				this.currentFrame++;
				if (this.currentFrame >= 4) {
					this.visible = false;
				}
			}
			this.rotation += 0.2;
			this.scale += 0.02;
		}
	}

	public draw(): void {
		if (this.visible == true) {
			if (this.currentFrame == 0) {
				Renderer.SN.renderLineLoop(this.exp1Loop, this.position, this.scale, 0xff_00_00_ff);
			}
			else if (this.currentFrame == 1) {
				Renderer.SN.renderLineLoop(this.exp2Loop, this.position, this.scale, 0xff_00_00_ff);
			}
			else if (this.currentFrame == 2) {
				Renderer.SN.renderLineLoop(this.exp1Loop, this.position, this.scale, 0xff_ff_00_ff);
				Renderer.SN.renderLineLoop(this.exp3Loop, this.position, this.scale, 0xff_00_00_ff);
			}
			else if (this.currentFrame == 3) {
				Renderer.SN.renderLineLoop(this.exp2Loop, this.position, this.scale, 0xff_ff_00_ff);
				Renderer.SN.renderLineLoop(this.exp4Loop, this.position, this.scale, 0xff_00_00_ff);
			}
		}
	}

	public activate(x: f32, y: f32): void {
		this.position.x = x;
		this.position.y = y;
		this.scale = 0.2;
		this.visible = true;
		this.currentFrame = 0;
		this.frameTimeRemaining = Explosion.FRAME_TIME;
	}
}
