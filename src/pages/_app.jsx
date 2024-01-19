import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import clsx from "clsx";
import { VectorStorage } from "vector-storage";
import { useCompletion } from "ai/react";

import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import AddNoteButton from "@/components/AddNoteButton";
import { db } from "@/utils/db";
import { getFormattedDate, dateToLocale } from "@/utils/formatNotes";
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
        last7DaysReflectionDate[0].date === dateToLocale(today)
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
            date: dateToLocale(today),
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
      console.log(unsyncedNotes);
      const texts = unsyncedNotes.map((note) => {
        const formattedDate = getFormattedDate(note.created_at);
        return `Date: ${formattedDate}\n${note.text}`;
      });
      console.log(texts);
      const metadatas = unsyncedNotes.map((note) => ({
        id: note.id,
        createdAt: note.created_at,
      }));
      console.log(metadatas);

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
      <div className="min-h-screen fixed inset-0 -z-10 w-full bg-black bg-grid-white/[0.07] flex items-center justify-center">
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-zinc-950 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)]"></div>
      </div>
      {router.pathname !== "/post" && !router.pathname.startsWith("/note") && (
        <>
          <Header path={router.pathname} />
          <Navbar path={router.pathname} />
          <div
            className={clsx(
              "fixed bottom-20 right-4 z-50 tab:right-[5%] md:right-[10%] lg:right-[20%] xl:right-[28%] max-w-xl",
              postBtnOpacity
            )}
          >
            <AddNoteButton animate={postBtnAnimation} />
          </div>
        </>
      )}
      <Component {...pageProps} previousPath={previousPath} />
    </div>
  );
}
