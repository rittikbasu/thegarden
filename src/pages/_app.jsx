import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Particles from "@/components/Particles";
import { fetchAndStoreData, db } from "@/utils/db";

import "@/styles/globals.css";
import favicon from "../../public/icon.png";
import { Poppins, Work_Sans } from "next/font/google";
import { IoAdd } from "react-icons/io5";

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

  useEffect(() => {
    const handleRouteChange = (url) => {
      setPreviousPath(router.asPath);
    };

    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router.asPath, router.events]);

  const sync = async () => {
    const tableLength = await db.notes.count();
    if (tableLength === 0) {
      await fetchAndStoreData();
    }
  };
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
            <div className="fixed bottom-20 right-4 z-50 md:right-1/4 xl:right-1/3 max-w-xl">
              <Link href="/post" passHref>
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-orange-600">
                  <IoAdd className="w-10 h-10 fill-white" />
                </div>
              </Link>
            </div>
          </>
        )}
      <Component {...pageProps} previousPath={previousPath} />
    </div>
  );
}
