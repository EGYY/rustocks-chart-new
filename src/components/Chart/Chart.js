import React from "react";

import {timeFormat} from "d3-time-format";
import {format} from "d3-format";

import {ChartCanvas, Chart} from "react-financial-charts";

import {XAxis, YAxis} from "react-financial-charts/lib/axes";
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
import {RSITooltip, HoverTooltip} from "react-financial-charts/lib/tooltip";
import {
    CrossHairCursor,
    EdgeIndicator,
    MouseCoordinateX,
    MouseCoordinateY
} from "react-financial-charts/lib/coordinates";

import {ema, macd, sma, rsi} from "react-financial-charts/lib/indicator";

import createTrend from 'trendline';


import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import {Button} from '@material-ui/core';

import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Input from "@material-ui/core/Input";

import {withStyles} from '@material-ui/core/styles';

import clsx from "clsx";

import './chart.scss';
import Spinner from "../Spinner/Spinner";
import DownloadExelBtn from "../DownloadExelBtn/DownloadExelBtn";
import {Brush} from "react-financial-charts/lib/interactive";


class ChartNew extends React.Component {
    constructor(props) {
        super(props);

        this.chartRef = React.createRef();
        this.brushRef = React.createRef();
        this.leftCol = React.createRef();
        this.handleBrush = this.handleBrush.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);

