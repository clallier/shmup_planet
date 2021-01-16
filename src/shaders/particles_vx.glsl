// from : http://stemkoski.github.io/Three.js/Particle-Engine.html

// attribute: can be different for each particle
// (such as size and color);
// can only be used in vertex shader
// default value is 0
attribute float angle;
attribute float hidden;
attribute float size;
// varying: used to communicate data 
// from vertex shader to fragment shader
varying vec4 v_color;
varying float v_angle;

// uniform: data that is the same 
// for each particle (such as texture)
uniform float u_size;

void main() 
{
	v_color = (hidden < 0.5) ? vec4(1.) : vec4(0.);
	v_angle = angle;
	
	vec4 pos = modelViewMatrix * vec4(position, 1.);
	gl_PointSize = (u_size + size) * (300.0 / length(pos));
	gl_Position = projectionMatrix * pos;
}