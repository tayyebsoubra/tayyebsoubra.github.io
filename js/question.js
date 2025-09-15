import { supabase } from './supabaseClient.js';

const COOLDOWN_SECONDS = 300; // 5 min

async function loadQuestion() {
  const teamId = localStorage.getItem("teamId");
  if (!teamId) {
    const currentUrl = window.location.href;
    window.location.href = `index.html?redirect=${encodeURIComponent(currentUrl)}`;
    return;
  }

  // Get question id from URL
  const params = new URLSearchParams(window.location.search);
  const qid = params.get("id");
  if (!qid) {
    document.getElementById("status").textContent = "No question specified.";
    return;
  }
  const qidInt = parseInt(qid, 10);

  // Check cooldown for THIS question
  const { data: attempt } = await supabase
    .from("team_attempts")
    .select("last_attempt")
    .eq("team_id", teamId)
    .eq("question_id", qidInt)
    .single();

  if (attempt?.last_attempt) {
    const last = new Date(attempt.last_attempt);
    const now = new Date();
    const diff = (now - last) / 1000;
    if (diff < COOLDOWN_SECONDS) {
      document.getElementById("status").textContent =
        `Cooldown active for this question, wait ${COOLDOWN_SECONDS - Math.floor(diff)}s`;
      return;
    }
  }

  // Load the question
  const { data: question, error } = await supabase
    .from("questions")
    .select("*")
    .eq("id", qidInt)
    .single();

  if (error || !question) {
    console.error("Error loading question:", error);
    document.getElementById("status").textContent = "Question not found.";
    return;
  }

  // Collect all options
  const options = [];
  for (let i = 1; i <= 12; i++) {
    const opt = question[`option_${i}`];
    if (opt) options.push(opt);
  }
  options.sort(() => Math.random() - 0.5);

  const box = document.getElementById("questionBox");
  box.innerHTML =
    `<h2>${question.question}</h2>` +
    options.map((opt) => `<button class='option'>${opt}</button>`).join("");

  document.querySelectorAll(".option").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (btn.textContent === question.correct_option) {
        window.location.href = "upload.html";
      } else {
        // Save cooldown for THIS team & THIS question
        const now = new Date().toISOString();
        await supabase
          .from("team_attempts")
          .upsert([
            { team_id: teamId, question_id: qidInt, last_attempt: now }
          ], { onConflict: ["team_id", "question_id"] });

        document.getElementById("status").textContent =
          "Wrong answer. 5 min cooldown for this question.";
        document.querySelectorAll(".option").forEach((b) => (b.disabled = true));
      }
    });
  });
}

loadQuestion();
