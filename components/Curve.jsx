import React, { useMemo, useCallback } from 'react';
import { AreaClosed, Bar } from '@visx/shape';
import { curveNatural } from '@visx/curve';
import { GridRows } from '@visx/grid';
import { scaleTime, scaleLinear } from '@visx/scale';
import { withTooltip, Tooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { max, extent, bisector } from 'd3-array';
import { ParentSize } from '@visx/responsive';
import { AxisLeft } from '@visx/axis';
import { LinearGradient } from '@visx/gradient';
import { timeFormat } from 'd3-time-format';

// util
const formatDate = timeFormat("%b %d, '%y");

// accessors
const getDate = (d) => new Date(d.date);
const getDataValue = (d) => d.value;
const bisectDate = bisector(d => new Date(d.date)).left;




export default withTooltip(
  ({
    width = 400,
    height = 150,
    margin = { top: 10, right: 10, bottom: 10, left: 10 },
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
    bgColor = ["rgba(0, 98, 255, 0.2)", "rgba(0, 98, 255, 0)"],
    borderColor = "rgba(0, 98, 255, 1)",
    data,
    prefix = "$",
    key
  }) => {

    // bounds
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // scales
    const dateScale = useMemo(
      () =>
        scaleTime({
          range: [margin.left + 40, innerWidth + margin.left],
          domain: extent(data, getDate),
        }),
      [innerWidth, margin.left],
    );
    const dataValueScale = useMemo(
      () =>
        scaleLinear({
          range: [innerHeight + margin.top, margin.top],
          domain: [0, (max(data, getDataValue) || 0) + innerHeight / 3],
          nice: true,
        }),
      [margin.top, innerHeight],
    );

    // tooltip handler
    const handleTooltip = useCallback(
      (event) => {
        const { x } = localPoint(event) || { x: 0 };
        const x0 = dateScale.invert(x);
        const index = bisectDate(data, x0, 1);
        const d0 = data[index - 1];
        const d1 = data[index];
        let d = d0;
        if (d1 && getDate(d1)) {
          d = x0.valueOf() - getDate(d0).valueOf() > getDate(d1).valueOf() - x0.valueOf() ? d1 : d0;
        }
        showTooltip({
          tooltipData: d,
          tooltipLeft: x,
          tooltipTop: dataValueScale(getDataValue(d)),
        });
      },
      [showTooltip, dataValueScale, dateScale],
    );

    const getValue = (el) => el 

    return (
      <ParentSize key={key}>
        {() => (
          <div style={{margin: margin.top*2}}>
            <svg width={width - 35} height={height - 20}>
              <LinearGradient id="test123" from={bgColor[0]} to={bgColor[1]}/>
              <GridRows
                scale={dataValueScale}
                width={innerWidth}
                strokeDasharray="1,3"
                stroke="gray"
                strokeOpacity={0.5}
                pointerEvents="none"
              />
              
              <AreaClosed
                data={data}
                x={d => (dateScale(getDate(d)) - 20) || 0}
                y={d => dataValueScale(getDataValue(d)) || 0}
                yScale={dataValueScale}
                strokeWidth={2}
                fill="url(#test123)"
                stroke={borderColor}
                curve={curveNatural}
              />
              <Bar
                x={margin.left}
                y={margin.top}
                width={innerWidth}
                height={innerHeight}
                fill="transparent"
                rx={14}
                onTouchStart={handleTooltip}
                onTouchMove={handleTooltip}
                onMouseMove={handleTooltip}
                onMouseLeave={() => hideTooltip()}
              />
              <AxisLeft left={30} scale={dataValueScale} tickFormat={getValue} stroke="#fff" strokeWidth={10} tickStroke="gray" tickLabelProps={() => ({
                fill: "dark-gray",
                fontSize: 13,
                textAnchor: 'end',
                fontWeight: 500,

              })}/>
              {tooltipData && (
                <g>
                  <circle
                    cx={tooltipLeft - 20}
                    cy={tooltipTop}
                    r={6}
                    stroke="white"
                    strokeWidth={3}
                    fill="rgba(0, 98, 255, 1)"
                    pointerEvents="none"
                  />
                </g>
              )}
            </svg>
            {tooltipData && (
              <div>
                <TooltipWithBounds
                  key={Math.random()}
                  top={tooltipTop - 12}
                  left={tooltipLeft + 12}
                >
                  {`${prefix} ${getDataValue(tooltipData)}`}
                </TooltipWithBounds>

                <Tooltip
                  top={innerHeight + margin.top - 14}
                  left={tooltipLeft}
                  style={{
                    ...defaultStyles,
                    minWidth: 72,
                    textAlign: 'center',
                    transform: 'translateX(-50%)',
                  }}
                >
                  {formatDate(getDate(tooltipData))}
                </Tooltip>
            
              </div>
            )}
          </div>
        )}
        
        
      </ParentSize>
    );
  },
);