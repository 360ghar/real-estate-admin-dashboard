const OFFSET_OR_Z_SUFFIX = /([zZ]|[+-]\d{2}:\d{2})$/;

const padDatePart = (value: number): string => String(value).padStart(2, '0');

function normalizeServerTimestamp(value: string): string {
  const trimmed = value.trim();
  if (trimmed.includes('T') && !OFFSET_OR_Z_SUFFIX.test(trimmed)) {
    return `${trimmed}Z`;
  }
  return trimmed;
}

export function parseServerTimestamp(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const parsed = new Date(normalizeServerTimestamp(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function serverTimestampToLocalInput(value: string | Date | null | undefined): string {
  const parsed = parseServerTimestamp(value);
  if (!parsed) return '';

  const date = [
    parsed.getFullYear(),
    padDatePart(parsed.getMonth() + 1),
    padDatePart(parsed.getDate()),
  ].join('-');

  const time = `${padDatePart(parsed.getHours())}:${padDatePart(parsed.getMinutes())}`;
  return `${date}T${time}`;
}

export function localInputToServerTimestamp(value: string | null | undefined): string | null {
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toISOString();
}

export function formatDateOnlyForApi(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return [
    parsed.getFullYear(),
    padDatePart(parsed.getMonth() + 1),
    padDatePart(parsed.getDate()),
  ].join('-');
}
