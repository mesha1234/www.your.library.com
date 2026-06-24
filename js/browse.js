import { supabase } from "./supabase.js";

// 🔥 Firebase Auth
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { app } from "../firebase/firebase-config.js";
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.className = "toast show " + type;

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

const auth = getAuth(app);

let userEmail = null;
let allBooks = [];

// 👤 Detect user
onAuthStateChanged(auth, (user) => {
    if (user) {
        userEmail = user.email;
        console.log("Logged in as:", userEmail);
    } else {
        console.log("No user logged in");
    }
});


// 📚 LOAD BOOKS
async function loadBooks() {

    const { data, error } = await supabase
        .from("Books")
        .select("*")
        .eq("status", "approved");

    if (error) {
        console.error("Error loading books:", error);
        return;
    }

    console.log("Books loaded:", data);

    allBooks = data;
    displayBooks(data);
    await markExistingBookmarks();
}


// 🎯 DISPLAY BOOKS
function displayBooks(books) {

    const container = document.getElementById("booksList");

    if (!container) {
        console.error("booksList not found");
        return;
    }

    container.innerHTML = "";

    if (books.length === 0) {
        container.innerHTML = "<p>No books found 📭</p>";
        return;
    }

    books.forEach(book => {

        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML =
    "<h3>📘 " + book.title + "</h3>" +
    "<p>" + book.description + "</p>" +
    "<div style='display:flex; gap:10px; margin-top:10px;'>" +
    "<button class='bookmark-btn' id='bm-" + book.id + "' onclick=\"bookmark('" + book.id + "')\">🤍</button>" +
    "<button onclick=\"preview('" + book.pdf_url + "')\">👁️</button>" +
    "<a href='" + book.pdf_url + "' target='_blank'>📖 Open</a>" +
    "</div>";

        container.appendChild(card);
    });
}


// ❤️ BOOKMARK FUNCTION (GLOBAL — ALWAYS WORKS)
window.bookmark = async function (bookId) {

    const btn = document.getElementById("bm-" + bookId);

    if (!userEmail) {
        showToast("Login first ❌", "error");
        return;
    }

    const { data: existing } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_email", userEmail)
        .eq("book_id", bookId)
        .maybeSingle();

    if (existing) {

        // ❌ REMOVE
        const { error } = await supabase
            .from("bookmarks")
            .delete()
            .eq("user_email", userEmail)
            .eq("book_id", bookId);

        if (error) {
            console.error(error);
            showToast("Remove failed ❌", "error");
        } else {
            showToast("Removed 💔", "success");

            btn.textContent = "🤍";
            btn.classList.remove("bookmark-active");
        }

    } else {

        // ❤️ ADD
        const { error } = await supabase
            .from("bookmarks")
            .insert([
                {
                    user_email: userEmail,
                    book_id: bookId
                }
            ]);

        if (error) {
            console.error(error);
            showToast("Bookmark failed ❌", "error");
        } else {
            showToast("Bookmarked ❤️", "success");

            btn.textContent = "❤️";
            btn.classList.add("bookmark-active");
        }
    }
};

// 🔍 SEARCH FUNCTION
document.getElementById("searchInput")?.addEventListener("input", function () {

    const query = this.value.toLowerCase();

    const filtered = allBooks.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.description.toLowerCase().includes(query) ||
        book.category.toLowerCase().includes(query)
    );

    displayBooks(filtered);
});


// 👁️ PREVIEW FUNCTION
window.preview = function (url) {

    const modal = document.createElement("div");
    modal.className = "modal-overlay";

    modal.innerHTML = `
        <div class="modal-content">
            <iframe src="https://docs.google.com/gview?url=${url}&embedded=true"></iframe>
            <button class="close-btn">Close ❌</button>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector(".close-btn").onclick = () => {
        modal.remove();
    };
};


// 🚀 START
loadBooks();


async function markExistingBookmarks() {

    if (!userEmail) return;

    const { data } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_email", userEmail);

    if (!data) return;

    data.forEach(bm => {
        const btn = document.getElementById("bm-" + bm.book_id);
        if (btn) {
            btn.textContent = "❤️";
            btn.classList.add("bookmark-active");
        }
    });
}