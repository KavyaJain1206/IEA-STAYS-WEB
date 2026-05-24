import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FormField from "../components/FormField.jsx";
import FormLayout from "../components/FormLayout.jsx";
import { createVisitRequest, getCatalogCollections, getCatalogHomes } from "../services/api.js";
import { buildVisitCopy, resolveVisitContext } from "../utils/visitContext.js";

export default function VisitPage() {
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [collections, setCollections] = useState([]);
  const [homes, setHomes] = useState([]);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const load = async () => {
      try {
        const [collectionData, homeData] = await Promise.all([getCatalogCollections(), getCatalogHomes()]);
        setCollections(collectionData || []);
        setHomes((homeData || []).map((home) => ({
          ...home,
          collection_slug: home.collection?.slug,
          collection_name: home.collection?.name,
          collection_tone: home.collection?.tone,
        })));
      } catch {
        setCollections([]);
        setHomes([]);
      }
    };

    load();
  }, []);

  const visitContext = useMemo(
    () => resolveVisitContext({ collections, homes, searchParams }),
    [collections, homes, searchParams]
  );

  const visitCopy = useMemo(() => buildVisitCopy(visitContext), [visitContext]);

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
      setStatusMessage(visitCopy.confirmation);
    } catch (error) {
      setStatusType("error");
      setStatusMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormLayout
      title={visitCopy.title}
      description={visitCopy.description}
      kicker="Visit Request"
      heading="Tell us how to reach you"
      submitLabel="Submit request"
      onSubmit={handleSubmit}
      statusMessage={statusMessage}
      statusType={statusType}
      isSubmitting={isSubmitting}
    >
      <div className="visit-context-banner">
        <p>{visitCopy.intro}</p>
      </div>
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
        placeholder={visitCopy.placeholder}
      />
    </FormLayout>
  );
}
