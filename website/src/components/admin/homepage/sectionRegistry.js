const safeParse = (value, fallback) => {
    if (!value) return fallback;
    if (typeof value !== "string") return value;
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

export const SECTION_TYPES = [
    {
        type: "hero",
        key: "hero",
        label: "Hero",
        description: "Main homepage message, CTA, and image.",
        createHint: "Homepage title, description, CTA text, and hero image.",
        defaultContent: () => ({
            title: "Premium PG stays, shaped around comfort and belonging.",
            description:
                "IEA Stays Live brings you a chain of refined PG homes, each inspired by a zodiac sign and crafted for modern living, community, and peace of mind.",
            cta_primary_text: "Explore Homes",
            cta_primary_href: "#homes",
            cta_secondary_text: "Book a Visit",
            cta_secondary_href: "/visit",
            image_src: "",
            image_alt: "",
        }),
        validate: (draft) => {
            if (!draft.title?.trim()) return "Hero title is required.";
            if (!draft.content?.description?.trim()) return "Hero description is required.";
            if (!draft.content?.cta_primary_text?.trim()) return "Primary CTA text is required.";
            return "";
        },
        summarize: (draft) => [draft.content?.cta_primary_text || "Primary CTA", draft.content?.description || "No description"],
    },
    {
        type: "featured_homes",
        key: "featured_homes",
        label: "Featured Homes",
        description: "Select which homes appear on the homepage.",
        createHint: "Choose homes, title the block, and adjust the order.",
        defaultContent: () => ({
            title: "Featured Homes",
            description: "Selected homes to highlight on the homepage.",
            home_ids: [],
        }),
        validate: (draft) => {
            if (!draft.content?.home_ids?.length) return "Select at least one home to feature.";
            return "";
        },
        summarize: (draft, context) => {
            const ids = draft.content?.home_ids || [];
            const names = ids
                .map((id) => context.homesById?.[String(id)]?.name)
                .filter(Boolean);
            return [names.length ? names.join(", ") : `${ids.length} homes selected`, draft.content?.description || "No description"];
        },
    },
    {
        type: "featured_collections",
        key: "featured_collections",
        label: "Featured Collections",
        description: "Select collections for homepage emphasis and ordering.",
        createHint: "Choose collections, title the block, and adjust the order.",
        defaultContent: () => ({
            title: "Featured Collections",
            description: "Collections highlighted on the homepage.",
            collection_ids: [],
        }),
        validate: (draft) => {
            if (!draft.content?.collection_ids?.length) return "Select at least one collection to feature.";
            return "";
        },
        summarize: (draft, context) => {
            const ids = draft.content?.collection_ids || [];
            const names = ids
                .map((id) => context.collectionsById?.[String(id)]?.name)
                .filter(Boolean);
            return [names.length ? names.join(", ") : `${ids.length} collections selected`, draft.content?.description || "No description"];
        },
    },
    {
        type: "testimonials",
        key: "testimonials",
        label: "Testimonials",
        description: "Edit testimonials shown on the homepage.",
        createHint: "Add testimonials with names, roles, quotes, and optional images.",
        defaultContent: () => ({
            title: "What residents say",
            description: "Real resident feedback and stories.",
            items: [
                {
                    name: "",
                    role: "",
                    quote: "",
                    image_src: "",
                },
            ],
        }),
        validate: (draft) => {
            if (!draft.content?.items?.length) return "Add at least one testimonial.";
            if (!draft.content.items.some((item) => item.name?.trim() && item.quote?.trim())) {
                return "Every testimonial needs a name and quote.";
            }
            return "";
        },
        summarize: (draft) => [
            `${draft.content?.items?.length || 0} testimonials`,
            draft.content?.items?.[0]?.name ? `First: ${draft.content.items[0].name}` : "No testimonials added",
        ],
    },
    {
        type: "stats",
        key: "stats",
        label: "Stats",
        description: "Edit homepage metric cards.",
        createHint: "Set stat values and line breaks exactly as they should appear.",
        defaultContent: () => ({
            title: "Why residents choose IEA Stays",
            description: "Key numbers and trust markers.",
            items: [
                { value: "12", lines: ["Zodiac Collections", "Unique PG Chains"] },
                { value: "30+", lines: ["Curated Locations", "Across Cities"] },
                { value: "1,000+", lines: ["Happy Residents", "And Growing"] },
            ],
        }),
        validate: (draft) => {
            if (!draft.content?.items?.length) return "Add at least one stat item.";
            if (!draft.content.items.some((item) => item.value?.trim())) return "Each stat needs a value.";
            return "";
        },
        summarize: (draft) => [`${draft.content?.items?.length || 0} stat cards`, draft.content?.description || "No description"],
    },
    {
        type: "promises",
        key: "promises",
        label: "Promises",
        description: "Edit the trust and service promise cards.",
        createHint: "Add promise cards, icons, and descriptions.",
        defaultContent: () => ({
            title: "What we promise",
            description: "Reliable, managed, and community-led living.",
            items: [
                {
                    icon: "✦",
                    title: "Verified Homes",
                    description: "Every home is verified for quality, safety, and reliability.",
                },
            ],
        }),
        validate: (draft) => {
            if (!draft.content?.items?.length) return "Add at least one promise card.";
            if (!draft.content.items.some((item) => item.title?.trim() && item.description?.trim())) {
                return "Every promise needs a title and description.";
            }
            return "";
        },
        summarize: (draft) => [`${draft.content?.items?.length || 0} promise cards`, draft.content?.description || "No description"],
    },
    {
        type: "coming",
        key: "coming",
        label: "Coming Soon",
        description: "Edit the upcoming collection teaser.",
        createHint: "Adjust the teaser text, symbol, and optional image.",
        defaultContent: () => ({
            name: "Taurus",
            tone: "Grounded. Warm. Sensory.",
            description:
                "This zodiac-led PG collection is being curated. Soon, it will have its own homes, imagery, amenities, and story while keeping the same premium IEA Stays experience.",
            symbol: "♉",
            image_src: "",
            image_alt: "",
        }),
        validate: (draft) => {
            if (!draft.content?.name?.trim()) return "Collection name is required.";
            if (!draft.content?.description?.trim()) return "Teaser description is required.";
            return "";
        },
        summarize: (draft) => [draft.content?.name || "Upcoming collection", draft.content?.tone || "No tone set"],
    },
];

export function getSectionType(type) {
    return SECTION_TYPES.find((entry) => entry.type === type) || SECTION_TYPES[0];
}

export function getSectionOptions() {
    return SECTION_TYPES.map((entry) => ({
        label: entry.label,
        value: entry.type,
        description: entry.description,
    }));
}

export function createEmptyDraft(type = SECTION_TYPES[0].type) {
    const meta = getSectionType(type);
    return {
        key: meta.key,
        type: meta.type,
        title: meta.defaultContent().title || meta.label,
        is_active: true,
        sort_order: 0,
        content: meta.defaultContent(),
    };
}

export function draftFromSection(section) {
    const meta = getSectionType(section.type);
    const fallback = meta.defaultContent();
    const parsed = safeParse(section.content_json, fallback);
    const content = section.type === "hero"
        ? {
            ...fallback,
            ...parsed,
            title: parsed.title || fallback.title,
            description: parsed.description || parsed.subtitle || fallback.description,
        }
        : {
            ...fallback,
            ...parsed,
        };
    return {
        id: section.id,
        key: section.key || meta.key,
        type: section.type,
        title: section.title || fallback.title || meta.label,
        is_active: Boolean(section.is_active),
        sort_order: section.sort_order ?? 0,
        content,
    };
}

export function serializeDraft(draft) {
    const content = draft.type === "hero"
        ? {
            ...draft.content,
            subtitle: draft.content?.description || draft.content?.subtitle || "",
            description: draft.content?.description || "",
        }
        : draft.content || {};

    return {
        key: draft.key,
        type: draft.type,
        title: draft.title?.trim() || null,
        content_json: JSON.stringify(content),
        is_active: Boolean(draft.is_active),
        sort_order: Number(draft.sort_order) || 0,
    };
}

export function validateDraft(draft) {
    const meta = getSectionType(draft.type);
    return meta.validate(draft);
}

export function summarizeDraft(draft, context = {}) {
    const meta = getSectionType(draft.type);
    return meta.summarize ? meta.summarize(draft, context) : [];
}
