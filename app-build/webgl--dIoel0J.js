import{c8 as v}from"./index-DyNlPePi.js";var d=`#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main(){
  v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`,p=`#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform sampler2D u_source;
uniform vec2 u_dir;
uniform float u_premul; // premultiply on the first pass so transparent edges don't bleed dark
vec4 fetch(vec2 uv){
  vec4 c = texture(u_source, uv);
  if (u_premul > 0.5) c.rgb *= c.a;
  return c;
}
void main(){
  vec4 c = fetch(v_uv) * 0.2042;
  c += (fetch(v_uv + 1.0 * u_dir) + fetch(v_uv - 1.0 * u_dir)) * 0.1801;
  c += (fetch(v_uv + 2.0 * u_dir) + fetch(v_uv - 2.0 * u_dir)) * 0.1240;
  c += (fetch(v_uv + 3.0 * u_dir) + fetch(v_uv - 3.0 * u_dir)) * 0.0663;
  c += (fetch(v_uv + 4.0 * u_dir) + fetch(v_uv - 4.0 * u_dir)) * 0.0276;
  fragColor = c;
}`,T=`#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform sampler2D u_src;
uniform sampler2D u_map;
uniform sampler2D u_blurred;
uniform vec2 u_res;
uniform vec2 u_texSize;
uniform vec2 u_coverA;
uniform vec2 u_coverB;
uniform vec2 u_center;
uniform vec2 u_half;
uniform float u_radius;
uniform float u_strength;
uniform float u_chroma;
uniform float u_hasBlur;
uniform float u_spec;
uniform float u_vibrancy;
uniform float u_specLo;
uniform float u_specHi;

vec2 toUV(vec2 px){ return ((px + u_coverB) / u_coverA) / u_texSize; }

// Aave premultiplies u_blurred; unpremultiply back to straight alpha.
vec4 sampleBlur(vec2 uv){
  vec4 b = texture(u_blurred, uv);
  b.rgb = b.a > 1e-4 ? b.rgb / b.a : b.rgb;
  return b;
}

void main(){
  vec2 px = v_uv * u_res;
  vec3 straight = texture(u_src, toUV(px)).rgb;

  // analytical rounded-rect SDF mask (AA via fwidth)
  vec2 p = px - u_center;
  vec2 q = abs(p) - u_half + vec2(u_radius);
  float dist = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - u_radius;
  float aa = max(fwidth(dist), 1e-4);
  float mask = 1.0 - smoothstep(-aa, aa, dist);
  if (mask < 0.001){ fragColor = vec4(straight, 1.0); return; }

  // displacement from the baked map (RG = dome-warped disp, B = specular)
  vec2 lensUV = (px - (u_center - u_half)) / (2.0 * u_half);
  vec4 d = texture(u_map, lensUV);
  vec2 off = (d.rg - 0.5) * u_strength;

  // chroma-split sample, frosted toward the blurred copy inside the lens
  float blurMix = u_hasBlur * mask;
  vec2 uvR = toUV(px + off * (1.0 + u_chroma * 0.2));
  vec2 uvG = toUV(px + off * (1.0 + u_chroma * 0.1));
  vec2 uvB = toUV(px + off);
  vec3 col;
  col.r = mix(texture(u_src, uvR).r, sampleBlur(uvR).r, blurMix);
  col.g = mix(texture(u_src, uvG).g, sampleBlur(uvG).g, blurMix);
  col.b = mix(texture(u_src, uvB).b, sampleBlur(uvB).b, blurMix);

  // adaptive specular: add light on dark backdrops, darken on bright ones
  float spec = d.b - 0.502;
  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  float darkBlend = smoothstep(min(u_specLo, u_specHi), max(u_specLo, u_specHi), luma);
  vec3 specAdd = col + spec * u_spec;
  vec3 specMul = col * (1.0 - spec * u_spec);
  col = max(mix(specAdd, specMul, darkBlend), 0.0);

  // adaptive brightness / vibrancy: pull toward mid-gray inside the lens
  col += (0.5 - luma) * u_vibrancy * mask;

  fragColor = vec4(mix(straight, col, mask), 1.0);
}`;function m(e,i,t){const r=e.createShader(i);if(e.shaderSource(r,t),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS)){const s=e.getShaderInfoLog(r);throw e.deleteShader(r),new Error(`[GlassGL] shader compile failed:
`+s)}return r}function l(e,i){const t=e.createProgram();if(e.attachShader(t,m(e,e.VERTEX_SHADER,d)),e.attachShader(t,m(e,e.FRAGMENT_SHADER,i)),e.linkProgram(t),!e.getProgramParameter(t,e.LINK_STATUS))throw new Error(`[GlassGL] link failed:
`+e.getProgramInfoLog(t));return t}function h(e){const i=e.createTexture();return e.bindTexture(e.TEXTURE_2D,i),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),i}var b=class{constructor(e,i){this.canvas=e,this.texSize=[1,1],this.cssW=0,this.cssH=0,this.blurDirty=!0,this.center=[200,200],this.half=[180,120],this.view=null,this.cfg=i;const t=e.getContext("webgl2",{premultipliedAlpha:!1,antialias:!1});if(!t)throw new Error("[GlassGL] WebGL2 unavailable");this.gl=t,this.mainProg=l(t,T),this.blurProg=l(t,p);const r=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,r),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),t.STATIC_DRAW);for(const s of[this.mainProg,this.blurProg]){const a=t.getAttribLocation(s,"a_pos");t.bindBuffer(t.ARRAY_BUFFER,r),t.enableVertexAttribArray(a),t.vertexAttribPointer(a,2,t.FLOAT,!1,0,0)}this.srcTex=h(t),this.mapTex=h(t),this.fboTex=[h(t),h(t)],this.fbo=[t.createFramebuffer(),t.createFramebuffer()]}setBackdrop(e,i,t){const r=this.gl;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,!1),r.bindTexture(r.TEXTURE_2D,this.srcTex),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,r.RGBA,r.UNSIGNED_BYTE,e),this.texSize=[i,t];for(let s=0;s<2;s++)r.bindTexture(r.TEXTURE_2D,this.fboTex[s]),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,i,t,0,r.RGBA,r.UNSIGNED_BYTE,null),r.bindFramebuffer(r.FRAMEBUFFER,this.fbo[s]),r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,this.fboTex[s],0);r.bindFramebuffer(r.FRAMEBUFFER,null),this.blurDirty=!0}bakeMap(){const e=this.gl,i=Math.max(2,Math.round(this.half[0]*2)),t=Math.max(2,Math.round(this.half[1]*2)),r=v({width:i,height:t,radius:this.cfg.radius,depth:this.cfg.depth,profile:this.cfg.profile,dome:this.cfg.dome,edge:1,glow:.35,margin:0});e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.bindTexture(e.TEXTURE_2D,this.mapTex),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,r)}updateSource(e){const i=this.gl;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.bindTexture(i.TEXTURE_2D,this.srcTex),i.texImage2D(i.TEXTURE_2D,0,i.RGBA,i.RGBA,i.UNSIGNED_BYTE,e),this.blurDirty=!0}markBlurDirty(){this.blurDirty=!0}resize(){const e=Math.min(window.devicePixelRatio||1,2);this.cssW=this.canvas.clientWidth,this.cssH=this.canvas.clientHeight,this.canvas.width=Math.round(this.cssW*e),this.canvas.height=Math.round(this.cssH*e)}runBlur(){const e=this.gl,[i,t]=this.texSize,r=this.cfg.frost;e.useProgram(this.blurProg),e.viewport(0,0,i,t),e.activeTexture(e.TEXTURE0),e.uniform1i(e.getUniformLocation(this.blurProg,"u_source"),0);const s=e.getUniformLocation(this.blurProg,"u_premul");e.bindFramebuffer(e.FRAMEBUFFER,this.fbo[0]),e.bindTexture(e.TEXTURE_2D,this.srcTex),e.uniform1f(s,1),e.uniform2f(e.getUniformLocation(this.blurProg,"u_dir"),r/i,0),e.drawArrays(e.TRIANGLES,0,3),e.bindFramebuffer(e.FRAMEBUFFER,this.fbo[1]),e.bindTexture(e.TEXTURE_2D,this.fboTex[0]),e.uniform1f(s,0),e.uniform2f(e.getUniformLocation(this.blurProg,"u_dir"),0,r/t),e.drawArrays(e.TRIANGLES,0,3),e.bindFramebuffer(e.FRAMEBUFFER,null),this.blurDirty=!1}render(){const e=this.gl;this.blurDirty&&this.runBlur();const{cssW:i,cssH:t}=this,[r,s]=this.texSize;let a,_,c,n;if(this.view)({x:a,y:_,w:c,h:n}=this.view);else{const f=Math.max(i/r,t/s);c=r*f,n=s*f,a=(i-c)/2,_=(t-n)/2}const o=this.mainProg;e.useProgram(o),e.viewport(0,0,this.canvas.width,this.canvas.height),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,this.srcTex),e.uniform1i(e.getUniformLocation(o,"u_src"),0),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,this.mapTex),e.uniform1i(e.getUniformLocation(o,"u_map"),1),e.activeTexture(e.TEXTURE2),e.bindTexture(e.TEXTURE_2D,this.fboTex[1]),e.uniform1i(e.getUniformLocation(o,"u_blurred"),2);const u=f=>e.getUniformLocation(o,f);e.uniform2f(u("u_res"),i,t),e.uniform2f(u("u_texSize"),r,s),e.uniform2f(u("u_coverA"),c/r,n/s),e.uniform2f(u("u_coverB"),-a,-_),e.uniform2f(u("u_center"),this.center[0],this.center[1]),e.uniform2f(u("u_half"),this.half[0],this.half[1]),e.uniform1f(u("u_radius"),this.cfg.radius),e.uniform1f(u("u_strength"),this.cfg.strength),e.uniform1f(u("u_chroma"),this.cfg.chroma),e.uniform1f(u("u_hasBlur"),this.cfg.frost>0?1:0),e.uniform1f(u("u_spec"),this.cfg.spec),e.uniform1f(u("u_vibrancy"),this.cfg.vibrancy),e.uniform1f(u("u_specLo"),this.cfg.specLo),e.uniform1f(u("u_specHi"),this.cfg.specHi),e.drawArrays(e.TRIANGLES,0,3)}};export{b as GlassGL};
