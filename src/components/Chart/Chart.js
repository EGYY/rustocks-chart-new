import React from "react";

import {timeFormat} from "d3-time-format";
import {format} from "d3-format";

import ReactToPrint from 'react-to-print';

import {ChartCanvas, Chart} from "react-financial-charts";

import {XAxis, YAxis} from "react-financial-charts/lib/axes";
import {Label} from "react-financial-charts/lib/annotation";
import {
    BarSeries,
    LineSeries,
    CandlestickSeries,
    MACDSeries,
    RSISeries,
    AreaSeries,
    OHLCSeries
} from "react-financial-charts/lib/series";

import StraightLine from "react-financial-charts/lib/interactive/components/StraightLine";

import {discontinuousTimeScaleProvider} from "react-financial-charts/lib/scale";
import {withDeviceRatio} from "@react-financial-charts/utils";
import {last} from "react-financial-charts/lib/utils";
import {HoverTooltip} from "react-financial-charts/lib/tooltip";
import {
    CrossHairCursor,
    EdgeIndicator,
    MouseCoordinateX,
    MouseCoordinateY
} from "react-financial-charts/lib/coordinates";

import {ema, macd, sma, rsi, compare} from "react-financial-charts/lib/indicator";

import createTrend from 'trendline';

import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import {Button,} from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import {withStyles} from '@material-ui/core/styles';

import clsx from "clsx";

import './chart.scss';
import Spinner from "../Spinner/Spinner";
import DownloadExelBtn from "../DownloadExelBtn/DownloadExelBtn";
// import {Brush} from "react-financial-charts/lib/interactive";
import {Brush} from "../../CustomChartComponents/Brush/Brush";

class ChartNew extends React.Component {

    constructor(props) {
        super(props);

        this.chartRef = React.createRef();
        this.brushRef1 = React.createRef();
        this.brushRef2 = React.createRef();
        this.brushRef3 = React.createRef();
        this.brushRef4 = React.createRef();
        this.leftCol = React.createRef();
        this.resizeWindow = this.resizeWindow.bind(this);
        this.handleBrush = this.handleBrush.bind(this);
        this.viewportHandler = this.viewportHandler.bind(this);

        this.state = {
            testXExtents: [],
            mobileXExtents: [],
            brushEnabled: true,
            stockCodes: {},
            widthChart: null,
            isMinMax: false,
            isEma: false,
            isSma: false,
            isRsi: false,
            isMacd: false,
            isTotalIncome: false,
            isDatePicker: false,
            isTrendLine: false,
            analiticModal: false,
            filtersModal: false,
            supportsTouch: false,
            mobileMinMaxVal: [],
            emaPeriod: 5,
            smaPeriod: 5,
            rsiPeriod: 5,
            slowMacdPeriod: 26,
            fastMacdPeriod: 12,
            signalMacdPeriod: 9,
            trueCountStockeCodes: 1,
            plotData: [],
            yMax: null,
            yMin: null,
            currAnalitics: '',
            indexChart: 'off-index',
            volumeTypeChart: 'money',
            typeChart: 'close-chart',
            timeGap: '1d',
            from: '',
            to: ''
        }
    }

    componentDidMount() {
        const supportsTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;
        const defaultPeriod = this.getPeriodTime();
        const code = this.props.arrPapers.filter(item => item.stock)[0].stock[1];
        let oldStockCodes = this.state.stockCodes;
        let newStockCodes = oldStockCodes;
        newStockCodes[code] = !(oldStockCodes[code] || false)

        this.setState({
            stockCodes: newStockCodes,
            supportsTouch,
            ratio: this.props.ratio,
            widthChart: this.leftCol.current.offsetWidth,
            currAnalitics: code,
            from: defaultPeriod.from,
            to: defaultPeriod.to
        })

        const minMaxVal = this.findMinMaxValues(this.props.data, code)

        this.setState({
            yMax: minMaxVal[1],
            yMin: minMaxVal[0]
        })

        window.addEventListener('resize', this.resizeWindow);
        window.visualViewport.addEventListener("resize", this.viewportHandler);

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if ((prevState.currAnalitics !== this.state.currAnalitics) && this.state.trueCountStockeCodes === 1) {
            let minMaxVal
            if (this.state.testXExtents.length !== 0) {
                minMaxVal = this.findMinMaxValues(this.props.data.slice(this.state.testXExtents[0], this.state.testXExtents[1]), this.state.currAnalitics)
                this.setState({
                    yMax: minMaxVal[1],
                    yMin: minMaxVal[0]
                })
            } else {
                minMaxVal = this.findMinMaxValues(this.props.data, this.state.currAnalitics)
                this.setState({
                    yMax: minMaxVal[1],
                    yMin: minMaxVal[0]
                })
            }

        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeWindow);
        window.visualViewport.removeEventListener("resize", this.viewportHandler);
    }

    viewportHandler() {
        this.setState({
            ratio: window.devicePixelRatio
        })
    }

    resizeWindow() {
        this.setState({
            widthChart: this.leftCol.current.offsetWidth,

        })
    }


    getPeriodTime() {
        const periodTime = this.props.periodTime;
        const from = new Date(periodTime.from);
        const to = new Date(periodTime.to);
        const fromString = from.toISOString().slice(0, 10);
        const toString = to.toISOString().slice(0, 10);

        return {
            from: fromString,
            to: toString
        }
    }

    findMinMaxValues(data, currAnalitics) {
        let min = data[0][currAnalitics].close;
        let max = data[0][currAnalitics].close;

        for (let i = 1; i < data.length; i++) {
            let currValue = data[i][currAnalitics].close;
            min = (currValue < min) ? currValue : min;
            max = (currValue > max) ? currValue : max;
        }

        return [min, max];
    }

    handleChangeData({plotData}) {
        this.brushRef1.terminate();
        this.brushRef2.terminate();

        if (this.state.isRsi) {
            this.brushRef3.terminate()
        }

        if (this.state.isMacd) {
            this.brushRef4.terminate()
        }

        this.setState({
            plotData
        })

        if (this.state.supportsTouch) {
            const start = this.props.data.map(item => item.date).indexOf(plotData[0].date);
            const end = this.props.data.map(item => item.date).indexOf(last(plotData).date);
            const mobileXExtents = [start, end];
            const mobileMinMaxVal = this.findMinMaxValues(this.props.data.slice(start, end), this.state.currAnalitics)
            this.setState({
                plotData: this.props.data.slice(start, end),
                mobileMinMaxVal,
                mobileXExtents
            })
        }

        this.setState(prevState => {
            let testXExtents, minMaxVal;
            if (prevState.testXExtents === this.state.testXExtents) {
                const start = this.props.data.indexOf(this.props.data[0]);
                const end = this.props.data.indexOf(last(this.props.data))
                testXExtents = [start, end];
                minMaxVal = this.findMinMaxValues(this.props.data.slice(start, end), this.state.currAnalitics)
            } else {
                testXExtents = prevState.testXExtents;
                minMaxVal = [prevState.yMin, prevState.yMax];
            }

            return {
                yMax: minMaxVal[1],
                yMin: minMaxVal[0],
                testXExtents: testXExtents
            }
        })
    }

    toggleDatePicker() {
        this.setState({
            isDatePicker: !this.state.isDatePicker
        });
    }

    handleChangeCheckbox(code) {
        let key = `is${code}`;
        let upd = {};
        upd[key] = !(this.state[key] || false);
        let newState = Object.assign({}, this.state, upd);
        this.setState(newState);
    }

    handleChangeCheckboxCode(code) {
        let oldStockCodes = this.state.stockCodes;
        let newStockCodes = oldStockCodes;
        const analiticExist = ((this.state.stockCodes[this.state.currAnalitics] !== undefined) && (this.state.stockCodes[this.state.currAnalitics] == false))
        newStockCodes[code] = !(oldStockCodes[code] || false);
        this.setState({
            stockCodes: newStockCodes
        });
        const trueStockeCodes = Object.entries(this.state.stockCodes).filter(item => item[1] === true);
        console.log(trueStockeCodes)
        this.setState({
            trueCountStockeCodes: trueStockeCodes.length
        });

        if (trueStockeCodes.length === 0) {
            this.setState({
                isMinMax: false,
                isTrendLine: false,
                isTotalIncome: false,
                isEma: false,
                isSma: false,
                isRsi: false,
                isMacd: false

            });
        }



        if ((trueStockeCodes.length >= 1)) {
            this.dataCalculator(trueStockeCodes[0][0]);
            this.setState({
                typeChart: 'close-chart',
                currAnalitics: trueStockeCodes[0][0],
                isMinMax: false,
                isTrendLine: false,
                isTotalIncome: false,
                isSma: false,
                isEma: false,
            });
        }
    }

