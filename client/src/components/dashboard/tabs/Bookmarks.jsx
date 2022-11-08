import { Breadcrumbs } from "../../resources/Navigation";
import { BookmarkCard } from "../../resources/Bookmarks";
import { LoadingBoxIfNull } from "../../resources/Feedback";
import { CircularProgress, Button, Stack, Tooltip, Modal, Box, Typography, IconButton, TextField } from '@mui/material';
import { DBManager } from '../../../api/db/dbManager';
import { SessionManager } from '../../../api/sessionManager';

import { useState, useEffect } from 'react';

import AddIcon from '@mui/icons-material/Add';

// Get user manager from LS
const currentUserManager = SessionManager.getCurrentUserManager();

export default function Bookmarks() {
  
  const [userBookmarks, setUserBookmarks] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(null);
  const [newTotal, setNewTotal] = useState(null);

  /**
   * Fetch bookmark list for current user
   */
  async function fetchBookmarks() {
    await currentUserManager.fetchData();
    const userBookmarks = await currentUserManager.getBookmarks();
    setUserBookmarks(userBookmarks);
    setTimeout(() => {
      fetchBookmarks();
    }, 1000);
  }

  /**
   * Renders bookmark slides based on given array
   * @param {Array} a bookmarks for user
   */
  function renderBookmarks(a)  {

    if (!a) { // If we don't yet have a list of bookmarks, just display a little loading circle
      return <div className="d-flex flex-column align-items-center justify-content-center vh-75" key="transaction-list-loading-box"><CircularProgress /></div>
    }
    if (a.length <= 0) {
      //dbManager returned string "none", meaning the user has no bookmarks.
      return (
        <Typography margin="10px">
          User has no bookmarks.
        </Typography>
      )
    }
    // Otherwise, we have bookmarks from DB and should display cards accordingly
    if (a) {
      return (
        a.map((bookmarkId, index) => {
          return (
            <BookmarkCard key={index} bookmarkId={bookmarkId} fetchBookmarks={fetchBookmarks}/>
          )
        })
      )
    }
  }

  /**
   * Render new bookmark form in modal
   */
  function renderNewBookmarkForm() {

    function handleEnter(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    }

    async function handleSubmit() {
      const bookmarkManager = DBManager.getBookmarkManager();
      if (newTitle) {
        bookmarkManager.setTitle(newTitle);
      }
      if (newTotal) {
        bookmarkManager.setTotal(newTotal);
      }
      bookmarkManager.setCreatedAt(new Date());
      bookmarkManager.setCreatedBy(SessionManager.getUserId());
      const newBookmarkDocRef = await bookmarkManager.push();
      currentUserManager.addBookmark(newBookmarkDocRef.id); 
      await currentUserManager.push();
      fetchBookmarks();
      setAddModalOpen(false);
    }

    return (
      <Stack component="form" sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }} noValidate autoComplete="off" alignItems="center" display="flex" justifyContent="center" data-testid="new-bookmark-form-wrapper">
        <div className="fields">
          <TextField id="title" label="Title (optional)" onChange={e => setNewTitle(e.target.value)} data-testid="new-title-input" onKeyDown={(e) => handleEnter(e)}/>
          <TextField id="total" label="Total (optional)" onChange={e => setNewTotal(e.target.value)} data-testid="new-total-input" onKeyDown={(e) => handleEnter(e)}/>
        </div>
        <div className="submit-button">
          <Button variant="contained" component="div" onClick={() => handleSubmit()} data-testid="submit-button">
            Add Bookmark
          </Button>
        </div>
      </Stack>
    )
  }

  // Fetch bookmarks by ID on mount
  useEffect(() => {
    fetchBookmarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bookmarks-page-wrapper">
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        aria-labelledby="modal-modal-title"
      >
        <Box className="modal">
          <Typography id="modal-modal-title" variant="h6" component="h2" marginTop="10px">
            New Bookmark
          </Typography>
          { renderNewBookmarkForm() }
        </Box>
      </Modal>
      <Breadcrumbs path="Dashboard/Bookmarks" />
      <div className={"loading-box " + (userBookmarks ? "hidden" : "")}>
        <LoadingBoxIfNull object={userBookmarks} />
      </div>
      <div className="d-flex flex-column w-100 align-items-center">
        { renderBookmarks(userBookmarks) }
        <div className={"add-button " + (userBookmarks ? "" : "hidden")}>
          <Tooltip title="Add Bookmark">
            <IconButton onClick={() => setAddModalOpen(true)} >
              <AddIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}