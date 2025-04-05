document.addEventListener("DOMContentLoaded", function () {
    fetch('assets/header.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById("header-container").innerHTML = html;
            // If window.pageTitle is defined, update the header title
            if (window.pageTitle) {
                document.getElementById("fotw-header-title").textContent = window.pageTitle;
            }
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
