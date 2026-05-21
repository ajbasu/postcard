const DEFAULT_IMAGE = "https://placehold.jp/30/dddee3/ffffff/320x240.png?text=";
let fullData = [];

async function loadGallery() {
    const res = await fetch("loupaper.json");
    fullData = await res.json();
    renderGallery("all");
}

document.getElementById("filterSelect").addEventListener("change", function () {
    renderGallery(this.value);
});
document.getElementById("filterSelect").value = "all";

function renderGallery(filter) {
    const container = document.getElementById("galleryContainer");
    container.innerHTML = "";

    fullData.forEach(series => {
        let items = series.status || [];

        // FILTER
        if (filter === "received") {
            items = items.filter(i => i.received === "yes");
        } else if (filter === "missing") {
            items = items.filter(i => i.received !== "yes");
        }

        if (!items.length) return;

        const block = document.createElement("div");
        block.className = "series-block";

        const title = document.createElement("div");
        title.className = "series-title";
        title.textContent = series.series;

        const subtitle = document.createElement("div");
        subtitle.className = "series-subtitle";

        if (filter === "missing") {
            subtitle.textContent = `${items.length} Missing or Arranged`;
        } else if (filter === "received") {
            subtitle.textContent = `${items.length} Received`;
        } else {
            const total = series.status || [];

            const receivedCount = total.filter(i => i.received === "yes").length;
            const arrangedCount = total.filter(i => i.received === "arranged").length;
            const missingCount = total.filter(i => i.received !== "yes" && i.received !== "arranged").length;

            subtitle.textContent = `${receivedCount} received, ${arrangedCount} arranged, ${missingCount} missing`;
        }

        const grid = document.createElement("div");
        grid.className = "grid";

        // SORT
        if (series.sort !== false) {
            const key = series.sortBy || "id";

            items = items.slice().sort((a, b) => {
                const valA = a[key];
                const valB = b[key];

                if (valA != null && valB != null) {
                    if (!isNaN(valA) && !isNaN(valB)) {
                        return Number(valA) - Number(valB);
                    }
                    return String(valA).localeCompare(String(valB));
                }

                if (a.id && b.id) return Number(a.id) - Number(b.id);
                if (a.name && b.name) return a.name.localeCompare(b.name);

                return 0;
            });
        }

        items.forEach(item => {
            const imgDiv = document.createElement("div");
            imgDiv.className = "image-item";

            if (filter === "all" && item.received !== "yes") {
                imgDiv.classList.add("greyed");
            }

            const img = document.createElement("img");
            img.src = item.image || DEFAULT_IMAGE + item.name.replace(/&/g, "and");
            img.alt = item.id || item.name || "";

            const { id, received, count } = item;
            const parts = [];

            // if (id) parts.push(id);
            if (received === "arranged") parts.push("Arranged");
            if (count > 1) parts.push(`${count}×`);

            if (parts.length) {
                const tag = document.createElement("div");
                tag.className = "tag";
                tag.textContent = parts.join(" | ");
                imgDiv.appendChild(tag);
            }

            imgDiv.appendChild(img);

            if (item.name) {
                const name = document.createElement("div");
                name.className = "name";
                name.textContent = item.name;
                imgDiv.appendChild(name);
            }

            grid.appendChild(imgDiv);
        });

        block.appendChild(title);
        block.appendChild(subtitle);
        block.appendChild(grid);
        container.appendChild(block);
    });
}

loadGallery();

