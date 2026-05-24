import { useMemo, useState } from "react";
import { createEmptyDraft, getSectionType } from "./sectionRegistry.js";

function Row({ label, children, hint }) {
    return (
        <div className="admin-form-row">
            <label>{label}</label>
            {children}
            {hint ? <small className="admin-muted">{hint}</small> : null}
        </div>
    );
}

function TextField(props) {
    return <input {...props} />;
}

function TextAreaField(props) {
    return <textarea {...props} />;
}

function NumberField(props) {
    return <input type="number" {...props} />;
}

function SelectField(props) {
    return <select {...props} />;
}

function ImagePicker({ token, value, onChange, onUpload }) {
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const result = await onUpload(token, file);
            onChange(result.src || "");
        } finally {
            setUploading(false);
            event.target.value = "";
        }
    };

    return (
        <div className="admin-image-picker">
            <input value={value || ""} onChange={(event) => onChange(event.target.value)} placeholder="Image URL or uploaded src" />
            <div className="admin-image-picker-actions">
                <label className="admin-secondary admin-image-button">
                    {uploading ? "Uploading..." : "Upload image"}
                    <input type="file" accept="image/*" onChange={handleUpload} hidden />
                </label>
                {value ? (
                    <button type="button" className="admin-secondary" onClick={() => onChange("")}>Clear</button>
                ) : null}
            </div>
            {value ? <img className="admin-image-preview" src={value} alt="Section preview" /> : null}
        </div>
    );
}

function ChoiceGrid({ title, items, selectedIds, onToggle, getLabel, getSubtext, getImage }) {
    return (
        <div className="admin-choice-grid">
            {items.map((item) => {
                const id = String(item.id);
                const selected = selectedIds.includes(id);
                const imageSrc = getImage ? getImage(item) : "";
                return (
                    <button
                        key={id}
                        type="button"
                        className={`admin-choice-card ${selected ? "selected" : ""}`}
                        onClick={() => onToggle(id)}
                    >
                        {imageSrc ? <img src={imageSrc} alt="" /> : null}
                        <div>
                            <strong>{getLabel(item)}</strong>
                            {getSubtext ? <span>{getSubtext(item)}</span> : null}
                        </div>
                        <span className="admin-pill">{selected ? "Selected" : "Pick"}</span>
                    </button>
                );
            })}
            {!items.length ? <p className="admin-empty">No {title.toLowerCase()} available.</p> : null}
        </div>
    );
}

function StatRowsEditor({ value, onChange }) {
    const items = value?.items || [];
    const updateRow = (index, patch) => {
        const next = items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
        onChange({ ...value, items: next });
    };

    const addRow = () => onChange({ ...value, items: [...items, { value: "", lines: ["", ""] }] });
    const removeRow = (index) => onChange({ ...value, items: items.filter((_, itemIndex) => itemIndex !== index) });

    return (
        <div className="admin-list-editor">
            {items.map((item, index) => (
                <div className="admin-list-editor-row" key={index}>
                    <input
                        value={item.value || ""}
                        onChange={(event) => updateRow(index, { value: event.target.value })}
                        placeholder="12 or 30+"
                    />
                    <textarea
                        value={(item.lines || []).join("\n")}
                        onChange={(event) => updateRow(index, { lines: event.target.value.split("\n").filter(Boolean) })}
                        placeholder={"Line 1\nLine 2"}
                    />
                    <button type="button" className="admin-danger" onClick={() => removeRow(index)}>
                        Remove
                    </button>
                </div>
            ))}
            <button type="button" className="admin-secondary" onClick={addRow}>
                Add stat
            </button>
        </div>
    );
}

