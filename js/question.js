import { supabase } from './supabaseClient.js';

async function recordAttempt(teamId, questionId) {
  const { data, error } = await supabase
    .from("team_questions")
    .update({
      attempted: true,
      last_attempt: new Date().toISOString()
    })
    .eq("team_id", teamId)
    .eq("question_id", questionId);

  if (error) {
    console.error("Error saving attempt:", error);
  } else {
    console.log("Attempt recorded:", data);
  }
}

async function loadQuestion() {
  const teamId = localStorage.getItem("teamId");
  if (!teamId) {
    const currentUrl = window.location.href;
    window.location.href = `index.html?redirect=${encodeURIComponent(currentUrl)}`;
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const quuid = params.get("q");
  if (!quuid) {
    document.getElementById("status").textContent = "No question provided.";
    return;
  }

  // Load question by UUID
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

  const questionId = question.id;

  // ✅ Check if team is assigned this question
  const { data: teamQ, error: tqError } = await supabase
    .from("team_questions")
    .select("*")
    .eq("team_id", teamId)
    .eq("question_id", questionId)
    .single();

  if (tqError || !teamQ) {
    document.getElementById("status").textContent = "You are not allowed to attempt this question.";
    return;
  }

  // ✅ Check cooldown
  if (teamQ.last_attempt) {
    const last = new Date(teamQ.last_attempt);
    const now = new Date();
    const diff = (now - last) / 1000;
    if (diff < 300) {
      document.getElementById("status").textContent =
        "Cooldown active, wait " + (300 - Math.floor(diff)) + "s";
      return;
    }
  }

  // Shuffle options
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
        await recordAttempt(teamId, questionId);
        document.getElementById("status").textContent =
          "Wrong answer. 5 min cooldown.";
        document.querySelectorAll(".option").forEach((b) => (b.disabled = true));
      }
    });
  });
}

loadQuestion();
