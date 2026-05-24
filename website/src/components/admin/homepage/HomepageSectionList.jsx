import { draftFromSection, getSectionType, summarizeDraft } from "./sectionRegistry.js";

export function HomepageSectionList({ sections, catalog, onEdit, onToggle, onDelete }) {
    return (
        <section className="admin-page-card">
            <div className="admin-page-card-head">
                <div>
                    <p className="admin-kicker">Sections</p>
                    <h3>Homepage blocks</h3>
                    <p className="admin-page-card-copy">Edit visibility and ordering without exposing CMS internals.</p>
                </div>
            </div>

            <div className="admin-page-card-body">
                <div className="admin-section-list">
                    {sections.map((section) => {
                        const draft = draftFromSection(section);
                        const meta = getSectionType(section.type);
                        const summary = summarizeDraft(draft, catalog);

                        return (
                            <article className="admin-section-item" key={section.id}>
                                <div>
                                    <div className="admin-section-heading">
                                        <strong>{meta.label}</strong>
                                        <span className="admin-pill">Order {section.sort_order ?? 0}</span>
                                        <span className="admin-pill">{section.is_active ? "Visible" : "Hidden"}</span>
                                    </div>
                                    <p className="admin-page-card-copy">{section.title || meta.description}</p>
                                    {summary.map((line, index) => (
                                        <div className="admin-section-meta" key={`${section.id}-${index}`}>
                                            <span>{line}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="admin-section-actions">
                                    <button className="admin-small" type="button" onClick={() => onEdit(section)}>
                                        Edit
                                    </button>
                                    <button className="admin-small" type="button" onClick={() => onToggle(section)}>
                                        {section.is_active ? "Hide" : "Show"}
                                    </button>
                                    <button className="admin-danger" type="button" onClick={() => onDelete(section)}>
                                        Delete
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
                {!sections.length ? <p className="admin-empty">No homepage sections found.</p> : null}
            </div>
        </section>
    );
}
