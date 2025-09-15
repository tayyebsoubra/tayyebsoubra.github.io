import { supabase } from './supabaseClient.js';

async function recordAttempt(teamId, questionId) {
  const { data, error } = await supabase
    .from("team_attempts")
    .upsert(
      {
        team_id: teamId,
        question_id: questionId,
        last_attempt: new Date().toISOString(),
      },
      { onConflict: ["team_id", "question_id"] }
    );

  if (error) {
    console.error("Error saving attempt:", error);
  } else {
    console.log("Attempt saved:", data);
  }
}

async function loadQuestion() {
  const teamId = localStorage.getItem("teamId");
  if (!teamId) {
    // Save redirect link if not logged in
    const currentUrl = window.location.href;
    window.location.href = `index.html?redirect=${encodeURIComponent(currentUrl)}`;
    return;
  }

  // ✅ Use secure UUID instead of numeric id
  const params = new URLSearchParams(window.location.search);
  const quuid = params.get("q"); // e.g. ?q=3d2c3a2b-...
  if (!quuid) {
    document.getElementById("status").textContent = "No question provided.";
    return;
  }

  // 🔹 Load the question by UUID
  const { data: question, error } = await supabase
    .from("questions")
    .select("*")
    .eq("uuid", quuid)
    .single();

  if (error || !question) {
    console.error("Error loading question:", error);
    document.getElementById("status").textContent = "Question not found.";
    return;
  }

  const questionId = question.id; // numeric ID for team_attempts

  // 🔹 Check cooldown for this (team, question)
  const { data: attempt, error: attemptErr } = await supabase
    .from("team_attempts")
    .select("last_attempt")
    .eq("team_id", teamId)
    .eq("question_id", questionId)
    .maybeSingle();

  if (attempt && attempt.last_attempt) {
    const last = new Date(attempt.last_attempt);
    const now = new Date();
    const diff = (now - last) / 1000;
    if (diff < 300) {
      document.getElementById("status").textContent =
        "Cooldown active, wait " + (300 - Math.floor(diff)) + "s";
      return;
    }
  }

  // Collect and shuffle options
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

  // 🔹 Handle answer clicks
  document.querySelectorAll(".option").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (btn.textContent === question.correct_option) {
        // Correct → go to upload
        window.location.href = "upload.html";
      } else {
        // Wrong → record attempt for cooldown
        await recordAttempt(teamId, questionId);
        document.getElementById("status").textContent =
          "Wrong answer. 5 min cooldown.";
        document.querySelectorAll(".option").forEach((b) => (b.disabled = true));
      }
    });
  });
}

loadQuestion();
