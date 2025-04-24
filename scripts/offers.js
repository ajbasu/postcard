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

const levelParam = urlParams.get("l");
const allowedLevels = levelParam ? levelParam.split(",").map(Number) : null;

const random = urlParams.get("r");

fetch("../assets/data/postcards.json")
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
        }

        postcardsData.sort((a, b) => {
            const orientationA = a.orientation || "";
            const orientationB = b.orientation || "";
            if (!orientationA && orientationB) return -1;
            if (orientationA && !orientationB) return 1;
            return orientationA.localeCompare(orientationB);
        });

        const container = document.getElementById("gallery");
        postcardsData.forEach((postcard, index) => {
            const figure = document.createElement("figure");
            // Apply orientation-based class; default to landscape if not provided
            if (postcard.orientation && postcard.orientation.toLowerCase() === "portrait") {
                figure.classList.add("portrait");
            } else {
                figure.classList.add("landscape");
            }

            // Create image container
            const imgContainer = document.createElement("div");
            imgContainer.classList.add("img-container");

            const img = document.createElement("img");
            img.src = postcard.image;
            img.alt = postcard.name;
            // Set current index when image is clicked
            img.onclick = () => openModal(index);
            imgContainer.appendChild(img);

            // Add tag in gallery (if available)
            const tagDiv = document.createElement("div");
            tagDiv.classList.add("tag");

            let tagText = "";

            if (postcard.tag && postcard.tag.length > 0) {
                tagText += postcard.tag.slice().sort().join(", ");
                if (postcard.cards > 1) {
                    tagText += " | " + postcard.cards + "×";
                }
            } else if (postcard.cards > 1) {
                tagText += postcard.cards + "×";
            }

            if (tagText) {
                tagDiv.textContent = tagText;
                imgContainer.appendChild(tagDiv);
            }

            const caption = document.createElement("figcaption");
            caption.textContent = postcard.name;

            figure.appendChild(imgContainer);
            figure.appendChild(caption);
            container.appendChild(figure);
        });

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
    document.getElementById("modalTagBox").textContent = Array.isArray(postcard.tag) ? postcard.tag.slice().sort().join(", ") : "";
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
