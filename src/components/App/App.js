import React, {useEffect, useRef, useState} from 'react';
import Chart from "../Chart/Chart";
import Spinner from "../Spinner/Spinner";

import {getData} from "../../utils/getData";
import {getDataRustocks} from "../../utils/getRustocksData";

function App() {
    const [data, setData] = useState([]);
    const [timeGap, setTimeGap] = useState('1d');
    const [arrPapers, serArrPapers] = useState([]);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        // getData().then(data => {setData(data)});
        getDataRustocks(timeGap).then(data => {
            setLoading(false);
            setData(data.data);
            serArrPapers(data.arrPapers);
        });
    }, [timeGap]);

    const changeDataByTimeGap = (gap) => {
        setTimeGap(gap);
        setLoading(true);
    }


    if (data.length === 0 || arrPapers.length === 0) {
        return (
            <Spinner/>
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
                   changeDataByTimeGap={changeDataByTimeGap}
            />
        </div>
    );
}


export default App;
