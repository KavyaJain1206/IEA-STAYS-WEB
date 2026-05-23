import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function FormLayout({
  title,
  description,
  kicker,
  heading,
  children,
  submitLabel,
  onSubmit,
  statusMessage,
  statusType = "success",
  isSubmitting = false,
}) {
  useEffect(() => {
    document.body.classList.add("form-route");

    return () => document.body.classList.remove("form-route");
  }, []);

  return (
    <main className="form-page">
      <section className="form-brand">
        <Link className="wordmark" to="/">
          <span>&#10022;</span> IEA Stays
        </Link>
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </section>
      <section className="form-shell">
        <form className="lead-form" onSubmit={onSubmit}>
          <p className="kicker">{kicker}</p>
          <h2>{heading}</h2>
          <div className="fields">{children}</div>
          {statusMessage ? (
            <p className={`form-message ${statusType}`} role="status">
              {statusMessage}
            </p>
          ) : null}
          <div className="form-actions">
            <button className="submit-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Please wait..." : submitLabel}
            </button>
            <Link className="back-link" to="/">
              Back home
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
