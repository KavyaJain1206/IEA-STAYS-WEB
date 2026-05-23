export default function ZodiacSelector({ collections, selectedName, onSelect }) {
  return (
    <section className="zodiac-strip" aria-label="Zodiac collections">
      {collections.map((collection) => (
        <button
          className={`zodiac${selectedName === collection.name ? " active" : ""}`}
          key={collection.name}
          type="button"
          onClick={() => onSelect(collection)}
        >
          <span>{collection.symbol}</span>
          {collection.name}
        </button>
      ))}
    </section>
  );
}