        this.state = {
            testXExtents: [],
            testYExtents: [],
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
            emaPeriod: 5,
            smaPeriod: 5,
            rsiPeriod: 5,
            slowMacdPeriod: 26,
            fastMacdPeriod: 12,
            signalMacdPeriod: 9,
            trueCountStockeCodes: 0,
            plotData: [],
            yMax: null,
            yMin: null,
            indexChart: 'off-index',
            volumeTypeChart: 'money',
            typeChart: 'close-chart',
            stockAnaliticsCheckboxCode: '',
            timeGap: '1d',
            from: '',
            to: ''
        }
    }


    componentDidMount() {
        document.addEventListener("keyup", this.onKeyPress);
        const code = this.props.arrPapers.filter(item => item.stock)[0].stock[1];
        let oldStockCodes = this.state.stockCodes;
        let newStockCodes = oldStockCodes;
        newStockCodes[code] = !(oldStockCodes[code] || false)



        this.setState({
            stockCodes: newStockCodes,
            from: this.props.periodTime.from,
            to: this.props.periodTime.to,
        })
        this.setState({
            widthChart: this.leftCol.current.offsetWidth
        })
        window.addEventListener('resize', () => {
            this.setState({
                widthChart: this.leftCol.current.offsetWidth
            })
        })

        console.log(this.state)
    }


    onKeyPress(e) {
        var keyCode = e.which;
        console.log(keyCode);
        switch (keyCode) {
            case 27: { // ESC
                this.brushRef.terminate();
                this.setState({
                    brushEnabled: true
                })
            }
        }
    }

    findMinMaxValues(data) {
        let min = data[0].close;
        let max = data[0].close;

        for (let i = 1; i < data.length; i++) {
            let currValue = data[i].close;
            min = (currValue < min) ? currValue : min;
            max = (currValue > max) ? currValue : max;
        }

        return [min, max];
    }

    handleChangeData({plotData}) {
        const minMaxArr = this.findMinMaxValues(plotData);
        this.setState({
            plotData,
            yMax: minMaxArr[1],
            yMin: minMaxArr[0]
        })
    }

    toggleDatePicker() {
        this.setState({
            isDatePicker: !this.state.isDatePicker
        });
    }

    handleChangeCheckbox(code, data) {
        let key = `is${code}`;
        let upd = {};
        upd[key] = !(this.state[key] || false);
        let newState = Object.assign({}, this.state, upd);
        this.setState(newState);

        if (data && code === 'MinMax' || code === 'TrendLine') {
            this.handleChangeData(data)
        }

    }

    handleChangeCheckboxCode(code) {
        let oldStockCodes = this.state.stockCodes;
        let newStockCodes = oldStockCodes;
        newStockCodes[code] = !(oldStockCodes[code] || false)
        this.setState({
            stockCodes: newStockCodes
        })
        const trueCountStockeCodes = Object.entries(this.state.stockCodes).filter(item => item[1] === true).length
        // console.log(trueCountStockeCodes)
        this.setState({
            trueCountStockeCodes
        });

        if (trueCountStockeCodes === 0) {
            this.setState({
                isMinMax: false,
                isTrendLine: false,
                isEma: false,
                isSma: false

            })
        }

        const mainCodeStock = this.props.arrPapers.filter(item => item.stock)[0].stock[1];

        if (!this.state.stockCodes[mainCodeStock]) {
            this.setState({
                isRsi: false,
                isMacd: false
            })
        }
        ;


        if (trueCountStockeCodes > 1) {
            this.setState({
                typeChart: 'close-chart',
                isMinMax: false,
                isTrendLine: false,
                isSma: false,
                isEma: false,
            });
        }
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
        }
    }

    changePeriod(type, e) {
        const period = e.target.value;
        switch (type) {
            case 'ema':
                this.setState({
                    emaPeriod: +period
                });
                break;

            case 'sma':
                this.setState({
                    smaPeriod: +period
                });
                break;

            case 'rsi':
                this.setState({
                    rsiPeriod: +period
                });
                break;

            case 'fast':
                this.setState({
                    fastMacdPeriod: +period
                });
                break;

            case 'slow':
                this.setState({
                    slowMacdPeriod: +period
                });
                break;

            case 'signal':
                this.setState({
                    signalMacdPeriod: +period
                });
                break;
        }

    }

    handleChangeIndexChart(e) {
        const indexChart = e.target.value;
        this.setState({
            indexChart
        })
    }

    handleBrush(...data) {
        this.setState({
            brushEnabled: false
        });
        console.log(data);

    }

    openFullSreenApp(url) {
        window.open(`${url}`, 'fullSreenStockApp', 'width=800, height=600')
    }


    render() {
        let start, end;
        const {data: initialData, type, ratio, arrPapers, ticker} = this.props;
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
            timeGap,
            plotData
        } = this.state;


        const numberFormat = format(".2f");
        const numberFormatMillions = format(".2s");

        const dateFormat = timeFormat("%I:%M");
        const formatTimeToYMD = timeFormat("%Y-%m-%d");

        const tooltipContent = (ys) => {
            return ({currentItem, xAccessor}) => {
                return {
                    x: `${formatTimeToYMD(xAccessor(currentItem))} ${dateFormat(xAccessor(currentItem))}`,
                    y: [
                        {
                            label: "Открытие",
                            value: currentItem.open && numberFormat(currentItem.open)
                        },
                        {
                            label: "Максимум",
                            value: currentItem.high && numberFormat(currentItem.high)
                        },
                        {
                            label: "Минимум",
                            value: currentItem.low && numberFormat(currentItem.low)
                        },
                        {
                            label: "Закрытие",
                            value: currentItem.close && numberFormat(currentItem.close)
                        },
                        {
                            label: "Объем (акции)",
                            value: currentItem.volume2 && numberFormatMillions(currentItem.volume2)
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

        // console.log(this.state);
        const renderChartFromType = (code) => {
            switch (typeChart) {
                case "close-chart":
                    return (
                        <LineSeries
                            yAccessor={((this.state.trueCountStockeCodes > 1) || (this.state.indexChart !== 'off-index')) ? d => d.percentData[code].close : d => d[code].close}
                            stroke={initialData[0][code].color}/>
                    );
                    break;

                case "candle-chart":
                    return (
                        <CandlestickSeries
                            fill={(d) => d.close > d.open ? this.props.config.candleStickChart.colorHigh : this.props.config.candleStickChart.colorLow}
                            yAccessor={d => ((this.state.trueCountStockeCodes > 1) ||
                                (this.state.indexChart !== 'off-index')) ?
                                ({
                                    open: d.percentData[code].open,
                                    high: d.percentData[code].high,
                                    low: d.percentData[code].low,
                                    close: d.percentData[code].close
                                }) :
                                ({
                                    open: d[code].open,
                                    high: d[code].high,
                                    low: d[code].low,
                                    close: d[code].close
                                })

                            }/>
                    );
                    break;

                case "ohl-chart":
                    return (
                        <OHLCSeries yAccessor={
                            d => ((this.state.trueCountStockeCodes > 1) ||
                                (this.state.indexChart !== 'off-index')) ?
                                ({
                                    open: d.percentData[code].open,
                                    high: d.percentData[code].high,
                                    low: d.percentData[code].low,
                                    close: d.percentData[code].close
                                }) :
                                ({open: d[code].open, high: d[code].high, low: d[code].low, close: d[code].close})

                        }
                                    stroke={this.props.config.ohlChart.color}/>
                    );
                    break;

                case 'area-chart':
                    return (
                        <AreaSeries
                            fill={this.props.config.areaChart.fillAreaColor}
                            opacity={this.props.config.areaChart.opacityArea}
                            stroke={this.props.config.areaChart.lineColor}
                            strokeWidth={this.props.config.areaChart.lineWidth}
                            strokeOpacity={this.props.config.areaChart.opcityLine}
                            yAccessor={((this.state.trueCountStockeCodes > 1) || (this.state.indexChart !== 'off-index')) ? d => d.percentData[code].close : d => d[code].close}
                        />
                    );
                    break;
                default:
                    return (
                        <LineSeries
                            yAccessor={((this.state.trueCountStockeCodes > 1) || (this.state.indexChart !== 'off-index')) ? d => d.percentData[code].close : d => d[code].close}
                            stroke={initialData[0][code].color}/>
                    );
                    break;
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


        const emaCustom = ema()
            .options({windowSize: +emaPeriod})
            .merge(({[stockArr[0].stock[1]]: data}, c) => {
                {
                    data.emaCustom = c;
                }

            })
            .accessor(({[stockArr[0].stock[1]]: data}) => data.emaCustom);

        const smaCustom = sma()
            .options({
                windowSize: +smaPeriod,
            })
            .merge(({[stockArr[0].stock[1]]: data}, c) => {
                data.smaCustom = c
            })
            .accessor(({[stockArr[0].stock[1]]: data}) => data.smaCustom);

        const rsiCalculator = rsi()
            .options({windowSize: +rsiPeriod})
            .merge(({[stockArr[0].stock[1]]: data}, c) => {
                data.rsi = c;
            })
            .accessor(({[stockArr[0].stock[1]]: data}) => data.rsi);

        const macdCalculator = macd()
            .options({
                fast: fastMacdPeriod,
                slow: slowMacdPeriod,
                signal: signalMacdPeriod,
            })
            .merge(({[stockArr[0].stock[1]]: data}, c) => {
                data.macd = c;
            })
            .accessor(({[stockArr[0].stock[1]]: data}) => data.macd);


        const calculatedData = emaCustom(macdCalculator(rsiCalculator(smaCustom(initialData))))

        const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(d => d.date);

        const {
            data,
            xScale,
            xAccessor,
            displayXAccessor,
        } = xScaleProvider(calculatedData);


        if (plotData.length === 0) {
            start = xAccessor(last(data));
            end = xAccessor(data[0]);
        } else {
            start = xAccessor(last(plotData));
            end = xAccessor(plotData[0]);
        }

        const xExtents = [start, end];

        const dataTrend = initialData.slice(end, start);
        const timeStamps = dataTrend.map(item => +item.date);

        const xMax = Math.max(...timeStamps);
        const xMin = Math.min(...timeStamps);

        const dataForTrendLine = dataTrend.map(item => {
            return {
                close: item.close,
                date: +item.date
            }
        })


        const trend = createTrend(dataForTrendLine, 'date', 'close')


        const trendData =  {
                    start: [start, trend.calcY(xMax)],
                    end: [end, trend.calcY(xMin)],
                };

        // console.log(trendData)


        let yExtents = [
            ((this.state.trueCountStockeCodes >= 1) && (this.state.indexChart !== 'off-index')) ? d => d.percentData[this.state.indexChart].close : this.state.indexChart !== 'off-index' ? d => d[this.state.indexChart].close : null,
            ((this.state.trueCountStockeCodes >= 1) || (this.state.indexChart !== 'off-index')) ? null : smaCustom.accessor(),
            ((this.state.trueCountStockeCodes >= 1) || (this.state.indexChart !== 'off-index')) ? null : emaCustom.accessor()
        ];


        stockArr.map(item => yExtents.push((((this.state.trueCountStockeCodes > 1) ||
            (this.state.indexChart !== 'off-index')) && this.state.stockCodes[item.stock[1]]) ? d => d.percentData[item.stock[1]].close : this.state.stockCodes[item.stock[1]] ? d => d[item.stock[1]].close : null))

        // console.log(this.state)


        let heightMainChartLines = 200;
        let heightVolumeChart = (this.state.stockCodes[stockArr[0].stock[1]]) ? 200 : 0;
        let heightRsiChart = isRsi ? 200 : 0;
        let heightMacdChart = isMacd ? 200 : 0;
        let rsiOrigin = (w, h) => [0, h - heightRsiChart - heightMacdChart]
        let macdOrigin = (w, h) => [0, h - heightMacdChart]
        let volumeOrigin = (w, h) => [0, h - heightVolumeChart - heightRsiChart - heightMacdChart];

        let heightChartCanvas = heightMainChartLines + heightVolumeChart + heightRsiChart + heightMacdChart + 50;

        // console.log(heightChartCanvas, chartOrigin)

        // console.log(this.state)

        return (
            <div>
                <div id="app">
                    <div className="iframe-wrap">
                        <div className="iframe-col__left" ref={this.leftCol}>
                            <div className="iframe-filter__row">
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
                            <div className="iframe-filter__row">
                                <div className="iframe-filter__title">
                                    Цены
                                </div>
                                <FormControl
                                    disabled={(this.state.trueCountStockeCodes > 1) || false}
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
                                    <ChartCanvas ref={(chart) => {
                                        this.chartRef = chart
                                    }}
                                                 className='chartCanvas'
                                                 margin={{left: 60, right: 60, top: 20, bottom: 24}}
                                                 onSelect={() => {
                                                     this.handleChangeData(this.chartRef.getDataInfo())
                                                 }}
                                                 displayXAccessor={displayXAccessor}
                                                 xAccessor={xAccessor}
                                                 type={type}
                                                 seriesName='name'
                                                 xScale={xScale}
                                                 data={data}
                                                 ratio={ratio}
                                                 panEvent={true}
                                                 height={heightChartCanvas}
                                                 width={this.state.widthChart}
                                                 xExtents={[100, 200]}
                                    >


                                        <Chart id={1}
                                               height={heightMainChartLines}
                                            // width={this.props.width}
                                               padding={{top: 10, bottom: 10}}
                                               yExtents={yExtents}>

                                            <XAxis axisAt="bottom" orient="bottom"/>
                                            <YAxis axisAt="right"
                                                   orient="right"
                                                   ticks={4}
                                                // tickFormat={value => `${value / 100}%`}
                                            />
                                            {/*<Brush enabled={this.state.brushEnabled} type='2D' onBrush={this.handleBrush}/>*/}

                                            {
                                                renderAllStockChartsByCheckBox
                                            }

                                            {
                                                this.state.indexChart !== 'off-index' ? (
                                                    <LineSeries
                                                        yAccessor={this.state.trueCountStockeCodes >= 1 ? d => d.percentData[this.state.indexChart].close : d => d[this.state.indexChart].close}
                                                        stroke={data[0][this.state.indexChart].color}/>
                                                ) : null
                                            }

                                            {/*[*/}
                                            {/*{*/}
                                            {/*    start: [start, trend.calcY(xMax)],*/}
                                            {/*    end: [end, trend.calcY(xMin)],*/}
                                            {/*    appearance: {*/}
                                            {/*    strokeWidth: this.props.config.trendLine.width,*/}
                                            {/*    strokeOpacity: this.props.config.trendLine.opacity,*/}
                                            {/*    stroke: this.props.config.trendLine.color*/}
                                            {/*},*/}
                                            {/*    type: "XLINE"*/}
                                            {/*}*/}
                                            {/*];*/}

                                            {/*<StraightLine type={} />*/}



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
                                                // <TrendLine
                                                //     enabled={false}
                                                //     snap={false}
                                                //     trends={trendData}
                                                // />
                                            ) : null
                                            }

                                            {isTotalIncome ?
                                                <AreaSeries
                                                    fill={this.props.config.totalIncome.fillAreaColor}
                                                    opacity={this.props.config.totalIncome.opacityArea}
                                                    stroke={this.props.config.totalIncome.lineColor}
                                                    strokeWidth={this.props.config.totalIncome.lineWidth}
                                                    strokeOpacity={this.props.config.totalIncome.opcityLine}
                                                    yAccessor={this.state.trueCountStockeCodes > 1 ?
                                                        d => d.percentData[stockArr[0].stock[1]].close :
                                                        d => d[stockArr[0].stock[1]].close}/> : null}

                                            {isEma ?
                                                <LineSeries yAccessor={emaCustom.accessor()}
                                                            stroke={this.props.config.ema.color}/> : null}
                                            {isSma ?
                                                <LineSeries yAccessor={smaCustom.accessor()}
                                                            stroke={this.props.config.sma.color}/> : null}
                                            {isMinMax ? (
                                                <React.Fragment>
                                                    <EdgeIndicator itemType="first" orient="right" edgeAt="right"
                                                                   yAccessor={() => yMax !== null ? yMax : null}
                                                                   fill={this.props.config.minMaxIndicator.maxIndicatorColor}
                                                    />
                                                    <EdgeIndicator itemType="first" orient="left" edgeAt="left"
                                                                   yAccessor={() => yMin !== null ? yMin : null}
                                                                   fill={this.props.config.minMaxIndicator.minIndicatorColor}
                                                    />
                                                </React.Fragment>
                                            ) : null}


                                            <MouseCoordinateY displayFormat={format(".2f")}/>

                                            {this.state.stockCodes[stockArr[0].stock[1]] ? (
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
                                            ) : null}
                                        </Chart>

                                        {
                                            this.state.stockCodes[stockArr[0].stock[1]] ? (
                                                <Chart id={2}
                                                       yExtents={this.state.volumeTypeChart === 'money' ? d => d[stockArr[0].stock[1]].volume : d => d[stockArr[0].stock[1]].volume2}
                                                       height={heightVolumeChart}
                                                       origin={volumeOrigin}
                                                       padding={{top: 20, bottom: 10}}
                                                >
                                                    <XAxis axisAt="bottom" orient="bottom"/>
                                                    <YAxis axisAt="right"
                                                           orient="right"
                                                           ticks={4}
                                                           tickFormat={value => numberFormatMillions(value)}
                                                    />

                                                    <MouseCoordinateY displayFormat={numberFormatMillions}/>

                                                    <BarSeries fill={this.props.config.volumeChart.color}
                                                               yAccessor={this.state.volumeTypeChart === 'money' ? d => d[stockArr[0].stock[1]].volume : d => d[stockArr[0].stock[1]].volume2}/>
                                                </Chart>

                                            ) : null
                                        }

                                        {
                                            ((this.state.stockCodes[stockArr[0].stock[1]]) && isRsi) ? (
                                                <Chart id={3}
                                                       height={heightRsiChart}
                                                       yExtents={[0, 100]}
                                                       origin={rsiOrigin}
                                                       padding={{top: 10, bottom: 10}}
                                                >
                                                    <XAxis/>
                                                    <YAxis axisAt='right' orient='right' tickValues={[30, 50, 70]}/>

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
                                                </Chart>
                                            ) : null
                                        }


                                        {
                                            ((this.state.stockCodes[stockArr[0].stock[1]]) && isMacd) ? (
                                                <Chart id={4}
                                                       height={heightMacdChart}
                                                       yExtents={macdCalculator.accessor()}
                                                       origin={macdOrigin}
                                                       padding={{top: 20, bottom: 10}}>

                                                    <XAxis axisAt="bottom" orient="bottom"/>
                                                    <YAxis axisAt="right" orient="right" ticks={2}/>

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
                                                </Chart>
                                            ) : null
                                        }
                                        <CrossHairCursor/>
                                    </ChartCanvas>
                                ) : null
                            }


                        </div>
                        <div className="iframe-col__right">
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
                                                <form id='periodForm' onSubmit={(e) =>{
                                                    e.preventDefault();
                                                    this.props.changeDataByPeriodTime({
                                                        'from' : +new Date(e.target.minDate.value),
                                                        'to': +new Date(e.target.maxDate.value)
                                                    })
                                                    // console.log(+new Date(e.target.maxDate.value))
                                                }}>
                                                    <TextField
                                                        id="min-date"
                                                        type="datetime-local"
                                                        name="minDate"

                                                        disabled={false}
                                                        style={{marginBottom: '18px', width: '150px'}}
                                                        defaultValue={(new Date(+this.props.periodTime.from)).toISOString().replace('Z','')}
                                                        // onChange={(e) => this.handleDateRangeChange(e, 'minDate')}
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                    />
                                                    <TextField
                                                        id="max-date"
                                                        type="datetime-local"
                                                        name="maxDate"
                                                        disabled={false}
                                                        style={{width: '150px'}}
                                                        defaultValue={(new Date(+this.props.periodTime.to)).toISOString().replace('Z','')}
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
                                    Объем
                                </div>
                                <FormControl style={{width: '150px'}}
                                             disabled={!this.state.stockCodes[stockArr[0].stock[1]]}>
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
                            <div className="iframe-filter__block">
                                <div className="iframe-filter__title">
                                    Анализ
                                </div>
                                <div className="iframe-filter__flex">
                                    <div className="iframe-checkboxes__item">
                                        <FormControlLabel
                                            disabled={((this.state.trueCountStockeCodes > 1) ||
                                                (this.state.indexChart !== 'off-index') ||
                                                !this.state.stockCodes[stockArr[0].stock[1]]) || false}
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
                                                (this.state.indexChart !== 'off-index') ||
                                                !this.state.stockCodes[stockArr[0].stock[1]]) || false}
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
                                                (this.state.indexChart !== 'off-index') ||
                                                !this.state.stockCodes[stockArr[0].stock[1]]) || false}
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
                                                (this.state.indexChart !== 'off-index') ||
                                                !this.state.stockCodes[stockArr[0].stock[1]]) || false}
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
                                                (this.state.indexChart !== 'off-index') ||
                                                !this.state.stockCodes[stockArr[0].stock[1]]) || false}
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
                                            disabled={(!this.state.stockCodes[stockArr[0].stock[1]]) || false}
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
                                            disabled={(!this.state.stockCodes[stockArr[0].stock[1]]) || false}
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
                                {/*<div className="iframe-filter__flex">*/}
                                {/*    <div className="iframe-checkboxes__signal">Signal</div>*/}

                                {/*</div>*/}
                            </div>
                            <div className="iframe-filter__block">
                                <div className="iframe-filter__flex">
                                    <DownloadExelBtn data={data}/>
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
                                      <Button className={this.props.classes.btn}
                                              variant="contained"
                                              color="primary"
                                              onClick={() => window.print(this.chartRef)}>
                                        Распечатать график
                                    </Button>
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
// console.log(config)

const styles = {
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

// export default withSize({ style: { minHeight: 600 } })(withDeviceRatio()(ChartNew));