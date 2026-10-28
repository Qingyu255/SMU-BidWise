"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ExternalLink,
  Layers3,
  TrendingUp,
} from "lucide-react";
import VisualiseTrendAcrossSemesters from "@/components/interactiveCharts/VisualiseTrendAcrossSemesters";
import VisualiseTrendAcrossBiddingWindows from "@/components/interactiveCharts/VisualiseTrendAcrossBiddingWindows";
import VisualiseBidPriceForSpecificInstructorTermSection from "@/components/interactiveCharts/VisualiseBidPriceForSpecificInstructorTermSection";
import adjustChartWidthHeight from "@/components/charts/chartUtils/adjustChartWidthHeight";
import { SearchBox } from "./components/SearchBox";

type View = "semesters" | "windows" | "section";
type ChartResponse = {
  chartData: { labels: string[]; datasets: { data: number[] }[] };
};

const views = [
  {
    id: "semesters" as const,
    title: "Across semesters",
    description: "Follow bid prices over time for a bidding window.",
    icon: TrendingUp,
  },
  {
    id: "windows" as const,
    title: "Within a term",
    description: "See how prices and vacancies shift between windows.",
    icon: BarChart3,
  },
  {
    id: "section" as const,
    title: "Section detail",
    description: "Zoom in on the minimum and median bid for a section.",
    icon: Layers3,
  },
];

function formatBid(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString("en-SG", { maximumFractionDigits: 2 })
    : "—";
}