function PromiseRowsEditor({ value, onChange }) {
    const items = value?.items || [];
    const updateRow = (index, patch) => {
        const next = items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
        onChange({ ...value, items: next });
    };

    const addRow = () =>
        onChange({
            ...value,
            items: [...items, { icon: "", title: "", description: "" }],
        });

    const removeRow = (index) => onChange({ ...value, items: items.filter((_, itemIndex) => itemIndex !== index) });

    return (
        <div className="admin-list-editor">
            {items.map((item, index) => (
                <div className="admin-list-editor-row admin-list-editor-row-compact" key={index}>
                    <input value={item.icon || ""} onChange={(event) => updateRow(index, { icon: event.target.value })} placeholder="Icon" />
                    <input value={item.title || ""} onChange={(event) => updateRow(index, { title: event.target.value })} placeholder="Promise title" />
                    <textarea
                        value={item.description || ""}
                        onChange={(event) => updateRow(index, { description: event.target.value })}
                        placeholder="Promise description"
                    />
                    <button type="button" className="admin-danger" onClick={() => removeRow(index)}>
                        Remove
                    </button>
                </div>
            ))}
            <button type="button" className="admin-secondary" onClick={addRow}>
                Add promise
            </button>
        </div>
    );
}

function TestimonialsEditor({ value, onChange, token, onUpload }) {
    const items = value?.items || [];
    const updateRow = (index, patch) => {
        const next = items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
        onChange({ ...value, items: next });
    };

    const addRow = () => onChange({ ...value, items: [...items, { name: "", role: "", quote: "", image_src: "" }] });
    const removeRow = (index) => onChange({ ...value, items: items.filter((_, itemIndex) => itemIndex !== index) });

    return (
        <div className="admin-list-editor">
            {items.map((item, index) => (
                <div className="admin-testimonial-card" key={index}>
                    <div className="admin-testimonial-grid">
                        <input value={item.name || ""} onChange={(event) => updateRow(index, { name: event.target.value })} placeholder="Resident name" />
                        <input value={item.role || ""} onChange={(event) => updateRow(index, { role: event.target.value })} placeholder="Role / relation" />
                    </div>
                    <textarea
                        value={item.quote || ""}
                        onChange={(event) => updateRow(index, { quote: event.target.value })}
                        placeholder="Testimonial quote"
                    />
                    <ImagePicker
                        token={token}
                        value={item.image_src || ""}
                        onChange={(src) => updateRow(index, { image_src: src })}
                        onUpload={onUpload}
                    />
                    <button type="button" className="admin-danger" onClick={() => removeRow(index)}>
                        Remove testimonial
                    </button>
                </div>
            ))}
            <button type="button" className="admin-secondary" onClick={addRow}>
                Add testimonial
            </button>
        </div>
    );
}

function HeroEditor({ value, onChange, token, onUpload }) {
    return (
        <div className="admin-section-fields">
            <div className="admin-section-grid two-up">
                <Row label="Homepage title" hint="The main headline on the homepage.">
                    <TextField value={value.title || ""} onChange={(event) => onChange({ ...value, title: event.target.value })} />
                </Row>
                <Row label="Homepage description" hint="The supporting paragraph under the title.">
                    <TextAreaField value={value.description || ""} onChange={(event) => onChange({ ...value, description: event.target.value })} />
                </Row>
                <Row label="Primary CTA text">
                    <TextField value={value.cta_primary_text || ""} onChange={(event) => onChange({ ...value, cta_primary_text: event.target.value })} />
                </Row>
                <Row label="Primary CTA link">
                    <TextField value={value.cta_primary_href || ""} onChange={(event) => onChange({ ...value, cta_primary_href: event.target.value })} />
                </Row>
                <Row label="Secondary CTA text">
                    <TextField value={value.cta_secondary_text || ""} onChange={(event) => onChange({ ...value, cta_secondary_text: event.target.value })} />
                </Row>
                <Row label="Secondary CTA link">
                    <TextField value={value.cta_secondary_href || ""} onChange={(event) => onChange({ ...value, cta_secondary_href: event.target.value })} />
                </Row>
            </div>
            <Row label="Hero image" hint="Optional image that can be used in the hero composition.">
                <ImagePicker token={token} value={value.image_src || ""} onChange={(src) => onChange({ ...value, image_src: src })} onUpload={onUpload} />
            </Row>
        </div>
    );
}

