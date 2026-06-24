import { supabase } from "./supabase.js";

async function loadPending() {

    const { data, error } = await supabase
        .from("Books")
        .select("*")
        .eq("status", "pending");

    if (error) {
        console.error(error);
        return;
    }

    const container = document.getElementById("adminList");

    container.innerHTML = "";

    data.forEach(book => {

        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
            <h3>${book.title}</h3>
            <p>${book.description}</p>

            <button onclick="approve('${book.id}')">Approve ✅</button>
            <button onclick="reject('${book.id}')">Reject ❌</button>
        `;

        container.appendChild(div);
    });
}

window.approve = async (id) => {

    await supabase
        .from("Books")
        .update({ status: "approved" })
        .eq("id", id);

    loadPending();
};

window.reject = async (id) => {

    await supabase
        .from("Books")
        .delete()
        .eq("id", id);

    loadPending();
};

loadPending();