import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import { useState } from "react";
import type { SiteFormInput } from "@/types/site";
import { AddSiteForm } from "./add-site-form";
import styles from "./add-site-button.module.scss";

type AddSiteButtonProps = {
  existingSystemIds?: string[];
  onAddSite: (input: SiteFormInput) => void;
};

export const AddSiteButton = ({
  existingSystemIds = [],
  onAddSite,
}: AddSiteButtonProps) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = (input: SiteFormInput) => {
    onAddSite(input);
    handleClose();
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className={styles.addSiteButton}>
          <AddSiteForm
            open={open}
            existingSystemIds={existingSystemIds}
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
