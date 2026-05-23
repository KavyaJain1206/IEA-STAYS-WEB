import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createAdminCollection,
  createAdminHome,
  deleteAdminCollection,
  deleteAdminHome,
  getAdminCatalogSummary,
  getAdminProfile,
  listAdminCollections,
  listAdminHomes,
  uploadAdminCatalogImage,
  updateAdminCollection,
  updateAdminHome,
} from "../services/api.js";

const emptyCollectionForm = {
  name: "",
  symbol: "",
  tone: "",
  description: "",
  cover_image_src: "",
  is_active: true,
  sort_order: 0,
};

const emptyHomeForm = {
  collection_id: "",
  name: "",
  location: "",
  description: "",
  image_src: "",
  photo_class_name: "",
  is_active: true,
  sort_order: 0,
};

function formatDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AdminCatalogPage() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [summary, setSummary] = useState({ collections: 0, homes: 0 });
  const [collections, setCollections] = useState([]);
  const [homes, setHomes] = useState([]);
  const [collectionForm, setCollectionForm] = useState(emptyCollectionForm);
  const [homeForm, setHomeForm] = useState(emptyHomeForm);
  const [collectionImageFile, setCollectionImageFile] = useState(null);
  const [homeImageFile, setHomeImageFile] = useState(null);
  const [editingCollectionId, setEditingCollectionId] = useState(null);
  const [editingHomeId, setEditingHomeId] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const token = useMemo(() => localStorage.getItem("ieaAdminToken"), []);

  useEffect(() => {
    document.body.classList.add("admin-route");
    return () => document.body.classList.remove("admin-route");
  }, []);

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    const loadProfile = async () => {
      try {
        const profile = await getAdminProfile(token);
        setAdmin(profile);
      } catch {
        localStorage.removeItem("ieaAdminToken");
        navigate("/admin/login");
      }
    };

    loadProfile();
  }, [navigate, token]);

  const loadCatalog = async () => {
    if (!token) return;
    setIsLoading(true);
    setMessage("");

    try {
      const [summaryData, collectionData, homeData] = await Promise.all([
        getAdminCatalogSummary(token),
        listAdminCollections(token, { includeInactive: true }),
        listAdminHomes(token, { includeInactive: true }),
      ]);

      setSummary(summaryData);
      setCollections(collectionData);
      setHomes(homeData);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, [token]);

  const resetCollectionForm = () => {
    setCollectionForm(emptyCollectionForm);
    setCollectionImageFile(null);
    setEditingCollectionId(null);
  };

  const resetHomeForm = () => {
    setHomeForm(emptyHomeForm);
    setHomeImageFile(null);
    setEditingHomeId(null);
  };

  const handleCollectionSubmit = async (event) => {
    event.preventDefault();
    if (!token) return;

    try {
      let coverImageSrc = collectionForm.cover_image_src.trim();
      if (collectionImageFile) {
        const uploadResult = await uploadAdminCatalogImage(token, collectionImageFile);
        coverImageSrc = uploadResult.src;
      }

      const payload = {
        ...collectionForm,
        cover_image_src: coverImageSrc || null,
        sort_order: Number(collectionForm.sort_order) || 0,
      };

      if (editingCollectionId) {
        await updateAdminCollection(token, editingCollectionId, payload);
      } else {
        await createAdminCollection(token, payload);
      }

      resetCollectionForm();
      await loadCatalog();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleHomeSubmit = async (event) => {
    event.preventDefault();
    if (!token) return;

    try {
      let imageSrc = homeForm.image_src.trim();
      if (homeImageFile) {
        const uploadResult = await uploadAdminCatalogImage(token, homeImageFile);
        imageSrc = uploadResult.src;
      }

      const payload = {
        ...homeForm,
        collection_id: Number(homeForm.collection_id),
        image_src: imageSrc,
        sort_order: Number(homeForm.sort_order) || 0,
      };

      if (editingHomeId) {
        await updateAdminHome(token, editingHomeId, payload);
      } else {
        await createAdminHome(token, payload);
      }

      resetHomeForm();
      await loadCatalog();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const beginEditCollection = (collection) => {
    setCollectionForm({
      name: collection.name,
      symbol: collection.symbol,
      tone: collection.tone,
      description: collection.description || "",
      cover_image_src: collection.cover_image_src || "",
      is_active: collection.is_active,
      sort_order: collection.sort_order,
    });
    setCollectionImageFile(null);
    setEditingCollectionId(collection.id);
  };

  const beginEditHome = (home) => {
    setHomeForm({
      collection_id: String(home.collection_id),
      name: home.name,
      location: home.location,
      description: home.description || "",
      image_src: home.image_src,
      photo_class_name: home.photo_class_name || "",
      is_active: home.is_active,
      sort_order: home.sort_order,
    });
    setHomeImageFile(null);
    setEditingHomeId(home.id);
  };

  const removeCollection = async (collection) => {
    if (!window.confirm(`Delete ${collection.name}? This will also delete its homes.`)) return;
    await deleteAdminCollection(token, collection.id);
    if (editingCollectionId === collection.id) resetCollectionForm();
    await loadCatalog();
  };

  const removeHome = async (home) => {
    if (!window.confirm(`Delete ${home.name}?`)) return;
    await deleteAdminHome(token, home.id);
    if (editingHomeId === home.id) resetHomeForm();
    await loadCatalog();
  };

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <div>
          <Link className="admin-wordmark" to="/admin">
            <span>&#10022;</span> IEA Stays
          </Link>
          <p className="admin-kicker">Catalog</p>
          <h1>Homes and collections</h1>
          <p className="admin-sidebar-copy">
            Manage the public home catalog, images, and zodiac collections from one place.
          </p>
        </div>

        <div className="admin-sidebar-actions">
          <Link className="admin-logout admin-link-button" to="/admin">
            Back to dashboard
          </Link>
          <button
            className="admin-logout"
            type="button"
            onClick={() => {
              localStorage.removeItem("ieaAdminToken");
              navigate("/admin/login");
            }}
          >
            Log out
          </button>
        </div>
      </aside>

      <section className="admin-workspace">
        <header className="admin-header">
          <div>
            <p className="admin-kicker">Dashboard</p>
            <h2>Catalog admin</h2>
          </div>
          <div className="admin-profile">
            <span>{admin?.full_name || "Admin"}</span>
            <small>{admin?.email}</small>
          </div>
        </header>

        <div className="admin-summary">
          <article>
            <span>Collections</span>
            <strong>{summary.collections}</strong>
          </article>
          <article>
            <span>Homes</span>
            <strong>{summary.homes}</strong>
          </article>
          <article>
            <span>Status</span>
            <strong>{isLoading ? "Loading" : "Ready"}</strong>
          </article>
        </div>

        {message ? <p className="admin-error">{message}</p> : null}

        <div className="catalog-grid">
          <section className="catalog-panel">
            <div className="catalog-panel-head">
              <div>
                <p className="admin-kicker">Collection editor</p>
                <h3>{editingCollectionId ? "Edit collection" : "Add collection"}</h3>
              </div>
              {editingCollectionId ? (
                <button className="catalog-clear" type="button" onClick={resetCollectionForm}>
                  Clear
                </button>
              ) : null}
            </div>

            <form className="catalog-form" onSubmit={handleCollectionSubmit}>
              <label>
                Name
                <input
                  required
                  value={collectionForm.name}
                  onChange={(event) => setCollectionForm({ ...collectionForm, name: event.target.value })}
                />
              </label>
              <label>
                Symbol
                <input
                  required
                  value={collectionForm.symbol}
                  onChange={(event) => setCollectionForm({ ...collectionForm, symbol: event.target.value })}
                />
              </label>
              <label className="full-span">
                Tone
                <input
                  required
                  value={collectionForm.tone}
                  onChange={(event) => setCollectionForm({ ...collectionForm, tone: event.target.value })}
                />
              </label>
              <label className="full-span">
                Description
                <textarea
                  rows="4"
                  value={collectionForm.description}
                  onChange={(event) =>
                    setCollectionForm({ ...collectionForm, description: event.target.value })
                  }
                />
              </label>
              <label className="full-span">
                Upload cover image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setCollectionImageFile(event.target.files?.[0] || null)}
                />
              </label>
              <label className="full-span">
                Cover image src
                <input
                  value={collectionForm.cover_image_src}
                  onChange={(event) =>
                    setCollectionForm({ ...collectionForm, cover_image_src: event.target.value })
                  }
                  placeholder="Optional fallback URL or uploaded path"
                />
              </label>
              <label>
                Sort order
                <input
                  type="number"
                  min="0"
                  value={collectionForm.sort_order}
                  onChange={(event) =>
                    setCollectionForm({ ...collectionForm, sort_order: event.target.value })
                  }
                />
              </label>
              <label>
                Active
                <select
                  value={String(collectionForm.is_active)}
                  onChange={(event) =>
                    setCollectionForm({ ...collectionForm, is_active: event.target.value === "true" })
                  }
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </label>
              <button className="catalog-submit full-span" type="submit">
                {editingCollectionId ? "Update collection" : "Create collection"}
              </button>
            </form>

            <div className="catalog-table-wrap">
              <table className="catalog-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Tone</th>
                    <th>Status</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {collections.map((collection) => (
                    <tr key={collection.id}>
                      <td>
                        <strong>{collection.name}</strong>
                        <span>{collection.slug}</span>
                      </td>
                      <td>{collection.tone}</td>
                      <td>{collection.is_active ? "Active" : "Hidden"}</td>
                      <td>{formatDateTime(collection.updated_at)}</td>
                      <td>
                        <div className="catalog-row-actions">
                          <button type="button" onClick={() => beginEditCollection(collection)}>
                            Edit
                          </button>
                          <button type="button" onClick={() => removeCollection(collection)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="catalog-panel">
            <div className="catalog-panel-head">
              <div>
                <p className="admin-kicker">Home editor</p>
                <h3>{editingHomeId ? "Edit home" : "Add home"}</h3>
              </div>
              {editingHomeId ? (
                <button className="catalog-clear" type="button" onClick={resetHomeForm}>
                  Clear
                </button>
              ) : null}
            </div>

            <form className="catalog-form" onSubmit={handleHomeSubmit}>
              <label className="full-span">
                Collection
                <select
                  required
                  value={homeForm.collection_id}
                  onChange={(event) => setHomeForm({ ...homeForm, collection_id: event.target.value })}
                >
                  <option value="">Select a collection</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Name
                <input
                  required
                  value={homeForm.name}
                  onChange={(event) => setHomeForm({ ...homeForm, name: event.target.value })}
                />
              </label>
              <label>
                Location
                <input
                  required
                  value={homeForm.location}
                  onChange={(event) => setHomeForm({ ...homeForm, location: event.target.value })}
                />
              </label>
              <label className="full-span">
                Description
                <textarea
                  rows="4"
                  value={homeForm.description}
                  onChange={(event) => setHomeForm({ ...homeForm, description: event.target.value })}
                />
              </label>
              <label className="full-span">
                Upload image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setHomeImageFile(event.target.files?.[0] || null)}
                />
              </label>
              <label className="full-span">
                Image src
                <input
                  required={!homeImageFile}
                  value={homeForm.image_src}
                  onChange={(event) => setHomeForm({ ...homeForm, image_src: event.target.value })}
                  placeholder="Optional fallback URL or uploaded path"
                />
              </label>
              <label>
                Photo class
                <input
                  value={homeForm.photo_class_name}
                  onChange={(event) =>
                    setHomeForm({ ...homeForm, photo_class_name: event.target.value })
                  }
                  placeholder="studio-photo"
                />
              </label>
              <label>
                Sort order
                <input
                  type="number"
                  min="0"
                  value={homeForm.sort_order}
                  onChange={(event) => setHomeForm({ ...homeForm, sort_order: event.target.value })}
                />
              </label>
              <label>
                Active
                <select
                  value={String(homeForm.is_active)}
                  onChange={(event) => setHomeForm({ ...homeForm, is_active: event.target.value === "true" })}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </label>
              <button className="catalog-submit full-span" type="submit">
                {editingHomeId ? "Update home" : "Create home"}
              </button>
            </form>

            <div className="catalog-table-wrap">
              <table className="catalog-table">
                <thead>
                  <tr>
                    <th>Home</th>
                    <th>Collection</th>
                    <th>Status</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {homes.map((home) => (
                    <tr key={home.id}>
                      <td>
                        <strong>{home.name}</strong>
                        <span>{home.location}</span>
                      </td>
                      <td>{home.collection?.name || "-"}</td>
                      <td>{home.is_active ? "Active" : "Hidden"}</td>
                      <td>{formatDateTime(home.updated_at)}</td>
                      <td>
                        <div className="catalog-row-actions">
                          <button type="button" onClick={() => beginEditHome(home)}>
                            Edit
                          </button>
                          <button type="button" onClick={() => removeHome(home)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}