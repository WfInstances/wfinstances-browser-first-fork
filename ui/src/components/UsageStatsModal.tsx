import React, { useEffect, useState } from 'react';
import { Modal, Button } from '@mantine/core';
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
  month_name: string;
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
  const [dataType, setDataType] = useState<'downloads' | 'visualizations' | 'simulations'>('downloads');

  // Function to fetch weekly data for a specific data type
  const fetchData = async (type: 'downloads' | 'visualizations' | 'simulations') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8081/usage/public/monthly_usage/${type}/`);
      if (!response.ok) {
        throw new Error('Failed to fetch monthly usage data');
      }
      const data = await response.json();
      if (data && data.result) {
        setChartData(data.result);
      } else {
        setError('Invalid monthly usage data received');
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('An unknown error occurred while fetching weekly data');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch totals data
  const fetchTotals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8081/usage/public/totals/');
      if (!response.ok) {
        throw new Error('Failed to fetch totals data');
      }
      const data = await response.json();
      if (data && data.result) {
        setTotals(data.result);
      } else {
        setError('Invalid totals data received');
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('An unknown error occurred while fetching totals data');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch top countries data
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
        setTopCountriesError('Invalid top countries data received');
      }
    } catch (err: unknown) {
      if (err instanceof Error) setTopCountriesError(err.message);
      else setTopCountriesError('An unknown error occurred while fetching top countries data');
    } finally {
      setTopCountriesLoading(false);
    }
  };

  // When modal is opened or dataType changes, fetch totals, weekly data, and top countries
  useEffect(() => {
    if (opened) {
      fetchTotals();
      fetchData(dataType);
      fetchTopCountries();
    }
  }, [opened, dataType]);

  // Make a union type key for safe access to ChartData properties
  const key: 'downloads_total' | 'visualizations_total' | 'simulations_total' =
    `${dataType}_total` as 'downloads_total' | 'visualizations_total' | 'simulations_total';

  // List of all months
  const allMonths = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Fill in missing months
  const missingMonths = allMonths.filter(month => !chartData.some(item => item.month_name === month));
  missingMonths.forEach(month => {
    chartData.push({
      month_name: month,
      [key]: 0, // Default to 0 for missing data
      ips: [],  // No IPs for missing data
    });
  });

  // Re-sort chart data to match the correct month order
  chartData.sort((a, b) => allMonths.indexOf(a.month_name) - allMonths.indexOf(b.month_name));

  // Prepare the chart configuration for Chart.js
  const chartDataConfig = {
    labels: chartData.map((item) => item.month_name),
    datasets: [
      {
        label: dataType.charAt(0).toUpperCase() + dataType.slice(1),
        // Ensure the data is a number array; if missing, default to 0
        data: chartData.map((item) => item[key] ?? 0),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
      {
        label: 'Unique IPs',
        data: chartData.map((item) => item.ips.length), 
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderDash: [5, 5], 
        tension: 0.1,
      }
    ],
  };

  // Chart options configuration.
  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Monthly ${dataType.charAt(0).toUpperCase() + dataType.slice(1)} Data`,
      },
    },
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Usage Stats" size="xl">
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div style={{ display: 'flex', gap: '1rem', minHeight: '500px' }}>
          {/* Usage stats and chart */}
          <div style={{ flex: 1 }}>
            <div>
              <Button onClick={() => setDataType('downloads')}>Downloads</Button>
              <Button onClick={() => setDataType('visualizations')}>Visualizations</Button>
              <Button onClick={() => setDataType('simulations')}>Simulations</Button>
            </div>
            {totals && (
              <div>
                <h3>Total Counts</h3>
                <p>Total Downloads: {totals.downloads}</p>
                <p>Total Visualizations: {totals.visualizations}</p>
                <p>Total Simulations: {totals.simulations}</p>
              </div>
            )}
            {chartData.length ? (
              <div>
                <h3>Data for {dataType}</h3>
                <Line data={chartDataConfig} options={chartOptions} />
              </div>
            ) : (
              <p>No data available</p>
            )}
          </div>
          {/* Top countries sidebar */}
          <div style={{ width: '300px', borderLeft: '1px solid #ccc', paddingLeft: '1rem' }}>
            <h3>Top 10 Countries</h3>
            {topCountriesLoading ? (
              <p>Loading top countries...</p>
            ) : topCountriesError ? (
              <p>Error: {topCountriesError}</p>
            ) : topCountries.length > 0 ? (
              <table style={{ width: '100%', textAlign: 'left', fontSize: '0.9rem' }}>
                <tbody>
                {topCountries.map(([country, count], index) => (
                  <tr key={index}>
                    <td style={{ width: '30px' }}>{index + 1}</td>
                    <td>{country} ({count})</td>
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
