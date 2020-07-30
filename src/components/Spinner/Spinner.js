import React from "react";
import CircularProgress from '@material-ui/core/CircularProgress';
import {withStyles} from "@material-ui/styles";

const Spinner = ({classes}) => {
    return(
            <CircularProgress  className={classes.bottom}/>
    );
}

const styles = {
    bottom: {
        color: window.chartConfig.spinner.color
    }
}

export default withStyles(styles)(Spinner);