import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  buildComparisonChartData,
  MIN_COMPARE_SITES,
  type ComparisonChartRow,
} from "@/lib/compare-sites";
import type { CleanSite } from "@/types/site";

type SiteCompareChartProps = {
  sites: CleanSite[];
  onRemoveSite: (siteId: string) => void;
};

export function SiteCompareChart({ sites, onRemoveSite }: SiteCompareChartProps) {
  const chartData: ComparisonChartRow[] = buildComparisonChartData(sites);

  if (sites.length < MIN_COMPARE_SITES) {
    return null;
  }

  return (
    <Box
      sx={{
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        px: 2,
        py: 1.5,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 1.5 }}
      >
        <Typography variant="subtitle1" component="h2">
          Site comparison
        </Typography>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {sites.map((site) => (
            <Chip
              key={site.systemId}
              label={site.systemId}
              size="small"
              onDelete={() => onRemoveSite(site.systemId)}
            />
          ))}
        </Stack>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Missing values are omitted from bars — not plotted as zero.
      </Typography>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="systemId" />
          <YAxis yAxisId="left" label={{ value: "kW / degrees", angle: -90, position: "insideLeft" }} />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            label={{ value: "Confidence %", angle: 90, position: "insideRight" }}
          />
          <Tooltip />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="systemSizeKw"
            name="System size (kW)"
            fill="#1976d2"
            isAnimationActive={false}
          />
          <Bar
            yAxisId="left"
            dataKey="azimuthDeg"
            name="Azimuth (°)"
            fill="#2e7d32"
            isAnimationActive={false}
          />
          <Bar
            yAxisId="left"
            dataKey="tiltDeg"
            name="Tilt (°)"
            fill="#ed6c02"
            isAnimationActive={false}
          />
          <Bar
            yAxisId="right"
            dataKey="confidence"
            name="Confidence (%)"
            fill="#9c27b0"
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
