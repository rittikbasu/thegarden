export function formatNotes(data) {
  return data.map((entry) => {
    const timestamp = new Date(entry.created_at);
    return {
      ...entry,
      date: timestamp.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: timestamp.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      text: entry.text.split(" ").slice(0, 50).join(" "),
    };
  });
}