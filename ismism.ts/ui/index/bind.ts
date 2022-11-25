function template(
	id: string
): DocumentFragment {
	const temp = document.getElementById(id) as HTMLTemplateElement
	return temp.content.cloneNode(true) as DocumentFragment
}

function etag(
	el: HTMLElement,
	tags: string[],
	count = false
) {
	el.innerHTML = ""
	const a = template("tag")
	const n = a.querySelector(".tag-name") as HTMLSpanElement
	const c = a.querySelector(".tag-count") as HTMLSpanElement
	if (!count) c.parentNode?.removeChild(c)
	for (const t of tags) {
		n.innerText = t
		if (count) c.innerText = `${99}`
		el.appendChild(a.cloneNode(true))
	}
}

etag(document.querySelector("div.title>.tag")!, ["全部", "1232", "然后"], true)
