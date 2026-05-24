import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAdminResident,
  getAdminProfile,
  getAdminVisit,
  listAdminResidents,
  listAdminVisits,
  updateAdminResidentStatus,
  updateAdminVisitStatus,
} from "../services/api.js";

const visitStatuses = ["new", "contacted", "scheduled", "completed", "cancelled"];
const residentStatuses = ["pending", "approved", "rejected", "inactive"];

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function StatusBadge({ value }) {
  return <span className={`admin-status ${value}`}>{value}</span>;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("visits");
  const [admin, setAdmin] = useState(null);
  const [visits, setVisits] = useState([]);
  const [residents, setResidents] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

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

    const loadAdmin = async () => {
      try {
        const profile = await getAdminProfile(token);
        setAdmin(profile);
      } catch {
        localStorage.removeItem("ieaAdminToken");
        navigate("/admin/login");
      }
    };

    loadAdmin();
  }, [navigate, token]);

  const loadData = async () => {
    if (!token) return;
    setIsLoading(true);
    setMessage("");

    try {
      if (activeTab === "visits") {
        const data = await listAdminVisits(token, { search, status: statusFilter });
        setVisits(data);
      } else {
        const data = await listAdminResidents(token, { search, status: statusFilter });
        setResidents(data);
      }
      setSelectedRecord(null);
      setSelectedType("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleSearch = (event) => {
    event.preventDefault();
    loadData();
  };

  const handleLogout = () => {
    localStorage.removeItem("ieaAdminToken");
    navigate("/admin/login");
  };

  const handleVisitStatusChange = async (visitId, status) => {
    await updateAdminVisitStatus(token, visitId, { status });
    await loadData();
  };

  const handleResidentStatusChange = async (residentId, status) => {
    await updateAdminResidentStatus(token, residentId, { status });
    await loadData();
  };

  const handleViewVisit = async (visitId) => {
    setIsDetailLoading(true);
    setMessage("");
    try {
      const data = await getAdminVisit(token, visitId);
      setSelectedRecord(data);
      setSelectedType("visit");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleViewResident = async (residentId) => {
    setIsDetailLoading(true);
    setMessage("");
    try {
      const data = await getAdminResident(token, residentId);
      setSelectedRecord(data);
      setSelectedType("resident");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const counts = {
    visits: visits.length,
    residents: residents.length,
  };

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <Link className="admin-wordmark" to="/">
          <span>&#10022;</span> IEA Stays
        </Link>
        <div>
          <p className="admin-kicker">Operations</p>
          <h1>Admin Portal</h1>
          <p className="admin-sidebar-copy">
            Track enquiries, review resident applications, and keep follow-ups moving.
          </p>
        </div>
        <button className="admin-logout" type="button" onClick={handleLogout}>
          Log out
        </button>
        <Link className="admin-logout admin-link-button" to="/admin/catalog">
          Manage catalog
        </Link>
        <Link className="admin-logout admin-link-button" to="/admin/homepage-sections">
          Manage homepage sections
        </Link>
      </aside>

      <section className="admin-workspace">
        <header className="admin-header">
          <div>
            <p className="admin-kicker">Dashboard</p>
            <h2>{activeTab === "visits" ? "Visit requests" : "Resident applications"}</h2>
          </div>
          <div className="admin-profile">
            <span>{admin?.full_name || "Admin"}</span>
            <small>{admin?.email}</small>
          </div>
        </header>

        <div className="admin-summary">
          <article>
            <span>Visit Requests</span>
            <strong>{counts.visits}</strong>
          </article>
          <article>
            <span>Residents</span>
            <strong>{counts.residents}</strong>
          </article>
          <article>
            <span>Current View</span>
            <strong>{activeTab === "visits" ? "Visits" : "Residents"}</strong>
          </article>
        </div>

        <div className="admin-toolbar">
          <div className="admin-tabs" role="tablist" aria-label="Admin sections">
            <button
              className={activeTab === "visits" ? "active" : ""}
              type="button"
              onClick={() => {
                setActiveTab("visits");
                setStatusFilter("");
              }}
            >
              Visits
            </button>
            <button
              className={activeTab === "residents" ? "active" : ""}
              type="button"
              onClick={() => {
                setActiveTab("residents");
                setStatusFilter("");
              }}
            >
              Residents
            </button>
          </div>

          <form className="admin-filters" onSubmit={handleSearch}>
            <input
              aria-label="Search"
              placeholder={activeTab === "visits" ? "Search name, email, phone" : "Search name, email, mobile"}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              aria-label="Status filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">All statuses</option>
              {(activeTab === "visits" ? visitStatuses : residentStatuses).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button type="submit">Apply</button>
          </form>
        </div>

        {message ? <p className="admin-error">{message}</p> : null}

        <div className="admin-content-grid">
          <section className="admin-panel">
            {isLoading ? (
              <p className="admin-empty">Loading...</p>
            ) : activeTab === "visits" ? (
              <VisitTable visits={visits} onStatusChange={handleVisitStatusChange} onView={handleViewVisit} />
            ) : (
              <ResidentTable
                residents={residents}
                onStatusChange={handleResidentStatusChange}
                onView={handleViewResident}
              />
            )}
          </section>

          <AdminDetailPanel
            record={selectedRecord}
            type={selectedType}
            isLoading={isDetailLoading}
            onClose={() => {
              setSelectedRecord(null);
              setSelectedType("");
            }}
          />
        </div>
      </section>
    </main>
  );
}

function VisitTable({ visits, onStatusChange, onView }) {
  if (!visits.length) return <p className="admin-empty">No visit requests found.</p>;

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Guest</th>
            <th>Home</th>
            <th>Visit Window</th>
            <th>Message</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {visits.map((visit) => (
            <tr key={visit.id}>
              <td>
                <strong>{visit.name}</strong>
                <span>{visit.phone}</span>
                <span>{visit.email}</span>
              </td>
              <td>{visit.home}</td>
              <td>
                <span>{formatDate(visit.preferred_date)}</span>
                <span>{visit.preferred_time}</span>
              </td>
              <td>{visit.message || "-"}</td>
              <td>
                <StatusBadge value={visit.status} />
                <select value={visit.status} onChange={(event) => onStatusChange(visit.id, event.target.value)}>
                  {visitStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
              <td>{formatDateTime(visit.created_at)}</td>
              <td>
                <button className="admin-row-action" type="button" onClick={() => onView(visit.id)}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResidentTable({ residents, onStatusChange, onView }) {
  if (!residents.length) return <p className="admin-empty">No resident applications found.</p>;

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Resident</th>
            <th>KYC</th>
            <th>Work</th>
            <th>Emergency</th>
            <th>Food</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {residents.map((resident) => (
            <tr key={resident.id}>
              <td>
                <strong>{resident.full_name}</strong>
                <span>{resident.mobile}</span>
                <span>{resident.email}</span>
              </td>
              <td>
                <span>Aadhaar {resident.aadhaar_number}</span>
                <span>PAN {resident.pan_number}</span>
              </td>
              <td>
                <span>{resident.occupation}</span>
                <span>{resident.firm_name || "-"}</span>
              </td>
              <td>
                <span>{resident.next_of_kin}</span>
                <span>{resident.relationship}</span>
                <span>{resident.kin_mobile}</span>
              </td>
              <td>{resident.food_from_iea ? "IEA food" : resident.food_delivery_provider || "External"}</td>
              <td>
                <StatusBadge value={resident.status} />
                <select
                  value={resident.status}
                  onChange={(event) => onStatusChange(resident.id, event.target.value)}
                >
                  {residentStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <button className="admin-row-action" type="button" onClick={() => onView(resident.id)}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminDetailPanel({ record, type, isLoading, onClose }) {
  if (isLoading) {
    return (
      <aside className="admin-detail-panel">
        <p className="admin-empty">Loading details...</p>
      </aside>
    );
  }

  if (!record) {
    return (
      <aside className="admin-detail-panel">
        <p className="admin-kicker">Details</p>
        <h3>Select a record</h3>
        <p className="admin-detail-muted">Use View to fetch complete information for a visit or resident.</p>
      </aside>
    );
  }

  return (
    <aside className="admin-detail-panel">
      <div className="admin-detail-head">
        <div>
          <p className="admin-kicker">{type === "visit" ? "Visit Detail" : "Resident Detail"}</p>
          <h3>{type === "visit" ? record.name : record.full_name}</h3>
        </div>
        <button type="button" onClick={onClose} aria-label="Close details">
          x
        </button>
      </div>

      {type === "visit" ? <VisitDetail record={record} /> : <ResidentDetail record={record} />}
    </aside>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="admin-detail-item">
      <span>{label}</span>
      <strong>{value || "-"}</strong>
    </div>
  );
}

function VisitDetail({ record }) {
  return (
    <div className="admin-detail-list">
      <DetailItem label="Phone" value={record.phone} />
      <DetailItem label="Email" value={record.email} />
      <DetailItem label="Preferred home" value={record.home} />
      <DetailItem label="Preferred date" value={formatDate(record.preferred_date)} />
      <DetailItem label="Preferred time" value={record.preferred_time} />
      <DetailItem label="Status" value={record.status} />
      <DetailItem label="Message" value={record.message} />
      <DetailItem label="Admin notes" value={record.admin_notes} />
      <DetailItem label="Created" value={formatDateTime(record.created_at)} />
      <DetailItem label="Updated" value={formatDateTime(record.updated_at)} />
    </div>
  );
}

function ResidentDetail({ record }) {
  return (
    <div className="admin-detail-list">
      <DetailItem label="Mobile" value={record.mobile} />
      <DetailItem label="Alternate mobile" value={record.alternate_mobile} />
      <DetailItem label="Email" value={record.email} />
      <DetailItem label="Aadhaar" value={record.aadhaar_number} />
      <DetailItem label="PAN" value={record.pan_number} />
      <DetailItem label="Permanent address" value={record.permanent_address} />
      <DetailItem label="Residence address" value={record.residence_address} />
      <DetailItem label="Occupation" value={record.occupation} />
      <DetailItem label="Office / firm" value={record.firm_name} />
      <DetailItem label="Firm address" value={record.firm_address} />
      <DetailItem label="Next of kin" value={record.next_of_kin} />
      <DetailItem label="Relationship" value={record.relationship} />
      <DetailItem label="Kin mobile" value={record.kin_mobile} />
      <DetailItem label="Kin alternate mobile" value={record.kin_alternate_mobile} />
      <DetailItem label="Food from IEA" value={record.food_from_iea ? "Yes" : "No"} />
      <DetailItem label="Food provider" value={record.food_delivery_provider} />
      <DetailItem label="Status" value={record.status} />
      <DetailItem label="Created" value={formatDateTime(record.created_at)} />
      <DetailItem label="Updated" value={formatDateTime(record.updated_at)} />
    </div>
  );
}
