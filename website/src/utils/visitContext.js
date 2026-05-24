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

export function buildVisitSearchParams({ collection = null, home = null } = {}) {
    const params = new URLSearchParams();

    if (collection?.slug) params.set("collection", collection.slug);
    else if (collection?.name) params.set("collection", collection.name);

    if (collection?.name) params.set("collection_name", collection.name);
    if (collection?.tone) params.set("collection_tone", collection.tone);
    if (collection?.symbol) params.set("collection_symbol", collection.symbol);

    if (home?.slug) params.set("home", home.slug);
    else if (home?.id) params.set("home", String(home.id));
    else if (home?.name) params.set("home", home.name);

    if (home?.name) params.set("home_name", home.name);

    const query = params.toString();
    return query ? `/visit?${query}` : "/visit";
}

export function resolveVisitContext({ collections = [], homes = [], searchParams }) {
    const collectionValue = searchParams?.get("collection") || searchParams?.get("collection_name") || "";
    const homeValue = searchParams?.get("home") || searchParams?.get("home_name") || "";

    const collection = findMatch(collections, collectionValue);
    const home = findMatch(homes, homeValue, ["slug", "name", "id"]);

    const fallbackCollection = collection || collections[0] || null;
    const fallbackHome = home || homes.find((entry) => entry.collection_slug === fallbackCollection?.slug) || homes[0] || null;

    const resolvedCollection = fallbackCollection || null;
    const resolvedHome = fallbackHome || null;

    return {
        collection: resolvedCollection,
        home: resolvedHome,
        collectionName: resolvedCollection?.name || searchParams?.get("collection_name") || "your selected collection",
        collectionTone: resolvedCollection?.tone || searchParams?.get("collection_tone") || "",
        collectionSymbol: resolvedCollection?.symbol || searchParams?.get("collection_symbol") || "",
        homeName: resolvedHome?.name || searchParams?.get("home_name") || "",
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
