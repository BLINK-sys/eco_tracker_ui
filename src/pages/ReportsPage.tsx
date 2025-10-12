
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLocations, getReportSummary, getStatusInfo } from "@/services/dataService";
import { Period, ReportFilters, ReportSummary } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const [filters, setFilters] = useState<ReportFilters>({ period: "week" });
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const summaryData = await getReportSummary(filters);
        const locationsData = await getLocations();
        setSummary(summaryData);
        setLocations(locationsData);
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, period: e.target.value as Period });
  };

  const handleGenerateReport = () => {
    setLoading(true);
    getReportSummary(filters).then((data) => {
      setSummary(data);
      setLoading(false);
    });
  };

  const chartData = locations.map((loc: any) => {
    let fillRate = 0;
    if (loc.containers.length > 0) {
      const fullCount = loc.containers.filter((c: any) => c.status === "full").length;
      const partialCount = loc.containers.filter((c: any) => c.status === "partial").length;
      fillRate = Math.round(
        ((fullCount + partialCount * 0.5) / loc.containers.length) * 100
      );
    }
    
    return {
      name: loc.name,
      "Заполненность (%)": fillRate,
    };
  });

  return (
    <div className="h-full">
      <h1 className="mb-4 text-2xl font-bold">Отчётность</h1>

      <div className="mb-4 rounded-lg border bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="period" className="mb-1 block text-sm font-medium text-gray-700">
              Период отчёта
            </label>
            <select
              id="period"
              className="block w-full rounded-md border border-gray-300 p-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              value={filters.period}
              onChange={handlePeriodChange}
            >
              <option value="day">День</option>
              <option value="week">Неделя</option>
              <option value="month">Месяц</option>
              <option value="custom">Произвольный период</option>
            </select>
          </div>

          <div>
            <label htmlFor="startDate" className="mb-1 block text-sm font-medium text-gray-700">
              Начальная дата
            </label>
            <div className="relative">
              <input
                type="date"
                id="startDate"
                className="block w-full rounded-md border border-gray-300 p-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                value={filters.startDate ? format(filters.startDate, "yyyy-MM-dd") : ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    startDate: e.target.value ? new Date(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </div>

          <div>
            <label htmlFor="endDate" className="mb-1 block text-sm font-medium text-gray-700">
              Конечная дата
            </label>
            <div className="relative">
              <input
                type="date"
                id="endDate"
                className="block w-full rounded-md border border-gray-300 p-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                value={filters.endDate ? format(filters.endDate, "yyyy-MM-dd") : ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    endDate: e.target.value ? new Date(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            className="rounded-md bg-primary px-4 py-2 font-medium text-white hover:bg-primary/90"
            onClick={handleGenerateReport}
          >
            Сформировать отчёт
          </button>
        </div>
      </div>

      <Tabs
        defaultValue="summary"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-4 grid w-full grid-cols-2">
          <TabsTrigger value="summary">Сводная статистика</TabsTrigger>
          <TabsTrigger value="byLocation">По площадкам</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-0">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <span className="text-lg">Загрузка данных...</span>
            </div>
          ) : summary ? (
            <>
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                  <h3 className="mb-2 text-center text-sm font-medium text-gray-600">
                    Всего вывозов
                  </h3>
                  <p className="text-center text-3xl font-bold">{summary.totalCollections}</p>
                </div>

                <div className="rounded-lg border bg-white p-4 shadow-sm">
                  <h3 className="mb-2 text-center text-sm font-medium text-gray-600">
                    Средняя заполненность
                  </h3>
                  <p className="text-center text-3xl font-bold">{summary.averageFillRate}%</p>
                </div>

                <div className="rounded-lg border bg-white p-4 shadow-sm">
                  <h3 className="mb-2 text-center text-sm font-medium text-gray-600">
                    Заполненных контейнеров
                  </h3>
                  <p className="text-center text-3xl font-bold text-red-600">
                    {summary.fullContainers}
                  </p>
                </div>

                <div className="rounded-lg border bg-white p-4 shadow-sm">
                  <h3 className="mb-2 text-center text-sm font-medium text-gray-600">
                    Пустых контейнеров
                  </h3>
                  <p className="text-center text-3xl font-bold text-green-600">
                    {summary.emptyContainers}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border bg-white p-4">
                <h3 className="mb-4 text-lg font-medium">Статистика заполненности</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={70}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="Заполненность (%)" 
                        fill="#16a34a"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <span className="text-lg text-gray-500">
                Нет данных для отображения. Выберите другой период или сформируйте отчёт.
              </span>
            </div>
          )}
        </TabsContent>

        <TabsContent value="byLocation" className="mt-0">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <span className="text-lg">Загрузка данных...</span>
            </div>
          ) : locations.length > 0 ? (
            <div className="overflow-hidden rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Площадка
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Количество вывозов
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Средняя заполненность
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Статус
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {locations.map((location: any) => {
                    let fillRate = 0;
                    if (location.containers.length > 0) {
                      const fullCount = location.containers.filter(
                        (c: any) => c.status === "full"
                      ).length;
                      const partialCount = location.containers.filter(
                        (c: any) => c.status === "partial"
                      ).length;
                      fillRate = Math.round(
                        ((fullCount + partialCount * 0.5) / location.containers.length) * 100
                      );
                    }

                    // Random collection count for demo
                    const collectionCount = Math.floor(Math.random() * 10) + 5;
                    
                    const getStatusBadgeClass = (rate: number) => {
                      if (rate >= 75) return "bg-red-100 text-red-800";
                      if (rate >= 50) return "bg-amber-100 text-amber-800";
                      return "bg-green-100 text-green-800";
                    };
                    
                    const getActivityLabel = (rate: number) => {
                      if (rate >= 75) return "Высокая активность";
                      return "Нормальная активность";
                    };

                    return (
                      <tr key={location.id}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {location.name}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {collectionCount}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {fillRate}%
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(fillRate)}`}>
                            {getActivityLabel(fillRate)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <span className="text-lg text-gray-500">
                Нет данных для отображения. Выберите другой период или сформируйте отчёт.
              </span>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
