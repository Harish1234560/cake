export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function getMinDeliveryDate(leadTimeHours: number): string {
  const now = new Date();
  const cutoffHour = 16;
  const minDate = new Date(now);

  const neededHours = leadTimeHours;
  if (now.getHours() >= cutoffHour) {
    minDate.setDate(minDate.getDate() + 1);
    minDate.setHours(9, 0, 0, 0);
  } else {
    const deliveryPossible = new Date(now.getTime() + neededHours * 60 * 60 * 1000);
    if (deliveryPossible.getDate() !== now.getDate()) {
      minDate.setTime(deliveryPossible.getTime());
      minDate.setHours(9, 0, 0, 0);
    }
  }

  const addDays = Math.ceil(neededHours / 24);
  if (addDays > 0) {
    minDate.setDate(minDate.getDate() + addDays - 1);
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const final = minDate.getTime() > tomorrow.getTime() ? minDate : tomorrow;

  return final.toISOString().split('T')[0];
}
