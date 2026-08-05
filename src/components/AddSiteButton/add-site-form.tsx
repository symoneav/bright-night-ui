import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { SubmitEvent, useEffect, useState } from "react";
import { fieldErrorsByField, validateSiteForm } from "@/lib/validate-site-form";
import styles from "@/styles/add-site-form.module.scss";
import {
  EMPTY_SITE_FORM_INPUT,
  type FieldError,
  type SiteFormInput,
} from "@/types/site";

type AddSiteFormProps = {
  open: boolean;
  existingSystemIds?: string[];
  isSubmitting: boolean;
  serverFieldErrors?: Partial<Record<FieldError["field"] | "form", string>>;
  submitError?: string | null;
  onCancel: () => void;
  onSubmit: (input: SiteFormInput) => void;
};

export function AddSiteForm({
  open,
  existingSystemIds = [],
  isSubmitting,
  serverFieldErrors = {},
  submitError = null,
  onCancel,
  onSubmit,
}: AddSiteFormProps) {
  const [values, setValues] = useState<SiteFormInput>(EMPTY_SITE_FORM_INPUT);
  const [clientFieldErrors, setClientFieldErrors] = useState<
    Partial<Record<FieldError["field"], string>>
  >({});

  useEffect(() => {
    if (open) {
      setValues(EMPTY_SITE_FORM_INPUT);
      setClientFieldErrors({});
    }
  }, [open]);

  const setTextField =
    (field: keyof SiteFormInput) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setClientFieldErrors((current) => ({ ...current, [field]: undefined }));
    };

  const setBooleanField =
    (field: "tracking" | "thirdPartyOwned" | "groundMounted") =>
    (event: SelectChangeEvent) => {
      const next = event.target.value;
      const value = next === "unknown" ? null : next === "yes" ? true : false;

      setValues((current) => ({ ...current, [field]: value }));
    };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateSiteForm(values, existingSystemIds);
    if (errors.length > 0) {
      setClientFieldErrors(fieldErrorsByField(errors));
      return;
    }

    setClientFieldErrors({});
    onSubmit({
      ...values,
      systemId: values.systemId.trim(),
      state: values.state.trim().toUpperCase(),
      zipCode: values.zipCode.trim(),
    });
  };

  const fieldErrors = { ...serverFieldErrors, ...clientFieldErrors };
  const formError = fieldErrors.form ?? submitError;

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography
        id="modal-modal-title"
        variant="h6"
        component="h2"
        className={styles.title}
      >
        Add New PV Site
      </Typography>

      {formError && (
        <Alert severity="error" className={styles.formError}>
          {formError}
        </Alert>
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
            inputProps={{ maxLength: 2 }}
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
            inputProps={{ step: "any" }}
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
            inputProps={{ step: "any" }}
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
            inputProps={{ min: 0, step: "any" }}
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
            InputLabelProps={{ shrink: true }}
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
            inputProps={{ min: 0, max: 359, step: "any" }}
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
            inputProps={{ min: 0, max: 90, step: "any" }}
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
            inputProps={{ min: 1, step: 1 }}
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
            inputProps={{ min: 0, max: 1, step: "any" }}
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
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? (
              <CircularProgress size={16} color="inherit" />
            ) : undefined
          }
        >
          {isSubmitting ? "Adding…" : "Add Site"}
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
