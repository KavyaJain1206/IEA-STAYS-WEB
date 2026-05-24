import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";
import PropertyCard from "../components/PropertyCard.jsx";
import Toast from "../components/Toast.jsx";
import ZodiacSelector from "../components/ZodiacSelector.jsx";
import { getCatalogCollections, getCatalogHomes, getHomepageContent } from "../services/api.js";
import { properties, zodiacCollections } from "../data/zodiacCollections.js";
import { buildVisitSearchParams } from "../utils/visitContext.js";

export default function HomePage() {
  const [collections, setCollections] = useState(zodiacCollections);
  const [homes, setHomes] = useState(properties);
  const [selectedCollection, setSelectedCollection] = useState(zodiacCollections[0]);
  const [comingSoonCollection, setComingSoonCollection] = useState(
    zodiacCollections.find((collection) => !collection.available) || zodiacCollections[1]
  );
  const [homepage, setHomepage] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const frameRef = useRef(null);
  const toastTimer = useRef(null);

  const featuredCollectionIds = useMemo(
    () => (homepage?.featured_collections?.collection_ids || []).map(String),
    [homepage]
  );
  const featuredHomeIds = useMemo(
    () => (homepage?.featured_homes?.home_ids || []).map(String),
    [homepage]
  );

  const displayCollections = useMemo(() => {
    if (!collections.length) return zodiacCollections;
    if (!featuredCollectionIds.length) return collections;

    const featured = featuredCollectionIds
      .map((id) => collections.find((collection) => String(collection.id) === id))
      .filter(Boolean);
    const rest = collections.filter((collection) => !featuredCollectionIds.includes(String(collection.id)));
    return [...featured, ...rest];
  }, [collections, featuredCollectionIds]);

  useEffect(() => {
    const fitReplicaToViewport = () => {
      const scale = window.innerWidth <= 760 ? 1 : Math.min(1, window.innerWidth / 1536);
      document.documentElement.style.setProperty("--page-scale", scale.toString());

      if (frameRef.current) {
        document.documentElement.style.setProperty(
          "--page-height",
          `${frameRef.current.scrollHeight * scale}px`
        );
      }
    };

    document.body.classList.add("home-route");
    fitReplicaToViewport();
    window.addEventListener("resize", fitReplicaToViewport);

    return () => {
      document.body.classList.remove("home-route");
      window.removeEventListener("resize", fitReplicaToViewport);
      document.documentElement.style.removeProperty("--page-scale");
      document.documentElement.style.removeProperty("--page-height");
    };
  }, []);

  useEffect(() => {
    return () => clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const [collectionData, homeData] = await Promise.all([getCatalogCollections(), getCatalogHomes()]);

        if (collectionData?.length) {
          const normalizedCollections = collectionData.map((collection) => ({
            id: collection.id,
            name: collection.name,
            slug: collection.slug,
            symbol: collection.symbol,
            tone: collection.tone,
            description: collection.description,
            coverImageSrc: collection.cover_image_src,
            available: collection.is_active,
            sortOrder: collection.sort_order,
          }));

          setCollections(normalizedCollections);
          setSelectedCollection((current) =>
            normalizedCollections.find((collection) => collection.slug === current.slug) ||
            normalizedCollections.find((collection) => collection.available) ||
            normalizedCollections[0]
          );
          setComingSoonCollection(
            normalizedCollections.find((collection) => !collection.available) ||
            normalizedCollections[1] ||
            normalizedCollections[0]
          );
        }

        if (homeData?.length) {
          setHomes(
            homeData.map((home) => ({
              id: home.id,
              name: home.name,
              location: home.location,
              imageSrc: home.image_src,
              photoClassName: home.photo_class_name,
              available: home.is_active,
              collectionId: home.collection_id,
              collectionSlug: home.collection?.slug,
              collectionName: home.collection?.name,
            }))
          );
        }
      } catch {
        setCollections(zodiacCollections);
        setHomes(properties);
      }
    };

    loadCatalog();
    // load homepage content (non-blocking)
    (async () => {
      try {
        const data = await getHomepageContent();
        setHomepage(data);
        // apply coming soon mapping
        if (data?.coming?.name) {
          setComingSoonCollection((current) => ({
            name: data.coming.name,
            symbol: data.coming.symbol,
            tone: data.coming.tone,
            available: false,
            description: data.coming.description,
          }));
        }
      } catch {
        // keep defaults
      }
    })();
  }, []);

  useEffect(() => {
    if (!featuredCollectionIds.length || !displayCollections.length) return;

    setSelectedCollection((current) => {
      const featured = displayCollections.find((collection) => featuredCollectionIds.includes(String(collection.id)));
      if (!featured) return current;
      return current?.slug === featured.slug ? current : featured;
    });
  }, [displayCollections, featuredCollectionIds]);

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2600);
  };

  const handleCollectionSelect = (collection) => {
    if (!collection.available) {
      setComingSoonCollection(collection);
      document.querySelector("#coming-soon")?.scrollIntoView({ behavior: "smooth", block: "start" });
      showToast(`${collection.name} Collection is coming soon.`);
      return;
    }

    setSelectedCollection(collection);
  };

  const selectedHomes = homes.filter((home) => {
    if (!home.collectionSlug) {
      return true;
    }

    return home.collectionSlug === selectedCollection.slug;
  });

  const visibleHomes = selectedHomes.length ? selectedHomes : homes;

  const featuredHomes = featuredHomeIds.length
    ? homes.filter((home) => featuredHomeIds.includes(String(home.id)))
    : [];

  // Ensure featured homes never override the selected collection filtering.
  const featuredHomesFiltered = featuredHomes.filter(
    (home) => !home.collectionSlug || home.collectionSlug === selectedCollection.slug
  );

  const homesToRender = featuredHomesFiltered.length
    ? featuredHomesFiltered
    : visibleHomes;

  const heroVisitHref = buildVisitSearchParams({
    collection: selectedCollection,
    home: homesToRender[0] || visibleHomes[0] || null,
  });
  const heroSecondaryHref = homepage?.hero?.cta_secondary_href && homepage.hero.cta_secondary_href !== "/visit"
    ? homepage.hero.cta_secondary_href
    : heroVisitHref;

  return (
    <>
      <div className="site-frame" ref={frameRef}>
        <Navbar />

        <main id="home">
          <ZodiacSelector
            collections={displayCollections}
            selectedName={selectedCollection.name}
            onSelect={handleCollectionSelect}
          />

          <section className="hero-row" aria-labelledby="hero-title">
            <div className="hero-copy">
              <h1 id="hero-title">{homepage?.hero?.title || homepage?.hero_title || "Premium PG stays, shaped around comfort and belonging."}<span>&#10022;</span></h1>
              <p>{homepage?.hero?.description || homepage?.hero_subtitle || "IEA Stays Live brings you a chain of refined PG homes, each inspired by a zodiac sign and crafted for modern living, community, and peace of mind."}</p>

              <div className="cta-row">
                <a className="btn primary" href={homepage?.hero?.cta_primary_href || "#homes"}>
                  {homepage?.hero?.cta_primary_text || "Explore Homes"} <span>&rarr;</span>
                </a>
                <Link className="btn secondary" to={heroSecondaryHref}>
                  {homepage?.hero?.cta_secondary_text || "Book a Visit"} <span>&rarr;</span>
                </Link>
              </div>

              <div className="stats-row" aria-label="IEA Stays statistics">
                {(homepage?.stats || [])[0] ? (
                  (homepage.stats || []).map((s, i) => (
                    <div className="stat" key={i}>
                      <span className="star">&#10038;</span>
                      <strong>{s.value}</strong>
                      <small>
                        {s.lines.map((line, idx) => (
                          <span key={idx}>
                            {line}
                            <br />
                          </span>
                        ))}
                      </small>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="stat">
                      <span className="star">&#10038;</span>
                      <strong>12</strong>
                      <small>
                        Zodiac Collections
                        <br />
                        Unique PG Chains
                      </small>
                    </div>
                    <div className="stat">
                      <span className="home-icon">&#8962;</span>
                      <strong>30+</strong>
                      <small>
                        Curated Locations
                        <br />
                        Across Cities
                      </small>
                    </div>
                    <div className="stat">
                      <span className="people-icon">&#9831;</span>
                      <strong>1,000+</strong>
                      <small>
                        Happy Residents
                        <br />
                        And Growing
                      </small>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="celestial-field" aria-hidden="true">
              <span className="tiny-star a">&#10022;</span>
              <span className="tiny-star b">&#10022;</span>
              <span className="tiny-star c">&#10038;</span>
              <div className="ring one" />
              <div className="ring two" />
              <div className="ring three" />
              <div className="sunburst" />
            </div>

            <aside className="collection-card" aria-label="Selected collection">
              <div className="collection-left">
                <div className="zodiac-medallion">
                  <span>{selectedCollection.symbol}</span>
                </div>
                <a className="collection-pill" href="#homes">
                  <span>{selectedCollection.name}</span> Collection
                </a>
              </div>

              <div className="collection-text">
                <p className="kicker">&#10038; Selected Collection</p>
                <h2>
                  <span>{selectedCollection.name}</span> Collection
                </h2>
                <p className="tone">{selectedCollection.tone}</p>
                <p>
                  {selectedCollection.description ||
                    `Homes that reflect the spirit of ${selectedCollection.name} - bold, focused, and designed for comfort, community, and convenience.`}
                </p>
              </div>

              <div className="collection-benefits">
                <span>
                  <b>&#9813;</b> Premium
                  <br />
                  Amenities
                </span>
                <span>
                  <b>&#9831;</b> Community
                  <br />
                  Living
                </span>
                <span>
                  <b>&#8982;</b> Great
                  <br />
                  Locations
                </span>
                <span>
                  <b>&#9743;</b> 24 / 7
                  <br />
                  Support
                </span>
              </div>
            </aside>
          </section>

          <section className="gallery-section" id="homes" aria-labelledby="gallery-title">
            <div className="section-title gallery-title-row">
              <h2 id="gallery-title">Explore {selectedCollection.name} Homes</h2>
            </div>
            <div className="explore-grid">
              {homesToRender.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={{
                    ...property,
                    visitHref: buildVisitSearchParams({
                      collection: property.collectionSlug
                        ? collections.find((collection) => collection.slug === property.collectionSlug) || selectedCollection
                        : selectedCollection,
                      home: property,
                    }),
                  }}
                />
              ))}
            </div>
          </section>

          {homepage?.testimonials?.items?.length ? (
            <section className="testimonials-section" aria-labelledby="testimonials-title">
              <div className="section-title gallery-title-row">
                <h2 id="testimonials-title">{homepage.testimonials.title || "Testimonials"}</h2>
              </div>
              <p className="testimonials-intro">{homepage.testimonials.description}</p>
              <div className="testimonials-grid">
                {homepage.testimonials.items.map((item, index) => (
                  <article className="testimonial-card" key={`${item.name || index}-${index}`}>
                    {item.image_src ? <img src={item.image_src} alt={item.image_alt || item.name || "Resident"} /> : null}
                    <div>
                      <h3>{item.name}</h3>
                      <span>{item.role}</span>
                      <p>{item.quote}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="promise-strip" id="services" aria-label="Service promises">
            <article>
              <span className="promise-icon">&#9826;</span>
              <div>
                <h3>Verified Homes</h3>
                <p>Every home is verified for quality, safety, and reliability.</p>
              </div>
            </article>
            <article>
              <span className="promise-icon">&#8962;</span>
              <div>
                <h3>Managed Services</h3>
                <p>Professional management for a hassle-free living experience.</p>
              </div>
            </article>
            <article>
              <span className="promise-icon">&#9817;</span>
              <div>
                <h3>Safe Living</h3>
                <p>24/7 security, CCTV, and emergency support.</p>
              </div>
            </article>
            <article>
              <span className="promise-icon">&#9831;</span>
              <div>
                <h3>Community Experiences</h3>
                <p>Events, workshops, and connections that feel like family.</p>
              </div>
            </article>
            <span className="moon-detail">&#9790;</span>
            <span className="spark-detail">&#10022;</span>
          </section>

          <section className="coming-soon-section" id="coming-soon" aria-labelledby="coming-soon-title">
            <div className="coming-symbol">{comingSoonCollection.symbol}</div>
            <div>
              <p className="kicker">&#10038; Coming Soon</p>
              <h2 id="coming-soon-title">
                <span>{comingSoonCollection.name}</span> Collection
              </h2>
              <p>{comingSoonCollection.tone}</p>
              <p>{homepage?.coming?.description || "This zodiac-led PG collection is being curated. Soon, it will have its own homes, imagery, amenities, and story while keeping the same premium IEA Stays experience."}</p>
            </div>
          </section>
        </main>

        <Footer />
      </div>

      <Toast message={toastMessage} visible={toastVisible} />
    </>
  );
}
