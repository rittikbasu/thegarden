import clsx from "clsx";

const Skeleton = ({ animatePulse = false }) => {
  return (
    <div
      className={clsx(
        "flex flex-col h-80 gap-y-2 justify-start items-start bg-zinc-900/80 border border-zinc-800/60 rounded-xl p-6"
      )}
    >
      <div
        className={clsx("w-8/12 h-4 bg-zinc-800 rounded-lg", {
          "animate-pulse": animatePulse,
        })}
      ></div>
      <div
        className={clsx("w-7/12 h-4 bg-zinc-800 rounded-lg", {
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
        className={clsx("w-11/12 h-4 bg-zinc-800 rounded-lg", {
          "animate-pulse": animatePulse,
        })}
      ></div>
      <div
        className={clsx("w-7/12 h-4 bg-zinc-700 rounded-lg", {
          "animate-pulse": animatePulse,
        })}
      ></div>
      <div
        className={clsx("w-11/12 h-4 mt-8 bg-zinc-800 rounded-lg", {
          "animate-pulse": animatePulse,
        })}
      ></div>
      <div
        className={clsx("w-9/12 h-4 bg-zinc-700 rounded-lg", {
          "animate-pulse": animatePulse,
        })}
      ></div>
      <div
        className={clsx("w-11/12 h-4 bg-zinc-700 rounded-lg", {
          "animate-pulse": animatePulse,
        })}
      ></div>
      <div
        className={clsx("w-11/12 h-4 bg-zinc-800 rounded-lg", {
          "animate-pulse": animatePulse,
        })}
      ></div>
    </div>
  );
};

export default Skeleton;
