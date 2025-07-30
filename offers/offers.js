let postcardsData = [];
let currentIndex = 0;

// Retrieve URL parameters for 'ns' and 'sh'
const urlParams = new URLSearchParams(window.location.search);

// ns: tags to exclude (if sh is not present)
// const nsParamRaw = urlParams.get('ns');
// const nsTags = nsParamRaw ? nsParamRaw.split(',').map(tag => tag.trim().toLowerCase()) : [];

// sh: tags to include; if present, only postcards with a tag in this list are shown
const shParamRaw = urlParams.get('sh');
const shTags = shParamRaw ? shParamRaw.split(',').map(tag => tag.trim().toLowerCase()) : [];

let levelParam = urlParams.get("l");
let random = urlParams.get("rand");

const encoded = urlParams.get("q");
if (encoded) {
    const decodedString = atob(encoded);
    const decodedParams = new URLSearchParams(decodedString);

    random = decodedParams.get("rand");
    levelParam = decodedParams.get("l");

}
const allowedLevels = levelParam ? levelParam.split(",").map(Number) : null;

fetch("postcard-offers.json")
    .then(response => response.json())
    .then(data => {
        postcardsData = data.filter(postcard => postcard.cards > 0);;

        if (shTags.length > 0) {
            postcardsData = postcardsData.filter(postcard => {
                return (
                    Array.isArray(postcard.tag) &&
                    postcard.tag.some(tag => shTags.includes(tag.toLowerCase()))
                );
            });
        }

        if (allowedLevels) {
            postcardsData = postcardsData.filter(entry => allowedLevels.includes(entry.level));
        }

        if (random) {
            postcardsData.sort(() => Math.random() - 0.5);
            const count = Number(random);
            if (!isNaN(count) && count > 0 && count < postcardsData.length) {
                postcardsData = postcardsData.slice(0, count);
            }
        }

        postcardsData.sort((a, b) => {
            const orientationA = a.orientation || "";
            const orientationB = b.orientation || "";
            if (!orientationA && orientationB) return -1;
            if (orientationA && !orientationB) return 1;
            return orientationA.localeCompare(orientationB);
        });

        const container = document.getElementById("gallery");
        container.innerHTML = "";

        const frag = document.createDocumentFragment();

        postcardsData.forEach((postcard, index) => {
            const { orientation = "landscape", image, name, tag = [], cards, level } = postcard;

            const figure = document.createElement("figure");
            figure.classList.add(orientation.toLowerCase() === "portrait" ? "portrait" : "landscape");

            const imgContainer = document.createElement("div");
            imgContainer.classList.add("img-container");
            imgContainer.dataset.index = index;            // for delegated click
            const img = document.createElement("img");
            img.src = image;
            img.alt = name;
            img.loading = "lazy";
            imgContainer.appendChild(img);
            if (level > 1) tag.push('Not for Tags');
            let tagText = "";
            if (tag.length) {
                tagText = tag.slice().sort().join(", ");
                if (cards > 1) tagText += ` | ${cards}×`;
            } else if (cards > 1) {
                tagText = `${cards}×`;
            }
            if (tagText) {
                const tagDiv = document.createElement("div");
                tagDiv.classList.add("tag");
                tagDiv.textContent = tagText;
                imgContainer.appendChild(tagDiv);
            }

            const caption = document.createElement("figcaption");
            caption.textContent = name;

            figure.append(imgContainer, caption);
            frag.appendChild(figure);
        });

        container.appendChild(frag);

        container.addEventListener("click", e => {
            const idx = e.target.closest(".img-container")?.dataset.index;
            if (idx != null) openModal(Number(idx));
        });

        if (postcardsData.length) {
            const cardCount = document.getElementById("card-count");
            cardCount.innerHTML = `${postcardsData.length} Available Card${postcardsData.length > 1 ? 's' : ''}`
        }

        // if (!shTags || shTags.length === 0) {
        //     const figure = document.createElement("figure");
        //     figure.classList.add("portrait");

        //     const imgContainer = document.createElement("div");
        //     imgContainer.classList.add("img-container", "more-offers");

        //     const moreDiv = document.createElement("div");
        //     moreDiv.classList.add("more-text");
        //     moreDiv.innerHTML = `<a href="https://eu.zonerama.com/redteapost/Album/7985055" target="_blank"
        //             rel="noopener">Click Here for more Offers in Zonerama Album <i class="fas fa-link"></i></a>`;
        //     imgContainer.appendChild(moreDiv);

        //     figure.appendChild(imgContainer);
        //     container.appendChild(figure);
        // }

        // window.pageTitle = `${window.pageTitle} (${postcardsData.length} Cards)`;
    })
    .catch(error => console.error("Error loading postcards:", error));

function openModal(index) {
    currentIndex = index;
    const postcard = postcardsData[currentIndex];
    document.getElementById("modalImage").src = postcard.image;
    document.getElementById("modalCaption").textContent = postcard.name;
    if (postcard.tag?.length) {
        document.getElementById("modalTagBox").textContent = Array.isArray(postcard.tag) ? postcard.tag.slice().sort().join(", ") : "";
        document.getElementById("modalTagBox").style.visibility = "visible";
    }
    else {
        document.getElementById("modalTagBox").textContent = "";
        document.getElementById("modalTagBox").style.visibility = "hidden";
    }
    document.getElementById("modal").style.display = "flex";
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

function nextImage() {
    currentIndex = (currentIndex + 1) % postcardsData.length;
    openModal(currentIndex);
}

function prevImage() {
    currentIndex = (currentIndex - 1 + postcardsData.length) % postcardsData.length;
    openModal(currentIndex);
}
