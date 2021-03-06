/**
 * @fileOverview Polar Grid
 */
import React, { PureComponent, SVGProps } from 'react';
import { polarToCartesian } from '../util/PolarUtils';
import { filterProps } from '../util/types';

interface PolarGridProps {
  cx?: number;
  cy?: number;
  innerRadius?: number;
  outerRadius?: number;

  polarAngles?: number[];
  polarRadius?: number[];
  gridType?: 'polygon' | 'circle';
  radialLines: boolean;
}
export type Props = SVGProps<SVGPathElement> & PolarGridProps;

export class PolarGrid extends PureComponent<Props> {
  static displayName = 'PolarGrid';

  static defaultProps = {
    cx: 0,
    cy: 0,
    innerRadius: 0,
    outerRadius: 0,
    gridType: 'polygon',
    radialLines: true,
  };

  getPolygonPath(radius: number) {
    const { cx, cy, polarAngles } = this.props;

    let path = '';

    polarAngles.forEach((angle: number, i: number) => {
      const point = polarToCartesian(cx, cy, radius, angle);

      if (i) {
        path += `L ${point.x},${point.y}`;
      } else {
        path += `M ${point.x},${point.y}`;
      }
    });
    path += 'Z';

    return path;
  }

  /**
   * Draw axis of radial line
   * @return {[type]} The lines
   */
  renderPolarAngles() {
    const { cx, cy, innerRadius, outerRadius, polarAngles, radialLines } = this.props;

    if (!polarAngles || !polarAngles.length || !radialLines) {
      return null;
    }
    const props = {
      stroke: '#ccc',
      ...filterProps(this.props),
    };

    return (
      <g className="recharts-polar-grid-angle">
        {polarAngles.map((entry, i) => {
          const start = polarToCartesian(cx, cy, innerRadius, entry);
          const end = polarToCartesian(cx, cy, outerRadius, entry);

          let a = end.x - start.x;
          let b = end.y - start.y;
          //Start 2 and 3 reprensent the thickness at the base of the axi
          const start2 = { x: cx + -b / 150, y: cy + a / 150 };
          const start3 = { x: cx + b / 150, y: cy - a / 150 };

          console.log(start2);

          return (
            <path
              d={`M${start2.x} ${start2.y} L${end.x} ${end.y} L${start3.x} ${start3.y} Z`}
              {...props}
              key={`line-${i}`} // eslint-disable-line react/no-array-index-key
            />
          );
        })}
      </g>
    );
  }

  /**
   * Draw concentric circles
   * @param {Number} radius The radius of circle
   * @param {Number} index  The index of circle
   * @param {Object} extraProps Extra props
   * @return {ReactElement} circle
   */
  renderConcentricCircle(radius: number, index: number, extraProps?: SVGProps<SVGCircleElement>) {
    const { cx, cy } = this.props;
    const props = {
      stroke: '#ccc',
      ...filterProps(this.props),
      fill: 'none',
      ...extraProps,
    };

    return (
      <circle
        {...props}
        className="recharts-polar-grid-concentric-circle"
        key={`circle-${index}`}
        cx={cx}
        cy={cy}
        r={radius}
      />
    );
  }

  /**
   * Draw concentric polygons
   * @param {Number} radius     The radius of polygon
   * @param {Number} index      The index of polygon
   * @param {Object} extraProps Extra props
   * @return {ReactElement} polygon
   */
  renderConcentricPolygon(radius: number, index: number, extraProps?: SVGProps<SVGPathElement>) {
    const props = {
      stroke: '#ccc',
      ...filterProps(this.props),
      fill: 'none',
      ...extraProps,
    };

    return (
      <path
        {...props}
        className="recharts-polar-grid-concentric-polygon"
        key={`path-${index}`}
        d={this.getPolygonPath(radius)}
      />
    );
  }

  /**
   * Draw concentric axis
   * @return {ReactElement} Concentric axis
   * @todo Optimize the name
   */
  renderConcentricPath() {
    const { polarRadius, gridType } = this.props;

    if (!polarRadius || !polarRadius.length) {
      return null;
    }

    return (
      <g className="recharts-polar-grid-concentric">
        {polarRadius.map((entry: number, i: number) =>
          gridType === 'circle' ? this.renderConcentricCircle(entry, i) : this.renderConcentricPolygon(entry, i),
        )}
      </g>
    );
  }

  render() {
    const { outerRadius } = this.props;

    if (outerRadius <= 0) {
      return null;
    }

    return (
      <g className="recharts-polar-grid">
        {this.renderPolarAngles()}
        {this.renderConcentricPath()}
      </g>
    );
  }
}