function CollectionSelector({ title, items, selectedIds, onToggle, getLabel, getSubtext, getImage, hint }) {
    return (
        <div className="admin-selector-stack">
            <div className="admin-selector-head">
                <strong>{title}</strong>
                {hint ? <span>{hint}</span> : null}
            </div>
            <ChoiceGrid
                title={title}
                items={items}
                selectedIds={selectedIds}
                onToggle={onToggle}
                getLabel={getLabel}
                getSubtext={getSubtext}
                getImage={getImage}
            />
        </div>
    );
}

function FeaturedHomesEditor({ value, onChange, catalog }) {
    const selected = value.home_ids || [];
    return (
        <div className="admin-section-fields">
            <div className="admin-section-grid two-up">
                <Row label="Section title">
                    <TextField value={value.title || ""} onChange={(event) => onChange({ ...value, title: event.target.value })} />
                </Row>
                <Row label="Section description">
                    <TextAreaField value={value.description || ""} onChange={(event) => onChange({ ...value, description: event.target.value })} />
                </Row>
            </div>
            <CollectionSelector
                title="Choose featured homes"
                hint="Selected homes will appear in homepage highlights and can still fall back to current catalog rendering."
                items={catalog.homes}
                selectedIds={selected.map(String)}
                onToggle={(id) => {
                    const exists = selected.map(String).includes(id);
                    onChange({ ...value, home_ids: exists ? selected.filter((item) => String(item) !== id) : [...selected, id] });
                }}
                getLabel={(item) => item.name}
                getSubtext={(item) => item.location}
                getImage={(item) => item.image_src || ""}
            />
        </div>
    );
}

function FeaturedCollectionsEditor({ value, onChange, catalog }) {
    const selected = value.collection_ids || [];
    return (
        <div className="admin-section-fields">
            <div className="admin-section-grid two-up">
                <Row label="Section title">
                    <TextField value={value.title || ""} onChange={(event) => onChange({ ...value, title: event.target.value })} />
                </Row>
                <Row label="Section description">
                    <TextAreaField value={value.description || ""} onChange={(event) => onChange({ ...value, description: event.target.value })} />
                </Row>
            </div>
            <CollectionSelector
                title="Choose featured collections"
                hint="These collection cards can drive the selected collection area on the public homepage."
                items={catalog.collections}
                selectedIds={selected.map(String)}
                onToggle={(id) => {
                    const exists = selected.map(String).includes(id);
                    onChange({ ...value, collection_ids: exists ? selected.filter((item) => String(item) !== id) : [...selected, id] });
                }}
                getLabel={(item) => item.name}
                getSubtext={(item) => item.tone}
                getImage={(item) => item.cover_image_src || ""}
            />
        </div>
    );
}

function ComingEditor({ value, onChange, token, onUpload }) {
    return (
        <div className="admin-section-fields">
            <div className="admin-section-grid two-up">
                <Row label="Collection name">
                    <TextField value={value.name || ""} onChange={(event) => onChange({ ...value, name: event.target.value })} />
                </Row>
                <Row label="Tone">
                    <TextField value={value.tone || ""} onChange={(event) => onChange({ ...value, tone: event.target.value })} />
                </Row>
                <Row label="Symbol">
                    <TextField value={value.symbol || ""} onChange={(event) => onChange({ ...value, symbol: event.target.value })} />
                </Row>
                <Row label="Description">
                    <TextAreaField value={value.description || ""} onChange={(event) => onChange({ ...value, description: event.target.value })} />
                </Row>
            </div>
            <Row label="Collection image" hint="Optional visual teaser for the upcoming collection.">
                <ImagePicker token={token} value={value.image_src || ""} onChange={(src) => onChange({ ...value, image_src: src })} onUpload={onUpload} />
            </Row>
        </div>
    );
}

