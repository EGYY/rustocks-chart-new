import React from "react";
import Button from "@material-ui/core/Button";
import {withStyles} from "@material-ui/styles";
import ReactExport from "react-data-export";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const DownloadExelBtn = ({data, classes}) => {

    return (
        <ExcelFile element={<Button className={classes.btn} variant="contained" color="primary">Скачать в Excel</Button>}>
            <ExcelSheet data={data} name="MOEX">
                <ExcelColumn label="Date" value="date"/>
                <ExcelColumn label="Open" value="open"/>
                <ExcelColumn label="High" value="high"/>
                <ExcelColumn label="Low" value="low"/>
                <ExcelColumn label="Close" value="close"/>
                <ExcelColumn label="Volume" value="volume"/>
            </ExcelSheet>
        </ExcelFile>
    );
}

const config = window.chartConfig;


const styles = {
    btn: {
        background: config.btn.background,
        color: config.btn.color,
        border: config.btn.border,
        height: config.btn.height,
        width: config.btn.width,
        borderRadius: config.btn.borderRadius,
        boxShadow: config.btn.boxShadow,
    },
}

export default withStyles(styles)(DownloadExelBtn);