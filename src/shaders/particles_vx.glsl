varying vec3 v_color;
varying float v_angle;

uniform float u_size;
attribute float angle;

void main() 
{
	v_color = vec3(1., 1., 1.);
	v_angle = angle;

	vec4 pos = modelViewMatrix * vec4(position, 1.);
    // option (2): scale particles as objects in 3D space
	gl_PointSize = u_size + (300.0 / length(pos));
	gl_Position = projectionMatrix * pos;
}