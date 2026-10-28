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
  Sparkles,
  TrendingUp,
  Users,
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
      <section className="relative z-10 isolate rounded-[28px] bg-[#111a3a] px-6 py-9 text-white shadow-[0_24px_60px_-32px_rgba(28,37,88,0.7)] sm:px-9 lg:px-12 lg:py-11">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
          <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-indigo-500/25 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-48 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>
        <div className="relative grid gap-9 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.17em] text-cyan-100">
              <Sparkles className="h-3.5 w-3.5" /> Bidding intelligence
            </span>
            <h1 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[44px] lg:leading-[1.12]">
              Bid with a clearer picture.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Explore historical bid prices, compare instructors, and see how
              vacancies changed across bidding windows.
            </p>
            <div className="relative z-20 mt-7 max-w-[650px]">
              <SearchBox />
            </div>
          </div>
          <div className="hidden rounded-2xl border border-white/15 bg-white/[0.07] p-6 backdrop-blur-sm lg:block">
            <p className="text-xs font-bold uppercase tracking-[0.17em] text-cyan-200">
              Explore in three ways
            </p>
            <div className="mt-5 space-y-4 text-sm text-slate-100">
              <p className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-400/20">
                  <Users className="h-4 w-4 text-indigo-200" />
                </span>{" "}
                Compare instructors
              </p>
              <p className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/20">
                  <TrendingUp className="h-4 w-4 text-cyan-200" />
                </span>{" "}
                Follow historical trends
              </p>
              <p className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/20">
                  <Layers3 className="h-4 w-4 text-emerald-200" />
                </span>{" "}
                Inspect each section
              </p>
            </div>
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
          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                <BookOpen className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.17em] text-indigo-600 dark:text-indigo-300">
                  Course in focus
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
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-indigo-500/10"
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
                color: "bg-indigo-500",
              },
              {
                label: "Average median bid",
                value: formatBid(snapshot[2]),
                detail: "Mean of median bids",
                color: "bg-cyan-500",
              },
              {
                label: "Observed range",
                value: snapshot.length
                  ? `${formatBid(snapshot[0])}–${formatBid(snapshot[3])}`
                  : "—",
                detail: "Lowest to highest median",
                color: "bg-violet-500",
              },
              {
                label: "Instructors",
                value: loading ? "—" : String(rows.length),
                detail: "With historical bid data",
                color: "bg-emerald-500",
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <span
                  className={`absolute inset-x-0 top-0 h-1 ${metric.color}`}
                />
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                  {metric.label}
                </p>
                <p className="mt-3 truncate text-2xl font-semibold tabular-nums tracking-tight sm:text-[28px]">
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

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">
                    Instructor comparison
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight">
                    See how bids compare
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Median of median bids in Round 1 Window 1. Select an
                    instructor to explore.
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
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
                    className={`w-full rounded-xl px-3 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/70 ${row.name === selectedInstructor ? "bg-indigo-50/80 dark:bg-indigo-500/10" : ""}`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span
                        className={`min-w-0 truncate font-medium ${row.name === selectedInstructor ? "text-indigo-700 dark:text-indigo-300" : "text-slate-700 dark:text-slate-200"}`}
                      >
                        {row.name}
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums">
                        {formatBid(row.median)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full ${row.name === selectedInstructor ? "bg-gradient-to-r from-indigo-500 to-cyan-400" : "bg-indigo-300 dark:bg-indigo-600"}`}
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
            <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600 dark:text-cyan-300">
                Focus your research
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                Choose an instructor
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your selection updates the trend charts below.
              </p>
              <label className="mt-6 block text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Instructor
                <select
                  value={selectedInstructor}
                  onChange={(event) => chooseInstructor(event.target.value)}
                  disabled={rows.length === 0}
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium normal-case tracking-normal text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-indigo-950"
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
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-300"
                >
                  See Afterclass reviews <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <div className="mt-auto pt-6">
                <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    A useful starting point
                  </span>
                  Start with semester trends, then check the bidding windows for
                  a recent term. Section detail shows how individual classes
                  differ.
                </div>
              </div>
            </section>
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 p-5 dark:border-slate-800 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">
                Historical trends
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                Explore the bidding story
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose a view, then refine the term, window, or section in the
                chart.
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
                      className={`flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${view === item.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.title}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="p-5 sm:p-7">
              <h3 className="text-lg font-semibold">{currentView.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {currentView.description}
              </p>
              <div
                className="bid-analytics-explorer mt-6 min-w-0 overflow-x-auto rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/40 sm:p-6 [&>h1]:hidden"
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
