import React, {useEffect, useRef, useState} from 'react';
import Chart from "../Chart/Chart";
import Spinner from "../Spinner/Spinner";

import {getData} from "../../utils/getData";
import {getDataRustocks} from "../../utils/getRustocksData";

function App() {
    const [data, setData] = useState([]);

    useEffect(() => {
        // getData().then(data => {setData(data)});
        getDataRustocks().then(data => setData(data.parsedData));
    }, []);


    if (data.length === 0) {
        return (
            <Spinner/>
        );
    }

    return (
        <div className="App">
            <Chart type="hybrid" data={data}/>
        </div>
    );
}


export default App;
