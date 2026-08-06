import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { fieldErrorsByField, validateSiteForm } from "@/lib/validate-site-form";
import styles from "@/styles/add-site-form.module.scss";
import {
  EMPTY_SITE_FORM_INPUT,
  type FieldError,
  type SiteFormInput,
} from "@/types/site";

type AddBulkSiteFormProps = {
  open: boolean;
  existingSystemIds?: string[];
  isSubmitting: boolean;
  serverFieldErrors?: Partial<Record<FieldError["field"] | "form", string>>;
  submitError?: string | null;
  onCancel: () => void;
  onBulkSubmit: (inputs: SiteFormInput[]) => void;
};

function normalizeFormInput(input: SiteFormInput): SiteFormInput {
  return {
    ...input,
    systemId: input.systemId.trim(),
    state: input.state.trim().toUpperCase(),
    zipCode: input.zipCode.trim(),
  };
}

export function AddBulkSiteForm({
  open,
  existingSystemIds = [],
  isSubmitting,
  serverFieldErrors = {},
  submitError = null,
  onCancel,
  onBulkSubmit,
}: AddBulkSiteFormProps) {
  const [values, setValues] = useState<SiteFormInput>(EMPTY_SITE_FORM_INPUT);
  const [pendingSites, setPendingSites] = useState<SiteFormInput[]>([]);
  const [clientFieldErrors, setClientFieldErrors] = useState<
    Partial<Record<FieldError["field"], string>>
  >({});
  const [localFormError, setLocalFormError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues(EMPTY_SITE_FORM_INPUT);
      setPendingSites([]);
      setClientFieldErrors({});
      setLocalFormError(null);
    }
  }, [open]);

  const setTextField =
    (field: keyof SiteFormInput) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setClientFieldErrors((current) => ({ ...current, [field]: undefined }));
      setLocalFormError(null);
    };

  const setBooleanField =
    (field: "tracking" | "thirdPartyOwned" | "groundMounted") =>
    (event: SelectChangeEvent) => {
      const next = event.target.value;
      const value = next === "unknown" ? null : next === "yes" ? true : false;

      setValues((current) => ({ ...current, [field]: value }));
    };

  const knownSystemIds = [
    ...existingSystemIds,
    ...pendingSites.map((site) => site.systemId),
  ];

  const handleAddSite = () => {
    const errors = validateSiteForm(values, knownSystemIds);
    if (errors.length > 0) {
      setClientFieldErrors(fieldErrorsByField(errors));
      return;
    }

    const normalized = normalizeFormInput(values);
    setPendingSites((current) => [...current, normalized]);
    setValues(EMPTY_SITE_FORM_INPUT);
    setClientFieldErrors({});
    setLocalFormError(null);
  };

  const handleSubmitSites = () => {
    if (pendingSites.length === 0) {
      setLocalFormError("Add at least one site before submitting.");
      return;
    }

    setClientFieldErrors({});
    setLocalFormError(null);
    onBulkSubmit(pendingSites);
  };

  const handleRemovePendingSite = (systemId: string) => {
    setPendingSites((current) =>
      current.filter((site) => site.systemId !== systemId),
    );
  };

  const fieldErrors = { ...serverFieldErrors, ...clientFieldErrors };
  const formError = fieldErrors.form ?? submitError ?? localFormError;

  return (
    <Box
      component="form"
      onSubmit={(event) => event.preventDefault()}
      noValidate
    >
      <Typography
        id="modal-modal-title"
        variant="h6"
        component="h2"
        className={styles.formTitle}
      >
        Add New PV Sites
      </Typography>

      {formError && (
        <Alert severity="error" className={styles.formError}>
          {formError}
        </Alert>
      )}

      {pendingSites.length > 0 && (
        <Stack direction="row" flexWrap="wrap" gap={1} className={styles.formError}>
          {pendingSites.map((site) => (
            <Chip
              key={site.systemId}
              label={site.systemId}
              size="small"
              onDelete={() => handleRemovePendingSite(site.systemId)}
              disabled={isSubmitting}
            />
          ))}
        </Stack>
      )}

      <Stack
        component="fieldset"
        disabled={isSubmitting}
        spacing={2}
        className={styles.fields}
      >
        <TextField
          name="systemId"
          label="System ID"
          placeholder="SITE_00001"
          value={values.systemId}
          onChange={setTextField("systemId")}
          error={Boolean(fieldErrors.systemId)}
          helperText={fieldErrors.systemId}
          required
          fullWidth
          size="small"
        />

        <Box className={styles.fieldRow}>
          <TextField
            name="state"
            label="State"
            placeholder="CA"
            value={values.state}
            onChange={setTextField("state")}
            error={Boolean(fieldErrors.state)}
            helperText={fieldErrors.state}
            required
            fullWidth
            size="small"
            slotProps={{ htmlInput: { maxLength: 2 } }}
          />
          <TextField
            name="zipCode"
            label="Zip code"
            placeholder="90210"
            value={values.zipCode}
            onChange={setTextField("zipCode")}
            error={Boolean(fieldErrors.zipCode)}
            helperText={fieldErrors.zipCode}
            required
            fullWidth
            size="small"
          />
        </Box>

        <Box className={styles.fieldRow}>
          <TextField
            name="lat"
            label="Latitude"
            type="number"
            value={values.lat}
            onChange={setTextField("lat")}
            error={Boolean(fieldErrors.lat)}
            helperText={fieldErrors.lat}
            required
            fullWidth
            size="small"
            slotProps={{ htmlInput: { step: "any" } }}
          />
          <TextField
            name="lng"
            label="Longitude"
            type="number"
            value={values.lng}
            onChange={setTextField("lng")}
            error={Boolean(fieldErrors.lng)}
            helperText={fieldErrors.lng}
            required
            fullWidth
            size="small"
            slotProps={{ htmlInput: { step: "any" } }}
          />
        </Box>

        <Box className={styles.fieldRow}>
          <TextField
            name="systemSizeKw"
            label="System size (kW)"
            type="number"
            value={values.systemSizeKw}
            onChange={setTextField("systemSizeKw")}
            error={Boolean(fieldErrors.systemSizeKw)}
            helperText={fieldErrors.systemSizeKw}
            fullWidth
            size="small"
            slotProps={{ htmlInput: { min: 0, step: "any" } }}
          />
          <TextField
            name="installationDate"
            label="Installation date"
            type="date"
            value={values.installationDate}
            onChange={setTextField("installationDate")}
            error={Boolean(fieldErrors.installationDate)}
            helperText={fieldErrors.installationDate}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>

        <Box className={styles.fieldRow}>
          <TextField
            name="azimuthDeg"
            label="Azimuth (°)"
            type="number"
            value={values.azimuthDeg}
            onChange={setTextField("azimuthDeg")}
            error={Boolean(fieldErrors.azimuthDeg)}
            helperText={fieldErrors.azimuthDeg ?? "0–359, N=0"}
            fullWidth
            size="small"
            slotProps={{ htmlInput: { min: 0, max: 359, step: "any" } }}
          />
          <TextField
            name="tiltDeg"
            label="Tilt (°)"
            type="number"
            value={values.tiltDeg}
            onChange={setTextField("tiltDeg")}
            error={Boolean(fieldErrors.tiltDeg)}
            helperText={fieldErrors.tiltDeg ?? "0–90"}
            fullWidth
            size="small"
            slotProps={{ htmlInput: { min: 0, max: 90, step: "any" } }}
          />
        </Box>

        <Box className={styles.fieldRow}>
          <TextField
            name="moduleQuantity"
            label="Module quantity"
            type="number"
            value={values.moduleQuantity}
            onChange={setTextField("moduleQuantity")}
            error={Boolean(fieldErrors.moduleQuantity)}
            helperText={fieldErrors.moduleQuantity}
            fullWidth
            size="small"
            slotProps={{ htmlInput: { min: 1, step: 1 } }}
          />
          <TextField
            name="efficiency"
            label="Efficiency"
            type="number"
            value={values.efficiency}
            onChange={setTextField("efficiency")}
            error={Boolean(fieldErrors.efficiency)}
            helperText={fieldErrors.efficiency ?? "Fraction, e.g. 0.19"}
            fullWidth
            size="small"
            slotProps={{ htmlInput: { min: 0, max: 1, step: "any" } }}
          />
        </Box>

        <Box className={styles.fieldRowThree}>
          <BooleanFieldInput
            label="Tracking"
            value={values.tracking}
            onChange={setBooleanField("tracking")}
          />
          <BooleanFieldInput
            label="Third-party owned"
            value={values.thirdPartyOwned}
            onChange={setBooleanField("thirdPartyOwned")}
          />
          <BooleanFieldInput
            label="Ground mounted"
            value={values.groundMounted}
            onChange={setBooleanField("groundMounted")}
          />
        </Box>
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        justifyContent="flex-end"
        className={styles.actions}
      >
        <Button
          type="button"
          variant="outlined"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="contained"
          onClick={handleAddSite}
          disabled={isSubmitting}
        >
          Add Site
        </Button>
        <Button
          type="button"
          variant="contained"
          onClick={handleSubmitSites}
          disabled={isSubmitting || pendingSites.length === 0}
          startIcon={
            isSubmitting ? (
              <CircularProgress size={16} color="inherit" />
            ) : undefined
          }
        >
          {isSubmitting
            ? "Adding Sites…"
            : `Submit Sites (${pendingSites.length})`}
        </Button>
      </Stack>
    </Box>
  );
}

type BooleanFieldInputProps = {
  label: string;
  value: boolean | null;
  onChange: (event: SelectChangeEvent) => void;
};

function BooleanFieldInput({ label, value, onChange }: BooleanFieldInputProps) {
  const selectValue = value === null ? "unknown" : value ? "yes" : "no";
  const fieldId = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <FormControl fullWidth size="small">
      <InputLabel id={`${fieldId}-label`}>{label}</InputLabel>
      <Select
        labelId={`${fieldId}-label`}
        label={label}
        value={selectValue}
        onChange={onChange}
      >
        <MenuItem value="unknown">Unknown</MenuItem>
        <MenuItem value="yes">Yes</MenuItem>
        <MenuItem value="no">No</MenuItem>
      </Select>
    </FormControl>
  );
}
