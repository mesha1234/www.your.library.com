import { supabase } from "./supabase.js";

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { app } from "../firebase/firebase-config.js";

const auth = getAuth(app);

let uploadCount = 0;
let bookmarkCount = 0;
let chart;

// 🔥 COUNTER ANIMATION
function animateCounter(id, target) {
    const el = document.getElementById(id);
    if (!el) return;

    const duration = 800;
    const startTime = performance.now();

    function update(currentTime) {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const value = Math.floor(progress * target);

        el.textContent = value;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = target;
        }
    }

    requestAnimationFrame(update);
}

// 🔐 AUTH CHECK
onAuthStateChanged(auth, async (user) => {

    if (!user) {
        console.log("No user logged in");
        return;
    }

    const email = user.email;

    // 👋 Welcome text
    const welcome = document.getElementById("welcomeUser");
    if (welcome) {
        welcome.textContent = "Welcome back, " + email;
    }

    // 🚀 LOAD DATA
    await loadUploads(email);
    await loadBookmarks(email);

    // 🎯 RUN COUNTERS AFTER DATA LOAD
  document.getElementById("uploadCount").textContent = uploadCount;
document.getElementById("bookmarkCount").textContent = bookmarkCount;document.getElementById("uploadCount").textContent = uploadCount;
    // 📊 RENDER CHART
    renderChart();
});


// 📚 LOAD UPLOADS
async function loadUploads(email) {

    const { data, error } = await supabase
        .from("Books")
        .select("*")
        .eq("user_email", email)
        .order("created_at", { ascending: false });

    const container = document.getElementById("myBooks");
    if (!container) return;

    container.innerHTML = "";

    if (error) {
        console.error("Upload error:", error);
        container.innerHTML = "<p>Error loading uploads ❌</p>";
        return;
    }

    uploadCount = data.length;

    if (data.length === 0) {
        container.innerHTML = "<p>No uploads yet 📭</p>";
        return;
    }

    data.forEach(book => {

        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
            <h3>📘 ${book.title}</h3>
            <p>${book.description}</p>
            <p>Status: ${book.status}</p>
            <a href="${book.pdf_url}" target="_blank">📖 Open</a>
        `;

        container.appendChild(div);
    });
}


// ❤️ LOAD BOOKMARKS
async function loadBookmarks(email) {

    const { data: bookmarks, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_email", email);

    const container = document.getElementById("myBookmarks");
    if (!container) return;

    container.innerHTML = "";

    if (error) {
        console.error("Bookmark error:", error);
        container.innerHTML = "<p>Error loading bookmarks ❌</p>";
        return;
    }

    bookmarkCount = bookmarks.length;

    if (!bookmarks || bookmarks.length === 0) {
        container.innerHTML = "<p>No bookmarks yet ❤️</p>";
        return;
    }

    const ids = bookmarks.map(b => b.book_id);

    const { data: books, error: booksError } = await supabase
        .from("Books")
        .select("*")
        .in("id", ids);

    if (booksError) {
        console.error("Books fetch error:", booksError);
        return;
    }

    books.forEach(book => {

        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
            <h3>📘 ${book.title}</h3>
            <p>${book.description}</p>
            <a href="${book.pdf_url}" target="_blank">📖 Open</a>
        `;

        container.appendChild(div);
    });
}


// 📊 CHART
function renderChart() {

    const ctx = document.getElementById("myChart");
    if (!ctx) return;

    // Destroy old chart if exists
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Uploads", "Bookmarks"],
            datasets: [{
                data: [uploadCount, bookmarkCount],
                backgroundColor: ["#6D5DFB", "#2EE6D6"],
                borderWidth: 0
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        color: "white"
                    }
                }
            }
        }
    });
}

console.log(document.getElementById("uploadCount"));

