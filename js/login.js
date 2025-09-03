import { supabase } from './supabaseClient.js';

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const teamName = document.getElementById("teamName").value;
  const password = document.getElementById("password").value;

  console.log("Login attempt:", { teamName, password });

  try {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .eq("team_name", teamName)
      .eq("password", password)
      .maybeSingle();   // ✅ safer than .single()

    console.log("Supabase response:", { data, error });

    if (error) {
      document.getElementById("status").textContent = "Error: " + error.message;
      return;
    }

    if (!data) {
      document.getElementById("status").textContent = "Invalid login (no match found)";
      return;
    }

    // Success ✅
    localStorage.setItem("teamId", data.id);
    document.getElementById("status").textContent = "Login successful! Redirecting...";

    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    setTimeout(() => {
      window.location.href = redirect || "question.html";
    }, 1000);

  } catch (err) {
    console.error("Unexpected error:", err);
    document.getElementById("status").textContent = "Unexpected error: " + err.message;
  }
});
