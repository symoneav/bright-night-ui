import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import { useState } from "react";
import { isAddSiteUserError } from "@/data/fleet";
import type { FieldError, SiteFormInput } from "@/types/site";
import { AddSiteForm } from "./add-site-form";
import styles from "@/styles/add-site-button.module.scss";
import { AddBulkSiteForm } from "./add-bulk-site-form";

type SubmitState = {
  isSubmitting: boolean;
  serverFieldErrors: Partial<Record<FieldError["field"] | "form", string>>;
  submitError: string | null;
};

const EMPTY_SUBMIT_STATE: SubmitState = {
  isSubmitting: false,
  serverFieldErrors: {},
  submitError: null,
};

type AddSiteButtonProps = {
  existingSystemIds?: string[];
  onAddSite: (input: SiteFormInput) => Promise<void>;
  onBulkAddSites: (inputs: SiteFormInput[]) => Promise<void>;
};

export const AddSiteButton = ({
  existingSystemIds = [],
  onAddSite,
  onBulkAddSites,
}: AddSiteButtonProps) => {
  const [open, setOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [singleSubmit, setSingleSubmit] =
    useState<SubmitState>(EMPTY_SUBMIT_STATE);
  const [bulkSubmit, setBulkSubmit] = useState<SubmitState>(EMPTY_SUBMIT_STATE);

  const resetSingleSubmitState = () => {
    setSingleSubmit(EMPTY_SUBMIT_STATE);
  };

  const resetBulkSubmitState = () => {
    setBulkSubmit(EMPTY_SUBMIT_STATE);
  };

  const handleOpen = () => {
    resetSingleSubmitState();
    setOpen(true);
  };

  const handleClose = () => {
    if (singleSubmit.isSubmitting) return;
    setOpen(false);
    resetSingleSubmitState();
  };

  const handleBulkClose = () => {
    if (bulkSubmit.isSubmitting) return;
    setBulkOpen(false);
    resetBulkSubmitState();
  };

  const handleBulkAddSites = () => {
    resetBulkSubmitState();
    setBulkOpen(true);
  };

  const handleSubmit = async (input: SiteFormInput) => {
    resetSingleSubmitState();
    setSingleSubmit((current) => ({ ...current, isSubmitting: true }));

    try {
      await onAddSite(input);
      setOpen(false);
    } catch (error) {
      if (isAddSiteUserError(error)) {
        setSingleSubmit({
          isSubmitting: false,
          serverFieldErrors: error.fieldErrors ?? {},
          submitError: error.message,
        });
        return;
      }

      setOpen(false);
    } finally {
      setSingleSubmit((current) => ({ ...current, isSubmitting: false }));
    }
  };

  const handleBulkSubmit = async (inputs: SiteFormInput[]) => {
    resetBulkSubmitState();
    setBulkSubmit((current) => ({ ...current, isSubmitting: true }));

    try {
      await onBulkAddSites(inputs);
      setBulkOpen(false);
    } catch (error) {
      if (isAddSiteUserError(error)) {
        setBulkSubmit({
          isSubmitting: false,
          serverFieldErrors: error.fieldErrors ?? {},
          submitError: error.message,
        });
        return;
      }

      setBulkOpen(false);
    } finally {
      setBulkSubmit((current) => ({ ...current, isSubmitting: false }));
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        disableEscapeKeyDown={singleSubmit.isSubmitting}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className={styles.modal}>
          <AddSiteForm
            open={open}
            existingSystemIds={existingSystemIds}
            isSubmitting={singleSubmit.isSubmitting}
            serverFieldErrors={singleSubmit.serverFieldErrors}
            submitError={singleSubmit.submitError}
            onCancel={handleClose}
            onSubmit={handleSubmit}
          />
        </Box>
      </Modal>
      <Modal
        open={bulkOpen}
        onClose={handleBulkClose}
        disableEscapeKeyDown={bulkSubmit.isSubmitting}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className={styles.modal}>
          <AddBulkSiteForm
            open={bulkOpen}
            existingSystemIds={existingSystemIds}
            isSubmitting={bulkSubmit.isSubmitting}
            serverFieldErrors={bulkSubmit.serverFieldErrors}
            submitError={bulkSubmit.submitError}
            onCancel={handleBulkClose}
            onBulkSubmit={handleBulkSubmit}
          />
        </Box>
      </Modal>

      <div className={styles.addSiteButtons}>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Add Site
        </Button>
        <Button
          onClick={handleBulkAddSites}
          variant="outlined"
          color="primary"
        >
          Bulk Add Sites
        </Button>
      </div>
    </>
  );
};
