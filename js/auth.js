document.addEventListener("DOMContentLoaded", () => {
  console.log("LanguaLive Auth JS Loaded ✅");

  // --- Firebase Initialization --- 
  // Make sure to replace the following with your actual Firebase project configuration
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const auth = firebase.auth();
  const db = firebase.firestore();

  // --- DOM Elements ---
  const authContainer = document.getElementById("authContainer");
  const closeAuth = document.getElementById("closeAuth");

  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const loginSubmit = document.getElementById("loginSubmit");

  const signupName = document.getElementById("signupName");
  const signupEmail = document.getElementById("signupEmail");
  const signupPassword = document.getElementById("signupPassword");
  const signupSubmit = document.getElementById("signupSubmit");

  // --- Event Listeners ---

  // Close Auth Modal
  if (closeAuth) {
    closeAuth.addEventListener("click", () => {
      authContainer.classList.add("hidden");
    });
  }

  // Login
  if (loginSubmit) {
    loginSubmit.addEventListener("click", (e) => {
      e.preventDefault();
      const email = loginEmail.value;
      const password = loginPassword.value;

      auth
        .signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          console.log("Logged in as:", userCredential.user.email);
          window.location.href = "dashboard.html";
        })
        .catch((error) => {
          console.error("Login error:", error.message);
          alert("Login failed: " + error.message);
        });
    });
  }

  // Signup
  if (signupSubmit) {
    signupSubmit.addEventListener("click", async (e) => {
      e.preventDefault(); // Move e.preventDefault() correctly here

      const name = signupName.value;
      const email = signupEmail.value;
      const password = signupPassword.value;

      try {
        const userCredential = await auth.createUserWithEmailAndPassword(
          email,
          password
        );
        console.log("Signed up as:", userCredential.user.email);

        // ✨ Update user's display name immediately
        await userCredential.user.updateProfile({
          displayName: name,
        });

        // ✨ Optional: Save additional user info to Firestore
        await db.collection("users").doc(userCredential.user.uid).set({
          fullName: name,
          email: email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

        console.log("User profile saved with name.");

        window.location.href = "dashboard.html"; // redirect
      } catch (error) {
        console.error("Signup error:", error.message);
        alert("Signup successful");
      }
    });
  }

  // Optional: Show Login / Signup forms (if needed)
  window.showLoginForm = () => {
    signupForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
    authContainer.classList.remove("hidden");
  };

  window.showSignupForm = () => {
    loginForm.classList.add("hidden");
    signupForm.classList.remove("hidden");
    authContainer.classList.remove("hidden");
  };
});
