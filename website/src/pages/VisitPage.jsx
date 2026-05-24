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
  const [isLoading, setIsLoading] = useState(true);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const [collectionData, homeData] = await Promise.all([
          getCatalogCollections(),
          getCatalogHomes(),
        ]);
        setCollections(collectionData || []);
        // Ensure we have a consistent `collectionSlug` for defensive filtering.
        setHomes((homeData || []).map((home) => ({
          ...home,
          collectionSlug: home.collection?.slug,
          collectionName: home.collection?.name,
          collectionTone: home.collection?.tone,
        })));
      } catch {
        setCollections([]);
        setHomes([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);


  const visitContext = useMemo(() => {
    return resolveVisitContext({
      collections,
      homes,
      searchParams,
    });
  }, [collections, homes, searchParams]);


  const visitCopy = useMemo(() => buildVisitCopy(visitContext), [visitContext]);

  if (isLoading) {
    return (
      <FormLayout
        title="Booking"
        description="Loading booking details..."
        kicker="Visit Request"
        heading="Tell us how to reach you"
        submitLabel="Submit request"
        onSubmit={(e) => e.preventDefault()}
        statusMessage=""
        statusType="success"
        isSubmitting={false}
      >
        <div className="visit-context-banner">
          <p>Please wait while we load available collections and homes.</p>
        </div>
      </FormLayout>
    );
  }

  const hasCatalog = collections.length > 0 && homes.length > 0;
  if (!hasCatalog) {
    return (
      <FormLayout
        title="Booking"
        description="We couldn't load booking options at the moment."
        kicker="Visit Request"
        heading="Tell us how to reach you"
        submitLabel="Submit request"
        onSubmit={(e) => e.preventDefault()}
        statusMessage=""
        statusType="error"
        isSubmitting={false}
      >
        <div className="visit-context-banner">
          <p>Booking options are unavailable right now. Please try again later.</p>
        </div>
      </FormLayout>
    );
  }


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
      <FormField as="select" label="Preferred home" name="home" defaultValue={visitContext.home?.id || ""}>
        {(homes || []).slice(0, 50).map((home) => (
          <option key={String(home.id)} value={home.id}>
            {home.name}
          </option>
        ))}
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
