const [style, template, index, bind] = await Promise.all([
	Deno.readTextFile("./ui/index/style.css"),
	Deno.readTextFile("./ui/index/template.html"),
	Deno.readTextFile("./ui/index/index.html"),
	Deno.readTextFile("./ui/bind/bind.js"),
])

Deno.writeTextFileSync("../ui/index.html", index
	.replace("<style></style>", `<style>\n${style}\n</style>`)
	.replace("<template></template>", template)
	.replace("<script></script>", `<script type="module">\n${bind}\n</script>`)
)
