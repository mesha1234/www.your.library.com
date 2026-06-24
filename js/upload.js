import { supabase } from "./supabase.js";

// 🔥 Firebase Auth (SAFE SETUP)
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { app } from "../firebase/firebase-config.js";

const auth = getAuth(app);

// 👤 Store logged-in user email
let userEmail = "guest";

// ✅ Always detect login state
onAuthStateChanged(auth, (user) => {
    if (user) {
        userEmail = user.email;
        console.log("Logged in as:", userEmail);
    } else {
        console.log("No user logged in");
    }
});

// 🔔 Toast function
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");

    if (!toast) {
        console.error("Toast element missing");
        return;
    }

    toast.textContent = message;
    toast.className = "toast show " + type;

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// 🚀 Upload logic
document.getElementById("uploadBtn").addEventListener("click", async function (event) {

    event.preventDefault();

    console.log("Upload button clicked");

    const file = document.getElementById("pdfFile").files[0];
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const category = document.getElementById("category").value;

    const button = document.getElementById("uploadBtn");

    // 🎯 Validation
    if (!file) {
        showToast("Please select a file ❌", "error");
        return;
    }

    if (!title || !description) {
        showToast("Fill all fields ❌", "error");
        return;
    }

    if (userEmail === "guest") {
        showToast("Please login first ❌", "error");
        return;
    }

    try {
        // 🔄 Button loading state
        button.disabled = true;
        button.textContent = "Uploading...";

        // 📂 Unique filename
        const fileName = Date.now() + "-" + file.name;

        // 📤 Upload file
        const { error: uploadError } = await supabase.storage
            .from("Books")
            .upload(fileName, file);

        if (uploadError) {
            console.error(uploadError);
            showToast("File upload failed ❌", "error");

            button.disabled = false;
            button.textContent = "Submit for Approval";
            return;
        }

        // 🔗 Get public URL
        const { data: urlData } = supabase.storage
            .from("Books")
            .getPublicUrl(fileName);

        const pdfUrl = urlData.publicUrl;

        // 💾 Save to database
        const { error: dbError } = await supabase
            .from("Books")
            .insert([
                {
                    title: title,
                    description: description,
                    category: category,
                    pdf_url: pdfUrl,
                    status: "pending",
                    user_email: userEmail
                }
            ]);

        if (dbError) {
            console.error(dbError);
            showToast("Saved file but DB failed ❌", "error");

            button.disabled = false;
            button.textContent = "Submit for Approval";
            return;
        }

        // 🎉 Success
        showToast("Uploaded successfully 🎉", "success");

        // 🔄 Reset form
        document.getElementById("title").value = "";
        document.getElementById("description").value = "";
        document.getElementById("pdfFile").value = "";

        button.disabled = false;
        button.textContent = "Submit for Approval";

    } catch (err) {
        console.error(err);
        showToast("Something went wrong ❌", "error");

        button.disabled = false;
        button.textContent = "Submit for Approval";
    }
});
console.log("Upload JS running...");
onAuthStateChanged(auth, (user) => {
    console.log("Auth state changed:", user);

    if (user) {
        userEmail = user.email;
        console.log("Logged in as:", userEmail);
    } else {
        console.log("No user logged in");
    }
});