import React from "react";

import {timeFormat} from "d3-time-format";

import {ChartCanvas, Chart} from "react-financial-charts";

import {XAxis, YAxis} from "react-financial-charts/lib/axes";
import {discontinuousTimeScaleProvider} from "react-financial-charts/lib/scale";
import {BarSeries, LineSeries, CandlestickSeries, MACDSeries} from "react-financial-charts/lib/series";
import {CrossHairCursor, MouseCoordinateX} from "react-financial-charts/lib/coordinates";
import {withDeviceRatio} from "react-financial-charts/lib/utils";
import {ema, macd} from "react-financial-charts/lib/indicator";


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



    render() {
        const {data: initialData, type} = this.props;
        console.log(this.props);

        const ema26 = ema()
            .id(0)
            .options({ windowSize: 26 })
            .merge((d, c) => { d.ema26 = c; })
            .accessor(d => d.ema26);

        const macdCalculator = macd()
            .options({
                fast: 12,
                slow: 26,
                signal: 9,
            })
            .merge((d, c) => {d.macd = c;})
            .accessor(d => d.macd);

        const calculatedData = macdCalculator(ema26(initialData));
        const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(d => d.date);

        const {
            data,
            xScale,
            xAccessor,
            displayXAccessor,
        } = xScaleProvider(calculatedData);

        // console.log(`xScale - ${xScale} xAcc - ${xAccessor} displayXAcc - ${displayXAccessor}`)

        return (
            // <div>123</div>
            <div id='app'>
                <div className="iframe-wrap">
                    <ChartCanvas displayXAccessor={displayXAccessor}
                                 xAccessor={xAccessor}
                                 type={type}
                                 seriesName='name'
                                 xScale={xScale}
                                 data={data}
                                 ratio={2}
                                 panEvent={true}
                                 height={600}
                                 width={500}
                                 xExtents={[0, 100]}>

                        <Chart id={1}
                               height={200}
                               width={500}
                               yExtents={[d => d.close, ema26.accessor()]}>

                            <XAxis axisAt="bottom" orient="bottom"/>
                            <YAxis axisAt="right" orient="right" ticks={2}/>

                            <LineSeries yAccessor={d => d.close} stroke="#4286f4"/>
                            <LineSeries yAccessor={ema26.accessor()} stroke={ema26.stroke()}/>
                            {/*<CandlestickSeries/>*/}

                            {/*<BarSeries yAccessor={d => d.volume}*/}
                            {/*           fill={d => d.close > d.open ? "#6BA583" : "#FF0000"}/>*/}
                            <MouseCoordinateX displayFormat={timeFormat('%Y-%m-%d')}/>
                        </Chart>
                        <Chart id={3} yExtents={d => [d.high, d.low]} height={200} origin={(w,h) => [0, h - 300]}>
                            <XAxis axisAt="bottom" orient="bottom" ticks={6}/>
                            <YAxis axisAt="left" orient="left" ticks={5} />
                            <CandlestickSeries />
                        </Chart>
                        {/*<Chart id={2}*/}
                        {/*       height={200}*/}
                        {/*       width={500}*/}
                        {/*       yExtents={macdCalculator.accessor()}*/}
                        {/*       origin={(w, h) => [0, h - 200]}>*/}
                        {/*    <XAxis axisAt="bottom" orient="bottom"/>*/}
                        {/*    <YAxis axisAt="right" orient="right" ticks={2}/>*/}
                        {/*    <MACDSeries yAccessor={d => d.macd}*/}
                        {/*                {...macdAppearance} />*/}
                        {/*</Chart>*/}
                        <CrossHairCursor/>
                    </ChartCanvas>
                </div>
            </div>

        );
    }
}


export default withDeviceRatio()(ChartNew);