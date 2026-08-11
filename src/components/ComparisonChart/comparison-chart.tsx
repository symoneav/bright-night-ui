import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
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
import type { TooltipProps } from "recharts";
import {
  buildComparisonChartData,
  MIN_COMPARE_SITES,
  type ComparisonChartRow,
} from "@/lib/compare-sites";
import type { CleanSite } from "@/types/site";
import styles from "@/styles/comparison-chart.module.scss";

type ComparisonChartProps = {
  sites: CleanSite[];
  onRemoveSite: (siteId: string) => void;
};

type EnergyTooltipProps = TooltipProps<number, string> & {
  chartRows: ComparisonChartRow[];
};

function EnergyTooltip({
  active,
  payload,
  label,
  chartRows,
}: EnergyTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const row = chartRows.find((entry) => entry.systemId === label);
  const energy = payload[0]?.value;

  return (
    <Box className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      {energy == null ? (
        <div>Cannot estimate — missing size, location, or orientation</div>
      ) : (
        <>
          <div>{Number(energy).toLocaleString()} kWh/year (estimated)</div>
          {row?.carbonOffsetTons != null && (
            <div className={styles.tooltipCarbon}>
              ≈ {row.carbonOffsetTons.toFixed(2)} tCO₂/year (derived from
              energy)
            </div>
          )}
        </>
      )}
    </Box>
  );
}

type OrientationTooltipProps = TooltipProps<number, string>;

function OrientationTooltip({ active, payload, label }: OrientationTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <Box className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      {payload.map((entry) => (
        <div key={entry.name}>
          {entry.name}:{" "}
          {entry.value == null ? "Missing" : `${entry.value}°`}
        </div>
      ))}
    </Box>
  );
}

function hasOrientationData(rows: ComparisonChartRow[]): boolean {
  return rows.some(
    (row) => row.azimuthDeg !== null || row.tiltDeg !== null,
  );
}

export function ComparisonChart({ sites, onRemoveSite }: ComparisonChartProps) {
  const chartData = buildComparisonChartData(sites);

  if (sites.length < MIN_COMPARE_SITES) {
    return null;
  }

  return (
    <Box className={styles.comparisonPanel} aria-label="Site comparison charts">
      <Box className={styles.header}>
        <Typography variant="subtitle1" component="h2">
          Site comparison
        </Typography>
        <Box className={styles.chips}>
          {sites.map((site) => (
            <Chip
              key={site.systemId}
              label={site.systemId}
              size="small"
              onDelete={() => onRemoveSite(site.systemId)}
            />
          ))}
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" className={styles.note}>
        Missing values are omitted from bars — not plotted as zero. Energy and
        carbon are model estimates using lat, tilt, azimuth, and system size.
      </Typography>

      <Box className={styles.chartBlock}>
        <Typography variant="body2" component="h3" className={styles.chartTitle}>
          Estimated annual energy (kWh)
        </Typography>
        <Box className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="systemId" />
              <YAxis label={{ value: "kWh/year", angle: -90, position: "insideLeft" }} />
              <Tooltip content={<EnergyTooltip chartRows={chartData} />} />
              <Legend />
              <Bar
                dataKey="annualEnergyKwh"
                name="Estimated energy (kWh)"
                fill="#1976d2"
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      <Box className={styles.chartBlock}>
        <Typography variant="body2" component="h3" className={styles.chartTitle}>
          Panel orientation (degrees)
        </Typography>
        {hasOrientationData(chartData) ? (
          <Box className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="systemId" />
                <YAxis
                  domain={[0, 360]}
                  label={{ value: "Degrees", angle: -90, position: "insideLeft" }}
                />
                <Tooltip content={<OrientationTooltip />} />
                <Legend />
                <Bar
                  dataKey="azimuthDeg"
                  name="Azimuth (°)"
                  fill="#2e7d32"
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="tiltDeg"
                  name="Tilt (°)"
                  fill="#ed6c02"
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            className={styles.emptyOrientation}
          >
            No orientation data for the selected sites.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
