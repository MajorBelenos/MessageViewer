 const STORAGE_KEY = "messages_lus";
let allMessages = [];

function getLus() { 
var tmp =  localStorage.getItem(STORAGE_KEY);
console.log(tmp);
return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");}
function setLu(id, value) {
  const lus = getLus();
  //console.log(id + " - " + value);
  lus[id] = value;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lus));
}



window.addEventListener("load", function () {

  if (document.getElementById("fileInput"))
  {
	document.getElementById("fileInput").addEventListener("change", e => {
		const file = e.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = ev => {
			const data = JSON.parse(ev.target.result);
			// si le fichier contient directement un tableau de messages
			const messages = Array.isArray(data) ? data : data.messages;
			allMessages = Array.isArray(data) ? data : data.messages;
			afficher(messages);
		};
		reader.readAsText(file, "utf-8");
	});
  }
   if (document.getElementById("exportBtn"))
  {
	document.getElementById("exportBtn").addEventListener("click", () => {
		
		const data = JSON.stringify(localStorage.getItem(STORAGE_KEY));
		const blob = new Blob([data], {
			type: "application/json"
		});

		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "messages_lus.json";
		a.click();
		URL.revokeObjectURL(url);
	});
	
// bouton Import
document.getElementById("importBtn").addEventListener("click", () => {
	document.getElementById("importLusInput").click();
});

document.getElementById("importLusInput").addEventListener("change", e => {
	const file = e.target.files[0];
	if (!file) return;

	const reader = new FileReader();
	reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
			const lus = JSON.parse(data || "{}");
            
			
			localStorage.setItem(STORAGE_KEY, JSON.stringify(lus));
 

            alert("Import réussi !");
        } catch (error) {
            alert("Fichier invalide.");
        }
	};

	reader.readAsText(file, "utf-8");
});
	
 }
});



window.addEventListener("load", function () {
	const messagesContainer = document.getElementById("messages");
	if (!messagesContainer) return;
	const lus = getLus();
  
	// enfants directs uniquement
	const firstLevelDivs = messagesContainer.children;
	alert(firstLevelDivs.length + " message chargés");

	Array.from(firstLevelDivs).forEach(div => {
		div.addEventListener("click", function () {
			div.classList.toggle("lu");
			setLu(div.id, div.classList.contains("lu"));
		});
	//console.log(div.id + " - " + lus[div.id]);
		if (lus[div.id]) div.classList.add("lu");

	});
});


function afficher(messages) {
	const container = document.getElementById("messages");
	container.innerHTML = "\n";
	const lus = getLus();

	messages
		.sort((a,b) => a.timestamp - b.timestamp)
		.forEach(msg => {

			if (msg.isUnsent) return;
			const id = msg.timestamp + "_" + msg.senderName
			const div = document.createElement("div");
			div.className = "message";
			div.id = id;
			if (lus[id]) div.classList.add("lu");

			const date = new Date(msg.timestamp).toLocaleString();

			let html = `
				<div class="sender">${msg.senderName}</div><div class="date">${date}</div>
				<div>${msg.text || ""}</div>
				`;

			// médias
			if (msg.media && msg.media.length > 0) {
				html += `<div class="media">`;
				msg.media.forEach(m => {
				  html += `<img src="../message/${m.uri}" alt="media">`;
				});
				html += `</div>`;
			}

			// réactions
			if (msg.reactions?.length) {
				html += `<div class="reactions">`;
				msg.reactions.forEach(r => {
					const isHeart = r.reaction === "❤️" || r.reaction === "❤" || r.reaction === "♥️";
					html += `<span class="reaction ${isHeart ? "heart" : ""}">${r.reaction}</span>`;
				});
				html += `</div>`;
			}

			//html += `<div class="date">${date}</div>`;

			div.innerHTML = html;
			
	  
		 container.appendChild(div);
		 container.appendChild(document.createTextNode("\n"));
		});
}