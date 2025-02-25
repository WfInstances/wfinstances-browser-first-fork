import React, { useEffect, useState } from 'react';
import { Modal, Tabs } from '@mantine/core';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type Totals = {
  downloads: number;
  visualizations: number;
  simulations: number;
};

type ChartData = {
  week_number: number;
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
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [topCountries, setTopCountries] = useState<[string, number][]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // Separate states for top countries fetch
  const [topCountriesLoading, setTopCountriesLoading] = useState<boolean>(false);
  const [topCountriesError, setTopCountriesError] = useState<string | null>(null);
  // Use a dedicated state for the active tab
  const [activeTab, setActiveTab] = useState<'downloads' | 'visualizations' | 'simulations'>('downloads');

  // Fetch weekly data for a specific data type
  const fetchData = async (type: 'downloads' | 'visualizations' | 'simulations') => {
    try {
      const response = await fetch(`http://localhost:8081/usage/public/weekly_usage/${type}/`);
      if (!response.ok) {
        throw new Error('Failed to fetch weekly usage data');
      }
      const data = await response.json();
      if (data && data.result) {
        setChartData(data.result);
      } else {
        throw new Error('Invalid weekly usage data received');
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('An unknown error occurred while fetching weekly data');
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
        console.log('Top Countries:', data.result); // Debug log
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

  // Fetch all data in parallel using Promise.all to reduce wait time
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

  // Make union type key for safe access to ChartData properties
  const key: 'downloads_total' | 'visualizations_total' | 'simulations_total' =
    `${activeTab}_total` as 'downloads_total' | 'visualizations_total' | 'simulations_total';

  // Prep chart configuration for Chart.js
  const chartDataConfig = {
    labels: chartData.map((item) => `Week ${item.week_number}`),
    datasets: [
      {
        label: activeTab.charAt(0).toUpperCase() + activeTab.slice(1),
        data: chartData.map((item) => item[key] ?? 0),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  } as any; // Cast to any to bypass strict Chart.js type errors

  // Configure chart options (using default maintainAspectRatio)
  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Weekly ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Data`,
      },
    },
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Usage Statistics" size="xl">
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div style={{ display: 'flex', gap: '1rem' }}>
          {/* Usage stats and graph */}
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

              <Tabs.Panel value="downloads" pt="xs">
                {chartData.length ? (
                  <div style={{ width: '100%' }}>
                    <h3 style={{ textAlign: 'left' }}>Data for Downloads</h3>
                    <Line data={chartDataConfig} options={chartOptions} />
                  </div>
                ) : (
                  <p>No data available</p>
                )}
              </Tabs.Panel>
              <Tabs.Panel value="visualizations" pt="xs">
                {chartData.length ? (
                  <div style={{ width: '100%' }}>
                    <h3 style={{ textAlign: 'left' }}>Data for Visualizations</h3>
                    <Line data={chartDataConfig} options={chartOptions} />
                  </div>
                ) : (
                  <p>No data available</p>
                )}
              </Tabs.Panel>
              <Tabs.Panel value="simulations" pt="xs">
                {chartData.length ? (
                  <div style={{ width: '100%' }}>
                    <h3 style={{ textAlign: 'left' }}>Data for Simulations</h3>
                    <Line data={chartDataConfig} options={chartOptions} />
                  </div>
                ) : (
                  <p>No data available</p>
                )}
              </Tabs.Panel>
            </Tabs>
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
          <div style={{ width: '200px', borderLeft: '1px solid #ccc', paddingLeft: '1rem' }}>
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
