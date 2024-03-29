import * as _ from 'lodash';

const parseData = (data, stockColors, arrCompareKeys) => {
    let parsedData = [];
    let formatData;
    arrCompareKeys = arrCompareKeys.map(item => item.replace('Close', ''))

    //format data to common structure
    for (let i = 0; i < data.length; i++) {
        if (Object.keys(data[i].values).length !== 0) {
            for (const [key, value] of Object.entries(data[i].values)) {

                if (data[i].code && data[i].ticker) {
                    parsedData.push({
                        date: +key,
                        [`${data[i].ticker}Close`]: +value[3],
                        [`${data[i].ticker}High`]: +value[1],
                        [`${data[i].ticker}Low`]: +value[2],
                        [`${data[i].ticker}Open`]: +value[0],
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
                        [`${data[i].code}Close`]: +value[3],
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

    //foramt data if data[code] null in range

    if (parsedData.length !== 0) {
        formatData = _.map(_.groupBy(parsedData,(item) =>  { return item.date }), (g) =>  { return _.merge.apply(this, g) })
        for (let i = 0; i < formatData.length; i++ ){
            for (let j = 0; j < arrCompareKeys.length; j++) {
               if (Object.keys(formatData[i]).indexOf(arrCompareKeys[j]) === -1){
                    formatData[i][arrCompareKeys[j]] = {
                        color: stockColors[j],
                        open: 0,
                        high: 0,
                        close: 0,
                        low: 0,
                        volume: 0,
                        volume2: 0,
                    }

               }
            }
        }

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

    //array keys to compare calculator
    const arrCompareKeys = [];

    //arr for checboxes selectboxes
    const arrStockPapers = result.map(item => {
        if (Object.keys(item.values).length !== 0){
            if (item.code && item.ticker) {
                arrCompareKeys.push(`${item.ticker}Close`, `${item.ticker}Open`, `${item.ticker}High`, `${item.ticker}Low`)
                return {
                    stock: [item.code, item.ticker]
                }
            } else {
                arrCompareKeys.push(`${item.code}Close`)
                return {
                    index: item.code
                }
            }
        }

    });


    const arrPapers = arrStockPapers.filter(item => item !== undefined);

    const data = parseData(result, stockColors, arrCompareKeys);

    return {
        data,
        arrPapers,
        arrCompareKeys
    };
}

export {
    getDataRustocks
}