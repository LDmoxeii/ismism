// deno-lint-ignore-file no-window-prefix
import type { Pas } from "../../src/pra/pos.ts"
import { pos } from "../bind/fetch.ts"
import { init, render } from "./septem.ts"

const pas = await pos<Pas | null>("pas", {})
const blk = document.createElement("canvas")
const file = document.getElementById("file") as HTMLInputElement
const img = document.getElementById("img") as HTMLImageElement
const txt = document.getElementById("txt") as HTMLElement
const trg = document.getElementById("trg") as HTMLCanvasElement

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

const data = {
	vert: new Float32Array([
		-0.5, -1.0, -0.01,
		0.5, -1.0, -0.01,
		0.5, 1.0, -0.01,
		-0.5, 1.0, -0.01,

		-0.5, -1.0, 0.01,
		0.5, -1.0, 0.01,
		0.5, 1.0, 0.01,
		-0.5, 1.0, 0.01,

		-0.5, -1.0, -0.01,
		0.5, -1.0, -0.01,
		0.5, 1.0, -0.01,
		-0.5, 1.0, -0.01,

		-0.5, -1.0, 0.01,
		0.5, -1.0, 0.01,
		0.5, 1.0, 0.01,
		-0.5, 1.0, 0.01,
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

init(trg, data)

let tex: TexImageSource = blk
let tframe = 0
let nframe = 0
let tpause = 0
let dpause = 0
let pause = false
let z = 0
let dz = 0
const ndt = 30
const dt = new Array<number>(ndt)

function resize(
) {
	trg.width = trg.clientHeight / trg.height * trg.width
}
window.addEventListener("resize", resize)
document.body.addEventListener("keypress", e => {
	if (e.key == " ") {
		pause = !pause
		z = 0
		e.preventDefault()
	}
})
document.body.addEventListener("keydown", e => {
	if (e.key == "a") dpause = -1
	else if (e.key == "d") dpause = 1
	else if (e.key == "w") dz = 1
	else if (e.key == "s") dz = -1
})
document.body.addEventListener("keyup", e => {
	if (e.key == "a" || e.key == "d") dpause = 0
	else if (e.key == "w" || e.key == "s") dz = 0
})
resize()

function frame(
	t: DOMHighResTimeStamp
) {
	const d = t - tframe
	dt[nframe++ % ndt] = d
	tframe = t
	txt.innerText = `fps: ${Math.round(1000 * ndt / dt.reduceRight((a, b) => a + b))}\n`
		+ (pas?.nam ?? "")
	if (pause) {
		tpause += dpause * d
		z += dz * d / 1000
		t = tpause
	} else tpause = t
	render(
		{ fov: 20 + 5 * Math.sin(t / 7000) }, {
		obj: [{ xyz: [0.5 * Math.sin(t / 1500), 0, z - 6], ry: t / 4000, tex },],
		aether: Math.max(-Math.sin(t / 6000), 0),
		time: t / 1000,
		src: [6, 32, 6, 6, 6, -6]
	})
	requestAnimationFrame(frame)
}

requestAnimationFrame(frame)
