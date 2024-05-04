const [index, bind] = await Promise.all([
    Deno.readTextFile("./ui/index/index.html"),
    Deno.readTextFile("./ui/bind/bind.js"),
])

const ui = index
    .replace("<script></script>", `<script type="module">${bind}</script>`)

console.log(`emitting ui/index.html #${ui.length}`)
Deno.writeTextFileSync("../ui/index.html", ui)
