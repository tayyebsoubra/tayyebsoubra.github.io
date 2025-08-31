import { supabase } from './supabaseClient.js';

document.getElementById("uploadBtn").addEventListener("click", async () => {
  const file = document.getElementById("videoFile").files[0];
  const team = localStorage.getItem("team");

  if (file && file.size <= 20 * 1024 * 1024) {
    const { data, error } = await supabase.storage
      .from("videos")
      .upload(`${team}_${Date.now()}.mp4`, file);

    if (error) {
      document.getElementById("uploadStatus").textContent = "Upload failed: " + error.message;
    } else {
      document.getElementById("uploadStatus").textContent = "Upload complete!";
    }
  } else {
    document.getElementById("uploadStatus").textContent = "File too large.";
  }
});
