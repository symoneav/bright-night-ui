import IconButton from "@mui/material/IconButton";
import type { CleanSite } from "@/types/site";
import styles from "@/styles/site-detail-popup.module.scss";

type SiteDetailPopupProps = {
  site: CleanSite;
  onExpand: (site: CleanSite) => void;
};

function formatValue(value: string | number | null): string {
  if (value === null || value === "") return "—";
  return String(value);
}

export function SiteDetailPopup({ site, onExpand }: SiteDetailPopupProps) {
  return (
    <div className={styles.popup}>
      <div className={styles.header}>
        <div className={styles.title}>{site.systemId}</div>
        <IconButton
          size="small"
          aria-label={`Expand details for ${site.systemId}`}
          onClick={() => onExpand(site)}
        >
          <svg
            aria-hidden="true"
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M15 3h6v6h-2V6.41l-7.29 7.3-1.42-1.42 7.3-7.29H15V3zM5 5h5V3H3v7h2V5zm14 14v-5h-2v4.59l-7.29-7.3-1.42 1.42 7.3 7.29H17v2h6v-6h-2z" />
          </svg>
        </IconButton>
      </div>
      <div>
        <strong>State:</strong> {formatValue(site.state)}
      </div>
      <div>
        <strong>System size:</strong>{" "}
        {site.systemSizeKw !== null
          ? `${site.systemSizeKw.toFixed(1)} kW`
          : "—"}
      </div>
      <div>
        <strong>Confidence:</strong> {site.confidence}%
      </div>
      {site.flags.length > 0 && (
        <div>
          <strong>Flags:</strong> {site.flags.length}
        </div>
      )}
    </div>
  );
}
