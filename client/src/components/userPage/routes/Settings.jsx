// Library imports
import { ListItem, Drawer, List, Paper, Divider, ListItemIcon, ListItemText, Typography } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import SecurityIcon from '@mui/icons-material/Security';
import LinkIcon from '@mui/icons-material/Link';
import { useState } from 'react';

// Component imports
import { AccountTab } from '../../resources/UserPage';

// API imports
import { SessionManager } from "../../../api/sessionManager";
import { RouteManager } from "../../../api/routeManager";

/**
 * Settings route controller
 */
export default function Settings() {

    const user = SessionManager.getUser();

    RouteManager.setTitleOrRedirectToLogin("Settings");

    /**
     * Sets hash constant to the hash value or account if none
     * @returns {String} the hash to initialize page with
     */
    function getInitialHash() {
        if (window.location.hash === "") {
            window.location.hash = "#account";
            return window.location.hash;
        } else {
            return window.location.hash;
        }
    }

    const [hash, setHash] = useState(getInitialHash());           // The current window.location.hash (for displaying the correct page)

    /**
     * Set url hash to menu item path
     * @param {String} path href of menu item 
     */
    function handleDrawerClick(path) {
        setHash(path);
        window.location.hash = path;
    }

    /**
     * Checks whether a menu item should be considered active based on the hash
     * @param {String} text text for menu item
     * @returns {Boolean} whether or not the item is "selected"
     */
    function isElementActive(text) {
        const formattedHash = hash.toLowerCase().substring(1);
        const formattedText = text.toLowerCase();
        return formattedHash === formattedText;
    }
    
    function renderUnimplementedPage(name, icon) {
        return(
            <div className="unimplemented">
                {icon}
                <Typography marginTop="10px">
                    {name} Settings
                </Typography>
                <Typography marginTop="10px">
                    (Unimplemented)
                </Typography>
            </div>
        )
      }

    function getSettingsPageByHash(currentUser) {
        switch (hash) {
            case "#account":
                return <AccountTab />;
            case "#appearance":
                return renderUnimplementedPage("Appearance", <ColorLensIcon color="primary" fontSize="large"/>);
            case "#connections":
                return renderUnimplementedPage("Connections", <LinkIcon color="primary" fontSize="large"/>);
            case "#security":
                return renderUnimplementedPage("Security", <SecurityIcon color="primary" fontSize="large"/>);
            default:
                return <AccountTab user={currentUser} />;
        }
    }

    // List of menu items to be displayed on left. Easy to add/remove/edit items.
    const menuItems = [
        {
            text: 'Account',
            icon: <AccountCircleIcon color="primary"/>,
            path: '#account'
        },
        {
            text: 'Appearance',
            icon: <ColorLensIcon color="primary"/>,
            path: '#appearance'
        },
        {
            text: 'Connections',
            icon: <LinkIcon color="primary"/>,
            path: '#connections'
        },
        {
            text: 'Security',
            icon: <SecurityIcon color="primary"/>,
            path: '#security'
        },
        
    ]

    return (
      <div className="user-settings-wrapper" data-testid="user-settings-wrapper">
        <Paper className="settings-content" data-testid="settings-paper" elevation={12} sx={{ backgroundColor: '#fafafa', borderRadius: "10px"}}>
            <Drawer
                className="side-drawer"
                variant="permanent"
                anchor="left"
                classes={{ paper: "drawer-paper" }}
                data-testid="settings-drawer"
            >
                <List>
                    {menuItems.map(item => (
                    <div key={item.text}>
                        <ListItem 
                            button  
                            onClick={() => handleDrawerClick(item.path)} 
                            data-testid={"drawer-item-" + item.text} 
                            className={isElementActive(item.text) ? "active" : ""}
                            display="flex"
                        >
                          <ListItemIcon>{item.icon}</ListItemIcon>
                          <ListItemText primary={item.text} />
                        </ListItem>  
                        <Divider variant="middle" />
                    </div>
                    ))}
                </List>
            </Drawer>
            { getSettingsPageByHash(user) }
        </Paper>
      </div>
    )
}
