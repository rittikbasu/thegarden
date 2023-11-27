import { useRouter } from "next/router";
import Header from "@/components/Header";
import Tab from "@/components/Tab";
import Particles from "@/components/Particles";
import "@/styles/globals.css";
import { Poppins } from "@next/font/google";
import clsx from "clsx";

const poppins = Poppins({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
});

export default function App({ Component, pageProps }) {
  const router = useRouter();
  return (
    <div className={`max-w-lg mx-auto px-8 ${poppins.className}`}>
      <Particles
        className="absolute inset-0 -z-10 animate-fade-in"
        quantity={200}
      />
      {router.pathname !== "/post" && (
        <>
          <Header />
          <Tab />
        </>
      )}
      <Component {...pageProps} />
    </div>
  );
}
