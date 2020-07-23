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



    const formatedData = data.map(item => {
        return {
            ...item,
            date: new Date(+item.date),
            open: item.WGC4.open,
            high: item.WGC4.high,
            low: item.WGC4.low,
            close: item.WGC4.close,
            volume: item.WGC4.volume,
            volume2: item.WGC4.volume2
        }
    })

    // console.log(arrPapers)




    return (
        <div className="App">
            <Chart type="hybrid"
                   isLoading={isLoading}
                   data={formatedData}
                   arrPapers={arrPapers}
                   changeDataByTimeGap={changeDataByTimeGap}
            />
        </div>
    );
}


export default App;
