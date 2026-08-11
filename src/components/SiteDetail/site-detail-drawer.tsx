import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Drawer from "@mui/material/Drawer";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import {
  canAddToComparison,
  MAX_COMPARE_SITES,
} from "@/lib/compare-sites";
import type { CleanSite } from "@/types/site";
import styles from "@/styles/site-detail-drawer.module.scss";
import { SiteDetailContent } from "./site-detail-content";

type SiteDetailDrawerProps = {
  site: CleanSite | null;
  compareSiteIds: readonly string[];
  onClose: () => void;
  onToggleCompare: (siteId: string) => void;
};

export function SiteDetailDrawer({
  site,
  compareSiteIds,
  onClose,
  onToggleCompare,
}: SiteDetailDrawerProps) {
  const isOpen = site !== null;
  const isCompared = site ? compareSiteIds.includes(site.systemId) : false;
  const compareFull =
    site !== null &&
    !isCompared &&
    !canAddToComparison(compareSiteIds, site.systemId);

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

            <FormControlLabel
              control={
                <Checkbox
                  checked={isCompared}
                  disabled={compareFull}
                  onChange={() => onToggleCompare(site.systemId)}
                />
              }
              label={
                compareFull
                  ? `Compare (max ${MAX_COMPARE_SITES} sites)`
                  : "Include in comparison"
              }
            />

            <Button variant="outlined" onClick={onClose} fullWidth>
              Close
            </Button>
          </>
        )}
      </Box>
    </Drawer>
  );
}
