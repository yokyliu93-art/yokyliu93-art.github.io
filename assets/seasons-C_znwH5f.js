import{C as e,Ft as t,J as n,Lt as r,Pt as i,Rt as a,S as o,St as s,Vt as c,b as l,c as u,ht as d,it as f,l as p,lt as m,m as h,p as g,q as _,u as v,ut as y,zt as b}from"./OrbitControls-BDC5Gvwq.js";var x={name:`CopyShader`,uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`},S=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error(`THREE.Pass: .render() must be implemented in derived pass.`)}dispose(){}},C=new f(-1,1,1,-1,0,1),w=new class extends p{constructor(){super(),this.setAttribute(`position`,new l([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute(`uv`,new l([0,2,0,0,2,0],2))}},T=class{constructor(e){this._mesh=new _(w,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,C)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}},E=class extends S{constructor(e,t=`tDiffuse`){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof s?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=r.clone(e.uniforms),this.material=new s({name:e.name===void 0?`unspecified`:e.name,defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new T(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},D=class extends S{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let r=e.getContext(),i=e.state;i.buffers.color.setMask(!1),i.buffers.depth.setMask(!1),i.buffers.color.setLocked(!0),i.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),i.buffers.stencil.setTest(!0),i.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),i.buffers.stencil.setFunc(r.ALWAYS,a,4294967295),i.buffers.stencil.setClear(o),i.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),i.buffers.color.setLocked(!1),i.buffers.depth.setLocked(!1),i.buffers.color.setMask(!0),i.buffers.depth.setMask(!0),i.buffers.stencil.setLocked(!1),i.buffers.stencil.setFunc(r.EQUAL,1,4294967295),i.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),i.buffers.stencil.setLocked(!0)}},O=class extends S{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}},k=class{constructor(t,n){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),n===void 0){let r=t.getSize(new a);this._width=r.width,this._height=r.height,n=new c(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:e}),n.texture.name=`EffectComposer.rt1`}else this._width=n.width,this._height=n.height;this.renderTarget1=n,this.renderTarget2=n.clone(),this.renderTarget2.texture.name=`EffectComposer.rt2`,this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new E(x),this.copyPass.material.blending=0,this.timer=new i}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),n=!1;for(let t=0,r=this.passes.length;t<r;t++){let r=this.passes[t];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(t),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),r.needsSwap){if(n){let t=this.renderer.getContext(),n=this.renderer.state.buffers.stencil;n.setFunc(t.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),n.setFunc(t.EQUAL,1,4294967295)}this.swapBuffers()}D!==void 0&&(r instanceof D?n=!0:r instanceof O&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new a);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(n,r),this.renderTarget2.setSize(n,r);for(let e=0;e<this.passes.length;e++)this.passes[e].setSize(n,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}},A=class extends S{constructor(e,t,n=null,r=null,i=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=r,this.clearAlpha=i,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new g}render(e,t,n){let r=e.autoClear;e.autoClear=!1;let i,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(i=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==1&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(i),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=r}},j={name:`LuminosityHighPassShader`,uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new g(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`},M=class t extends S{constructor(t,i=1,o,l){super(),this.strength=i,this.radius=o,this.threshold=l,this.resolution=t===void 0?new a(256,256):new a(t.x,t.y),this.clearColor=new g(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let u=Math.round(this.resolution.x/2),d=Math.round(this.resolution.y/2);this.renderTargetBright=new c(u,d,{type:e}),this.renderTargetBright.texture.name=`UnrealBloomPass.bright`,this.renderTargetBright.texture.generateMipmaps=!1;for(let t=0;t<this.nMips;t++){let n=new c(u,d,{type:e});n.texture.name=`UnrealBloomPass.h`+t,n.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(n);let r=new c(u,d,{type:e});r.texture.name=`UnrealBloomPass.v`+t,r.texture.generateMipmaps=!1,this.renderTargetsVertical.push(r),u=Math.round(u/2),d=Math.round(d/2)}let f=j;this.highPassUniforms=r.clone(f.uniforms),this.highPassUniforms.luminosityThreshold.value=l,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new s({uniforms:this.highPassUniforms,vertexShader:f.vertexShader,fragmentShader:f.fragmentShader}),this.separableBlurMaterials=[];let p=[6,10,14,18,22];u=Math.round(this.resolution.x/2),d=Math.round(this.resolution.y/2);for(let e=0;e<this.nMips;e++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(p[e])),this.separableBlurMaterials[e].uniforms.invSize.value=new a(1/u,1/d),u=Math.round(u/2),d=Math.round(d/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=i,this.compositeMaterial.uniforms.bloomRadius.value=.1;let m=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=m,this.bloomTintColors=[new b(1,1,1),new b(1,1,1),new b(1,1,1),new b(1,1,1),new b(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=r.clone(x.uniforms),this.blendMaterial=new s({uniforms:this.copyUniforms,vertexShader:x.vertexShader,fragmentShader:x.fragmentShader,premultipliedAlpha:!0,blending:2,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new g,this._oldClearAlpha=1,this._basic=new n,this._fsQuad=new T(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),r=Math.round(t/2);this.renderTargetBright.setSize(n,r);for(let e=0;e<this.nMips;e++)this.renderTargetsHorizontal[e].setSize(n,r),this.renderTargetsVertical[e].setSize(n,r),this.separableBlurMaterials[e].uniforms.invSize.value=new a(1/n,1/r),n=Math.round(n/2),r=Math.round(r/2)}render(e,n,r,i,a){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();let o=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),a&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=r.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=r.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let s=this.renderTargetBright;for(let n=0;n<this.nMips;n++)this._fsQuad.material=this.separableBlurMaterials[n],this.separableBlurMaterials[n].uniforms.colorTexture.value=s.texture,this.separableBlurMaterials[n].uniforms.direction.value=t.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[n]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[n].uniforms.colorTexture.value=this.renderTargetsHorizontal[n].texture,this.separableBlurMaterials[n].uniforms.direction.value=t.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[n]),e.clear(),this._fsQuad.render(e),s=this.renderTargetsVertical[n];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(r),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=o}_getSeparableBlurMaterial(e){let t=[],n=e/3;for(let r=0;r<e;r++)t.push(.39894*Math.exp(-.5*r*r/(n*n))/n);return new s({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new a(.5,.5)},direction:{value:new a(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {

					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;

					for ( int i = 1; i < KERNEL_RADIUS; i ++ ) {

						float x = float( i );
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * w;

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new s({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}};M.BlurDirectionX=new a(1,0),M.BlurDirectionY=new a(0,1);var N={name:`OutputShader`,uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`},P=class extends S{constructor(){super(),this.isOutputPass=!0,this.uniforms=r.clone(N.uniforms),this.material=new d({name:N.name,uniforms:this.uniforms,vertexShader:N.vertexShader,fragmentShader:N.fragmentShader}),this._fsQuad=new T(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},h.getTransfer(this._outputColorSpace)===`srgb`&&(this.material.defines.SRGB_TRANSFER=``),this._toneMapping===1?this.material.defines.LINEAR_TONE_MAPPING=``:this._toneMapping===2?this.material.defines.REINHARD_TONE_MAPPING=``:this._toneMapping===3?this.material.defines.CINEON_TONE_MAPPING=``:this._toneMapping===4?this.material.defines.ACES_FILMIC_TONE_MAPPING=``:this._toneMapping===6?this.material.defines.AGX_TONE_MAPPING=``:this._toneMapping===7?this.material.defines.NEUTRAL_TONE_MAPPING=``:this._toneMapping===5&&(this.material.defines.CUSTOM_TONE_MAPPING=``),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};function F(e=new Date){let t=e.getFullYear(),n=(e,t,n)=>new Date(e,t,n).getTime(),r=[[n(t-1,10,15),`autumn`],[n(t,0,15),`winter`],[n(t,3,15),`spring`],[n(t,6,15),`summer`],[n(t,8,15),`summer`],[n(t,10,15),`autumn`],[n(t+1,0,15),`winter`]],i=e.getTime(),a=1;for(;a<r.length-1&&i>r[a][0];)a++;let[o,s]=r[a-1],[c,l]=r[a],u=Math.max(0,Math.min(1,(i-o)/(c-o)));return{from:s,to:l,amount:u*u*(3-2*u)}}var I={spring:`春日`,summer:`盛夏`,autumn:`秋日`,winter:`冬日`},L={spring:[`#acc59b`,`#e5b7b8`,`#bed1aa`],summer:[`#78a882`,`#96bc8d`,`#b3ce9c`],autumn:[`#cc9a68`,`#d8b878`,`#bc886c`],winter:[`#dce7e3`,`#c7d8d4`,`#e8ebe0`]},R=new Set([`88a685`,`9eb793`,`b7c49a`,`789984`,`dc9b9a`,`d68e8d`,`e8afa4`,`c77c80`,`6d9780`,`adc3a1`,`dfad9f`,`e8bdb0`,`98bba0`,`c99279`]);function z(e,{wide:r=!1,onSeason:i=()=>{}}={}){let a=``,s=-1,c=0,l=F(),d=matchMedia(`(prefers-reduced-motion: reduce)`).matches,f=r?110:20,h=r?180:110,b=new o;b.userData.seasonEffect=!0,e.add(b);let x=new Float32Array(h*3);for(let e=0;e<h;e++)x[e*3]=(Math.random()-.5)*f,x[e*3+1]=Math.random()*(r?35:18),x[e*3+2]=(Math.random()-.5)*f;let S=new p;S.setAttribute(`position`,new u(x,3));let C=document.createElement(`canvas`);C.width=32,C.height=32;let w=C.getContext(`2d`);w.fillStyle=`white`,w.beginPath(),w.ellipse(16,16,10,5,-.5,0,Math.PI*2),w.fill();let T=new v(C),E=new y({map:T,color:`#dfb781`,size:r?.42:.16,transparent:!0,opacity:.7,depthWrite:!1}),D=new m(S,E);b.add(D);let O=new o;O.position.set(r?-12:-3,r?2:-1,r?-55:-20),b.add(O),[`#e6aaac`,`#e9bf9b`,`#e9dbad`,`#b9d4ad`,`#aacdd8`,`#c7bed7`].forEach((e,i)=>{let a=new _(new t((r?28:12)-i*(r?.4:.16),r?.2:.09,5,70,Math.PI),new n({color:e,transparent:!0,opacity:0,depthWrite:!1}));O.add(a)});let k=new Map,A=[],j=new WeakSet;function M(){e.traverse(e=>{if(!e.isMesh||j.has(e))return;j.add(e);let t=e.material;if(!t?.color)return;let n=t.color.getHexString();(k.has(t)||R.has(n))&&(k.has(t)||k.set(t,{base:t.color.clone(),rose:[`dc9b9a`,`d68e8d`,`e8afa4`,`c77c80`,`dfad9f`,`e8bdb0`,`c99279`].includes(n),index:k.size%3}),A.push({mesh:e,z:e.rotation.z,phase:A.length*.7}))}),N()}function N(){for(let[e,t]of k)e.color.set(L[l.from][t.index]).lerp(new g(L[l.to][t.index]),l.amount),t.rose&&a!==`winter`&&e.color.lerp(new g(`#e0b5b0`),.85);i(a,l),E.color.set(a===`winter`?`#f4faf8`:a===`spring`?`#efc9cd`:a===`summer`?`#f6eac4`:`#dab07b`),E.size=a===`winter`?r?.35:.12:r?.42:.17,D.visible=!d,S.setDrawRange(0,a===`summer`?Math.floor(h*.15):a===`autumn`?Math.floor(h*Math.max(.15,l.amount)):h),document.documentElement.dataset.season=a}function P(){let e=new Date;s=e.toDateString(),l=F(e),a=l.amount<.5?l.from:l.to,M(),B.textContent=e.getMonth()===8?`夏末 · 绿意未尽`:I[a]+` · 微风轻拂`}let z=document.createElement(`details`);z.className=`season-control`,z.innerHTML=`<summary></summary><p>草木随日子慢慢变色。</p><button type="button">让彩虹出现</button><small>幻想天气 · 非实时天气预报</small>`,document.body.append(z);let B=z.querySelector(`summary`),V=0;return z.querySelector(`button`).onclick=()=>{V=c+24,z.open=!1},P(),{refresh:M,update(e){if(c+=e,new Date().toDateString()!==s&&P(),!d){for(let t=0;t<h;t++){let n=t*3;x[n]+=e*(a===`autumn`?.65:.23)+Math.sin(c*.7+t)*e*.14,x[n+1]-=e*(a===`winter`?.55:a===`summer`?.06:.32),x[n+1]<-4&&(x[n+1]=r?35:18),x[n]>f/2&&(x[n]=-f/2)}S.attributes.position.needsUpdate=!0,A.forEach(e=>e.mesh.rotation.z=e.z+Math.sin(c*.7+e.phase)*.025)}let t=c%150,n=c<V||a!==`winter`&&t>65&&t<89?.22:0;O.children.forEach(t=>{t.material.opacity+=(n-t.material.opacity)*Math.min(1,e*1.2)})},get season(){return a}}}export{k as a,A as i,P as n,M as r,z as t};