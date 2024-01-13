import React, { useState, useEffect } from "react";
import Calendar from "react-github-contribution-calendar";
import { db } from "@/utils/db";
import { dateToLocale } from "@/utils/formatNotes";

const panelColors = [
  "rgb(20,20,24)",
  "#7B3F06",
  "#AC5808",
  "#F87D09",
  "#fb923c",
];

const panelAttributes = { rx: 2, ry: 2 };

const monthNames = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

const monthLabelAttributes = {
  style: {
    fontSize: 10,
    fill: "#a1a1aa",
    alignmentBaseline: "central",
  },
};

const weekLabelAttributes = {
  style: {
    fontSize: 10,
    fill: "#a1a1aa",
    alignmentBaseline: "central",
  },
};

const weekNames = ["", "m", "", "w", "", "f", ""];

const ContributionGraph = () => {
  const [totalPosts, setTotalPosts] = useState(0);
  const [postsThisMonth, setPostsThisMonth] = useState(0);
  const [postsPerDay, setPostsPerDay] = useState({});
  const today = dateToLocale(new Date());

  const getData = async () => {
    const result = await db.notes
      .orderBy("created_at")
      .toArray()
      .then((notes) => notes.map((note) => note.created_at));

    const totalPosts = result.length;
    const postsPerDay = {};

    result.forEach((post) => {
      const day = dateToLocale(new Date(post));
      if (!postsPerDay[day]) {
        postsPerDay[day] = 0;
      }
      postsPerDay[day]++;
    });
    const currentMonth = new Date().getMonth();
    const postsThisMonth = result.filter((post) => {
      const postMonth = new Date(post).getMonth();
      return postMonth === currentMonth;
    }).length;

    setTotalPosts(totalPosts);
    setPostsThisMonth(postsThisMonth);
    setPostsPerDay(postsPerDay);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="pb-8">
      <p className="flex justify-between text-sm mx-2 text-zinc-400">
        <span>this month: {postsThisMonth}</span>
        <span>total: {totalPosts}</span>
      </p>
      <div className="border border-zinc-800/80 bg-black/30 p-2 rounded-xl  mt-2 mb-2">
        <Calendar
          values={postsPerDay}
          until={today}
          panelColors={panelColors}
          panelAttributes={panelAttributes}
          monthNames={monthNames}
          monthLabelAttributes={monthLabelAttributes}
          weekNames={weekNames}
          weekLabelAttributes={weekLabelAttributes}
        />
      </div>
      <div className="flex items-center text-zinc-400 justify-end mt-2 md:mr-4 mr-2">
        <span className="text-xs">less</span>
        <div className="flex mx-2">
          {panelColors.map((color, index) => (
            <div
              key={index}
              style={{ backgroundColor: color }}
              className={`w-3 h-3 rounded-sm ${
                index < panelColors.length - 1 ? "mr-1" : ""
              }`}
            ></div>
          ))}
        </div>
        <span className="text-xs">more</span>
      </div>
    </div>
  );
};

export default ContributionGraph;
