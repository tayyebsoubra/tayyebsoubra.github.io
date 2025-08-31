import { supabase } from './supabaseClient.js';

document.getElementById("loginBtn").addEventListener("click", async () => {
  const teamName = document.getElementById("teamName").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("team_name", teamName)
    .eq("password", password)
    .single();

  if (data) {
    localStorage.setItem("team", data.team_name);
    localStorage.setItem("teamId", data.id);
    window.location.href = "question.html";
  } else {
    document.getElementById("status").textContent = "Invalid login";
  }
});
