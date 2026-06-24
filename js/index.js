import { supabase } from "./supabase.js";

async function loadStats() {

    const { count: uploads } = await supabase
        .from("Books")
        .select("*", { count: "exact", head: true });

    const { count: bookmarks } = await supabase
        .from("bookmarks")
        .select("*", { count: "exact", head: true });

    const { data } = await supabase
        .from("Books")
        .select("user_email");

    const users = new Set(data.map(u => u.user_email)).size;

    // 🔥 FORCE UPDATE (NO FAIL VERSION)
    const uploadEl = document.getElementById("uploadStat");
    const userEl = document.getElementById("userStat");
    const bookmarkEl = document.getElementById("bookmarkStat");

    if (uploadEl) uploadEl.innerText = uploads;
    if (userEl) userEl.innerText = users;
    if (bookmarkEl) bookmarkEl.innerText = bookmarks;
}

loadStats();