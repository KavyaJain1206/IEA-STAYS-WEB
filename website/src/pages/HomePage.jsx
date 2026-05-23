import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";
import PropertyCard from "../components/PropertyCard.jsx";
import Toast from "../components/Toast.jsx";
import ZodiacSelector from "../components/ZodiacSelector.jsx";
import { getCatalogCollections, getCatalogHomes } from "../services/api.js";
import { properties, zodiacCollections } from "../data/zodiacCollections.js";

export default function HomePage() {
  const [collections, setCollections] = useState(zodiacCollections);
  const [homes, setHomes] = useState(properties);
  const [selectedCollection, setSelectedCollection] = useState(zodiacCollections[0]);
  const [comingSoonCollection, setComingSoonCollection] = useState(
    zodiacCollections.find((collection) => !collection.available) || zodiacCollections[1]
  );
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const frameRef = useRef(null);
  const toastTimer = useRef(null);

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
  }, []);

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
      return selectedCollection.name === "Aries";
    }

    return home.collectionSlug === selectedCollection.slug;
  });

  const visibleHomes = selectedHomes.length ? selectedHomes : homes;

  return (
    <>
      <div className="site-frame" ref={frameRef}>
        <Navbar />

        <main id="home">
          <ZodiacSelector
            collections={zodiacCollections}
            selectedName={selectedCollection.name}
            onSelect={handleCollectionSelect}
          />

          <section className="hero-row" aria-labelledby="hero-title">
            <div className="hero-copy">
              <h1 id="hero-title">
                Premium PG stays, shaped around comfort and belonging.<span>&#10022;</span>
              </h1>
              <p>
                IEA Stays brings you a chain of refined PG homes, each inspired by a zodiac sign
                and crafted for modern living, community, and peace of mind.
              </p>

              <div className="cta-row">
                <a className="btn primary" href="#homes">
                  Explore Homes <span>&rarr;</span>
                </a>
                <Link className="btn secondary" to="/visit">
                  Book a Visit <span>&rarr;</span>
                </Link>
              </div>

              <div className="stats-row" aria-label="IEA Stays statistics">
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
              {visibleHomes.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </section>

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
              <p>
                This zodiac-led PG collection is being curated. Soon, it will have its own homes,
                imagery, amenities, and story while keeping the same premium IEA Stays experience.
              </p>
            </div>
          </section>
        </main>

        <Footer />
      </div>

      <Toast message={toastMessage} visible={toastVisible} />
    </>
  );
}
