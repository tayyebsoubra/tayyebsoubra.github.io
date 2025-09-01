import { supabase } from './supabaseClient.js';

async function loadQuestion() {
  const teamId = localStorage.getItem("teamId");
  if (!teamId) {
    // Save redirect link if not logged in
    const currentUrl = window.location.href;
    window.location.href = `index.html?redirect=${encodeURIComponent(currentUrl)}`;
    return;
  }

  // Check cooldown
  const { data: team } = await supabase.from("teams").select("*").eq("id", teamId).single();
  if (team.last_attempt) {
    const last = new Date(team.last_attempt);
    const now = new Date();
    const diff = (now - last) / 1000;
    if (diff < 300) {
      document.getElementById("status").textContent =
        "Cooldown active, wait " + (300 - Math.floor(diff)) + "s";
      return;
    }
  }

  // Get question id from URL (for QR links)
  const params = new URLSearchParams(window.location.search);
  const qid = params.get("id");

  let data = null;
  if (qid) {
    // Convert to integer before querying
    const qidInt = parseInt(qid, 10);
    const { data: question, error } = await supabase
      .from("questions")
      .select("*")
      .eq("id", qidInt)
      .single();
    if (error) {
      console.error("Error loading question:", error);
      document.getElementById("status").textContent = "Question not found.";
      return;
    }
    data = question;
  } else {
    // Default: load the first question
    const { data: question, error } = await supabase
      .from("questions")
      .select("*")
      .order("id", { ascending: true })
      .limit(1)
      .single();
    if (error) {
      console.error("Error loading question:", error);
      document.getElementById("status").textContent = "No questions available.";
      return;
    }
    data = question;
  }

  if (data) {
    // Collect all available options (up to 12)
    const options = [];
    for (let i = 1; i <= 12; i++) {
      const opt = data[`option_${i}`];
      if (opt) options.push(opt);
    }

    // Shuffle options
    options.sort(() => Math.random() - 0.5);

    const box = document.getElementById("questionBox");
    box.innerHTML =
      `<h2>${data.question}</h2>` +
      options.map((opt) => `<button class='option'>${opt}</button>`).join("");

    document.querySelectorAll(".option").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (btn.textContent === data.correct_option) {
          window.location.href = "upload.html";
        } else {
          await supabase
            .from("teams")
            .update({ last_attempt: new Date().toISOString() })
            .eq("id", teamId);
          document.getElementById("status").textContent =
            "Wrong answer. 5 min cooldown.";
          document.querySelectorAll(".option").forEach((b) => (b.disabled = true)); // disable all buttons
        }
      });
    });
  }
}
loadQuestion();