function StatsEditor({ value, onChange }) {
    return (
        <div className="admin-section-fields">
            <div className="admin-section-grid two-up">
                <Row label="Section title">
                    <TextField value={value.title || ""} onChange={(event) => onChange({ ...value, title: event.target.value })} />
                </Row>
                <Row label="Section description">
                    <TextAreaField value={value.description || ""} onChange={(event) => onChange({ ...value, description: event.target.value })} />
                </Row>
            </div>
            <StatRowsEditor value={value} onChange={onChange} />
        </div>
    );
}

function PromisesEditor({ value, onChange }) {
    return (
        <div className="admin-section-fields">
            <div className="admin-section-grid two-up">
                <Row label="Section title">
                    <TextField value={value.title || ""} onChange={(event) => onChange({ ...value, title: event.target.value })} />
                </Row>
                <Row label="Section description">
                    <TextAreaField value={value.description || ""} onChange={(event) => onChange({ ...value, description: event.target.value })} />
                </Row>
            </div>
            <PromiseRowsEditor value={value} onChange={onChange} />
        </div>
    );
}

export function HomepageSectionEditor({ draft, onDraftChange, catalog, token, onUploadImage, availableTypes }) {
    const meta = useMemo(() => getSectionType(draft.type), [draft.type]);
    const content = draft.content || createEmptyDraft(draft.type).content;

    const setContent = (nextContent) => onDraftChange({ ...draft, content: nextContent });

    const sectionOptions = availableTypes || [];

    return (
        <section className="admin-page-card">
            <div className="admin-page-card-head">
                <div>
                    <p className="admin-kicker">Editor</p>
                    <h3>{draft.id ? `Edit ${meta.label}` : `Create ${meta.label}`}</h3>
                    <p className="admin-page-card-copy">{meta.createHint}</p>
                </div>
            </div>

            <form className="admin-page-card-body admin-section-editor" onSubmit={(event) => event.preventDefault()}>
                <div className="admin-section-grid two-up">
                    {!draft.id ? (
                        <Row label="Section type">
                            <SelectField value={draft.type} onChange={(event) => onDraftChange(createEmptyDraft(event.target.value))}>
                                {sectionOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </SelectField>
                        </Row>
                    ) : (
                        <Row label="Section type" hint="Section type is fixed after creation.">
                            <SelectField value={draft.type} disabled>
                                <option value={draft.type}>{meta.label}</option>
                            </SelectField>
                        </Row>
                    )}

                    <Row label="Section title" hint="Shown on the public page where relevant.">
                        <TextField value={draft.title || ""} onChange={(event) => onDraftChange({ ...draft, title: event.target.value })} />
                    </Row>

                    <Row label="Ordering" hint="Lower numbers appear first.">
                        <NumberField value={draft.sort_order} onChange={(event) => onDraftChange({ ...draft, sort_order: event.target.value })} />
                    </Row>

                    <Row label="Visibility" hint="Hidden sections stay saved but do not render publicly.">
                        <SelectField value={String(draft.is_active)} onChange={(event) => onDraftChange({ ...draft, is_active: event.target.value === "true" })}>
                            <option value="true">Visible</option>
                            <option value="false">Hidden</option>
                        </SelectField>
                    </Row>
                </div>

                {draft.type === "hero" ? (
                    <HeroEditor value={content} onChange={setContent} token={token} onUpload={onUploadImage} />
                ) : null}
                {draft.type === "featured_homes" ? (
                    <FeaturedHomesEditor value={content} onChange={setContent} catalog={catalog} />
                ) : null}
                {draft.type === "featured_collections" ? (
                    <FeaturedCollectionsEditor value={content} onChange={setContent} catalog={catalog} />
                ) : null}
                {draft.type === "testimonials" ? (
                    <TestimonialsEditor value={content} onChange={setContent} token={token} onUpload={onUploadImage} />
                ) : null}
                {draft.type === "stats" ? <StatsEditor value={content} onChange={setContent} /> : null}
                {draft.type === "promises" ? <PromisesEditor value={content} onChange={setContent} /> : null}
                {draft.type === "coming" ? <ComingEditor value={content} onChange={setContent} token={token} onUpload={onUploadImage} /> : null}
            </form>
        </section>
    );
}
