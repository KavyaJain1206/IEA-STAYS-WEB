import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormField from "../components/FormField.jsx";
import FormLayout from "../components/FormLayout.jsx";
import { loginResident } from "../services/api.js";

export default function LoginPage() {
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
      const data = await loginResident(payload);
      localStorage.setItem("ieaResidentToken", data.access_token);
      window.dispatchEvent(new Event("iea-auth-changed"));
      setStatusType("success");
      setStatusMessage("Logged in successfully.");
      navigate("/", { replace: true });
    } catch (error) {
      setStatusType("error");
      setStatusMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormLayout
      title="Welcome back."
      description="Log in to continue your IEA Stays enquiry, saved homes, and visit requests."
      kicker="Resident Login"
      heading="Access your account"
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