async function readApi<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.detail || `Analytics service returned ${response.status}.`,
    );
  }
  return response.json() as Promise<T>;
}

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseCode = (
    searchParams.get("courseCode") || "COR-STAT1202"
  ).toUpperCase();
  const instructor = searchParams.get("instructor") || "";
  const apiUrl = process.env.NEXT_PUBLIC_ANALYTICS_API_URL;
  const [loadedCourse, setLoadedCourse] = useState("");
  const [courseName, setCourseName] = useState("");
  const [overview, setOverview] = useState<ChartResponse | null>(null);
  const [comparison, setComparison] = useState<ChartResponse | null>(null);
  const [error, setError] = useState("");
  const [view, setView] = useState<View>("semesters");
  const [chartSize, setChartSize] = useState(["400px", "400px"]);

  useEffect(() => {
    const updateSize = () => setChartSize(adjustChartWidthHeight());
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoadedCourse("");
    setCourseName("");
    setOverview(null);
    setComparison(null);
    setError("");

    if (!apiUrl) {
      setError("The analytics service is not configured.");
      setLoadedCourse(courseCode);
      return () => controller.abort();
    }

    const encodedCode = encodeURIComponent(courseCode);
    Promise.all([
      readApi<string>(`${apiUrl}/coursename/${encodedCode}`, controller.signal),
      readApi<ChartResponse>(
        `${apiUrl}/coursedata/overview/instructor_median_bid_chart/${encodedCode}`,
        controller.signal,
      ),
    ])
      .then(([name, chart]) => {
        setCourseName(name);
        setComparison(chart);
        setLoadedCourse(courseCode);
      })
      .catch((cause: Error) => {
        if (!controller.signal.aborted) {
          setError(cause.message);
          setLoadedCourse(courseCode);
        }
      });
    readApi<ChartResponse>(
      `${apiUrl}/coursedata/overview/${encodedCode}`,
      controller.signal,
    )
      .then(setOverview)
      .catch(() => {});

    return () => controller.abort();
  }, [apiUrl, courseCode]);

  const loading = loadedCourse !== courseCode;
  const rows = useMemo(() => {
    if (loading || !comparison) return [];
    return comparison.chartData.labels
      .map((name, index) => ({
        name,
        median: comparison.chartData.datasets[0]?.data[index] ?? 0,
        mean: comparison.chartData.datasets[1]?.data[index] ?? 0,
      }))
      .sort((a, b) => b.median - a.median);
  }, [comparison, loading]);
  const maxMedian = Math.max(1, ...rows.map((row) => row.median));
  const selectedInstructor =
    rows.find((row) => row.name === instructor)?.name || rows[0]?.name || "";
  const selectedRow = rows.find((row) => row.name === selectedInstructor);
  const snapshot = !loading ? overview?.chartData.datasets[0]?.data || [] : [];
  const currentView = views.find((item) => item.id === view)!;

  function chooseInstructor(name: string) {
    router.replace(
      `/bid-analytics?courseCode=${encodeURIComponent(courseCode)}&instructor=${encodeURIComponent(name)}`,
      { scroll: false },
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 pb-16 pt-2">
      <section className="relative z-10 rounded-2xl border border-blue-200 bg-blue-50/70 px-6 py-6 dark:border-blue-900 dark:bg-blue-950/25 sm:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
            Bid price analytics
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Past bid prices
          </h1>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Compare by instructor, term, and section.
          </p>
          <div className="relative mt-5 max-w-[650px]">
            <SearchBox />
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-900 dark:bg-rose-950/30">
          <h2 className="font-semibold">We couldn&apos;t load {courseCode}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try another course in the search above.
          </p>
        </div>
      ) : (
        <>
          <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <BookOpen className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  Selected course
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                  {courseCode}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {loading ? "Loading course…" : courseName}
                </p>
              </div>
            </div>
            <Link
              href={`/courses/${encodeURIComponent(courseCode)}`}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Course details <ArrowRight className="h-4 w-4" />
            </Link>
          </section>

          <section
            aria-label="Bid price snapshot"
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          >
            {[
              {
                label: "Typical median bid",
                value: formatBid(snapshot[1]),
                detail: "Median of median bids",
              },
              {
                label: "Average median bid",
                value: formatBid(snapshot[2]),
                detail: "Mean of median bids",
              },
              {
                label: "Observed range",
                value: snapshot.length
                  ? `${formatBid(snapshot[0])}–${formatBid(snapshot[3])}`
                  : "—",
                detail: "Lowest to highest median",
              },
              {
                label: "Instructors",
                value: loading ? "—" : String(rows.length),
                detail: "With historical bid data",
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  {metric.label}
                </p>
                <p className="mt-2 truncate text-2xl font-semibold tabular-nums tracking-tight">
                  {metric.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {metric.detail}
                </p>
              </div>
            ))}
          </section>
          <p className="-mt-3 px-1 text-xs text-muted-foreground">
            Snapshot figures use Round 1 Window 1 bids in the available
            historical data.
          </p>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
            <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    Instructor comparison
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Median bids in Round 1 Window 1. Select a row to update the
                    charts.
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {rows.length} instructors
                </span>
              </div>
              <div className="mt-6 max-h-[440px] space-y-1 overflow-y-auto pr-1">
                {rows.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-muted-foreground dark:border-slate-700">
                    {loading
                      ? "Loading instructor data…"
                      : "No comparison data is available."}
                  </div>
                )}
                {rows.map((row) => (
                  <button
                    key={row.name}
                    type="button"
                    onClick={() => chooseInstructor(row.name)}
                    aria-label={`Explore trends for ${row.name}`}
                    className={`w-full rounded-lg px-3 py-3 text-left transition hover:bg-blue-50/70 dark:hover:bg-blue-950/30 ${row.name === selectedInstructor ? "bg-blue-50 dark:bg-blue-950/40" : ""}`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate font-medium text-slate-700 dark:text-slate-200">
                        {row.name}
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums">
                        {formatBid(row.median)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full ${row.name === selectedInstructor ? "bg-gradient-to-r from-blue-600 to-sky-400" : "bg-blue-200 dark:bg-blue-900"}`}
                        style={{
                          width: `${Math.max(3, (row.median / maxMedian) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      Mean median bid {formatBid(row.mean)}
                    </p>
                  </button>
                ))}
              </div>
            </section>
            <section className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <h2 className="text-lg font-semibold tracking-tight">
                Selected instructor
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose an instructor to view their bid history.
              </p>
              <label className="mt-6 block text-sm font-medium text-muted-foreground">
                Instructor
                <select
                  value={selectedInstructor}
                  onChange={(event) => chooseInstructor(event.target.value)}
                  disabled={rows.length === 0}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-blue-950"
                >
                  {rows.length === 0 && <option value="">Loading…</option>}
                  {rows.map((row) => (
                    <option key={row.name} value={row.name}>
                      {row.name}
                    </option>
                  ))}
                </select>
              </label>
              {selectedInstructor && (
                <a
                  href={`https://www.afterclass.io/professor/smu-${selectedInstructor.replace(".", "").split(" ").join("-").toLowerCase()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:underline dark:text-blue-300"
                >
                  See Afterclass reviews{" "}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <div className="mt-6 divide-y divide-slate-200 border-t border-slate-200 text-sm dark:divide-slate-800 dark:border-slate-800">
                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="text-muted-foreground">
                    Median of median bids
                  </span>
                  <span className="font-semibold tabular-nums">
                    {formatBid(selectedRow?.median)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="text-muted-foreground">
                    Mean of median bids
                  </span>
                  <span className="font-semibold tabular-nums">
                    {formatBid(selectedRow?.mean)}
                  </span>
                </div>
              </div>
            </section>
          </div>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
              <h2 className="text-lg font-semibold tracking-tight">
                Bid trends
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Compare prices and vacancies by semester, window, or section.
              </p>
              <div
                role="group"
                aria-label="Chart view"
                className="mt-5 grid gap-2 sm:grid-cols-3"
              >
                {views.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setView(item.id)}
                      aria-pressed={view === item.id}
                      className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition ${view === item.id ? "border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-600" : "border-transparent bg-slate-50 text-slate-600 hover:border-blue-200 hover:bg-blue-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-900 dark:hover:bg-blue-950/30"}`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.title}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <h3 className="text-lg font-semibold">{currentView.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {currentView.description}
              </p>
              <div
                className="bid-analytics-explorer mt-6 min-w-0 overflow-x-auto rounded-lg border border-slate-200 p-4 dark:border-slate-800 sm:p-6 [&>h1]:hidden"
                key={`${courseCode}-${selectedInstructor}-${view}`}
              >
                {loading || !selectedInstructor ? (
                  <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
                    Loading bid history…
                  </div>
                ) : view === "semesters" ? (
                  <VisualiseTrendAcrossSemesters
                    courseCode={courseCode}
                    instructorSelected={selectedInstructor}
                    width={chartSize[0]}
                    height={chartSize[1]}
                  />
                ) : view === "windows" ? (
                  <VisualiseTrendAcrossBiddingWindows
                    courseCode={courseCode}
                    instructorSelected={selectedInstructor}
                    width={chartSize[0]}
                    height={chartSize[1]}
                  />
                ) : (
                  <VisualiseBidPriceForSpecificInstructorTermSection
                    courseCode={courseCode}
                    instructorSelected={selectedInstructor}
                    width={chartSize[0]}
                    height={chartSize[1]}
                  />
                )}
              </div>
              <p className="mt-4 text-xs leading-5 text-muted-foreground">
                Historical bids help with planning, but they do not predict the
                next bidding window.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
