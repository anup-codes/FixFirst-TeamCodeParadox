
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
  import { getAuth, signOut, onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

  import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { doc, updateDoc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";



  const firebaseConfig = {
    apiKey: "AIzaSyCfSUC1gtTe7l-vqLckcaYbuunj3QC_Vu4",
    authDomain: "fixfirst-6dfc4.firebaseapp.com",
    projectId: "fixfirst-6dfc4",
    storageBucket: "fixfirst-6dfc4.firebasestorage.app",
    messagingSenderId: "736565909662",
    appId: "1:736565909662:web:4cfcf7dc795681c276438f"
  };

  const ADMIN_EMAIL = "anup2812007@gmail.com"; 
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

 const issueForm = document.getElementById("issueForm");
 const logoutBtn = document.querySelector(".logout-button");
 

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    const isAdmin = user.email === ADMIN_EMAIL;
    loadIssues(isAdmin);
  }
});


  logoutBtn.addEventListener("click", () => {
    signOut(auth)
      .then(() => {
        window.location.href = "login.html";
      })
      .catch((error) => {
        alert(error.message);
      });
  });

    let issues = [];

    // ============================================
    // PRIORITY SCORING LOGIC
    // ============================================
    // This function assigns a priority score based on category
    // Easy to understand and edit for future changes
    function getPriorityScore(category) {
      const priorityMap = {
        'Water': 3,      // Highest Priority - Essential for health
        'Electricity': 2, // Medium-High - Safety concern
        'Road': 1,        // Medium - Affects mobility
        'Garbage': 0      // Low - Cleanliness issue
      };
      return priorityMap[category] || 0;
    }

    function getPriorityLabelFromScore(score) {
      if (score >= 3) return "High";
      if (score >= 2) return "Medium";
      if (score >= 1) return "Low";
      return "Low";
    }

    // Function to get priority label for display
    function getPriorityLabel(score) {
      if (score >= 3) return 'High';
      if (score >= 2) return 'Medium-High';
      if (score >= 1) return 'Medium';
      return 'Low';
    }
   
    issueForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const title = document.getElementById("issueTitle").value.trim();
  const category = document.getElementById("issueCategory").value;
  const description = document.getElementById("issueDescription").value.trim();

  if (!title || !category || !description) {
    alert("Please fill all fields");
    return;
  }

  const user = auth.currentUser;

  try {
    await addDoc(collection(db, "issues"), {
      title: title,
      category: category,
      description: description,
      priorityScore: getPriorityScore(category),
      priorityLabel: getPriorityLabel(getPriorityScore(category)),
      status: "Open",
      createdAt: new Date(),
      userId: user.uid,
      userEmail: user.email
    });

    alert("Issue submitted successfully ✅");
    issueForm.reset();

    const isAdmin = user.email === ADMIN_EMAIL;
    loadIssues(isAdmin);

  } catch (error) {
    console.error(error);
    alert("Error submitting issue");
  }
  
});

    // ============================================
    // DISPLAY ISSUES IN DASHBOARD
    // ============================================
  

  function displayIssues(isAdmin) {
   const issuesList = document.getElementById("issuesList");

   if (issues.length === 0) {
    issuesList.innerHTML = "<p>No issues found.</p>";
    return;
  }

  issuesList.innerHTML = issues.map(issue => {

    let statusClass = "status-open";
    let statusText = "🔴 Open";

    if (issue.status === "In Progress") {
      statusClass = "status-progress";
      statusText = "🟡 In Progress";
    }

    if (issue.status === "Resolved") {
      statusClass = "status-resolved";
      statusText = "🟢 Resolved";
    }

    return `
      <div class="issue-card">
        <div class="issue-header">
          <h3>
            ${issue.title}
            ${isAdmin ? `<span class="admin-badge">ADMIN</span>` : ""}
          </h3>

          <span class="status-badge ${statusClass}">
            ${statusText}
          </span>
        </div>

        <p><strong>Category:</strong> ${issue.category}</p>
        <p><strong>Description:</strong> ${issue.description}</p>
        <p><strong>Priority:</strong> ${issue.priorityLabel}</p>

        ${
          isAdmin && issue.status !== "Resolved"
            ? `<button class="resolve-btn" data-id="${issue.id}">
                 ✅ Resolve Issue
               </button>`
            : ""
        }
      </div>
    `;
  }).join("");

  
  if (isAdmin) {
    document.querySelectorAll(".resolve-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        resolveIssue(btn.dataset.id);
      });
    });
  }
}


    // ============================================
    // UTILITY FUNCTION: Escape HTML to prevent XSS
    // ============================================
    function escapeHtml(text) {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return text.replace(/[&<>"']/g, m => map[m]);
    }

    // ============================================
    // INITIAL LOAD
    // ============================================
    // Display empty dashboard on page load
    displayIssues();



async function resolveIssue(issueId) {
  try {
    const issueRef = doc(db, "issues", issueId);

    await updateDoc(issueRef, {
      status: "Resolved"
    });

    alert("Issue marked as Resolved 🟢");

    const user = auth.currentUser;
    const isAdmin = user.email === ADMIN_EMAIL;
    loadIssues(isAdmin);

  } catch (error) {
    console.error("Error resolving issue:", error);
  }
}


async function loadMyIssues() {
  const user = auth.currentUser;
  if (!user) return;

  issues = []; // purana data clear

  const q = query(
    collection(db, "issues"),
    where("userId", "==", user.uid)
  );

  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    issues.push(doc.data());
  });

  displayIssues(); // existing function
}


async function loadIssues(isAdmin) {
  issues = [];

  let q;
  if (isAdmin) {
    // Admin → sab issues
    q = collection(db, "issues");
  } else {
    // User → sirf apne issues
    q = query(
      collection(db, "issues"),
      where("userId", "==", auth.currentUser.uid)
    );
  }

  const snapshot = await getDocs(q);
  snapshot.forEach(doc => {
    issues.push({ id: doc.id, ...doc.data() });
  });

  displayIssues(isAdmin);
  console.log("Reloading issues, admin:", isAdmin);

}


