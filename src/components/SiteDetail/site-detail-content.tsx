import type { CleanSite } from "@/types/site";

function formatValue(value: string | number | boolean | null): string {
  if (value === null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

type DetailRowProps = {
  label: string;
  value: string | number | boolean | null;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div>
      <strong>{label}:</strong> {formatValue(value)}
    </div>
  );
}

type SiteDetailContentProps = {
  site: CleanSite;
};

export function SiteDetailContent({ site }: SiteDetailContentProps) {
  return (
    <div style={{ minWidth: 220, fontSize: 13, lineHeight: 1.5 }}>
      <strong style={{ fontSize: 15 }}>{site.systemId}</strong>
      <DetailRow label="State" value={site.state} />
      <DetailRow label="Zip" value={site.zipCode} />
      <DetailRow
        label="Coordinates"
        value={
          site.coordinates
            ? `${site.coordinates.lat.toFixed(4)}, ${site.coordinates.lng.toFixed(4)}`
            : null
        }
      />
      <DetailRow
        label="System size"
        value={
          site.systemSizeKw !== null
            ? `${site.systemSizeKw.toFixed(1)} kW`
            : null
        }
      />
      <DetailRow
        label="Azimuth"
        value={site.azimuthDeg !== null ? `${site.azimuthDeg}°` : null}
      />
      <DetailRow
        label="Tilt"
        value={site.tiltDeg !== null ? `${site.tiltDeg}°` : null}
      />
      <DetailRow label="Modules" value={site.moduleQuantity} />
      <DetailRow label="Efficiency" value={site.efficiency} />
      <DetailRow label="Tracking" value={site.tracking} />
      <DetailRow label="Install date" value={site.installationDate} />
      <DetailRow label="Third-party owned" value={site.thirdPartyOwned} />
      <DetailRow label="Ground mounted" value={site.groundMounted} />
      <DetailRow label="Confidence" value={`${site.confidence}%`} />
      {site.flags.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <strong>Flags:</strong>
          <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
            {site.flags.map((flag) => (
              <li key={flag}>{flag}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
