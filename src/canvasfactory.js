import { CanvasTexture } from 'three';
import Palette from './palette'

export default class CanvasFactory {
    static createTexture(config = {}) {
        const width = config.width || 32;
        const height = config.height || 32;
        const fillStyle = config.fillStyle || `#${Palette.light.toString(16)}`;
        const shape = config.shape || 'rect';

        const x = width / 2; 
        const y = height / 2;
        const radius = width / 2; 
        
        const canvas = document.createElement('canvas'); 
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = fillStyle;
        if(shape == 'circle') {
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        else if (shape == 'rect') {
            ctx.fillRect(0, 0, width, height);  
        }
        else if (shape == 'tri') {
            CanvasFactory.poly(ctx, x, y, 3, radius);    
            ctx.fill();    
        }
        const texture = new CanvasTexture(canvas)
        return texture;
    }

    /*
    * ctx: the canvas 2D context
    * x, y: center point
    * p: number of sides
    * radius: the poly size
    * http://scienceprimer.com/drawing-regular-polygons-javascript-canvas
    */
    static poly(ctx, x, y, p, radius) {
        ctx.beginPath();
        //ctx.moveTo(x +  size * Math.cos(0), y + size * Math.sin(0));
        ctx.moveTo(x + radius, y);
        for (let i=1; i<=p; i++) {
            ctx.lineTo(
                x + radius * Math.cos(i * 2 * Math.PI / p),
                y + radius * Math.sin(i * 2 * Math.PI / p)
            );
        }
        ctx.closePath();
    }
}