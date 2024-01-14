import Link from "next/link";
import clsx from "clsx";
import { parse, differenceInCalendarDays } from "date-fns";

const NoteCard = ({
  id,
  highlight,
  date,
  time,
  content,
  index,
  prevDate,
  nextDate,
}) => {
  const dateFormat = "EEE, MMM d, yyyy";
  const currentDate = parse(date, dateFormat, new Date());
  const previousDate = parse(prevDate, dateFormat, new Date());

  const showLine = differenceInCalendarDays(currentDate, previousDate) >= -1;
  return (
    <div className="mb-4">
      {index !== 0 && showLine && (
        <div
          className={clsx(
            "absolute h-12 border-l border-orange-500 left-1/2 transform -translate-x-1/2 -top-12",
            date === prevDate ? "border-dashed" : "border-solid"
          )}
        ></div>
      )}
      <Link
        href={
          highlight ? `/note?id=${id}&highlight=${highlight}` : `/note?id=${id}`
        }
        passHref
      >
        <div className="border overflow-hidden bg-black border-zinc-800/80 rounded-xl">
          <div className="w-full px-2 bg-black bg-grid-small-white/[0.2] relative flex items-center justify-center">
            <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)]"></div>
            <div className="relative z-20 py-4 px-2">
              <p className="line-clamp-3 text-sm bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-400">
                {content.toLowerCase()}
              </p>
            </div>
          </div>
          {date !== prevDate && (
            <div className="flex items-center justify-center">
              <div className="bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-400 via-orange-600 to-orange-700 h-4 w-4 rounded-full absolute bottom-6 z-40"></div>
            </div>
          )}
          {date === prevDate && date !== nextDate && (
            <div className="flex items-center justify-center">
              <div className="bg-[radial-gradient(ellipse_top_right,_var(--tw-gradient-stops))] from-orange-400 via-orange-600 to-orange-700 h-4 w-4 rounded-full absolute bottom-6 z-40"></div>
            </div>
          )}
        </div>
      </Link>
      <div className="p-2 mx-1 text-zinc-400 text-xs flex justify-between">
        <div className="text-left">{date.toLowerCase()}</div>
        <div className="text-right">{time.toLowerCase()}</div>
      </div>
    </div>
  );
};

export default NoteCard;
