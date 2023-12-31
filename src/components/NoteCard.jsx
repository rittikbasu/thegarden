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
        <div className="flex items-center">
          <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-3xl w-full">
            <div className="p-4 text-white text-sm">
              <p className="line-clamp-3 tracking-wider">
                {content.toLowerCase()}
              </p>
            </div>
            {/* {index !== length && ( */}
            <>
              {date !== prevDate && (
                <div className="flex items-center justify-center">
                  <div className="bg-orange-500 h-4 w-4 rounded-full absolute bottom-6 z-40"></div>
                </div>
              )}
              {date === prevDate && date !== nextDate && (
                <div className="flex items-center justify-center">
                  <div className="bg-orange-500 h-4 w-4 rounded-full absolute bottom-6 z-40"></div>
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

export default NoteCard;
