let postcardsData = [];
let currentIndex = 0;

// Retrieve URL parameters for 'ns' and 'sh'
const urlParams = new URLSearchParams(window.location.search);

// ns: tags to exclude (if sh is not present)
const nsParamRaw = urlParams.get('ns');
const nsTags = nsParamRaw ? nsParamRaw.split(',').map(tag => tag.trim().toLowerCase()) : [];

// sh: tags to include; if present, only postcards with a tag in this list are shown
const shParamRaw = urlParams.get('sh');
const shTags = shParamRaw ? shParamRaw.split(',').map(tag => tag.trim().toLowerCase()) : [];

fetch("assets/data/postcards.json")
    .then(response => response.json())
    .then(data => {
        // Filtering logic:
        // - Exclude postcards with cards <= 0.
        // - If shTags is non-empty, only include postcards whose tag (lowercase) is in shTags.
        // - Otherwise, exclude postcards whose tag is in nsTags.
        if (shTags.length > 0) {
            postcardsData = data.filter(postcard => {
                return postcard.cards > 0 && postcard.tag && shTags.includes(postcard.tag.toLowerCase());
            });
        } else {
            postcardsData = data.filter(postcard => {
                if (postcard.cards <= 0) return false;
                const tagLower = postcard.tag ? postcard.tag.toLowerCase() : "";
                if (nsTags.includes(tagLower)) return false;
                return true;
            });
        }

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
            if (postcard.tag) {
                tagDiv.textContent = postcard.tag + " | " + postcard.cards + "×";
            }
            else {
                tagDiv.textContent = postcard.cards + "×";
            }
            imgContainer.appendChild(tagDiv);

            const caption = document.createElement("figcaption");
            caption.textContent = postcard.name;

            figure.appendChild(imgContainer);
            figure.appendChild(caption);
            container.appendChild(figure);
        });
    })
    .catch(error => console.error("Error loading postcards:", error));

function openModal(index) {
    currentIndex = index;
    const postcard = postcardsData[currentIndex];
    document.getElementById("modalImage").src = postcard.image;
    document.getElementById("modalCaption").textContent = postcard.name;
    document.getElementById("modalTagBox").textContent = postcard.tag || "";
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
