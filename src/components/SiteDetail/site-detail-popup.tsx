import IconButton from "@mui/material/IconButton";
import type { CleanSite } from "@/types/site";
import styles from "@/styles/site-detail-popup.module.scss";
import { SiteCompareCheckbox } from "./site-compare-checkbox";

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
         <IconButton size="small" onClick={() => onExpand(site)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 3 6 0 0 6" />
              <path d="M9 21H3v-6" />
              <path d="M21 3 14 10" />
              <path d="M3 21l7-7" />
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
      <SiteCompareCheckbox siteId={site.systemId} />
    </div>
  );
}
