import { app } from "../firebase/firebase-config.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {

    if (user) {

        console.log("Logged in:", user.email);

    } else {

        console.log("Not logged in");

    }

});

<button id="logoutBtn">
    Logout
</button>