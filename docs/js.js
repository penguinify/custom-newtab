// i lwk cant spell carousels
let cara = document.querySelectorAll(".carousel");

for (let i = 0; i < cara.length; i++) {
	// there is a property called data-caroursel which is just the text to display
	let text = cara[i].getAttribute("data-carousel");

	// i made it kinda like straw page so like it will keep looping across the screen
	for (let j = 0; j < 40; j++) {
		let span = document.createElement("span");
		span.innerText = text + " \u00A0\u00A0\u00A0"; // adding some space between repetitions
		cara[i].appendChild(span);
	}

	let link = cara[i].getAttribute("data-link");
	if (link) {
		cara[i].style.cursor = "pointer";
		cara[i].addEventListener("click", function () {
			window.location.href = link;
		});
	}
}
