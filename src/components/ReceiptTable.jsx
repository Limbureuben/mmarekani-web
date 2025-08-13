import React, { useEffect, useState } from "react";
import { getReceipts, deleteReceipt } from "./services/ReceiptService";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Avatar, Typography,
  CircularProgress, IconButton, TablePagination,
  Dialog, DialogContent, DialogTitle, Box,
  Button, Stack, Snackbar, Alert
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

const ReceiptTable = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getReceipts();
        setReceipts(data);
      } catch (error) {
        console.error("Error loading receipts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteReceipt(id);
      setReceipts(receipts.filter((receipt) => receipt.id !== id));
      setToastOpen(true); // Show toast after success
    } catch (error) {
      console.error("Error deleting receipt:", error);
    }
  };

  const openConfirmDialog = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      handleDelete(deleteId);
    }
    setConfirmOpen(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (receipt) => {
    setSelectedReceipt(receipt);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Receipt</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Uploaded At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {receipts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography align="center" color="text.secondary">
                    No receipts found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              receipts
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((receipt) => (
                  <TableRow 
                    key={receipt.id} 
                    hover 
                    onClick={() => handleRowClick(receipt)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>
                      <Avatar
                        variant="square"
                        src={receipt.receipt_image}
                        alt="Receipt"
                        sx={{ width: 60, height: 60 }}
                      />
                    </TableCell>
                    <TableCell>{receipt.username}</TableCell>
                    <TableCell>{receipt.phone}</TableCell>
                    <TableCell>
                      {new Date(receipt.uploaded_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          openConfirmDialog(receipt.id);
                        }}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={receipts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Receipt Detail Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md">
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            Receipt Details
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedReceipt && (
            <Box sx={{ p: 2 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedReceipt.username}'s Receipt
                </Typography>
                <Typography variant="body1">
                  <strong>Phone:</strong> {selectedReceipt.phone}
                </Typography>
                <Typography variant="body1">
                  <strong>Uploaded At:</strong>{" "}
                  {new Date(selectedReceipt.uploaded_at).toLocaleString()}
                </Typography>
              </Box>
              
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <img
                  src={selectedReceipt.receipt_image}
                  alt="Receipt"
                  style={{ 
                    maxWidth: "100%", 
                    maxHeight: "500px", 
                    borderRadius: "4px" 
                  }}
                />
              </Box>
              
              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => openConfirmDialog(selectedReceipt.id)}
                >
                  Delete Receipt
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this receipt?</Typography>
        </DialogContent>
        <Stack direction="row" spacing={2} sx={{ p: 2, justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>
            Delete
          </Button>
        </Stack>
      </Dialog>

      {/* Success Toast */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setToastOpen(false)}>
          Receipt deleted successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default ReceiptTable;






// import React, { useEffect, useState } from "react";
// import { getReceipts, deleteReceipt } from "./services/ReceiptService";
// import {
//   Table, TableBody, TableCell, TableContainer,
//   TableHead, TableRow, Paper, Avatar, Typography,
//   CircularProgress, IconButton, TablePagination, Dialog,
//   DialogTitle, DialogContent, DialogActions, Button, Box
// } from "@mui/material";
// import DeleteIcon from "@mui/icons-material/Delete";
// import VisibilityIcon from "@mui/icons-material/Visibility";

// const ReceiptTable = () => {
//   const [receipts, setReceipts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(0);
//   const [rowsPerPage] = useState(5);
//   const [selectedReceipt, setSelectedReceipt] = useState(null);

//   useEffect(() => {
//     loadReceipts();
//   }, []);

//   const loadReceipts = async () => {
//     setLoading(true);
//     const data = await getReceipts();
//     setReceipts(data);
//     setLoading(false);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this receipt?")) {
//       const success = await deleteReceipt(id);
//       if (success) {
//         setReceipts(receipts.filter((r) => r.id !== id));
//       }
//     }
//   };

//   const handleView = (receipt) => {
//     setSelectedReceipt(receipt);
//   };

//   const handleCloseDialog = () => {
//     setSelectedReceipt(null);
//   };

//   return (
//     <>
//       {loading ? (
//         <CircularProgress />
//       ) : (
//         <TableContainer component={Paper}>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>Receipt</TableCell>
//                 <TableCell>Username</TableCell>
//                 <TableCell>Phone</TableCell>
//                 <TableCell>Uploaded At</TableCell>
//                 <TableCell>Actions</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {receipts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((receipt) => (
//                 <TableRow
//                   key={receipt.id}
//                   hover
//                 >
//                   <TableCell>
//                     <Avatar
//                       variant="square"
//                       src={receipt.receipt_image}
//                       alt="Receipt"
//                       sx={{ width: 60, height: 60 }}
//                     />
//                   </TableCell>
//                   <TableCell>{receipt.username}</TableCell>
//                   <TableCell>{receipt.phone}</TableCell>
//                   <TableCell>
//                     {new Date(receipt.uploaded_at).toLocaleString()}
//                   </TableCell>
//                   <TableCell>
//                     <IconButton color="primary" onClick={() => handleView(receipt)}>
//                       <VisibilityIcon />
//                     </IconButton>
//                     <IconButton color="error" onClick={() => handleDelete(receipt.id)}>
//                       <DeleteIcon />
//                     </IconButton>
//                   </TableCell>
//                 </TableRow>
//               ))}
//               {receipts.length === 0 && (
//                 <TableRow>
//                   <TableCell colSpan={5}>
//                     <Typography align="center" color="text.secondary">
//                       No receipts found.
//                     </Typography>
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//           <TablePagination
//             component="div"
//             count={receipts.length}
//             page={page}
//             onPageChange={(e, newPage) => setPage(newPage)}
//             rowsPerPage={rowsPerPage}
//             rowsPerPageOptions={[5]}
//           />
//         </TableContainer>
//       )}

//       {/* Details Modal */}
//       <Dialog open={!!selectedReceipt} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
//         <DialogTitle>Receipt Details</DialogTitle>
//         <DialogContent>
//           {selectedReceipt && (
//             <Box display="flex" flexDirection="column" alignItems="center">
//               <Avatar
//                 variant="square"
//                 src={selectedReceipt.receipt_image}
//                 alt="Receipt"
//                 sx={{ width: "100%", height: "auto", mb: 2 }}
//               />
//               <Typography variant="body1"><strong>Username:</strong> {selectedReceipt.username}</Typography>
//               <Typography variant="body1"><strong>Phone:</strong> {selectedReceipt.phone}</Typography>
//               <Typography variant="body1"><strong>Uploaded At:</strong> {new Date(selectedReceipt.uploaded_at).toLocaleString()}</Typography>
//             </Box>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseDialog}>Close</Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// };

// export default ReceiptTable;
