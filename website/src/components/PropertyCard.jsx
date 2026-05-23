import { Link } from "react-router-dom";
import { amenities } from "../data/zodiacCollections.js";
import { resolveImageUrl } from "../services/api.js";

export default function PropertyCard({ property }) {
  return (
    <article className="explore-card" id={property.id}>
      <div
        className={`explore-photo ${property.photoClassName || ""}`}
        style={property.imageSrc ? { backgroundImage: `url(${resolveImageUrl(property.imageSrc)})` } : undefined}
        aria-hidden="true"
      />
      <div className="home-info">
        <h3>{property.name}</h3>
        <p>{property.location}</p>
        <ul>
          {amenities.map((amenity) => (
            <li key={amenity.label}>
              <span>{amenity.icon}</span>
              {amenity.label}
            </li>
          ))}
        </ul>
        <Link to="/visit">
          Book a Visit <span>&rarr;</span>
        </Link>
      </div>
    </article>
  );
}
