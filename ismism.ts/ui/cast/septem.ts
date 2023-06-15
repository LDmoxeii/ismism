const tag = {
	res: "res",
	time: "time",
	aether: "aether",
	pos: "pos",
	proj: "proj",
	tex: "tex",
	dtex: "dtex",
	src: "src",
	vert_a: "vert_a",
	tex_a: "tex_a",
	norm_a: "norm_a",
	pos_v: "pos_v",
	tex_v: "tex_v",
	norm_v: "vert_v",
}

const vert = `
uniform mat4 pos;
uniform mat4 proj;
attribute vec4 vert_a;
attribute vec2 tex_a;
attribute vec3 norm_a;
varying vec3 pos_v;
varying vec2 tex_v;
varying vec3 norm_v;

void main() {
	vec4 p = pos * vert_a;
	gl_Position = proj * p;
	pos_v = p.xyz;
	norm_v = mat3(pos) * norm_a;
	tex_v = tex_a;
}
`
const frag = `#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform vec2 res;
uniform float time;
uniform float aether;
uniform sampler2D tex;
uniform vec2 dtex;
uniform vec3 src[2];
varying vec3 pos_v;
varying vec2 tex_v;
varying vec3 norm_v;
const float pi = 3.14159265359;

float wave(vec3 p) {
	float f = 0.0;
	float a = atan(p.y, p.x) * 2.;
	float d = length(p);
	p.xy *= mat2(cos(a + time * .1) * d, sin(a) * d, -sin(a) * d, cos(a + time * .1) * d);
	f += length(sin(p));
	f *= sin(p.z + time + cos(length(p.xy) + time));
	f = sin(pow(abs(f), p.z) * d + time);
	return f;
}

float field() {
	vec2 uv = (gl_FragCoord.xy - 0.5 * res) / min(res.x, res.y) * 14.0;
	float f = 0.0;
	for(float i = 0.0; i < 3.0; i++) {
		f += wave(vec3(uv.x, uv.y, i * 0.728));
	}
	return 1.0 - f / 3.0;
}

vec3 sobel() {
	float height = 0.3;
	float dx = texture2D(tex, tex_v + vec2(-dtex.x, -dtex.y)).g;
	dx += 2.0 * texture2D(tex, tex_v + vec2(-dtex.x, 0.0)).g;
	dx += texture2D(tex, tex_v + vec2(-dtex.x, dtex.y)).g;
	dx -= texture2D(tex, tex_v + vec2(dtex.x, -dtex.y)).g;
	dx -= 2.0 * texture2D(tex, tex_v + vec2(dtex.x, 0.0)).g;
	dx -= texture2D(tex, tex_v + vec2(dtex.x, dtex.y)).g;
	float dy = texture2D(tex, tex_v + vec2(-dtex.x, -dtex.y)).g;
	dy += 2.0 * texture2D(tex, tex_v + vec2(0.0, -dtex.y)).g;
	dy += texture2D(tex, tex_v + vec2(dtex.x, -dtex.y)).g;
	dy -= texture2D(tex, tex_v + vec2(-dtex.x, dtex.y)).g;
	dy -= 2.0 * texture2D(tex, tex_v + vec2(0.0, dtex.y)).g;
	dy -= texture2D(tex, tex_v + vec2(dtex.x, dtex.y)).g;
	return normalize(vec3(dx, dy, 1.0 / height));
}
vec3 bump(vec3 n) {
	vec3 t = normalize(dFdx(pos_v) * dFdy(tex_v).t - dFdy(pos_v) * dFdx(tex_v).t);
	mat3 tbn = mat3(t, -normalize(cross(n, t)), n);
	return normalize(normalize(tbn * sobel()) + n);
}

float ggx(vec3 n, vec3 h, float r) {
	float a = r * r;
	a *= a;
	float nh = max(dot(n, h), 0.0);
	nh *= nh;
	float de = nh * (a - 1.0) + 1.0;
	return a / (pi * de * de);
}
float schlick(float nv, float r) {
	r += 1.0;
	r = (r * r) / 8.0;
	return nv / (nv * (1.0 - r) + r);
}
float smith(vec3 n, vec3 v, vec3 l, float r) {
	float nv = max(dot(n, v), 0.0);
	float nl = max(dot(n, l), 0.0);
	return schlick(nv, r) * schlick(nl, r);
}
vec3 fresnel(float c, vec3 f) {
	return f + (1.0 - f) * pow(clamp(1.0 - c, 0.0, 1.0), 5.0);
}
vec3 light() {
	vec3 t = pow(vec3(texture2D(tex, tex_v)), vec3(2.2));
	vec3 albedo = t / max(1.0 - t, 0.0001);
	float roughness = clamp(length(t) - 0.5, 0.3, 0.6);
	float metallic = 0.0;
	float ambient = 0.35;
	vec3 b = bump(normalize(norm_v));
	vec3 v = normalize(-pos_v);
	vec3 f0 = mix(vec3(0.04), albedo, metallic);
	vec3 lo = vec3(0.0);
	for(int i = 0; i < 2; ++i) {
		vec2 d = src[i].xz - pos_v.xz;
		float rad = src[i].y / (abs(d.x) + abs(d.y));
		vec3 l = normalize(vec3(d.x, 0.0, d.y));
		vec3 h = normalize(v + l);
		vec3 f = fresnel(clamp(dot(h, v), 0.0, 1.0), f0);
		vec3 kd = (vec3(1.0) - f) * (1.0 - metallic);
		float bl = max(dot(b, l), 0.0);
		float dfg = ggx(b, h, roughness) * smith(b, v, l, roughness);
		vec3 s = dfg * f / (4.0 * max(dot(b, v), 0.0) * bl + 0.0001);
		lo += (kd * albedo / pi + s) * rad * bl;
	}
	float ao = max(dot(b, vec3(0.0, 0.0, 1.0)), 0.05);
	lo += ambient * albedo * ao;
	float vignette = cos(0.5 * pi * (gl_FragCoord.y / res.y - 0.5));
	return pow(lo / (lo + vec3(1.0)), vec3(1.0 / 2.2)) * vignette;
}

void main() {
	vec3 l = light();
	vec3 a = aether > 0. ? clamp(field() - l, 0.0, 1.0) : vec3(0.0);
	gl_FragColor.rgb = aether * a + (1.0 - aether) * l;
	gl_FragColor.a = 1.0;
}
`

