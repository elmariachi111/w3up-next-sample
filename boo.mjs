import fetch from "node-fetch"

//fetch("https://example.com").then(r => r.text()).then(console.log)  

fetch("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mP4z8AAAAMBAQD3A0FDAAAAAElFTkSuQmCC").then(r => r.text()).then(console.log)