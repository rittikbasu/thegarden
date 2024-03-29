import Head from "next/head";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { useCompletion } from "ai/react";
import { db } from "@/utils/db";
import { useLiveQuery } from "dexie-react-hooks";
import { DateRangePicker, DateRangePickerItem } from "@tremor/react";
import Markdown from "react-markdown";

import SearchButton from "@/components/SearchButton";
import Skeleton from "@/components/Skeleton";
import { createMessages } from "@/utils/createMessages";
import { dateToLocale } from "@/utils/formatNotes";

function dateToISOString(date, end = true) {
  // if 'end' is true, it sets the time to the end of the day and vice versa
  if (end) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  return date.toISOString();
}

function saveToSessionStorage(reflection, datePickerValue) {
  sessionStorage.setItem("reflection", reflection);
  sessionStorage.setItem("datePickerValue", JSON.stringify(datePickerValue));
}

const Reflect = () => {
  const today = new Date();
  // last 7 days
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const last7Days = {
    from: sevenDaysAgo,
    to: today,
  };
  // last 30 days
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const last30Days = {
    from: thirtyDaysAgo,
    to: today,
  };
  // date picker value
  const [datePickerValue, setDatePickerValue] = useState({
    from: sevenDaysAgo,
    to: today,
    selectValue: "last7Days",
  });

  // last 7 days reflection
  const last7DaysReflection = useLiveQuery(() =>
    db.reflections
      .where("type")
      .equals("last7Days")
      .toArray()
      .then((result) => {
        console.log(selectType);
        if (result.length === 0) {
          console.log("no results found");
          return "";
        }
        if (result[0].date !== dateToLocale(today)) {
          console.log("last7DaysReflection expired");
          return;
        } else {
          console.log("last7DaysReflection", result[0].text);
          return result[0].text;
        }
      })
  );

  const [reflection, setReflection] = useState(last7DaysReflection);
  const [selectType, setSelectType] = useState("");
  const [maxDate, setMaxDate] = useState(null);
  const [minDate, setMinDate] = useState(null);
  const [inputChanged, setInputChanged] = useState(false);
  const { complete, completion } = useCompletion({
    api: "/api/completion",
  });
  const [streaming, setStreaming] = useState(false);

  const handleDatePickerChange = (value) => {
    if (value?.selectValue === selectType) return;

    console.log(value);
    setReflection("");
    setDatePickerValue(value);
    setInputChanged(true);
    const dateRanges = {
      last7Days: last7Days,
      last30Days: last30Days,
      allTime: { from: minDate, to: maxDate },
    };
    if (value.selectValue) {
      console.log("select value changed");
      setSelectType(value.selectValue);
    } else {
      let selectValue = null;
      for (const [key, range] of Object.entries(dateRanges)) {
        if (
          dateToLocale(value.from) === dateToLocale(range.from) &&
          dateToLocale(value.to) === dateToLocale(range.to)
        ) {
          selectValue = key;
          break;
        }
      }

      setSelectType(selectValue);
      selectValue &&
        setDatePickerValue((prev) => ({
          ...prev,
          selectValue: selectValue,
        }));
    }
  };

  const handleSearch = ({ regenerate = false }) => {
    setInputChanged(false);
    if (selectType !== "last7Days" || regenerate) {
      getReflection(regenerate);
    } else {
      setSelectType("last7Days");
      setReflection(last7DaysReflection);
      saveToSessionStorage(last7DaysReflection, datePickerValue);
    }
  };

  const getReflection = async (regenerate) => {
    // Early return if we have a stored reflection and we're not regenerating.
    if (selectType && !regenerate) {
      const storedReflection = await db.reflections
        .where("type")
        .equals(selectType)
        .toArray();
      if (
        storedReflection.length !== 0 &&
        storedReflection[0].date === dateToLocale(today)
      ) {
        setReflection(storedReflection[0].text);
        return;
      }
    }

    // Determine the date range for the query.
    const fromDateUTC = dateToISOString(
      datePickerValue.from,
      !datePickerValue.to
    );
    const toDateUTC = datePickerValue.to && dateToISOString(datePickerValue.to);

    // Fetch notes within the date range.
    const result = toDateUTC
      ? await db.notes
          .where("created_at")
          .between(fromDateUTC, toDateUTC, true, true)
          .toArray()
      : await db.notes
          .where("created_at")
          .startsWith(fromDateUTC.split("T")[0])
          .toArray();
    console.log("result", result);

    // Handle no results scenario.
    if (result.length === 0) {
      const noResultsText = "no results found";
      setReflection(noResultsText);
      saveToSessionStorage(noResultsText, datePickerValue);
      return;
    }

    // Generate the prompt for creating messages.
    const prompt = `Given below are the journal entries from ${datePickerValue.from} to ${datePickerValue.to}. Write a short and smart summary reflecting on what I've been up to with the heading "Here's a summary of what you've been up to" and provide deep insights and actionable recommendations based on these entries starting with "Here are some insights and recommendations".`;
    const messages = await createMessages(prompt, result);

    // Start the completion process.
    setStreaming(true);
    try {
      const response = await complete({ messages });
      setReflection(response);
      saveToSessionStorage(response, datePickerValue);
      if (selectType) {
        await db.reflections.put({
          type: selectType,
          date: dateToLocale(today),
          text: response,
        });
      }
    } catch (error) {
      console.error("Error during completion:", error);
      // Handle error scenario, e.g., set an error message, retry, etc.
    } finally {
      setStreaming(false);
    }
  };

  const getData = async () => {
    const result = await db.notes
      .orderBy("created_at")
      .toArray()
      .then((notes) => notes.map((note) => note.created_at));

    const firstPostTimestamp = result[0];

    if (!firstPostTimestamp) {
      return;
    } else {
      const lastPostTimestamp = result[result.length - 1];
      const firstPostDate = new Date(firstPostTimestamp);
      const lastPostDate = new Date(lastPostTimestamp);
      setMinDate(firstPostDate);
      setMaxDate(lastPostDate);
    }
  };

  useEffect(() => {
    getData();

    const storedDatePickerValue = sessionStorage.getItem("datePickerValue");
    const storedReflection = sessionStorage.getItem("reflection");
    console.log(storedDatePickerValue, storedReflection);

    if (storedDatePickerValue && storedReflection) {
      const { from, to, selectValue } = JSON.parse(storedDatePickerValue);
      setDatePickerValue({
        from: new Date(from),
        to: to ? new Date(to) : undefined,
        selectValue: selectValue || null,
      });
      setSelectType(selectValue || null);
      setReflection(storedReflection);
    } else {
      setSelectType("last7Days");
    }
  }, []);

  useEffect(() => {
    if (selectType === "last7Days") {
      console.log(selectType);
      setReflection(last7DaysReflection);
    }
  }, [last7DaysReflection, selectType]);

  return (
    <div>
      <Head>
        <title>reflect - the garden</title>
      </Head>
      <p className="ml-1 pb-1 text-sm text-gray-500">
        reflect on your notes by selecting a date
      </p>
      <div className="flex flex-col justify-center items-center pb-8 gap-x-2">
        <DateRangePicker
          className="tab:max-w-md mx-auto z-50 flex justify-center items-center"
          value={datePickerValue}
          onValueChange={handleDatePickerChange}
          // defaultValue={{
          //   selectValue: selectType,
          //   from: last7Days.from,
          //   to: last7Days.to,
          // }}
          displayFormat="dd/MM/yy"
          minDate={minDate}
          maxDate={maxDate}
          disabled={streaming}
        >
          <DateRangePickerItem
            key="last7Days"
            value="last7Days"
            from={last7Days.from}
            to={last7Days.to}
          >
            last 7 days
          </DateRangePickerItem>
          <DateRangePickerItem
            key="last30Days"
            value="last30Days"
            from={last30Days.from}
            to={last30Days.to}
          >
            last 30 days
          </DateRangePickerItem>
          <DateRangePickerItem
            key="allTime"
            value="allTime"
            from={minDate}
            to={maxDate}
          >
            all time
          </DateRangePickerItem>
        </DateRangePicker>
        <div className="flex items-center justify-end w-full mt-4">
          <SearchButton
            streaming={streaming}
            handleSearch={handleSearch}
            searchResult={reflection}
            disabled={streaming || datePickerValue.from === undefined}
          />
        </div>
      </div>
      <div className="pb-24">
        {reflection !== "" || streaming ? (
          <div className="border h-full bg-black border-zinc-800/80 rounded-xl overflow-hidden">
            <div className="w-full px-2 bg-black bg-grid-small-white/[0.2] relative flex items-center justify-center">
              <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)]"></div>
              <div
                className={clsx(
                  "flex z-10 min-h-[20rem] flex-col justify-start items-start rounded-xl pt-4 px-2 markdown text-zinc-400",
                  reflection === "no results found"
                    ? "justify-center"
                    : "justify-start"
                )}
              >
                <Markdown>{streaming ? completion : reflection}</Markdown>
              </div>
            </div>
          </div>
        ) : last7DaysReflection === "" && selectType === "last7Days" ? (
          <Skeleton animate={true} />
        ) : (
          <Skeleton />
        )}
      </div>
    </div>
  );
};

export default Reflect;
