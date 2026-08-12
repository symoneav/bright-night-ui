import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { BarChart } from "@mui/x-charts/BarChart";
import type { ChartsAxisContentProps } from "@mui/x-charts/ChartsTooltip";
import {
  buildComparisonChartData,
  MIN_COMPARE_SITES,
  type ComparisonChartRow,
} from "@/lib/compare-sites";
import type { CleanSite } from "@/types/site";
import styles from "@/styles/comparison-chart.module.scss";

const CHART_HEIGHT = 220;
const ENERGY_COLOR = "#1976d2";
const AZIMUTH_COLOR = "#2e7d32";
const TILT_COLOR = "#ed6c02";

type ComparisonChartProps = {
  sites: CleanSite[];
  onRemoveSite: (siteId: string) => void;
};

function createEnergyAxisTooltip(chartRows: ComparisonChartRow[]) {
  return function EnergyAxisTooltip({
    axisValue,
    series,
    dataIndex,
  }: ChartsAxisContentProps) {
    if (dataIndex == null) {
      return null;
    }

    const systemId = String(axisValue ?? "");
    const row = chartRows.find((entry) => entry.systemId === systemId);
    const energy = series[0]?.data?.[dataIndex] as number | null | undefined;

    return (
      <Box className={styles.tooltip}>
        <div className={styles.tooltipLabel}>{systemId}</div>
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
  };
}

function createOrientationAxisTooltip() {
  const seriesLabels = ["Azimuth (°)", "Tilt (°)"] as const;

  return function OrientationAxisTooltip({
    axisValue,
    series,
    dataIndex,
  }: ChartsAxisContentProps) {
    if (dataIndex == null) {
      return null;
    }

    const systemId = String(axisValue ?? "");

    return (
      <Box className={styles.tooltip}>
        <div className={styles.tooltipLabel}>{systemId}</div>
        {series.map((entry, index) => {
          const value = entry.data?.[dataIndex] as number | null | undefined;
          const label = seriesLabels[index] ?? String(entry.id);

          return (
            <div key={String(entry.id)}>
              {label}: {value == null ? "Missing" : `${value}°`}
            </div>
          );
        })}
      </Box>
    );
  };
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

  const systemIds = chartData.map((row) => row.systemId);

  return (
    <Box className={styles.comparisonPanel} aria-label="Site comparison charts">
      <Box className={styles.header}>
        <Typography variant="subtitle1" component="h2">
          Site comparison
        </Typography>
        <Box className={styles.headerActions}>
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
          <IconButton size="small" onClick={() => {}}>
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
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" className={styles.note}>
        Missing values are omitted from bars — not plotted as zero. Energy and
        carbon are model estimates using lat, tilt, azimuth, and system size.
      </Typography>

      <div className={styles.chartContainer}>
        <Box className={styles.chartBlock}>
          <Typography variant="body2" component="h3" className={styles.chartTitle}>
            Estimated annual energy (kWh)
          </Typography>
          <Box className={styles.chartBlockContainer}>
            <BarChart
              height={CHART_HEIGHT}
              xAxis={[{ scaleType: "band", data: systemIds }]}
              yAxis={[{ label: "kWh/year" }]}
              series={[
                {
                  data: chartData.map((row) => row.annualEnergyKwh),
                  color: ENERGY_COLOR,
                },
              ]}
              grid={{ horizontal: true }}
              margin={{ top: 8, right: 8, left: 48, bottom: 32 }}
              skipAnimation
              tooltip={{
                trigger: "axis",
                axisContent: createEnergyAxisTooltip(chartData),
              }}
            />
          </Box>
        </Box>

        <Box className={styles.chartBlock}>
          <Typography variant="body2" component="h3" className={styles.chartTitle}>
            Panel orientation (degrees)
          </Typography>
          {hasOrientationData(chartData) ? (
            <Box className={styles.chartBlockContainer}>
              <BarChart
                height={CHART_HEIGHT}
                xAxis={[{ scaleType: "band", data: systemIds }]}
                yAxis={[{ min: 0, max: 360, label: "Degrees" }]}
                series={[
                  {
                    data: chartData.map((row) => row.azimuthDeg),
                    label: "Azimuth (°)",
                    color: AZIMUTH_COLOR,
                  },
                  {
                    data: chartData.map((row) => row.tiltDeg),
                    label: "Tilt (°)",
                    color: TILT_COLOR,
                  },
                ]}
                grid={{ horizontal: true }}
                margin={{ top: 8, right: 8, left: 48, bottom: 32 }}
                skipAnimation
                tooltip={{
                  trigger: "axis",
                  axisContent: createOrientationAxisTooltip(),
                }}
              />
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
      </div>
    </Box>
  );
}
