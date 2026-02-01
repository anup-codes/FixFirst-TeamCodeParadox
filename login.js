
  // Firebase 

  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
  import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

  const firebaseConfig = {
    apiKey: "AIzaSyCfSUC1gtTe7l-vqLckcaYbuunj3QC_Vu4",
    authDomain: "fixfirst-6dfc4.firebaseapp.com",
    projectId: "fixfirst-6dfc4",
    storageBucket: "fixfirst-6dfc4.firebasestorage.app",
    messagingSenderId: "736565909662",
    appId: "1:736565909662:web:4cfcf7dc795681c276438f"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  const loginToggle = document.getElementById("loginToggle");
  const signupToggle = document.getElementById("signupToggle");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  loginToggle.onclick = () => {
    loginToggle.classList.add("active");
    signupToggle.classList.remove("active");
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
  };

  signupToggle.onclick = () => {
    signupToggle.classList.add("active");
    loginToggle.classList.remove("active");
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
  };

  // Signup
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        alert("Signup successful ✅");
        window.location.href = "index.html";
      })
      .catch(err => alert(err.message));
  });

  // Login
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        window.location.href = "index.html";
      })
      .catch(err => alert(err.message));
  });
