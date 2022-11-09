// Style Imports
import "./style/groups.scss";

// Library Imports
import { FormControl, TextField, Typography, Button, IconButton, Tooltip, CircularProgress } from "@mui/material";
import { useState, useEffect } from "react"
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// Component Imports
import {Breadcrumbs} from "./Navigation";
import {AvatarStack} from "./Avatars"
import { OutlinedCard } from "./Surfaces";

// API Imports
import { RouteManager } from "../../api/routeManager";
import { showDollars } from "../../api/strings";
import { SessionManager } from "../../api/sessionManager";
import { DBManager } from "../../api/db/dbManager";
import { SectionTitle } from "./Labels";

// Get user manager from LS
const currentUserManager = SessionManager.getCurrentUserManager();

export function GroupNew() {

  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");

  function checkSubmitEnable() {
      return groupName.length > 0;
  }

  /**
   * Creates a group, adds the current user to that group, and redirects the user
   * to the invitation page for this new group
   */
  async function handleSubmit() {
    const groupManager = DBManager.getGroupManager();
    // Set group metadata
    groupManager.setCreatedAt(new Date());
    groupManager.setCreatedBy(SessionManager.getUserId());
    // Set user-facing group data
    groupManager.setDescription(groupDescription.length > 0 ? groupDescription : null);
    groupManager.setName(groupName);
    // Add current user to group
    groupManager.addUser(SessionManager.getUserId());
    // Create a code
    // Push changes to new group, then add the group to current user if successful
    await groupManager.push();
    await groupManager.generateInvites();
    currentUserManager.addGroup(groupManager.getDocumentId());
    await currentUserManager.push();
    RouteManager.redirectToGroupInvite(groupManager.getDocumentId());
  }

  return (
    <div className="group-form">
      <Breadcrumbs path="Dashboard/Groups/New" />
      <div className="d-flex flex-column align-items-center justify-content-center w-100 gap-10">
          <Typography variant="h1">Create a Group</Typography>
          <FormControl className="gap-10 w-50">
              <TextField
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                inputProps={{min: 0, style: { textAlign: 'center' }}}
                label="Group Title"
              >
              </TextField>
              <TextField
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                inputProps={{min: 0, style: { textAlign: 'center' }}}
                label="Description (Optional)"
                multiline={true}
              >
              </TextField>
          </FormControl>
          <Button variant="contained" color="primary" disabled={!checkSubmitEnable()} onClick={() => handleSubmit()}>
              Create Group
          </Button>
      </div>
    </div>
  );
}

export function GroupMembers({ user }) {
    const params = new URLSearchParams(window.location.search);
    const groupId = params.get("id");
  
    return (
      <div>
        <Breadcrumbs path={"Dashboard/Groups/" + groupId + "/Members"} />
        <h1>Group Members Page</h1>
        <div>Group: {groupId}</div>
        <h2>Needs implementation</h2>
        <a href="https://github.com/r2pen2/Citrus-React/issues/99">
          Github: Implement Dashboard/Groups/Group/Members?id=groupId #99
        </a>
        <ul>
          <li>
            <div>Renders a list of group members by groupId from urlparams</div>
          </li>
        </ul>
      </div>
    );
}

export function GroupInvite() {

    const params = new URLSearchParams(window.location.search);
    const groupId = params.get("id");
  
    const [groupInviteData, setGroupInviteData] = useState({
        link: null,
        qr: null,
        code: null,
      });
    const [clipboardTooltip, setClipboardtooltip] = useState("Copy to Clipboard");
      
    useEffect(() => {
        async function loadGroupData() {
          const groupManager = DBManager.getGroupManager(groupId);
          const link = await groupManager.getLinkInvite();
          const qr = await groupManager.getQrInvite();
          const code = await groupManager.getCodeInvite();
          setGroupInviteData({
            link: link,
            qr: qr,
            code: code,
          });
        }

        loadGroupData();
    }, [groupId])

    /**
     * Reset clipboard tooltip after 1 second
     */
    useEffect(() => {
      setTimeout(() => {
        setClipboardtooltip("Copy to Clipboard");
      }, 1000);
    }, [clipboardTooltip]);

    function copyLink() {
      if (groupInviteData.link) {
        navigator.clipboard.writeText(groupInviteData.link);
        setClipboardtooltip("Copied!");
      }
    }

    return (
        <div className="group-form">
          <div className="d-flex flex-column align-item-center justify-content-center w-100 gap-10">
            <div className="d-flex flex-row align-items-center justify-content-center w-100 gap-2">
              <Tooltip title={clipboardTooltip}>
                <IconButton onClick={() => copyLink()}>
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
              <TextField
                label="Invitation Link"
                value={groupInviteData.link ? groupInviteData.link : "Generating invite link..."}
                id="outlined-size-small"
                size="small"
                className="w-100"
                InputProps={{
                  readOnly: true,
                }}
              />
            </div>
            <div className="d-flex flex-row align-items-center justify-content-center w-100 gap-2">
              <Tooltip title={clipboardTooltip}>
                <IconButton onClick={() => copyLink()}>
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
              <TextField
                label="Invitation Code"
                value={groupInviteData.code ? groupInviteData.code : "Generating code..."}
                id="outlined-size-small"
                size="small"
                className="w-100"
                InputProps={{
                  readOnly: true,
                }}
              />
            </div>
          </div>
        </div>
    );
}

