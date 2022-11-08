// Library imports
import { CircularProgress } from '@mui/material';

// Style imports
import "./style/feedback.scss";

/**
 * Render a loading box inside parent div if the passed object evaluates to false
 * @param {Any} object literally anything. If this is false or null we'll render a loading box to fill the parent div
 * @returns Loading box or empty div
 */
export function LoadingBoxIfNull({object}) {
    if (!object) {
        return (
            <div className="loading-box-if-null-wrapper">
                <CircularProgress />
            </div>
        )
    }
    return (<div />)
}