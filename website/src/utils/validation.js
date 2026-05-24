// Defensive payload validation/normalization helpers for CMS/Backend data.

export function asArray(value) {
    return Array.isArray(value) ? value : [];
}

export function asString(value) {
    if (value === null || value === undefined) return "";
    return String(value);
}

export function nullableString(value) {
    if (value === null || value === undefined) return null;
    const s = String(value).trim();
    return s ? s : null;
}

export function asNullableObject(value) {
    if (!value || typeof value !== "object") return null;
    return value;
}

export function asBoolean(value, fallback = false) {
    if (value === null || value === undefined) return fallback;
    return Boolean(value);
}

export function asNullableNumber(value) {
    if (value === null || value === undefined) return null;
    const n = typeof value === "number" ? value : Number(value);
    return Number.isFinite(n) ? n : null;
}

