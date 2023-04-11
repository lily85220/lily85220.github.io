import{ks as m,kw as P,kt as y,c9 as _,lw as $,r as g,lS as O,kr as u,ku as S,kz as A,lv as x,kq as C,al as o,lT as v,kv as E,kC as p,ly as w,R as T,ac as n,kD as l,cC as d,kE as F,ai as k,kF as b,kG as D,kH as N,l7 as M,kI as I,kK as R,kL as L,lU as U,kM as W,kN as G,kO as z,lV as B,lW as H,lX as j,lY as q,la as V,lZ as Q,am as c,lc as K,ld as X,l_ as Y,kT as Z}from"./index-cb639cc1.js";function J(a){const e=new m,{vertex:t,fragment:s}=e;return P(t,a),e.include(y,a),e.attributes.add(_.POSITION,"vec3"),e.attributes.add(_.UV0,"vec2"),e.varyings.add("vpos","vec3"),a.hasMultipassTerrain&&e.varyings.add("depth","float"),t.uniforms.add(new $("textureCoordinateScaleFactor",r=>g(r.texture)&&g(r.texture.descriptor.textureCoordinateScaleFactor)?r.texture.descriptor.textureCoordinateScaleFactor:O)),t.code.add(u`
    void main(void) {
      vpos = position;
      ${a.hasMultipassTerrain?"depth = (view * vec4(vpos, 1.0)).z;":""}
      vTexCoord = uv0 * textureCoordinateScaleFactor;
      gl_Position = transformPosition(proj, view, vpos);
    }
  `),e.include(S,a),e.include(A,a),s.uniforms.add([new x("tex",r=>r.texture),new C("opacity",r=>r.opacity)]),e.varyings.add("vTexCoord","vec2"),a.output===o.Alpha?s.code.add(u`
    void main() {
      discardBySlice(vpos);
      ${a.hasMultipassTerrain?"terrainDepthTest(gl_FragCoord, depth);":""}

      float alpha = texture2D(tex, vTexCoord).a * opacity;
      if (alpha  < ${u.float(v)}) {
        discard;
      }

      gl_FragColor = vec4(alpha);
    }
    `):(s.include(E),s.code.add(u`
    void main() {
      discardBySlice(vpos);
      ${a.hasMultipassTerrain?"terrainDepthTest(gl_FragCoord, depth);":""}
      gl_FragColor = texture2D(tex, vTexCoord) * opacity;

      if (gl_FragColor.a < ${u.float(v)}) {
        discard;
      }

      gl_FragColor = highlightSlice(gl_FragColor, vpos);
      ${a.transparencyPassType===p.Color?"gl_FragColor = premultiplyAlpha(gl_FragColor);":""}
    }
    `)),e}const ee=Object.freeze(Object.defineProperty({__proto__:null,build:J},Symbol.toStringTag,{value:"Module"}));class h extends D{initializeProgram(e){return new N(e.rctx,h.shader.get().build(this.configuration),M)}_setPipelineState(e,t){const s=this.configuration,r=e===p.NONE,f=e===p.FrontFace;return I({blending:s.output!==o.Color&&s.output!==o.Alpha||!s.transparent?null:r?te:R(e),culling:L(s.cullFace),depthTest:{func:U(e)},depthWrite:r?s.writeDepth?W:null:G(e),colorWrite:z,stencilWrite:s.hasOccludees?B:null,stencilTest:s.hasOccludees?t?H:j:null,polygonOffset:r||f?null:q(s.enableOffset)})}initializePipeline(){return this._occludeePipelineState=this._setPipelineState(this.configuration.transparencyPassType,!0),this._setPipelineState(this.configuration.transparencyPassType,!1)}getPipelineState(e,t){return t?this._occludeePipelineState:super.getPipelineState(e,t)}}h.shader=new F(ee,()=>k(()=>import("./ImageMaterial.glsl-80a225a1.js"),["assets/ImageMaterial.glsl-80a225a1.js","assets/index-cb639cc1.js","assets/index-ec7d25bd.css"]));const te=w(T.ONE,T.ONE_MINUS_SRC_ALPHA);class i extends b{constructor(){super(...arguments),this.output=o.Color,this.cullFace=d.None,this.hasSlicePlane=!1,this.transparent=!1,this.enableOffset=!0,this.writeDepth=!0,this.hasOccludees=!1,this.transparencyPassType=p.NONE,this.hasMultipassTerrain=!1,this.cullAboveGround=!1}}n([l({count:o.COUNT})],i.prototype,"output",void 0),n([l({count:d.COUNT})],i.prototype,"cullFace",void 0),n([l()],i.prototype,"hasSlicePlane",void 0),n([l()],i.prototype,"transparent",void 0),n([l()],i.prototype,"enableOffset",void 0),n([l()],i.prototype,"writeDepth",void 0),n([l()],i.prototype,"hasOccludees",void 0),n([l({count:p.COUNT})],i.prototype,"transparencyPassType",void 0),n([l()],i.prototype,"hasMultipassTerrain",void 0),n([l()],i.prototype,"cullAboveGround",void 0);class ie extends V{constructor(e){super(e,new se),this.supportsEdges=!0,this._configuration=new i}getConfiguration(e,t){return this._configuration.output=e,this._configuration.cullFace=this.parameters.cullFace,this._configuration.hasSlicePlane=this.parameters.hasSlicePlane,this._configuration.transparent=this.parameters.transparent,this._configuration.writeDepth=this.parameters.writeDepth,this._configuration.hasOccludees=this.parameters.hasOccludees,this._configuration.transparencyPassType=t.transparencyPassType,this._configuration.enableOffset=t.camera.relativeElevation<Q,this._configuration.hasMultipassTerrain=t.multipassTerrain.enabled,this._configuration.cullAboveGround=t.multipassTerrain.cullAboveGround,this._configuration}requiresSlot(e,t){return t===o.Color||t===o.Alpha||t===o.Highlight?e===c.DRAPED_MATERIAL?!0:t===o.Highlight?e===c.OPAQUE_MATERIAL:e===(this.parameters.transparent?this.parameters.writeDepth?c.TRANSPARENT_MATERIAL:c.TRANSPARENT_DEPTH_WRITE_DISABLED_MATERIAL:c.OPAQUE_MATERIAL):!1}createGLMaterial(e){return new ae(e)}createBufferWriter(){return new K(X)}}class ae extends Y{constructor(e){super({...e,...e.material.parameters})}_updateParameters(e){return this.updateTexture(this._material.parameters.textureId),this._material.setParameters(this.textureBindParameters),this.ensureTechnique(h,e)}_updateOccludeeState(e){e.hasOccludees!==this._material.parameters.hasOccludees&&(this._material.setParameters({hasOccludees:e.hasOccludees}),this._updateParameters(e))}beginSlot(e){return this._output!==o.Color&&this._output!==o.Alpha||this._updateOccludeeState(e),this._updateParameters(e)}}class se extends Z{constructor(){super(...arguments),this.transparent=!1,this.writeDepth=!0,this.hasSlicePlane=!1,this.cullFace=d.None,this.hasOccludees=!1,this.opacity=1,this.textureId=null,this.initTextureTransparent=!0}}export{ie as c,J as f};
