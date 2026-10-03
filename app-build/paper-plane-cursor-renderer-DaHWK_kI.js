import{M as b,O as Q,B as J,F as W,W as Y,N as $,a as ee,H as te,S as z,C as H,P as ae,b as oe,c as se,G as re,V as h,d as ne,e as Z,T as ce,f as j,g as ie,h as le,D as me,i as pe}from"./index-CU12meJE.js";import{c as fe,G as ue}from"./plane-sparkles-BDidBIXu.js";const de=new Q(-1,1,1,-1,0,1);class he extends J{constructor(){super(),this.setAttribute("position",new W([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new W([0,2,0,0,2,0],2))}}const ve=new he;class ge{constructor(i){this._mesh=new b(ve,i)}dispose(){this._mesh.geometry.dispose()}render(i){i.render(this._mesh,de)}get material(){return this._mesh.material}set material(i){this._mesh.material=i}}const o=112,q=40;async function be(y,i,l=224){const a=new Y({canvas:y,alpha:!0,antialias:!0,premultipliedAlpha:!1});a.setSize(l,l,!1),a.setClearColor(0,0),a.toneMapping=$;const M=new ee(l,l,{type:te,samples:4}),v=new z,S=new Q(-o/2,o/2,o/2,-o/2,.1,200);S.position.z=60;const P=new z;P.background=new H("#101722");const A=new ae(1,1),G=[],g=(t,n,c,w,f,u,d)=>{const e=new le({color:new H(t).multiplyScalar(n),side:me});G.push(e);const s=new b(A,e);s.position.set(c,w,f),s.scale.set(u,d,1),s.lookAt(0,0,0),P.add(s)};g("#ffffff",6,-3,4,5,3,7),g("#d8e8ff",4,4,1,3,.7,9),g("#ffffff",5,0,-4,4,7,.65),g("#8eb9f2",2,-4,0,-2,1,6);const C=new oe(a),F=C.fromScene(P,.025,.1,30);v.environment=F.texture,A.dispose(),G.forEach(t=>t.dispose()),C.dispose();const R=new se({color:"#e4edfa",metalness:1,roughness:.17,clearcoat:1,clearcoatRoughness:.1,envMapIntensity:1.15}),m=new re;m.position.set(-o/2+q+1.5*30/42,o/2-q-1.3*30/42,0),v.add(m);const V=fe(v),_=new h,K=new h(10,-12,4);let I=performance.now(),k=!1;const p=new ne({depthTest:!1,depthWrite:!1,uniforms:{motionVector:{value:new Z},bloomStrength:{value:.22},source:{value:M.texture},texel:{value:new Z(1/l,1/l)},resolutionFactor:{value:l/o*.6}},vertexShader:"varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}",fragmentShader:`
      uniform vec2 motionVector; uniform float bloomStrength; uniform sampler2D source; uniform vec2 texel; uniform float resolutionFactor; varying vec2 vUv;
      vec3 bright(vec2 p) { vec3 c=texture2D(source,p).rgb; return c * max(0., max(max(c.r,c.g),c.b)-1.25) / max(1.,max(max(c.r,c.g),c.b)); }
      vec3 tone(vec3 c) { return clamp((c*(2.51*c+.03))/(c*(2.43*c+.59)+.14),0.,1.); }
      void main(){
        vec4 base=texture2D(source,vUv);
        // Keep a crisp nose and smear only behind the current velocity vector.
        vec4 streak=vec4(0.);
        for(int i=1;i<=6;i++) {
          float t=float(i)/6.;
          streak+=texture2D(source,vUv+motionVector*t)*(1.-t*.65)/3.725;
        }
        float amount=clamp(length(motionVector)*112./3.,0.,1.)*.38;
        base=mix(base,streak,amount);
        vec3 glow=vec3(0.);
        for(int y=-3;y<=3;y++) for(int x=-3;x<=3;x++) {
          vec2 d=vec2(float(x),float(y));
          float w=exp(-dot(d,d)/4.);
          glow+=bright(vUv+d*texel*(resolutionFactor))*w/12.25;
        }
        glow*=bloomStrength;
        // Preserve transparent corners; only luminous highlights contribute halo alpha.
        float halo=clamp(max(max(glow.r,glow.g),glow.b)*.45,0.,.45);
        float a=base.a+(1.-base.a)*halo;
        vec3 c=tone(base.rgb+glow);
        c=mix(12.92*c,1.055*pow(c,vec3(1./2.4))-.055,step(vec3(.0031308),c));
        gl_FragColor=vec4(c,a);
      }`}),N=new ge(p);let r,U=!1,D=NaN,E=NaN,O=NaN;const B=(t=0,n=0,c=0,w=0,f=0,u=0)=>{if(U||!r||a.getContext().isContextLost())return;const d=performance.now(),e=Math.min(.05,(d-I)/1e3);I=d;const s=Math.abs(p.uniforms.motionVector.value.x-f/o)>1e-5||Math.abs(p.uniforms.motionVector.value.y+u/o)>1e-5;p.uniforms.motionVector.value.set(f/o,-u/o);const x=k,T=pe(),X=p.uniforms.bloomStrength.value!==T.bloom;p.uniforms.bloomStrength.value=T.bloom,_.copy(K).applyQuaternion(m.quaternion).add(m.position),k=V.update(d,e,_,w*T.sparkles,14,S),!(!s&&!X&&!k&&!x&&Math.abs(t-D)<.002&&Math.abs(n-E)<.002&&Math.abs(c-O)<.002)&&(D=t,E=n,O=c,m.rotation.order="ZYX",m.rotation.set(n*.3,t*Math.PI/180*.6,-c*Math.PI/180),a.setRenderTarget(M),a.clear(),a.render(v,S),a.setRenderTarget(null),a.clear(),N.render(a))},L=()=>{U=!0,r?.traverse(t=>{t instanceof b&&t.geometry.dispose()}),V.dispose(),R.dispose(),F.dispose(),M.dispose(),p.dispose(),N.dispose(),a.dispose()};try{r=(await new ue().loadAsync(i)).scene;const n=new Set,c=new Set;r.traverse(e=>{if(e instanceof b){for(const s of Array.isArray(e.material)?e.material:[e.material]){n.add(s);for(const x of Object.values(s))x instanceof ce&&c.add(x)}e.material=R,e.geometry.applyMatrix4(new j().makeRotationX(Math.PI*.34)),e.geometry.applyMatrix4(new j().makeRotationZ(-Math.PI/4))}}),n.forEach(e=>e.dispose()),c.forEach(e=>e.dispose());const f=new ie().setFromObject(r).getSize(new h),u=28/Math.max(f.x,f.y),d=new h(-.95,.11,0).applyAxisAngle(new h(1,0,0),Math.PI*.34).applyAxisAngle(new h(0,0,1),-Math.PI/4);return r.position.copy(d).multiplyScalar(-u),r.scale.setScalar(u),m.add(r),B(),{draw:B,dispose:L}}catch(t){throw L(),t}}export{be as createPaperPlaneRenderer};
