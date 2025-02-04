import React, { useState } from "react";
import { Modal, Button, TextInput, Textarea, Group } from "@mantine/core";

export function QuestionnairesModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    feedback: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API request
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Submission successful!");
      setFormData({ name: "", email: "", feedback: "" });
      onClose();
    } catch (error) {
      setError("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="User Survey">
      <TextInput name="name" label="Name" placeholder="Enter your name" value={formData.name} onChange={handleChange} />
      <TextInput name="email" label="Email" placeholder="Enter your email" type="email" value={formData.email} onChange={handleChange} />
      <Textarea name="feedback" label="Feedback" placeholder="Enter your feedback" value={formData.feedback} onChange={handleChange} />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <Group justify="flex-end" mt="md">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} loading={loading}>Submit</Button>
      </Group>
    </Modal>
  );
}