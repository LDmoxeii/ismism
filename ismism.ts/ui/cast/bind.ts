// deno-lint-ignore-file no-window-prefix
import type { Pas } from "../../src/pra/pos.ts"
import { pos } from "../bind/fetch.ts"
import { mesh, sw } from "./mesh.ts"
import { init, render } from "./septem.ts"

const pas = await pos<Pas | null>("pas", {})
const blk = document.createElement("canvas")
const file = document.getElementById("file") as HTMLInputElement
const img = document.getElementById("img") as HTMLImageElement
const txt = document.getElementById("txt") as HTMLElement
const trg = document.getElementById("trg") as HTMLCanvasElement
const dbg = location.search.startsWith("?dbg")

function file_r(
	fs?: FileList | null
) {
	if (fs && fs.length > 0) {
		console.log("loading tex")
		const r = new FileReader()
		tex = blk
		r.onload = p => img.src = p.target?.result as string
		r.readAsDataURL(fs[0])
	}
	file.value = ""
}
["dragenter", "dragover", "dragleave", "drop"]
	.forEach(event => document.addEventListener(event, e => {
		e.preventDefault()
		e.stopPropagation()
	}))
document.ondrop = e => {
	e.preventDefault()
	file_r(e.dataTransfer?.files)
}
file.oninput = () => file_r(file.files)
img.onload = () => tex = img

init(trg, mesh)

let tex: TexImageSource = blk
let tframe = 0
let tpause = 0
let nframe = 0
let pause = false
let dp = 0
let dz = 0
let z = 0
let orient: [number, number, number] | null = null
let hint = ""
const dts = new Array<number>(30).fill(0)
let pscale = 1.0

function resize(
) {
	pscale = Math.max(Math.floor(window.devicePixelRatio), 1)
	trg.width = window.innerWidth * pscale
	trg.height = window.innerHeight * pscale
}
resize()
window.addEventListener("resize", resize)

if (dbg) {
	document.body.addEventListener("keypress", e => {
		if (e.key == " ") {
			pause = !pause
			dp = dz = z = 0
			e.preventDefault()
		}
	})
	document.body.addEventListener("keydown", e => {
		if (e.key == "a") dp = -1
		else if (e.key == "d") dp = 1
		else if (e.key == "w") dz = 1
		else if (e.key == "s") dz = -1
	})
	document.body.addEventListener("keyup", e => {
		if (e.key == "a" || e.key == "d") dp = 0
		else if (e.key == "w" || e.key == "s") dz = 0
	})
}

document.addEventListener("click", async () => { // deno-lint-ignore no-explicit-any
	const doe = DeviceOrientationEvent as any
	if (orient == null && doe.requestPermission) {
		const stat = await (doe.requestPermission() as Promise<"granted" | "denied">)
		if (stat !== "granted") orient = null
	}
})
window.addEventListener("deviceorientation", e => {
	if (e.alpha != null && e.beta != null && e.gamma != null) {
		orient = [e.alpha, e.beta, e.gamma]
		hint = ""
	} else hint = "\n\n点击屏幕以查看卡片"
})

function frame(
	t: DOMHighResTimeStamp
) {
	const dt = t - tframe
	tframe = t
	dts[nframe++ % dts.length] = dt

	if (pause) {
		z += dz * dt / 1000
		t = tpause = tpause + dp * dt
	} else tpause = t
	txt.innerText = `fps: ${Math.round(1000 * dts.length / dts.reduceRight((a, b) => a + b))}\n`
		+ (dbg ? (`res: ${trg.width} x ${trg.height}\n`
			+ `pratio: ${window.devicePixelRatio.toFixed(1)}, pscale: ${pscale}\n`
			+ `t: ${(t / 1000).toFixed(1)}\n`
			+ `orient: ${orient?.map(v => v.toFixed(0))}\n`) : "")
		+ (pas?.nam ?? "")
		+ hint
	let x = 0.5 * sw * Math.sin(t / 1500)
	let zoom = 5 * Math.sin(t / 7000)
	let ry = t / 4000
	if (orient) {
		x = sw * Math.sin(orient[0] / 180 * Math.PI)
		zoom = 5 * Math.sin((45 - orient[1]) / 180 * Math.PI)
		ry = -orient[2] / 180 * Math.PI
	}
	if (img.complete) render(
		{ fov: 20 + zoom }, {
		obj: [{ xyz: [x, 0, z - 6], ry, tex },],
		aether: Math.max(-Math.sin(t / 6000), 0),
		time: t / 1000,
		src: [6, 32, 6, 6, 6, -6]
	})
	requestAnimationFrame(frame)
}

requestAnimationFrame(frame)
