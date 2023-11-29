import Head from "next/head";
import { createClient } from "@supabase/supabase-js";

const Reflect = ({ totalPosts, postsThisMonth }) => {
  return (
    <div>
      <Head>
        <title>reflect - the garden</title>
      </Head>
      <p className="flex justify-between text-sm mx-2 text-zinc-400">
        <span>entries this month: {postsThisMonth}</span>
        <span>total entries: {totalPosts}</span>
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

  const currentMonth = new Date().getMonth() + 1;
  const postsThisMonth = data.filter((post) => {
    const postMonth = new Date(post.created_at).getMonth() + 1;
    return postMonth === currentMonth;
  }).length;

  return {
    props: {
      totalPosts,
      postsThisMonth,
    },
  };
}

export default Reflect;
