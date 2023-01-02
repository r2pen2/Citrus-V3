// Style imports
import "./style/avatars.scss";

// Library imports
import { useState, useEffect } from 'react';
import { AvatarGroup, Avatar, Tooltip, Typography } from "@mui/material";
import Badge from '@mui/material/Badge';

// API imports
import { DBManager } from "../../api/db/dbManager";
import { OutlinedCard } from "./Surfaces";

export function AvatarStack({ids, checked}) {
    function renderAvatarStackItems() {
        return (
            <AvatarGroup>
                { ids.map((id, key) => {
                    return <AvatarStackItem userId={id} key={key} checked={checked ? checked : []}/>
                })}
            </AvatarGroup>
        )
    }

    return (
      <div className="avatar-stack-wrapper">
          <div className="featured">
            { renderAvatarStackItems() }
          </div>
      </div>
    )
}

export function AvatarStackItem(props) {

    const [pfpUrl, setPfpUrl] = useState(null);
    const [name, setName] = useState(null);

    useEffect(() => {

        async function fetchUserData() {
            const userManager = DBManager.getUserManager(props.userId);
            let photo = await userManager.getPfpUrl();
            setPfpUrl(photo);
            let displayName = await userManager.getDisplayName();
            setName(displayName);
        }

        fetchUserData();
    }, [props.userId]);

    function renderBadgedAvatar() {
        
        for (const payer of props.checked) {
            if (payer === props.userId) {
                return (
                    <Badge badgeContent={<div className="avatar-check">✓</div>} color="primary" anchorOrigin={{vertical: "bottom", horizontal: "right"}}>
                        <Avatar 
                        src={pfpUrl ? pfpUrl : ""} 
                        alt={name ? name : ""} 
                        className="pfp"
                        imgProps={{referrerPolicy: "no-referrer" }}/>
                    </Badge>   
                )
            }
        }
        return <Avatar 
        src={pfpUrl ? pfpUrl : ""} 
        alt={name ? name : ""} 
        className="pfp"
        imgProps={{referrerPolicy: "no-referrer" }}/>
    }

    return (
        <Tooltip title={name ? name : ""}>
            { renderBadgedAvatar() }
        </Tooltip>
    )
}

export function AvatarIcon(props) {
    const [pfpUrl, setPfpUrl] = useState(props.src ? props.src : null);
    const [displayName, setDisplayName] = useState(props.displayName ? props.displayName : null);

    useEffect(() => {

        const userManager = DBManager.getUserManager(props.id);

        async function fetchUserData() {
            if (!props.src) {
                let url = await userManager.getPfpUrl();
                setPfpUrl(url);
            }
            if (!props.displayName) {
                let name = await userManager.getDisplayName();
                setDisplayName(name);
            }
        }

        fetchUserData();
        
    }, [props.id, props.src, props.displayName]);

    // If we've declared a size, return one with sx attr
    if (props.size) {    
        return (
            <Tooltip className="avatar-icon" title={props.showTooltip ? props.displayName : ""}>
                <Avatar src={pfpUrl} alt={displayName} sx={{width: props.size, height: props.size}} />
            </Tooltip>
        )
    }
    return (
        <Tooltip className="avatar-icon" title={props.showTooltip ? props.displayName : ""}>
            <Avatar src={pfpUrl} alt={displayName}/>
        </Tooltip>
    )
}

export function AvatarToggle(props) {

    function renderName() {
        if (props.displayName) {
            const shortenedName = props.displayName.substring(0, props.displayName.indexOf(" "));
            return (
                <Typography color={props.outlined ? "primary" : "black"}>{shortenedName}</Typography>
            )
        }
    }

    return (
        <div className="avatar-toggle">
            <div className={"avatar-toggle-icon-element " + (props.outlined ? "outlined" : "")}>
                <AvatarIcon id={props.id} src={props.src ? props.src : null} displayName={props.displayName ? props.displayName : null}/>
            </div>
            { renderName() }
        </div>
    )
}

export function AvatarCard(props) {

    const [displayName, setDisplayName] = useState(props.displayName ? props.displayName : "");

    useEffect(() => {

        async function fetchDisplayName() {
            if (displayName.length > 0) {
                return
            }
            const userManager = DBManager.getUserManager(props.id);
            const name = await userManager.getDisplayName();
            setDisplayName(name);
        }

        fetchDisplayName();
    }, [])

    return (
        <OutlinedCard>
            <div className="m-2 d-flex flex-row">
                <div className="w-10">
                    <AvatarIcon id={props.id} src={props.src} />
                </div>
                <div className="w-70 d-flex flex-row justify-content-center align-items-center">
                    {displayName}
                </div>
                <div className="w-20 d-flex flex-row justify-content-center align-items-center">
                    {props.children}
                </div>
            </div>
        </OutlinedCard>
    )
}