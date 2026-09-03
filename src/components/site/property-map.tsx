export function PropertyMap({ address, lat, lng }: { address: string; lat?: string | null; lng?: string | null }) {
  const query = lat && lng ? `${lat},${lng}` : address;
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-white/[0.06]">
      <iframe
        title="Property location map"
        src={src}
        width="100%"
        height="320"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
