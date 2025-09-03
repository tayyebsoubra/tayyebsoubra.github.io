import { supabase } from './supabaseClient.js';

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const teamName = document.getElementById("teamName").value;
  const password = document.getElementById("password").value;

  console.log("Attempting login with:", teamName, password); // debug

  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("team_name", teamName)   // ✅ match DB column
    .eq("password", password)
    .single();

  console.log("Supabase result:", { data, error }); // debug

  if (error || !data) {
    document.getElementById("status").textContent = "Invalid login";
  } else {
    localStorage.setItem("teamId", data.id);

    // Optional redirect param
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");

    if (redirect) {
      window.location.href = redirect;
    } else {
      window.location.href = "question.html?id=1";
    }
  }
});
