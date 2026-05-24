import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    createHomepageSection,
    deleteHomepageSection,
    getAdminProfile,
    listAdminCollections,
    listAdminHomes,
    listHomepageSections,
    updateHomepageSection,
    uploadAdminCatalogImage,
} from "../services/api.js";
import { HomepageSectionEditor } from "../components/admin/homepage/HomepageSectionEditor.jsx";
import { HomepageSectionList } from "../components/admin/homepage/HomepageSectionList.jsx";
import { SECTION_TYPES, createEmptyDraft, draftFromSection, serializeDraft, validateDraft } from "../components/admin/homepage/sectionRegistry.js";

export default function AdminHomepageSectionsPage() {
    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem("ieaAdminToken"), []);
    const [admin, setAdmin] = useState(null);
    const [sections, setSections] = useState([]);
    const [collections, setCollections] = useState([]);
    const [homes, setHomes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [draft, setDraft] = useState(null);
    const [pendingType, setPendingType] = useState("hero");

    useEffect(() => {
        document.body.classList.add("admin-route");
        return () => document.body.classList.remove("admin-route");
    }, []);

    useEffect(() => {
        if (!token) {
            navigate("/admin/login");
            return;
        }

        const load = async () => {
            try {
                const [profile, sectionData, collectionData, homeData] = await Promise.all([
                    getAdminProfile(token),
                    listHomepageSections({ includeInactive: true }),
                    listAdminCollections(token, { includeInactive: true }),
                    listAdminHomes(token, { includeInactive: true }),
                ]);

                setAdmin(profile);
                setSections(sectionData || []);
                setCollections(collectionData || []);
                setHomes(homeData || []);

                if (!draft && !(sectionData || []).length) {
                    setPendingType("hero");
                    setDraft(createEmptyDraft("hero"));
                }
            } catch (error) {
                setMessage(error.message || "Unable to load homepage content.");
            } finally {
                setLoading(false);
            }
        };

        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate, token]);

    const catalog = useMemo(() => {
        const collectionsById = Object.fromEntries(collections.map((collection) => [String(collection.id), collection]));
        const homesById = Object.fromEntries(homes.map((home) => [String(home.id), home]));
        return { collections, homes, collectionsById, homesById };
    }, [collections, homes]);

    const existingTypes = new Set(sections.map((section) => section.type));
    const availableTypes = SECTION_TYPES.filter((entry) => !existingTypes.has(entry.type)).map((entry) => ({
        label: entry.label,
        value: entry.type,
        description: entry.description,
    }));

    useEffect(() => {
        if (!availableTypes.length) return;
        setPendingType((current) => (availableTypes.some((option) => option.value === current) ? current : availableTypes[0].value));
    }, [availableTypes]);

    const activeCount = sections.filter((section) => section.is_active).length;

    const sortedSections = useMemo(() => {
        return [...sections].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id);
    }, [sections]);

    const refresh = async () => {
        const [sectionData, collectionData, homeData] = await Promise.all([
            listHomepageSections({ includeInactive: true }),
            listAdminCollections(token, { includeInactive: true }),
            listAdminHomes(token, { includeInactive: true }),
        ]);
        setSections(sectionData || []);
        setCollections(collectionData || []);
        setHomes(homeData || []);
    };

    const startCreate = (type = availableTypes[0]?.value || "hero") => {
        setPendingType(type);
        setDraft(createEmptyDraft(type));
        setMessage("");
    };

    const startEdit = (section) => {
        setDraft(draftFromSection(section));
        setMessage("");
    };

    const clearDraft = () => {
        setDraft(null);
        setMessage("");
    };

    const handleSave = async () => {
        if (!draft || !token) return;

        const error = validateDraft(draft);
        if (error) {
            setMessage(error);
            return;
        }

        setSaving(true);
        setMessage("");
        try {
            const payload = serializeDraft(draft);
            if (draft.id) {
                await updateHomepageSection(token, draft.id, payload);
                setMessage(`${draft.type} section updated.`);
            } else {
                await createHomepageSection(token, payload);
                setMessage(`${draft.type} section created.`);
            }

            await refresh();
            clearDraft();
        } catch (error) {
            setMessage(error.message || "Unable to save section.");
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (section) => {
        try {
            await updateHomepageSection(token, section.id, { is_active: !section.is_active });
            await refresh();
        } catch (error) {
            setMessage(error.message || "Unable to update visibility.");
        }
    };

    const handleDelete = async (section) => {
        if (!window.confirm(`Delete ${section.type} content?`)) return;
        try {
            await deleteHomepageSection(token, section.id);
            await refresh();
            if (draft?.id === section.id) clearDraft();
        } catch (error) {
            setMessage(error.message || "Unable to delete section.");
        }
    };

    if (loading) {
        return <div className="admin-empty">Loading homepage content...</div>;
    }

    return (
        <main className="admin-page">
            <aside className="admin-sidebar">
                <Link className="admin-wordmark" to="/admin">
                    <span>&#10022;</span> IEA Stays
                </Link>

                <div>
                    <p className="admin-kicker">Homepage CMS</p>
                    <h1>Content</h1>
                    <p className="admin-sidebar-copy">
                        Manage the homepage as website content, not as technical data structures.
                    </p>
                </div>

                <div className="admin-sidebar-actions">
                    <button className="admin-logout" type="button" onClick={() => navigate("/admin")}>Back to dashboard</button>
                    <Link className="admin-logout admin-link-button" to="/admin/catalog">
                        Manage catalog
                    </Link>
                </div>
            </aside>

            <section className="admin-workspace">
                <header className="admin-header">
                    <div>
                        <p className="admin-kicker">Homepage Builder</p>
                        <h2>Homepage content</h2>
                    </div>
                    <div className="admin-profile">
                        <span>{admin?.full_name || "Admin"}</span>
                        <small>{admin?.email}</small>
                    </div>
                </header>

                <div className="admin-summary">
                    <article>
                        <span>Total Sections</span>
                        <strong>{sections.length}</strong>
                    </article>
                    <article>
                        <span>Visible</span>
                        <strong>{activeCount}</strong>
                    </article>
                    <article>
                        <span>Ready</span>
                        <strong>{draft ? "Editing" : "Browse"}</strong>
                    </article>
                </div>

                {message ? <p className="admin-error">{message}</p> : null}

                <div className="admin-shell">
                    <section className="admin-page-card">
                        <div className="admin-page-card-head">
                            <div>
                                <p className="admin-kicker">Create new content</p>
                                <h3>Start a section</h3>
                                <p className="admin-page-card-copy">
                                    Choose a homepage block and fill in the website fields. No JSON editing required.
                                </p>
                            </div>

                            <div className="admin-page-actions">
                                <select
                                    className="admin-secondary"
                                    value={pendingType}
                                    onChange={(event) => setPendingType(event.target.value)}
                                    disabled={!availableTypes.length}
                                >
                                    {availableTypes.length ? (
                                        availableTypes.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="">All section types already exist</option>
                                    )}
                                </select>
                                <button className="admin-primary" type="button" onClick={() => startCreate(pendingType || availableTypes[0]?.value || "hero")}
                                    disabled={!availableTypes.length}
                                >
                                    Add section
                                </button>
                            </div>
                        </div>

                        <div className="admin-page-card-body">
                            <p className="admin-muted">
                                Supported section types: {SECTION_TYPES.map((entry) => entry.label).join(", ")}.
                            </p>
                        </div>
                    </section>

                    {draft ? (
                        <HomepageSectionEditor
                            draft={draft}
                            onDraftChange={setDraft}
                            catalog={catalog}
                            token={token}
                            onUploadImage={uploadAdminCatalogImage}
                            availableTypes={availableTypes}
                        />
                    ) : null}

                    {draft ? (
                        <section className="admin-page-card">
                            <div className="admin-page-card-head">
                                <div>
                                    <p className="admin-kicker">Actions</p>
                                    <h3>Save changes</h3>
                                    <p className="admin-page-card-copy">Save when the content reads like website copy, not database data.</p>
                                </div>
                            </div>
                            <div className="admin-page-card-body admin-page-actions">
                                <button className="admin-primary" type="button" disabled={saving} onClick={handleSave}>
                                    {saving ? "Saving..." : draft.id ? "Update section" : "Create section"}
                                </button>
                                <button className="admin-secondary" type="button" onClick={clearDraft}>
                                    Cancel
                                </button>
                            </div>
                        </section>
                    ) : null}

                    <HomepageSectionList
                        sections={sortedSections}
                        catalog={catalog}
                        onEdit={startEdit}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                    />
                </div>
            </section>
        </main>
    );
}