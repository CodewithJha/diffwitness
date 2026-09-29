const notes = document.getElementById("notes");
const out = document.getElementById("out");
const run = document.getElementById("run");

run.addEventListener("click", async () => {
  out.hidden = false;
  out.textContent = "Writing…";
  const res = await fetch("/brief", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes: notes.value }),
  });
  const data = await res.json();
  out.textContent = JSON.stringify(data, null, 2);
});
