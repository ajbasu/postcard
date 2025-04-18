document.addEventListener("DOMContentLoaded", function () {
    fetch("assets/data/tracker.json")
        .then(response => response.json())
        .then(data => {
            const gridContainer = document.getElementById("grid-container");
            const listContainer = document.getElementById("list-container");

            const gridSeries = data.filter(series => series.type === "grid");
            const nonGridSeries = data.filter(series => series.type !== "grid");

            const renderSeries = (seriesArray, container) => {
                seriesArray.forEach(series => {
                    const card = document.createElement("div");
                    card.className = "series-card";

                    // Title
                    const title = document.createElement("h2");

                    if (series.gallery) {
                        title.innerHTML = `${series.series}`;
                        title.style.cursor = "pointer";
                        title.addEventListener("click", (event) => showGallery(event, series));
                    } else {
                        title.textContent = series.series;
                    }

                    // Link icon if present
                    if (series.link) {
                        const link = document.createElement("a");
                        link.href = series.link;
                        link.target = "_blank";
                        link.rel = "noopener noreferrer";
                        link.innerHTML = `<i class="fas fa-link"></i>`;
                        title.appendChild(link);
                    }

                    card.appendChild(title);

                    if (series.type === "grid") {
                        const grid = document.createElement("div");
                        grid.className = "grid-layout";

                        const sorted = series.status.slice().sort((a, b) => Number(a.id) - Number(b.id));

                        sorted.forEach(item => {
                            const cell = document.createElement("div");
                            cell.className = "grid-cell";
                            cell.textContent = item.id;

                            if (item.received === "yes") {
                                cell.classList.add("received");
                                cell.title = "Received";
                            }
                            else if (item.received === "arranged") {
                                cell.classList.add("arranged");
                                cell.title = "Arranged";
                            }
                            else {
                                cell.title = "Missing";
                            }

                            if (item.image) {
                                cell.style.cursor = "pointer";
                                cell.addEventListener("click", () => {
                                    showSingleImage(item);
                                });
                            }
                            grid.appendChild(cell);
                        });


                        card.appendChild(grid);
                    } else {
                        const sortEnabled = series.sort !== "no";

                        if (series.subgroups && Array.isArray(series.subgroups)) {
                            // Process subgroups
                            series.subgroups.forEach(subgroup => {
                                const subtitle = document.createElement("h3");
                                subtitle.textContent = subgroup.series;
                                card.appendChild(subtitle);

                                const list = document.createElement("ol");

                                const sorted = sortEnabled
                                    ? subgroup.status.slice().sort((a, b) => {
                                        if (a.id && b.id) return Number(a.id) - Number(b.id);
                                        if (a.name && b.name) return a.name.localeCompare(b.name);
                                        return 0;
                                    })
                                    : subgroup.status;

                                sorted.forEach(item => {
                                    if (!item.name && !item.id) return;

                                    const li = document.createElement("li");
                                    li.textContent = item.id ? `${item.id}. ${item.name}` : item.name;

                                    if (item.received === "yes") {
                                        li.classList.add("strikethrough");
                                    } else if (item.received === "arranged") {
                                        const dot = document.createElement("span");
                                        dot.className = "dot status-dot red";
                                        dot.title = "Arranged";
                                        li.appendChild(dot);
                                    }

                                    if (item.image) {
                                        li.style.cursor = "pointer";
                                        li.addEventListener("click", () => {
                                            showSingleImage(item);
                                        });
                                    }

                                    list.appendChild(li);
                                });

                                card.appendChild(list);
                            });
                        } else {
                            // No subgroups
                            const list = document.createElement("ol");

                            const sorted = sortEnabled
                                ? series.status.slice().sort((a, b) => {
                                    if (a.id && b.id) return Number(a.id) - Number(b.id);
                                    if (a.name && b.name) return a.name.localeCompare(b.name);
                                    return 0;
                                })
                                : series.status;

                            sorted.forEach(item => {
                                if (!item.name && !item.id) return;

                                const li = document.createElement("li");
                                li.textContent = item.id ? `${item.name} (#${item.id})` : item.name;

                                if (item.received === "yes") {
                                    li.classList.add("strikethrough");
                                } else if (item.received === "arranged") {
                                    const dot = document.createElement("span");
                                    dot.className = "dot status-dot red";
                                    dot.title = "Arranged";
                                    li.appendChild(dot);
                                }

                                if (item.image) {
                                    li.style.cursor = "pointer";
                                    li.addEventListener("click", () => {
                                        showSingleImage(item);
                                    });
                                }

                                list.appendChild(li);
                            });

                            card.appendChild(list);
                        }
                    }

                    // Calculate counter
                    const countableItems = (series.subgroups || [series]).flatMap(group => group.status || []).filter(item => item.countable !== "no");
                    const receivedItems = countableItems.filter(item => item.received === "yes");

                    const counter = document.createElement("div");
                    counter.className = "counter";
                    counter.textContent = `Received: ${receivedItems.length} / ${countableItems.length}`;
                    card.appendChild(counter);



                    container.appendChild(card);
                });
            };

            renderSeries(gridSeries, gridContainer);
            renderSeries(nonGridSeries, listContainer);

            // After rendering all series
            const params = new URLSearchParams(window.location.search);
            const s = params.get("s");

            if (s) {
                const targetSeriesMap = {
                    tabineko: "Tabineko",
                    ingelook: "Inge Löök Aunties",
                    bluecats: "Blue Cats WT",
                    uid: "Unity in Diversity"
                };

                const seriesName = targetSeriesMap[s.toLowerCase()];
                if (seriesName) {
                    const allSeries = [...gridSeries, ...nonGridSeries];
                    const found = allSeries.find(series => series.series === seriesName);
                    if (found && found.gallery) {
                        const m = params.get("m");
                        let dummyEvent = null;
                        if (m) dummyEvent = { metaKey: true, };
                        showGallery(dummyEvent, found);
                    }
                }
            }

        });
    fetch("assets/data/countrywise.csv")
        .then(response => response.text())
        .then(csv => {
            const lines = csv.trim().split("\n");
            const countries = lines.map(line => {
                const [country, code, ...series] = line.split(",");
                return {
                    country: country.trim(),
                    code: code.trim().toLowerCase(), // ISO code in lowercase for flag URL
                    series: series.map(s => s.trim()).filter(Boolean).sort()
                };
            });

            // Sort countries alphabetically
            countries.sort((a, b) => a.country.localeCompare(b.country));

            const trackerContainer = document.getElementById("country-tracker");

            countries.forEach(({ country, code, series }) => {
                const div = document.createElement("div");
                div.className = "country-entry";

                let flagHTML = "";
                if (code && code !== "-") {
                    flagHTML = `<img class="country-flag" src="https://flagcdn.com/h20/${code}.png" alt="${country} flag">`;
                }

                div.innerHTML = `<strong>${country}</strong><br>${series.join(", ")} ${flagHTML}`;
                trackerContainer.appendChild(div);
            });
        });
});

