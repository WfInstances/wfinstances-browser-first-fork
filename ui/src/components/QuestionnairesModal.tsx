import React, { useState } from "react";
import { Modal, Button, NumberInput, Group, Text } from "@mantine/core";

export function QuestionnairesModal({ opened, onClose, client_ip }: { opened: boolean; onClose: () => void; client_ip: string }) {
  const [ratingUsefulness, setRatingUsefulness] = useState<number | "">("");
  const [ratingUsability, setRatingUsability] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (ratingUsefulness === "" || ratingUsability === "") {
      setError("Please provide a rating between 1 and 10 for both questions.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Update satisfaction for usefulness
      const responseUsefulness = await fetch("http://localhost:8081/satisfaction/public/satisfaction/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: "usefulness", rating: ratingUsefulness }),
      });

      if (!responseUsefulness.ok) {
        throw new Error(`HTTP error on usefulness! Status: ${responseUsefulness.status}`);
      }

      // Update satisfaction for usability
      const responseUsability = await fetch("http://localhost:8081/satisfaction/public/satisfaction/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: "usability", rating: ratingUsability }),
      });

      if (!responseUsability.ok) {
        throw new Error(`HTTP error on usability! Status: ${responseUsability.status}`);
      }

      alert(`Submission successful!
Usefulness Rating: ${ratingUsefulness}
Usability Rating: ${ratingUsability}`);
      setRatingUsefulness("");
      setRatingUsability("");
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
        label="On a scale of 1 to 10, how would you rate the usefulness of this application?"
        placeholder="Please enter a number"
        value={ratingUsefulness}
        onChange={(value) => setRatingUsefulness(typeof value === "number" ? value : "")}
        min={1}
        max={10}
      />
      <NumberInput
        label="On a scale of 1 to 10, how would you rate the usability of this application?"
        placeholder="Please enter a number"
        value={ratingUsability}
        onChange={(value) => setRatingUsability(typeof value === "number" ? value : "")}
        min={1}
        max={10}
        mt="md"
      />
      {error && <Text color="red" mt="sm">{error}</Text>}
      <Group justify="flex-end" mt="md">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} loading={loading}>Submit</Button>
      </Group>
    </Modal>
  );
}
