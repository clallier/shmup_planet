precision mediump float;

varying vec3 v_color;
varying float v_angle;

uniform sampler2D u_texture;

void main() {
    float c = cos(v_angle);
    float s = sin(v_angle);
    vec2 p = gl_PointCoord - .5;
    
    vec2 rotated_uv = vec2(
        (c * p.x + s * p.y) + .5, 
        (c * p.y - s * p.x) + .5
    );
    vec4 tex_color = texture2D(u_texture, rotated_uv);
    vec4 base_color = vec4(v_color.xyz, tex_color.w);
    gl_FragColor = tex_color * base_color;
}