    dataCalculator(currAnalitics = this.state.currAnalitics) {
        let emaCustom, smaCustom, rsiCalculator, macdCalculator, compareCalc;
        const codeArrValues = this.props.arrPapers.filter(item => item.index).map(item => `${item.index}Close`)
        const stockArr = this.props.arrPapers.filter(item => item.stock).map(item => item.stock[1]);
        const filteredStockArr = stockArr.filter(item => item !== currAnalitics).map(item => `${item}Close`)

        compareCalc = compare()
            .options({
                basePath: `${currAnalitics}Close`,
                mainKeys: [`${currAnalitics}Close`, `${currAnalitics}Open`, `${currAnalitics}High`,`${currAnalitics}Low`],
                compareKeys: [...filteredStockArr, ...codeArrValues]
            })
            .accessor((d) => d.compare)
            .merge((d, c) => {
                d.compare = c
            })

        emaCustom = ema()
            .options(
                {
                    windowSize: +this.state.emaPeriod,
                    sourcePath: [currAnalitics, 'close']
                },
            )
            .merge(({[currAnalitics]: data}, c) => {

                {
                    data.emaCustom = c;
                }

            })
            .accessor(({[currAnalitics]: data}) => data.emaCustom);

        smaCustom = sma()
            .options({
                windowSize: +this.state.smaPeriod,
                sourcePath: [currAnalitics, 'close']
            })
            .merge(({[currAnalitics]: data}, c) => {
                data.smaCustom = c
            })
            .accessor(({[currAnalitics]: data}) => data.smaCustom);

        rsiCalculator = rsi()
            .options({
                windowSize: +this.state.rsiPeriod,
                sourcePath: [currAnalitics, 'close']
            })
            .merge(({[currAnalitics]: data}, с) => {
                data.rsi = с;
            })
            .accessor(({[currAnalitics]: data}) => data.rsi);

        macdCalculator = macd()
            .options({
                fast: this.state.fastMacdPeriod,
                slow: this.state.slowMacdPeriod,
                signal: this.state.signalMacdPeriod,
                sourcePath: [currAnalitics, 'close']
            })
            .merge(({[currAnalitics]: data}, c) => {
                data.macd = c;
            })
            .accessor(({[currAnalitics]: data}) => data.macd);

        this.setState({
            emaCustom,
            smaCustom,
            rsiCalculator,
            macdCalculator,
            compareCalc
        })


    }

    handleChangeSelectAnalitic(e) {
        this.setState({
            currAnalitics: e.target.value
        })
        this.dataCalculator(e.target.value);
    }

    handleChangeSelect(e) {
        const type = e.target.value;

        switch (type) {
            case 'close-chart':
                this.setState({
                    typeChart: type
                });
                break;

            case 'candle-chart':
                this.setState({
                    typeChart: type
                });
                break;

            case 'ohl-chart':
                this.setState({
                    typeChart: type
                });
                break;

            case 'area-chart':
                this.setState({
                    typeChart: type
                });
                break;

            case '5m':
                this.setState({
                    timeGap: type
                });
                this.props.changeDataByTimeGap(type);
                break;

            case '1d':
                this.setState({
                    timeGap: type
                });
                this.props.changeDataByTimeGap(type);
                break;

            case '1month':
                this.setState({
                    timeGap: type
                });
                this.props.changeDataByTimeGap(type);
                break;

            case 'money':
                this.setState({
                    volumeTypeChart: type
                });
                break;

            case 'pieces':
                this.setState({
                    volumeTypeChart: type
                });
                break;

            default:
                console.log('handleChangeSelect', e)
                break;

        }
    }

    changePeriod(type, e) {
        const period = e.target.value;
        switch (type) {
            case 'ema':
                this.setState({
                    emaPeriod: +period
                });
                this.dataCalculator()
                break;

            case 'sma':
                this.setState({
                    smaPeriod: +period
                });
                this.dataCalculator()
                break;

            case 'rsi':
                this.setState({
                    rsiPeriod: +period
                });
                this.dataCalculator()
                break;

            case 'fast':
                this.setState({
                    fastMacdPeriod: +period
                });
                this.dataCalculator()
                break;

            case 'slow':
                this.setState({
                    slowMacdPeriod: +period
                });
                this.dataCalculator()
                break;

            case 'signal':
                this.setState({
                    signalMacdPeriod: +period
                });
                this.dataCalculator()
                break;

            default:
                console.log('Period', period)
                break;
        }

    }

    handleChangeIndexChart(e) {
        const indexChart = e.target.value;
        this.setState({
            indexChart
        })

        if (indexChart !== 'off-index') {
            this.setState({
                typeChart: 'close-chart'
            })
        }
    }


    handleBrush(brushCoords, dataInfo) {
        try {
            const left = Math.min(brushCoords.end.xValue, brushCoords.start.xValue);
            const right = Math.max(brushCoords.end.xValue, brushCoords.start.xValue);
            const dataForMinMaxSearch = this.props.data.slice(left, right);
            const minMaxValues = this.findMinMaxValues(dataForMinMaxSearch, this.state.currAnalitics);

            this.setState({
                testXExtents: [left, right],
                plotData: dataInfo,
                yMin: minMaxValues[0],
                yMax: minMaxValues[1]
            })

            this.brushRef1.terminate();
            this.brushRef2.terminate();

            if (this.state.isRsi) {
                this.brushRef3.terminate()
            }

            if (this.state.isMacd) {
                this.brushRef4.terminate()
            }


        } catch (e) {
            console.log(e)
        }
    }

    openFullSreenApp(url) {
        window.open(`${url}`, 'fullSreenStockApp', 'width=800, height=600')
    }

    handleOpenModal(type) {
        switch (type) {
            case 'analitics':
                this.setState({
                    analiticModal: true
                });
                break;
            case 'filters':
                this.setState({
                    filtersModal: true
                })
                break;

            default:
                console.log('This type of openModal is not created', type);
                break;
        }

    }

    handleCloseModal(type) {
        switch (type) {
            case 'analitics':
                this.setState({
                    analiticModal: false
                });
                break;
            case 'filters':
                this.setState({
                    filtersModal: false
                })
                break;

            default:
                console.log('This type of closeModal is not created', type);
                break;
        }
    }

    createData(name, values) {
        return {name, values};
    }

    createRowsTable(data, stockArr, numberFormat, numberFormatMillions) {
        let sumData = 0;
        let sumDataMoney = 0;

        const lastClose = data[data.length - 1][this.state.currAnalitics || stockArr[0].stock[1]].close;
        const firstClose = data[0][this.state.currAnalitics || stockArr[0].stock[1]].close;
        data.map(item => {
            sumData += +item[this.state.currAnalitics || stockArr[0].stock[1]].volume2
            sumDataMoney += +item[this.state.currAnalitics || stockArr[0].stock[1]].volume
        });
        const difference = ((lastClose - firstClose) / firstClose) * 100;
        const minMax = this.state.mobileMinMaxVal.length !== 0 ? [this.state.mobileMinMaxVal[0], this.state.mobileMinMaxVal[1]] : [this.state.yMin, this.state.yMax]

        let rows = [
            this.createData('Открытие', data[0][this.state.currAnalitics || stockArr[0].stock[1]].open),
            this.createData('Максимум', minMax[1]),
            this.createData('Минимум', minMax[0]),
            this.createData('Первое закрытие', firstClose),
            this.createData('Последнее закрытие', lastClose),
            this.createData('Изменение, %', numberFormat(difference)),
            this.createData('Суммарный объем торгов(шт.)', numberFormatMillions(sumData).replace(/G/, ' Млрд.').replace(/M/, ' Млн.')),
            this.createData('Суммарный объем торгов', numberFormatMillions(sumDataMoney).replace(/G/, ' Млрд.').replace(/M/, ' Млн.')),
        ];

        return rows;
    }



