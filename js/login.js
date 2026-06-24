// 🔥 Firebase imports
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { app } from "../firebase/firebase-config.js";

// 🔥 Supabase
import { supabase } from "./supabase.js";

const auth = getAuth(app);

// 🎯 LOGIN BUTTON
const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
    loginBtn.addEventListener("click", async () => {

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        if (!email || !password) {
            alert("Please fill all fields");
            return;
        }

        try {
            // 🔐 Firebase Login
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            const user = userCredential.user;

            console.log("Logged in:", user.email);

            // 🔥 Create profile if not exists
            await createProfile(user);

            // ✅ Redirect to dashboard
            window.location.href = "../pages/dashboard.html";

        } catch (error) {
            console.error(error);
            alert("Login failed: " + error.message);
        }

    });
}


// 🚀 CREATE PROFILE (USERNAME SYSTEM)
async function createProfile(user) {

    try {
        const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.uid)
            .single();

        // ❗ If profile does NOT exist → create it
        if (!data) {

            const username = user.email.split("@")[0];

            await supabase.from("profiles").insert([
                {
                    id: user.uid,
                    email: user.email,
                    username: username
                }
            ]);

            console.log("Profile created:", username);
        }

    } catch (error) {
        console.log("Profile check error (normal if new user):", error.message);
    }
}