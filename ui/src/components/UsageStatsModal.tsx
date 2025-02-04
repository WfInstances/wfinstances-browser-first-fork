import React, { useEffect, useState } from 'react';
import { Modal } from '@mantine/core';

type Totals = {
  downloads: number;
  visualizations: number;
  simulations: number;
};

export function UsageStatsModal({
                                  opened,
                                  onClose,
                                }: {
  opened: boolean;
  onClose: () => void;
}) {
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (opened) {
      setLoading(true);
      fetch('http://localhost:8081/usage/public/totals/')
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to retrieve totals');
          }
          return response.json();
        })
        .then((data) => {
          if (data && data.result) {
            setTotals(data.result);
          } else {
            setError('Invalid data received');
          }
        })
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [opened]);

  return (
    <Modal opened={opened} onClose={onClose} title="Usage Report">
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : totals ? (
        <>
          <p>Total downloads: {totals.downloads}</p>
          <p>Total visualizations: {totals.visualizations}</p>
          <p>Total simulations: {totals.simulations}</p>
        </>
      ) : (
        <p>No data available</p>
      )}
    </Modal>
  );
}
