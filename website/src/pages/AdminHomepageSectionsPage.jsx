import { useEffect, useState } from "react";
import { listHomepageSections, createHomepageSection, updateHomepageSection, deleteHomepageSection } from "../services/api";

export default function AdminHomepageSectionsPage() {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const t = localStorage.getItem("ieaAdminToken");
        setToken(t);
        fetchSections();
    }, []);

    async function fetchSections() {
        setLoading(true);
        try {
            const data = await listHomepageSections();
            setSections(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleAdd() {
        if (!token) return alert("Admin token required");
        const key = prompt("Section key (unique)");
        const type = prompt("Type (hero|stats|promises|coming|custom)");
        if (!key || !type) return;
        try {
            await createHomepageSection(token, { key, type });
            fetchSections();
        } catch (err) {
            alert(String(err));
        }
    }

    async function handleToggleActive(s) {
        if (!token) return alert("Admin token required");
        try {
            await updateHomepageSection(token, s.id, { is_active: !s.is_active });
            fetchSections();
        } catch (err) {
            alert(String(err));
        }
    }

    async function handleDelete(s) {
        if (!token) return alert("Admin token required");
        if (!confirm("Delete section?")) return;
        try {
            await deleteHomepageSection(token, s.id);
            fetchSections();
        } catch (err) {
            alert(String(err));
        }
    }

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2>Homepage Sections</h2>
            <button onClick={handleAdd}>Add Section</button>
            <ul>
                {sections.map((s) => (
                    <li key={s.id}>
                        <strong>{s.key}</strong> — {s.type} — order: {s.sort_order} — active: {String(s.is_active)}
                        <button onClick={() => handleToggleActive(s)}>Toggle</button>
                        <button onClick={() => handleDelete(s)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