export function GroupDashboard() {
    const params = new URLSearchParams(window.location.search);
    const groupId = params.get("id");
  
    return (
      <div>
        <Breadcrumbs path={"Dashboard/Groups/" + groupId} />
        <h1>Group Dashboard Page</h1>
        <div>Id: {groupId}</div>
        <h2>Needs implementation</h2>
        <a href="https://github.com/r2pen2/Citrus-React/issues/93">
          Github: Implement Dashboard/Groups/Group?id=groupId #93
        </a>
        <ul>
          <li>
            <div>
              Renders a dashboard element with context from groupId in urlparams
            </div>
          </li>
          <li>
            <a href={"/dashboard/groups/group/invite?id=" + groupId}>
              Invite Someone
            </a>
          </li>
          <li>
            <a href={"/dashboard/groups/group/members?id=" + groupId}>
              View Group Members
            </a>
          </li>
        </ul>
      </div>
    );
}

export function GroupAdd() {
  
    const [groupCode, setGroupCode] = useState("");
    const [codeError, setCodeError] = useState(false);

    function checkSubmitEnable() {
        return groupCode.length > 5;
    }

    async function handleCodeSubmit() {
      const inviteManager = DBManager.getInvitationManager(groupCode);
      const inviteValid = await inviteManager.documentExists();
      if (inviteValid) {
        const groupId = await inviteManager.getTarget();
        const groupManager = DBManager.getGroupManager(groupId);
        groupManager.addUser(SessionManager.getUserId());
        currentUserManager.addGroup(groupId);
        await groupManager.push();
        await currentUserManager.push();
        RouteManager.redirectToGroupDashboard(groupId);
      } else {
        setCodeError(true);
      }
    }

    return (
      <div className="group-form">
        <Breadcrumbs path="Dashboard/Groups/Add" />
        <div className="d-flex flex-column align-items-center justify-content-center w-100 gap-10">
            <Typography variant="h1">Add a Group</Typography>
            <FormControl>
                <TextField
                    value={groupCode}
                    onChange={(e) => setGroupCode(e.target.value)}
                    inputProps={{min: 0, style: { textAlign: 'center' }}}
                    label="Group Code"
                >
                </TextField>
            </FormControl>
            <Button variant="contained" color="primary" disabled={!checkSubmitEnable()} onClick={() => handleCodeSubmit()}>
                Join
            </Button>
            <Button variant="outlined" color="primary" onClick={() => RouteManager.redirect("/dashboard/groups/new")}>
                Or create a new group
            </Button>
            <Typography variant="subtitle1" color="error" hidden={!codeError}>Group code invalid!</Typography>
        </div>
      </div>
    );
}

export function GroupList() {

    const [groupsData, setGroupsData] = useState({
        fetched: false,
        groups: [],
    });

    useEffect(() => {
        async function fetchGroupData() {
          currentUserManager.fetchData();
          const groupIds = await currentUserManager.getGroups();
          setGroupsData({
              fetched: true,
              groups: groupIds,
          });
          setTimeout(() => {
            fetchGroupData();
          }, 1000);
        }

        fetchGroupData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function renderGroupList() {

      function renderCards() {
        return groupsData.groups.map((group, index) => {
          return <GroupPreviewCard key={index} groupId={group.id}/>
        })
      }

        if (groupsData.groups.length > 0) {
            return (
              <section className="d-flex flex-row justify-content-center w-100">
                <SectionTitle title="Groups" >
                  <Button variant="contained">Add Friends</Button>
                </SectionTitle >
                { renderCards() }
              </section>
            )
        } 
        if (groupsData.fetched) {
            return (
                <section className="d-flex flex-row justify-content-center w-100">
                    <Typography >User has no groups.</Typography>
                </section>
            )
        }
        return (
            <section className="d-flex flex-row justify-content-center w-100">
                <CircularProgress/>
            </section>
        )
    }

    return (
        <div className="d-flex flex-column mh-100 align-items-center gap-10">
            { renderGroupList() }
        </div>
    )
}

export function GroupPreviewCard({name, users, userDebt}) { 
  
  function getOweString() {
    if (userDebt > 0) {
      return `+${showDollars(Math.abs(userDebt))}`;
    } else if (userDebt < 0) {
      return `-${showDollars(Math.abs(userDebt))}`;
    } else {
      return "±$0"
    }
  }

  function getDebtTooltip() {
    if (userDebt > 0) {
      return `You are owed ${showDollars(Math.abs(userDebt))}`;
    } else if (userDebt < 0) {
      return `You owe ${showDollars(Math.abs(userDebt))}`;
    } else {
      return "You're settled!"
    }
  }

  return (
    <OutlinedCard>
      <div className="d-flex align-items-center flex-column w-100">
      <Tooltip title={getDebtTooltip()} placement="top">
        <div className="d-flex flex-column w-100 group-preview-card align-items-center gap-10">
          <Typography variant="h1">{name}</Typography>
          <Typography variant="subtitle1">{getOweString()}</Typography>
        </div>
      </Tooltip>
      <AvatarStack ids={users} />
      </div>
    </OutlinedCard>
  )
}