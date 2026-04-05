"use client";

import { useRef, useEffect, useMemo, useState, CSSProperties } from "react";

type PatternShape = "Checks" | "Stripes" | "Edge";
const PatternShapes: Record<PatternShape, number> = { Checks: 0, Stripes: 1, Edge: 2 };

interface PresetParams {
  color1: string; color2: string; color3: string;
  rotation: number; proportion: number; scale: number; speed: number;
  distortion: number; swirl: number; swirlIterations: number;
  softness: number; offset: number; shape: PatternShape; shapeSize: number;
}

type PresetName = "Prism" | "Lava" | "Plasma" | "Pulse" | "Vortex" | "Mist";

const presets: Record<PresetName, PresetParams> = {
  Prism:  { color1:"#050505", color2:"#66B3FF", color3:"#FFFFFF", rotation:-50, proportion:1,   scale:0.01, speed:30, distortion:0,  swirl:50, swirlIterations:16, softness:47,  offset:-299, shape:"Checks",  shapeSize:45 },
  Lava:   { color1:"#FF9F21", color2:"#FF0303", color3:"#000000", rotation:114, proportion:100, scale:0.52, speed:30, distortion:7,  swirl:18, swirlIterations:20, softness:100, offset:717,  shape:"Edge",    shapeSize:12 },
  Plasma: { color1:"#B566FF", color2:"#000000", color3:"#000000", rotation:0,   proportion:63,  scale:0.75, speed:30, distortion:5,  swirl:61, swirlIterations:5,  softness:100, offset:-168, shape:"Checks",  shapeSize:28 },
  Pulse:  { color1:"#66FF85", color2:"#000000", color3:"#000000", rotation:-167,proportion:92,  scale:0,    speed:20, distortion:54, swirl:75, swirlIterations:3,  softness:28,  offset:-813, shape:"Checks",  shapeSize:79 },
  Vortex: { color1:"#000000", color2:"#FFFFFF", color3:"#000000", rotation:50,  proportion:41,  scale:0.4,  speed:20, distortion:0,  swirl:100,swirlIterations:3,  softness:5,   offset:-744, shape:"Stripes", shapeSize:80 },
  Mist:   { color1:"#050505", color2:"#FF66B8", color3:"#050505", rotation:0,   proportion:33,  scale:0.48, speed:39, distortion:4,  swirl:65, swirlIterations:5,  softness:100, offset:-235, shape:"Edge",    shapeSize:48 },
};

interface CustomConfig {
  preset: "custom";
  color1: string; color2: string; color3: string;
  rotation?: number; proportion?: number; scale?: number; speed?: number;
  distortion?: number; swirl?: number; swirlIterations?: number;
  softness?: number; offset?: number; shape?: PatternShape; shapeSize?: number;
}
interface PresetConfig { preset: PresetName; speed?: number; }
type GradientConfig = CustomConfig | PresetConfig;
interface NoiseConfig { opacity: number; scale?: number; }

interface AnimatedGradientProps {
  config?: GradientConfig;
  noise?: NoiseConfig;
  radius?: string;
  style?: CSSProperties;
  className?: string;
}

