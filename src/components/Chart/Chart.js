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
import {discontinuousTimeScaleProvider} from "react-financial-charts/lib/scale";
import { withDeviceRatio, withSize } from "@react-financial-charts/utils";
import {last} from "react-financial-charts/lib/utils";
import {RSITooltip, HoverTooltip} from "react-financial-charts/lib/tooltip";
import {
    CrossHairCursor,
    EdgeIndicator,
    MouseCoordinateX,
    MouseCoordinateY
} from "react-financial-charts/lib/coordinates";
// import {withDeviceRatio} from "react-financial-charts/lib/utils";
import {ema, macd, sma, rsi} from "react-financial-charts/lib/indicator";

import {TrendLine} from "react-stockcharts/lib/interactive";
import createTrend from 'trendline';

import FormGroup from '@material-ui/core/FormGroup';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import {Button, Input} from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import './chart.scss';
import Spinner from "../Spinner/Spinner";
import DownloadExelBtn from "../DownloadExelBtn/DownloadExelBtn";


const numberFormat = format(".2f");
const dateFormat = timeFormat("%I:%M");
const macdAppearance = {
    stroke: {
        macd: "#FF0000",
        signal: "#00F300",
    },
    fill: {
        divergence: "#4682B4"
    },
};

const tooltipContent = (ys) => {
    return ({currentItem, xAccessor}) => {
        return {
            x: dateFormat(xAccessor(currentItem)),
            y: [
                {
                    label: "open",
                    value: currentItem.open && numberFormat(currentItem.open)
                },
                {
                    label: "high",
                    value: currentItem.high && numberFormat(currentItem.high)
                },
                {
                    label: "low",
                    value: currentItem.low && numberFormat(currentItem.low)
                },
                {
                    label: "close",
                    value: currentItem.close && numberFormat(currentItem.close)
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

class ChartNew extends React.Component {
    constructor(props) {
        super(props);

        this.chartRef = React.createRef();
        this.handleEvents = this.handleEvents.bind(this);

        this.state = {
            isWGC4: true,
            isSNGS: false,
            isMinMax: false,
            isEma: false,
            isSma: false,
            isRsi: true,
            isMacd: true,
            isTotalIncome: false,
            isDatePicker: false,
            isTrendLine: false,
            emaPeriod: 5,
            smaPeriod: 5,
            rsiPeriod: 5,
            slowMacdPeriod: 26,
            fastMacdPeriod: 12,
            signalMacdPeriod: 9,
            plotData: [],
            yMax: null,
            yMin: null,
            typeChart: 'close-chart',
            timeGap: '1d'
        }
    }

    componentDidMount() {
        // this.chartRef.subscribe('scrollChart', {listener: this.handleEvents})
    }

    componentWillUnmount() {
        // this.chartRef.unsubscribe('scrollChart');
    }

    handleEvents(type, props, state) {

        switch (type) {
            case 'pan':
                const {plotData} = state;
                this.setPlotData(state);
                break;
        }
    }


    setPlotData({plotData}) {
        const closeData = plotData.map(item => item.close);
        const yMax = Math.max(...closeData);
        const yMin = Math.min(...closeData);
        this.setState({
            plotData,
            yMax,
            yMin
        })
    }

    toggleDatePicker() {
        this.setState({
            isDatePicker: !this.state.isDatePicker
        });
    }


    handleChangeCheckbox(type) {
        switch (type) {
            case 'WGC4':
                this.setState({
                    isWGC4: !this.state.isWGC4
                });
                break;

            case 'SNGS':
                this.setState({
                    isSNGS: !this.state.isSNGS
                });
                break;

            case 'min-max':
                this.setState({
                    isMinMax: !this.state.isMinMax
                });
                break;

            case 'trend-line':
                this.setState({
                    isTrendLine: !this.state.isTrendLine
                });
                break;

            case 'ema':
                this.setState({
                    isEma: !this.state.isEma
                });
                break;

            case 'total-income':
                this.setState({
                    isTotalIncome: !this.state.isTotalIncome
                });
                break;

            case 'sma':
                this.setState({
                    isSma: !this.state.isSma
                });
                break;

            case 'rsi':
                this.setState({
                    isRsi: !this.state.isRsi
                });
                break;

            case 'macd':
                this.setState({
                    isMacd: !this.state.isMacd
                });
                break;
        }

    }

    handleChangeSelect(e) {
        const type = e.target.value;

        // <MenuItem value='close-chart'>Закрытия</MenuItem>
        // <MenuItem value='candle-chart'>Свечи</MenuItem>
        // <MenuItem value='ohl-chart'>OHLC</MenuItem>
        // <MenuItem value='area-chart'>Горки</MenuItem>

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


    render() {
        let start, end;

        const {data: initialData, type, ratio, arrPapers} = this.props;
        console.log(this.props)
        const {
            emaPeriod,
            smaPeriod,
            rsiPeriod,
            slowMacdPeriod,
            fastMacdPeriod,
            signalMacdPeriod,
            isSNGS,
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

        // console.log(initialData);

        const renderCheckboxTickers = arrPapers.map((item, index) => {
            const checked = `is${item.ticker}`
            return (
                <FormControlLabel
                    key={index}
                    control={
                        <Checkbox
                            checked={this.state[checked]}
                            onChange={() => this.handleChangeCheckbox(item.ticker)}
                            name={`${item.ticker}`}
                            color="primary"
                        />
                    }
                    label={`${item.index}: ${item.ticker}`}
                />
            )
        });

        const renderChartFromType = () => {
            switch (typeChart) {
                case "close-chart":
                    return (
                        <LineSeries yAccessor={d => d.WGC4.close} stroke="#4286f4"/>
                    );
                    break;

                case "candle-chart":
                    return (
                        <CandlestickSeries/>
                    );
                    break;

                case "ohl-chart":
                    return (
                        <OHLCSeries stroke="#529aff"/>
                    );
                    break;

                case 'area-chart':
                    return (
                        <AreaSeries
                            yAccessor={d => d.WGC4.close}
                        />
                    );
                    break;
            }

        }

        const emaCustom = ema()
            .options({windowSize: +emaPeriod})
            .merge((d, c) => {
                d.WGC4.emaCustom = c
            })
            .accessor(d => d.WGC4.emaCustom);

        const smaCustom = sma()
            .options({
                windowSize: +smaPeriod,
            })
            .merge((d, c) => {
                d.WGC4.smaCustom = c
            })
            .accessor(d => d.WGC4.smaCustom);

        const rsiCalculator = rsi()
            .options({windowSize: +rsiPeriod})
            .merge((d, c) => {
                d.WGC4.rsi = c;
            })
            .accessor(d => d.WGC4.rsi);

        const macdCalculator = macd()
            .options({
                fast: fastMacdPeriod,
                slow: slowMacdPeriod,
                signal: signalMacdPeriod,
            })
            .merge((d, c) => {
                d.WGC4.macd = c;
            })
            .accessor(d => d.WGC4.macd);


        const calculatedData = emaCustom(macdCalculator(rsiCalculator(smaCustom(initialData))));

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


        const trendData = () => {
            return [
                {
                    start: [start, trend.calcY(xMax)],
                    end: [end, trend.calcY(xMin)],
                    appearance: {stroke: "green"},
                    type: "XLINE"
                }
            ];
        }

        return (
            // <div>123</div>
            <div>
                <div id="app">
                    <div className="iframe-wrap">
                        <div className="iframe-col__left">
                            <div className="iframe-filter__row">
                                <div className="iframe-filter__wrap">
                                    <div className="iframe-filter__title">
                                        Акции
                                    </div>
                                    {renderCheckboxTickers}
                                    {/*<FormControlLabel*/}
                                    {/*    control={*/}
                                    {/*        <Checkbox*/}
                                    {/*            // checked={this.state.isMoex}*/}
                                    {/*            // onChange={() => this.handleMoex()}*/}
                                    {/*            name="MOEX"*/}
                                    {/*            color="primary"*/}
                                    {/*        />*/}
                                    {/*    }*/}
                                    {/*    label="MOEX: UPRO"*/}
                                    {/*/>*/}
                                </div>
                                <div className="iframe-filter__wrap">
                                    <div className="iframe-filter__title">
                                        Индексы
                                    </div>
                                    <FormControl style={{width: '150px'}}>
                                        <Select
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value="1-index"
                                            // onChange={(e) => this.typeCharthandleChange(e)}
                                        >
                                            <MenuItem value='1-index'>ММВБ-энергетика</MenuItem>
                                            <MenuItem value='2-index'>Индекс МосБиржи</MenuItem>

                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                            <div className="iframe-filter__row">
                                <div className="iframe-filter__title">
                                    Цены
                                </div>
                                <FormControl style={{width: '150px'}}>
                                    <Select
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
                                this.props.isLoading ? <Spinner/> : (
                                    <ChartCanvas ref={(chart) => {
                                        this.chartRef = chart
                                    }}
                                                 margin={{left: 60, right: 60, top: 20, bottom: 24}}
                                                 onSelect={() => this.setPlotData(this.chartRef.getDataInfo())}
                                                 displayXAccessor={displayXAccessor}
                                                 xAccessor={xAccessor}
                                                 type={type}
                                                 seriesName='name'
                                                 xScale={xScale}
                                                 data={data}
                                                 ratio={ratio}
                                                 panEvent={true}
                                                 height={1000}
                                                 width={550}
                                                 xExtents={[0,100]}>


                                        <Chart id={1}
                                               height={200}
                                               width={500}
                                               yExtents={[
                                                   d => [d.high, d.low],
                                                   d => d.WGC4.close,
                                                   this.state.isSNGS ? d => d.SNGS.close : null,
                                                   emaCustom.accessor(),
                                                   smaCustom.accessor()
                                               ]}>

                                            <XAxis axisAt="bottom" orient="bottom"/>
                                            <YAxis axisAt="right" orient="right" ticks={2}/>

                                            {renderChartFromType()}


                                            {isTrendLine ? (
                                                <TrendLine
                                                    type="RAY"
                                                    enabled={false}
                                                    snap={false}
                                                    trends={trendData()}
                                                />
                                            ) : null
                                            }

                                            {isTotalIncome ? <AreaSeries yAccessor={d => d.WGC4.close}/> : null}
                                            {isSNGS ?
                                                <LineSeries yAccessor={d => d.SNGS.close} stroke="#4236f4"/> : null}
                                            {isEma ?
                                                <LineSeries yAccessor={emaCustom.accessor()} stroke="#00F300"/> : null}
                                            {isSma ?
                                                <LineSeries yAccessor={smaCustom.accessor()} stroke="#FF0000"/> : null}
                                            {isMinMax ? (
                                                <React.Fragment>
                                                    <EdgeIndicator itemType="first" orient="right" edgeAt="right"
                                                                   yAccessor={() => yMax != null ? yMax : null}
                                                                   fill={"#6BA583"}
                                                    />
                                                    <EdgeIndicator itemType="first" orient="left" edgeAt="left"
                                                                   yAccessor={() => yMin != null ? yMin : null}
                                                                   fill={"#FF0000"}
                                                    />
                                                </React.Fragment>
                                            ) : null}



                                            <MouseCoordinateY displayFormat={format(".2f")}/>

                                            <HoverTooltip
                                                yAccessor={emaCustom.accessor()}
                                                tooltipContent={tooltipContent([
                                                    {
                                                        label: `${emaCustom.type()}(${emaCustom.options()
                                                            .windowSize})`,
                                                        value: d => numberFormat(emaCustom.accessor()(d)),
                                                        stroke: emaCustom.stroke()
                                                    },
                                                    {
                                                        label: `${smaCustom.type()}(${smaCustom.options()
                                                            .windowSize})`,
                                                        value: d => numberFormat(smaCustom.accessor()(d)),
                                                        stroke: smaCustom.stroke()
                                                    }
                                                ])}
                                                fontSize={15}
                                            />

                                            {/*Current close visualisation*/}

                                            {/*<EdgeIndicator*/}
                                            {/*    itemType="last"*/}
                                            {/*    rectWidth={48}*/}
                                            {/*    fill={d => d.close > d.open ? "#26a69a" : "#ef5350"}*/}
                                            {/*    lineStroke={d => d.close > d.open ? "#26a69a" : "#ef5350"}*/}
                                            {/*    displayFormat={format(".2f")}*/}
                                            {/*    yAccessor={d => d.close}*/}
                                            {/*/>*/}
                                        </Chart>

                                        <Chart id={2}
                                               yExtents={d => d.WGC4.volume}
                                               height={200}
                                               origin={(w, h) => [0, h - 700]}
                                        >
                                            <XAxis axisAt="bottom" orient="bottom"/>
                                            <YAxis axisAt="right" orient="right" ticks={2}/>

                                            <BarSeries yAccessor={d => d.WGC4.volume}/>

                                            {/*<MouseCoordinateX displayFormat={timeFormat("%I:%M")}/>*/}
                                            {/*<MouseCoordinateY displayFormat={format(".2f")}/>*/}
                                        </Chart>

                                        {isRsi ?
                                            (
                                                <Chart id={3}
                                                       height={200}
                                                       yExtents={[0, 100]}
                                                       origin={(w, h) => [0, h - 500]}
                                                >
                                                    <XAxis/>
                                                    <YAxis axisAt='right' orient='right' tickValues={[30, 50, 70]}/>

                                                    <RSISeries yAccessor={rsiCalculator.accessor()}/>

                                                    {/*<RSITooltip origin={[8, 16]} yAccessor={rsiCalculator.accessor()}*/}
                                                    {/*            options={rsiCalculator.options()}/>*/}

                                                    <MouseCoordinateY displayFormat={format(".2f")}/>

                                                </Chart>
                                            ) : null}


                                        {isMacd ? (
                                            <Chart id={4}
                                                   height={200}
                                                   yExtents={macdCalculator.accessor()}
                                                   origin={(w, h) => [0, h - 300]}>

                                                <XAxis axisAt="bottom" orient="bottom"/>
                                                <YAxis axisAt="right" orient="right" ticks={2}/>

                                                <MACDSeries yAccessor={macdCalculator.accessor()}
                                                            {...macdAppearance} />

                                                <MouseCoordinateX displayFormat={timeFormat("%I:%M")}/>
                                                <MouseCoordinateY displayFormat={format(".2f")}/>

                                            </Chart>
                                        ) : null}

                                        <CrossHairCursor/>
                                    </ChartCanvas>
                                )
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
                                                <form>
                                                    <TextField
                                                        id="min-date"
                                                        type="date"
                                                        name="minDate"
                                                        style={{marginBottom: '18px'}}
                                                        // defaultValue={this.state.minDate}
                                                        // onChange={(e) => this.handleDateRangeChange(e, 'minDate')}
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                    />
                                                    <TextField
                                                        id="max-date"
                                                        type="date"
                                                        name="maxDate"
                                                        // defaultValue={this.state.maxDate}
                                                        // onChange={(e) => this.handleDateRangeChange(e, 'maxDate')}
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                    />
                                                </form>
                                            </div>
                                        </div>
                                    ) : null
                                }
                            </div>
                            <div className="iframe-filter__block">
                                <div className="iframe-filter__title">
                                    Анализ
                                </div>
                                <div className="iframe-filter__flex">
                                    <div className="iframe-checkboxes__item">
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={isMinMax}
                                                    name="min-max"
                                                    color="primary"
                                                />
                                            }
                                            label="Мин/Макс"
                                            onChange={() => {
                                                this.setPlotData(this.chartRef.getDataInfo())
                                                this.handleChangeCheckbox('min-max');
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="iframe-filter__flex">
                                    <div className="iframe-checkboxes__item">
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={isTrendLine}
                                                    name="trend-line"
                                                    color="primary"
                                                />
                                            }
                                            label="Тренд"
                                            onChange={() => this.handleChangeCheckbox('trend-line')}
                                        />
                                    </div>
                                </div>
                                <div className="iframe-filter__flex">
                                    <div className="iframe-checkboxes__item">
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={isSma}
                                                    name="SMA"
                                                    color="primary"
                                                />
                                            }
                                            label="SMA"
                                            onChange={() => this.handleChangeCheckbox('sma')}
                                        />
                                    </div>
                                    <input className="iframe-input"
                                           defaultValue={smaPeriod}
                                           type='number'
                                           onChange={(e) => this.changePeriod('sma', e)}
                                    />
                                </div>
                                <div className="iframe-filter__flex">
                                    <div className="iframe-checkboxes__item">
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={isEma}
                                                    name="EMA"
                                                    color="primary"
                                                />
                                            }
                                            label="EMA"
                                            onChange={() => {
                                                this.handleChangeCheckbox('ema')
                                            }}
                                        />
                                    </div>
                                    <input className="iframe-input"
                                           defaultValue={emaPeriod}
                                           type='number'
                                           onChange={(e) => this.changePeriod('ema', e)}
                                    />
                                </div>
                                <div className="iframe-filter__flex">
                                    <div className="iframe-checkboxes__item">
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={isTotalIncome}
                                                    name="total-income"
                                                    color="primary"
                                                />
                                            }
                                            label="Совокупный доход"
                                            onChange={() => this.handleChangeCheckbox('total-income')}
                                        />
                                    </div>
                                </div>

                                <div className="iframe-filter__flex">
                                    <div className="iframe-checkboxes__item">
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={isRsi}
                                                    name="RSI"
                                                    color="primary"
                                                />
                                            }
                                            label="RSI"
                                            onChange={() => this.handleChangeCheckbox('rsi')}
                                        />
                                    </div>
                                    <input className="iframe-input"
                                           defaultValue={rsiPeriod}
                                           type='number'
                                           onChange={(e) => this.changePeriod('rsi', e)}
                                    />
                                </div>
                                <div className="iframe-filter__flex">
                                    <div className="iframe-checkboxes__item">
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={isMacd}
                                                    name="MACD"
                                                    color="primary"
                                                />
                                            }
                                            label="MACD"
                                            onChange={() => this.handleChangeCheckbox('macd')}
                                        />
                                    </div>
                                    <input className="iframe-input"
                                           defaultValue={fastMacdPeriod}
                                           type='number'
                                           onChange={(e) => this.changePeriod('fast', e)}
                                    />
                                    <input className="iframe-input"
                                           defaultValue={slowMacdPeriod}
                                           type='number'
                                           onChange={(e) => this.changePeriod('slow', e)}
                                    />
                                </div>
                                <div className="iframe-filter__flex">
                                    <div className="iframe-checkboxes__signal">Signal</div>
                                    <input className="iframe-input"
                                           defaultValue={signalMacdPeriod}
                                           type='number'
                                           onChange={(e) => this.changePeriod('signal', e)}
                                    />
                                </div>
                            </div>
                            <div className="iframe-filter__block">
                                {/*<DownloadExelBtn data={data.WGC4}/>*/}
                                <DownloadExelBtn data={data.WGC4}/>
                                <Button variant="contained" color="primary">
                                    Развернуть график
                                </Button>
                                <Button variant="contained" color="primary" onClick={() => window.print()}>
                                    Распечатать график
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        );
    }
}


export default withDeviceRatio()(ChartNew);
// export default withSize({ style: { minHeight: 600 } })(withDeviceRatio()(ChartNew));