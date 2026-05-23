import { useState } from "react";
import FormField from "../components/FormField.jsx";
import FormLayout from "../components/FormLayout.jsx";
import { createVisitRequest } from "../services/api.js";

export default function VisitPage() {
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      home: formData.get("home"),
      preferred_date: formData.get("date") || null,
      preferred_time: formData.get("time"),
      message: formData.get("message") || null,
    };

    try {
      await createVisitRequest(payload);
      event.currentTarget.reset();
      setStatusType("success");
      setStatusMessage("Visit request submitted. The IEA Stays team will contact you soon.");
    } catch (error) {
      setStatusType("error");
      setStatusMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormLayout
      title="Book a visit to an Aries home."
      description="Share your contact details and preferred visit window. The IEA Stays team can follow up with availability and next steps."
      kicker="Visit Request"
      heading="Tell us how to reach you"
      submitLabel="Submit request"
      onSubmit={handleSubmit}
      statusMessage={statusMessage}
      statusType={statusType}
      isSubmitting={isSubmitting}
    >
      <FormField required label="Full name" name="name" />
      <FormField required label="Phone number" name="phone" type="tel" />
      <FormField required label="Email" name="email" type="email" />
      <FormField as="select" label="Preferred home" name="home">
        <option>Studio</option>
        <option>Nest</option>
        <option>BNB</option>
      </FormField>
      <FormField label="Preferred date" name="date" type="date" />
      <FormField as="select" label="Preferred time" name="time">
        <option>Morning</option>
        <option>Afternoon</option>
        <option>Evening</option>
      </FormField>
      <FormField
        full
        as="textarea"
        label="Message"
        name="message"
        placeholder="Any questions or requirements?"
      />
    </FormLayout>
  );
}
