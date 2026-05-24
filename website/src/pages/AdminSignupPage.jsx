import { useNavigate } from "react-router-dom";
import FormLayout from "../components/FormLayout.jsx";

export default function AdminSignupPage() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/admin/login");
  };

  return (
    <FormLayout
      title="IEA Stays admin."
      description="Manage visit requests, resident applications, and daily follow-ups from one quiet workspace."
      kicker="Admin Registration"
      heading="Registration Restricted"
      submitLabel="Back to Login"
      onSubmit={handleSubmit}
      statusMessage=""
      statusType="success"
      isSubmitting={false}
    >
      <div 
        className="visit-context-banner" 
        style={{ 
          gridColumn: "1 / -1", 
          display: "grid", 
          gap: "16px", 
          padding: "20px", 
          background: "rgba(246, 234, 210, 0.25)", 
          border: "1px solid rgba(189, 140, 54, 0.3)" 
        }}
      >
        <p style={{ margin: 0, fontWeight: "600", color: "#17342c" }}>
          To maintain workspace security, administrative accounts cannot be registered publicly online.
        </p>
        <p style={{ margin: 0, fontSize: "14px", color: "#4f5652" }}>
          Please provision new administrator credentials using the command-line utility in the project backend:
        </p>
        <pre 
          style={{ 
            margin: 0, 
            padding: "14px 16px", 
            background: "#08251f", 
            color: "#e6c887", 
            borderRadius: "8px", 
            fontFamily: "monospace", 
            fontSize: "13px",
            overflowX: "auto" 
          }}
        >
          python -m app.utils.create_admin
        </pre>
        <p style={{ margin: 0, fontSize: "13.5px", color: "#5d5037", fontStyle: "italic" }}>
          If you do not have command line access to the environment, contact the lead administrator to provision your credentials.
        </p>
      </div>
    </FormLayout>
  );
}
