import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormField from "../components/FormField.jsx";
import FormLayout from "../components/FormLayout.jsx";
import { loginAdmin } from "../services/api.js";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const data = await loginAdmin(payload);
      localStorage.setItem("ieaAdminToken", data.access_token);
      setStatusType("success");
      setStatusMessage("Admin login successful.");
      navigate("/admin");
    } catch (error) {
      setStatusType("error");
      setStatusMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormLayout
      title="IEA Stays admin."
      description="Manage visit requests, resident applications, and daily follow-ups from one quiet workspace."
      kicker="Admin Login"
      heading="Access dashboard"
      submitLabel="Log in"
      onSubmit={handleSubmit}
      statusMessage={statusMessage}
      statusType={statusType}
      isSubmitting={isSubmitting}
    >
      <FormField full required label="Email" name="email" type="email" />
      <FormField full required label="Password" name="password" type="password" />
    </FormLayout>
  );
}
