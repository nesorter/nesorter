import React from 'react';
import styles from './styles.module.css';

export class Waveform extends React.Component<{ data: number[]; }> {
  componentDidMount() {
    this.updateCanvas();
  }

  componentDidUpdate() {
    this.updateCanvas();
  }

  updateCanvas() {
    const canvas = (this.refs.canvas as HTMLCanvasElement);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    const yMid = canvas.height / 2;
    const lineWidth = canvas.width / this.props.data.length;

    ctx.strokeStyle = `#333`;

    this.props.data.forEach((value, i) => {
      const calculated = value * 50;
      ctx.beginPath();
      ctx.moveTo(lineWidth * i, yMid - calculated);
      ctx.lineTo(lineWidth * i, yMid + calculated);
      ctx.stroke();
    });
  }

  render() {
    return (
      <div className={styles.root}>
        <canvas ref="canvas" width={768} height={100} className={styles.canvas} />
      </div>
    );
  }
}
