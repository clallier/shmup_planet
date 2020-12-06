precision mediump float;

varying vec2 vUv;
varying float noise;

void main(){
    vec4 color1 = vec4(0.9, 0.50, 0.1, 1.);
    vec4 color2 = vec4(0.9, 0.9, 0.5, 1.);
    
    // compose the colour using the UV coordinate
    // and modulate it with the noise like ambient occlusion
    gl_FragColor =  mix(color2, color1, noise);
    //vec4(1.-vUv.y, 1.-noise, vUv.x, 1.);
}