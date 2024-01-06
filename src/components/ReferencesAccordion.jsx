import { useState, useEffect } from "react";
import Link from "next/link";
import { IoIosArrowDown } from "react-icons/io";

import { db } from "../utils/db";
import { getShortFormattedDate } from "../utils/formatNotes";

async function bulkFetchData(ids, setResult) {
  const result = await db.notes.bulkGet(ids);
  if (result.length > 0) setResult(result);
  return result;
}

const ReferencesAccordion = ({ metadata }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState([]);

  useEffect(() => {
    const ids = metadata.map((item) => item.id);
    bulkFetchData(ids, setResult);
  }, [metadata]);
  return (
    <div className="markdown">
      <button
        className="flex gap-x-2 items-center pt-2 px-1 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-zinc-300">references</span>
        {isOpen ? (
          <IoIosArrowDown className="h-5 w-5 transform duration-300 rotate-180" />
        ) : (
          <IoIosArrowDown className="h-5 w-5 duration-300" />
        )}
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-full" : "max-h-0"
        }`}
      >
        <div className="text-zinc-500 text-sm">
          <p className="mx-1 pb-2">
            notes are ranked by relevance, the scores are indicated alongside
          </p>
          <ol className="space-y-2 mx-2">
            {result.length > 0 &&
              result.map((item, index) => (
                <li className="" key={index}>
                  <Link href={`/note?id=${item.id}`}>
                    <span className="line-clamp-1 underline underline-offset-2">
                      {item.text.toLowerCase()}
                    </span>
                    <span className="flex justify-between">
                      <span className="text-zinc-600">
                        {getShortFormattedDate(item.created_at)}
                      </span>
                      <span className="text-zinc-600">
                        {metadata[index].score}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ReferencesAccordion;
