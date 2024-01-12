import clsx from "clsx";

const Skeleton = ({ animatePulse = false }) => {
  return (
    <>
      <div className="border px-2 bg-black border-zinc-800/80 rounded-xl z-10">
        <div className="w-full bg-black bg-grid-small-white/[0.2] relative flex items-center">
          <div className="absolute pointer-events-none inset-0 flex items-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)]"></div>
          <div className="relative z-20 py-8 px-4 space-y-2 w-full">
            <div
              className={clsx("w-8/12 h-4 bg-zinc-900 rounded-lg", {
                "animate-pulse": animatePulse,
              })}
            ></div>
            <div
              className={clsx("w-7/12 h-4 bg-zinc-900 rounded-lg", {
                "animate-pulse": animatePulse,
              })}
            ></div>
            <div
              className={clsx("w-8/12 h-4 bg-zinc-700 rounded-lg", {
                "animate-pulse": animatePulse,
              })}
            ></div>
            <div
              className={clsx("w-9/12 h-4 bg-zinc-700 rounded-lg", {
                "animate-pulse": animatePulse,
              })}
            ></div>
            <div
              className={clsx("w-full h-4 bg-zinc-900 rounded-lg", {
                "animate-pulse": animatePulse,
              })}
            ></div>
            <div
              className={clsx("w-9/12 h-4 bg-zinc-700 rounded-lg", {
                "animate-pulse": animatePulse,
              })}
            ></div>
            <div className="mt-8 space-y-2">
              <div
                className={clsx(
                  "w-11/12 h-4 mt-8 bg-gradient-to-r from-zinc-900 via-zinc-900 to-black rounded-lg",
                  {
                    "animate-pulse": animatePulse,
                  }
                )}
              ></div>
              <div
                className={clsx("w-9/12 h-4 bg-zinc-700 rounded-lg", {
                  "animate-pulse": animatePulse,
                })}
              ></div>
              <div
                className={clsx(
                  "w-11/12 h-4 bg-gradient-to-r from-zinc-700 via-zinc-700 to-black rounded-lg",
                  {
                    "animate-pulse": animatePulse,
                  }
                )}
              ></div>
              <div
                className={clsx(
                  "w-11/12 h-4 bg-gradient-to-r from-zinc-900 via-zinc-900 to-black rounded-lg",
                  {
                    "animate-pulse": animatePulse,
                  }
                )}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Skeleton;
