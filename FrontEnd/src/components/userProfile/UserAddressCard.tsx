import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  useTheme,
  alpha,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";

export default function UserAddressCard() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSave = () => {
    console.log("Saving changes...");
    handleClose();
  };

  const InfoItem = ({ label, value }: { label: string; value: string }) => (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mb: 0.5, display: "block" }}
      >
        {label}
      </Typography>
      <Typography variant="body1" fontWeight="medium" color="text.primary">
        {value}
      </Typography>
    </Box>
  );

  return (
    <>
      <Card
        sx={{
          borderRadius: "20px",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
          height: "100%",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={3}
          >
            <Typography variant="h6" fontWeight="bold">
              Address
            </Typography>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleOpen}
              size="small"
              sx={{
                borderRadius: "20px",
                textTransform: "none",
                borderColor: "divider",
                color: "text.primary",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            >
              Edit
            </Button>
          </Stack>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <InfoItem label="Country" value="United States" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <InfoItem
                label="City/State"
                value="Phoenix, Arizona, United States"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <InfoItem label="Postal Code" value="ERT 2489" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <InfoItem label="TAX ID" value="AS4568384" />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "20px" },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
          Edit Address
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Country"
                defaultValue="United States"
                variant="outlined"
                InputProps={{ sx: { borderRadius: "12px" } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City/State"
                defaultValue="Phoenix, Arizona, United States"
                variant="outlined"
                InputProps={{ sx: { borderRadius: "12px" } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Postal Code"
                defaultValue="ERT 2489"
                variant="outlined"
                InputProps={{ sx: { borderRadius: "12px" } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="TAX ID"
                defaultValue="AS4568384"
                variant="outlined"
                InputProps={{ sx: { borderRadius: "12px" } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleClose}
            color="inherit"
            sx={{ borderRadius: "10px" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              borderRadius: "10px",
              background: "linear-gradient(135deg, #3A6073 0%, #16222A 100%)",
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