export default function AnimatedGradient({
  config = { preset: "Prism" },
  noise,
  radius = "0px",
  style,
  className,
}: AnimatedGradientProps) {
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const containerRef  = useRef<HTMLDivElement>(null);
  const frameIdRef    = useRef<number | undefined>(undefined);
  const startTimeRef  = useRef<number>(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); return () => setIsMounted(false); }, []);

  const params = useMemo((): PresetParams => {
    if (config.preset === "custom") {
      return {
        color1: config.color1, color2: config.color2, color3: config.color3,
        rotation: config.rotation ?? 0, proportion: config.proportion ?? 35,
        scale: config.scale ?? 1, speed: config.speed ?? 25,
        distortion: config.distortion ?? 12, swirl: config.swirl ?? 80,
        swirlIterations: config.swirlIterations ?? 10, softness: config.softness ?? 100,
        offset: config.offset ?? 0, shape: config.shape ?? "Checks", shapeSize: config.shapeSize ?? 10,
      };
    }
    const preset = presets[config.preset] || presets.Prism;
    return { ...preset, speed: config.speed ?? preset.speed };
  }, [config]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !isMounted) return;

    const gl = canvas.getContext("webgl2", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return;

    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, `#version 300 es\nin vec4 a_position;\nvoid main(){gl_Position=a_position;}`);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, FRAGMENT_SHADER);
    gl.compileShader(fs);

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs); gl.attachShader(prog, fs);
    gl.linkProgram(prog); gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = {
      time:           gl.getUniformLocation(prog, "u_time"),
      resolution:     gl.getUniformLocation(prog, "u_resolution"),
      pixelRatio:     gl.getUniformLocation(prog, "u_pixelRatio"),
      scale:          gl.getUniformLocation(prog, "u_scale"),
      rotation:       gl.getUniformLocation(prog, "u_rotation"),
      color1:         gl.getUniformLocation(prog, "u_color1"),
      color2:         gl.getUniformLocation(prog, "u_color2"),
      color3:         gl.getUniformLocation(prog, "u_color3"),
      proportion:     gl.getUniformLocation(prog, "u_proportion"),
      softness:       gl.getUniformLocation(prog, "u_softness"),
      shape:          gl.getUniformLocation(prog, "u_shape"),
      shapeScale:     gl.getUniformLocation(prog, "u_shapeScale"),
      distortion:     gl.getUniformLocation(prog, "u_distortion"),
      swirl:          gl.getUniformLocation(prog, "u_swirl"),
      swirlIter:      gl.getUniformLocation(prog, "u_swirlIterations"),
    };

    // Render at half resolution for performance
    const PR = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      canvas.width = w * PR; canvas.height = h * PR;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    startTimeRef.current = performance.now();

    const animate = (time: number) => {
      const elapsed = (time - startTimeRef.current) / 1000;
      const speed = (params.speed / 100) * 5;

      gl.uniform1f(u.time, elapsed * speed + params.offset * 0.01);
      gl.uniform2f(u.resolution, canvas.width, canvas.height);
      gl.uniform1f(u.pixelRatio, PR);
      gl.uniform1f(u.scale, params.scale);
      gl.uniform1f(u.rotation, (params.rotation * Math.PI) / 180);

      const c1 = hex(params.color1), c2 = hex(params.color2), c3 = hex(params.color3);
      gl.uniform4f(u.color1, c1[0], c1[1], c1[2], c1[3]);
      gl.uniform4f(u.color2, c2[0], c2[1], c2[2], c2[3]);
      gl.uniform4f(u.color3, c3[0], c3[1], c3[2], c3[3]);

      gl.uniform1f(u.proportion, params.proportion / 100);
      gl.uniform1f(u.softness,   params.softness / 100);
      gl.uniform1f(u.shape,      PatternShapes[params.shape]);
      gl.uniform1f(u.shapeScale, params.shapeSize / 100);
      gl.uniform1f(u.distortion, params.distortion / 50);
      gl.uniform1f(u.swirl,      params.swirl / 100);
      gl.uniform1f(u.swirlIter,  params.swirl === 0 ? 0 : params.swirlIterations);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      frameIdRef.current = requestAnimationFrame(animate);
    };

    frameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameIdRef.current !== undefined) cancelAnimationFrame(frameIdRef.current);
      ro.disconnect();
      gl.deleteProgram(prog);
      gl.deleteShader(vs); gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, [isMounted, params]);

  return (
    <div ref={containerRef} className={className}
      style={{ position:"absolute", inset:0, zIndex:-1, borderRadius:radius, overflow:"hidden", ...style }}>
      <canvas ref={canvasRef} style={{ display:"block", width:"100%", height:"100%" }} />
      {noise && noise.opacity > 0 && (
        <div style={{
          position:"absolute", inset:0,
          backgroundImage:`url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwBAMAAAClLOS0AAAAElBMVEUAAAAAAAAAAAAAAAAAAAAAAADgKxmiAAAABnRSTlMCCgkGBAVJOAVJAAAASklEQVQ4y2NgGAWjYBSMglEwCgY/YGRgZBQUYmJiZGQEkYwMjIyMgoKCjIyMIJKBgRFIMjIyAklGRkYGRkFBYEcwMDIyMjAOUQAA1I4HwVwZAkYAAAAASUVORK5CYII=")`,
          backgroundSize: (noise.scale ?? 1) * 200, backgroundRepeat:"repeat",
          opacity: noise.opacity / 2, pointerEvents:"none",
        }} />
      )}
    </div>
  );
}

