import * as _ from 'lodash';



const parseData = (data) => {
    let parsedData = [];
    let groupedData = [];


    for (let i = 0; i < data.length; i++) {
        const fisrtElemArr = Object.entries(data[i].values)[0][1][3];
        for (const [key, value] of Object.entries(data[i].values)) {

            if (data[i].code && data[i].ticker) {
                parsedData.push({
                    date: +key,
                    percentData: {
                        close: {
                            [data[i].ticker]: (Math.round((+value[3] / +fisrtElemArr) * 100))
                        },
                        high: {
                            [data[i].ticker]: (Math.round((+value[2] / +fisrtElemArr) * 100))
                        },
                        low: {
                            [data[i].ticker]: (Math.round((+value[1] / +fisrtElemArr) * 100))
                        }
                    },
                    [data[i].ticker]: {
                        open: +value[0],
                        high: +value[1],
                        low: +value[2],
                        close: +value[3],
                        volume: +value[4],
                        volume2: +value[5]
                    }
                });
            } else {
                parsedData.push({
                    date: +key,
                    percentData: {
                        close: {
                            [data[i].code]: (Math.round((+value[3] / +fisrtElemArr) * 100))
                        },
                        high: {
                            [data[i].code]: (Math.round((+value[1] / +fisrtElemArr) * 100))
                        },
                        low: {
                            [data[i].code]: (Math.round((+value[2] / +fisrtElemArr) * 100))
                        }
                    },
                    [data[i].code]: {
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
    }

    const formatData = _.map(_.groupBy(parsedData,(item) =>  { return item.date }), (g) =>  { return _.merge.apply(this, g) })

    return formatData;
}

const getDataRustocks = async (timeGap) => {
    let newData = [];


    // 2020-07-23
    const from = 1597435200000;
    // 2020-07-15
    const to = 1598126400000;

    const proxy = 'https://cors-anywhere.herokuapp.com/';
    const body = [
        {
            "code": "MICEXC",
            "timegap": timeGap,
            "from": 1293829200,
            "to": 1593205200
        },
        {
            "code": "MICEX",
            "ticker": "WGC4",
            "timegap": timeGap,
            "from": 1293829200,
            "to": 1593205200
        },
        {
            "code": "MICEX",
            "ticker": "SNGS",
            "timegap": timeGap,
            "from": 1293829200,
            "to": 1593205200
        }
    ];

    const response = await fetch(`${proxy}https://info.rsf.ru/streamR/`, {
        method: 'POST',
        body: JSON.stringify(body)
    });

    const result = await response.json();

    console.log(result);

    const arrPapers = result.map(item => {
        if (item.code && item.ticker) {
            return {
                stock: [item.code, item.ticker]
            }
        } else {
            return {
                index: item.code
            }
        }
    });

    const data = parseData(result, arrPapers);

    return {
        data,
        arrPapers
    };
}

export {
    getDataRustocks
}