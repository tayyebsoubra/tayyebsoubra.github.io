import { supabase } from './supabaseClient.js';

// Ensure DOM is loaded before attaching event
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const teamInput = document.getElementById("teamName");
  const passwordInput = document.getElementById("password");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const teamName = teamInput.value;
    const password = passwordInput.value;

    console.log("Login attempt:", { teamName, password });

    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .eq("team_name", teamName)
      .eq("password", password)
      .maybeSingle();

    console.log("Supabase response:", { data, error });

    if (error) {
      document.getElementById("status").textContent = "Error: " + error.message;
      return;
    }

    if (!data) {
      document.getElementById("status").textContent = "Invalid login (no match found)";
      return;
    }

    localStorage.setItem("teamId", data.id);
    document.getElementById("status").textContent = "Login successful! Redirecting...";

    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");

    setTimeout(() => {
      window.location.href = redirect || "question.html";
    }, 1000);
  });
});
