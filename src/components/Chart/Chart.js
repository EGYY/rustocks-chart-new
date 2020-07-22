import React from "react";

import {timeFormat} from "d3-time-format";

import {ChartCanvas, Chart} from "react-financial-charts";

import {XAxis, YAxis} from "react-financial-charts/lib/axes";
import {discontinuousTimeScaleProvider} from "react-financial-charts/lib/scale";
import {BarSeries, LineSeries, CandlestickSeries, MACDSeries, RSISeries} from "react-financial-charts/lib/series";
import {RSITooltip, HoverTooltip} from "react-financial-charts/lib/tooltip";
import {CrossHairCursor, MouseCoordinateX} from "react-financial-charts/lib/coordinates";
import {withDeviceRatio} from "react-financial-charts/lib/utils";
import {ema, macd, sma, rsi} from "react-financial-charts/lib/indicator";


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


const macdAppearance = {
    stroke: {
        macd: "#FF0000",
        signal: "#00F300",
    },
    fill: {
        divergence: "#4682B4"
    },
};

class ChartNew extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isEma: true,
            isSma: true,
            isRsi: true,
            isMacd: true,
            emaPeriod: 5,
            smaPeriod: 5,
            rsiPeriod: 5,
            slowMacdPeriod: 26,
            fastMacdPeriod: 12,
            signalMacdPeriod: 9
        }
    }

    handleChangeIndicator(type) {
        switch (type) {
            case 'ema':
                this.setState({
                    isEma: !this.state.isEma
                });
                return;

            case 'sma':
                this.setState({
                    isSma: !this.state.isSma
                });
                return;

            case 'rsi':
                this.setState({
                    isRsi: !this.state.isRsi
                });
                return;

            case 'macd':
                this.setState({
                    isMacd: !this.state.isMacd
                });
                return;
        }

    }


    changePeriod(type, e) {
        const period = e.target.value;
        switch (type) {
            case 'ema':
                this.setState({
                    emaPeriod: +period
                });
                return;

            case 'sma':
                this.setState({
                    smaPeriod: +period
                });
                return;

            case 'rsi':
                this.setState({
                    rsiPeriod: +period
                });
                return;

            case 'fast':
                this.setState({
                    fastMacdPeriod: +period
                });
                return;

            case 'slow':
                this.setState({
                    slowMacdPeriod: +period
                });
                return;

            case 'signal':
                this.setState({
                    signalMacdPeriod: +period
                });
                return;
        }

    }


    render() {
        const {data: initialData, type, ratio, arrPapers} = this.props;
        const {emaPeriod, smaPeriod, rsiPeriod, slowMacdPeriod, fastMacdPeriod, signalMacdPeriod, isEma, isSma, isRsi, isMacd} = this.state;
        console.log(this.props);

        const renderCheckboxeTickers = arrPapers.map((item, index)=> {
            return(
                <FormControlLabel
                    key={index}
                    control={
                        <Checkbox
                            // checked={this.state.isMoex}
                            // onChange={() => this.handleMoex()}
                            name={`${item.ticker}`}
                            color="primary"
                        />
                    }
                    label={`${item.index}: ${item.ticker}`}
                />
            )
        });

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

        // console.log(data);

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
                                    {renderCheckboxeTickers}
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
                                        // value={this.state.typeChart}
                                        // onChange={(e) => this.typeCharthandleChange(e)}
                                    >
                                        <MenuItem value='close-chart'>Закрытия</MenuItem>
                                        <MenuItem value='candle-chart'>Свечи</MenuItem>
                                        <MenuItem value='ohl-chart'>OHLC</MenuItem>
                                        <MenuItem value='area-chart'>Горки</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                            <ChartCanvas displayXAccessor={displayXAccessor}
                                         xAccessor={xAccessor}
                                         type={type}
                                         seriesName='name'
                                         xScale={xScale}
                                         data={data}
                                         ratio={ratio}
                                         panEvent={true}
                                         height={1000}
                                         width={550}
                                         xExtents={[0, 100]}>

                                <Chart id={1}
                                       height={200}
                                       yExtents={[d => d.WGC4.close, emaCustom.accessor(), smaCustom.accessor()]}>

                                    <XAxis axisAt="bottom" orient="bottom"/>
                                    <YAxis axisAt="right" orient="right" ticks={2}/>

                                    <LineSeries yAccessor={d => d.WGC4.close} stroke="#4286f4"/>
                                    {/*<LineSeries yAccessor={d => d.WGC4.close} stroke="#4236f4"/>*/}


                                    {isEma ? <LineSeries yAccessor={emaCustom.accessor()} stroke="#00F300"/> : null}
                                    {isSma ? <LineSeries yAccessor={smaCustom.accessor()} stroke="#FF0000"/> : null}


                                    {/*<CandlestickSeries/>*/}

                                    {/*<BarSeries yAccessor={d => d.volume}*/}
                                    {/*           fill={d => d.close > d.open ? "#6BA583" : "#FF0000"}/>*/}
                                    <MouseCoordinateX displayFormat={timeFormat('%I:%M')}/>
                                </Chart>

                                <Chart id={2}
                                       yExtents={d => d.WGC4.volume}
                                       height={200}
                                       origin={(w, h) => [0, h - 700]}
                                >
                                    <XAxis axisAt="bottom" orient="bottom"/>
                                    <YAxis axisAt="right" orient="right" ticks={2}/>

                                    <BarSeries yAccessor={d => d.WGC4.volume}/>
                                </Chart>

                                {isRsi ?
                                    (<Chart id={3}
                                            height={200}
                                            yExtents={[0, 100]}
                                            origin={(w, h) => [0, h - 500]}
                                    >
                                        <XAxis/>
                                        <YAxis axisAt='right' orient='right' tickValues={[30, 50, 70]}/>

                                        <RSISeries yAccessor={rsiCalculator.accessor()}/>

                                        <RSITooltip origin={[8, 16]} yAccessor={rsiCalculator.accessor()}
                                                    options={rsiCalculator.options()}/>

                                    </Chart>) : null}

                                {/*candlestickChart*/}
                                {/*=====================*/}

                                {/*<Chart id={3} yExtents={d => [d.high, d.low]} height={200}*/}
                                {/*       origin={(w, h) => [0, h - 300]}>*/}
                                {/*    <XAxis axisAt="bottom" orient="bottom" ticks={6}/>*/}
                                {/*    <YAxis axisAt="left" orient="left" ticks={5}/>*/}
                                {/*    <CandlestickSeries/>*/}
                                {/*</Chart>*/}

                                {/*======================*/}
                                {/*candlestickChart*/}

                                {isMacd ? (
                                    <Chart id={4}
                                           height={200}
                                           yExtents={macdCalculator.accessor()}
                                           origin={(w, h) => [0, h - 300]}>
                                        <XAxis axisAt="bottom" orient="bottom"/>
                                        <YAxis axisAt="right" orient="right" ticks={2}/>
                                        <MACDSeries yAccessor={macdCalculator.accessor()}
                                                    {...macdAppearance} />
                                    </Chart>) : null}


                                <CrossHairCursor/>
                            </ChartCanvas>
                        </div>
                        <div className="iframe-col__right">
                            <div className="iframe-filter__block">
                                <div className="iframe-filter__title"
                                    // onClick={() => this.toggleDatePicker()}
                                >
                                    Период
                                    <a href="#" className="iframe-filter__togler">
                                        +
                                        {/*{this.state.isDatePicker ? <span> -</span> : <span> +</span>}*/}
                                    </a>
                                </div>
                                {
                                    // this.state.isDatePicker ? (<form>
                                    //     <TextField
                                    //         id="min-date"
                                    //         type="date"
                                    //         name="minDate"
                                    //         style={{marginBottom: '18px'}}
                                    //         defaultValue={this.state.minDate}
                                    //         onChange={(e) => this.handleDateRangeChange(e, 'minDate')}
                                    //         InputLabelProps={{
                                    //             shrink: true,
                                    //         }}
                                    //     />
                                    //     <TextField
                                    //         id="max-date"
                                    //         type="date"
                                    //         name="maxDate"
                                    //         defaultValue={this.state.maxDate}
                                    //         onChange={(e) => this.handleDateRangeChange(e, 'maxDate')}
                                    //         InputLabelProps={{
                                    //             shrink: true,
                                    //         }}
                                    //     />
                                    // </form>) : null

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
                                                    // checked={this.state.isMinMax}
                                                    name="min-max"
                                                    color="primary"
                                                />
                                            }
                                            label="Мин/Макс"
                                            // onChange={() => {
                                            //     this.minMaxHandleChange();
                                            //     this.getPlotData(this.refs.chartCanvas.getDataInfo())
                                            // }
                                            // }
                                        />
                                    </div>
                                </div>
                                <div className="iframe-filter__flex">
                                    <div className="iframe-checkboxes__item">
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    // checked={this.state.isTrendLine}
                                                    name="trend-line"
                                                    color="primary"
                                                />
                                            }
                                            label="Тренд"
                                            // onChange={() => this.trendLineHandleChange()}
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
                                            onChange={() => this.handleChangeIndicator('sma')}
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
                                                this.handleChangeIndicator('ema')
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
                                                    // checked={this.state.isFillAreaChart}
                                                    name="fill-area"
                                                    color="primary"
                                                />
                                            }
                                            label="Совокупный доход"
                                            // onChange={() => this.fillAreaHandleChange()}
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
                                            onChange={() => this.handleChangeIndicator('rsi')}
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
                                            onChange={() => this.handleChangeIndicator('macd')}
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
                                {/*<DownloadExelBtn data={data}/>*/}
                                {/*<Button variant="contained" color="primary">*/}
                                {/*    Развернуть график*/}
                                {/*</Button>*/}
                                {/*<Button variant="contained" color="primary" onClick={() => window.print()}>*/}
                                {/*    Распечатать график*/}
                                {/*</Button>*/}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        );
    }
}


export default withDeviceRatio()(ChartNew);