import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useSiteCompare } from "@/context/compare-context";
import { MAX_COMPARE_SITES } from "@/lib/compare-sites";

type SiteCompareCheckboxProps = {
  siteId: string;
};

export function SiteCompareCheckbox({ siteId }: SiteCompareCheckboxProps) {
  const { isCompared, compareFull, onToggleCompare } = useSiteCompare(siteId);

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={isCompared}
          disabled={compareFull}
          onChange={() => onToggleCompare(siteId)}
        />
      }
      label={
        compareFull
          ? `Compare (max ${MAX_COMPARE_SITES} sites)`
          : "Include in comparison"
      }
    />
  );
}
