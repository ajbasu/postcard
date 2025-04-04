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

                    if (series.type === "grid") {
                        title.innerHTML = `${series.series}`;
                        title.style.cursor = "pointer";
                        title.addEventListener("click", () => showGallery(series));
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
                    ingelook: "Inge Löök Aunties"
                };

                const seriesName = targetSeriesMap[s.toLowerCase()];
                if (seriesName) {
                    const allSeries = [...gridSeries, ...nonGridSeries];
                    const found = allSeries.find(series => series.series === seriesName);
                    if (found && found.type === "grid") {
                        showGallery(found);
                    }
                }
            }

        });
});

function showGallery(series) {
    const modal = document.getElementById("imageModal");
    const modalImages = document.getElementById("modalImages");
    const modalTitle = document.getElementById("modalTitle");
    modalImages.innerHTML = "";
    modalTitle.textContent = series.series;

    series.status.forEach(item => {
        const imgDiv = document.createElement("div");
        imgDiv.className = "image-item";
        if (item.received !== "yes") imgDiv.classList.add("greyed");

        const img = document.createElement("img");
        img.src = item.image || "";
        img.alt = item.id;

        const tag = document.createElement("div");
        tag.className = "tag";
        tag.textContent = item.id + (item.received === "arranged" ? " (Arranged)" : "");

        imgDiv.appendChild(tag);
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


