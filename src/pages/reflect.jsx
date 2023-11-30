import Head from "next/head";
import { createClient } from "@supabase/supabase-js";
import Calendar from "react-github-contribution-calendar";

const Reflect = ({ totalPosts, postsThisMonth, postsPerDay }) => {
  const panelColors = [
    "rgba(63, 63, 70, 0.4)",
    "#F78A23",
    "#F87D09",
    "#AC5808",
    "#7B3F06",
  ];
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
  const weekLabelAttributes = {
    style: {
      fontSize: 10,
      fill: "#aaaaaa",
      alignmentBaseline: "central",
    },
  };
  const weekNames = ["", "m", "", "w", "", "f", ""];
  return (
    <div>
      <Head>
        <title>reflect - the garden</title>
      </Head>
      <div className="mt-4 mb-2">
        <Calendar
          values={postsPerDay}
          until="2023-12-31"
          panelColors={panelColors}
          monthNames={monthNames}
          weekNames={weekNames}
          weekLabelAttributes={weekLabelAttributes}
        />
      </div>
      <p className="flex justify-between text-sm mx-2 font-workSans text-zinc-400">
        <span>this month: {postsThisMonth}</span>
        <span>total: {totalPosts}</span>
      </p>
    </div>
  );
};

export async function getStaticProps() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
  const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);
  const { data, error } = await supabase
    .from("thegarden_notes")
    .select("created_at, text");
  const totalPosts = data.length;

  const postsPerDay = {};

  data.forEach((post) => {
    const day = new Date(post.created_at).toISOString().split("T")[0];
    if (!postsPerDay[day]) {
      postsPerDay[day] = 0;
    }
    postsPerDay[day]++;
  });

  const currentMonth = new Date().getMonth() + 1;
  const postsThisMonth = data.filter((post) => {
    const postMonth = new Date(post.created_at).getMonth() + 1;
    return postMonth === currentMonth;
  }).length;

  return {
    props: {
      totalPosts,
      postsThisMonth,
      postsPerDay,
    },
  };
}

export default Reflect;
