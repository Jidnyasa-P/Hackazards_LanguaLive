document.addEventListener("DOMContentLoaded", () => {
    console.log("LanguaLive loaded 🚀");
  
    const db = firebase.firestore();
    const auth = firebase.auth();
  
    const translateBtn = document.getElementById("translateBtn");
    const micBtn = document.getElementById("micBtn");
    const inputText = document.getElementById("inputText");
    const outputText = document.getElementById("outputText");
    const fromLang = document.getElementById("fromLang");
    const toLang = document.getElementById("toLang");
    const logoutBtn = document.getElementById("logoutBtn");
  
    // 🔓 Show/Hide Logout Button
    auth.onAuthStateChanged(user => {
      if (user) {
        console.log("User logged in:", user.email);
        if (logoutBtn) logoutBtn.style.display = "inline-block";
      } else {
        if (logoutBtn) logoutBtn.style.display = "none";
      }
    });
  
    // 🔒 Logout Functionality
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        auth.signOut().then(() => {
          console.log("Logged out successfully");
          window.location.href = "index.html";
        }).catch((error) => {
          console.error("Logout error:", error.message);
        });
      });
    }
  
    // 🎤 Microphone Speech-to-Text
    if (micBtn) {
      micBtn.addEventListener("click", () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
          alert("Speech Recognition not supported in your browser!");
          return;
        }
  
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = fromLang.value === "en" ? "en-US" : fromLang.value;
        recognition.start();
  
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          inputText.value = transcript;
          console.log("Recognized text:", transcript);
        };
  
        recognition.onerror = (event) => {
          console.error("Speech Recognition error:", event.error);
          alert("Speech recognition error: " + event.error);
        };
      });
    }
  
    // 🌍 Translate Text
    if (translateBtn) {
      translateBtn.addEventListener("click", async () => {
        const input = inputText.value.trim();
        const sourceLang = fromLang.value;
        const targetLang = toLang.value;
  
        if (!input) {
          alert("Please enter some text to translate!");
          return;
        }
  
        outputText.innerText = "Translating...";
  
        try {
          const translated = await callGroqAPI(input, sourceLang, targetLang);
          outputText.innerText = translated;
  
          // ✅ Save to Firestore if user logged in
          const user = auth.currentUser;
          if (user) {
            await db.collection("translations").add({
              uid: user.uid,
              input,
              output: translated,
              from: sourceLang,
              to: targetLang,
              timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log("Translation saved to Firestore.");
            loadHistory(user.uid);  // 🔥 Immediately refresh translation history
          }
  
        } catch (error) {
          console.error("Translation error:", error);
          outputText.innerText = "An error occurred. Please try again!";
        }
      });
    }
    async function loadHistory(uid) {
      try {
        const snapshot = await db.collection("translations")
          .where("uid", "==", uid)
          .orderBy("timestamp", "desc")
          .limit(5)  // 🔥 Show last 5 translations
          .get();
    
        const historyList = document.getElementById("historyList");
        historyList.innerHTML = ""; // Clear old history
    
        if (snapshot.empty) {
          historyList.innerHTML = "<li>No translations yet.</li>";
        } else {
          snapshot.forEach(doc => {
            const data = doc.data();
            const listItem = document.createElement("li");
            listItem.innerHTML = `<strong>${data.input}</strong> → ${data.output}`;
            historyList.appendChild(listItem);
          });
        }
      } catch (error) {
        console.error("Failed to load history:", error);
      }
    }
    
  
    // 📦 Groq API Call
    async function callGroqAPI(inputText, fromLang, toLang) {
      const GROQ_API_KEY = "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"; // 🛑 Replace with your real key!
  
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile", // ✅ Correct model name
            messages: [
              {
                role: "system",
                content: "You are a helpful translator."
              },
              {
                role: "user",
                content: `Translate the following text from ${fromLang} to ${toLang}: "${inputText}"`
              }
            ]
          })
        });
  
        if (!response.ok) {
          const errorBody = await response.json();
          console.error("Groq API error body:", errorBody);
          throw new Error(`Groq API error: ${response.status}`);
        }
  
        const data = await response.json();
        console.log("Groq API response:", data);
  
        return data.choices[0].message.content.trim();
      } catch (error) {
        console.error("Groq API call failed:", error);
        throw error;
      }
    }
    auth.onAuthStateChanged(user => {
      if (user) {
        loadHistory(user.uid); // 🔥 Load history when dashboard opens
      }
    });    
  });
  