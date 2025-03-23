import React, { useEffect, useState, useMemo } from 'react';
import { Modal, Tabs, Select, Button } from '@mantine/core';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

/**
 * Parses an ISO date string w/ format "YYYY-MM-DD" and return a Date object using local time
 */
function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

type Totals = {
  downloads: number;
  visualizations: number;
  simulations: number;
};

type ChartDataType = {
  month: string; // ISO date (like "2024-10-01")
  downloads_total?: number;
  visualizations_total?: number;
  simulations_total?: number;
  ips: string[];
};

export function UsageStatsModal({
                                  opened,
                                  onClose,
                                }: {
  opened: boolean;
  onClose: () => void;
}) {
  const [chartData, setChartData] = useState<ChartDataType[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [topCountries, setTopCountries] = useState<[string, number][]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [topCountriesLoading, setTopCountriesLoading] = useState<boolean>(false);
  const [topCountriesError, setTopCountriesError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'downloads' | 'visualizations' | 'simulations'>('downloads');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('hammerjs');
      import('chartjs-adapter-date-fns').then(() => {
        ChartJS.register(TimeScale);
      });
    }
  }, []);

  // Fetch monthly data for a specific data type
  const fetchData = async (type: 'downloads' | 'visualizations' | 'simulations') => {
    try {
      const response = await fetch(`http://localhost:8081/usage/public/monthly_usage/${type}/`);
      if (!response.ok) {
        throw new Error('Failed to fetch monthly usage data');
      }
      const data = await response.json();
      if (data && data.result) {
        setChartData(data.result);
      } else {
        throw new Error('Invalid monthly usage data received');
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('An unknown error occurred while fetching monthly data');
    }
  };

  // Fetch totals data
  const fetchTotals = async () => {
    try {
      const response = await fetch('http://localhost:8081/usage/public/totals/');
      if (!response.ok) {
        throw new Error('Failed to fetch totals data');
      }
      const data = await response.json();
      if (data && data.result) {
        setTotals(data.result);
      } else {
        throw new Error('Invalid totals data received');
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('An unknown error occurred while fetching totals data');
    }
  };

  // Fetch top countries data
  const fetchTopCountries = async () => {
    setTopCountriesLoading(true);
    setTopCountriesError(null);
    try {
      const response = await fetch('http://localhost:8081/usage/public/top-countries/');
      if (!response.ok) {
        throw new Error('Failed to fetch top countries data');
      }
      const data = await response.json();
      if (data && data.result) {
        setTopCountries(data.result);
      } else {
        throw new Error('Invalid top countries data received');
      }
    } catch (err: unknown) {
      if (err instanceof Error) setTopCountriesError(err.message);
      else setTopCountriesError('An unknown error occurred while fetching top countries data');
    } finally {
      setTopCountriesLoading(false);
    }
  };

  // Fetch all data in parallel when the modal opens
  useEffect(() => {
    if (opened) {
      setLoading(true);
      Promise.all([fetchTotals(), fetchData(activeTab), fetchTopCountries()])
        .catch((err) => {
          console.error("Error fetching data in parallel:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [opened, activeTab]);

  // Determine which key to use from the chart data based on active tab
  const key: 'downloads_total' | 'visualizations_total' | 'simulations_total' =
    `${activeTab}_total` as 'downloads_total' | 'visualizations_total' | 'simulations_total';

  // Filter chart data w/ parsed dates so that the selected dropdown values match
  // For bug w/ selection not matching what is shown on graph
  const filteredChartData = chartData.filter(item => {
    const itemDate = parseDate(item.month);
    if (startDate && itemDate < parseDate(startDate)) return false;
    if (endDate && itemDate > parseDate(endDate)) return false;
    return true;
  });

  // Prepare datasets for the chart
  const datasets = [
    {
      label: activeTab.charAt(0).toUpperCase() + activeTab.slice(1),
      data: filteredChartData.map(item => ({
        x: parseDate(item.month),
        y: item[key] ?? 0,
      })),
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.07,
      pointRadius: 3.5,
      pointStyle: 'circle',
    },
    {
      label: 'Unique IPs',
      data: filteredChartData.map(item => ({
        x: parseDate(item.month),
        y: item.ips.length,
      })),
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderDash: [5, 5],
      tension: 0.07,
      pointRadius: 3.5,
      pointStyle: 'circle',
    },
  ];

  // Configure chart data
  const chartDataConfig: ChartData<'line'> = {
    datasets: datasets as any,
  };
  // Configure chart options
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    layout: {
      padding: {
        bottom: 25,
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          tooltipFormat: 'MMM yyyy',
          unit: 'month',
          displayFormats: {
            month: 'MMM yyyy',
          },
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: `Monthly ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Data`,
        font: {
          size: 16,
          weight: 'bold',
        },
        color: '#000',
        padding: { top: 35, bottom: 20 },
      },
      legend: {
        labels: {
          usePointStyle: true,
          pointStyle: 'line',
          font: { size: 12 },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.raw.y;
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  // Reset date filters when closing modal
  const handleClose = () => {
    setStartDate(null);
    setEndDate(null);
    onClose();
  };

  // Make a continuous range of dropdown options
  const monthOptions = useMemo(() => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    let minDate: Date;
    if (chartData.length === 0) {
      minDate = new Date(currentMonthStart);
      minDate.setMonth(minDate.getMonth() - 11);
    } else {
      const allDates = chartData.map(item => parseDate(item.month));
      minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    }
    const maxDate = currentMonthStart; // Extend to current month
    const options = [];
    const iterDate = new Date(minDate);
    while (iterDate <= maxDate) {
      const value = iterDate.toISOString().slice(0, 10);
      options.push({
        value,
        label: iterDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      });
      iterDate.setMonth(iterDate.getMonth() + 1);
    }
    return options;
  }, [chartData]);

  return (
    <Modal opened={opened} onClose={handleClose} title="Usage Statistics" size="75%">
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div style={{ display: 'flex', gap: '1rem' }}>
          {/* Usage stats and chart */}
          <div style={{ flex: 5, minWidth: 0 }}>
            <Tabs value={activeTab}>
              <Tabs.List style={{ display: 'flex', justifyContent: 'center' }}>
                <Tabs.Tab value="downloads" onClick={() => setActiveTab('downloads')}>
                  Downloads
                </Tabs.Tab>
                <Tabs.Tab value="visualizations" onClick={() => setActiveTab('visualizations')}>
                  Visualizations
                </Tabs.Tab>
                <Tabs.Tab value="simulations" onClick={() => setActiveTab('simulations')}>
                  Simulations
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="downloads" pt="xs" style={{ paddingBottom: '20px' }}>
                {filteredChartData.length ? (
                  <div style={{ width: '100%' }}>
                    <Line data={chartDataConfig} options={chartOptions as any} />
                  </div>
                ) : (
                  <p>No data available for selected range</p>
                )}
              </Tabs.Panel>
              <Tabs.Panel value="visualizations" pt="xs" style={{ paddingBottom: '20px' }}>
                {filteredChartData.length ? (
                  <div style={{ width: '100%' }}>
                    <Line data={chartDataConfig} options={chartOptions as any} />
                  </div>
                ) : (
                  <p>No data available for selected range</p>
                )}
              </Tabs.Panel>
              <Tabs.Panel value="simulations" pt="xs" style={{ paddingBottom: '20px' }}>
                {filteredChartData.length ? (
                  <div style={{ width: '100%' }}>
                    <Line data={chartDataConfig} options={chartOptions as any} />
                  </div>
                ) : (
                  <p>No data available for selected range</p>
                )}
              </Tabs.Panel>
            </Tabs>
            {/* Date filter dropdowns and reset button */}
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
              <Select
                data={monthOptions}
                placeholder="Select Start Month"
                value={startDate}
                onChange={(val) => setStartDate(val || null)}
                style={{ width: '175px' }}
              />
              <Select
                data={monthOptions}
                placeholder="Select End Month"
                value={endDate}
                onChange={(val) => setEndDate(val || null)}
                style={{ width: '175px' }}
              />
              <Button
                variant="outline"
                onClick={() => {
                  // Clear date inputs and reset view
                  setStartDate(null);
                  setEndDate(null);
                }}
              >
                Reset Filter
              </Button>
            </div>
            {totals && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: '#f7f7f7',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}>Downloads</p>
                    <p style={{ margin: 0, fontSize: '1rem' }}>{totals.downloads}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}>Visualizations</p>
                    <p style={{ margin: 0, fontSize: '1rem' }}>{totals.visualizations}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}>Simulations</p>
                    <p style={{ margin: 0, fontSize: '1rem' }}>{totals.simulations}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Sidebar for top countries */}
          <div style={{ width: '215px', borderLeft: '1px solid #ccc', paddingLeft: '1rem' }}>
            <h3 style={{ textAlign: 'center' }}>Top Usage Countries</h3>
            {topCountriesLoading ? (
              <p>Loading top countries...</p>
            ) : topCountriesError ? (
              <p>Error: {topCountriesError}</p>
            ) : topCountries.length > 0 ? (
              <table style={{ width: '100%', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                <tr>
                  <th style={{ width: '30px' }}>#</th>
                  <th style={{ width: '70px' }}>Country</th>
                  <th style={{ textAlign: 'center', width: '50px' }}>Unique IPs</th>
                </tr>
                </thead>
                <tbody>
                {topCountries.map(([country, count], index) => (
                  <tr key={index}>
                    <td style={{ width: '30px' }}>{index + 1}</td>
                    <td style={{ width: '70px' }}>{country}</td>
                    <td style={{ textAlign: 'center', width: '50px' }}>{count}</td>
                  </tr>
                ))}
                </tbody>
              </table>
            ) : (
              <p>No country data available</p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
