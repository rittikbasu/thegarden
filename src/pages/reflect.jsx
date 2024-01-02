import Head from "next/head";
import { useState, useEffect } from "react";
import { useCompletion } from "ai/react";
import { db } from "@/utils/db";
import { useLiveQuery } from "dexie-react-hooks";
import { DateRangePicker, DateRangePickerItem } from "@tremor/react";
import Markdown from "react-markdown";
import { IoSearchOutline } from "react-icons/io5";
import { createMessages } from "@/utils/createMessages";

const Reflect = () => {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const [last7Days, setLast7Days] = useState({
    from: sevenDaysAgo,
    to: today,
  });
  const [datePickerValue, setDatePickerValue] = useState({
    from: sevenDaysAgo,
    to: today,
  });
  const [reflection, setReflection] = useState("");
  const [selectType, setSelectType] = useState("last7Days");
  const [maxDate, setMaxDate] = useState(null);
  const [minDate, setMinDate] = useState(null);
  const { complete, completion } = useCompletion({
    api: "/api/completion",
  });
  const [streaming, setStreaming] = useState(false);

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const [last30Days, setLast30Days] = useState({
    from: thirtyDaysAgo,
    to: today,
  });

  const last7DaysReflection = useLiveQuery(() =>
    db.reflections
      .where("type")
      .equals("last7Days")
      .toArray()
      .then((result) => {
        if (
          result.length === 0 ||
          result[0].date !== today.toLocaleDateString("en-CA")
        )
          return "";
        if (selectType === "last7Days") {
          setReflection(result[0].text);
          return result[0].text;
        }
      })
  );

  const handleDatePickerChange = (value) => {
    console.log(value);
    setReflection("");

    setDatePickerValue(value);
    if (value.selectValue) {
      setSelectType(value.selectValue);
    } else {
      setSelectType("none");
    }
  };

  const handleSearch = () => {
    selectType.selectValue !== "last7Days" && getReflection();
  };

  const getReflection = async () => {
    if (selectType !== "none") {
      const storedReflection = await db.reflections
        .where("type")
        .equals(selectType)
        .toArray();
      if (
        storedReflection.length !== 0 &&
        storedReflection[0].date === today.toLocaleDateString("en-CA")
      ) {
        setReflection(storedReflection[0].text);
        return;
      }
    }

    let result;
    if (datePickerValue.to) {
      result = await db.notes
        .where("created_at")
        .between(
          datePickerValue.from.toISOString().split("T")[0],
          datePickerValue.to.toISOString().split("T")[0],
          true,
          true
        )
        .toArray();
    } else {
      result = await db.notes
        .where("created_at")
        .startsWith(datePickerValue.from.toISOString().split("T")[0])
        .toArray();
    }
    console.log("result", result);
    const prompt = `Given below are the journal entries from ${datePickerValue.from} to ${datePickerValue.to}. Write a short and smart summary reflecting on what I've been up to with the heading "Here's a summary of what you've been up to" and provide deep insights and actionable recommendations based on these entries starting with "Here are some insights and recommendations".`;
    const messages = createMessages(prompt, result);
    setStreaming(true);
    complete({ messages }).then((response) => {
      setReflection(response);
      setStreaming(false);
      if (selectType !== "none") {
        db.reflections.put({
          type: selectType,
          date: today.toLocaleDateString("en-CA"),
          text: response,
        });
      }
    });
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
  }, []);

  return (
    <div>
      <Head>
        <title>reflect - the garden</title>
      </Head>
      <p className="ml-1 pb-1 text-sm font-workSans text-gray-500">
        reflect on your notes by selecting a date
      </p>
      <div className="flex flex-col justify-center items-center pb-8 gap-x-2">
        <DateRangePicker
          className="md:max-w-md mx-auto flex justify-center items-center"
          // value={datePickerValue}
          onValueChange={handleDatePickerChange}
          selectPlaceholder="select"
          defaultValue={{
            selectValue: "last7Days",
            from: last7Days.from,
            to: last7Days.to,
          }}
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
          <button
            className="py-0.5 px-2 rounded-lg bg-blue-600 shadow-inner shadow-black/50 flex items-center justify-center"
            onClick={handleSearch}
            disabled={streaming || datePickerValue.to === undefined}
          >
            <IoSearchOutline className="w-4 h-4 mr-1" />
            search
          </button>
        </div>
      </div>
      <div className="pb-24">
        {reflection !== "" || streaming ? (
          <div className="flex flex-col min-h-[20rem] justify-start items-start bg-zinc-900/80 border border-zinc-800/60 rounded-xl px-4 pt-4 markdown text-zinc-400 font-workSans">
            <Markdown>{streaming ? completion : reflection}</Markdown>
          </div>
        ) : !last7DaysReflection ? (
          <div className="flex flex-col h-80 gap-y-2 justify-start items-start bg-zinc-900/80 border border-zinc-800/60 rounded-xl p-6">
            <div className="w-8/12 h-4 bg-zinc-800 rounded-lg animate-pulse"></div>
            <div className="w-7/12 h-4 bg-zinc-800 rounded-lg animate-pulse"></div>
            <div className="w-8/12 h-4 bg-zinc-700 rounded-lg animate-pulse"></div>
            <div className="w-9/12 h-4 bg-zinc-700 rounded-lg animate-pulse"></div>
            <div className="w-11/12 h-4 bg-zinc-800 rounded-lg animate-pulse"></div>
            <div className="w-7/12 h-4 bg-zinc-700 rounded-lg animate-pulse"></div>

            <div className="w-11/12 h-4 mt-8 bg-zinc-800 rounded-lg animate-pulse"></div>
            <div className="w-9/12 h-4 bg-zinc-700 rounded-lg animate-pulse"></div>
            <div className="w-11/12 h-4 bg-zinc-700 rounded-lg animate-pulse"></div>
            <div className="w-11/12 h-4 bg-zinc-800 rounded-lg animate-pulse"></div>
          </div>
        ) : (
          <div className="flex flex-col h-80 gap-y-2 justify-start items-start bg-zinc-900/80 border border-zinc-800/60 rounded-xl p-6">
            <div className="w-8/12 h-4 bg-zinc-800 rounded-lg"></div>
            <div className="w-7/12 h-4 bg-zinc-800 rounded-lg"></div>
            <div className="w-8/12 h-4 bg-zinc-700 rounded-lg"></div>
            <div className="w-9/12 h-4 bg-zinc-700 rounded-lg"></div>
            <div className="w-11/12 h-4 bg-zinc-800 rounded-lg"></div>
            <div className="w-7/12 h-4 bg-zinc-700 rounded-lg"></div>

            <div className="w-11/12 h-4 mt-8 bg-zinc-800 rounded-lg"></div>
            <div className="w-9/12 h-4 bg-zinc-700 rounded-lg"></div>
            <div className="w-11/12 h-4 bg-zinc-700 rounded-lg"></div>
            <div className="w-11/12 h-4 bg-zinc-800 rounded-lg"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reflect;
