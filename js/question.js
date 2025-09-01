import { supabase } from './supabaseClient.js';

async function loadQuestion() {
  const teamId = localStorage.getItem("teamId");
  if (!teamId) {
    window.location.href = "index.html";
    return;
  }

  // Check cooldown
  const { data: team } = await supabase.from("teams").select("*").eq("id", teamId).single();
  if (team.last_attempt) {
    const last = new Date(team.last_attempt);
    const now = new Date();
    const diff = (now - last) / 1000;
    if (diff < 300) {
      const remaining = 300 - Math.floor(diff);
      document.getElementById("status").textContent = "Cooldown active, wait " + remaining + "s";
      disableOptions();
      return;
    }
  }

  const { data } = await supabase.from("questions").select("*").limit(1).single();
  if (data) {
    // Collect all non-null options
    const options = [
      data.option_a, data.option_b, data.option_c, data.option_d,
      data.option_e, data.option_f, data.option_g, data.option_h,
      data.option_i, data.option_j, data.option_k, data.option_l
    ].filter(opt => opt !== null && opt !== "");

    // Shuffle
    options.sort(() => Math.random() - 0.5);

    const box = document.getElementById("questionBox");
    box.innerHTML = `<h2>${data.question}</h2>` + options.map(opt =>
      `<button class='option'>${opt}</button>`).join("");

    document.querySelectorAll(".option").forEach(btn => {
      btn.addEventListener("click", async () => {
        // Check cooldown again before processing
        const { data: freshTeam } = await supabase.from("teams").select("*").eq("id", teamId).single();
        if (freshTeam.last_attempt) {
          const last = new Date(freshTeam.last_attempt);
          const now = new Date();
          const diff = (now - last) / 1000;
          if (diff < 300) {
            const remaining = 300 - Math.floor(diff);
            document.getElementById("status").textContent = "Cooldown active, wait " + remaining + "s";
            disableOptions();
            return;
          }
        }

        if (btn.textContent === data.correct_option) {
          window.location.href = "upload.html";
        } else {
          await supabase.from("teams").update({ last_attempt: new Date().toISOString() }).eq("id", teamId);
          document.getElementById("status").textContent = "Wrong answer. 5 min cooldown.";
          disableOptions();
        }
      });
    });
  }
}

function disableOptions() {
  document.querySelectorAll(".option").forEach(btn => {
    btn.disabled = true;
    btn.classList.add("opacity-50", "cursor-not-allowed");
  });
}

loadQuestion();
