import React, { useState } from "react";
import { Modal, Button, NumberInput, Group, Text } from "@mantine/core";

export function QuestionnairesModal({ opened, onClose, client_ip }: { opened: boolean; onClose: () => void; client_ip: string }) {
  const [rating, setRating] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === "") {
      setError("Please provide a rating between 1 and 10.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8081/survey/public/surveys/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: client_ip, rating }),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      alert(`Submission successful! Rating: ${rating}`);
      setRating("");
      onClose();
    } catch (error) {
      setError("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="User Survey">
      <NumberInput
        label="Thank you for using the app. If you can, please rate 1-10 for this app"
        placeholder="Please enter a number"
        value={rating}
        onChange={(value) => setRating(typeof value === "number" ? value : "")}
        min={1}
        max={10}
      />
      {error && <Text color="red" mt="sm">{error}</Text>}
      <Group justify="flex-end" mt="md">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} loading={loading}>Submit</Button>
      </Group>
    </Modal>
  );
}
