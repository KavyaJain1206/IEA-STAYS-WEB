import {
    resolveCollectionById,
    resolveCollectionBySlug,
    resolveHomeById,
    resolveHomeBySlug,
    ensureCollectionHomeLink,
} from "./resolvers.js";

// NOTE: legacy name-based matching removed. Identity must be resolved by ID/slug.
const normalize = (value) => (value || "").trim().toLowerCase();


function findMatch(items, value, keys = ["slug", "name", "id"]) {
    const target = normalize(value);
    if (!target || !Array.isArray(items)) return null;

    return (
        items.find((item) =>
            keys.some((key) => normalize(item?.[key]) === target)
        ) || null
    );
}


// Build visit links using stable backend identity (IDs). Avoid name/tone/symbol inference.
export function buildVisitSearchParams({ collection = null, home = null } = {}) {
    const params = new URLSearchParams();

    // Prefer IDs; fall back to slug only when IDs are missing.
    if (collection?.id !== undefined && collection?.id !== null) params.set("collection_id", String(collection.id));
    else if (collection?.slug) params.set("collection_slug", collection.slug);

    if (home?.id !== undefined && home?.id !== null) params.set("home_id", String(home.id));
    else if (home?.slug) params.set("home_slug", home.slug);

    const query = params.toString();
    return query ? `/visit?${query}` : "/visit";
}

export function resolveVisitContext({ collections = [], homes = [], searchParams }) {


    const sp = searchParams || { get: () => null };


    const collectionId = sp.get("collection_id") || null;
    const collectionSlug = sp.get("collection_slug") || null;
    const homeId = sp.get("home_id") || null;
    const homeSlug = sp.get("home_slug") || null;

    // Resolve by ID/slug only. Do NOT use name/tone/symbol to infer identity.




    let resolvedCollection = null;

    if (collectionId !== null) resolvedCollection = resolveCollectionById(collections, collectionId);
    if (!resolvedCollection && collectionSlug) resolvedCollection = resolveCollectionBySlug(collections, collectionSlug);
    if (!resolvedCollection && Array.isArray(collections) && collections.length) resolvedCollection = collections[0];

    let resolvedHome = null;
    if (homeId !== null) resolvedHome = resolveHomeById(homes, homeId);
    if (!resolvedHome && homeSlug) resolvedHome = resolveHomeBySlug(homes, homeSlug);

    // If home is set but doesn't belong to the resolved collection, ignore it.
    if (resolvedHome && resolvedCollection && !ensureCollectionHomeLink(resolvedCollection, resolvedHome)) {
        resolvedHome = null;
    }

    // If no home, pick the first home under the resolved collection.
    if (!resolvedHome && resolvedCollection) {
        resolvedHome = (homes || []).find((h) => (h?.collectionSlug || h?.collection?.slug) === resolvedCollection?.slug) || null;
    }

    // Final fallback.
    if (!resolvedHome && Array.isArray(homes) && homes.length) resolvedHome = homes[0];

    return {
        collection: resolvedCollection || null,
        home: resolvedHome || null,
        collectionName: resolvedCollection?.name || "your selected collection",
        collectionTone: resolvedCollection?.tone || "",
        collectionSymbol: resolvedCollection?.symbol || "",
        homeName: resolvedHome?.name || "",
    };
}


export function buildVisitCopy(context) {
    const collectionName = context.collectionName || "your selected collection";
    const homeName = context.homeName || "";
    const tone = context.collectionTone || "";
    const symbol = context.collectionSymbol || "";
    const collectionLabel = `${collectionName} Collection`;

    return {
        title: homeName
            ? `Book a visit to ${homeName} in the ${collectionLabel}.`
            : `Book a visit to a ${collectionName} home.`,
        description: tone
            ? `${symbol ? `${symbol} ` : ""}${collectionLabel} has a ${tone.toLowerCase()} tone. Use this form to share your preferred visit window and our team will follow up with availability and next steps.`
            : `Share your contact details and preferred visit window for the ${collectionLabel}. Our team will follow up with availability and next steps.`,
        intro: homeName
            ? `You are enquiring about ${homeName} in the ${collectionLabel}.`
            : `You are enquiring about the ${collectionLabel}.`,
        placeholder: homeName
            ? `Add any questions for ${homeName} in the ${collectionLabel}, or mention move-in preferences.`
            : `Add any questions or preferences for this collection.`,
        confirmation: homeName
            ? `Visit request submitted for ${homeName} in the ${collectionLabel}. The IEA Stays team will contact you soon.`
            : `Visit request submitted for the ${collectionLabel}. The IEA Stays team will contact you soon.`,
    };
}
