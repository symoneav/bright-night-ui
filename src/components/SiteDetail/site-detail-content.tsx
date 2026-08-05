import type { CleanSite } from "@/types/site";
import styles from "@/styles/site-detail-content.module.scss";

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
  showTitle?: boolean;
};

export function SiteDetailContent({
  site,
  showTitle = true,
}: SiteDetailContentProps) {
  return (
    <div className={styles.content}>
      {showTitle && <strong className={styles.title}>{site.systemId}</strong>}
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
        <div className={styles.flags}>
          <strong>Flags:</strong>
          <ul className={styles.flagList}>
            {site.flags.map((flag) => (
              <li key={flag}>{flag}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
