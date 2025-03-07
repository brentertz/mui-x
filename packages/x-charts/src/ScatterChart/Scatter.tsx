import * as React from 'react';
import PropTypes from 'prop-types';
import { DefaultizedScatterSeriesType } from '../models/seriesType/scatter';
import { D3Scale, getValueToPositionMapper } from '../hooks/useScale';
import {
  getIsFaded,
  getIsHighlighted,
  useInteractionItemProps,
} from '../hooks/useInteractionItemProps';
import { InteractionContext } from '../context/InteractionProvider';

export interface ScatterProps {
  series: DefaultizedScatterSeriesType;
  xScale: D3Scale;
  yScale: D3Scale;
  markerSize: number;
  color: string;
}

function Scatter(props: ScatterProps) {
  const { series, xScale, yScale, color, markerSize } = props;

  const { item } = React.useContext(InteractionContext);

  const getXPosition = getValueToPositionMapper(xScale);
  const getYPosition = getValueToPositionMapper(yScale);
  const getInteractionItemProps = useInteractionItemProps(series.highlightScope);

  const xRange = xScale.range();
  const yRange = yScale.range();

  const isInRange = ({ x, y }: { x: number; y: number }) => {
    if (x < Math.min(...xRange) || x > Math.max(...xRange)) {
      return false;
    }
    if (y < Math.min(...yRange) || y > Math.max(...yRange)) {
      return false;
    }
    return true;
  };
  return (
    <g>
      {series.data
        .map(({ x, y, id }, index) => ({
          x: getXPosition(x),
          y: getYPosition(y),
          id,
          dataIndex: index,
        }))
        .filter(isInRange)
        .map(({ x, y, id, dataIndex }) => {
          const isHighlighted = getIsHighlighted(
            item,
            { type: 'scatter', seriesId: series.id, dataIndex },
            series.highlightScope,
          );

          const isFaded =
            !isHighlighted &&
            getIsFaded(
              item,
              { type: 'scatter', seriesId: series.id, dataIndex },
              series.highlightScope,
            );

          return (
            <circle
              key={id}
              cx={0}
              cy={0}
              r={markerSize}
              transform={`translate(${x}, ${y})`}
              fill={color}
              opacity={(isFaded && 0.3) || 1}
              {...getInteractionItemProps({ type: 'scatter', seriesId: series.id, dataIndex })}
            />
          );
        })}
    </g>
  );
}

Scatter.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  color: PropTypes.string.isRequired,
  markerSize: PropTypes.number.isRequired,
  series: PropTypes.shape({
    color: PropTypes.string.isRequired,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
      }),
    ).isRequired,
    highlightScope: PropTypes.shape({
      faded: PropTypes.oneOf(['global', 'none', 'series']),
      highlighted: PropTypes.oneOf(['item', 'none', 'series']),
    }),
    id: PropTypes.string.isRequired,
    label: PropTypes.string,
    markerSize: PropTypes.number,
    type: PropTypes.oneOf(['scatter']).isRequired,
    valueFormatter: PropTypes.func.isRequired,
    xAxisKey: PropTypes.string,
    yAxisKey: PropTypes.string,
  }).isRequired,
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
} as any;

export { Scatter };
