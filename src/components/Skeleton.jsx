import clsx from "clsx";

const Skeleton = ({ animate = false }) => {
  return (
    <>
      <div className="border bg-black border-zinc-800/80 rounded-xl z-10 overflow-hidden">
        <div className="w-full bg-black bg-grid-small-white/[0.2] relative flex items-center">
          <div className="absolute pointer-events-none inset-0 flex items-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)]"></div>
          <div
            className={clsx(
              animate
                ? "relative w-full before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-orange-100/10 before:to-transparent isolate overflow-hidden shadow-xl shadow-black/5"
                : "w-full"
            )}
          >
            <div className="relative z-20 py-8 px-6 space-y-2 w-full">
              <div className="w-8/12 tab:h-5 h-4 bg-zinc-900 rounded-lg"></div>
              <div className="w-7/12 tab:h-5 h-4 bg-zinc-900 rounded-lg"></div>
              <div className="w-8/12 tab:h-5 h-4 bg-zinc-700 rounded-lg"></div>
              <div className="w-9/12 tab:h-5 h-4 bg-zinc-700 rounded-lg"></div>
              <div className="w-11/12 tab:h-5 h-4 bg-zinc-900 rounded-lg"></div>
              <div className="w-9/12 tab:h-5 h-4 bg-zinc-700 rounded-lg"></div>
              <div className="mt-8 space-y-2">
                <div className="w-11/12 tab:h-5 h-4 mt-8 bg-zinc-900 rounded-lg"></div>
                <div className="w-9/12 tab:h-5 h-4 bg-zinc-700 rounded-lg"></div>
                <div className="w-11/12 tab:h-5 h-4 bg-zinc-700 rounded-lg"></div>
                <div className="w-full tab:h-5 h-4 bg-zinc-900 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Skeleton;
