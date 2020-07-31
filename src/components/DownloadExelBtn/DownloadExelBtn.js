import React from "react";
import Button from "@material-ui/core/Button";
import { makeStyles } from '@material-ui/core/styles';

import ReactExport from "react-data-export";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;


const config = window.chartConfig;

const styles = makeStyles({
    root: {...config.btn}
});

const DownloadExelBtn = ({data}) => {
    const classes = styles();

    return (
        <ExcelFile element={<Button classes={{root: classes.root}} variant="contained" color="primary">Скачать в
            Excel</Button>}>
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


export default DownloadExelBtn;