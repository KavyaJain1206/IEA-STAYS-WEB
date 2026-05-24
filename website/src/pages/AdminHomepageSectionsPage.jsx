import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    createHomepageSection,
    deleteHomepageSection,
    listHomepageSections,
    updateHomepageSection,
    getAdminProfile,
} from "../services/api.js";

const emptyForm = {
    key: "",
    type: "hero",
    title: "",
    content_json: "",
    is_active: true,
    sort_order: 0,
};

function formatPrettyJson(value) {
    if (!value) return "";
    try {
        return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
        return value;
    }
}

function normalizeJsonInput(value) {
    if (!value) return "";
    try {
        return JSON.stringify(JSON.parse(value));
    } catch {
        return value;
    }
}

export default function AdminHomepageSectionsPage() {
    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem("ieaAdminToken"), []);
    const [admin, setAdmin] = useState(null);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);

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
                const [profile, sectionData] = await Promise.all([
                    getAdminProfile(token),
                    listHomepageSections({ includeInactive: true }),
                ]);
                setAdmin(profile);
                setSections(sectionData || []);
            } catch (error) {
                setMessage(error.message || "Unable to load homepage sections.");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [navigate, token]);

    const activeCount = sections.filter((section) => section.is_active).length;

    const sortedSections = useMemo(() => {
        return [...sections].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id);
    }, [sections]);

    const startCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setMessage("");
    };

    const startEdit = (section) => {
        setEditingId(section.id);
        setForm({
            key: section.key,
            type: section.type,
            title: section.title || "",
            content_json: formatPrettyJson(section.content_json),
            is_active: Boolean(section.is_active),
            sort_order: section.sort_order ?? 0,
        });
        setMessage("");
    };

    const refreshSections = async () => {
        const data = await listHomepageSections({ includeInactive: true });
        setSections(data || []);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!token) return;

        setSaving(true);
        setMessage("");
        try {
            const payload = {
                key: form.key.trim(),
                type: form.type.trim(),
                title: form.title.trim() || null,
                content_json: normalizeJsonInput(form.content_json),
                is_active: form.is_active,
                sort_order: Number(form.sort_order) || 0,
            };

            if (editingId) {
                await updateHomepageSection(token, editingId, payload);
            } else {
                await createHomepageSection(token, payload);
            }

            await refreshSections();
            startCreate();
            setMessage(editingId ? "Section updated." : "Section created.");
        } catch (error) {
            setMessage(error.message || "Unable to save section.");
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (section) => {
        setMessage("");
        try {
            await updateHomepageSection(token, section.id, { is_active: !section.is_active });
            await refreshSections();
        } catch (error) {
            setMessage(error.message || "Unable to update visibility.");
        }
    };

    const handleDelete = async (section) => {
        if (!confirm(`Delete ${section.key}?`)) return;
        setMessage("");
        try {
            await deleteHomepageSection(token, section.id);
            await refreshSections();
            if (editingId === section.id) {
                startCreate();
            }
        } catch (error) {
            setMessage(error.message || "Unable to delete section.");
        }
    };

    if (loading) {
        return <div className="admin-empty">Loading homepage sections...</div>;
    }

    return (
        <main className="admin-page">
            <aside className="admin-sidebar">
                <Link className="admin-wordmark" to="/admin">
                    <span>&#10022;</span> IEA Stays
                </Link>

                <div>
                    <p className="admin-kicker">Homepage CMS</p>
                    <h1>Sections</h1>
                    <p className="admin-sidebar-copy">
                        Control ordering, visibility, and reusable homepage blocks without touching the frontend.
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
                        <h2>Homepage Sections</h2>
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
                        <span>Active</span>
                        <strong>{activeCount}</strong>
                    </article>
                    <article>
                        <span>Editing</span>
                        <strong>{editingId ? "Update mode" : "Create mode"}</strong>
                    </article>
                </div>

                {message ? <p className="admin-error">{message}</p> : null}

                <div className="admin-shell">
                    <section className="admin-page-card">
                        <div className="admin-page-card-head">
                            <div>
                                <p className="admin-kicker">Editor</p>
                                <h3>{editingId ? "Edit section" : "Create section"}</h3>
                                <p className="admin-page-card-copy">
                                    Keep the existing homepage shape, but move each block into a reusable CMS-managed section.
                                </p>
                            </div>
                            <div className="admin-page-actions">
                                <button className="admin-secondary" type="button" onClick={startCreate}>
                                    Reset form
                                </button>
                            </div>
                        </div>

                        <form className="admin-page-card-body" onSubmit={handleSubmit}>
                            <div className="admin-section-create">
                                <div className="admin-form-row">
                                    <label htmlFor="section-key">Key</label>
                                    <input
                                        id="section-key"
                                        value={form.key}
                                        onChange={(event) => setForm({ ...form, key: event.target.value })}
                                        placeholder="hero, stats, promises, coming"
                                        disabled={Boolean(editingId)}
                                    />
                                </div>

                                <div className="admin-form-row">
                                    <label htmlFor="section-type">Type</label>
                                    <select
                                        id="section-type"
                                        value={form.type}
                                        onChange={(event) => setForm({ ...form, type: event.target.value })}
                                    >
                                        <option value="hero">hero</option>
                                        <option value="stats">stats</option>
                                        <option value="promises">promises</option>
                                        <option value="coming">coming</option>
                                        <option value="custom">custom</option>
                                    </select>
                                </div>

                                <div className="admin-form-row">
                                    <label htmlFor="section-title">Title</label>
                                    <input
                                        id="section-title"
                                        value={form.title}
                                        onChange={(event) => setForm({ ...form, title: event.target.value })}
                                        placeholder="Optional heading or section label"
                                    />
                                </div>

                                <div className="admin-form-row">
                                    <label htmlFor="section-order">Ordering</label>
                                    <input
                                        id="section-order"
                                        type="number"
                                        value={form.sort_order}
                                        onChange={(event) => setForm({ ...form, sort_order: event.target.value })}
                                    />
                                </div>

                                <div className="admin-form-row">
                                    <label htmlFor="section-json">Content JSON</label>
                                    <textarea
                                        id="section-json"
                                        value={form.content_json}
                                        onChange={(event) => setForm({ ...form, content_json: event.target.value })}
                                        placeholder='{"subtitle":"..."}'
                                    />
                                </div>

                                <div className="admin-form-row">
                                    <label htmlFor="section-active">Visibility</label>
                                    <select
                                        id="section-active"
                                        value={String(form.is_active)}
                                        onChange={(event) => setForm({ ...form, is_active: event.target.value === "true" })}
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Hidden</option>
                                    </select>
                                </div>
                            </div>

                            <div className="admin-page-actions" style={{ marginTop: 16 }}>
                                <button className="admin-primary" type="submit" disabled={saving}>
                                    {saving ? "Saving..." : editingId ? "Update section" : "Create section"}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="admin-page-card">
                        <div className="admin-page-card-head">
                            <div>
                                <p className="admin-kicker">Sections</p>
                                <h3>Reusable homepage blocks</h3>
                                <p className="admin-page-card-copy">
                                    Toggle visibility, update ordering, or edit a section in place.
                                </p>
                            </div>
                        </div>

                        <div className="admin-page-card-body">
                            <div className="admin-section-list">
                                {sortedSections.map((section) => (
                                    <article className="admin-section-item" key={section.id}>
                                        <div>
                                            <strong>{section.key}</strong>
                                            <div className="admin-section-meta">
                                                <span className="admin-pill">{section.type}</span>
                                                <span className="admin-pill">Order {section.sort_order ?? 0}</span>
                                                <span className="admin-pill">{section.is_active ? "Visible" : "Hidden"}</span>
                                            </div>
                                            {section.title ? <p className="admin-page-card-copy">{section.title}</p> : null}
                                        </div>

                                        <div className="admin-section-actions">
                                            <button className="admin-small" type="button" onClick={() => startEdit(section)}>
                                                Edit
                                            </button>
                                            <button className="admin-small" type="button" onClick={() => handleToggle(section)}>
                                                {section.is_active ? "Hide" : "Show"}
                                            </button>
                                            <button className="admin-danger" type="button" onClick={() => handleDelete(section)}>
                                                Delete
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            {!sortedSections.length ? <p className="admin-empty">No homepage sections found.</p> : null}
                        </div>
                    </section>
                </div>
            </section>
        </main>
    );
}