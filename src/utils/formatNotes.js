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
    };
  });
}

export function getFormattedDate(created_at) {
  const date = new Date(created_at);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getShortFormattedDate(created_at) {
  const date = new Date(created_at);
  return date
    .toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    .toLowerCase();
}

export function dateToLocale(date) {
  if (!(date instanceof Date)) {
    date = date ? new Date(date) : new Date();
  }
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  // Format the date as yyyy-mm-dd
  const formattedDate = year + "-" + month + "-" + day;

  return formattedDate;
}
