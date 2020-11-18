import React from "react";
import { Bar } from "@visx/shape";
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { Group } from "@visx/group";
import { scaleBand, scaleLinear } from "@visx/scale";
import { localPoint } from '@visx/event';
import { ParentSize } from '@visx/responsive';
import { AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';

const Bars = ({
  data = [],
  width = 400, 
  height = 50 * data.length,
  margin = { top: 25, right: 25, bottom: 25, left: 25 },
  bgColor = "rgba(0, 98, 255, 1)",
  borderColor = "rgba(0, 98, 255, 1)",
}) => {

  const getDataValue = (d) => d.value;
  const getIndex = (d) => d.index;

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  })

  const handleMouseOver = (event, datum) => {
    const coords = localPoint(event.target.ownerSVGElement, event);
    showTooltip({
      tooltipLeft: coords.x,
      tooltipTop: coords.y,
      tooltipData: datum
    });
  };


  const xMax = width;
  const yMax = height - margin.top * 2;


  const max = Math.max(...data.map(({value}) => value))
  const min = Math.min(...data.map(({value}) => value))

  const xScale = scaleBand({
    range: [0, xMax],
    domain: data.map(getIndex),
    padding: 0.4,
  });
  const dataValueScale = scaleLinear({
    domain: [min, max],
    range: [yMax, 0],
    round: true
  });

  const getValue = (q) => Math.abs(q)
  

  return width < 10 ? null : (
    <ParentSize key="bars-horizontal-grap">
      {() => (
        <>
          <svg width={width + margin.left} height={height + margin.top} ref={containerRef}>
            <rect width={width} height={height} y="0" fill="transparent" rx={14} />
            <Group top={margin.top} left={margin.left}>
      
              {data.map(({index, value, message}) => {
                const barWidth = yMax - (dataValueScale(value));
                const barHeight = xScale.bandwidth(); // Retorna el valor en pixeles del ancho
                const barY = height - 20 - xScale(index);
                return (
                  <>
                    <text
                      x={-10}
                      y={barY + barHeight/2 + 2}
                      stroke= "dark-gray"
                      fontSize= {13}
                      fontWeight={500}
                    >
                      {value}
                    </text>
                    <Bar
                      style={{cursor: "pointer"}}
                      onMouseOver={e => handleMouseOver(e, message)}
                      onMouseOut={hideTooltip}
                      key={`bar-${index}`}
                      x={margin.left}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      fill={bgColor}
                      stroke={borderColor}
                      strokeWidth={2}
                      onClick={() => console.log(data, value)}
                    />
                  </>
                );
              })}
            </Group>
          </svg>
          {tooltipOpen && (
            <TooltipInPortal
              key={Math.random()}
              top={tooltipTop}
              left={tooltipLeft}
            >
              <strong>{JSON.stringify(tooltipData)}</strong>
            </TooltipInPortal>
          )}
        </>
      )}
      
    </ParentSize>
  );
}

export default Bars;