// Library Imports
import DeleteIcon from '@mui/icons-material/Delete';
import { useState, useEffect } from 'react';
import { CardContent, CardActionArea, Tooltip } from '@mui/material';

// Component Imports
import { ColoredCard } from "./Surfaces";

// API Imports
import { DBManager } from '../../api/db/dbManager';
import { Debugger } from "../../api/debugger";
import { SessionManager } from "../../api/sessionManager";
import { getSlashDateString, showDollars } from '../../api/strings';

/**
 * A card displaying data for one of a user's bookmarks
 * @param {string} bookmarkId id of bookmark to render card for
 * @param {function} fetchBookmarks bookmark fetch function to be called after deletion 
 * @returns 
 */

// We only need the user manager if we're doing anything on the user's document. No need to make one if we're not gonna edit this bookmark.
const currentUserManager = SessionManager.getCurrentUserManager();

export function BookmarkCard({bookmarkId, fetchBookmarks}) {

  // Fetch our bookmark manager
  const bookmarkManager = DBManager.getBookmarkManager(bookmarkId);

  useEffect(() => {

    async function fetchBookmarkData() {
      const bookmarkData = await bookmarkManager.fetchData();
      setData(bookmarkData);
      const bookmarkCreatedAt = await bookmarkManager.getCreatedAt();
      setCreatedAt(bookmarkCreatedAt);
      const bookmarkColor = getColor(bookmarkCreatedAt);
      setColor(bookmarkColor);
      const bookmarkTitle = await bookmarkManager.getTitle();
      setTitle(bookmarkTitle);
      const bookmarkTotal = await bookmarkManager.getTotal();
      setTotal(bookmarkTotal);
    }

    fetchBookmarkData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const [data, setData] = useState();
  const [color, setColor] = useState("#fafafa");
  const [createdAt, setCreatedAt] = useState(new Date());
  const [title, setTitle] = useState(null);
  const [total, setTotal] = useState(null);

  function blankIfNull(s) {
    return s ? s : "";
  }

  function deleteBookmark() {
    currentUserManager.removeBookmark(bookmarkId);
    currentUserManager.push().then((pushSuccess) => {
      if (pushSuccess) {
        bookmarkManager.deleteDocument();
        SessionManager.setCurrentUserManager(currentUserManager);
        fetchBookmarks();
      }
    });
  }

  if (!data) { // Render unloaded bookmark
    return (
      <div className="bookmark-wrapper d-flex flex-row align-items-center vh-70">
        <ColoredCard color={color}>
          <CardActionArea>
            <CardContent>
              <div className="bookmark">
                <div className="left">
                  <div className="delete-button">
                    <Tooltip title="Delete Bookmark">
                        <DeleteIcon fontSize="medium"/>
                    </Tooltip>
                  </div>
                  <div className="left-data">
                    <div className="date">
                    </div>
                  </div>
                </div>
                <div className="center">
                  <div className="title">
                  </div>
                </div>
                <div className="note-container">
                </div>
                <div className="right">
                  <div className="amount">
                  </div>
                </div>
              </div>
            </CardContent>  
          </CardActionArea>
        </ColoredCard>
      </div>
    )
  } // Render loaded bookmark
  return (
    <div className="bookmark-wrapper d-flex flex-row align-items-center vh-70">
      <ColoredCard color={color}>
        <CardActionArea onClick={() => Debugger.log("Sending transaction for bookmark: " + bookmarkId)}>
          <CardContent>
            <div className="bookmark">
              <div className="left">
                <div className="delete-button">
                  <Tooltip title="Delete Bookmark">
                    <DeleteIcon fontSize="medium" onClick={() => deleteBookmark(bookmarkId)}/>
                  </Tooltip>
                </div>
                <div className="left-data">
                  <div className="date">
                    {getSlashDateString(createdAt)}
                  </div>
                </div>
              </div>
              <div className="center">
                <div className="title">
                  {blankIfNull(title)}
                </div>
              </div>
              <div className="note-container">
              </div>
              <div className="right">
                <div className="amount">
                  {blankIfNull(showDollars(total))}
                </div>
              </div>
            </div>
          </CardContent>  
        </CardActionArea>
      </ColoredCard>
    </div>
  )
}


/**
 * Get a color representing the age of a bookmark
 * @param date createdAt date of bookmark
 * @returns Color's hex code
 */
function getColor(date) {
  /**
   * Get age of bookmark in days
   * @date createdAt date of bookmark
   * @returns num days since creation
   */
  function getAge(d) {
    const now = new Date();
    const delta = now.getTime() - d.toDate().getTime();
    const seconds = delta/1000;
    const minutes = seconds/60;
    const hours = minutes/60;
    const days = hours/24;
    return Math.floor(days);
  }

  const age = getAge(date);
  if (age < 3) {
    return "#bfd679"; // citrus green
  }
  if (age < 7) {
    return "#FDB90F"; // citrus orange
  }
  return "#EA4236"; // citrus red
}