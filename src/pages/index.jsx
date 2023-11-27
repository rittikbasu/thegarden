import { useState } from "react";
import Head from "next/head";
import clsx from "clsx";
import Note from "@/components/Note";
import { createClient } from "@supabase/supabase-js";

const entries = [
  {
    id: 1,
    date: "14th Jun 23",
    time: "2:32 pm",
    content:
      "Do you use a mac? I’ll dm you this version if you’d like to use it :)",
  },
  {
    id: 2,
    date: "12th Jun 23",
    time: "6:48 pm",
    content:
      "Hey 👋 it’s a journaling app called Pile, hoping to release it sometime soon",
  },
  {
    id: 3,
    date: "19th Jun 23",
    time: "10:43 am",
    content: "Wow this is cool! Does each...",
  },
  {
    id: 4,
    date: "24th Jun 23",
    time: "11:29 am",
    content:
      "Udara you already know I wanna try it! Hope to hear from you soon! Keep up the from you soon! Keep up the...",
  },
  {
    id: 5,
    date: "24th Jun 23",
    time: "3:45 pm",
    content: "Adding more dummy data for testing purposes",
  },
  {
    id: 6,
    date: "24th Jun 23",
    time: "8:12 am",
    content: "Another entry with the same date but different time",
  },
  {
    id: 7,
    date: "25th Jun 23",
    time: "5:30 pm",
    content: "Yet another dummy entry for testing",
  },
  {
    id: 8,
    date: "26th Jun 23",
    time: "10:00 am",
    content: "Testing, testing, 1, 2, 3",
  },
  {
    id: 9,
    date: "27th Jun 23",
    time: "1:20 pm",
    content: "More dummy data to fill up the journal",
  },
  {
    id: 10,
    date: "28th Jun 23",
    time: "4:45 pm",
    content: "Last entry for testing purposes",
  },
  {
    id: 11,
    date: "29th Jun 23",
    time: "9:30 am",
    content: "Another day, another dummy entry",
  },
  {
    id: 12,
    date: "30th Jun 23",
    time: "7:15 pm",
    content: "Testing the journal app with more data",
  },
  {
    id: 13,
    date: "1st Jul 23",
    time: "11:00 am",
    content: "New month, new dummy entry",
  },
  {
    id: 14,
    date: "2nd Jul 23",
    time: "2:45 pm",
    content: "Another entry for the new month",
  },
];

export default function Home({ notes }) {
  console.log(notes);
  return (
    <div className="bg-black h-screen text-gray-200">
      <Head>
        <title>the garden</title>
      </Head>
      <div className="pb-8">
        {notes.map((note, index) => (
          <div key={note.id} className="relative">
            <Note
              id={note.id}
              date={note.date}
              time={note.time}
              content={note.text}
              index={index}
              length={notes.length - 1}
              prevDate={index > 0 ? notes[index - 1].date : null}
              nextDate={index < notes.length - 1 ? notes[index + 1].date : null}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
  const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);
  const { data, error } = await supabase.from("thegarden_notes").select("*");

  if (error) {
    console.error("Error fetching journal data:", error);
    return {
      props: {
        notes: [],
      },
    };
  }
  data.forEach((entry) => {
    const timestamp = new Date(entry.created_at);
    entry.date = timestamp.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    entry.time = timestamp.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    entry.text = entry.text.split(" ").slice(0, 50).join(" ");
  });
  return {
    props: {
      notes: data,
    },
  };
}
