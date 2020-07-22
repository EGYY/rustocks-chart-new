
const parseData = (data) => {
    let parsedData = [];


    for (let i = 0; i < data.length; i++) {

        for (const [key, value] of Object.entries(data[i].values)) {
            parsedData.push({
                date: +key,
                [data[i].ticker]: {
                    open: +value[0],
                    high: +value[1],
                    low: +value[2],
                    close: +value[3],
                    volume: +value[4],
                    volume2: +value[5]
                }
            });
        }
    }


    return parsedData;
}

const getDataRustocks = async () => {
    let newData = [];

    const proxy = 'https://cors-anywhere.herokuapp.com/';
    const body = [
        {
            "code": "MICEX",
            "ticker": "WGC4",
            "timegap": "1d",
            "from": 1293829200,
            "to": 1593205200
        },
        {
            "code": "MICEX",
            "ticker": "SNGS",
            "timegap": "1d",
            "from": 1293829200,
            "to": 1593205200
        }
    ];

    const response = await fetch(`${proxy}https://info.rsf.ru/streamR/`, {
        method: 'POST',
        body: JSON.stringify(body)
    });

    const result = await response.json();

    const arrPapers = result.map(item => {
        return {
            index: item.code,
            ticker: item.ticker
        }
    });

    const data = parseData(result);

    data.sort((a, b) => (a.date > b.date) ? 1 : -1);

    data.reduce((prev, curr) => {
        return prev.date == curr.date ? newData.push({...prev, ...curr}): curr
    }, []);




    return {
        data:newData,
        arrPapers
    };
}

export {
    getDataRustocks
}