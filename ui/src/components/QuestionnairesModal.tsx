import React, { useState } from "react";
import { Modal, Button, NumberInput, Group, Text, Stack } from "@mantine/core";

export function QuestionnairesModal({
  opened,
  onClose,
  client_ip,
}: {
  opened: boolean;
  onClose: () => void;
  client_ip: string;
}) {
  const [usefulnessRating, setUsefulnessRating] = useState<number | "">("");
  const [usabilityRating, setUsabilityRating] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (usefulnessRating === "" || usabilityRating === "") {
      setError("Please provide both ratings between 1 and 10.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8081/survey/public/surveys/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ip: client_ip,
          usefulness: usefulnessRating,
          usability: usabilityRating,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      alert(
        `Submission successful!\nUsefulness: ${usefulnessRating}\nUsability: ${usabilityRating}`
      );

      setUsefulnessRating("");
      setUsabilityRating("");
      onClose();
    } catch (error) {
      setError("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="User Survey">
      <Stack>
        <Text>On a scale of 1 to 10, how would you rate the usefulness of this application?</Text>
        <NumberInput
          placeholder="Enter your rating"
          value={usefulnessRating}
          onChange={(value) => setUsefulnessRating(typeof value === "number" ? value : "")}
          min={1}
          max={10}
        />

        <Text>On a scale of 1 to 10, how would you rate the usability of this application?</Text>
        <NumberInput
          placeholder="Enter your rating"
          value={usabilityRating}
          onChange={(value) => setUsabilityRating(typeof value === "number" ? value : "")}
          min={1}
          max={10}
        />

        {error && <Text color="red">{error}</Text>}

        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Submit
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