enum ShaderType {
	vert = 0x8B31,
	frag = 0x8B30,
}

function shader(
	gl: WebGLRenderingContext,
	type: ShaderType,
	src: string
): WebGLShader {
	const s = gl.createShader(type)!
	gl.shaderSource(s, src)
	gl.compileShader(s)
	if (gl.getShaderParameter(s, gl.COMPILE_STATUS)) return s
	console.error(`failed compiling ${ShaderType[type]}`, gl.getShaderInfoLog(s))
	gl.deleteShader(s)
	return null!
}

function program(
	gl: WebGLRenderingContext,
	vert: string,
	frag: string
): WebGLProgram {
	const v = shader(gl, ShaderType.vert, vert)
	const f = shader(gl, ShaderType.frag, frag)
	const p = gl.createProgram()!
	gl.attachShader(p, v)
	gl.attachShader(p, f)
	gl.linkProgram(p)
	gl.deleteShader(v)
	gl.deleteShader(f)
	gl.useProgram(p)
	if (gl.getProgramParameter(p, gl.LINK_STATUS)) return p
	console.log("failed linking", gl.getProgramInfoLog(p))
	gl.deleteProgram(p)
	return null!
}

function buffer(
	gl: WebGLRenderingContext,
	data: BufferSource,
	attr?: { loc: number, size: number },
) {
	const t = attr === undefined ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER
	gl.bindBuffer(t, gl.createBuffer())
	gl.bufferData(t, data, gl.STATIC_DRAW)
	if (attr !== undefined) {
		gl.vertexAttribPointer(attr.loc, attr.size, gl.FLOAT, false, 0, 0)
		gl.enableVertexAttribArray(attr.loc)
	}
}

function texture(
	gl: WebGLRenderingContext,
) {
	gl.activeTexture(gl.TEXTURE0)
	gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
}

