import React, {useEffect, useState} from 'react';

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
    const [periodTime, setPeriodTime] = useState({
        from: 1151880000,
        to: 1566580000
    });
    const [arrPapers, serArrPapers] = useState([]);
    const [arrCompareKeys, setArrCompareKeys] = useState([]);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        getDataRustocks(timeGap, config.stockData, config.stockColors, periodTime).then(data => {
            setLoading(false);
            if (data !== null){
                setData(data.data);
                serArrPapers(data.arrPapers);
                setArrCompareKeys(data.arrCompareKeys);
            }else {
                setData(null)
            }

        }).catch((e) => {
            console.log(e);
            setErr(true)
        });
    }, [timeGap, periodTime, config.stockData, config.stockColors]);

    const changeDataByTimeGap = (gap) => {
        setTimeGap(gap);
        setLoading(true);
    }

    const changeDataByPeriodTime = (period) => {
        setPeriodTime(period);
        setLoading(true);
    }

    if(data === null) {
        return (
            <div className='err-msg'>
                <Alert severity="error">Упс... похоже данных за текущий период нет, пожалуйста обновите страницу</Alert>
                <IconButton aria-label="refresh"  onClick={() => document.location.reload(true)}>
                    <RefreshIcon fontSize="large" />
                </IconButton>
            </div>
        )
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


    if (arrPapers.length === 0) {
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


    const formattedData = data.map(item => {
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
    })
    //
    // console.log(arrPapers)
    // console.log(formatedData)


    return (
        <div className="App">

            <Chart type="hybrid"
                   isLoading={isLoading}
                   data={formattedData}
                   arrPapers={arrPapers}
                   ticker={ticker}
                   config={config}
                   periodTime={periodTime}
                   arrCompareKeys={arrCompareKeys}
                   changeDataByPeriodTime={changeDataByPeriodTime}
                   changeDataByTimeGap={changeDataByTimeGap}
            />
        </div>
    );
}

export default App;
