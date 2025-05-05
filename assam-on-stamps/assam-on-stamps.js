let stampData = [];
let currentIndex = 0;


function openModal(index) {
    currentIndex = index;
    const stamp = stampData[currentIndex];
    console.log(stamp);
    document.getElementById("modalImageStamp").src = stamp.image;
    let caption = stamp.title;
    if (stamp.subtitle) caption += `, ${stamp.subtitle}`;
    if (stamp.part_of) caption += `<br>Part of: ${stamp.part_of}`;
    if (stamp.issued) caption += `<br>Issued on: ${formatIssuedDate(stamp.issued)}`;
    if (stamp.face_value) caption += `<br>Face Value: ${stamp.face_value}`;
    document.getElementById("modalCaption").innerHTML = caption;
    if (stamp.category?.length) {
        document.getElementById("modalTagBox").textContent = Array.isArray(stamp.category) ? stamp.category.slice().sort().join(", ") : "";
        document.getElementById("modalTagBox").style.visibility = "visible";
    }
    else {
        document.getElementById("modalTagBox").textContent = "";
        document.getElementById("modalTagBox").style.visibility = "hidden";
    }
    if (stamp.in_collection) {
        document.getElementById("checkMarkConatiner").style.visibility = "visible";
    }
    else {
        document.getElementById("checkMarkConatiner").style.visibility = "hidden";
    }
    document.getElementById("modal").style.display = "flex";
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

function nextImage() {
    currentIndex = (currentIndex + 1) % stampData.length;
    openModal(currentIndex);
}

function prevImage() {
    currentIndex = (currentIndex - 1 + stampData.length) % stampData.length;
    openModal(currentIndex);
}

function parseIssuedDate(str) {
    if (!str) return null;
    if (/^\d{4}$/.test(str)) {
        return new Date(`${str}-01-01`);
    }
    if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
        const [day, month, year] = str.split("-");
        return new Date(`${year}-${month}-${day}`);
    }
    return new Date(str);
};

function formatIssuedDate(str) {
    const date = parseIssuedDate(str);
    if (!date || isNaN(date)) return str;

    const day = date.getDate(); // no leading zero
    const month = date.toLocaleString("en-GB", { month: "short" });
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
};

fetch("assam-on-stamps.json")
    .then(response => response.json())
    .then(data => {
        stampData = data;

        stampData.sort((a, b) => {
            const dateA = parseIssuedDate(a.issued);
            const dateB = parseIssuedDate(b.issued);

            if (!dateA && dateB) return -1;
            if (dateA && !dateB) return 1;
            if (!dateA && !dateB) return 0;

            return dateA - dateB;
        });

        const container = document.getElementById("gallery");
        container.innerHTML = "";

        const frag = document.createDocumentFragment();

        stampData.forEach((stamp, index) => {
            const figure = document.createElement("figure");
            figure.classList.add("landscape");

            const imgContainer = document.createElement("div");
            imgContainer.classList.add("stamp-container");
            imgContainer.dataset.index = index;
            const img = document.createElement("img");
            img.src = stamp.image;
            img.alt = stamp.title;
            img.loading = "lazy";
            imgContainer.appendChild(img);

            if (stamp.in_collection) {
                imgContainer.style.backgroundColor = "var(--received-kalar)";
            }

            const caption = document.createElement("figcaption");
            caption.innerHTML = stamp.title + (stamp.issued ? `<br>Issued on: ${formatIssuedDate(stamp.issued)}` : "");

            figure.append(imgContainer, caption);
            frag.appendChild(figure);
        });

        container.appendChild(frag);

        container.addEventListener("click", e => {
            const idx = e.target.closest(".stamp-container")?.dataset.index;
            if (idx != null) openModal(Number(idx));
        });

        if (stampData.length) {
            const cardCount = document.getElementById("card-count");
            cardCount.innerHTML = `${stampData.length} Stamp${stampData.length > 1 ? 's' : ''}`
        }
    })
    .catch(error => console.error("Error loading stamps:", error));

