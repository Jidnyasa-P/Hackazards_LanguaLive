// js/profile.js

document.addEventListener("DOMContentLoaded", () => {
    const auth = firebase.auth();
    const db = firebase.firestore();
  
    const userName = document.getElementById("userName");
    const userEmail = document.getElementById("userEmail");
    const translationCount = document.getElementById("translationCount");
    const logoutBtn = document.getElementById("logoutBtn");
  
    firebase.auth().onAuthStateChanged(async(user) => {
        if (user) {
          document.getElementById("userName").innerText = user.displayName || "No Name";
          document.getElementById("userEmail").innerText = user.email;

            // Fetch number of translations
          const translationsSnapshot = await db.collection("translations")
         .where("uid", "==", user.uid)
         .get();

          translationCount.innerText = `Total Translations: ${translationsSnapshot.size}`;
      
          const profilePic = document.getElementById('profilePic');
          if (user.photoURL) {
            profilePic.src = user.photoURL;
          } else {
            profilePic.src = 'assets/default-profile.png'; // Default image
          }
        } else {
          window.location.href = "index.html"; // Redirect if not logged in
        }
      });
      
  
    // Logout button
    logoutBtn.addEventListener("click", () => {
      auth.signOut()
        .then(() => {
          console.log("User logged out");
          window.location.href = "index.html";
        })
        .catch((error) => {
          console.error("Logout Error:", error.message);
        });
    });
  });
  