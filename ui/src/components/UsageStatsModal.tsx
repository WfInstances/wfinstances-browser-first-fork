import { Modal } from '@mantine/core';

export function UsageStatsModal({
    opened,
    onClose
}: {
    opened: boolean;
    onClose: () => void;
}) {
    return (
        <Modal opened={opened} onClose={onClose} title="Usage report">
            {/* For now, just some placeholder text */}
            <p>Usage stats content goes here...</p>
            <p>How many download events?</p>
            <p>How many simulation events?</p>
            <p>Number of simulations?</p>
        </Modal>
    );
}
