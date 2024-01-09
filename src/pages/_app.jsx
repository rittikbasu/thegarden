import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import clsx from "clsx";
import { VectorStorage } from "vector-storage";
import { useCompletion } from "ai/react";

import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Particles from "@/components/Particles";
import AddNoteButton from "@/components/NoteButton";
import { db } from "@/utils/db";
import { getFormattedDate } from "@/utils/formatNotes";
import { createMessages } from "@/utils/createMessages";

import "@/styles/globals.css";
import favicon from "../../public/icon.png";
import { Poppins, Work_Sans } from "next/font/google";

const poppins = Poppins({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["100", "200", "400", "500", "600", "700"],
});

const workSans = Work_Sans({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-work-sans",
  weight: ["200", "300", "400", "500", "600", "700"],
});

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [previousPath, setPreviousPath] = useState("");
  const [postBtnOpacity, setPostBtnOpacity] = useState("opacity-100");
  const [postBtnAnimation, setPostBtnAnimation] = useState(true);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const today = new Date();
  const { complete } = useCompletion({
    api: "/api/completion",
  });

  useEffect(() => {
    const onScroll = () => {
      const currentScrollTop =
        window.scrollY || document.documentElement.scrollTop;
      if (currentScrollTop > lastScrollTop) {
        setPostBtnOpacity("opacity-30 lg:opacity-100");
        setPostBtnAnimation(false);
      } else {
        setPostBtnOpacity("opacity-100");
        setPostBtnAnimation(true);
      }
      setLastScrollTop(currentScrollTop <= 0 ? 0 : currentScrollTop);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, [lastScrollTop]);

  useEffect(() => {
    const last7DaysReflection = async () => {
      const last7DaysReflectionDate = await db.reflections
        .where("type")
        .equals("last7Days")
        .toArray();
      if (
        last7DaysReflectionDate.length !== 0 &&
        last7DaysReflectionDate[0].date === today.toLocaleDateString("en-CA")
      )
        return;
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const result = await db.notes
        .where("created_at")
        .between(sevenDaysAgo.toISOString(), today.toISOString())
        .toArray();
      console.log(result);
      if (result.length !== 0) {
        const prompt =
          "Given below are the journal entries from the last 7 days. Write a smart and concise summary reflecting on what I've been up to with the heading `Here's a summary of what you've been up to` and provide deep insights and recommendations based on these entries starting with `Here are some insights and recommendations`.";
        const messages = createMessages(prompt, result);
        complete({ messages }).then((response) => {
          db.reflections.put({
            type: "last7Days",
            date: today.toLocaleDateString("en-CA"),
            text: response,
          });
        });
      }
      return result;
    };
    last7DaysReflection();
  }, []);

  useEffect(() => {
    let intervalId;
    const vectorStore = new VectorStorage({
      openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });

    const syncNotes = async () => {
      const unsyncedNotes = await db.notes
        .where("sync")
        .equals("false")
        .toArray();
      if (unsyncedNotes.length === 0) return;

      const texts = unsyncedNotes.map((note) => {
        const formattedDate = getFormattedDate(note.created_at);
        return `Date: ${formattedDate}\n${note.text}`;
      });
      const metadatas = unsyncedNotes.map((note) => ({
        id: note.id,
        createdAt: note.created_at,
      }));

      try {
        const response = await vectorStore.addTexts(texts, metadatas);
        console.log(response);
        const updatePromises = unsyncedNotes.map((note) =>
          db.notes.update(note.id, { sync: "true" })
        );
        await Promise.all(updatePromises);
      } catch (error) {
        console.error(error);
      }
    };

    if (typeof window !== "undefined") {
      intervalId = setInterval(syncNotes, 10000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const handleRouteChange = (url) => {
      setPreviousPath(router.asPath);
    };

    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router.asPath, router.events]);

  // const sync = async () => {
  //   const tableLength = await db.notes.count();
  //   if (tableLength === 0) {
  //     await fetchAndStoreData();
  //   }
  // };
  return (
    <div
      className={`max-w-lg mx-auto px-8 ${poppins.variable} ${workSans.variable} font-sans`}
    >
      <Head>
        <link rel="icon" href={favicon.src} />
      </Head>
      <Particles
        className="absolute inset-0 -z-10 animate-fade-in"
        quantity={200}
        // key={router.pathname}
      />
      {router.pathname !== "/post" &&
        !router.pathname.startsWith("/notes") &&
        !router.pathname.startsWith("/note") && (
          <>
            <Header path={router.pathname} />
            <Navbar path={router.pathname} />
            <div
              className={clsx(
                "fixed bottom-20 right-4 z-50 md:right-1/4 xl:right-1/3 max-w-xl",
                postBtnOpacity
              )}
            >
              {/* <Link href="/post" passHref>
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-orange-600">
                  <IoAdd className="w-10 h-10 fill-white" />
                </div>
              </Link> */}
              <AddNoteButton animate={postBtnAnimation} />
            </div>
          </>
        )}
      <Component {...pageProps} previousPath={previousPath} />
    </div>
  );
}
