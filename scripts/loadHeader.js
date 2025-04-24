document.addEventListener("DOMContentLoaded", function () {
    fetch('../assets/header.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById("header-container").innerHTML = html;
            // If window.pageTitle is defined, update the header title
            if (window.pageTitle) {
                let title = window.pageTitle;
                if (typeof postcardsData !== "undefined" && Array.isArray(postcardsData) && postcardsData.length > 0) {
                    title = `${window.pageTitle} (${postcardsData.length} Cards)`;
                }
                document.getElementById("fotw-header-title").textContent = title;
            }
            const links = document.querySelectorAll("a.keep-query");
            links.forEach(link => {
                const url = new URL(link.href);
                url.search = window.location.search;
                link.href = url.toString();
            });


        })
        .catch(error => console.error("Error loading header:", error));
});

// document.addEventListener("DOMContentLoaded", function () {
//     const menuToggle = document.getElementById("fotw-menu-toggle");
//     const navMenu = document.querySelector(".fotw-header-right nav");

//     menuToggle.addEventListener("click", function () {
//         navMenu.classList.toggle("active");
//     });
// });
