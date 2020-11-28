precision mediump float;

varying vec2 vUv;
varying float noise;

void main(){
    // compose the colour using the UV coordinate
    // and modulate it with the noise like ambient occlusion
    gl_FragColor = vec4(noise, 1.-vUv.y, vUv.x, 1.);
}