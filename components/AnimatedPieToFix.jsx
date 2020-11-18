import React, {useState} from "react";
import { Pie } from "@visx/shape";
import { Group } from "@visx/group";
import { scaleOrdinal } from "@visx/scale";
import { localPoint } from '@visx/event';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { ParentSize } from '@visx/responsive';
import { animated, useTransition, interpolate } from 'react-spring';
const frequency = (d) => d.value;

export default function Example({
  radius = 150,
  margin = { top: 10, right: 10, bottom: 10, left: 10 },
  data = [],
  colors = ["#f5222d", "#fa541c", "#faad14", "#fadb14", "#a0d911", "#52c41a", "#13c2c2", "#1890ff", "#2f54eb", "#722ed1", "#eb2f96"]
}) {

  const getValueFrequencyColor = scaleOrdinal({
    domain: data.sort((a, b) => b.value - a.value),
    range: colors.slice(0, data.length + 1)
  });

  

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

  const pieSortValues = (a, b) => b - a
  const [selectedAlphabetLetter, setSelectedAlphabetLetter] = useState(null);
  const [transitionActive, setTransitionActive] = useState(false);

  return (
    <ParentSize key="parent">
      {() => (
        <>
          <svg width={radius * 2 + margin.left} height={radius * 2 + margin.top} ref={containerRef}>
            <Group top={radius + margin.top} left={radius + margin.left}>
              <Pie
                data={data}
                pieValue={frequency}
              >
                {(pie) => {
                  return pie.arcs.map(({value}) => getValueFrequencyColor(value));
                }}
              </Pie>
              <Pie
                data={selectedAlphabetLetter 
                  ? data.filter(({value}) => value === selectedAlphabetLetter)
                  : data
                }
                pieValue={frequency}
                outerRadius={radius}
                pieSortValues={pieSortValues}
              >
                {(pie) => (
                  <AnimatedPie
                    {...pie}
                    radius={radius}
                    animate={true}
                    getKey={({ data: { value } }) => value}
                    onClickDatum={(q) => setSelectedAlphabetLetter(
                      selectedAlphabetLetter && selectedAlphabetLetter === q.value ? null : q.value,
                    )
                    
                      
                    }
                    transitionActive
                    setTransitionActive
                    getColor={(q) => getValueFrequencyColor(q.value)
                    }
                  />
                )}
              </Pie>
              
            </Group>
          </svg>
          
        </>
      )}
      
    </ParentSize>
  );
}

function AnimatedPie({
  animate,
  arcs,
  path,
  getKey,
  getColor,
  onClickDatum,
  radius
}) {
  const fromLeaveTransition = ({ endAngle }) => ({
    // enter from 360° if end angle is > 180°
    startAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
    endAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
    opacity: 0,
  });
  const enterUpdateTransition = ({ startAngle, endAngle }) => ({
    startAngle,
    endAngle,
    opacity: 1,
  });
  const transitions = useTransition(
    arcs,
    getKey,
    // @ts-ignore react-spring doesn't like this overload
    {
      from: animate ? fromLeaveTransition : enterUpdateTransition,
      enter: enterUpdateTransition,
      update: enterUpdateTransition,
      leave: animate ? fromLeaveTransition : enterUpdateTransition,
    },
  );

  

  return (
    <>
      {transitions.map(
        ({
          item,
          props,
          key,
        }, index) => {
          const [centroidX, centroidY] = path.centroid(item);
          const hasSpaceForLabel = item.endAngle - item.startAngle >= 0.4;
          const hasSpaceForMessage = item.endAngle - item.startAngle >= 2;

          

          return (
            <g key={`animation-${item.data.index}-${item.data.value}`}>
              <animated.path style={{cursor: "pointer"}}
                // compute interpolated path d attribute from intermediate angle values
                d={interpolate([props.startAngle, props.endAngle], (startAngle, endAngle) =>
                  path({
                    ...item.data,
                    startAngle,
                    endAngle,
                  }),
                )}
                fill={getColor(item.data)}
                onClick={() => {
                  onClickDatum(item.data)
                  console.log(item.data.value)
                }}
                onTouchStart={() => onClickDatum(item.data)}
              />
              <animated.g style={{ opacity: props.opacity }}>
                {hasSpaceForMessage && (
                  <text
                    fill="white"
                    x={centroidX}
                    y={centroidY - radius/2 - 100}
                    fontSize={25}
                    fontWeight={500}
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    {item.data.message}
                  </text>
                )}
                {hasSpaceForLabel && (
                  <text
                    fill="white"
                    x={centroidX * 1.3}
                    y={centroidY * 1.3}
                    fontSize={25}
                    fontWeight={500}
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    {item.data.value}
                  </text>
                )}
                
              </animated.g>
            </g>
          );
        },
      )}
    </>
  );
}