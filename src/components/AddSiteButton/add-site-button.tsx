import Button from "@mui/material/Button";

export const AddSiteButton = () => {
  return (
    <Button
      variant="contained"
      color="primary"
      onClick={() => {
        console.log("Add Site");
      }}
    >
      Add Site
    </Button>
  );
};
