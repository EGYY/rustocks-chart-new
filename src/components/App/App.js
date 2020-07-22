import React, {useEffect, useRef, useState} from 'react';
import Chart from "../Chart/Chart";
import Spinner from "../Spinner/Spinner";

import {getData} from "../../utils/getData";
import {getDataRustocks} from "../../utils/getRustocksData";

function App() {
    const [data, setData] = useState([]);
    const [arrPapers, serArrPapers] = useState([]);

    useEffect(() => {
        // getData().then(data => {setData(data)});
        getDataRustocks().then(data => {
            setData(data.data);
            serArrPapers(data.arrPapers);
        });
    }, []);


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

    console.log(arrPapers)



    return (
        <div className="App">
            <Chart type="hybrid" data={formatedData} arrPapers={arrPapers}/>
        </div>
    );
}


export default App;
