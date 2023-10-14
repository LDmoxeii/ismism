const [index, template, style, bind] = await Promise.all([
	Deno.readTextFile("./ui/index/index.html"),
	Deno.readTextFile("./ui/index/template.html"),
	"",
	Deno.readTextFile("./ui/bind/bind.js"),
])
const ui = index
	.replace("<template></template>", template)
	.replace("<style></style>", `<style>\n${style}\n</style>`)
	.replace("<script></script>", `<script type="module">\n${bind}\n</script>`)

console.log(`emitting ui/index.html #${ui.length}`)
Deno.writeTextFileSync("../ui/index.html", ui)
