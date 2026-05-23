import { useState } from "react";
import FormField from "../components/FormField.jsx";
import FormLayout from "../components/FormLayout.jsx";
import { signupResident } from "../services/api.js";

export default function SignupPage() {
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      full_name: formData.get("full_name"),
      mobile: formData.get("mobile"),
      alternate_mobile: formData.get("alternate_mobile") || null,
      email: formData.get("email"),
      aadhaar_number: formData.get("aadhaar_number"),
      pan_number: formData.get("pan_number"),
      permanent_address: formData.get("permanent_address"),
      residence_address: formData.get("residence_address"),
      occupation: formData.get("occupation"),
      firm_name: formData.get("firm_name") || null,
      firm_address: formData.get("firm_address") || null,
      next_of_kin: formData.get("next_of_kin"),
      relationship: formData.get("relationship"),
      kin_mobile: formData.get("kin_mobile"),
      kin_alternate_mobile: formData.get("kin_alternate_mobile") || null,
      food_from_iea: formData.get("food_from_iea") === "yes",
      food_delivery_provider: formData.get("food_delivery_provider") || null,
      password: formData.get("password"),
    };

    try {
      await signupResident(payload);
      event.currentTarget.reset();
      setStatusType("success");
      setStatusMessage("Application submitted. You can log in now with the same email and password.");
    } catch (error) {
      setStatusType("error");
      setStatusMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormLayout
      title="Resident application before sign up."
      description="Complete these details so the IEA Stays team can verify your profile and prepare your stay record."
      kicker="Resident Application"
      heading="Sign up details"
      submitLabel="Submit application"
      onSubmit={handleSubmit}
      statusMessage={statusMessage}
      statusType={statusType}
      isSubmitting={isSubmitting}
    >
      <h3 className="form-section-title">Personal details</h3>
      <FormField required label="Full name" name="full_name" autoComplete="name" />
      <FormField required label="Mobile number" name="mobile" type="tel" autoComplete="tel" />
      <FormField label="Alternate number" name="alternate_mobile" type="tel" />
      <FormField required label="Email" name="email" type="email" autoComplete="email" />
      <FormField required label="Aadhaar number" name="aadhaar_number" inputMode="numeric" maxLength="12" />
      <FormField required label="PAN number" name="pan_number" maxLength="10" />

      <h3 className="form-section-title">Address details</h3>
      <FormField full required as="textarea" label="Permanent address" name="permanent_address" />
      <FormField full required as="textarea" label="Residence address" name="residence_address" />

      <h3 className="form-section-title">Work details</h3>
      <FormField required label="Occupation" name="occupation" />
      <FormField label="Office / firm name" name="firm_name" />
      <FormField full as="textarea" label="Address of firm" name="firm_address" />

      <h3 className="form-section-title">Emergency contact</h3>
      <FormField required label="Next of kin" name="next_of_kin" />
      <FormField required label="Relationship" name="relationship" />
      <FormField required label="Mobile number" name="kin_mobile" type="tel" />
      <FormField label="Alternate number" name="kin_alternate_mobile" type="tel" />

      <h3 className="form-section-title">Food preference</h3>
      <fieldset className="choice-group">
        <legend>Food from IEA Stays</legend>
        <label>
          <input type="radio" name="food_from_iea" value="yes" required /> Yes
        </label>
        <label>
          <input type="radio" name="food_from_iea" value="no" /> No
        </label>
      </fieldset>
      <FormField label="Food delivery service provider name" name="food_delivery_provider" />

      <h3 className="form-section-title">Account security</h3>
      <FormField full required label="Password" name="password" type="password" autoComplete="new-password" />
    </FormLayout>
  );
}
