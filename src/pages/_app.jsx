import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import Tab from "@/components/Tab";
import Particles from "@/components/Particles";
import "@/styles/globals.css";
import { Poppins, Bricolage_Grotesque, Raleway } from "@next/font/google";
import clsx from "clsx";

const poppins = Poppins({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["100", "200", "400", "500", "600", "700"],
});

// const bricolage = Bricolage_Grotesque({
//   display: "swap",
//   subsets: ["latin"],
//   variable: "--font-bricolage",
//   weight: ["400", "500", "600", "700"],
// });

const raleway = Raleway({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-raleway",
  weight: ["200", "300", "400", "500", "600", "700"],
});

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [previousPath, setPreviousPath] = useState("");
  console.log(router.pathname);

  useEffect(() => {
    const handleRouteChange = (url) => {
      setPreviousPath(router.asPath);
    };

    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router.asPath, router.events]);
  return (
    <div
      className={`max-w-lg mx-auto px-8 ${poppins.variable} ${raleway.variable} font-sans`}
    >
      <Particles
        className="absolute inset-0 -z-10 animate-fade-in"
        quantity={200}
      />
      {router.pathname !== "/post" && !router.pathname.startsWith("/notes") && (
        <>
          <Header />
          <Tab />
        </>
      )}
      <Component {...pageProps} previousPath={previousPath} />
    </div>
  );
}
