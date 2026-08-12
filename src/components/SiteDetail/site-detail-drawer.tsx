import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import type { CleanSite } from "@/types/site";
import styles from "@/styles/site-detail-drawer.module.scss";
import { SiteDetailContent } from "./site-detail-content";
import { SiteCompareCheckbox } from "./site-compare-checkbox";

type SiteDetailDrawerProps = {
  site: CleanSite | null;
  onClose: () => void;
};

export function SiteDetailDrawer({ site, onClose }: SiteDetailDrawerProps) {
  const isOpen = site !== null;

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose}>
      <Box
        className={styles.panel}
        role="dialog"
        aria-label="Site detail panel"
      >
        <Box className={styles.header}>
          <Typography variant="h6" component="h2">
            Site details
          </Typography>
          <Button
            aria-label="Close site detail panel"
            onClick={onClose}
            className={styles.closeButton}
          >
            ×
          </Button>
        </Box>

        {site && (
          <>
            <SiteDetailContent site={site} showTitle={false} />

            <SiteCompareCheckbox siteId={site.systemId} />

            <Button variant="outlined" onClick={onClose} fullWidth>
              Close
            </Button>
          </>
        )}
      </Box>
    </Drawer>
  );
}
