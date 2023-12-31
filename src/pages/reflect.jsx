import Head from "next/head";
import { useState, useEffect } from "react";
import Calendar from "react-github-contribution-calendar";
import { db } from "@/utils/db";
import { DateRangePicker, DateRangePickerItem } from "@tremor/react";
import { IoSearchOutline } from "react-icons/io5";

const panelColors = [
  "rgba(63, 63, 70, 0.4)",
  "#fa983c",
  "#F87D09",
  "#AC5808",
  "#7B3F06",
];

const monthNames = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

const weekLabelAttributes = {
  style: {
    fontSize: 10,
    fill: "#aaaaaa",
    alignmentBaseline: "central",
  },
};

const weekNames = ["", "m", "", "w", "", "f", ""];

const Reflect = () => {
  const today = new Date();
  const [totalPosts, setTotalPosts] = useState(0);
  const [postsThisMonth, setPostsThisMonth] = useState(0);
  const [postsPerDay, setPostsPerDay] = useState({});
  const [datePickerValue, setDatePickerValue] = useState({
    from: today,
    to: today,
  });
  const sevenDaysAgo = new Date(datePickerValue.from);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const [last7Days, setLast7Days] = useState({
    from: sevenDaysAgo,
    to: today,
  });
  const thirtyDaysAgo = new Date(datePickerValue.from);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const [last30Days, setLast30Days] = useState({
    from: thirtyDaysAgo,
    to: today,
  });
  const [maxDate, setMaxDate] = useState(null);
  const [minDate, setMinDate] = useState(null);

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
      setDatePickerValue({
        from: firstPostDate,
        to: lastPostDate,
      });
    }

    const totalPosts = result.length;
    const postsPerDay = {};

    result.forEach((post) => {
      const day = new Date(post).toISOString().split("T")[0];
      if (!postsPerDay[day]) {
        postsPerDay[day] = 0;
      }
      postsPerDay[day]++;
    });

    const currentMonth = new Date().getMonth();
    const postsThisMonth = result.filter((post) => {
      const postMonth = new Date(post).getMonth();
      return postMonth === currentMonth;
    }).length;

    setTotalPosts(totalPosts);
    setPostsThisMonth(postsThisMonth);
    setPostsPerDay(postsPerDay);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div>
      <Head>
        <title>reflect - the garden</title>
      </Head>
      <p className="flex justify-between text-sm mx-2 font-workSans text-zinc-400">
        <span>this month: {postsThisMonth}</span>
        <span>total: {totalPosts}</span>
      </p>
      <div className="mt-2 mb-2">
        <Calendar
          values={postsPerDay}
          until={new Date().toISOString().split("T")[0]}
          panelColors={panelColors}
          monthNames={monthNames}
          weekNames={weekNames}
          weekLabelAttributes={weekLabelAttributes}
        />
      </div>
      <div className="flex items-center justify-end mt-2 mr-4 md:mr-0">
        <span className="text-xs">less</span>
        <div className="flex mx-2">
          {panelColors.map((color, index) => (
            <div
              key={index}
              style={{ backgroundColor: color }}
              className={`w-3 h-3 ${
                index < panelColors.length - 1 ? "mr-1" : ""
              }`}
            ></div>
          ))}
        </div>
        <span className="text-xs">more</span>
      </div>
      <div className="flex flex-col justify-center items-center py-8 gap-x-2">
        <DateRangePicker
          className="lg:max-w-sm mx-auto flex justify-center items-center"
          value={datePickerValue}
          onValueChange={setDatePickerValue}
          selectPlaceholder="select"
          displayFormat="dd/MM/yy"
          minDate={minDate}
          maxDate={maxDate}
        >
          <DateRangePickerItem
            key="ytd"
            value="ytd"
            from={last7Days.from}
            to={last7Days.to}
          >
            last 7 days
          </DateRangePickerItem>
          <DateRangePickerItem
            key="half"
            value="half"
            from={last30Days.from}
            to={last30Days.to}
          >
            last 30 days
          </DateRangePickerItem>
          <DateRangePickerItem
            key="all"
            value="all"
            from={minDate}
            to={maxDate}
          >
            all time
          </DateRangePickerItem>
        </DateRangePicker>
        <div className="flex items-center justify-end w-full mt-2">
          <button className="py-0.5 px-2 rounded-lg bg-blue-600 shadow-inner shadow-black/50 flex items-center justify-center">
            <IoSearchOutline className="w-4 h-4 mr-1" />
            search
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reflect;
