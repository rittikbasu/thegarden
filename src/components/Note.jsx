import Link from "next/link";
import clsx from "clsx";

const Note = ({
  id,
  date,
  time,
  content,
  index,
  length,
  prevDate,
  nextDate,
}) => {
  return (
    <div className="mb-4">
      {index !== 0 && (
        <div
          className={clsx(
            "absolute h-12 border-l left-1/2 transform -translate-x-1/2 -top-12",
            date === prevDate ? "border-orange-500" : "border-zinc-600"
          )}
        ></div>
      )}
      <Link href={`/notes/${id}`} passHref>
        <div className="flex items-center">
          <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-3xl w-full">
            <div className="p-4 text-white text-sm">
              <p className="line-clamp-3 font-workSans tracking-wider">
                {content.toLowerCase()}
              </p>
            </div>
            {/* {index !== length && ( */}
            <>
              {date !== prevDate && (
                <div className="flex items-center justify-center">
                  <div className="bg-orange-500 h-4 w-4 rounded-full absolute bottom-6 z-50"></div>
                </div>
              )}
              {date === prevDate && date !== nextDate && (
                <div className="flex items-center justify-center">
                  <div className="bg-orange-500 h-4 w-4 rounded-full absolute bottom-6 z-50"></div>
                </div>
              )}
            </>
            {/* )} */}
          </div>
        </div>
      </Link>
      <div className="p-2 mx-1 text-zinc-400 text-xs flex justify-between">
        <div className="text-left">{date.toLowerCase()}</div>
        <div className="text-right">{time.toLowerCase()}</div>
      </div>
    </div>
  );
};

export default Note;
