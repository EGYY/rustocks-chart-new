import * as _ from 'lodash';


const parseData = (data, stockColors) => {
    let parsedData = [];
    let formatData

    for (let i = 0; i < data.length; i++) {
        if (Object.keys(data[i].values).length !== 0) {
            const fisrtElArrClose = Object.entries(data[i].values)[0][1][3];
            const firstElArrOpen = Object.entries(data[i].values)[0][1][0];
            const firstElArrHigh = Object.entries(data[i].values)[0][1][1];
            const firstElArrLow = Object.entries(data[i].values)[0][1][2];
            for (const [key, value] of Object.entries(data[i].values)) {

                if (data[i].code && data[i].ticker) {
                    parsedData.push({
                        date: +key,
                        percentData: {
                            [data[i].ticker]: {
                                color: stockColors[i],
                                open: (Math.round((+value[0] / +firstElArrOpen) * 100) - 100),
                                high: (Math.round((+value[1] / +firstElArrHigh) * 100) - 100),
                                low: (Math.round((+value[2] / +firstElArrLow) * 100) - 100),
                                close: (Math.round((+value[3] / +fisrtElArrClose) * 100) - 100),
                            }
                        },
                        [data[i].ticker]: {
                            color: stockColors[i],
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
                            [data[i].code]: {
                                color: stockColors[i],
                                open: (Math.round((+value[0] / +firstElArrOpen) * 100) - 100),
                                high: (Math.round((+value[1] / +firstElArrHigh) * 100) - 100),
                                low: (Math.round((+value[2] / +firstElArrLow) * 100) - 100),
                                close: (Math.round((+value[3] / +fisrtElArrClose) * 100) - 100),
                            }
                        },
                        [data[i].code]: {
                            color: stockColors[i],
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

    }

    // console.log(parsedData)

    if (parsedData.length !== 0) {
        formatData = _.map(_.groupBy(parsedData,(item) =>  { return item.date }), (g) =>  { return _.merge.apply(this, g) })
    }else {
        formatData = null
    }

    return formatData;
}

const getDataRustocks = async (timeGap, stockArr, stockColors, period) => {

    const proxy = 'https://cors-anywhere.herokuapp.com/';



    const queryArr = stockArr.map(item => {
        return {
            ...item,
            'timegap': timeGap,
            'from': period.from,
            'to': period.to
        }
    })

    const response = await fetch(`${proxy}https://info.rsf.ru/streamR/`, {
        method: 'POST',
        body: JSON.stringify(queryArr)
    });

    const result = await response.json();



    const arrStockPapers = result.map(item => {
        // console.log(`Item ${item} length values ${Object.keys(item.values).length}`)
        if (Object.keys(item.values).length !== 0){
            if (item.code && item.ticker) {
                return {
                    stock: [item.code, item.ticker]
                }
            } else {
                return {
                    index: item.code
                }
            }
        }else {
            return
        }

    });

    const arrPapers = arrStockPapers.filter(item => item !== undefined);

    // console.log(arrPapers);

    const data = parseData(result, stockColors);

    return {
        data,
        arrPapers
    };
}

export {
    getDataRustocks
}