let prog: {
	canvas: HTMLCanvasElement,
	gl: WebGLRenderingContext,
	pos: WebGLUniformLocation,
	proj: WebGLUniformLocation,
	res: WebGLUniformLocation,
	time: WebGLUniformLocation,
	aether: WebGLUniformLocation,
	dtex: WebGLUniformLocation,
	src: WebGLUniformLocation,
	len: number
} | null = null

const pos = new Array<number>(16).fill(0)
{ pos[0] = pos[5] = pos[10] = pos[15] = 1 }

function pos_to(
	[tx, ty, tz]: [number, number, number],
	ry: number,
) {
	pos[12] = tx
	pos[13] = ty
	pos[14] = tz
	const s = Math.sin(ry)
	const c = Math.cos(ry)
	pos[0] = c
	pos[2] = -s
	pos[8] = s
	pos[10] = c
	if (prog) prog.gl.uniformMatrix4fv(prog.pos, false, pos)
}

const proj = new Array<number>(16).fill(0)
{ proj[11] = -1 }

function proj_to(
	fov: number,
	aspect: number,
	near: number,
	far: number
) {
	const f = 1.0 / Math.tan(fov / 2)
	const nf = 1 / (near - far)
	proj[0] = f / aspect
	proj[5] = f
	proj[10] = (far + near) * nf
	proj[14] = 2 * far * near * nf
	if (prog) prog.gl.uniformMatrix4fv(prog.proj, false, proj)
}

export function init(
	canvas: HTMLCanvasElement,
	data: { vert: Float32Array, tex: Float32Array, norm: Float32Array, idx: Uint8Array }
) {
	const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true })!
	gl.getExtension("OES_standard_derivatives")
	const p = program(gl, vert, frag)
	texture(gl)
	gl.uniform1i(gl.getUniformLocation(p, tag.tex), 0)
	buffer(gl, data.vert, { loc: gl.getAttribLocation(p, tag.vert_a), size: 3 })
	buffer(gl, data.tex, { loc: gl.getAttribLocation(p, tag.tex_a), size: 2 })
	buffer(gl, data.norm, { loc: gl.getAttribLocation(p, tag.norm_a), size: 3 })
	buffer(gl, data.idx)
	prog = {
		canvas, gl,
		pos: gl.getUniformLocation(p, tag.pos)!,
		proj: gl.getUniformLocation(p, tag.proj)!,
		res: gl.getUniformLocation(p, tag.res)!,
		time: gl.getUniformLocation(p, tag.time)!,
		aether: gl.getUniformLocation(p, tag.aether)!,
		dtex: gl.getUniformLocation(p, tag.dtex)!,
		src: gl.getUniformLocation(p, tag.src)!,
		len: data.idx.length
	}
}

let tex: TexImageSource | null = null

export type Obj = {
	xyz: [number, number, number]
	ry: number,
	tex: TexImageSource,
}

export type Scene = {
	obj: Obj[],
	aether: number,
	time: number,
	src: number[],
}

export type Cam = {
	fov: number
}

export function render(
	cam: Cam,
	scene: Scene,
) {
	if (!prog) return
	const gl = prog.gl
	gl.viewport(0, 0, prog.canvas.width, prog.canvas.height)
	gl.clearColor(.75, .75, .75, 1)
	gl.clearDepth(1.0)
	gl.enable(gl.DEPTH_TEST)
	gl.depthFunc(gl.LEQUAL)
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
	proj_to((cam.fov * Math.PI) / 180, prog.canvas.width / prog.canvas.height, .1, 100)
	gl.uniform2f(prog.res, prog.canvas.width, prog.canvas.height)
	gl.uniform1f(prog.time, scene.time)
	gl.uniform1f(prog.aether, scene.aether)
	gl.uniform3fv(prog.src, scene.src)
	for (const obj of scene.obj) {
		if (!tex || obj.tex != tex) {
			tex = obj.tex
			if (tex instanceof HTMLImageElement) gl.uniform2f(prog.dtex, 1 / tex.naturalWidth, 1 / tex.naturalHeight)
			else gl.uniform2f(prog.dtex, 1 / tex.width, 1 / tex.height)
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex)
		}
		pos_to(obj.xyz, obj.ry)
		gl.drawElements(gl.TRIANGLES, prog.len, gl.UNSIGNED_BYTE, 0)
	}
}