function showGallery(event, series) {
    const modal = document.getElementById("imageModal");
    const modalImages = document.getElementById("modalImages");
    const modalTitle = document.getElementById("modalTitle");
    const modalSubtitle = document.getElementById("modalSubtitle");
    modalImages.innerHTML = "";
    modalTitle.textContent = series.series;

    let filteredSeries = { ...series };
    let isMeta = false;

    if (event?.metaKey || event?.ctrlKey) { // Filter out received entries
        filteredSeries.status = series.status.filter(item => item.received.toLowerCase() !== "yes");
        isMeta = true;
        modalSubtitle.textContent = "Missing Cards";
    }
    else {
        modalSubtitle.textContent = "Greyed out cards are missing.";
    }

    filteredSeries.status.forEach(item => {
        const imgDiv = document.createElement("div");
        imgDiv.className = "image-item";
        if (!isMeta && item.received !== "yes") imgDiv.classList.add("greyed");

        const img = document.createElement("img");
        img.src = item.image || "";
        img.alt = item.id ? item.id : item.name ? item.name : '';

        if (item.id) {
            const tag = document.createElement("div");
            tag.className = "tag";
            tag.textContent = item.id + (item.received === "arranged" ? " | Arranged" : "") + (item.count && item.count > 1 ? ` | ${item.count}×` : "");
            imgDiv.appendChild(tag);
        }

        imgDiv.appendChild(img);

        if (item.name) {
            const name = document.createElement("div");
            name.className = "name";
            name.textContent = item.name;
            imgDiv.appendChild(name);
        }

        modalImages.appendChild(imgDiv);
    });

    modal.style.display = "flex";
}


document.querySelector(".image-modal .close").onclick = () => {
    document.getElementById("imageModal").style.display = "none";
};

window.onclick = (event) => {
    const modal = document.getElementById("imageModal");
    if (event.target === modal) modal.style.display = "none";
};

document.getElementById("legend-tab").addEventListener("click", () => {
    const legendBox = document.getElementById("legend-box");
    const legendArrow = document.getElementById("legend-arrow");

    const isHidden = legendBox.style.display === "none";
    legendBox.style.display = isHidden ? "block" : "none";
    legendArrow.className = isHidden
        ? "fa-solid fa-chevron-right"
        : "fa-solid fa-chevron-left";
});

function showSingleImage(item) {
    const modal = document.getElementById("singleImageModal");
    const img = document.getElementById("singleImage");
    const name = document.getElementById("singleImageName");

    img.src = item.image || "";
    img.alt = item.id || "";

    name.textContent = `${item.id || ""}${item.id && item.name ? " - " : ""}${item.name || ""} ${item.received === "yes"
        ? "(Received)"
        : item.received === "no"
            ? "(Not Received)"
            : item.received === "arranged"
                ? "(Arranged)"
                : ""
        }`.trim();


    modal.style.display = "flex";
}

document.querySelector("#singleImageModal .close").onclick = () => {
    document.getElementById("singleImageModal").style.display = "none";
};

window.addEventListener("click", (e) => {
    const modal = document.getElementById("singleImageModal");
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

document.getElementById("countrySearch").addEventListener("input", function () {
    const query = this.value.toLowerCase().trim();
    const entries = document.querySelectorAll("#country-tracker .country-entry");

    entries.forEach(entry => {
        const text = entry.textContent.toLowerCase();
        entry.style.display = text.includes(query) ? "block" : "none";
    });
});

