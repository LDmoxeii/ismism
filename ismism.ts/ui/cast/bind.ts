// deno-lint-ignore-file no-window-prefix
import { init, render } from "../../../../septem.ts/src/septem.ts"

const fps = document.getElementById("fps") as HTMLElement
const canvas = document.getElementById("canvas") as HTMLCanvasElement
const img = document.getElementById("img") as HTMLImageElement
const tex: TexImageSource = img

const sw = 0.568
const sh = 1.0
const data = {
	vert: new Float32Array([
		-sw, -sh, -0.01,
		sw, -sh, -0.01,
		sw, sh, -0.01,
		-sw, sh, -0.01,

		-sw, -sh, 0.01,
		sw, -sh, 0.01,
		sw, sh, 0.01,
		-sw, sh, 0.01,

		-sw, -sh, -0.01,
		sw, -sh, -0.01,
		sw, sh, -0.01,
		-sw, sh, -0.01,

		-sw, -sh, 0.01,
		sw, -sh, 0.01,
		sw, sh, 0.01,
		-sw, sh, 0.01,
	]),
	tex: new Float32Array([
		1.0, 0.0,
		0.0, 0.0,
		0.0, 1.0,
		1.0, 1.0,

		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,

		0.0, 0.0,
		0.0, 0.0,
		0.0, 0.0,
		0.0, 0.0,

		0.0, 0.0,
		0.0, 0.0,
		0.0, 0.0,
		0.0, 0.0,
	]),
	norm: new Float32Array([
		0, 0, -1,
		0, 0, -1,
		0, 0, -1,
		0, 0, -1,

		0, 0, 1,
		0, 0, 1,
		0, 0, 1,
		0, 0, 1,

		-1, 0, 0,
		1, 0, 0,
		1, 0, 0,
		-1, 0, 0,

		-1, 0, 0,
		1, 0, 0,
		1, 0, 0,
		-1, 0, 0,
	]),
	idx: new Uint8Array([
		0, 3, 1, 1, 3, 2,
		4, 5, 7, 7, 5, 6,
		...[0, 1, 4, 4, 1, 5,
			5, 1, 6, 6, 1, 2,
			2, 3, 6, 6, 3, 7,
			7, 3, 4, 4, 3, 0].map(n => n + 8)
	])
}

let pscale = 1.0

function resize(
) {
	pscale = Math.max(Math.floor(window.devicePixelRatio), 1)
	canvas.width = window.innerWidth * pscale
	canvas.height = window.innerHeight * pscale
}
resize()
window.addEventListener("resize", resize)

init(canvas, data)

let tframe = 0
let nframe = 0
let pause = false
let orient: [number, number, number] | null = null
const dts = new Array<number>(30).fill(0)

function frame(
	t: DOMHighResTimeStamp
) {
	const dt = t - tframe
	if (pause) t = tframe
	else tframe = t
	dts[nframe++ % dts.length] = dt
	fps.innerText = `fps: ${Math.round(1000 * dts.length / dts.reduceRight((a, b) => a + b))}\n`
		+ `res: ${canvas.width} x ${canvas.height}\n`
		+ `pratio: ${window.devicePixelRatio.toFixed(1)}, pscale: ${pscale}\n`
		+ `t: ${(t / 1000).toFixed(1)}\n`
		+ `orient: ${orient?.map(v => v.toFixed(0))}\n`
	let x = sw * Math.sin(t / 1500)
	let zoom = 5 * Math.sin(t / 7000)
	let ry = t / 4000
	if (orient) {
		x = 1.5 * sw * Math.sin(orient[0] / 180 * Math.PI)
		zoom = 5 * Math.sin((45 - orient[1]) / 180 * Math.PI)
		ry = -orient[2] / 180 * Math.PI
	}
	if (img.complete) render(
		{ fov: 20 + zoom }, {
		obj: [
			{ xyz: [x + 3 * sw, 0, -6], ry, tex },
			{ xyz: [x + sw, 0, -6], ry, tex },
			{ xyz: [x - sw, 0, -6], ry, tex },
			{ xyz: [x - 3 * sw, 0, -6], ry, tex },
		],
		aether: Math.max(-Math.sin(t / 6000), 0),
		time: t / 1000,
		src: [6, 32, 6, 6, 6, -6]
	})
	requestAnimationFrame(frame)
}
requestAnimationFrame(frame)

// deno-lint-ignore no-explicit-any
const doe = DeviceOrientationEvent as any
document.addEventListener("click", () => {
	if (orient == null && doe.requestPermission) doe.requestPermission()
	pause = !pause
})
window.addEventListener("deviceorientation", e => {
	if (e.alpha != null && e.beta != null && e.gamma != null)
		orient = [e.alpha, e.beta, e.gamma]
})
