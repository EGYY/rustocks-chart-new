import React, {useEffect, useRef, useState} from 'react';

import RefreshIcon from '@material-ui/icons/Refresh';
import IconButton from "@material-ui/core/IconButton";
import Alert from '@material-ui/lab/Alert';

import Chart from "../Chart/Chart";
import Spinner from "../Spinner/Spinner";


import {getDataRustocks} from "../../utils/getRustocksData";

import './app.scss';

function App({config}) {

    const [data, setData] = useState([]);
    const [err, setErr] = useState(false);
    const [timeGap, setTimeGap] = useState('1d');
    const [arrPapers, serArrPapers] = useState([]);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        getDataRustocks(timeGap, config.stockData, config.stockColors).then(data => {
            setLoading(false);
            setData(data.data);
            serArrPapers(data.arrPapers);
        }).catch((e) => {
            console.log(e);
            setErr(true)
        });
    }, [timeGap]);

    const changeDataByTimeGap = (gap) => {
        setTimeGap(gap);
        setLoading(true);
    }

    if(err) {
        return (
            <div className='err-msg'>
                <Alert severity="error">Упс, что-то пошло не так...Обнови страничку!</Alert>
                <IconButton aria-label="refresh"  onClick={() => document.location.reload(true)}>
                    <RefreshIcon fontSize="large" />
                </IconButton>
            </div>
        )
    }


    if (data.length === 0 || arrPapers.length === 0) {
        return (
            <div style={
                {
                    display: 'flex',
                    width: '100%',
                    height: '100vh',
                    justifyContent: 'center',
                    alignItems: 'center'
                }
            }>
                <Spinner/>
            </div>

        );
    }


    const ticker = arrPapers.filter(item => item.stock)[0].stock[1];

    const formatedData = data.map(item => {
        if (item[ticker] === undefined) {
            return {
                ...item,
                date: new Date(+item.date),
                open: 0,
                high: 0,
                low: 0,
                close: 0,
                volume: 0,
                volume2: 0
            }
        }else {
            return {
                ...item,
                date: new Date(+item.date),
                open: item[ticker].open,
                high: item[ticker].high,
                low: item[ticker].low,
                close: item[ticker].close,
                volume: item[ticker].volume,
                volume2: item[ticker].volume2
            }
        }

    })
    //
    // console.log(arrPapers)
    console.log(formatedData)



    return (
        <div className="App">
            <Chart type="hybrid"
                   isLoading={isLoading}
                   data={formatedData}
                   arrPapers={arrPapers}
                   ticker={ticker}
                   config={config}
                   changeDataByTimeGap={changeDataByTimeGap}
            />
        </div>
    );
}


export default App;
