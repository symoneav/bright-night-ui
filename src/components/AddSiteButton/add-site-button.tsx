import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import { useState } from "react";
import { isAddSiteUserError } from "@/data/fleet";
import type { FieldError, SiteFormInput } from "@/types/site";
import { AddSiteForm } from "./add-site-form";
import styles from "@/styles/add-site-button.module.scss";

type AddSiteButtonProps = {
  existingSystemIds?: string[];
  onAddSite: (input: SiteFormInput) => Promise<void>;
};

export const AddSiteButton = ({
  existingSystemIds = [],
  onAddSite,
}: AddSiteButtonProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverFieldErrors, setServerFieldErrors] = useState<
    Partial<Record<FieldError["field"] | "form", string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resetSubmitState = () => {
    setServerFieldErrors({});
    setSubmitError(null);
  };

  const handleOpen = () => {
    resetSubmitState();
    setOpen(true);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setOpen(false);
    resetSubmitState();
  };

  const handleSubmit = async (input: SiteFormInput) => {
    resetSubmitState();
    setIsSubmitting(true);

    try {
      await onAddSite(input);
      setOpen(false);
    } catch (error) {
      if (isAddSiteUserError(error)) {
        setServerFieldErrors(error.fieldErrors ?? {});
        setSubmitError(error.message);
        return;
      }

      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        disableEscapeKeyDown={isSubmitting}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className={styles.modal}>
          <AddSiteForm
            open={open}
            existingSystemIds={existingSystemIds}
            isSubmitting={isSubmitting}
            serverFieldErrors={serverFieldErrors}
            submitError={submitError}
            onCancel={handleClose}
            onSubmit={handleSubmit}
          />
        </Box>
      </Modal>

      <Button variant="contained" color="primary" onClick={handleOpen}>
        Add Site
      </Button>
    </>
  );
};
