// Collection/Home resolver utilities (single source of truth for identity lookups)

const toNullableString = (v) => {
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    return s ? s : null;
};

const toNullableNumber = (v) => {
    if (v === null || v === undefined) return null;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : null;
};

export function coerceId(value) {
    // Prefer stable numeric id when available; otherwise fallback to string.
    const n = toNullableNumber(value);
    if (n !== null) return n;
    return toNullableString(value);
}

export function buildIndexById(items = []) {
    const map = {};
    for (const item of items || []) {
        if (!item) continue;
        const id = coerceId(item.id);
        if (id === null || id === undefined) continue;
        map[String(id)] = item;
    }
    return map;
}

export function resolveCollectionById(collections = [], collectionId) {
    const idx = buildIndexById(collections);
    const key = coerceId(collectionId);
    if (key === null) return null;
    return idx[String(key)] || null;
}

export function resolveCollectionBySlug(collections = [], collectionSlug) {
    const target = toNullableString(collectionSlug);
    if (!target) return null;
    const normalized = target.toLowerCase();
    return (
        (collections || []).find((c) => {
            const slug = toNullableString(c?.slug);
            return slug && slug.toLowerCase() === normalized;
        }) || null
    );
}

export function resolveHomeById(homes = [], homeId) {
    const idx = buildIndexById(homes);
    const key = coerceId(homeId);
    if (key === null) return null;
    return idx[String(key)] || null;
}

export function resolveHomeBySlug(homes = [], homeSlug) {
    const target = toNullableString(homeSlug);
    if (!target) return null;
    const normalized = target.toLowerCase();
    return (
        (homes || []).find((h) => {
            const slug = toNullableString(h?.slug);
            return slug && slug.toLowerCase() === normalized;
        }) || null
    );
}

export function resolveHomeByName(homes = [], homeName) {
    const target = toNullableString(homeName);
    if (!target) return null;
    const normalized = target.toLowerCase();
    return (
        (homes || []).find((h) => {
            const name = toNullableString(h?.name);
            return name && name.toLowerCase() === normalized;
        }) || null
    );
}

export function normalizeArray(value) {
    return Array.isArray(value) ? value : [];
}

export function ensureCollectionHomeLink(collection, home) {
    // Returns true if home belongs to collection, false otherwise.
    if (!collection || !home) return false;
    const collectionSlug = toNullableString(collection?.slug);
    const homeCollectionSlug = toNullableString(home?.collectionSlug || home?.collection?.slug);
    return collectionSlug ? homeCollectionSlug === collectionSlug : false;
}

