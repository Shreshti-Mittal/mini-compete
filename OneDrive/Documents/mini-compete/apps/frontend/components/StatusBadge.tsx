interface StatusBadgeProps {
  status: 'OPEN' | 'CLOSING_SOON' | 'CLOSED' | 'FULL';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    OPEN: 'bg-green-100 text-green-800 border-green-200',
    CLOSING_SOON: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    CLOSED: 'bg-gray-100 text-gray-800 border-gray-200',
    FULL: 'bg-red-100 text-red-800 border-red-200',
  };

  const labels = {
    OPEN: 'Open',
    CLOSING_SOON: 'Closing Soon',
    CLOSED: 'Closed',
    FULL: 'Full',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