    render() {
        let start, end;
        const {data: initialData, type, ratio, arrPapers} = this.props;
        const {
            emaPeriod,
            smaPeriod,
            rsiPeriod,
            slowMacdPeriod,
            fastMacdPeriod,
            signalMacdPeriod,
            isMinMax,
            isEma,
            isSma,
            isRsi,
            isMacd,
            isDatePicker,
            isTrendLine,
            typeChart,
            isTotalIncome,
            yMax,
            yMin,
            timeGap
        } = this.state;
        // console.log(this.state)
        const margin = {left: 60, right: 60, top: 20, bottom: 24}

        const numberFormat = format(".2f");
        const numberFormatMillions = format(".2s");

        const formatTimeToYMD = timeFormat("%Y-%m-%d");

        const tooltipContent = (ys) => {
            return ({currentItem, xAccessor}) => {
                return {
                    x: `${formatTimeToYMD(xAccessor(currentItem))} ${new Date(timeFormat(xAccessor(currentItem))).toLocaleTimeString()}`,
                    y: [
                        {
                            label: "Бумага",
                            value: this.state.currAnalitics
                        },
                        {
                            label: "Открытие",
                            value: `${currentItem[this.state.currAnalitics].open}`
                        },
                        {
                            label: "Максимум",
                            value:  `${currentItem[this.state.currAnalitics].high}`
                        },
                        {
                            label: "Минимум",
                            value:  `${currentItem[this.state.currAnalitics].low}`
                        },
                        {
                            label: "Закрытие",
                            value: `${currentItem[this.state.currAnalitics].close}`
                        },
                        {
                            label: "Объем (акции)",
                            value: currentItem[this.state.currAnalitics].volume2 &&
                                numberFormatMillions(currentItem[this.state.currAnalitics].volume2).replace(/G/, ' Млрд.').replace(/M/, ' Млн.')
                        },

                        {
                            label: "Оборот",
                            value: currentItem[this.state.currAnalitics].volume &&
                                numberFormatMillions(currentItem[this.state.currAnalitics].volume).replace(/G/, ' Млрд.').replace(/M/, ' Млн.')
                        }
                    ]
                        .concat(
                            ys.map(each => ({
                                label: each.label,
                                value: each.value(currentItem),
                                stroke: each.stroke
                            }))
                        )
                        .filter(line => line.value)
                };
            };
        }

        const stockArr = arrPapers.filter(item => item.stock);
        const indexesArr = arrPapers.filter(item => item.index);
        const analiticSelectorItems = Object.entries(this.state.stockCodes).filter(item => item[1] === true)
        console.log(analiticSelectorItems)
        const renderAnaliticSelector = analiticSelectorItems.map((item, i) => {

            return <MenuItem key={i}
                             value={item[0]}>{item[0]}</MenuItem>
        })

        const renderChartFromType = (code) => {
            if (code == this.state.currAnalitics) {
                switch (typeChart) {
                    case "close-chart":
                        return (
                            <LineSeries
                                yAccessor={((this.state.trueCountStockeCodes > 1) || (this.state.indexChart !== 'off-index')) ? d => +d['compare'][`${code}Close`] : d => d[code].close}
                                stroke={initialData[0][code].color}/>
                        );


                    case "candle-chart":
                        return (
                            <CandlestickSeries
                                fill={(d) => (d.close > d.open) ? this.props.config.candleStickChart.colorHigh : this.props.config.candleStickChart.colorLow}
                                yAccessor={((this.state.trueCountStockeCodes > 1) || (this.state.indexChart !== 'off-index')) ? (d =>
                                    ({
                                        open: +d['compare'][`${code}Open`],
                                        high: +d['compare'][`${code}High`],
                                        low: +d['compare'][`${code}Low`],
                                        close: +d['compare'][`${code}Close`],
                                    })) : (d =>
                                    ({
                                        open: +d[code].open,
                                        high: +d[code].high,
                                        low: +d[code].low,
                                        close: +d[code].close,
                                    }))

                                }/>
                        );


                    case "ohl-chart":
                        return (
                            <OHLCSeries yAccessor={((this.state.trueCountStockeCodes > 1) || (this.state.indexChart !== 'off-index')) ? (d =>
                                ({
                                    open: +d['compare'][`${code}Open`],
                                    high: +d['compare'][`${code}High`],
                                    low: +d['compare'][`${code}Low`],
                                    close: +d['compare'][`${code}Close`],
                                })) : (d =>
                                ({
                                    open: +d[code].open,
                                    high: +d[code].high,
                                    low: +d[code].low,
                                    close: +d[code].close,
                                }))
                            }
                                        stroke={this.props.config.ohlChart.color}/>
                        );


                    case 'area-chart':
                        return (
                            <AreaSeries
                                fill={this.props.config.areaChart.fillAreaColor}
                                opacity={this.props.config.areaChart.opacityArea}
                                stroke={this.props.config.areaChart.lineColor}
                                strokeWidth={this.props.config.areaChart.lineWidth}
                                strokeOpacity={this.props.config.areaChart.opcityLine}
                                yAccessor={d => ((this.state.trueCountStockeCodes > 1) || (this.state.indexChart !== 'off-index')) ? d['compare'][`${code}Close`] : d[code].close}
                            />
                        );

                    default:
                        return (
                            <LineSeries
                                yAccessor={d => d[code].close}
                                stroke={initialData[0][code].color}/>
                        );

                }
            }else {
                return (
                    <LineSeries
                        yAccessor={((this.state.trueCountStockeCodes > 1) || (this.state.indexChart !== 'off-index')) ? d => +d['compare'][`${code}Close`] : d => d[code].close}
                        stroke={initialData[0][code].color}/>
                );
            }


        }

        const renderAllStockChartsByCheckBox = stockArr.map((item, i) => {
            return (
                <React.Fragment key={i}>
                    {
                        this.state.stockCodes[item.stock[1]] ? renderChartFromType(item.stock[1]) : null
                    }
                </React.Fragment>
            )
        })

        const renderIndexes = indexesArr.map((item, i) => {
            return (
                <MenuItem key={i} value={`${item.index}`}>{item.index}</MenuItem>
            )
        });

        const renderCheckboxTickers = stockArr.map((item, index) => {
            return (
                <FormControlLabel

                    key={index}
                    control={
                        <Checkbox
                            checkedIcon={<span
                                className={clsx(this.props.classes.icon, this.props.classes.checkedIcon)}/>}
                            icon={<span className={this.props.classes.icon}/>}
                            checked={this.state.stockCodes[item.stock[1]] || false}
                            onChange={() => {
                                this.handleChangeCheckboxCode(item.stock[1])
                            }}
                            name={`${item.stock[1]}`}
                            color="primary"
                        />
                    }
                    label={`${item.stock[0]}: ${item.stock[1]}`}
                />
            )
        });

        // console.log(this.props.arrCompareKeys)

        let emaCustom, smaCustom, rsiCalculator, macdCalculator, calculatedData, compareCalc

        if (this.state.emaCustom) {
            emaCustom = this.state.emaCustom;
            macdCalculator = this.state.macdCalculator;
            rsiCalculator = this.state.rsiCalculator;
            smaCustom = this.state.smaCustom;
            compareCalc = this.state.compareCalc


            calculatedData = compareCalc(emaCustom(macdCalculator(rsiCalculator(smaCustom(initialData)))));
        } else {
            const codeArrValues = this.props.arrPapers.filter(item => item.index).map(item => `${item.index}Close`)
            const stockArrValues = this.props.arrPapers.filter(item => item.stock).map(item => item.stock[1]);
            const filteredStockArr = stockArrValues.filter(item => item !== this.state.currAnalitics).map(item => `${item}Close`)
            const analiticSelectorItems = Object.entries(this.state.stockCodes).filter(item => item[1] === true)
            const code = ((this.state.stockCodes[this.state.currAnalitics] !== undefined) && (this.state.stockCodes[this.state.currAnalitics] == false)) ? analiticSelectorItems[0][0] : this.state.currAnalitics

            compareCalc = compare()
                .options({
                    basePath: `${code}Close`,
                    mainKeys: [`${code}Close`, `${code}Open`, `${code}High`,`${code}Low`],
                    compareKeys: [...filteredStockArr,...codeArrValues]
                })
                .accessor((d) => d.compare)
                .merge((d, c) => {
                    d.compare = c
                })

            emaCustom = ema()
                .options({windowSize: +emaPeriod})
                .merge(({[stockArr[0].stock[1] || this.state.currAnalitics]: data}, c) => {
                    {
                        data.emaCustom = c;
                    }

                })
                .accessor(({[stockArr[0].stock[1] || this.state.currAnalitics]: data}) => data.emaCustom);

            smaCustom = sma()
                .options({
                    windowSize: +smaPeriod,
                })
                .merge(({[stockArr[0].stock[1] || this.state.currAnalitics]: data}, c) => {
                    data.smaCustom = c
                })
                .accessor(({[stockArr[0].stock[1] || this.state.currAnalitics]: data}) => data.smaCustom);

            rsiCalculator = rsi()
                .options({windowSize: +rsiPeriod})
                .merge(({[stockArr[0].stock[1] || this.state.currAnalitics]: data}, c) => {
                    data.rsi = c;
                })
                .accessor(({[stockArr[0].stock[1] || this.state.currAnalitics]: data}) => data.rsi);

            macdCalculator = macd()
                .options({
                    fast: fastMacdPeriod,
                    slow: slowMacdPeriod,
                    signal: signalMacdPeriod,
                })
                .merge(({[stockArr[0].stock[1] || this.state.currAnalitics]: data}, c) => {
                    data.macd = c;
                })
                .accessor(({[stockArr[0].stock[1] || this.state.currAnalitics]: data}) => data.macd);

            calculatedData = compareCalc(emaCustom(macdCalculator(rsiCalculator(smaCustom(initialData)))))
        }

        const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(d => d.date);

        const {
            data,
            xScale,
            xAccessor,
            displayXAccessor,
        } = xScaleProvider(calculatedData);


        let xExtents;

        // console.log(this.props.arrCompareKeys)

        console.log(data)

        console.log(this.state)


        if ((this.state.supportsTouch) && (this.state.plotData.length > 0)) {
            xExtents = this.state.mobileXExtents;
            end = this.state.mobileXExtents[1];
            start = this.state.mobileXExtents[0];

        } else {

            if ((Math.abs(this.state.testXExtents[0] - this.state.testXExtents[1]) > 1) && (this.state.mobileXExtents.length === 0)) {

                xExtents = this.state.testXExtents;
                end = this.state.testXExtents[1];
                start = this.state.testXExtents[0];

            } else {
                xExtents = [xAccessor(last(data)), xAccessor(data[0])];
                end = xAccessor(last(data));
                start = xAccessor(data[0]);

            }
        }

        const dataTrend = initialData.slice(start, end);

        const timeStamps = dataTrend.map(item => +item.date);

        const xMax = Math.max(...timeStamps);
        const xMin = Math.min(...timeStamps);

        const dataForTrendLine = dataTrend.map(item => {

            return {
                close: this.state.currAnalitics ? item[this.state.currAnalitics].close : item.close,
                date: +item.date
            }
        })


        const trend = createTrend(dataForTrendLine, 'date', 'close')


        const trendData = {
            start: [end, trend.calcY(xMax)],
            end: [start, trend.calcY(xMin)],
        };

        let yExtents = [
            ((this.state.trueCountStockeCodes >= 1) && (this.state.indexChart !== 'off-index')) ? d => d.compare : this.state.indexChart !== 'off-index' ? d => d[this.state.indexChart].close : null,
            ((this.state.trueCountStockeCodes >= 1) || (this.state.indexChart !== 'off-index')) ? null : smaCustom.accessor(),
            ((this.state.trueCountStockeCodes >= 1) || (this.state.indexChart !== 'off-index')) ? null : emaCustom.accessor(),
            ((this.state.trueCountStockeCodes >= 1) || (this.state.indexChart !== 'off-index')) ? null : d => d.compare
        ];


        stockArr.map(item => yExtents.push((((this.state.trueCountStockeCodes > 1) ||
            (this.state.indexChart !== 'off-index')) && this.state.stockCodes[item.stock[1]]) ? d => d['compare'][`${item.stock[1]}Close`] : this.state.stockCodes[item.stock[1]] ? d => d[item.stock[1]].close : null))


        let heightMainChartLines = 250;
        let heightVolumeChart = this.state.trueCountStockeCodes !== 0 ? 250 : 0;
        let heightRsiChart = isRsi ? 250 : 0;
        let heightMacdChart = isMacd ? 250 : 0;
        let rsiOrigin = (w, h) => [0, h - heightRsiChart - heightMacdChart]
        let macdOrigin = (w, h) => [0, h - heightMacdChart]
        let volumeOrigin = (w, h) => [0, h - heightVolumeChart - heightRsiChart - heightMacdChart];
        let chartPadding = ((this.state.trueCountStockeCodes !== 0) && (this.state.widthChart > 420)) ? 150 : 50;

        let heightChartCanvas = heightMainChartLines + heightVolumeChart + heightRsiChart + heightMacdChart + chartPadding;

        const sliceStart = this.state.mobileXExtents.length === 0 ? this.state.testXExtents[0] : this.state.mobileXExtents[0];
        const sliceEnd = this.state.mobileXExtents.length === 0 ? this.state.testXExtents[1] : this.state.mobileXExtents[1];

        let rows = this.createRowsTable(this.state.testXExtents.length === 0 ?
            this.props.data :
            this.props.data.slice(sliceStart, sliceEnd),
            stockArr, numberFormat, numberFormatMillions);

        let getDataForExcel;

        const dataForExel = this.state.testXExtents ?
            data.slice(this.state.testXExtents[0], this.state.testXExtents[1]) :
            this.state.mobileXExtents ? data.slice(this.state.mobileXExtents[0], this.state.mobileXExtents[1]) : data
        if (this.state.currAnalitics) {
            getDataForExcel = dataForExel.map(item => {
                return {
                    date: item.date,
                    close: item[this.state.currAnalitics].close,
                    open: item[this.state.currAnalitics].open,
                    high: item[this.state.currAnalitics].high,
                    low: item[this.state.currAnalitics].low,
                    volume: item[this.state.currAnalitics].volume,
                }

            })
        } else {
            getDataForExcel = []
        }

        // console.log(getDataForExcel)
        const analiticExist = ((this.state.stockCodes[this.state.currAnalitics] !== undefined) && (this.state.stockCodes[this.state.currAnalitics] == false))

        return (
            <div>
                <div id="app">
                    <div className={`modal-mobile ${this.state.widthChart > 420 ? 'display-none' : 'display-block'}`}
                         style={this.state.analiticModal === true ? {display: 'block'} : {display: 'none'}}>
                        <div className="modal-mobile__main-title">
                            <div>Анализ</div>
                            <span onClick={() => this.handleCloseModal('analitics')}>&times;</span>
                        </div>
                        <hr style={{backgroundColor: '#BFBEBE', height: '3px', border: 'none'}}/>
                        <div className="modal-mobile__row">
                            <div className="modal-mobile__block">
                                <div className="modal-mobile__title">
                                    Мин/Макс значения
                                </div>
                                <div className="modal-mobile__content">
                                    <FormControlLabel
                                        disabled={((this.state.trueCountStockeCodes > 1) ||
                                            (this.state.indexChart !== 'off-index') || (this.state.trueCountStockeCodes === 0)) || false}
                                        control={
                                            <Checkbox
                                                checkedIcon={<span
                                                    className={clsx(this.props.classes.icon, this.props.classes.checkedIcon)}/>}
                                                icon={<span className={this.props.classes.icon}/>}
                                                checked={isMinMax}
                                                name="min-max"
                                                color="primary"
                                            />
                                        }
                                        label="Мин/Макс"
                                        onChange={() => {
                                            this.handleChangeCheckbox('MinMax', this.chartRef.getDataInfo());
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="modal-mobile__block">
                                <div className="modal-mobile__title">
                                    Линия тренда
                                </div>
                                <div className="modal-mobile__content">
                                    <FormControlLabel
                                        disabled={((this.state.trueCountStockeCodes > 1) ||
                                            (this.state.indexChart !== 'off-index') || (this.state.trueCountStockeCodes === 0)) || false}
                                        control={
                                            <Checkbox
                                                checked={isTrendLine}
                                                checkedIcon={<span
                                                    className={clsx(this.props.classes.icon, this.props.classes.checkedIcon)}/>}
                                                icon={<span className={this.props.classes.icon}/>}
                                                name="trend-line"
                                                color="primary"
                                            />
                                        }
                                        label="Тренд"
                                        onChange={() => this.handleChangeCheckbox('TrendLine', this.chartRef.getDataInfo())}
                                    />
                                </div>
                            </div>
                            <div className="modal-mobile__block">
                                <div className="modal-mobile__title">
                                    Скользящее среднее(SMA)
                                </div>
                                <div className="modal-mobile__content">
                                    <FormControlLabel
                                        disabled={((this.state.trueCountStockeCodes > 1) ||
                                            (this.state.indexChart !== 'off-index') || (this.state.trueCountStockeCodes === 0)) || false}
                                        control={
                                            <Checkbox
                                                checked={isSma}
                                                checkedIcon={<span
                                                    className={clsx(this.props.classes.icon, this.props.classes.checkedIcon)}/>}
                                                icon={<span className={this.props.classes.icon}/>}
                                                name="SMA"
                                                color="primary"
                                            />
                                        }
                                        label="SMA"
                                        onChange={() => this.handleChangeCheckbox('Sma')}
                                    />
                                    <input className="iframe-input"
                                           disabled={!isSma}
                                           defaultValue={smaPeriod}
                                           type='number'
                                           onChange={(e) => this.changePeriod('sma', e)}
                                    />
                                </div>
                            </div>
                            <div className="modal-mobile__block">
                                <div className="modal-mobile__title">
                                    Скользящее среднее(EMA)
                                </div>
                                <div className="modal-mobile__content">

                                    <FormControlLabel
                                        disabled={((this.state.trueCountStockeCodes > 1) ||
                                            (this.state.indexChart !== 'off-index') || (this.state.trueCountStockeCodes === 0)) || false}
                                        control={
                                            <Checkbox
                                                checked={isEma}
                                                checkedIcon={<span
                                                    className={clsx(this.props.classes.icon, this.props.classes.checkedIcon)}/>}
                                                icon={<span className={this.props.classes.icon}/>}
                                                name="EMA"
                                                color="primary"
                                            />
                                        }
                                        label="EMA"
                                        onChange={() => {
                                            this.handleChangeCheckbox('Ema')
                                        }}
                                    />

                                    <input className="iframe-input"
                                           disabled={!isEma}
                                           defaultValue={emaPeriod}
                                           type='number'
                                           onChange={(e) => this.changePeriod('ema', e)}
                                    />
                                </div>
                            </div>
                            <div className="modal-mobile__block">
                                <div className="modal-mobile__title">
                                    Совокупный доход
                                </div>
                                <div className="modal-mobile__content">
                                    <FormControlLabel
                                        disabled={((this.state.trueCountStockeCodes > 1) ||
                                            (this.state.indexChart !== 'off-index') || (this.state.trueCountStockeCodes === 0)) || false}
                                        control={
                                            <Checkbox
                                                checked={isTotalIncome}
                                                checkedIcon={<span
                                                    className={clsx(this.props.classes.icon, this.props.classes.checkedIcon)}/>}
                                                icon={<span className={this.props.classes.icon}/>}
                                                name="total-income"
                                                color="primary"
                                            />
                                        }
                                        label="Совокупный доход"
                                        onChange={() => this.handleChangeCheckbox('TotalIncome')}
                                    />
                                </div>
                            </div>
                            <div className="modal-mobile__block">
                                <div className="modal-mobile__title">
                                    Индекс относительной силы - RSI
                                </div>
                                <div className="modal-mobile__content">
                                    <FormControlLabel
                                        disabled={(this.state.trueCountStockeCodes === 0) || false}
                                        control={
                                            <Checkbox
                                                checked={isRsi}
                                                checkedIcon={<span
                                                    className={clsx(this.props.classes.icon, this.props.classes.checkedIcon)}/>}
                                                icon={<span className={this.props.classes.icon}/>}
                                                name="RSI"
                                                color="primary"
                                            />
                                        }
                                        label="RSI"
                                        onChange={() => this.handleChangeCheckbox('Rsi')}
                                    />

                                    <input className="iframe-input"
                                           disabled={!isRsi}
                                           defaultValue={rsiPeriod}
                                           type='number'
                                           onChange={(e) => this.changePeriod('rsi', e)}
                                    />

                                </div>
                            </div>
                            <div className="modal-mobile__block">
                                <div className="modal-mobile__title">
                                    Индикатор MACD
                                </div>
                                <div className="modal-mobile__content">
                                    <FormControlLabel
                                        disabled={(this.state.trueCountStockeCodes === 0) || false}
                                        control={
                                            <Checkbox
                                                checked={isMacd}
                                                checkedIcon={<span
                                                    className={clsx(this.props.classes.icon, this.props.classes.checkedIcon)}/>}
                                                icon={<span className={this.props.classes.icon}/>}
                                                name="MACD"
                                                color="default"
                                            />
                                        }
                                        label="MACD"
                                        onChange={() => this.handleChangeCheckbox('Macd')}
                                    />
                                    <input className="iframe-input"
                                           disabled={!isMacd}
                                           defaultValue={fastMacdPeriod}
                                           type='number'
                                           onChange={(e) => this.changePeriod('fast', e)}
                                    />
                                    <input className="iframe-input"
                                           disabled={!isMacd}
                                           defaultValue={slowMacdPeriod}
                                           type='number'
                                           onChange={(e) => this.changePeriod('slow', e)}
                                    />
                                    <input className="iframe-input"
                                           disabled={!isMacd}
                                           defaultValue={signalMacdPeriod}
                                           type='number'
                                           onChange={(e) => this.changePeriod('signal', e)}
                                    />
                                </div>
                            </div>


                        </div>

                    </div>
                    <div className={`modal-mobile ${this.state.widthChart > 420 ? 'display-none' : 'display-block'}`}
                         style={this.state.filtersModal === true ? {display: 'block'} : {display: 'none'}}>
                        <div className="modal-mobile__main-title">
                            <div>Фильтры</div>
                            <span onClick={() => this.handleCloseModal('filters')}>&times;</span>
                        </div>
                        <hr style={{backgroundColor: '#BFBEBE', height: '3px', border: 'none'}}/>

                        <div className="modal-mobile__row">
                            <div className="modal-mobile__block">
                                <div className="modal-mobile__title">
                                    Акции
                                </div>
                                <div className="modal-mobile__content flex-column">
                                    {renderCheckboxTickers}
                                </div>
                            </div>
                            <div className="modal-mobile__block">
                                <div className="modal-mobile__title">
                                    Аналитика
                                </div>
                                <div className="modal-mobile__content">
                                    <FormControl style={{width: '150px'}}
                                        // disabled={!(this.state.trueCountStockeCodes > 1) || false}
                                    >
                                        <Select
                                            className={this.props.classes.input}
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={analiticExist && this.state.trueCountStockeCodes !== 0 ? analiticSelectorItems[0][0] : this.state.currAnalitics}
                                            onChange={(e) => this.handleChangeSelectAnalitic(e)}
                                        >
                                            {
                                                renderAnaliticSelector
                                            }


                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                            <div className="modal-mobile__block">
                                <div className="modal-mobile__title">
                                    Индексы
                                </div>
                                <div className="modal-mobile__content">
                                    <FormControl style={{width: `${this.state.widthChart - 60}px`}}>
                                        <Select
                                            className={this.props.classes.input}
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={this.state.indexChart}
                                            onChange={(e) => this.handleChangeIndexChart(e)}
                                        >
                                            {renderIndexes}
                                            <MenuItem value='off-index'>Выключить</MenuItem>

                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                            <div className="modal-mobile__block">
                                <div className="modal-mobile__title">
                                    Тип графика
                                </div>
                                <div className="modal-mobile__content">
                                    <FormControl
                                        disabled={((this.state.trueCountStockeCodes > 1) || (this.state.indexChart !== 'off-index')) || false}
                                        style={{width: `${this.state.widthChart - 60}px`}}
                                    >
                                        <Select
                                            className={this.props.classes.input}
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={typeChart}
                                            onChange={(e) => this.handleChangeSelect(e)}
                                        >
                                            <MenuItem value='close-chart'>Закрытия</MenuItem>
                                            <MenuItem value='candle-chart'>Свечи</MenuItem>
                                            <MenuItem value='ohl-chart'>OHLC</MenuItem>
                                            <MenuItem value='area-chart'>Горки</MenuItem>
                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                            <div className="modal-mobile__block">
                                <div className="modal-mobile__title">
                                    Объем
                                </div>
                                <div className="modal-mobile__content">
                                    <FormControl style={{width: `${this.state.widthChart - 60}px`}}>
                                        <Select
                                            className={this.props.classes.input}
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={this.state.volumeTypeChart}
                                            onChange={(e) => this.handleChangeSelect(e)}
                                        >
                                            <MenuItem value='money'>В валюте</MenuItem>
                                            <MenuItem value='pieces'>В штуках</MenuItem>

                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                            <div className="modal-mobile__block">
                                <div className="modal-mobile__title"
                                     onClick={(e) => {
                                         e.preventDefault();
                                         this.toggleDatePicker();
                                     }
                                     }
                                >
                                    Период <a href="#" className="iframe-filter__togler">
                                    {isDatePicker ? <span> -</span> : <span> +</span>}
                                </a>
                                </div>
                                <div className="modal-mobile__content">

                                    <FormControl style={{width: `${this.state.widthChart - 60}px`}}>
                                        <Select
                                            className={this.props.classes.input}
                                            labelId="demo-simple-select-label"
                                            id="range"
                                            value={timeGap}
                                            onChange={(e) => this.handleChangeSelect(e)}
                                        >
                                            <MenuItem value='5m'>5 мин.</MenuItem>
                                            <MenuItem value='1d'>1 день</MenuItem>
                                            <MenuItem value='1month'>1 месяц</MenuItem>
                                        </Select>
                                    </FormControl>

                                    {
                                        isDatePicker ? (
                                            <form id='periodForm1'
                                                  className='flex-column'
                                                  onSubmit={(e) => {
                                                      e.preventDefault();
                                                      this.props.changeDataByPeriodTime({
                                                          'from': +new Date(e.target.minDate.value),
                                                          'to': +new Date(e.target.maxDate.value)
                                                      })
                                                  }}>
                                                <TextField
                                                    id="min-date"
                                                    type="date"
                                                    name="minDate"
                                                    disabled={false}
                                                    style={{width: `${this.state.widthChart - 60}px`}}
                                                    defaultValue={this.state.from}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                />
                                                <TextField
                                                    id="max-date"
                                                    type="date"
                                                    name="maxDate"
                                                    disabled={false}
                                                    style={{width: `${this.state.widthChart - 60}px`}}
                                                    defaultValue={this.state.to}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                />
                                                <Button
                                                    type="submit"
                                                    form="periodForm1"
                                                    value='Применить'>Применить </Button>
                                            </form>
                                        ) : null
                                    }


                                </div>
                            </div>

                            <div className="modal-mobile__block ">
                                <div className="modal-mobile__content flex-column">
                                    <DownloadExelBtn data={getDataForExcel}
                                                     width={this.state.widthChart}/>

                                    <span>
                                        <Button className={this.props.classes.btn}
                                                style={{width: `${this.state.widthChart - 60}px`}}
                                                onClick={() => this.openFullSreenApp(this.props.config.urlFullSrceenApp)}
                                                variant="contained"
                                                color="primary">
                                            Развернуть график
                                        </Button>
                                    </span>

                                    <span>
                                        <ReactToPrint trigger={() => {
                                            return (
                                                <Button className={this.props.classes.btn}
                                                        variant="contained"
                                                        color="primary"
                                                >
                                                    Распечатать график
                                                </Button>
                                            );
                                        }}
                                                      content={() => this.chartRef}/>
                                    </span>

                                </div>
                            </div>


                        </div>

                    </div>
                    <div
                        className={`mobile-navigation ${this.state.widthChart > 420 ? 'display-none' : 'display-block'}`}>
                        <div className="mobile-navigation__btn">
                            <button type="button" onClick={() => this.handleOpenModal('analitics')}>
                                Анализ
                            </button>
                        </div>
                        <div className="mobile-navigation__btn">
                            <button type="button" onClick={() => this.handleOpenModal('filters')}>
                                Фильтры
                            </button>
                        </div>
                    </div>


                    <div className="iframe-wrap">
                        <div className="iframe-col__left" ref={this.leftCol}>
                            <div
                                className={`iframe-filter__row ${this.state.widthChart < 420 ? 'display-none' : 'display-block'}`}>
                                <div className="iframe-filter__wrap">
                                    <div className="iframe-filter__title">
                                        Акции
                                    </div>
                                    {renderCheckboxTickers}
                                </div>
                                <div className="iframe-filter__wrap">
                                    <div className="iframe-filter__title">
                                        Индексы
                                    </div>
                                    <FormControl style={{width: '150px'}}>
                                        <Select
                                            className={this.props.classes.input}
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={this.state.indexChart}
                                            onChange={(e) => this.handleChangeIndexChart(e)}
                                        >
                                            {renderIndexes}
                                            <MenuItem value='off-index'>Выключить</MenuItem>

                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                            <div
                                className={`iframe-filter__row ${this.state.widthChart < 420 ? 'display-none' : 'display-block'}`}>
                                <div className="iframe-filter__title">
                                    Цены
                                </div>
                                <FormControl
                                    // disabled={((this.state.trueCountStockeCodes > 1) || (this.state.indexChart !== 'off-index')) || false}
                                    style={{width: '150px'}}
                                >
                                    <Select
                                        className={this.props.classes.input}
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={typeChart}
                                        onChange={(e) => this.handleChangeSelect(e)}
                                    >
                                        <MenuItem value='close-chart'>Закрытия</MenuItem>
                                        <MenuItem value='candle-chart'>Свечи</MenuItem>
                                        <MenuItem value='ohl-chart'>OHLC</MenuItem>
                                        <MenuItem value='area-chart'>Горки</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                            {
                                this.props.isLoading ? <div style={{
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: heightChartCanvas
                                }}><Spinner/></div> : this.state.widthChart ? (
                                    <div style={{position: "relative"}}>
                                        {
                                            ((this.state.trueCountStockeCodes !== 0) && (this.state.widthChart > 420)) ? (
                                                <div style={{
                                                    position: "absolute",
                                                    top: `${heightMainChartLines + 40}px`,
                                                    right: 0,
                                                    zIndex: 15
                                                }}>
                                                    <div className="iframe-filter__wrap">
                                                        <div className="iframe-filter__title">
                                                            Объем
                                                        </div>
                                                        <FormControl style={{width: '150px'}}>
                                                            <Select
                                                                className={this.props.classes.input}
                                                                labelId="demo-simple-select-label"
                                                                id="demo-simple-select"
                                                                value={this.state.volumeTypeChart}
                                                                onChange={(e) => this.handleChangeSelect(e)}
                                                            >
                                                                <MenuItem value='money'>В валюте</MenuItem>
                                                                <MenuItem value='pieces'>В штуках</MenuItem>

                                                            </Select>
                                                        </FormControl>
                                                    </div>
                                                </div>
                                            ) : null
                                        }

                                        <ChartCanvas ref={(chart) => {
                                            this.chartRef = chart
                                        }}
                                                     className='chartCanvas'
                                                     margin={margin}
                                                     onSelect={() => {
                                                         this.handleChangeData(this.chartRef.getDataInfo())
                                                     }}
                                                     postCalculator={this.state.compareCalc ? this.state.compareCalc : compareCalc}
                                                     displayXAccessor={displayXAccessor}
                                                     xAccessor={xAccessor}
                                                     type={type}
                                                     seriesName='name'
                                                     xScale={xScale}
                                                     pointsPerPxThreshold={12}
                                                     data={data}
                                                     ratio={this.state.ratio || ratio}
                                                     panEvent={true}
                                                     height={heightChartCanvas}
                                                     width={this.state.widthChart}
                                                     xExtents={xExtents}
                                        >

                                            <Chart id={1}
                                                   height={heightMainChartLines}
                                                   padding={{top: 10, bottom: 10}}
                                                   yExtents={yExtents}>

                                                <XAxis axisAt="bottom" orient="bottom"  />
                                                <YAxis axisAt="left"
                                                       orient="left"
                                                       ticks={4}
                                                    // showTicks={true}
                                                       showGridLines={true}
                                                       tickFormat={((this.state.trueCountStockeCodes > 1) || (this.state.indexChart !== 'off-index') )? format(".0%") : format(".2f")}
                                                />
                                                <Label text={this.props.config.chartCaption}
                                                       fontSize={40}
                                                       fontWeight="bold"
                                                       fill="#DCDCDC"
                                                       opacity={0.6}

                                                       x={(this.state.widthChart - margin.left - margin.right) / 2}
                                                       y={(heightMainChartLines - margin.top - margin.bottom) / 2}/>

                                                {
                                                    renderAllStockChartsByCheckBox
                                                }

                                                {
                                                    this.state.indexChart !== 'off-index' ? (
                                                        <LineSeries
                                                            yAccessor={this.state.trueCountStockeCodes >= 1 ? d => d['compare'][`${this.state.indexChart}Close`] : d => d[this.state.indexChart].close}
                                                            stroke={data[0][this.state.indexChart].color}/>
                                                    ) : null
                                                }


                                                {isTrendLine ? (
                                                    <StraightLine type='XLINE'
                                                                  strokeOpacity={this.props.config.trendLine.opacity}
                                                                  stroke={this.props.config.trendLine.color}
                                                                  strokeWidth={this.props.config.trendLine.width}
                                                                  x1Value={trendData.start[0]}
                                                                  y1Value={trendData.start[1]}
                                                                  x2Value={trendData.end[0]}
                                                                  y2Value={trendData.end[1]}
                                                    />

                                                ) : null
                                                }

                                                {isTotalIncome ?
                                                    <AreaSeries
                                                        fill={this.props.config.totalIncome.fillAreaColor}
                                                        opacity={this.props.config.totalIncome.opacityArea}
                                                        stroke={this.props.config.totalIncome.lineColor}
                                                        strokeWidth={this.props.config.totalIncome.lineWidth}
                                                        strokeOpacity={this.props.config.totalIncome.opcityLine}
                                                        yAccessor={d => d[this.state.currAnalitics ? this.state.currAnalitics : stockArr[0].stock[1]].close}/> : null}

                                                {isEma ?
                                                    <LineSeries yAccessor={emaCustom.accessor()}
                                                                stroke={this.props.config.ema.color}/> : null}
                                                {isSma ?
                                                    <LineSeries yAccessor={smaCustom.accessor()}
                                                                stroke={this.props.config.sma.color}/> : null}
                                                {isMinMax ? (
                                                    <React.Fragment>
                                                        <EdgeIndicator itemType="first" orient="right" edgeAt="right"
                                                                       yAccessor={() => this.state.supportsTouch ? this.state.mobileMinMaxVal[1] : yMax}
                                                                       fill={this.props.config.minMaxIndicator.maxIndicatorColor}
                                                        />
                                                        <EdgeIndicator itemType="first" orient="left" edgeAt="left"
                                                                       yAccessor={() => this.state.supportsTouch ? this.state.mobileMinMaxVal[0] : yMin}
                                                                       fill={this.props.config.minMaxIndicator.minIndicatorColor}
                                                        />
                                                    </React.Fragment>
                                                ) : null}


                                                <MouseCoordinateY displayFormat={format(".2f")}/>


                                                <HoverTooltip
                                                    fill={this.props.config.hoverTooltip.backgroundColor}
                                                    bgFill={this.props.config.hoverTooltip.backgroundVerticalLine}
                                                    bgOpacity={this.props.config.hoverTooltip.backgroundOpacityVerticalLine}
                                                    opacity={this.props.config.hoverTooltip.backgroundOpacity}
                                                    stroke={this.props.config.hoverTooltip.borderColor}
                                                    fontFill={this.props.config.hoverTooltip.fontColor}
                                                    yAccessor={emaCustom.accessor()}

                                                    tooltipContent={tooltipContent([
                                                        {
                                                            label: `${emaCustom.type()}(${emaCustom.options()
                                                                .windowSize})`,
                                                            value: d => numberFormat(emaCustom.accessor()(d)),
                                                            stroke: `${this.props.config.ema.color}`
                                                        },
                                                        {
                                                            label: `${smaCustom.type()}(${smaCustom.options()
                                                                .windowSize})`,
                                                            value: d => numberFormat(smaCustom.accessor()(d)),
                                                            stroke: `${this.props.config.sma.color}`
                                                        }
                                                    ])}
                                                    fontSize={15}
                                                />


                                                <Brush ref={(brush) => {
                                                    this.brushRef1 = brush
                                                }}
                                                       height={+heightMainChartLines}
                                                       enabled={this.state.brushEnabled} type='2D'
                                                       onBrush={this.handleBrush}/>
                                            </Chart>

                                            {
                                                this.state.trueCountStockeCodes !== 0 ? (
                                                    <Chart id={2}
                                                           yExtents={this.state.volumeTypeChart === 'money' ? d => d[this.state.currAnalitics].volume : d => d[this.state.currAnalitics].volume2}
                                                           height={heightVolumeChart}
                                                           origin={volumeOrigin}
                                                           padding={{top: 20, bottom: 10}}
                                                    >
                                                        <XAxis axisAt="bottom" orient="bottom"/>
                                                        <YAxis axisAt="left"
                                                               orient="left"
                                                               ticks={4}
                                                               showGridLines={true}
                                                               tickFormat={value => numberFormatMillions(value).replace(/G/, ' Млрд.').replace(/M/, ' Млн.')}
                                                        />

                                                        <MouseCoordinateY displayFormat={numberFormatMillions}/>

                                                        <BarSeries fill={this.props.config.volumeChart.color}
                                                                   yAccessor={this.state.volumeTypeChart === 'money' ? d => d[this.state.currAnalitics].volume : d => d[this.state.currAnalitics].volume2}/>

                                                        <Brush ref={(brush) => {
                                                            this.brushRef2 = brush
                                                        }} enabled={this.state.brushEnabled} type='1D'
                                                               height={+heightMainChartLines}
                                                               onBrush={this.handleBrush}/>
                                                    </Chart>
                                                ) : null


                                            }

                                            {
                                                (isRsi) ? (
                                                    <Chart id={3}
                                                           height={heightRsiChart}
                                                           yExtents={[0, 100]}
                                                           origin={rsiOrigin}
                                                           padding={{top: 10, bottom: 10}}
                                                    >
                                                        <XAxis/>
                                                        <YAxis axisAt='left' orient='left' tickValues={[30, 50, 70]}/>

                                                        <RSISeries stroke={
                                                            {
                                                                line: this.props.config.rsiChart.lineColor,
                                                                outsideThreshold: this.props.config.rsiChart.outSideLineColor,
                                                                insideThreshold: this.props.config.rsiChart.insideLineColor,
                                                                top: this.props.config.rsiChart.topVerticalLineColor,
                                                                middle: this.props.config.rsiChart.midVerticalLineColor,
                                                                bottom: this.props.config.rsiChart.bottomVerticalLineColor,
                                                            }
                                                        }
                                                                   yAccessor={rsiCalculator.accessor()}/>

                                                        <MouseCoordinateY displayFormat={format(".2f")}/>
                                                        <Brush ref={(brush) => {
                                                            this.brushRef3 = brush
                                                        }} enabled={this.state.brushEnabled} type='1D'
                                                               height={+heightMainChartLines}
                                                               onBrush={this.handleBrush}/>
                                                    </Chart>
                                                ) : null
                                            }


                                            {
                                                (isMacd) ? (
                                                    <Chart id={4}
                                                           height={heightMacdChart}
                                                           yExtents={macdCalculator.accessor()}
                                                           origin={macdOrigin}
                                                           padding={{top: 20, bottom: 10}}>

                                                        <XAxis axisAt="bottom" orient="bottom"/>
                                                        <YAxis axisAt="left" orient="left" showGridLines={true}
                                                               ticks={5}/>

                                                        <MACDSeries yAccessor={macdCalculator.accessor()}
                                                                    fill={{divergence: this.props.config.macdChart.histogramColor}}
                                                                    stroke={
                                                                        {
                                                                            macd: this.props.config.macdChart.macdLineColor,
                                                                            signal: this.props.config.macdChart.signalLineColor,
                                                                        }
                                                                    }/>

                                                        <MouseCoordinateX displayFormat={timeFormat("%I:%M")}/>
                                                        <MouseCoordinateY displayFormat={format(".2f")}/>
                                                        <Brush ref={(brush) => {
                                                            this.brushRef4 = brush
                                                        }} enabled={this.state.brushEnabled}
                                                               height={+heightMainChartLines}
                                                               type='1D'
                                                               onBrush={this.handleBrush}/>
                                                    </Chart>
                                                ) : null
                                            }
                                            <CrossHairCursor/>

                                        </ChartCanvas>
                                    </div>
                                ) : null
                            }
                            {this.state.trueCountStockeCodes !== 0 ? (
                                <TableContainer component={Paper}>
                                    <Table aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>{this.state.currAnalitics}</TableCell>
                                                <TableCell align="right">RUB</TableCell>

                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {rows.map((row, index) => (
                                                <TableRow key={row.name}>
                                                    <TableCell component="th" scope="row">
                                                        {row.name}
                                                    </TableCell>
                                                    <TableCell align="right">{index === 5 ?
                                                        row.values < 0 ?
                                                            (<span style={{color: 'red'}}>{row.values}</span>) :
                                                            (<span style={{color: 'green'}}>{row.values}</span>) :
                                                        row.values}</TableCell>

                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : null}

                        </div>
                        <div
                            className={`iframe-col__right ${this.state.widthChart < 420 ? 'display-none' : 'display-block'}`}>
                            <div className="iframe-filter__block">
                                <div className="iframe-filter__title"
                                     onClick={(e) => {
                                         e.preventDefault();
                                         this.toggleDatePicker();
                                     }
                                     }
                                >
                                    Период
                                    <a href="#" className="iframe-filter__togler">
                                        {isDatePicker ? <span> -</span> : <span> +</span>}
                                    </a>
                                </div>

                                <div className="iframe-filter__flex">
                                    <FormControl style={{width: '150px'}}>
                                        <Select
                                            className={this.props.classes.input}
                                            labelId="demo-simple-select-label"
                                            id="range"
                                            value={timeGap}
                                            onChange={(e) => this.handleChangeSelect(e)}
                                        >
                                            <MenuItem value='5m'>5 мин.</MenuItem>
                                            <MenuItem value='1d'>1 день</MenuItem>
                                            <MenuItem value='1month'>1 месяц</MenuItem>
                                        </Select>
                                    </FormControl>
                                </div>
                                {
                                    isDatePicker ? (
                                        <div className="iframe-filter__block">
                                            <div className="iframe-filter__title">
                                                От/До
                                            </div>
                                            <div className="iframe-filter__flex">
                                                <form id='periodForm' className={'flex-column'} onSubmit={(e) => {
                                                    e.preventDefault();
                                                    this.props.changeDataByPeriodTime({
                                                        'from': +new Date(e.target.minDate.value),
                                                        'to': +new Date(e.target.maxDate.value)
                                                    })

                                                }}>
                                                    <TextField
                                                        id="min-date"
                                                        type="date"
                                                        name="minDate"

                                                        disabled={false}
                                                        style={{width: '150px'}}
                                                        defaultValue={this.state.from}
                                                        // onChange={(e) => this.handleDateRangeChange(e, 'minDate')}
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                    />
                                                    <TextField
                                                        id="max-date"
                                                        type="date"
                                                        name="maxDate"
                                                        disabled={false}
                                                        style={{width: '150px'}}
                                                        defaultValue={this.state.to}
                                                        // onChange={(e) => this.handleDateRangeChange(e, 'maxDate')}
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                    />
                                                    <Button
                                                        type="submit"
                                                        form="periodForm"
                                                        value='Применить'>Применить </Button>
                                                </form>

                                            </div>
                                        </div>
                                    ) : null
                                }
                            </div>

                            <div className="iframe-filter__wrap">
                                <div className="iframe-filter__title">
                                    Аналитика
                                </div>
                                <FormControl style={{width: '150px'}}
                                    // disabled={!(this.state.trueCountStockeCodes > 1) || false}
                                >
                                    <Select
                                        className={this.props.classes.input}
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={analiticExist && this.state.trueCountStockeCodes !== 0 ? analiticSelectorItems[0][0] : this.state.currAnalitics}
                                        onChange={(e) => this.handleChangeSelectAnalitic(e)}
                                    >
                                        {
                                            renderAnaliticSelector
                                        }


                                    </Select>
                                </FormControl>
                            </div>
                            <div className="iframe-filter__block">
                                <div className="iframe-filter__title">
                                    Анализ
                                </div>
                                <div className="iframe-filter__flex">
                                    <div className="iframe-checkboxes__item">
                                        <FormControlLabel
                                            disabled={((this.state.trueCountStockeCodes > 1) ||
                                                (this.state.indexChart !== 'off-index') || (this.state.trueCountStockeCodes === 0)) || false}
                                            control={
                                                <Checkbox
                                                    checkedIcon={<span
                                                        className={clsx(this.props.classes.icon, this.props.classes.checkedIcon)}/>}
                                                    icon={<span className={this.props.classes.icon}/>}
                                                    checked={isMinMax}
                                                    name="min-max"
                                                    color="primary"
                                                />
                                            }
                                            label="Мин/Макс"
                                            onChange={() => {
                                                this.handleChangeCheckbox('MinMax', this.chartRef.getDataInfo());
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="iframe-filter__flex">
                                    <div className="iframe-checkboxes__item">
                                        <FormControlLabel
                                            disabled={((this.state.trueCountStockeCodes > 1) ||
                                                (this.state.indexChart !== 'off-index') || (this.state.trueCountStockeCodes === 0)) || false}
                                            control={
                                                <Checkbox
                                                    checked={isTrendLine}
                                                    checkedIcon={<span
                                                        className={clsx(this.props.classes.icon, this.props.classes.checkedIcon)}/>}
                                                    icon={<span className={this.props.classes.icon}/>}
                                                    name="trend-line"
                                                    color="primary"
                                                />
                                            }
                                            label="Тренд"
                                            onChange={() => this.handleChangeCheckbox('TrendLine', this.chartRef.getDataInfo())}
                                        />
                                    </div>
                                </div>
                                <div className="iframe-filter__flex">
                                    <div className="iframe-checkboxes__item">
                                        <FormControlLabel
                                            disabled={((this.state.trueCountStockeCodes > 1) ||
                                                (this.state.indexChart !== 'off-index') || (this.state.trueCountStockeCodes === 0)) || false}
                                            control={
                                                <Checkbox
                                                    checked={isSma}
                                                    checkedIcon={<span
                                                        className={clsx(this.props.classes.icon, this.props.classes.checkedIcon)}/>}
                                                    icon={<span className={this.props.classes.icon}/>}
                                                    name="SMA"
                                                    color="primary"
                                                />
                                            }
                                            label="SMA"
                                            onChange={() => this.handleChangeCheckbox('Sma')}
                                        />
                                    </div>
                                    <input className="iframe-input"
                                           disabled={!isSma}
                                           defaultValue={smaPeriod}
                                           type='number'
                                           onChange={(e) => this.changePeriod('sma', e)}
                                    />
                                </div>
                                <div className="iframe-filter__flex">
                                    <div className="iframe-checkboxes__item">
                                        <FormControlLabel
                                            disabled={((this.state.trueCountStockeCodes > 1) ||
                                                (this.state.indexChart !== 'off-index') || (this.state.trueCountStockeCodes === 0)) || false}
                                            control={
                                                <Checkbox
                                                    checked={isEma}
                                                    checkedIcon={<span
                                                        className={clsx(this.props.classes.icon, this.props.classes.checkedIcon)}/>}
                                                    icon={<span className={this.props.classes.icon}/>}
                                                    name="EMA"
                                                    color="primary"
                                                />
                                            }
                                            label="EMA"
                                            onChange={() => {
                                                this.handleChangeCheckbox('Ema')
                                            }}
                                        />
                                    </div>
                                    <input className="iframe-input"
                                           disabled={!isEma}
                                           defaultValue={emaPeriod}
                                           type='number'
                                           onChange={(e) => this.changePeriod('ema', e)}
                                    />
                                </div>
                                <div className="iframe-filter__flex">
                                    <div className="iframe-checkboxes__item">
                                        <FormControlLabel
                                            disabled={((this.state.trueCountStockeCodes > 1) ||
                                                (this.state.indexChart !== 'off-index') || (this.state.trueCountStockeCodes === 0)) || false}
                                            control={
                                                <Checkbox
                                                    checked={isTotalIncome}
                                                    checkedIcon={<span
                                                        className={clsx(this.props.classes.icon, this.props.classes.checkedIcon)}/>}
                                                    icon={<span className={this.props.classes.icon}/>}
                                                    name="total-income"
                                                    color="primary"
                                                />
                                            }
                                            label="Совокупный доход"
                                            onChange={() => this.handleChangeCheckbox('TotalIncome')}
                                        />
                                    </div>
                                </div>


                                <div className="iframe-filter__flex">
                                    <div className="iframe-checkboxes__item">
                                        <FormControlLabel
                                            disabled={(this.state.trueCountStockeCodes === 0) || false}
                                            control={
                                                <Checkbox
                                                    checked={isRsi}
                                                    checkedIcon={<span
                                                        className={clsx(this.props.classes.icon, this.props.classes.checkedIcon)}/>}
                                                    icon={<span className={this.props.classes.icon}/>}
                                                    name="RSI"
                                                    color="primary"
                                                />
                                            }
                                            label="RSI"
                                            onChange={() => this.handleChangeCheckbox('Rsi')}
                                        />
                                    </div>
                                    <input className="iframe-input"
                                           disabled={!isRsi}
                                           defaultValue={rsiPeriod}
                                           type='number'
                                           onChange={(e) => this.changePeriod('rsi', e)}
                                    />
                                </div>
                                <div className="iframe-filter__flex">
                                    <div className="iframe-checkboxes__item">
                                        <FormControlLabel
                                            disabled={(this.state.trueCountStockeCodes === 0) || false}
                                            control={
                                                <Checkbox
                                                    checked={isMacd}
                                                    checkedIcon={<span
                                                        className={clsx(this.props.classes.icon, this.props.classes.checkedIcon)}/>}
                                                    icon={<span className={this.props.classes.icon}/>}
                                                    name="MACD"
                                                    color="default"
                                                />
                                            }
                                            label="MACD"
                                            onChange={() => this.handleChangeCheckbox('Macd')}
                                        />
                                        <input className="iframe-input"
                                               disabled={!isMacd}
                                               defaultValue={fastMacdPeriod}
                                               type='number'
                                               onChange={(e) => this.changePeriod('fast', e)}
                                        />
                                    </div>

                                </div>
                                <div className="iframe-filter__flex">

                                    <input className="iframe-input"
                                           disabled={!isMacd}
                                           defaultValue={slowMacdPeriod}
                                           type='number'
                                           onChange={(e) => this.changePeriod('slow', e)}
                                    />
                                    <input className="iframe-input"
                                           disabled={!isMacd}
                                           defaultValue={signalMacdPeriod}
                                           type='number'
                                           onChange={(e) => this.changePeriod('signal', e)}
                                    />
                                </div>
                            </div>
                            <div className="iframe-filter__block">
                                <div className="iframe-filter__flex">
                                    <DownloadExelBtn data={getDataForExcel}/>
                                </div>

                                <div className="iframe-filter__flex">
                                    <span>
                                    <Button className={this.props.classes.btn}
                                            onClick={() => this.openFullSreenApp(this.props.config.urlFullSrceenApp)}
                                            variant="contained"
                                            color="primary">
                                        Развернуть график
                                    </Button>
                                    </span>

                                </div>
                                <div className="iframe-filter__flex">
                                    <span>
                                        <ReactToPrint trigger={() => {
                                            return (
                                                <Button className={this.props.classes.btn}
                                                        variant="contained"
                                                        color="primary"
                                                       >
                                                    Распечатать график
                                                </Button>
                                            );
                                        }}
                                                      content={() => this.chartRef}/>
                                    </span>

                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            </div>

        );
    }
}


const config = window.chartConfig;

const styles = {
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },

    input: {
        '&:focus': {
            borderBottom: config.select.focusBottomLine
        },
        '&:after': {
            borderBottom: config.select.bottomLine
        }
    },
    btn: {...config.btn},
    icon: {...config.icon},
    checkedIcon: {...config.checkedIcon}
}

export default (withStyles(styles)(withDeviceRatio()(ChartNew)));