function hex(h: string): [number,number,number,number] {
  let r=0,g=0,b=0,a=1;
  const c = h.slice(1);
  if (c.length === 3) {
    r=parseInt(c[0]+c[0],16)/255; g=parseInt(c[1]+c[1],16)/255; b=parseInt(c[2]+c[2],16)/255;
  } else {
    r=parseInt(c.slice(0,2),16)/255; g=parseInt(c.slice(2,4),16)/255; b=parseInt(c.slice(4,6),16)/255;
    if (c.length===8) a=parseInt(c.slice(6,8),16)/255;
  }
  return [r,g,b,a];
}

const FRAGMENT_SHADER = `#version 300 es
precision mediump float;
uniform float u_time,u_pixelRatio,u_scale,u_rotation,u_proportion,u_softness,u_shape,u_shapeScale,u_distortion,u_swirl,u_swirlIterations;
uniform vec2 u_resolution;
uniform vec4 u_color1,u_color2,u_color3;
out vec4 fragColor;
#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846
vec2 rot(vec2 uv,float th){return mat2(cos(th),sin(th),-sin(th),cos(th))*uv;}
float rnd(vec2 st){return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);}
float nz(vec2 st){vec2 i=floor(st),f=fract(st);float a=rnd(i),b=rnd(i+vec2(1,0)),c=rnd(i+vec2(0,1)),d=rnd(i+vec2(1,1));vec2 u=f*f*(3.-2.*f);return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}
vec4 blend(vec4 c1,vec4 c2,vec4 c3,float m,float ew,float eb){
  float r1=smoothstep(.0+.35*ew,.7-.35*ew+.5*eb,m);
  float r2=smoothstep(.3+.35*ew,1.-.35*ew+eb,m);
  vec3 b2=mix(c1.rgb*c1.a,c2.rgb*c2.a,r1);
  float o2=mix(c1.a,c2.a,r1);
  return vec4(mix(b2,c3.rgb*c3.a,r2),mix(o2,c3.a,r2));
}
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution.xy;
  float t=.5*u_time;
  float ns=.0005+.006*u_scale;
  uv-=.5; uv*=(ns*u_resolution); uv=rot(uv,u_rotation*.5*PI); uv/=u_pixelRatio; uv+=.5;
  float n1=nz(uv+t),n2=nz(uv*2.-t),ang=n1*TWO_PI;
  uv.x+=4.*u_distortion*n2*cos(ang); uv.y+=4.*u_distortion*n2*sin(ang);
  float iter=ceil(clamp(u_swirlIterations,1.,30.));
  for(float i=1.;i<=iter;i++){uv.x+=clamp(u_swirl,0.,2.)/i*cos(t+i*1.5*uv.y);uv.y+=clamp(u_swirl,0.,2.)/i*cos(t+i*uv.x);}
  float shape=0.,mixer=0.;
  if(u_shape<.5){vec2 s=uv*(.5+3.5*u_shapeScale);shape=.5+.5*sin(s.x)*cos(s.y);mixer=shape+.48*sign(u_proportion-.5)*pow(abs(u_proportion-.5),.5);}
  else if(u_shape<1.5){vec2 s=uv*(.25+3.*u_shapeScale);float f=fract(s.y);shape=smoothstep(0.,.55,f)*smoothstep(1.,.45,f);mixer=shape+.48*sign(u_proportion-.5)*pow(abs(u_proportion-.5),.5);}
  else{float sh=1.-uv.y;sh-=.5;sh/=(ns*u_resolution.y);sh+=.5;float ss=.2*(1.-u_shapeScale);shape=smoothstep(.45-ss,.55+ss,sh+.3*(u_proportion-.5));mixer=shape;}
  fragColor=blend(u_color1,u_color2,u_color3,mixer,1.-clamp(u_softness,0.,1.),.01+.01*u_scale);
}`;
