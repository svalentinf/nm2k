(function() {
  "use strict";
  var define_process_env_default$4 = {};
  // @__NO_SIDE_EFFECTS__
  function makeMap(str) {
    const map2 = /* @__PURE__ */ Object.create(null);
    for (const key of str.split(",")) map2[key] = 1;
    return (val) => val in map2;
  }
  const EMPTY_OBJ = !!(define_process_env_default$4.NODE_ENV !== "production") ? Object.freeze({}) : {};
  const EMPTY_ARR = !!(define_process_env_default$4.NODE_ENV !== "production") ? Object.freeze([]) : [];
  const NOOP = () => {
  };
  const NO = () => false;
  const isOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // uppercase letter
  (key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97);
  const isModelListener = (key) => key.startsWith("onUpdate:");
  const extend = Object.assign;
  const remove = (arr, el) => {
    const i = arr.indexOf(el);
    if (i > -1) {
      arr.splice(i, 1);
    }
  };
  const hasOwnProperty$1 = Object.prototype.hasOwnProperty;
  const hasOwn = (val, key) => hasOwnProperty$1.call(val, key);
  const isArray = Array.isArray;
  const isMap = (val) => toTypeString(val) === "[object Map]";
  const isSet = (val) => toTypeString(val) === "[object Set]";
  const isDate = (val) => toTypeString(val) === "[object Date]";
  const isFunction = (val) => typeof val === "function";
  const isString = (val) => typeof val === "string";
  const isSymbol = (val) => typeof val === "symbol";
  const isObject = (val) => val !== null && typeof val === "object";
  const isPromise = (val) => {
    return (isObject(val) || isFunction(val)) && isFunction(val.then) && isFunction(val.catch);
  };
  const objectToString = Object.prototype.toString;
  const toTypeString = (value) => objectToString.call(value);
  const toRawType = (value) => {
    return toTypeString(value).slice(8, -1);
  };
  const isPlainObject = (val) => toTypeString(val) === "[object Object]";
  const isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
  const isReservedProp = /* @__PURE__ */ makeMap(
    // the leading comma is intentional so empty string "" is also included
    ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
  );
  const isBuiltInDirective = /* @__PURE__ */ makeMap(
    "bind,cloak,else-if,else,for,html,if,model,on,once,pre,show,slot,text,memo"
  );
  const cacheStringFunction = (fn) => {
    const cache = /* @__PURE__ */ Object.create(null);
    return ((str) => {
      const hit = cache[str];
      return hit || (cache[str] = fn(str));
    });
  };
  const camelizeRE = /-\w/g;
  const camelize = cacheStringFunction(
    (str) => {
      return str.replace(camelizeRE, (c) => c.slice(1).toUpperCase());
    }
  );
  const hyphenateRE = /\B([A-Z])/g;
  const hyphenate = cacheStringFunction(
    (str) => str.replace(hyphenateRE, "-$1").toLowerCase()
  );
  const capitalize = cacheStringFunction((str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  });
  const toHandlerKey = cacheStringFunction(
    (str) => {
      const s = str ? `on${capitalize(str)}` : ``;
      return s;
    }
  );
  const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
  const invokeArrayFns = (fns, ...arg) => {
    for (let i = 0; i < fns.length; i++) {
      fns[i](...arg);
    }
  };
  const def = (obj, key, value, writable = false) => {
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: false,
      writable,
      value
    });
  };
  const looseToNumber = (val) => {
    const n = parseFloat(val);
    return isNaN(n) ? val : n;
  };
  let _globalThis;
  const getGlobalThis = () => {
    return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
  };
  function normalizeStyle(value) {
    if (isArray(value)) {
      const res = {};
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        const normalized = isString(item) ? parseStringStyle(item) : normalizeStyle(item);
        if (normalized) {
          for (const key in normalized) {
            res[key] = normalized[key];
          }
        }
      }
      return res;
    } else if (isString(value) || isObject(value)) {
      return value;
    }
  }
  const listDelimiterRE = /;(?![^(]*\))/g;
  const propertyDelimiterRE = /:([^]+)/;
  const styleCommentRE = /\/\*[^]*?\*\//g;
  function parseStringStyle(cssText) {
    const ret = {};
    cssText.replace(styleCommentRE, "").split(listDelimiterRE).forEach((item) => {
      if (item) {
        const tmp = item.split(propertyDelimiterRE);
        tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
      }
    });
    return ret;
  }
  function normalizeClass(value) {
    let res = "";
    if (isString(value)) {
      res = value;
    } else if (isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const normalized = normalizeClass(value[i]);
        if (normalized) {
          res += normalized + " ";
        }
      }
    } else if (isObject(value)) {
      for (const name in value) {
        if (value[name]) {
          res += name + " ";
        }
      }
    }
    return res.trim();
  }
  const HTML_TAGS = "html,body,base,head,link,meta,style,title,address,article,aside,footer,header,hgroup,h1,h2,h3,h4,h5,h6,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,summary,template,blockquote,iframe,tfoot";
  const SVG_TAGS = "svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistantLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,text,textPath,title,tspan,unknown,use,view";
  const MATH_TAGS = "annotation,annotation-xml,maction,maligngroup,malignmark,math,menclose,merror,mfenced,mfrac,mfraction,mglyph,mi,mlabeledtr,mlongdiv,mmultiscripts,mn,mo,mover,mpadded,mphantom,mprescripts,mroot,mrow,ms,mscarries,mscarry,msgroup,msline,mspace,msqrt,msrow,mstack,mstyle,msub,msubsup,msup,mtable,mtd,mtext,mtr,munder,munderover,none,semantics";
  const isHTMLTag = /* @__PURE__ */ makeMap(HTML_TAGS);
  const isSVGTag = /* @__PURE__ */ makeMap(SVG_TAGS);
  const isMathMLTag = /* @__PURE__ */ makeMap(MATH_TAGS);
  const specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
  const isSpecialBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs);
  function includeBooleanAttr(value) {
    return !!value || value === "";
  }
  function looseCompareArrays(a, b) {
    if (a.length !== b.length) return false;
    let equal = true;
    for (let i = 0; equal && i < a.length; i++) {
      equal = looseEqual(a[i], b[i]);
    }
    return equal;
  }
  function looseEqual(a, b) {
    if (a === b) return true;
    let aValidType = isDate(a);
    let bValidType = isDate(b);
    if (aValidType || bValidType) {
      return aValidType && bValidType ? a.getTime() === b.getTime() : false;
    }
    aValidType = isSymbol(a);
    bValidType = isSymbol(b);
    if (aValidType || bValidType) {
      return a === b;
    }
    aValidType = isArray(a);
    bValidType = isArray(b);
    if (aValidType || bValidType) {
      return aValidType && bValidType ? looseCompareArrays(a, b) : false;
    }
    aValidType = isObject(a);
    bValidType = isObject(b);
    if (aValidType || bValidType) {
      if (!aValidType || !bValidType) {
        return false;
      }
      const aKeysCount = Object.keys(a).length;
      const bKeysCount = Object.keys(b).length;
      if (aKeysCount !== bKeysCount) {
        return false;
      }
      for (const key in a) {
        const aHasKey = a.hasOwnProperty(key);
        const bHasKey = b.hasOwnProperty(key);
        if (aHasKey && !bHasKey || !aHasKey && bHasKey || !looseEqual(a[key], b[key])) {
          return false;
        }
      }
    }
    return String(a) === String(b);
  }
  function looseIndexOf(arr, val) {
    return arr.findIndex((item) => looseEqual(item, val));
  }
  const isRef$1 = (val) => {
    return !!(val && val["__v_isRef"] === true);
  };
  const toDisplayString = (val) => {
    return isString(val) ? val : val == null ? "" : isArray(val) || isObject(val) && (val.toString === objectToString || !isFunction(val.toString)) ? isRef$1(val) ? toDisplayString(val.value) : JSON.stringify(val, replacer, 2) : String(val);
  };
  const replacer = (_key, val) => {
    if (isRef$1(val)) {
      return replacer(_key, val.value);
    } else if (isMap(val)) {
      return {
        [`Map(${val.size})`]: [...val.entries()].reduce(
          (entries, [key, val2], i) => {
            entries[stringifySymbol(key, i) + " =>"] = val2;
            return entries;
          },
          {}
        )
      };
    } else if (isSet(val)) {
      return {
        [`Set(${val.size})`]: [...val.values()].map((v) => stringifySymbol(v))
      };
    } else if (isSymbol(val)) {
      return stringifySymbol(val);
    } else if (isObject(val) && !isArray(val) && !isPlainObject(val)) {
      return String(val);
    }
    return val;
  };
  const stringifySymbol = (v, i = "") => {
    var _a;
    return (
      // Symbol.description in es2019+ so we need to cast here to pass
      // the lib: es2016 check
      isSymbol(v) ? `Symbol(${(_a = v.description) != null ? _a : i})` : v
    );
  };
  var define_process_env_default$3 = {};
  function warn$2(msg, ...args) {
    console.warn(`[Vue warn] ${msg}`, ...args);
  }
  let activeEffectScope;
  class EffectScope {
    constructor(detached = false) {
      this.detached = detached;
      this._active = true;
      this._on = 0;
      this.effects = [];
      this.cleanups = [];
      this._isPaused = false;
      this.parent = activeEffectScope;
      if (!detached && activeEffectScope) {
        this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(
          this
        ) - 1;
      }
    }
    get active() {
      return this._active;
    }
    pause() {
      if (this._active) {
        this._isPaused = true;
        let i, l;
        if (this.scopes) {
          for (i = 0, l = this.scopes.length; i < l; i++) {
            this.scopes[i].pause();
          }
        }
        for (i = 0, l = this.effects.length; i < l; i++) {
          this.effects[i].pause();
        }
      }
    }
    /**
     * Resumes the effect scope, including all child scopes and effects.
     */
    resume() {
      if (this._active) {
        if (this._isPaused) {
          this._isPaused = false;
          let i, l;
          if (this.scopes) {
            for (i = 0, l = this.scopes.length; i < l; i++) {
              this.scopes[i].resume();
            }
          }
          for (i = 0, l = this.effects.length; i < l; i++) {
            this.effects[i].resume();
          }
        }
      }
    }
    run(fn) {
      if (this._active) {
        const currentEffectScope = activeEffectScope;
        try {
          activeEffectScope = this;
          return fn();
        } finally {
          activeEffectScope = currentEffectScope;
        }
      } else if (!!(define_process_env_default$3.NODE_ENV !== "production")) {
        warn$2(`cannot run an inactive effect scope.`);
      }
    }
    /**
     * This should only be called on non-detached scopes
     * @internal
     */
    on() {
      if (++this._on === 1) {
        this.prevScope = activeEffectScope;
        activeEffectScope = this;
      }
    }
    /**
     * This should only be called on non-detached scopes
     * @internal
     */
    off() {
      if (this._on > 0 && --this._on === 0) {
        activeEffectScope = this.prevScope;
        this.prevScope = void 0;
      }
    }
    stop(fromParent) {
      if (this._active) {
        this._active = false;
        let i, l;
        for (i = 0, l = this.effects.length; i < l; i++) {
          this.effects[i].stop();
        }
        this.effects.length = 0;
        for (i = 0, l = this.cleanups.length; i < l; i++) {
          this.cleanups[i]();
        }
        this.cleanups.length = 0;
        if (this.scopes) {
          for (i = 0, l = this.scopes.length; i < l; i++) {
            this.scopes[i].stop(true);
          }
          this.scopes.length = 0;
        }
        if (!this.detached && this.parent && !fromParent) {
          const last = this.parent.scopes.pop();
          if (last && last !== this) {
            this.parent.scopes[this.index] = last;
            last.index = this.index;
          }
        }
        this.parent = void 0;
      }
    }
  }
  function getCurrentScope() {
    return activeEffectScope;
  }
  let activeSub;
  const pausedQueueEffects = /* @__PURE__ */ new WeakSet();
  class ReactiveEffect {
    constructor(fn) {
      this.fn = fn;
      this.deps = void 0;
      this.depsTail = void 0;
      this.flags = 1 | 4;
      this.next = void 0;
      this.cleanup = void 0;
      this.scheduler = void 0;
      if (activeEffectScope && activeEffectScope.active) {
        activeEffectScope.effects.push(this);
      }
    }
    pause() {
      this.flags |= 64;
    }
    resume() {
      if (this.flags & 64) {
        this.flags &= -65;
        if (pausedQueueEffects.has(this)) {
          pausedQueueEffects.delete(this);
          this.trigger();
        }
      }
    }
    /**
     * @internal
     */
    notify() {
      if (this.flags & 2 && !(this.flags & 32)) {
        return;
      }
      if (!(this.flags & 8)) {
        batch(this);
      }
    }
    run() {
      if (!(this.flags & 1)) {
        return this.fn();
      }
      this.flags |= 2;
      cleanupEffect(this);
      prepareDeps(this);
      const prevEffect = activeSub;
      const prevShouldTrack = shouldTrack;
      activeSub = this;
      shouldTrack = true;
      try {
        return this.fn();
      } finally {
        if (!!(define_process_env_default$3.NODE_ENV !== "production") && activeSub !== this) {
          warn$2(
            "Active effect was not restored correctly - this is likely a Vue internal bug."
          );
        }
        cleanupDeps(this);
        activeSub = prevEffect;
        shouldTrack = prevShouldTrack;
        this.flags &= -3;
      }
    }
    stop() {
      if (this.flags & 1) {
        for (let link = this.deps; link; link = link.nextDep) {
          removeSub(link);
        }
        this.deps = this.depsTail = void 0;
        cleanupEffect(this);
        this.onStop && this.onStop();
        this.flags &= -2;
      }
    }
    trigger() {
      if (this.flags & 64) {
        pausedQueueEffects.add(this);
      } else if (this.scheduler) {
        this.scheduler();
      } else {
        this.runIfDirty();
      }
    }
    /**
     * @internal
     */
    runIfDirty() {
      if (isDirty(this)) {
        this.run();
      }
    }
    get dirty() {
      return isDirty(this);
    }
  }
  let batchDepth = 0;
  let batchedSub;
  let batchedComputed;
  function batch(sub, isComputed = false) {
    sub.flags |= 8;
    if (isComputed) {
      sub.next = batchedComputed;
      batchedComputed = sub;
      return;
    }
    sub.next = batchedSub;
    batchedSub = sub;
  }
  function startBatch() {
    batchDepth++;
  }
  function endBatch() {
    if (--batchDepth > 0) {
      return;
    }
    if (batchedComputed) {
      let e = batchedComputed;
      batchedComputed = void 0;
      while (e) {
        const next = e.next;
        e.next = void 0;
        e.flags &= -9;
        e = next;
      }
    }
    let error;
    while (batchedSub) {
      let e = batchedSub;
      batchedSub = void 0;
      while (e) {
        const next = e.next;
        e.next = void 0;
        e.flags &= -9;
        if (e.flags & 1) {
          try {
            ;
            e.trigger();
          } catch (err) {
            if (!error) error = err;
          }
        }
        e = next;
      }
    }
    if (error) throw error;
  }
  function prepareDeps(sub) {
    for (let link = sub.deps; link; link = link.nextDep) {
      link.version = -1;
      link.prevActiveLink = link.dep.activeLink;
      link.dep.activeLink = link;
    }
  }
  function cleanupDeps(sub) {
    let head;
    let tail = sub.depsTail;
    let link = tail;
    while (link) {
      const prev = link.prevDep;
      if (link.version === -1) {
        if (link === tail) tail = prev;
        removeSub(link);
        removeDep(link);
      } else {
        head = link;
      }
      link.dep.activeLink = link.prevActiveLink;
      link.prevActiveLink = void 0;
      link = prev;
    }
    sub.deps = head;
    sub.depsTail = tail;
  }
  function isDirty(sub) {
    for (let link = sub.deps; link; link = link.nextDep) {
      if (link.dep.version !== link.version || link.dep.computed && (refreshComputed(link.dep.computed) || link.dep.version !== link.version)) {
        return true;
      }
    }
    if (sub._dirty) {
      return true;
    }
    return false;
  }
  function refreshComputed(computed2) {
    if (computed2.flags & 4 && !(computed2.flags & 16)) {
      return;
    }
    computed2.flags &= -17;
    if (computed2.globalVersion === globalVersion) {
      return;
    }
    computed2.globalVersion = globalVersion;
    if (!computed2.isSSR && computed2.flags & 128 && (!computed2.deps && !computed2._dirty || !isDirty(computed2))) {
      return;
    }
    computed2.flags |= 2;
    const dep = computed2.dep;
    const prevSub = activeSub;
    const prevShouldTrack = shouldTrack;
    activeSub = computed2;
    shouldTrack = true;
    try {
      prepareDeps(computed2);
      const value = computed2.fn(computed2._value);
      if (dep.version === 0 || hasChanged(value, computed2._value)) {
        computed2.flags |= 128;
        computed2._value = value;
        dep.version++;
      }
    } catch (err) {
      dep.version++;
      throw err;
    } finally {
      activeSub = prevSub;
      shouldTrack = prevShouldTrack;
      cleanupDeps(computed2);
      computed2.flags &= -3;
    }
  }
  function removeSub(link, soft = false) {
    const { dep, prevSub, nextSub } = link;
    if (prevSub) {
      prevSub.nextSub = nextSub;
      link.prevSub = void 0;
    }
    if (nextSub) {
      nextSub.prevSub = prevSub;
      link.nextSub = void 0;
    }
    if (!!(define_process_env_default$3.NODE_ENV !== "production") && dep.subsHead === link) {
      dep.subsHead = nextSub;
    }
    if (dep.subs === link) {
      dep.subs = prevSub;
      if (!prevSub && dep.computed) {
        dep.computed.flags &= -5;
        for (let l = dep.computed.deps; l; l = l.nextDep) {
          removeSub(l, true);
        }
      }
    }
    if (!soft && !--dep.sc && dep.map) {
      dep.map.delete(dep.key);
    }
  }
  function removeDep(link) {
    const { prevDep, nextDep } = link;
    if (prevDep) {
      prevDep.nextDep = nextDep;
      link.prevDep = void 0;
    }
    if (nextDep) {
      nextDep.prevDep = prevDep;
      link.nextDep = void 0;
    }
  }
  let shouldTrack = true;
  const trackStack = [];
  function pauseTracking() {
    trackStack.push(shouldTrack);
    shouldTrack = false;
  }
  function resetTracking() {
    const last = trackStack.pop();
    shouldTrack = last === void 0 ? true : last;
  }
  function cleanupEffect(e) {
    const { cleanup } = e;
    e.cleanup = void 0;
    if (cleanup) {
      const prevSub = activeSub;
      activeSub = void 0;
      try {
        cleanup();
      } finally {
        activeSub = prevSub;
      }
    }
  }
  let globalVersion = 0;
  class Link {
    constructor(sub, dep) {
      this.sub = sub;
      this.dep = dep;
      this.version = dep.version;
      this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
    }
  }
  class Dep {
    // TODO isolatedDeclarations "__v_skip"
    constructor(computed2) {
      this.computed = computed2;
      this.version = 0;
      this.activeLink = void 0;
      this.subs = void 0;
      this.map = void 0;
      this.key = void 0;
      this.sc = 0;
      this.__v_skip = true;
      if (!!(define_process_env_default$3.NODE_ENV !== "production")) {
        this.subsHead = void 0;
      }
    }
    track(debugInfo) {
      if (!activeSub || !shouldTrack || activeSub === this.computed) {
        return;
      }
      let link = this.activeLink;
      if (link === void 0 || link.sub !== activeSub) {
        link = this.activeLink = new Link(activeSub, this);
        if (!activeSub.deps) {
          activeSub.deps = activeSub.depsTail = link;
        } else {
          link.prevDep = activeSub.depsTail;
          activeSub.depsTail.nextDep = link;
          activeSub.depsTail = link;
        }
        addSub(link);
      } else if (link.version === -1) {
        link.version = this.version;
        if (link.nextDep) {
          const next = link.nextDep;
          next.prevDep = link.prevDep;
          if (link.prevDep) {
            link.prevDep.nextDep = next;
          }
          link.prevDep = activeSub.depsTail;
          link.nextDep = void 0;
          activeSub.depsTail.nextDep = link;
          activeSub.depsTail = link;
          if (activeSub.deps === link) {
            activeSub.deps = next;
          }
        }
      }
      if (!!(define_process_env_default$3.NODE_ENV !== "production") && activeSub.onTrack) {
        activeSub.onTrack(
          extend(
            {
              effect: activeSub
            },
            debugInfo
          )
        );
      }
      return link;
    }
    trigger(debugInfo) {
      this.version++;
      globalVersion++;
      this.notify(debugInfo);
    }
    notify(debugInfo) {
      startBatch();
      try {
        if (!!(define_process_env_default$3.NODE_ENV !== "production")) {
          for (let head = this.subsHead; head; head = head.nextSub) {
            if (head.sub.onTrigger && !(head.sub.flags & 8)) {
              head.sub.onTrigger(
                extend(
                  {
                    effect: head.sub
                  },
                  debugInfo
                )
              );
            }
          }
        }
        for (let link = this.subs; link; link = link.prevSub) {
          if (link.sub.notify()) {
            ;
            link.sub.dep.notify();
          }
        }
      } finally {
        endBatch();
      }
    }
  }
  function addSub(link) {
    link.dep.sc++;
    if (link.sub.flags & 4) {
      const computed2 = link.dep.computed;
      if (computed2 && !link.dep.subs) {
        computed2.flags |= 4 | 16;
        for (let l = computed2.deps; l; l = l.nextDep) {
          addSub(l);
        }
      }
      const currentTail = link.dep.subs;
      if (currentTail !== link) {
        link.prevSub = currentTail;
        if (currentTail) currentTail.nextSub = link;
      }
      if (!!(define_process_env_default$3.NODE_ENV !== "production") && link.dep.subsHead === void 0) {
        link.dep.subsHead = link;
      }
      link.dep.subs = link;
    }
  }
  const targetMap = /* @__PURE__ */ new WeakMap();
  const ITERATE_KEY = /* @__PURE__ */ Symbol(
    !!(define_process_env_default$3.NODE_ENV !== "production") ? "Object iterate" : ""
  );
  const MAP_KEY_ITERATE_KEY = /* @__PURE__ */ Symbol(
    !!(define_process_env_default$3.NODE_ENV !== "production") ? "Map keys iterate" : ""
  );
  const ARRAY_ITERATE_KEY = /* @__PURE__ */ Symbol(
    !!(define_process_env_default$3.NODE_ENV !== "production") ? "Array iterate" : ""
  );
  function track(target, type, key) {
    if (shouldTrack && activeSub) {
      let depsMap = targetMap.get(target);
      if (!depsMap) {
        targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
      }
      let dep = depsMap.get(key);
      if (!dep) {
        depsMap.set(key, dep = new Dep());
        dep.map = depsMap;
        dep.key = key;
      }
      if (!!(define_process_env_default$3.NODE_ENV !== "production")) {
        dep.track({
          target,
          type,
          key
        });
      } else {
        dep.track();
      }
    }
  }
  function trigger(target, type, key, newValue, oldValue, oldTarget) {
    const depsMap = targetMap.get(target);
    if (!depsMap) {
      globalVersion++;
      return;
    }
    const run = (dep) => {
      if (dep) {
        if (!!(define_process_env_default$3.NODE_ENV !== "production")) {
          dep.trigger({
            target,
            type,
            key,
            newValue,
            oldValue,
            oldTarget
          });
        } else {
          dep.trigger();
        }
      }
    };
    startBatch();
    if (type === "clear") {
      depsMap.forEach(run);
    } else {
      const targetIsArray = isArray(target);
      const isArrayIndex = targetIsArray && isIntegerKey(key);
      if (targetIsArray && key === "length") {
        const newLength = Number(newValue);
        depsMap.forEach((dep, key2) => {
          if (key2 === "length" || key2 === ARRAY_ITERATE_KEY || !isSymbol(key2) && key2 >= newLength) {
            run(dep);
          }
        });
      } else {
        if (key !== void 0 || depsMap.has(void 0)) {
          run(depsMap.get(key));
        }
        if (isArrayIndex) {
          run(depsMap.get(ARRAY_ITERATE_KEY));
        }
        switch (type) {
          case "add":
            if (!targetIsArray) {
              run(depsMap.get(ITERATE_KEY));
              if (isMap(target)) {
                run(depsMap.get(MAP_KEY_ITERATE_KEY));
              }
            } else if (isArrayIndex) {
              run(depsMap.get("length"));
            }
            break;
          case "delete":
            if (!targetIsArray) {
              run(depsMap.get(ITERATE_KEY));
              if (isMap(target)) {
                run(depsMap.get(MAP_KEY_ITERATE_KEY));
              }
            }
            break;
          case "set":
            if (isMap(target)) {
              run(depsMap.get(ITERATE_KEY));
            }
            break;
        }
      }
    }
    endBatch();
  }
  function reactiveReadArray(array) {
    const raw = toRaw(array);
    if (raw === array) return raw;
    track(raw, "iterate", ARRAY_ITERATE_KEY);
    return isShallow(array) ? raw : raw.map(toReactive);
  }
  function shallowReadArray(arr) {
    track(arr = toRaw(arr), "iterate", ARRAY_ITERATE_KEY);
    return arr;
  }
  function toWrapped(target, item) {
    if (isReadonly(target)) {
      return isReactive(target) ? toReadonly(toReactive(item)) : toReadonly(item);
    }
    return toReactive(item);
  }
  const arrayInstrumentations = {
    __proto__: null,
    [Symbol.iterator]() {
      return iterator(this, Symbol.iterator, (item) => toWrapped(this, item));
    },
    concat(...args) {
      return reactiveReadArray(this).concat(
        ...args.map((x) => isArray(x) ? reactiveReadArray(x) : x)
      );
    },
    entries() {
      return iterator(this, "entries", (value) => {
        value[1] = toWrapped(this, value[1]);
        return value;
      });
    },
    every(fn, thisArg) {
      return apply(this, "every", fn, thisArg, void 0, arguments);
    },
    filter(fn, thisArg) {
      return apply(
        this,
        "filter",
        fn,
        thisArg,
        (v) => v.map((item) => toWrapped(this, item)),
        arguments
      );
    },
    find(fn, thisArg) {
      return apply(
        this,
        "find",
        fn,
        thisArg,
        (item) => toWrapped(this, item),
        arguments
      );
    },
    findIndex(fn, thisArg) {
      return apply(this, "findIndex", fn, thisArg, void 0, arguments);
    },
    findLast(fn, thisArg) {
      return apply(
        this,
        "findLast",
        fn,
        thisArg,
        (item) => toWrapped(this, item),
        arguments
      );
    },
    findLastIndex(fn, thisArg) {
      return apply(this, "findLastIndex", fn, thisArg, void 0, arguments);
    },
    // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
    forEach(fn, thisArg) {
      return apply(this, "forEach", fn, thisArg, void 0, arguments);
    },
    includes(...args) {
      return searchProxy(this, "includes", args);
    },
    indexOf(...args) {
      return searchProxy(this, "indexOf", args);
    },
    join(separator) {
      return reactiveReadArray(this).join(separator);
    },
    // keys() iterator only reads `length`, no optimization required
    lastIndexOf(...args) {
      return searchProxy(this, "lastIndexOf", args);
    },
    map(fn, thisArg) {
      return apply(this, "map", fn, thisArg, void 0, arguments);
    },
    pop() {
      return noTracking(this, "pop");
    },
    push(...args) {
      return noTracking(this, "push", args);
    },
    reduce(fn, ...args) {
      return reduce(this, "reduce", fn, args);
    },
    reduceRight(fn, ...args) {
      return reduce(this, "reduceRight", fn, args);
    },
    shift() {
      return noTracking(this, "shift");
    },
    // slice could use ARRAY_ITERATE but also seems to beg for range tracking
    some(fn, thisArg) {
      return apply(this, "some", fn, thisArg, void 0, arguments);
    },
    splice(...args) {
      return noTracking(this, "splice", args);
    },
    toReversed() {
      return reactiveReadArray(this).toReversed();
    },
    toSorted(comparer) {
      return reactiveReadArray(this).toSorted(comparer);
    },
    toSpliced(...args) {
      return reactiveReadArray(this).toSpliced(...args);
    },
    unshift(...args) {
      return noTracking(this, "unshift", args);
    },
    values() {
      return iterator(this, "values", (item) => toWrapped(this, item));
    }
  };
  function iterator(self2, method, wrapValue) {
    const arr = shallowReadArray(self2);
    const iter = arr[method]();
    if (arr !== self2 && !isShallow(self2)) {
      iter._next = iter.next;
      iter.next = () => {
        const result = iter._next();
        if (!result.done) {
          result.value = wrapValue(result.value);
        }
        return result;
      };
    }
    return iter;
  }
  const arrayProto = Array.prototype;
  function apply(self2, method, fn, thisArg, wrappedRetFn, args) {
    const arr = shallowReadArray(self2);
    const needsWrap = arr !== self2 && !isShallow(self2);
    const methodFn = arr[method];
    if (methodFn !== arrayProto[method]) {
      const result2 = methodFn.apply(self2, args);
      return needsWrap ? toReactive(result2) : result2;
    }
    let wrappedFn = fn;
    if (arr !== self2) {
      if (needsWrap) {
        wrappedFn = function(item, index) {
          return fn.call(this, toWrapped(self2, item), index, self2);
        };
      } else if (fn.length > 2) {
        wrappedFn = function(item, index) {
          return fn.call(this, item, index, self2);
        };
      }
    }
    const result = methodFn.call(arr, wrappedFn, thisArg);
    return needsWrap && wrappedRetFn ? wrappedRetFn(result) : result;
  }
  function reduce(self2, method, fn, args) {
    const arr = shallowReadArray(self2);
    let wrappedFn = fn;
    if (arr !== self2) {
      if (!isShallow(self2)) {
        wrappedFn = function(acc, item, index) {
          return fn.call(this, acc, toWrapped(self2, item), index, self2);
        };
      } else if (fn.length > 3) {
        wrappedFn = function(acc, item, index) {
          return fn.call(this, acc, item, index, self2);
        };
      }
    }
    return arr[method](wrappedFn, ...args);
  }
  function searchProxy(self2, method, args) {
    const arr = toRaw(self2);
    track(arr, "iterate", ARRAY_ITERATE_KEY);
    const res = arr[method](...args);
    if ((res === -1 || res === false) && isProxy(args[0])) {
      args[0] = toRaw(args[0]);
      return arr[method](...args);
    }
    return res;
  }
  function noTracking(self2, method, args = []) {
    pauseTracking();
    startBatch();
    const res = toRaw(self2)[method].apply(self2, args);
    endBatch();
    resetTracking();
    return res;
  }
  const isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
  const builtInSymbols = new Set(
    /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol)
  );
  function hasOwnProperty(key) {
    if (!isSymbol(key)) key = String(key);
    const obj = toRaw(this);
    track(obj, "has", key);
    return obj.hasOwnProperty(key);
  }
  class BaseReactiveHandler {
    constructor(_isReadonly = false, _isShallow = false) {
      this._isReadonly = _isReadonly;
      this._isShallow = _isShallow;
    }
    get(target, key, receiver) {
      if (key === "__v_skip") return target["__v_skip"];
      const isReadonly2 = this._isReadonly, isShallow2 = this._isShallow;
      if (key === "__v_isReactive") {
        return !isReadonly2;
      } else if (key === "__v_isReadonly") {
        return isReadonly2;
      } else if (key === "__v_isShallow") {
        return isShallow2;
      } else if (key === "__v_raw") {
        if (receiver === (isReadonly2 ? isShallow2 ? shallowReadonlyMap : readonlyMap : isShallow2 ? shallowReactiveMap : reactiveMap).get(target) || // receiver is not the reactive proxy, but has the same prototype
        // this means the receiver is a user proxy of the reactive proxy
        Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) {
          return target;
        }
        return;
      }
      const targetIsArray = isArray(target);
      if (!isReadonly2) {
        let fn;
        if (targetIsArray && (fn = arrayInstrumentations[key])) {
          return fn;
        }
        if (key === "hasOwnProperty") {
          return hasOwnProperty;
        }
      }
      const res = Reflect.get(
        target,
        key,
        // if this is a proxy wrapping a ref, return methods using the raw ref
        // as receiver so that we don't have to call `toRaw` on the ref in all
        // its class methods
        isRef(target) ? target : receiver
      );
      if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
        return res;
      }
      if (!isReadonly2) {
        track(target, "get", key);
      }
      if (isShallow2) {
        return res;
      }
      if (isRef(res)) {
        const value = targetIsArray && isIntegerKey(key) ? res : res.value;
        return isReadonly2 && isObject(value) ? readonly(value) : value;
      }
      if (isObject(res)) {
        return isReadonly2 ? readonly(res) : reactive(res);
      }
      return res;
    }
  }
  class MutableReactiveHandler extends BaseReactiveHandler {
    constructor(isShallow2 = false) {
      super(false, isShallow2);
    }
    set(target, key, value, receiver) {
      let oldValue = target[key];
      const isArrayWithIntegerKey = isArray(target) && isIntegerKey(key);
      if (!this._isShallow) {
        const isOldValueReadonly = isReadonly(oldValue);
        if (!isShallow(value) && !isReadonly(value)) {
          oldValue = toRaw(oldValue);
          value = toRaw(value);
        }
        if (!isArrayWithIntegerKey && isRef(oldValue) && !isRef(value)) {
          if (isOldValueReadonly) {
            if (!!(define_process_env_default$3.NODE_ENV !== "production")) {
              warn$2(
                `Set operation on key "${String(key)}" failed: target is readonly.`,
                target[key]
              );
            }
            return true;
          } else {
            oldValue.value = value;
            return true;
          }
        }
      }
      const hadKey = isArrayWithIntegerKey ? Number(key) < target.length : hasOwn(target, key);
      const result = Reflect.set(
        target,
        key,
        value,
        isRef(target) ? target : receiver
      );
      if (target === toRaw(receiver)) {
        if (!hadKey) {
          trigger(target, "add", key, value);
        } else if (hasChanged(value, oldValue)) {
          trigger(target, "set", key, value, oldValue);
        }
      }
      return result;
    }
    deleteProperty(target, key) {
      const hadKey = hasOwn(target, key);
      const oldValue = target[key];
      const result = Reflect.deleteProperty(target, key);
      if (result && hadKey) {
        trigger(target, "delete", key, void 0, oldValue);
      }
      return result;
    }
    has(target, key) {
      const result = Reflect.has(target, key);
      if (!isSymbol(key) || !builtInSymbols.has(key)) {
        track(target, "has", key);
      }
      return result;
    }
    ownKeys(target) {
      track(
        target,
        "iterate",
        isArray(target) ? "length" : ITERATE_KEY
      );
      return Reflect.ownKeys(target);
    }
  }
  class ReadonlyReactiveHandler extends BaseReactiveHandler {
    constructor(isShallow2 = false) {
      super(true, isShallow2);
    }
    set(target, key) {
      if (!!(define_process_env_default$3.NODE_ENV !== "production")) {
        warn$2(
          `Set operation on key "${String(key)}" failed: target is readonly.`,
          target
        );
      }
      return true;
    }
    deleteProperty(target, key) {
      if (!!(define_process_env_default$3.NODE_ENV !== "production")) {
        warn$2(
          `Delete operation on key "${String(key)}" failed: target is readonly.`,
          target
        );
      }
      return true;
    }
  }
  const mutableHandlers = /* @__PURE__ */ new MutableReactiveHandler();
  const readonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler();
  const shallowReactiveHandlers = /* @__PURE__ */ new MutableReactiveHandler(true);
  const shallowReadonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler(true);
  const toShallow = (value) => value;
  const getProto = (v) => Reflect.getPrototypeOf(v);
  function createIterableMethod(method, isReadonly2, isShallow2) {
    return function(...args) {
      const target = this["__v_raw"];
      const rawTarget = toRaw(target);
      const targetIsMap = isMap(rawTarget);
      const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
      const isKeyOnly = method === "keys" && targetIsMap;
      const innerIterator = target[method](...args);
      const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
      !isReadonly2 && track(
        rawTarget,
        "iterate",
        isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY
      );
      return {
        // iterator protocol
        next() {
          const { value, done } = innerIterator.next();
          return done ? { value, done } : {
            value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
            done
          };
        },
        // iterable protocol
        [Symbol.iterator]() {
          return this;
        }
      };
    };
  }
  function createReadonlyMethod(type) {
    return function(...args) {
      if (!!(define_process_env_default$3.NODE_ENV !== "production")) {
        const key = args[0] ? `on key "${args[0]}" ` : ``;
        warn$2(
          `${capitalize(type)} operation ${key}failed: target is readonly.`,
          toRaw(this)
        );
      }
      return type === "delete" ? false : type === "clear" ? void 0 : this;
    };
  }
  function createInstrumentations(readonly2, shallow) {
    const instrumentations = {
      get(key) {
        const target = this["__v_raw"];
        const rawTarget = toRaw(target);
        const rawKey = toRaw(key);
        if (!readonly2) {
          if (hasChanged(key, rawKey)) {
            track(rawTarget, "get", key);
          }
          track(rawTarget, "get", rawKey);
        }
        const { has } = getProto(rawTarget);
        const wrap = shallow ? toShallow : readonly2 ? toReadonly : toReactive;
        if (has.call(rawTarget, key)) {
          return wrap(target.get(key));
        } else if (has.call(rawTarget, rawKey)) {
          return wrap(target.get(rawKey));
        } else if (target !== rawTarget) {
          target.get(key);
        }
      },
      get size() {
        const target = this["__v_raw"];
        !readonly2 && track(toRaw(target), "iterate", ITERATE_KEY);
        return target.size;
      },
      has(key) {
        const target = this["__v_raw"];
        const rawTarget = toRaw(target);
        const rawKey = toRaw(key);
        if (!readonly2) {
          if (hasChanged(key, rawKey)) {
            track(rawTarget, "has", key);
          }
          track(rawTarget, "has", rawKey);
        }
        return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
      },
      forEach(callback, thisArg) {
        const observed = this;
        const target = observed["__v_raw"];
        const rawTarget = toRaw(target);
        const wrap = shallow ? toShallow : readonly2 ? toReadonly : toReactive;
        !readonly2 && track(rawTarget, "iterate", ITERATE_KEY);
        return target.forEach((value, key) => {
          return callback.call(thisArg, wrap(value), wrap(key), observed);
        });
      }
    };
    extend(
      instrumentations,
      readonly2 ? {
        add: createReadonlyMethod("add"),
        set: createReadonlyMethod("set"),
        delete: createReadonlyMethod("delete"),
        clear: createReadonlyMethod("clear")
      } : {
        add(value) {
          if (!shallow && !isShallow(value) && !isReadonly(value)) {
            value = toRaw(value);
          }
          const target = toRaw(this);
          const proto = getProto(target);
          const hadKey = proto.has.call(target, value);
          if (!hadKey) {
            target.add(value);
            trigger(target, "add", value, value);
          }
          return this;
        },
        set(key, value) {
          if (!shallow && !isShallow(value) && !isReadonly(value)) {
            value = toRaw(value);
          }
          const target = toRaw(this);
          const { has, get } = getProto(target);
          let hadKey = has.call(target, key);
          if (!hadKey) {
            key = toRaw(key);
            hadKey = has.call(target, key);
          } else if (!!(define_process_env_default$3.NODE_ENV !== "production")) {
            checkIdentityKeys(target, has, key);
          }
          const oldValue = get.call(target, key);
          target.set(key, value);
          if (!hadKey) {
            trigger(target, "add", key, value);
          } else if (hasChanged(value, oldValue)) {
            trigger(target, "set", key, value, oldValue);
          }
          return this;
        },
        delete(key) {
          const target = toRaw(this);
          const { has, get } = getProto(target);
          let hadKey = has.call(target, key);
          if (!hadKey) {
            key = toRaw(key);
            hadKey = has.call(target, key);
          } else if (!!(define_process_env_default$3.NODE_ENV !== "production")) {
            checkIdentityKeys(target, has, key);
          }
          const oldValue = get ? get.call(target, key) : void 0;
          const result = target.delete(key);
          if (hadKey) {
            trigger(target, "delete", key, void 0, oldValue);
          }
          return result;
        },
        clear() {
          const target = toRaw(this);
          const hadItems = target.size !== 0;
          const oldTarget = !!(define_process_env_default$3.NODE_ENV !== "production") ? isMap(target) ? new Map(target) : new Set(target) : void 0;
          const result = target.clear();
          if (hadItems) {
            trigger(
              target,
              "clear",
              void 0,
              void 0,
              oldTarget
            );
          }
          return result;
        }
      }
    );
    const iteratorMethods = [
      "keys",
      "values",
      "entries",
      Symbol.iterator
    ];
    iteratorMethods.forEach((method) => {
      instrumentations[method] = createIterableMethod(method, readonly2, shallow);
    });
    return instrumentations;
  }
  function createInstrumentationGetter(isReadonly2, shallow) {
    const instrumentations = createInstrumentations(isReadonly2, shallow);
    return (target, key, receiver) => {
      if (key === "__v_isReactive") {
        return !isReadonly2;
      } else if (key === "__v_isReadonly") {
        return isReadonly2;
      } else if (key === "__v_raw") {
        return target;
      }
      return Reflect.get(
        hasOwn(instrumentations, key) && key in target ? instrumentations : target,
        key,
        receiver
      );
    };
  }
  const mutableCollectionHandlers = {
    get: /* @__PURE__ */ createInstrumentationGetter(false, false)
  };
  const shallowCollectionHandlers = {
    get: /* @__PURE__ */ createInstrumentationGetter(false, true)
  };
  const readonlyCollectionHandlers = {
    get: /* @__PURE__ */ createInstrumentationGetter(true, false)
  };
  const shallowReadonlyCollectionHandlers = {
    get: /* @__PURE__ */ createInstrumentationGetter(true, true)
  };
  function checkIdentityKeys(target, has, key) {
    const rawKey = toRaw(key);
    if (rawKey !== key && has.call(target, rawKey)) {
      const type = toRawType(target);
      warn$2(
        `Reactive ${type} contains both the raw and reactive versions of the same object${type === `Map` ? ` as keys` : ``}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`
      );
    }
  }
  const reactiveMap = /* @__PURE__ */ new WeakMap();
  const shallowReactiveMap = /* @__PURE__ */ new WeakMap();
  const readonlyMap = /* @__PURE__ */ new WeakMap();
  const shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
  function targetTypeMap(rawType) {
    switch (rawType) {
      case "Object":
      case "Array":
        return 1;
      case "Map":
      case "Set":
      case "WeakMap":
      case "WeakSet":
        return 2;
      default:
        return 0;
    }
  }
  function getTargetType(value) {
    return value["__v_skip"] || !Object.isExtensible(value) ? 0 : targetTypeMap(toRawType(value));
  }
  function reactive(target) {
    if (isReadonly(target)) {
      return target;
    }
    return createReactiveObject(
      target,
      false,
      mutableHandlers,
      mutableCollectionHandlers,
      reactiveMap
    );
  }
  function shallowReactive(target) {
    return createReactiveObject(
      target,
      false,
      shallowReactiveHandlers,
      shallowCollectionHandlers,
      shallowReactiveMap
    );
  }
  function readonly(target) {
    return createReactiveObject(
      target,
      true,
      readonlyHandlers,
      readonlyCollectionHandlers,
      readonlyMap
    );
  }
  function shallowReadonly(target) {
    return createReactiveObject(
      target,
      true,
      shallowReadonlyHandlers,
      shallowReadonlyCollectionHandlers,
      shallowReadonlyMap
    );
  }
  function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
    if (!isObject(target)) {
      if (!!(define_process_env_default$3.NODE_ENV !== "production")) {
        warn$2(
          `value cannot be made ${isReadonly2 ? "readonly" : "reactive"}: ${String(
            target
          )}`
        );
      }
      return target;
    }
    if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) {
      return target;
    }
    const targetType = getTargetType(target);
    if (targetType === 0) {
      return target;
    }
    const existingProxy = proxyMap.get(target);
    if (existingProxy) {
      return existingProxy;
    }
    const proxy = new Proxy(
      target,
      targetType === 2 ? collectionHandlers : baseHandlers
    );
    proxyMap.set(target, proxy);
    return proxy;
  }
  function isReactive(value) {
    if (isReadonly(value)) {
      return isReactive(value["__v_raw"]);
    }
    return !!(value && value["__v_isReactive"]);
  }
  function isReadonly(value) {
    return !!(value && value["__v_isReadonly"]);
  }
  function isShallow(value) {
    return !!(value && value["__v_isShallow"]);
  }
  function isProxy(value) {
    return value ? !!value["__v_raw"] : false;
  }
  function toRaw(observed) {
    const raw = observed && observed["__v_raw"];
    return raw ? toRaw(raw) : observed;
  }
  function markRaw(value) {
    if (!hasOwn(value, "__v_skip") && Object.isExtensible(value)) {
      def(value, "__v_skip", true);
    }
    return value;
  }
  const toReactive = (value) => isObject(value) ? reactive(value) : value;
  const toReadonly = (value) => isObject(value) ? readonly(value) : value;
  function isRef(r) {
    return r ? r["__v_isRef"] === true : false;
  }
  function ref(value) {
    return createRef(value, false);
  }
  function createRef(rawValue, shallow) {
    if (isRef(rawValue)) {
      return rawValue;
    }
    return new RefImpl(rawValue, shallow);
  }
  class RefImpl {
    constructor(value, isShallow2) {
      this.dep = new Dep();
      this["__v_isRef"] = true;
      this["__v_isShallow"] = false;
      this._rawValue = isShallow2 ? value : toRaw(value);
      this._value = isShallow2 ? value : toReactive(value);
      this["__v_isShallow"] = isShallow2;
    }
    get value() {
      if (!!(define_process_env_default$3.NODE_ENV !== "production")) {
        this.dep.track({
          target: this,
          type: "get",
          key: "value"
        });
      } else {
        this.dep.track();
      }
      return this._value;
    }
    set value(newValue) {
      const oldValue = this._rawValue;
      const useDirectValue = this["__v_isShallow"] || isShallow(newValue) || isReadonly(newValue);
      newValue = useDirectValue ? newValue : toRaw(newValue);
      if (hasChanged(newValue, oldValue)) {
        this._rawValue = newValue;
        this._value = useDirectValue ? newValue : toReactive(newValue);
        if (!!(define_process_env_default$3.NODE_ENV !== "production")) {
          this.dep.trigger({
            target: this,
            type: "set",
            key: "value",
            newValue,
            oldValue
          });
        } else {
          this.dep.trigger();
        }
      }
    }
  }
  function unref(ref2) {
    return isRef(ref2) ? ref2.value : ref2;
  }
  const shallowUnwrapHandlers = {
    get: (target, key, receiver) => key === "__v_raw" ? target : unref(Reflect.get(target, key, receiver)),
    set: (target, key, value, receiver) => {
      const oldValue = target[key];
      if (isRef(oldValue) && !isRef(value)) {
        oldValue.value = value;
        return true;
      } else {
        return Reflect.set(target, key, value, receiver);
      }
    }
  };
  function proxyRefs(objectWithRefs) {
    return isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
  }
  class ComputedRefImpl {
    constructor(fn, setter, isSSR) {
      this.fn = fn;
      this.setter = setter;
      this._value = void 0;
      this.dep = new Dep(this);
      this.__v_isRef = true;
      this.deps = void 0;
      this.depsTail = void 0;
      this.flags = 16;
      this.globalVersion = globalVersion - 1;
      this.next = void 0;
      this.effect = this;
      this["__v_isReadonly"] = !setter;
      this.isSSR = isSSR;
    }
    /**
     * @internal
     */
    notify() {
      this.flags |= 16;
      if (!(this.flags & 8) && // avoid infinite self recursion
      activeSub !== this) {
        batch(this, true);
        return true;
      }
    }
    get value() {
      const link = !!(define_process_env_default$3.NODE_ENV !== "production") ? this.dep.track({
        target: this,
        type: "get",
        key: "value"
      }) : this.dep.track();
      refreshComputed(this);
      if (link) {
        link.version = this.dep.version;
      }
      return this._value;
    }
    set value(newValue) {
      if (this.setter) {
        this.setter(newValue);
      } else if (!!(define_process_env_default$3.NODE_ENV !== "production")) {
        warn$2("Write operation failed: computed value is readonly");
      }
    }
  }
  function computed$1(getterOrOptions, debugOptions, isSSR = false) {
    let getter;
    let setter;
    if (isFunction(getterOrOptions)) {
      getter = getterOrOptions;
    } else {
      getter = getterOrOptions.get;
      setter = getterOrOptions.set;
    }
    const cRef = new ComputedRefImpl(getter, setter, isSSR);
    return cRef;
  }
  const INITIAL_WATCHER_VALUE = {};
  const cleanupMap = /* @__PURE__ */ new WeakMap();
  let activeWatcher = void 0;
  function onWatcherCleanup(cleanupFn, failSilently = false, owner = activeWatcher) {
    if (owner) {
      let cleanups = cleanupMap.get(owner);
      if (!cleanups) cleanupMap.set(owner, cleanups = []);
      cleanups.push(cleanupFn);
    } else if (!!(define_process_env_default$3.NODE_ENV !== "production") && !failSilently) {
      warn$2(
        `onWatcherCleanup() was called when there was no active watcher to associate with.`
      );
    }
  }
  function watch$1(source, cb, options = EMPTY_OBJ) {
    const { immediate, deep, once, scheduler, augmentJob, call } = options;
    const warnInvalidSource = (s) => {
      (options.onWarn || warn$2)(
        `Invalid watch source: `,
        s,
        `A watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types.`
      );
    };
    const reactiveGetter = (source2) => {
      if (deep) return source2;
      if (isShallow(source2) || deep === false || deep === 0)
        return traverse(source2, 1);
      return traverse(source2);
    };
    let effect2;
    let getter;
    let cleanup;
    let boundCleanup;
    let forceTrigger = false;
    let isMultiSource = false;
    if (isRef(source)) {
      getter = () => source.value;
      forceTrigger = isShallow(source);
    } else if (isReactive(source)) {
      getter = () => reactiveGetter(source);
      forceTrigger = true;
    } else if (isArray(source)) {
      isMultiSource = true;
      forceTrigger = source.some((s) => isReactive(s) || isShallow(s));
      getter = () => source.map((s) => {
        if (isRef(s)) {
          return s.value;
        } else if (isReactive(s)) {
          return reactiveGetter(s);
        } else if (isFunction(s)) {
          return call ? call(s, 2) : s();
        } else {
          !!(define_process_env_default$3.NODE_ENV !== "production") && warnInvalidSource(s);
        }
      });
    } else if (isFunction(source)) {
      if (cb) {
        getter = call ? () => call(source, 2) : source;
      } else {
        getter = () => {
          if (cleanup) {
            pauseTracking();
            try {
              cleanup();
            } finally {
              resetTracking();
            }
          }
          const currentEffect = activeWatcher;
          activeWatcher = effect2;
          try {
            return call ? call(source, 3, [boundCleanup]) : source(boundCleanup);
          } finally {
            activeWatcher = currentEffect;
          }
        };
      }
    } else {
      getter = NOOP;
      !!(define_process_env_default$3.NODE_ENV !== "production") && warnInvalidSource(source);
    }
    if (cb && deep) {
      const baseGetter = getter;
      const depth = deep === true ? Infinity : deep;
      getter = () => traverse(baseGetter(), depth);
    }
    const scope = getCurrentScope();
    const watchHandle = () => {
      effect2.stop();
      if (scope && scope.active) {
        remove(scope.effects, effect2);
      }
    };
    if (once && cb) {
      const _cb = cb;
      cb = (...args) => {
        _cb(...args);
        watchHandle();
      };
    }
    let oldValue = isMultiSource ? new Array(source.length).fill(INITIAL_WATCHER_VALUE) : INITIAL_WATCHER_VALUE;
    const job = (immediateFirstRun) => {
      if (!(effect2.flags & 1) || !effect2.dirty && !immediateFirstRun) {
        return;
      }
      if (cb) {
        const newValue = effect2.run();
        if (deep || forceTrigger || (isMultiSource ? newValue.some((v, i) => hasChanged(v, oldValue[i])) : hasChanged(newValue, oldValue))) {
          if (cleanup) {
            cleanup();
          }
          const currentWatcher = activeWatcher;
          activeWatcher = effect2;
          try {
            const args = [
              newValue,
              // pass undefined as the old value when it's changed for the first time
              oldValue === INITIAL_WATCHER_VALUE ? void 0 : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE ? [] : oldValue,
              boundCleanup
            ];
            oldValue = newValue;
            call ? call(cb, 3, args) : (
              // @ts-expect-error
              cb(...args)
            );
          } finally {
            activeWatcher = currentWatcher;
          }
        }
      } else {
        effect2.run();
      }
    };
    if (augmentJob) {
      augmentJob(job);
    }
    effect2 = new ReactiveEffect(getter);
    effect2.scheduler = scheduler ? () => scheduler(job, false) : job;
    boundCleanup = (fn) => onWatcherCleanup(fn, false, effect2);
    cleanup = effect2.onStop = () => {
      const cleanups = cleanupMap.get(effect2);
      if (cleanups) {
        if (call) {
          call(cleanups, 4);
        } else {
          for (const cleanup2 of cleanups) cleanup2();
        }
        cleanupMap.delete(effect2);
      }
    };
    if (!!(define_process_env_default$3.NODE_ENV !== "production")) {
      effect2.onTrack = options.onTrack;
      effect2.onTrigger = options.onTrigger;
    }
    if (cb) {
      if (immediate) {
        job(true);
      } else {
        oldValue = effect2.run();
      }
    } else if (scheduler) {
      scheduler(job.bind(null, true), true);
    } else {
      effect2.run();
    }
    watchHandle.pause = effect2.pause.bind(effect2);
    watchHandle.resume = effect2.resume.bind(effect2);
    watchHandle.stop = watchHandle;
    return watchHandle;
  }
  function traverse(value, depth = Infinity, seen) {
    if (depth <= 0 || !isObject(value) || value["__v_skip"]) {
      return value;
    }
    seen = seen || /* @__PURE__ */ new Map();
    if ((seen.get(value) || 0) >= depth) {
      return value;
    }
    seen.set(value, depth);
    depth--;
    if (isRef(value)) {
      traverse(value.value, depth, seen);
    } else if (isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        traverse(value[i], depth, seen);
      }
    } else if (isSet(value) || isMap(value)) {
      value.forEach((v) => {
        traverse(v, depth, seen);
      });
    } else if (isPlainObject(value)) {
      for (const key in value) {
        traverse(value[key], depth, seen);
      }
      for (const key of Object.getOwnPropertySymbols(value)) {
        if (Object.prototype.propertyIsEnumerable.call(value, key)) {
          traverse(value[key], depth, seen);
        }
      }
    }
    return value;
  }
  var define_process_env_default$2 = {};
  const stack = [];
  function pushWarningContext(vnode) {
    stack.push(vnode);
  }
  function popWarningContext() {
    stack.pop();
  }
  let isWarning = false;
  function warn$1(msg, ...args) {
    if (isWarning) return;
    isWarning = true;
    pauseTracking();
    const instance = stack.length ? stack[stack.length - 1].component : null;
    const appWarnHandler = instance && instance.appContext.config.warnHandler;
    const trace = getComponentTrace();
    if (appWarnHandler) {
      callWithErrorHandling(
        appWarnHandler,
        instance,
        11,
        [
          // eslint-disable-next-line no-restricted-syntax
          msg + args.map((a) => {
            var _a, _b;
            return (_b = (_a = a.toString) == null ? void 0 : _a.call(a)) != null ? _b : JSON.stringify(a);
          }).join(""),
          instance && instance.proxy,
          trace.map(
            ({ vnode }) => `at <${formatComponentName(instance, vnode.type)}>`
          ).join("\n"),
          trace
        ]
      );
    } else {
      const warnArgs = [`[Vue warn]: ${msg}`, ...args];
      if (trace.length && // avoid spamming console during tests
      true) {
        warnArgs.push(`
`, ...formatTrace(trace));
      }
      console.warn(...warnArgs);
    }
    resetTracking();
    isWarning = false;
  }
  function getComponentTrace() {
    let currentVNode = stack[stack.length - 1];
    if (!currentVNode) {
      return [];
    }
    const normalizedStack = [];
    while (currentVNode) {
      const last = normalizedStack[0];
      if (last && last.vnode === currentVNode) {
        last.recurseCount++;
      } else {
        normalizedStack.push({
          vnode: currentVNode,
          recurseCount: 0
        });
      }
      const parentInstance = currentVNode.component && currentVNode.component.parent;
      currentVNode = parentInstance && parentInstance.vnode;
    }
    return normalizedStack;
  }
  function formatTrace(trace) {
    const logs = [];
    trace.forEach((entry, i) => {
      logs.push(...i === 0 ? [] : [`
`], ...formatTraceEntry(entry));
    });
    return logs;
  }
  function formatTraceEntry({ vnode, recurseCount }) {
    const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
    const isRoot = vnode.component ? vnode.component.parent == null : false;
    const open = ` at <${formatComponentName(
      vnode.component,
      vnode.type,
      isRoot
    )}`;
    const close = `>` + postfix;
    return vnode.props ? [open, ...formatProps(vnode.props), close] : [open + close];
  }
  function formatProps(props) {
    const res = [];
    const keys = Object.keys(props);
    keys.slice(0, 3).forEach((key) => {
      res.push(...formatProp(key, props[key]));
    });
    if (keys.length > 3) {
      res.push(` ...`);
    }
    return res;
  }
  function formatProp(key, value, raw) {
    if (isString(value)) {
      value = JSON.stringify(value);
      return raw ? value : [`${key}=${value}`];
    } else if (typeof value === "number" || typeof value === "boolean" || value == null) {
      return raw ? value : [`${key}=${value}`];
    } else if (isRef(value)) {
      value = formatProp(key, toRaw(value.value), true);
      return raw ? value : [`${key}=Ref<`, value, `>`];
    } else if (isFunction(value)) {
      return [`${key}=fn${value.name ? `<${value.name}>` : ``}`];
    } else {
      value = toRaw(value);
      return raw ? value : [`${key}=`, value];
    }
  }
  const ErrorTypeStrings$1 = {
    ["sp"]: "serverPrefetch hook",
    ["bc"]: "beforeCreate hook",
    ["c"]: "created hook",
    ["bm"]: "beforeMount hook",
    ["m"]: "mounted hook",
    ["bu"]: "beforeUpdate hook",
    ["u"]: "updated",
    ["bum"]: "beforeUnmount hook",
    ["um"]: "unmounted hook",
    ["a"]: "activated hook",
    ["da"]: "deactivated hook",
    ["ec"]: "errorCaptured hook",
    ["rtc"]: "renderTracked hook",
    ["rtg"]: "renderTriggered hook",
    [0]: "setup function",
    [1]: "render function",
    [2]: "watcher getter",
    [3]: "watcher callback",
    [4]: "watcher cleanup function",
    [5]: "native event handler",
    [6]: "component event handler",
    [7]: "vnode hook",
    [8]: "directive hook",
    [9]: "transition hook",
    [10]: "app errorHandler",
    [11]: "app warnHandler",
    [12]: "ref function",
    [13]: "async component loader",
    [14]: "scheduler flush",
    [15]: "component update",
    [16]: "app unmount cleanup function"
  };
  function callWithErrorHandling(fn, instance, type, args) {
    try {
      return args ? fn(...args) : fn();
    } catch (err) {
      handleError(err, instance, type);
    }
  }
  function callWithAsyncErrorHandling(fn, instance, type, args) {
    if (isFunction(fn)) {
      const res = callWithErrorHandling(fn, instance, type, args);
      if (res && isPromise(res)) {
        res.catch((err) => {
          handleError(err, instance, type);
        });
      }
      return res;
    }
    if (isArray(fn)) {
      const values = [];
      for (let i = 0; i < fn.length; i++) {
        values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
      }
      return values;
    } else if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
      warn$1(
        `Invalid value type passed to callWithAsyncErrorHandling(): ${typeof fn}`
      );
    }
  }
  function handleError(err, instance, type, throwInDev = true) {
    const contextVNode = instance ? instance.vnode : null;
    const { errorHandler, throwUnhandledErrorInProduction } = instance && instance.appContext.config || EMPTY_OBJ;
    if (instance) {
      let cur = instance.parent;
      const exposedInstance = instance.proxy;
      const errorInfo = !!(define_process_env_default$2.NODE_ENV !== "production") ? ErrorTypeStrings$1[type] : `https://vuejs.org/error-reference/#runtime-${type}`;
      while (cur) {
        const errorCapturedHooks = cur.ec;
        if (errorCapturedHooks) {
          for (let i = 0; i < errorCapturedHooks.length; i++) {
            if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) {
              return;
            }
          }
        }
        cur = cur.parent;
      }
      if (errorHandler) {
        pauseTracking();
        callWithErrorHandling(errorHandler, null, 10, [
          err,
          exposedInstance,
          errorInfo
        ]);
        resetTracking();
        return;
      }
    }
    logError(err, type, contextVNode, throwInDev, throwUnhandledErrorInProduction);
  }
  function logError(err, type, contextVNode, throwInDev = true, throwInProd = false) {
    if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
      const info = ErrorTypeStrings$1[type];
      if (contextVNode) {
        pushWarningContext(contextVNode);
      }
      warn$1(`Unhandled error${info ? ` during execution of ${info}` : ``}`);
      if (contextVNode) {
        popWarningContext();
      }
      if (throwInDev) {
        throw err;
      } else {
        console.error(err);
      }
    } else if (throwInProd) {
      throw err;
    } else {
      console.error(err);
    }
  }
  const queue = [];
  let flushIndex = -1;
  const pendingPostFlushCbs = [];
  let activePostFlushCbs = null;
  let postFlushIndex = 0;
  const resolvedPromise = /* @__PURE__ */ Promise.resolve();
  let currentFlushPromise = null;
  const RECURSION_LIMIT = 100;
  function nextTick(fn) {
    const p2 = currentFlushPromise || resolvedPromise;
    return fn ? p2.then(this ? fn.bind(this) : fn) : p2;
  }
  function findInsertionIndex(id) {
    let start = flushIndex + 1;
    let end = queue.length;
    while (start < end) {
      const middle = start + end >>> 1;
      const middleJob = queue[middle];
      const middleJobId = getId(middleJob);
      if (middleJobId < id || middleJobId === id && middleJob.flags & 2) {
        start = middle + 1;
      } else {
        end = middle;
      }
    }
    return start;
  }
  function queueJob(job) {
    if (!(job.flags & 1)) {
      const jobId = getId(job);
      const lastJob = queue[queue.length - 1];
      if (!lastJob || // fast path when the job id is larger than the tail
      !(job.flags & 2) && jobId >= getId(lastJob)) {
        queue.push(job);
      } else {
        queue.splice(findInsertionIndex(jobId), 0, job);
      }
      job.flags |= 1;
      queueFlush();
    }
  }
  function queueFlush() {
    if (!currentFlushPromise) {
      currentFlushPromise = resolvedPromise.then(flushJobs);
    }
  }
  function queuePostFlushCb(cb) {
    if (!isArray(cb)) {
      if (activePostFlushCbs && cb.id === -1) {
        activePostFlushCbs.splice(postFlushIndex + 1, 0, cb);
      } else if (!(cb.flags & 1)) {
        pendingPostFlushCbs.push(cb);
        cb.flags |= 1;
      }
    } else {
      pendingPostFlushCbs.push(...cb);
    }
    queueFlush();
  }
  function flushPreFlushCbs(instance, seen, i = flushIndex + 1) {
    if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
      seen = seen || /* @__PURE__ */ new Map();
    }
    for (; i < queue.length; i++) {
      const cb = queue[i];
      if (cb && cb.flags & 2) {
        if (instance && cb.id !== instance.uid) {
          continue;
        }
        if (!!(define_process_env_default$2.NODE_ENV !== "production") && checkRecursiveUpdates(seen, cb)) {
          continue;
        }
        queue.splice(i, 1);
        i--;
        if (cb.flags & 4) {
          cb.flags &= -2;
        }
        cb();
        if (!(cb.flags & 4)) {
          cb.flags &= -2;
        }
      }
    }
  }
  function flushPostFlushCbs(seen) {
    if (pendingPostFlushCbs.length) {
      const deduped = [...new Set(pendingPostFlushCbs)].sort(
        (a, b) => getId(a) - getId(b)
      );
      pendingPostFlushCbs.length = 0;
      if (activePostFlushCbs) {
        activePostFlushCbs.push(...deduped);
        return;
      }
      activePostFlushCbs = deduped;
      if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
        seen = seen || /* @__PURE__ */ new Map();
      }
      for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
        const cb = activePostFlushCbs[postFlushIndex];
        if (!!(define_process_env_default$2.NODE_ENV !== "production") && checkRecursiveUpdates(seen, cb)) {
          continue;
        }
        if (cb.flags & 4) {
          cb.flags &= -2;
        }
        if (!(cb.flags & 8)) cb();
        cb.flags &= -2;
      }
      activePostFlushCbs = null;
      postFlushIndex = 0;
    }
  }
  const getId = (job) => job.id == null ? job.flags & 2 ? -1 : Infinity : job.id;
  function flushJobs(seen) {
    if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
      seen = seen || /* @__PURE__ */ new Map();
    }
    const check = !!(define_process_env_default$2.NODE_ENV !== "production") ? (job) => checkRecursiveUpdates(seen, job) : NOOP;
    try {
      for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
        const job = queue[flushIndex];
        if (job && !(job.flags & 8)) {
          if (!!(define_process_env_default$2.NODE_ENV !== "production") && check(job)) {
            continue;
          }
          if (job.flags & 4) {
            job.flags &= ~1;
          }
          callWithErrorHandling(
            job,
            job.i,
            job.i ? 15 : 14
          );
          if (!(job.flags & 4)) {
            job.flags &= ~1;
          }
        }
      }
    } finally {
      for (; flushIndex < queue.length; flushIndex++) {
        const job = queue[flushIndex];
        if (job) {
          job.flags &= -2;
        }
      }
      flushIndex = -1;
      queue.length = 0;
      flushPostFlushCbs(seen);
      currentFlushPromise = null;
      if (queue.length || pendingPostFlushCbs.length) {
        flushJobs(seen);
      }
    }
  }
  function checkRecursiveUpdates(seen, fn) {
    const count = seen.get(fn) || 0;
    if (count > RECURSION_LIMIT) {
      const instance = fn.i;
      const componentName = instance && getComponentName(instance.type);
      handleError(
        `Maximum recursive updates exceeded${componentName ? ` in component <${componentName}>` : ``}. This means you have a reactive effect that is mutating its own dependencies and thus recursively triggering itself. Possible sources include component template, render function, updated hook or watcher source function.`,
        null,
        10
      );
      return true;
    }
    seen.set(fn, count + 1);
    return false;
  }
  let isHmrUpdating = false;
  const hmrDirtyComponents = /* @__PURE__ */ new Map();
  if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
    getGlobalThis().__VUE_HMR_RUNTIME__ = {
      createRecord: tryWrap(createRecord),
      rerender: tryWrap(rerender),
      reload: tryWrap(reload)
    };
  }
  const map = /* @__PURE__ */ new Map();
  function registerHMR(instance) {
    const id = instance.type.__hmrId;
    let record = map.get(id);
    if (!record) {
      createRecord(id, instance.type);
      record = map.get(id);
    }
    record.instances.add(instance);
  }
  function unregisterHMR(instance) {
    map.get(instance.type.__hmrId).instances.delete(instance);
  }
  function createRecord(id, initialDef) {
    if (map.has(id)) {
      return false;
    }
    map.set(id, {
      initialDef: normalizeClassComponent(initialDef),
      instances: /* @__PURE__ */ new Set()
    });
    return true;
  }
  function normalizeClassComponent(component) {
    return isClassComponent(component) ? component.__vccOpts : component;
  }
  function rerender(id, newRender) {
    const record = map.get(id);
    if (!record) {
      return;
    }
    record.initialDef.render = newRender;
    [...record.instances].forEach((instance) => {
      if (newRender) {
        instance.render = newRender;
        normalizeClassComponent(instance.type).render = newRender;
      }
      instance.renderCache = [];
      isHmrUpdating = true;
      if (!(instance.job.flags & 8)) {
        instance.update();
      }
      isHmrUpdating = false;
    });
  }
  function reload(id, newComp) {
    const record = map.get(id);
    if (!record) return;
    newComp = normalizeClassComponent(newComp);
    updateComponentDef(record.initialDef, newComp);
    const instances = [...record.instances];
    for (let i = 0; i < instances.length; i++) {
      const instance = instances[i];
      const oldComp = normalizeClassComponent(instance.type);
      let dirtyInstances = hmrDirtyComponents.get(oldComp);
      if (!dirtyInstances) {
        if (oldComp !== record.initialDef) {
          updateComponentDef(oldComp, newComp);
        }
        hmrDirtyComponents.set(oldComp, dirtyInstances = /* @__PURE__ */ new Set());
      }
      dirtyInstances.add(instance);
      instance.appContext.propsCache.delete(instance.type);
      instance.appContext.emitsCache.delete(instance.type);
      instance.appContext.optionsCache.delete(instance.type);
      if (instance.ceReload) {
        dirtyInstances.add(instance);
        instance.ceReload(newComp.styles);
        dirtyInstances.delete(instance);
      } else if (instance.parent) {
        queueJob(() => {
          if (!(instance.job.flags & 8)) {
            isHmrUpdating = true;
            instance.parent.update();
            isHmrUpdating = false;
            dirtyInstances.delete(instance);
          }
        });
      } else if (instance.appContext.reload) {
        instance.appContext.reload();
      } else if (typeof window !== "undefined") {
        window.location.reload();
      } else {
        console.warn(
          "[HMR] Root or manually mounted instance modified. Full reload required."
        );
      }
      if (instance.root.ce && instance !== instance.root) {
        instance.root.ce._removeChildStyle(oldComp);
      }
    }
    queuePostFlushCb(() => {
      hmrDirtyComponents.clear();
    });
  }
  function updateComponentDef(oldComp, newComp) {
    extend(oldComp, newComp);
    for (const key in oldComp) {
      if (key !== "__file" && !(key in newComp)) {
        delete oldComp[key];
      }
    }
  }
  function tryWrap(fn) {
    return (id, arg) => {
      try {
        return fn(id, arg);
      } catch (e) {
        console.error(e);
        console.warn(
          `[HMR] Something went wrong during Vue component hot-reload. Full reload required.`
        );
      }
    };
  }
  let devtools$1;
  let buffer = [];
  let devtoolsNotInstalled = false;
  function emit$1(event, ...args) {
    if (devtools$1) {
      devtools$1.emit(event, ...args);
    } else if (!devtoolsNotInstalled) {
      buffer.push({ event, args });
    }
  }
  function setDevtoolsHook$1(hook, target) {
    var _a, _b;
    devtools$1 = hook;
    if (devtools$1) {
      devtools$1.enabled = true;
      buffer.forEach(({ event, args }) => devtools$1.emit(event, ...args));
      buffer = [];
    } else if (
      // handle late devtools injection - only do this if we are in an actual
      // browser environment to avoid the timer handle stalling test runner exit
      // (#4815)
      typeof window !== "undefined" && // some envs mock window but not fully
      window.HTMLElement && // also exclude jsdom
      // eslint-disable-next-line no-restricted-syntax
      !((_b = (_a = window.navigator) == null ? void 0 : _a.userAgent) == null ? void 0 : _b.includes("jsdom"))
    ) {
      const replay = target.__VUE_DEVTOOLS_HOOK_REPLAY__ = target.__VUE_DEVTOOLS_HOOK_REPLAY__ || [];
      replay.push((newHook) => {
        setDevtoolsHook$1(newHook, target);
      });
      setTimeout(() => {
        if (!devtools$1) {
          target.__VUE_DEVTOOLS_HOOK_REPLAY__ = null;
          devtoolsNotInstalled = true;
          buffer = [];
        }
      }, 3e3);
    } else {
      devtoolsNotInstalled = true;
      buffer = [];
    }
  }
  function devtoolsInitApp(app, version2) {
    emit$1("app:init", app, version2, {
      Fragment,
      Text,
      Comment,
      Static
    });
  }
  function devtoolsUnmountApp(app) {
    emit$1("app:unmount", app);
  }
  const devtoolsComponentAdded = /* @__PURE__ */ createDevtoolsComponentHook(
    "component:added"
    /* COMPONENT_ADDED */
  );
  const devtoolsComponentUpdated = /* @__PURE__ */ createDevtoolsComponentHook(
    "component:updated"
    /* COMPONENT_UPDATED */
  );
  const _devtoolsComponentRemoved = /* @__PURE__ */ createDevtoolsComponentHook(
    "component:removed"
    /* COMPONENT_REMOVED */
  );
  const devtoolsComponentRemoved = (component) => {
    if (devtools$1 && typeof devtools$1.cleanupBuffer === "function" && // remove the component if it wasn't buffered
    !devtools$1.cleanupBuffer(component)) {
      _devtoolsComponentRemoved(component);
    }
  };
  // @__NO_SIDE_EFFECTS__
  function createDevtoolsComponentHook(hook) {
    return (component) => {
      emit$1(
        hook,
        component.appContext.app,
        component.uid,
        component.parent ? component.parent.uid : void 0,
        component
      );
    };
  }
  const devtoolsPerfStart = /* @__PURE__ */ createDevtoolsPerformanceHook(
    "perf:start"
    /* PERFORMANCE_START */
  );
  const devtoolsPerfEnd = /* @__PURE__ */ createDevtoolsPerformanceHook(
    "perf:end"
    /* PERFORMANCE_END */
  );
  function createDevtoolsPerformanceHook(hook) {
    return (component, type, time) => {
      emit$1(hook, component.appContext.app, component.uid, component, type, time);
    };
  }
  function devtoolsComponentEmit(component, event, params) {
    emit$1(
      "component:emit",
      component.appContext.app,
      component,
      event,
      params
    );
  }
  let currentRenderingInstance = null;
  let currentScopeId = null;
  function setCurrentRenderingInstance(instance) {
    const prev = currentRenderingInstance;
    currentRenderingInstance = instance;
    currentScopeId = instance && instance.type.__scopeId || null;
    return prev;
  }
  function withCtx(fn, ctx = currentRenderingInstance, isNonScopedSlot) {
    if (!ctx) return fn;
    if (fn._n) {
      return fn;
    }
    const renderFnWithContext = (...args) => {
      if (renderFnWithContext._d) {
        setBlockTracking(-1);
      }
      const prevInstance = setCurrentRenderingInstance(ctx);
      let res;
      try {
        res = fn(...args);
      } finally {
        setCurrentRenderingInstance(prevInstance);
        if (renderFnWithContext._d) {
          setBlockTracking(1);
        }
      }
      if (!!(define_process_env_default$2.NODE_ENV !== "production") || false) {
        devtoolsComponentUpdated(ctx);
      }
      return res;
    };
    renderFnWithContext._n = true;
    renderFnWithContext._c = true;
    renderFnWithContext._d = true;
    return renderFnWithContext;
  }
  function validateDirectiveName(name) {
    if (isBuiltInDirective(name)) {
      warn$1("Do not use built-in directive ids as custom directive id: " + name);
    }
  }
  function withDirectives(vnode, directives) {
    if (currentRenderingInstance === null) {
      !!(define_process_env_default$2.NODE_ENV !== "production") && warn$1(`withDirectives can only be used inside render functions.`);
      return vnode;
    }
    const instance = getComponentPublicInstance(currentRenderingInstance);
    const bindings = vnode.dirs || (vnode.dirs = []);
    for (let i = 0; i < directives.length; i++) {
      let [dir, value, arg, modifiers = EMPTY_OBJ] = directives[i];
      if (dir) {
        if (isFunction(dir)) {
          dir = {
            mounted: dir,
            updated: dir
          };
        }
        if (dir.deep) {
          traverse(value);
        }
        bindings.push({
          dir,
          instance,
          value,
          oldValue: void 0,
          arg,
          modifiers
        });
      }
    }
    return vnode;
  }
  function invokeDirectiveHook(vnode, prevVNode, instance, name) {
    const bindings = vnode.dirs;
    const oldBindings = prevVNode && prevVNode.dirs;
    for (let i = 0; i < bindings.length; i++) {
      const binding = bindings[i];
      if (oldBindings) {
        binding.oldValue = oldBindings[i].value;
      }
      let hook = binding.dir[name];
      if (hook) {
        pauseTracking();
        callWithAsyncErrorHandling(hook, instance, 8, [
          vnode.el,
          binding,
          vnode,
          prevVNode
        ]);
        resetTracking();
      }
    }
  }
  function provide(key, value) {
    if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
      if (!currentInstance || currentInstance.isMounted) {
        warn$1(`provide() can only be used inside setup().`);
      }
    }
    if (currentInstance) {
      let provides = currentInstance.provides;
      const parentProvides = currentInstance.parent && currentInstance.parent.provides;
      if (parentProvides === provides) {
        provides = currentInstance.provides = Object.create(parentProvides);
      }
      provides[key] = value;
    }
  }
  function inject(key, defaultValue, treatDefaultAsFactory = false) {
    const instance = getCurrentInstance();
    if (instance || currentApp) {
      let provides = currentApp ? currentApp._context.provides : instance ? instance.parent == null || instance.ce ? instance.vnode.appContext && instance.vnode.appContext.provides : instance.parent.provides : void 0;
      if (provides && key in provides) {
        return provides[key];
      } else if (arguments.length > 1) {
        return treatDefaultAsFactory && isFunction(defaultValue) ? defaultValue.call(instance && instance.proxy) : defaultValue;
      } else if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
        warn$1(`injection "${String(key)}" not found.`);
      }
    } else if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
      warn$1(`inject() can only be used inside setup() or functional components.`);
    }
  }
  const ssrContextKey = /* @__PURE__ */ Symbol.for("v-scx");
  const useSSRContext = () => {
    {
      const ctx = inject(ssrContextKey);
      if (!ctx) {
        !!(define_process_env_default$2.NODE_ENV !== "production") && warn$1(
          `Server rendering context not provided. Make sure to only call useSSRContext() conditionally in the server build.`
        );
      }
      return ctx;
    }
  };
  function watch(source, cb, options) {
    if (!!(define_process_env_default$2.NODE_ENV !== "production") && !isFunction(cb)) {
      warn$1(
        `\`watch(fn, options?)\` signature has been moved to a separate API. Use \`watchEffect(fn, options?)\` instead. \`watch\` now only supports \`watch(source, cb, options?) signature.`
      );
    }
    return doWatch(source, cb, options);
  }
  function doWatch(source, cb, options = EMPTY_OBJ) {
    const { immediate, deep, flush, once } = options;
    if (!!(define_process_env_default$2.NODE_ENV !== "production") && !cb) {
      if (immediate !== void 0) {
        warn$1(
          `watch() "immediate" option is only respected when using the watch(source, callback, options?) signature.`
        );
      }
      if (deep !== void 0) {
        warn$1(
          `watch() "deep" option is only respected when using the watch(source, callback, options?) signature.`
        );
      }
      if (once !== void 0) {
        warn$1(
          `watch() "once" option is only respected when using the watch(source, callback, options?) signature.`
        );
      }
    }
    const baseWatchOptions = extend({}, options);
    if (!!(define_process_env_default$2.NODE_ENV !== "production")) baseWatchOptions.onWarn = warn$1;
    const runsImmediately = cb && immediate || !cb && flush !== "post";
    let ssrCleanup;
    if (isInSSRComponentSetup) {
      if (flush === "sync") {
        const ctx = useSSRContext();
        ssrCleanup = ctx.__watcherHandles || (ctx.__watcherHandles = []);
      } else if (!runsImmediately) {
        const watchStopHandle = () => {
        };
        watchStopHandle.stop = NOOP;
        watchStopHandle.resume = NOOP;
        watchStopHandle.pause = NOOP;
        return watchStopHandle;
      }
    }
    const instance = currentInstance;
    baseWatchOptions.call = (fn, type, args) => callWithAsyncErrorHandling(fn, instance, type, args);
    let isPre = false;
    if (flush === "post") {
      baseWatchOptions.scheduler = (job) => {
        queuePostRenderEffect(job, instance && instance.suspense);
      };
    } else if (flush !== "sync") {
      isPre = true;
      baseWatchOptions.scheduler = (job, isFirstRun) => {
        if (isFirstRun) {
          job();
        } else {
          queueJob(job);
        }
      };
    }
    baseWatchOptions.augmentJob = (job) => {
      if (cb) {
        job.flags |= 4;
      }
      if (isPre) {
        job.flags |= 2;
        if (instance) {
          job.id = instance.uid;
          job.i = instance;
        }
      }
    };
    const watchHandle = watch$1(source, cb, baseWatchOptions);
    if (isInSSRComponentSetup) {
      if (ssrCleanup) {
        ssrCleanup.push(watchHandle);
      } else if (runsImmediately) {
        watchHandle();
      }
    }
    return watchHandle;
  }
  function instanceWatch(source, value, options) {
    const publicThis = this.proxy;
    const getter = isString(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
    let cb;
    if (isFunction(value)) {
      cb = value;
    } else {
      cb = value.handler;
      options = value;
    }
    const reset = setCurrentInstance(this);
    const res = doWatch(getter, cb.bind(publicThis), options);
    reset();
    return res;
  }
  function createPathGetter(ctx, path) {
    const segments = path.split(".");
    return () => {
      let cur = ctx;
      for (let i = 0; i < segments.length && cur; i++) {
        cur = cur[segments[i]];
      }
      return cur;
    };
  }
  const TeleportEndKey = /* @__PURE__ */ Symbol("_vte");
  const isTeleport = (type) => type.__isTeleport;
  const leaveCbKey = /* @__PURE__ */ Symbol("_leaveCb");
  function setTransitionHooks(vnode, hooks) {
    if (vnode.shapeFlag & 6 && vnode.component) {
      vnode.transition = hooks;
      setTransitionHooks(vnode.component.subTree, hooks);
    } else if (vnode.shapeFlag & 128) {
      vnode.ssContent.transition = hooks.clone(vnode.ssContent);
      vnode.ssFallback.transition = hooks.clone(vnode.ssFallback);
    } else {
      vnode.transition = hooks;
    }
  }
  function markAsyncBoundary(instance) {
    instance.ids = [instance.ids[0] + instance.ids[2]++ + "-", 0, 0];
  }
  const knownTemplateRefs = /* @__PURE__ */ new WeakSet();
  const pendingSetRefMap = /* @__PURE__ */ new WeakMap();
  function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
    if (isArray(rawRef)) {
      rawRef.forEach(
        (r, i) => setRef(
          r,
          oldRawRef && (isArray(oldRawRef) ? oldRawRef[i] : oldRawRef),
          parentSuspense,
          vnode,
          isUnmount
        )
      );
      return;
    }
    if (isAsyncWrapper(vnode) && !isUnmount) {
      if (vnode.shapeFlag & 512 && vnode.type.__asyncResolved && vnode.component.subTree.component) {
        setRef(rawRef, oldRawRef, parentSuspense, vnode.component.subTree);
      }
      return;
    }
    const refValue = vnode.shapeFlag & 4 ? getComponentPublicInstance(vnode.component) : vnode.el;
    const value = isUnmount ? null : refValue;
    const { i: owner, r: ref3 } = rawRef;
    if (!!(define_process_env_default$2.NODE_ENV !== "production") && !owner) {
      warn$1(
        `Missing ref owner context. ref cannot be used on hoisted vnodes. A vnode with ref must be created inside the render function.`
      );
      return;
    }
    const oldRef = oldRawRef && oldRawRef.r;
    const refs = owner.refs === EMPTY_OBJ ? owner.refs = {} : owner.refs;
    const setupState = owner.setupState;
    const rawSetupState = toRaw(setupState);
    const canSetSetupRef = setupState === EMPTY_OBJ ? NO : (key) => {
      if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
        if (hasOwn(rawSetupState, key) && !isRef(rawSetupState[key])) {
          warn$1(
            `Template ref "${key}" used on a non-ref value. It will not work in the production build.`
          );
        }
        if (knownTemplateRefs.has(rawSetupState[key])) {
          return false;
        }
      }
      return hasOwn(rawSetupState, key);
    };
    const canSetRef = (ref22) => {
      return !!!(define_process_env_default$2.NODE_ENV !== "production") || !knownTemplateRefs.has(ref22);
    };
    if (oldRef != null && oldRef !== ref3) {
      invalidatePendingSetRef(oldRawRef);
      if (isString(oldRef)) {
        refs[oldRef] = null;
        if (canSetSetupRef(oldRef)) {
          setupState[oldRef] = null;
        }
      } else if (isRef(oldRef)) {
        if (canSetRef(oldRef)) {
          oldRef.value = null;
        }
        const oldRawRefAtom = oldRawRef;
        if (oldRawRefAtom.k) refs[oldRawRefAtom.k] = null;
      }
    }
    if (isFunction(ref3)) {
      callWithErrorHandling(ref3, owner, 12, [value, refs]);
    } else {
      const _isString = isString(ref3);
      const _isRef = isRef(ref3);
      if (_isString || _isRef) {
        const doSet = () => {
          if (rawRef.f) {
            const existing = _isString ? canSetSetupRef(ref3) ? setupState[ref3] : refs[ref3] : canSetRef(ref3) || !rawRef.k ? ref3.value : refs[rawRef.k];
            if (isUnmount) {
              isArray(existing) && remove(existing, refValue);
            } else {
              if (!isArray(existing)) {
                if (_isString) {
                  refs[ref3] = [refValue];
                  if (canSetSetupRef(ref3)) {
                    setupState[ref3] = refs[ref3];
                  }
                } else {
                  const newVal = [refValue];
                  if (canSetRef(ref3)) {
                    ref3.value = newVal;
                  }
                  if (rawRef.k) refs[rawRef.k] = newVal;
                }
              } else if (!existing.includes(refValue)) {
                existing.push(refValue);
              }
            }
          } else if (_isString) {
            refs[ref3] = value;
            if (canSetSetupRef(ref3)) {
              setupState[ref3] = value;
            }
          } else if (_isRef) {
            if (canSetRef(ref3)) {
              ref3.value = value;
            }
            if (rawRef.k) refs[rawRef.k] = value;
          } else if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
            warn$1("Invalid template ref type:", ref3, `(${typeof ref3})`);
          }
        };
        if (value) {
          const job = () => {
            doSet();
            pendingSetRefMap.delete(rawRef);
          };
          job.id = -1;
          pendingSetRefMap.set(rawRef, job);
          queuePostRenderEffect(job, parentSuspense);
        } else {
          invalidatePendingSetRef(rawRef);
          doSet();
        }
      } else if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
        warn$1("Invalid template ref type:", ref3, `(${typeof ref3})`);
      }
    }
  }
  function invalidatePendingSetRef(rawRef) {
    const pendingSetRef = pendingSetRefMap.get(rawRef);
    if (pendingSetRef) {
      pendingSetRef.flags |= 8;
      pendingSetRefMap.delete(rawRef);
    }
  }
  getGlobalThis().requestIdleCallback || ((cb) => setTimeout(cb, 1));
  getGlobalThis().cancelIdleCallback || ((id) => clearTimeout(id));
  const isAsyncWrapper = (i) => !!i.type.__asyncLoader;
  const isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
  function onActivated(hook, target) {
    registerKeepAliveHook(hook, "a", target);
  }
  function onDeactivated(hook, target) {
    registerKeepAliveHook(hook, "da", target);
  }
  function registerKeepAliveHook(hook, type, target = currentInstance) {
    const wrappedHook = hook.__wdc || (hook.__wdc = () => {
      let current = target;
      while (current) {
        if (current.isDeactivated) {
          return;
        }
        current = current.parent;
      }
      return hook();
    });
    injectHook(type, wrappedHook, target);
    if (target) {
      let current = target.parent;
      while (current && current.parent) {
        if (isKeepAlive(current.parent.vnode)) {
          injectToKeepAliveRoot(wrappedHook, type, target, current);
        }
        current = current.parent;
      }
    }
  }
  function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
    const injected = injectHook(
      type,
      hook,
      keepAliveRoot,
      true
      /* prepend */
    );
    onUnmounted(() => {
      remove(keepAliveRoot[type], injected);
    }, target);
  }
  function injectHook(type, hook, target = currentInstance, prepend = false) {
    if (target) {
      const hooks = target[type] || (target[type] = []);
      const wrappedHook = hook.__weh || (hook.__weh = (...args) => {
        pauseTracking();
        const reset = setCurrentInstance(target);
        const res = callWithAsyncErrorHandling(hook, target, type, args);
        reset();
        resetTracking();
        return res;
      });
      if (prepend) {
        hooks.unshift(wrappedHook);
      } else {
        hooks.push(wrappedHook);
      }
      return wrappedHook;
    } else if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
      const apiName = toHandlerKey(ErrorTypeStrings$1[type].replace(/ hook$/, ""));
      warn$1(
        `${apiName} is called when there is no active component instance to be associated with. Lifecycle injection APIs can only be used during execution of setup(). If you are using async setup(), make sure to register lifecycle hooks before the first await statement.`
      );
    }
  }
  const createHook = (lifecycle) => (hook, target = currentInstance) => {
    if (!isInSSRComponentSetup || lifecycle === "sp") {
      injectHook(lifecycle, (...args) => hook(...args), target);
    }
  };
  const onBeforeMount = createHook("bm");
  const onMounted = createHook("m");
  const onBeforeUpdate = createHook(
    "bu"
  );
  const onUpdated = createHook("u");
  const onBeforeUnmount = createHook(
    "bum"
  );
  const onUnmounted = createHook("um");
  const onServerPrefetch = createHook(
    "sp"
  );
  const onRenderTriggered = createHook("rtg");
  const onRenderTracked = createHook("rtc");
  function onErrorCaptured(hook, target = currentInstance) {
    injectHook("ec", hook, target);
  }
  const NULL_DYNAMIC_COMPONENT = /* @__PURE__ */ Symbol.for("v-ndc");
  function renderList(source, renderItem, cache, index) {
    let ret;
    const cached = cache;
    const sourceIsArray = isArray(source);
    if (sourceIsArray || isString(source)) {
      const sourceIsReactiveArray = sourceIsArray && isReactive(source);
      let needsWrap = false;
      let isReadonlySource = false;
      if (sourceIsReactiveArray) {
        needsWrap = !isShallow(source);
        isReadonlySource = isReadonly(source);
        source = shallowReadArray(source);
      }
      ret = new Array(source.length);
      for (let i = 0, l = source.length; i < l; i++) {
        ret[i] = renderItem(
          needsWrap ? isReadonlySource ? toReadonly(toReactive(source[i])) : toReactive(source[i]) : source[i],
          i,
          void 0,
          cached
        );
      }
    } else if (typeof source === "number") {
      if (!!(define_process_env_default$2.NODE_ENV !== "production") && !Number.isInteger(source)) {
        warn$1(`The v-for range expect an integer value but got ${source}.`);
      }
      ret = new Array(source);
      for (let i = 0; i < source; i++) {
        ret[i] = renderItem(i + 1, i, void 0, cached);
      }
    } else if (isObject(source)) {
      if (source[Symbol.iterator]) {
        ret = Array.from(
          source,
          (item, i) => renderItem(item, i, void 0, cached)
        );
      } else {
        const keys = Object.keys(source);
        ret = new Array(keys.length);
        for (let i = 0, l = keys.length; i < l; i++) {
          const key = keys[i];
          ret[i] = renderItem(source[key], key, i, cached);
        }
      }
    } else {
      ret = [];
    }
    return ret;
  }
  const getPublicInstance = (i) => {
    if (!i) return null;
    if (isStatefulComponent(i)) return getComponentPublicInstance(i);
    return getPublicInstance(i.parent);
  };
  const publicPropertiesMap = (
    // Move PURE marker to new line to workaround compiler discarding it
    // due to type annotation
    /* @__PURE__ */ extend(/* @__PURE__ */ Object.create(null), {
      $: (i) => i,
      $el: (i) => i.vnode.el,
      $data: (i) => i.data,
      $props: (i) => !!(define_process_env_default$2.NODE_ENV !== "production") ? shallowReadonly(i.props) : i.props,
      $attrs: (i) => !!(define_process_env_default$2.NODE_ENV !== "production") ? shallowReadonly(i.attrs) : i.attrs,
      $slots: (i) => !!(define_process_env_default$2.NODE_ENV !== "production") ? shallowReadonly(i.slots) : i.slots,
      $refs: (i) => !!(define_process_env_default$2.NODE_ENV !== "production") ? shallowReadonly(i.refs) : i.refs,
      $parent: (i) => getPublicInstance(i.parent),
      $root: (i) => getPublicInstance(i.root),
      $host: (i) => i.ce,
      $emit: (i) => i.emit,
      $options: (i) => resolveMergedOptions(i),
      $forceUpdate: (i) => i.f || (i.f = () => {
        queueJob(i.update);
      }),
      $nextTick: (i) => i.n || (i.n = nextTick.bind(i.proxy)),
      $watch: (i) => instanceWatch.bind(i)
    })
  );
  const isReservedPrefix = (key) => key === "_" || key === "$";
  const hasSetupBinding = (state, key) => state !== EMPTY_OBJ && !state.__isScriptSetup && hasOwn(state, key);
  const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
      if (key === "__v_skip") {
        return true;
      }
      const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
      if (!!(define_process_env_default$2.NODE_ENV !== "production") && key === "__isVue") {
        return true;
      }
      if (key[0] !== "$") {
        const n = accessCache[key];
        if (n !== void 0) {
          switch (n) {
            case 1:
              return setupState[key];
            case 2:
              return data[key];
            case 4:
              return ctx[key];
            case 3:
              return props[key];
          }
        } else if (hasSetupBinding(setupState, key)) {
          accessCache[key] = 1;
          return setupState[key];
        } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
          accessCache[key] = 2;
          return data[key];
        } else if (hasOwn(props, key)) {
          accessCache[key] = 3;
          return props[key];
        } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
          accessCache[key] = 4;
          return ctx[key];
        } else if (shouldCacheAccess) {
          accessCache[key] = 0;
        }
      }
      const publicGetter = publicPropertiesMap[key];
      let cssModule, globalProperties;
      if (publicGetter) {
        if (key === "$attrs") {
          track(instance.attrs, "get", "");
          !!(define_process_env_default$2.NODE_ENV !== "production") && markAttrsAccessed();
        } else if (!!(define_process_env_default$2.NODE_ENV !== "production") && key === "$slots") {
          track(instance, "get", key);
        }
        return publicGetter(instance);
      } else if (
        // css module (injected by vue-loader)
        (cssModule = type.__cssModules) && (cssModule = cssModule[key])
      ) {
        return cssModule;
      } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
        accessCache[key] = 4;
        return ctx[key];
      } else if (
        // global properties
        globalProperties = appContext.config.globalProperties, hasOwn(globalProperties, key)
      ) {
        {
          return globalProperties[key];
        }
      } else if (!!(define_process_env_default$2.NODE_ENV !== "production") && currentRenderingInstance && (!isString(key) || // #1091 avoid internal isRef/isVNode checks on component instance leading
      // to infinite warning loop
      key.indexOf("__v") !== 0)) {
        if (data !== EMPTY_OBJ && isReservedPrefix(key[0]) && hasOwn(data, key)) {
          warn$1(
            `Property ${JSON.stringify(
              key
            )} must be accessed via $data because it starts with a reserved character ("$" or "_") and is not proxied on the render context.`
          );
        } else if (instance === currentRenderingInstance) {
          warn$1(
            `Property ${JSON.stringify(key)} was accessed during render but is not defined on instance.`
          );
        }
      }
    },
    set({ _: instance }, key, value) {
      const { data, setupState, ctx } = instance;
      if (hasSetupBinding(setupState, key)) {
        setupState[key] = value;
        return true;
      } else if (!!(define_process_env_default$2.NODE_ENV !== "production") && setupState.__isScriptSetup && hasOwn(setupState, key)) {
        warn$1(`Cannot mutate <script setup> binding "${key}" from Options API.`);
        return false;
      } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
        data[key] = value;
        return true;
      } else if (hasOwn(instance.props, key)) {
        !!(define_process_env_default$2.NODE_ENV !== "production") && warn$1(`Attempting to mutate prop "${key}". Props are readonly.`);
        return false;
      }
      if (key[0] === "$" && key.slice(1) in instance) {
        !!(define_process_env_default$2.NODE_ENV !== "production") && warn$1(
          `Attempting to mutate public property "${key}". Properties starting with $ are reserved and readonly.`
        );
        return false;
      } else {
        if (!!(define_process_env_default$2.NODE_ENV !== "production") && key in instance.appContext.config.globalProperties) {
          Object.defineProperty(ctx, key, {
            enumerable: true,
            configurable: true,
            value
          });
        } else {
          ctx[key] = value;
        }
      }
      return true;
    },
    has({
      _: { data, setupState, accessCache, ctx, appContext, props, type }
    }, key) {
      let cssModules;
      return !!(accessCache[key] || data !== EMPTY_OBJ && key[0] !== "$" && hasOwn(data, key) || hasSetupBinding(setupState, key) || hasOwn(props, key) || hasOwn(ctx, key) || hasOwn(publicPropertiesMap, key) || hasOwn(appContext.config.globalProperties, key) || (cssModules = type.__cssModules) && cssModules[key]);
    },
    defineProperty(target, key, descriptor) {
      if (descriptor.get != null) {
        target._.accessCache[key] = 0;
      } else if (hasOwn(descriptor, "value")) {
        this.set(target, key, descriptor.value, null);
      }
      return Reflect.defineProperty(target, key, descriptor);
    }
  };
  if (!!(define_process_env_default$2.NODE_ENV !== "production") && true) {
    PublicInstanceProxyHandlers.ownKeys = (target) => {
      warn$1(
        `Avoid app logic that relies on enumerating keys on a component instance. The keys will be empty in production mode to avoid performance overhead.`
      );
      return Reflect.ownKeys(target);
    };
  }
  function createDevRenderContext(instance) {
    const target = {};
    Object.defineProperty(target, `_`, {
      configurable: true,
      enumerable: false,
      get: () => instance
    });
    Object.keys(publicPropertiesMap).forEach((key) => {
      Object.defineProperty(target, key, {
        configurable: true,
        enumerable: false,
        get: () => publicPropertiesMap[key](instance),
        // intercepted by the proxy so no need for implementation,
        // but needed to prevent set errors
        set: NOOP
      });
    });
    return target;
  }
  function exposePropsOnRenderContext(instance) {
    const {
      ctx,
      propsOptions: [propsOptions]
    } = instance;
    if (propsOptions) {
      Object.keys(propsOptions).forEach((key) => {
        Object.defineProperty(ctx, key, {
          enumerable: true,
          configurable: true,
          get: () => instance.props[key],
          set: NOOP
        });
      });
    }
  }
  function exposeSetupStateOnRenderContext(instance) {
    const { ctx, setupState } = instance;
    Object.keys(toRaw(setupState)).forEach((key) => {
      if (!setupState.__isScriptSetup) {
        if (isReservedPrefix(key[0])) {
          warn$1(
            `setup() return property ${JSON.stringify(
              key
            )} should not start with "$" or "_" which are reserved prefixes for Vue internals.`
          );
          return;
        }
        Object.defineProperty(ctx, key, {
          enumerable: true,
          configurable: true,
          get: () => setupState[key],
          set: NOOP
        });
      }
    });
  }
  function normalizePropsOrEmits(props) {
    return isArray(props) ? props.reduce(
      (normalized, p2) => (normalized[p2] = null, normalized),
      {}
    ) : props;
  }
  function createDuplicateChecker() {
    const cache = /* @__PURE__ */ Object.create(null);
    return (type, key) => {
      if (cache[key]) {
        warn$1(`${type} property "${key}" is already defined in ${cache[key]}.`);
      } else {
        cache[key] = type;
      }
    };
  }
  let shouldCacheAccess = true;
  function applyOptions(instance) {
    const options = resolveMergedOptions(instance);
    const publicThis = instance.proxy;
    const ctx = instance.ctx;
    shouldCacheAccess = false;
    if (options.beforeCreate) {
      callHook(options.beforeCreate, instance, "bc");
    }
    const {
      // state
      data: dataOptions,
      computed: computedOptions,
      methods,
      watch: watchOptions,
      provide: provideOptions,
      inject: injectOptions,
      // lifecycle
      created,
      beforeMount,
      mounted,
      beforeUpdate,
      updated,
      activated,
      deactivated,
      beforeDestroy,
      beforeUnmount,
      destroyed,
      unmounted,
      render,
      renderTracked,
      renderTriggered,
      errorCaptured,
      serverPrefetch,
      // public API
      expose,
      inheritAttrs,
      // assets
      components,
      directives,
      filters
    } = options;
    const checkDuplicateProperties = !!(define_process_env_default$2.NODE_ENV !== "production") ? createDuplicateChecker() : null;
    if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
      const [propsOptions] = instance.propsOptions;
      if (propsOptions) {
        for (const key in propsOptions) {
          checkDuplicateProperties("Props", key);
        }
      }
    }
    if (injectOptions) {
      resolveInjections(injectOptions, ctx, checkDuplicateProperties);
    }
    if (methods) {
      for (const key in methods) {
        const methodHandler = methods[key];
        if (isFunction(methodHandler)) {
          if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
            Object.defineProperty(ctx, key, {
              value: methodHandler.bind(publicThis),
              configurable: true,
              enumerable: true,
              writable: true
            });
          } else {
            ctx[key] = methodHandler.bind(publicThis);
          }
          if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
            checkDuplicateProperties("Methods", key);
          }
        } else if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
          warn$1(
            `Method "${key}" has type "${typeof methodHandler}" in the component definition. Did you reference the function correctly?`
          );
        }
      }
    }
    if (dataOptions) {
      if (!!(define_process_env_default$2.NODE_ENV !== "production") && !isFunction(dataOptions)) {
        warn$1(
          `The data option must be a function. Plain object usage is no longer supported.`
        );
      }
      const data = dataOptions.call(publicThis, publicThis);
      if (!!(define_process_env_default$2.NODE_ENV !== "production") && isPromise(data)) {
        warn$1(
          `data() returned a Promise - note data() cannot be async; If you intend to perform data fetching before component renders, use async setup() + <Suspense>.`
        );
      }
      if (!isObject(data)) {
        !!(define_process_env_default$2.NODE_ENV !== "production") && warn$1(`data() should return an object.`);
      } else {
        instance.data = reactive(data);
        if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
          for (const key in data) {
            checkDuplicateProperties("Data", key);
            if (!isReservedPrefix(key[0])) {
              Object.defineProperty(ctx, key, {
                configurable: true,
                enumerable: true,
                get: () => data[key],
                set: NOOP
              });
            }
          }
        }
      }
    }
    shouldCacheAccess = true;
    if (computedOptions) {
      for (const key in computedOptions) {
        const opt = computedOptions[key];
        const get = isFunction(opt) ? opt.bind(publicThis, publicThis) : isFunction(opt.get) ? opt.get.bind(publicThis, publicThis) : NOOP;
        if (!!(define_process_env_default$2.NODE_ENV !== "production") && get === NOOP) {
          warn$1(`Computed property "${key}" has no getter.`);
        }
        const set = !isFunction(opt) && isFunction(opt.set) ? opt.set.bind(publicThis) : !!(define_process_env_default$2.NODE_ENV !== "production") ? () => {
          warn$1(
            `Write operation failed: computed property "${key}" is readonly.`
          );
        } : NOOP;
        const c = computed({
          get,
          set
        });
        Object.defineProperty(ctx, key, {
          enumerable: true,
          configurable: true,
          get: () => c.value,
          set: (v) => c.value = v
        });
        if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
          checkDuplicateProperties("Computed", key);
        }
      }
    }
    if (watchOptions) {
      for (const key in watchOptions) {
        createWatcher(watchOptions[key], ctx, publicThis, key);
      }
    }
    if (provideOptions) {
      const provides = isFunction(provideOptions) ? provideOptions.call(publicThis) : provideOptions;
      Reflect.ownKeys(provides).forEach((key) => {
        provide(key, provides[key]);
      });
    }
    if (created) {
      callHook(created, instance, "c");
    }
    function registerLifecycleHook(register, hook) {
      if (isArray(hook)) {
        hook.forEach((_hook) => register(_hook.bind(publicThis)));
      } else if (hook) {
        register(hook.bind(publicThis));
      }
    }
    registerLifecycleHook(onBeforeMount, beforeMount);
    registerLifecycleHook(onMounted, mounted);
    registerLifecycleHook(onBeforeUpdate, beforeUpdate);
    registerLifecycleHook(onUpdated, updated);
    registerLifecycleHook(onActivated, activated);
    registerLifecycleHook(onDeactivated, deactivated);
    registerLifecycleHook(onErrorCaptured, errorCaptured);
    registerLifecycleHook(onRenderTracked, renderTracked);
    registerLifecycleHook(onRenderTriggered, renderTriggered);
    registerLifecycleHook(onBeforeUnmount, beforeUnmount);
    registerLifecycleHook(onUnmounted, unmounted);
    registerLifecycleHook(onServerPrefetch, serverPrefetch);
    if (isArray(expose)) {
      if (expose.length) {
        const exposed = instance.exposed || (instance.exposed = {});
        expose.forEach((key) => {
          Object.defineProperty(exposed, key, {
            get: () => publicThis[key],
            set: (val) => publicThis[key] = val,
            enumerable: true
          });
        });
      } else if (!instance.exposed) {
        instance.exposed = {};
      }
    }
    if (render && instance.render === NOOP) {
      instance.render = render;
    }
    if (inheritAttrs != null) {
      instance.inheritAttrs = inheritAttrs;
    }
    if (components) instance.components = components;
    if (directives) instance.directives = directives;
    if (serverPrefetch) {
      markAsyncBoundary(instance);
    }
  }
  function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP) {
    if (isArray(injectOptions)) {
      injectOptions = normalizeInject(injectOptions);
    }
    for (const key in injectOptions) {
      const opt = injectOptions[key];
      let injected;
      if (isObject(opt)) {
        if ("default" in opt) {
          injected = inject(
            opt.from || key,
            opt.default,
            true
          );
        } else {
          injected = inject(opt.from || key);
        }
      } else {
        injected = inject(opt);
      }
      if (isRef(injected)) {
        Object.defineProperty(ctx, key, {
          enumerable: true,
          configurable: true,
          get: () => injected.value,
          set: (v) => injected.value = v
        });
      } else {
        ctx[key] = injected;
      }
      if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
        checkDuplicateProperties("Inject", key);
      }
    }
  }
  function callHook(hook, instance, type) {
    callWithAsyncErrorHandling(
      isArray(hook) ? hook.map((h2) => h2.bind(instance.proxy)) : hook.bind(instance.proxy),
      instance,
      type
    );
  }
  function createWatcher(raw, ctx, publicThis, key) {
    let getter = key.includes(".") ? createPathGetter(publicThis, key) : () => publicThis[key];
    if (isString(raw)) {
      const handler = ctx[raw];
      if (isFunction(handler)) {
        {
          watch(getter, handler);
        }
      } else if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
        warn$1(`Invalid watch handler specified by key "${raw}"`, handler);
      }
    } else if (isFunction(raw)) {
      {
        watch(getter, raw.bind(publicThis));
      }
    } else if (isObject(raw)) {
      if (isArray(raw)) {
        raw.forEach((r) => createWatcher(r, ctx, publicThis, key));
      } else {
        const handler = isFunction(raw.handler) ? raw.handler.bind(publicThis) : ctx[raw.handler];
        if (isFunction(handler)) {
          watch(getter, handler, raw);
        } else if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
          warn$1(`Invalid watch handler specified by key "${raw.handler}"`, handler);
        }
      }
    } else if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
      warn$1(`Invalid watch option: "${key}"`, raw);
    }
  }
  function resolveMergedOptions(instance) {
    const base = instance.type;
    const { mixins, extends: extendsOptions } = base;
    const {
      mixins: globalMixins,
      optionsCache: cache,
      config: { optionMergeStrategies }
    } = instance.appContext;
    const cached = cache.get(base);
    let resolved;
    if (cached) {
      resolved = cached;
    } else if (!globalMixins.length && !mixins && !extendsOptions) {
      {
        resolved = base;
      }
    } else {
      resolved = {};
      if (globalMixins.length) {
        globalMixins.forEach(
          (m) => mergeOptions(resolved, m, optionMergeStrategies, true)
        );
      }
      mergeOptions(resolved, base, optionMergeStrategies);
    }
    if (isObject(base)) {
      cache.set(base, resolved);
    }
    return resolved;
  }
  function mergeOptions(to, from, strats, asMixin = false) {
    const { mixins, extends: extendsOptions } = from;
    if (extendsOptions) {
      mergeOptions(to, extendsOptions, strats, true);
    }
    if (mixins) {
      mixins.forEach(
        (m) => mergeOptions(to, m, strats, true)
      );
    }
    for (const key in from) {
      if (asMixin && key === "expose") {
        !!(define_process_env_default$2.NODE_ENV !== "production") && warn$1(
          `"expose" option is ignored when declared in mixins or extends. It should only be declared in the base component itself.`
        );
      } else {
        const strat = internalOptionMergeStrats[key] || strats && strats[key];
        to[key] = strat ? strat(to[key], from[key]) : from[key];
      }
    }
    return to;
  }
  const internalOptionMergeStrats = {
    data: mergeDataFn,
    props: mergeEmitsOrPropsOptions,
    emits: mergeEmitsOrPropsOptions,
    // objects
    methods: mergeObjectOptions,
    computed: mergeObjectOptions,
    // lifecycle
    beforeCreate: mergeAsArray,
    created: mergeAsArray,
    beforeMount: mergeAsArray,
    mounted: mergeAsArray,
    beforeUpdate: mergeAsArray,
    updated: mergeAsArray,
    beforeDestroy: mergeAsArray,
    beforeUnmount: mergeAsArray,
    destroyed: mergeAsArray,
    unmounted: mergeAsArray,
    activated: mergeAsArray,
    deactivated: mergeAsArray,
    errorCaptured: mergeAsArray,
    serverPrefetch: mergeAsArray,
    // assets
    components: mergeObjectOptions,
    directives: mergeObjectOptions,
    // watch
    watch: mergeWatchOptions,
    // provide / inject
    provide: mergeDataFn,
    inject: mergeInject
  };
  function mergeDataFn(to, from) {
    if (!from) {
      return to;
    }
    if (!to) {
      return from;
    }
    return function mergedDataFn() {
      return extend(
        isFunction(to) ? to.call(this, this) : to,
        isFunction(from) ? from.call(this, this) : from
      );
    };
  }
  function mergeInject(to, from) {
    return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
  }
  function normalizeInject(raw) {
    if (isArray(raw)) {
      const res = {};
      for (let i = 0; i < raw.length; i++) {
        res[raw[i]] = raw[i];
      }
      return res;
    }
    return raw;
  }
  function mergeAsArray(to, from) {
    return to ? [...new Set([].concat(to, from))] : from;
  }
  function mergeObjectOptions(to, from) {
    return to ? extend(/* @__PURE__ */ Object.create(null), to, from) : from;
  }
  function mergeEmitsOrPropsOptions(to, from) {
    if (to) {
      if (isArray(to) && isArray(from)) {
        return [.../* @__PURE__ */ new Set([...to, ...from])];
      }
      return extend(
        /* @__PURE__ */ Object.create(null),
        normalizePropsOrEmits(to),
        normalizePropsOrEmits(from != null ? from : {})
      );
    } else {
      return from;
    }
  }
  function mergeWatchOptions(to, from) {
    if (!to) return from;
    if (!from) return to;
    const merged = extend(/* @__PURE__ */ Object.create(null), to);
    for (const key in from) {
      merged[key] = mergeAsArray(to[key], from[key]);
    }
    return merged;
  }
  function createAppContext() {
    return {
      app: null,
      config: {
        isNativeTag: NO,
        performance: false,
        globalProperties: {},
        optionMergeStrategies: {},
        errorHandler: void 0,
        warnHandler: void 0,
        compilerOptions: {}
      },
      mixins: [],
      components: {},
      directives: {},
      provides: /* @__PURE__ */ Object.create(null),
      optionsCache: /* @__PURE__ */ new WeakMap(),
      propsCache: /* @__PURE__ */ new WeakMap(),
      emitsCache: /* @__PURE__ */ new WeakMap()
    };
  }
  let uid$1 = 0;
  function createAppAPI(render, hydrate) {
    return function createApp2(rootComponent, rootProps = null) {
      if (!isFunction(rootComponent)) {
        rootComponent = extend({}, rootComponent);
      }
      if (rootProps != null && !isObject(rootProps)) {
        !!(define_process_env_default$2.NODE_ENV !== "production") && warn$1(`root props passed to app.mount() must be an object.`);
        rootProps = null;
      }
      const context = createAppContext();
      const installedPlugins = /* @__PURE__ */ new WeakSet();
      const pluginCleanupFns = [];
      let isMounted = false;
      const app = context.app = {
        _uid: uid$1++,
        _component: rootComponent,
        _props: rootProps,
        _container: null,
        _context: context,
        _instance: null,
        version,
        get config() {
          return context.config;
        },
        set config(v) {
          if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
            warn$1(
              `app.config cannot be replaced. Modify individual options instead.`
            );
          }
        },
        use(plugin, ...options) {
          if (installedPlugins.has(plugin)) {
            !!(define_process_env_default$2.NODE_ENV !== "production") && warn$1(`Plugin has already been applied to target app.`);
          } else if (plugin && isFunction(plugin.install)) {
            installedPlugins.add(plugin);
            plugin.install(app, ...options);
          } else if (isFunction(plugin)) {
            installedPlugins.add(plugin);
            plugin(app, ...options);
          } else if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
            warn$1(
              `A plugin must either be a function or an object with an "install" function.`
            );
          }
          return app;
        },
        mixin(mixin) {
          {
            if (!context.mixins.includes(mixin)) {
              context.mixins.push(mixin);
            } else if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
              warn$1(
                "Mixin has already been applied to target app" + (mixin.name ? `: ${mixin.name}` : "")
              );
            }
          }
          return app;
        },
        component(name, component) {
          if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
            validateComponentName(name, context.config);
          }
          if (!component) {
            return context.components[name];
          }
          if (!!(define_process_env_default$2.NODE_ENV !== "production") && context.components[name]) {
            warn$1(`Component "${name}" has already been registered in target app.`);
          }
          context.components[name] = component;
          return app;
        },
        directive(name, directive) {
          if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
            validateDirectiveName(name);
          }
          if (!directive) {
            return context.directives[name];
          }
          if (!!(define_process_env_default$2.NODE_ENV !== "production") && context.directives[name]) {
            warn$1(`Directive "${name}" has already been registered in target app.`);
          }
          context.directives[name] = directive;
          return app;
        },
        mount(rootContainer, isHydrate, namespace) {
          if (!isMounted) {
            if (!!(define_process_env_default$2.NODE_ENV !== "production") && rootContainer.__vue_app__) {
              warn$1(
                `There is already an app instance mounted on the host container.
 If you want to mount another app on the same host container, you need to unmount the previous app by calling \`app.unmount()\` first.`
              );
            }
            const vnode = app._ceVNode || createVNode(rootComponent, rootProps);
            vnode.appContext = context;
            if (namespace === true) {
              namespace = "svg";
            } else if (namespace === false) {
              namespace = void 0;
            }
            if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
              context.reload = () => {
                const cloned = cloneVNode(vnode);
                cloned.el = null;
                render(cloned, rootContainer, namespace);
              };
            }
            {
              render(vnode, rootContainer, namespace);
            }
            isMounted = true;
            app._container = rootContainer;
            rootContainer.__vue_app__ = app;
            if (!!(define_process_env_default$2.NODE_ENV !== "production") || false) {
              app._instance = vnode.component;
              devtoolsInitApp(app, version);
            }
            return getComponentPublicInstance(vnode.component);
          } else if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
            warn$1(
              `App has already been mounted.
If you want to remount the same app, move your app creation logic into a factory function and create fresh app instances for each mount - e.g. \`const createMyApp = () => createApp(App)\``
            );
          }
        },
        onUnmount(cleanupFn) {
          if (!!(define_process_env_default$2.NODE_ENV !== "production") && typeof cleanupFn !== "function") {
            warn$1(
              `Expected function as first argument to app.onUnmount(), but got ${typeof cleanupFn}`
            );
          }
          pluginCleanupFns.push(cleanupFn);
        },
        unmount() {
          if (isMounted) {
            callWithAsyncErrorHandling(
              pluginCleanupFns,
              app._instance,
              16
            );
            render(null, app._container);
            if (!!(define_process_env_default$2.NODE_ENV !== "production") || false) {
              app._instance = null;
              devtoolsUnmountApp(app);
            }
            delete app._container.__vue_app__;
          } else if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
            warn$1(`Cannot unmount an app that is not mounted.`);
          }
        },
        provide(key, value) {
          if (!!(define_process_env_default$2.NODE_ENV !== "production") && key in context.provides) {
            if (hasOwn(context.provides, key)) {
              warn$1(
                `App already provides property with key "${String(key)}". It will be overwritten with the new value.`
              );
            } else {
              warn$1(
                `App already provides property with key "${String(key)}" inherited from its parent element. It will be overwritten with the new value.`
              );
            }
          }
          context.provides[key] = value;
          return app;
        },
        runWithContext(fn) {
          const lastApp = currentApp;
          currentApp = app;
          try {
            return fn();
          } finally {
            currentApp = lastApp;
          }
        }
      };
      return app;
    };
  }
  let currentApp = null;
  const getModelModifiers = (props, modelName) => {
    return modelName === "modelValue" || modelName === "model-value" ? props.modelModifiers : props[`${modelName}Modifiers`] || props[`${camelize(modelName)}Modifiers`] || props[`${hyphenate(modelName)}Modifiers`];
  };
  function emit(instance, event, ...rawArgs) {
    if (instance.isUnmounted) return;
    const props = instance.vnode.props || EMPTY_OBJ;
    if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
      const {
        emitsOptions,
        propsOptions: [propsOptions]
      } = instance;
      if (emitsOptions) {
        if (!(event in emitsOptions) && true) {
          if (!propsOptions || !(toHandlerKey(camelize(event)) in propsOptions)) {
            warn$1(
              `Component emitted event "${event}" but it is neither declared in the emits option nor as an "${toHandlerKey(camelize(event))}" prop.`
            );
          }
        } else {
          const validator = emitsOptions[event];
          if (isFunction(validator)) {
            const isValid = validator(...rawArgs);
            if (!isValid) {
              warn$1(
                `Invalid event arguments: event validation failed for event "${event}".`
              );
            }
          }
        }
      }
    }
    let args = rawArgs;
    const isModelListener2 = event.startsWith("update:");
    const modifiers = isModelListener2 && getModelModifiers(props, event.slice(7));
    if (modifiers) {
      if (modifiers.trim) {
        args = rawArgs.map((a) => isString(a) ? a.trim() : a);
      }
      if (modifiers.number) {
        args = rawArgs.map(looseToNumber);
      }
    }
    if (!!(define_process_env_default$2.NODE_ENV !== "production") || false) {
      devtoolsComponentEmit(instance, event, args);
    }
    if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
      const lowerCaseEvent = event.toLowerCase();
      if (lowerCaseEvent !== event && props[toHandlerKey(lowerCaseEvent)]) {
        warn$1(
          `Event "${lowerCaseEvent}" is emitted in component ${formatComponentName(
            instance,
            instance.type
          )} but the handler is registered for "${event}". Note that HTML attributes are case-insensitive and you cannot use v-on to listen to camelCase events when using in-DOM templates. You should probably use "${hyphenate(
            event
          )}" instead of "${event}".`
        );
      }
    }
    let handlerName;
    let handler = props[handlerName = toHandlerKey(event)] || // also try camelCase event handler (#2249)
    props[handlerName = toHandlerKey(camelize(event))];
    if (!handler && isModelListener2) {
      handler = props[handlerName = toHandlerKey(hyphenate(event))];
    }
    if (handler) {
      callWithAsyncErrorHandling(
        handler,
        instance,
        6,
        args
      );
    }
    const onceHandler = props[handlerName + `Once`];
    if (onceHandler) {
      if (!instance.emitted) {
        instance.emitted = {};
      } else if (instance.emitted[handlerName]) {
        return;
      }
      instance.emitted[handlerName] = true;
      callWithAsyncErrorHandling(
        onceHandler,
        instance,
        6,
        args
      );
    }
  }
  const mixinEmitsCache = /* @__PURE__ */ new WeakMap();
  function normalizeEmitsOptions(comp, appContext, asMixin = false) {
    const cache = asMixin ? mixinEmitsCache : appContext.emitsCache;
    const cached = cache.get(comp);
    if (cached !== void 0) {
      return cached;
    }
    const raw = comp.emits;
    let normalized = {};
    let hasExtends = false;
    if (!isFunction(comp)) {
      const extendEmits = (raw2) => {
        const normalizedFromExtend = normalizeEmitsOptions(raw2, appContext, true);
        if (normalizedFromExtend) {
          hasExtends = true;
          extend(normalized, normalizedFromExtend);
        }
      };
      if (!asMixin && appContext.mixins.length) {
        appContext.mixins.forEach(extendEmits);
      }
      if (comp.extends) {
        extendEmits(comp.extends);
      }
      if (comp.mixins) {
        comp.mixins.forEach(extendEmits);
      }
    }
    if (!raw && !hasExtends) {
      if (isObject(comp)) {
        cache.set(comp, null);
      }
      return null;
    }
    if (isArray(raw)) {
      raw.forEach((key) => normalized[key] = null);
    } else {
      extend(normalized, raw);
    }
    if (isObject(comp)) {
      cache.set(comp, normalized);
    }
    return normalized;
  }
  function isEmitListener(options, key) {
    if (!options || !isOn(key)) {
      return false;
    }
    key = key.slice(2).replace(/Once$/, "");
    return hasOwn(options, key[0].toLowerCase() + key.slice(1)) || hasOwn(options, hyphenate(key)) || hasOwn(options, key);
  }
  let accessedAttrs = false;
  function markAttrsAccessed() {
    accessedAttrs = true;
  }
  function renderComponentRoot(instance) {
    const {
      type: Component,
      vnode,
      proxy,
      withProxy,
      propsOptions: [propsOptions],
      slots,
      attrs,
      emit: emit2,
      render,
      renderCache,
      props,
      data,
      setupState,
      ctx,
      inheritAttrs
    } = instance;
    const prev = setCurrentRenderingInstance(instance);
    let result;
    let fallthroughAttrs;
    if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
      accessedAttrs = false;
    }
    try {
      if (vnode.shapeFlag & 4) {
        const proxyToUse = withProxy || proxy;
        const thisProxy = !!(define_process_env_default$2.NODE_ENV !== "production") && setupState.__isScriptSetup ? new Proxy(proxyToUse, {
          get(target, key, receiver) {
            warn$1(
              `Property '${String(
                key
              )}' was accessed via 'this'. Avoid using 'this' in templates.`
            );
            return Reflect.get(target, key, receiver);
          }
        }) : proxyToUse;
        result = normalizeVNode(
          render.call(
            thisProxy,
            proxyToUse,
            renderCache,
            !!(define_process_env_default$2.NODE_ENV !== "production") ? shallowReadonly(props) : props,
            setupState,
            data,
            ctx
          )
        );
        fallthroughAttrs = attrs;
      } else {
        const render2 = Component;
        if (!!(define_process_env_default$2.NODE_ENV !== "production") && attrs === props) {
          markAttrsAccessed();
        }
        result = normalizeVNode(
          render2.length > 1 ? render2(
            !!(define_process_env_default$2.NODE_ENV !== "production") ? shallowReadonly(props) : props,
            !!(define_process_env_default$2.NODE_ENV !== "production") ? {
              get attrs() {
                markAttrsAccessed();
                return shallowReadonly(attrs);
              },
              slots,
              emit: emit2
            } : { attrs, slots, emit: emit2 }
          ) : render2(
            !!(define_process_env_default$2.NODE_ENV !== "production") ? shallowReadonly(props) : props,
            null
          )
        );
        fallthroughAttrs = Component.props ? attrs : getFunctionalFallthrough(attrs);
      }
    } catch (err) {
      blockStack.length = 0;
      handleError(err, instance, 1);
      result = createVNode(Comment);
    }
    let root = result;
    let setRoot = void 0;
    if (!!(define_process_env_default$2.NODE_ENV !== "production") && result.patchFlag > 0 && result.patchFlag & 2048) {
      [root, setRoot] = getChildRoot(result);
    }
    if (fallthroughAttrs && inheritAttrs !== false) {
      const keys = Object.keys(fallthroughAttrs);
      const { shapeFlag } = root;
      if (keys.length) {
        if (shapeFlag & (1 | 6)) {
          if (propsOptions && keys.some(isModelListener)) {
            fallthroughAttrs = filterModelListeners(
              fallthroughAttrs,
              propsOptions
            );
          }
          root = cloneVNode(root, fallthroughAttrs, false, true);
        } else if (!!(define_process_env_default$2.NODE_ENV !== "production") && !accessedAttrs && root.type !== Comment) {
          const allAttrs = Object.keys(attrs);
          const eventAttrs = [];
          const extraAttrs = [];
          for (let i = 0, l = allAttrs.length; i < l; i++) {
            const key = allAttrs[i];
            if (isOn(key)) {
              if (!isModelListener(key)) {
                eventAttrs.push(key[2].toLowerCase() + key.slice(3));
              }
            } else {
              extraAttrs.push(key);
            }
          }
          if (extraAttrs.length) {
            warn$1(
              `Extraneous non-props attributes (${extraAttrs.join(", ")}) were passed to component but could not be automatically inherited because component renders fragment or text or teleport root nodes.`
            );
          }
          if (eventAttrs.length) {
            warn$1(
              `Extraneous non-emits event listeners (${eventAttrs.join(", ")}) were passed to component but could not be automatically inherited because component renders fragment or text root nodes. If the listener is intended to be a component custom event listener only, declare it using the "emits" option.`
            );
          }
        }
      }
    }
    if (vnode.dirs) {
      if (!!(define_process_env_default$2.NODE_ENV !== "production") && !isElementRoot(root)) {
        warn$1(
          `Runtime directive used on component with non-element root node. The directives will not function as intended.`
        );
      }
      root = cloneVNode(root, null, false, true);
      root.dirs = root.dirs ? root.dirs.concat(vnode.dirs) : vnode.dirs;
    }
    if (vnode.transition) {
      if (!!(define_process_env_default$2.NODE_ENV !== "production") && !isElementRoot(root)) {
        warn$1(
          `Component inside <Transition> renders non-element root node that cannot be animated.`
        );
      }
      setTransitionHooks(root, vnode.transition);
    }
    if (!!(define_process_env_default$2.NODE_ENV !== "production") && setRoot) {
      setRoot(root);
    } else {
      result = root;
    }
    setCurrentRenderingInstance(prev);
    return result;
  }
  const getChildRoot = (vnode) => {
    const rawChildren = vnode.children;
    const dynamicChildren = vnode.dynamicChildren;
    const childRoot = filterSingleRoot(rawChildren, false);
    if (!childRoot) {
      return [vnode, void 0];
    } else if (!!(define_process_env_default$2.NODE_ENV !== "production") && childRoot.patchFlag > 0 && childRoot.patchFlag & 2048) {
      return getChildRoot(childRoot);
    }
    const index = rawChildren.indexOf(childRoot);
    const dynamicIndex = dynamicChildren ? dynamicChildren.indexOf(childRoot) : -1;
    const setRoot = (updatedRoot) => {
      rawChildren[index] = updatedRoot;
      if (dynamicChildren) {
        if (dynamicIndex > -1) {
          dynamicChildren[dynamicIndex] = updatedRoot;
        } else if (updatedRoot.patchFlag > 0) {
          vnode.dynamicChildren = [...dynamicChildren, updatedRoot];
        }
      }
    };
    return [normalizeVNode(childRoot), setRoot];
  };
  function filterSingleRoot(children, recurse = true) {
    let singleRoot;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (isVNode(child)) {
        if (child.type !== Comment || child.children === "v-if") {
          if (singleRoot) {
            return;
          } else {
            singleRoot = child;
            if (!!(define_process_env_default$2.NODE_ENV !== "production") && recurse && singleRoot.patchFlag > 0 && singleRoot.patchFlag & 2048) {
              return filterSingleRoot(singleRoot.children);
            }
          }
        }
      } else {
        return;
      }
    }
    return singleRoot;
  }
  const getFunctionalFallthrough = (attrs) => {
    let res;
    for (const key in attrs) {
      if (key === "class" || key === "style" || isOn(key)) {
        (res || (res = {}))[key] = attrs[key];
      }
    }
    return res;
  };
  const filterModelListeners = (attrs, props) => {
    const res = {};
    for (const key in attrs) {
      if (!isModelListener(key) || !(key.slice(9) in props)) {
        res[key] = attrs[key];
      }
    }
    return res;
  };
  const isElementRoot = (vnode) => {
    return vnode.shapeFlag & (6 | 1) || vnode.type === Comment;
  };
  function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
    const { props: prevProps, children: prevChildren, component } = prevVNode;
    const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
    const emits = component.emitsOptions;
    if (!!(define_process_env_default$2.NODE_ENV !== "production") && (prevChildren || nextChildren) && isHmrUpdating) {
      return true;
    }
    if (nextVNode.dirs || nextVNode.transition) {
      return true;
    }
    if (optimized && patchFlag >= 0) {
      if (patchFlag & 1024) {
        return true;
      }
      if (patchFlag & 16) {
        if (!prevProps) {
          return !!nextProps;
        }
        return hasPropsChanged(prevProps, nextProps, emits);
      } else if (patchFlag & 8) {
        const dynamicProps = nextVNode.dynamicProps;
        for (let i = 0; i < dynamicProps.length; i++) {
          const key = dynamicProps[i];
          if (nextProps[key] !== prevProps[key] && !isEmitListener(emits, key)) {
            return true;
          }
        }
      }
    } else {
      if (prevChildren || nextChildren) {
        if (!nextChildren || !nextChildren.$stable) {
          return true;
        }
      }
      if (prevProps === nextProps) {
        return false;
      }
      if (!prevProps) {
        return !!nextProps;
      }
      if (!nextProps) {
        return true;
      }
      return hasPropsChanged(prevProps, nextProps, emits);
    }
    return false;
  }
  function hasPropsChanged(prevProps, nextProps, emitsOptions) {
    const nextKeys = Object.keys(nextProps);
    if (nextKeys.length !== Object.keys(prevProps).length) {
      return true;
    }
    for (let i = 0; i < nextKeys.length; i++) {
      const key = nextKeys[i];
      if (nextProps[key] !== prevProps[key] && !isEmitListener(emitsOptions, key)) {
        return true;
      }
    }
    return false;
  }
  function updateHOCHostEl({ vnode, parent }, el) {
    while (parent) {
      const root = parent.subTree;
      if (root.suspense && root.suspense.activeBranch === vnode) {
        root.el = vnode.el;
      }
      if (root === vnode) {
        (vnode = parent.vnode).el = el;
        parent = parent.parent;
      } else {
        break;
      }
    }
  }
  const internalObjectProto = {};
  const createInternalObject = () => Object.create(internalObjectProto);
  const isInternalObject = (obj) => Object.getPrototypeOf(obj) === internalObjectProto;
  function initProps(instance, rawProps, isStateful, isSSR = false) {
    const props = {};
    const attrs = createInternalObject();
    instance.propsDefaults = /* @__PURE__ */ Object.create(null);
    setFullProps(instance, rawProps, props, attrs);
    for (const key in instance.propsOptions[0]) {
      if (!(key in props)) {
        props[key] = void 0;
      }
    }
    if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
      validateProps(rawProps || {}, props, instance);
    }
    if (isStateful) {
      instance.props = isSSR ? props : shallowReactive(props);
    } else {
      if (!instance.type.props) {
        instance.props = attrs;
      } else {
        instance.props = props;
      }
    }
    instance.attrs = attrs;
  }
  function isInHmrContext(instance) {
    while (instance) {
      if (instance.type.__hmrId) return true;
      instance = instance.parent;
    }
  }
  function updateProps(instance, rawProps, rawPrevProps, optimized) {
    const {
      props,
      attrs,
      vnode: { patchFlag }
    } = instance;
    const rawCurrentProps = toRaw(props);
    const [options] = instance.propsOptions;
    let hasAttrsChanged = false;
    if (
      // always force full diff in dev
      // - #1942 if hmr is enabled with sfc component
      // - vite#872 non-sfc component used by sfc component
      !(!!(define_process_env_default$2.NODE_ENV !== "production") && isInHmrContext(instance)) && (optimized || patchFlag > 0) && !(patchFlag & 16)
    ) {
      if (patchFlag & 8) {
        const propsToUpdate = instance.vnode.dynamicProps;
        for (let i = 0; i < propsToUpdate.length; i++) {
          let key = propsToUpdate[i];
          if (isEmitListener(instance.emitsOptions, key)) {
            continue;
          }
          const value = rawProps[key];
          if (options) {
            if (hasOwn(attrs, key)) {
              if (value !== attrs[key]) {
                attrs[key] = value;
                hasAttrsChanged = true;
              }
            } else {
              const camelizedKey = camelize(key);
              props[camelizedKey] = resolvePropValue(
                options,
                rawCurrentProps,
                camelizedKey,
                value,
                instance,
                false
              );
            }
          } else {
            if (value !== attrs[key]) {
              attrs[key] = value;
              hasAttrsChanged = true;
            }
          }
        }
      }
    } else {
      if (setFullProps(instance, rawProps, props, attrs)) {
        hasAttrsChanged = true;
      }
      let kebabKey;
      for (const key in rawCurrentProps) {
        if (!rawProps || // for camelCase
        !hasOwn(rawProps, key) && // it's possible the original props was passed in as kebab-case
        // and converted to camelCase (#955)
        ((kebabKey = hyphenate(key)) === key || !hasOwn(rawProps, kebabKey))) {
          if (options) {
            if (rawPrevProps && // for camelCase
            (rawPrevProps[key] !== void 0 || // for kebab-case
            rawPrevProps[kebabKey] !== void 0)) {
              props[key] = resolvePropValue(
                options,
                rawCurrentProps,
                key,
                void 0,
                instance,
                true
              );
            }
          } else {
            delete props[key];
          }
        }
      }
      if (attrs !== rawCurrentProps) {
        for (const key in attrs) {
          if (!rawProps || !hasOwn(rawProps, key) && true) {
            delete attrs[key];
            hasAttrsChanged = true;
          }
        }
      }
    }
    if (hasAttrsChanged) {
      trigger(instance.attrs, "set", "");
    }
    if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
      validateProps(rawProps || {}, props, instance);
    }
  }
  function setFullProps(instance, rawProps, props, attrs) {
    const [options, needCastKeys] = instance.propsOptions;
    let hasAttrsChanged = false;
    let rawCastValues;
    if (rawProps) {
      for (let key in rawProps) {
        if (isReservedProp(key)) {
          continue;
        }
        const value = rawProps[key];
        let camelKey;
        if (options && hasOwn(options, camelKey = camelize(key))) {
          if (!needCastKeys || !needCastKeys.includes(camelKey)) {
            props[camelKey] = value;
          } else {
            (rawCastValues || (rawCastValues = {}))[camelKey] = value;
          }
        } else if (!isEmitListener(instance.emitsOptions, key)) {
          if (!(key in attrs) || value !== attrs[key]) {
            attrs[key] = value;
            hasAttrsChanged = true;
          }
        }
      }
    }
    if (needCastKeys) {
      const rawCurrentProps = toRaw(props);
      const castValues = rawCastValues || EMPTY_OBJ;
      for (let i = 0; i < needCastKeys.length; i++) {
        const key = needCastKeys[i];
        props[key] = resolvePropValue(
          options,
          rawCurrentProps,
          key,
          castValues[key],
          instance,
          !hasOwn(castValues, key)
        );
      }
    }
    return hasAttrsChanged;
  }
  function resolvePropValue(options, props, key, value, instance, isAbsent) {
    const opt = options[key];
    if (opt != null) {
      const hasDefault = hasOwn(opt, "default");
      if (hasDefault && value === void 0) {
        const defaultValue = opt.default;
        if (opt.type !== Function && !opt.skipFactory && isFunction(defaultValue)) {
          const { propsDefaults } = instance;
          if (key in propsDefaults) {
            value = propsDefaults[key];
          } else {
            const reset = setCurrentInstance(instance);
            value = propsDefaults[key] = defaultValue.call(
              null,
              props
            );
            reset();
          }
        } else {
          value = defaultValue;
        }
        if (instance.ce) {
          instance.ce._setProp(key, value);
        }
      }
      if (opt[
        0
        /* shouldCast */
      ]) {
        if (isAbsent && !hasDefault) {
          value = false;
        } else if (opt[
          1
          /* shouldCastTrue */
        ] && (value === "" || value === hyphenate(key))) {
          value = true;
        }
      }
    }
    return value;
  }
  const mixinPropsCache = /* @__PURE__ */ new WeakMap();
  function normalizePropsOptions(comp, appContext, asMixin = false) {
    const cache = asMixin ? mixinPropsCache : appContext.propsCache;
    const cached = cache.get(comp);
    if (cached) {
      return cached;
    }
    const raw = comp.props;
    const normalized = {};
    const needCastKeys = [];
    let hasExtends = false;
    if (!isFunction(comp)) {
      const extendProps = (raw2) => {
        hasExtends = true;
        const [props, keys] = normalizePropsOptions(raw2, appContext, true);
        extend(normalized, props);
        if (keys) needCastKeys.push(...keys);
      };
      if (!asMixin && appContext.mixins.length) {
        appContext.mixins.forEach(extendProps);
      }
      if (comp.extends) {
        extendProps(comp.extends);
      }
      if (comp.mixins) {
        comp.mixins.forEach(extendProps);
      }
    }
    if (!raw && !hasExtends) {
      if (isObject(comp)) {
        cache.set(comp, EMPTY_ARR);
      }
      return EMPTY_ARR;
    }
    if (isArray(raw)) {
      for (let i = 0; i < raw.length; i++) {
        if (!!(define_process_env_default$2.NODE_ENV !== "production") && !isString(raw[i])) {
          warn$1(`props must be strings when using array syntax.`, raw[i]);
        }
        const normalizedKey = camelize(raw[i]);
        if (validatePropName(normalizedKey)) {
          normalized[normalizedKey] = EMPTY_OBJ;
        }
      }
    } else if (raw) {
      if (!!(define_process_env_default$2.NODE_ENV !== "production") && !isObject(raw)) {
        warn$1(`invalid props options`, raw);
      }
      for (const key in raw) {
        const normalizedKey = camelize(key);
        if (validatePropName(normalizedKey)) {
          const opt = raw[key];
          const prop = normalized[normalizedKey] = isArray(opt) || isFunction(opt) ? { type: opt } : extend({}, opt);
          const propType = prop.type;
          let shouldCast = false;
          let shouldCastTrue = true;
          if (isArray(propType)) {
            for (let index = 0; index < propType.length; ++index) {
              const type = propType[index];
              const typeName = isFunction(type) && type.name;
              if (typeName === "Boolean") {
                shouldCast = true;
                break;
              } else if (typeName === "String") {
                shouldCastTrue = false;
              }
            }
          } else {
            shouldCast = isFunction(propType) && propType.name === "Boolean";
          }
          prop[
            0
            /* shouldCast */
          ] = shouldCast;
          prop[
            1
            /* shouldCastTrue */
          ] = shouldCastTrue;
          if (shouldCast || hasOwn(prop, "default")) {
            needCastKeys.push(normalizedKey);
          }
        }
      }
    }
    const res = [normalized, needCastKeys];
    if (isObject(comp)) {
      cache.set(comp, res);
    }
    return res;
  }
  function validatePropName(key) {
    if (key[0] !== "$" && !isReservedProp(key)) {
      return true;
    } else if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
      warn$1(`Invalid prop name: "${key}" is a reserved property.`);
    }
    return false;
  }
  function getType(ctor) {
    if (ctor === null) {
      return "null";
    }
    if (typeof ctor === "function") {
      return ctor.name || "";
    } else if (typeof ctor === "object") {
      const name = ctor.constructor && ctor.constructor.name;
      return name || "";
    }
    return "";
  }
  function validateProps(rawProps, props, instance) {
    const resolvedValues = toRaw(props);
    const options = instance.propsOptions[0];
    const camelizePropsKey = Object.keys(rawProps).map((key) => camelize(key));
    for (const key in options) {
      let opt = options[key];
      if (opt == null) continue;
      validateProp(
        key,
        resolvedValues[key],
        opt,
        !!(define_process_env_default$2.NODE_ENV !== "production") ? shallowReadonly(resolvedValues) : resolvedValues,
        !camelizePropsKey.includes(key)
      );
    }
  }
  function validateProp(name, value, prop, props, isAbsent) {
    const { type, required, validator, skipCheck } = prop;
    if (required && isAbsent) {
      warn$1('Missing required prop: "' + name + '"');
      return;
    }
    if (value == null && !required) {
      return;
    }
    if (type != null && type !== true && !skipCheck) {
      let isValid = false;
      const types = isArray(type) ? type : [type];
      const expectedTypes = [];
      for (let i = 0; i < types.length && !isValid; i++) {
        const { valid, expectedType } = assertType(value, types[i]);
        expectedTypes.push(expectedType || "");
        isValid = valid;
      }
      if (!isValid) {
        warn$1(getInvalidTypeMessage(name, value, expectedTypes));
        return;
      }
    }
    if (validator && !validator(value, props)) {
      warn$1('Invalid prop: custom validator check failed for prop "' + name + '".');
    }
  }
  const isSimpleType = /* @__PURE__ */ makeMap(
    "String,Number,Boolean,Function,Symbol,BigInt"
  );
  function assertType(value, type) {
    let valid;
    const expectedType = getType(type);
    if (expectedType === "null") {
      valid = value === null;
    } else if (isSimpleType(expectedType)) {
      const t = typeof value;
      valid = t === expectedType.toLowerCase();
      if (!valid && t === "object") {
        valid = value instanceof type;
      }
    } else if (expectedType === "Object") {
      valid = isObject(value);
    } else if (expectedType === "Array") {
      valid = isArray(value);
    } else {
      valid = value instanceof type;
    }
    return {
      valid,
      expectedType
    };
  }
  function getInvalidTypeMessage(name, value, expectedTypes) {
    if (expectedTypes.length === 0) {
      return `Prop type [] for prop "${name}" won't match anything. Did you mean to use type Array instead?`;
    }
    let message = `Invalid prop: type check failed for prop "${name}". Expected ${expectedTypes.map(capitalize).join(" | ")}`;
    const expectedType = expectedTypes[0];
    const receivedType = toRawType(value);
    const expectedValue = styleValue(value, expectedType);
    const receivedValue = styleValue(value, receivedType);
    if (expectedTypes.length === 1 && isExplicable(expectedType) && !isBoolean(expectedType, receivedType)) {
      message += ` with value ${expectedValue}`;
    }
    message += `, got ${receivedType} `;
    if (isExplicable(receivedType)) {
      message += `with value ${receivedValue}.`;
    }
    return message;
  }
  function styleValue(value, type) {
    if (type === "String") {
      return `"${value}"`;
    } else if (type === "Number") {
      return `${Number(value)}`;
    } else {
      return `${value}`;
    }
  }
  function isExplicable(type) {
    const explicitTypes = ["string", "number", "boolean"];
    return explicitTypes.some((elem) => type.toLowerCase() === elem);
  }
  function isBoolean(...args) {
    return args.some((elem) => elem.toLowerCase() === "boolean");
  }
  const isInternalKey = (key) => key === "_" || key === "_ctx" || key === "$stable";
  const normalizeSlotValue = (value) => isArray(value) ? value.map(normalizeVNode) : [normalizeVNode(value)];
  const normalizeSlot = (key, rawSlot, ctx) => {
    if (rawSlot._n) {
      return rawSlot;
    }
    const normalized = withCtx((...args) => {
      if (!!(define_process_env_default$2.NODE_ENV !== "production") && currentInstance && !(ctx === null && currentRenderingInstance) && !(ctx && ctx.root !== currentInstance.root)) {
        warn$1(
          `Slot "${key}" invoked outside of the render function: this will not track dependencies used in the slot. Invoke the slot function inside the render function instead.`
        );
      }
      return normalizeSlotValue(rawSlot(...args));
    }, ctx);
    normalized._c = false;
    return normalized;
  };
  const normalizeObjectSlots = (rawSlots, slots, instance) => {
    const ctx = rawSlots._ctx;
    for (const key in rawSlots) {
      if (isInternalKey(key)) continue;
      const value = rawSlots[key];
      if (isFunction(value)) {
        slots[key] = normalizeSlot(key, value, ctx);
      } else if (value != null) {
        if (!!(define_process_env_default$2.NODE_ENV !== "production") && true) {
          warn$1(
            `Non-function value encountered for slot "${key}". Prefer function slots for better performance.`
          );
        }
        const normalized = normalizeSlotValue(value);
        slots[key] = () => normalized;
      }
    }
  };
  const normalizeVNodeSlots = (instance, children) => {
    if (!!(define_process_env_default$2.NODE_ENV !== "production") && !isKeepAlive(instance.vnode) && true) {
      warn$1(
        `Non-function value encountered for default slot. Prefer function slots for better performance.`
      );
    }
    const normalized = normalizeSlotValue(children);
    instance.slots.default = () => normalized;
  };
  const assignSlots = (slots, children, optimized) => {
    for (const key in children) {
      if (optimized || !isInternalKey(key)) {
        slots[key] = children[key];
      }
    }
  };
  const initSlots = (instance, children, optimized) => {
    const slots = instance.slots = createInternalObject();
    if (instance.vnode.shapeFlag & 32) {
      const type = children._;
      if (type) {
        assignSlots(slots, children, optimized);
        if (optimized) {
          def(slots, "_", type, true);
        }
      } else {
        normalizeObjectSlots(children, slots);
      }
    } else if (children) {
      normalizeVNodeSlots(instance, children);
    }
  };
  const updateSlots = (instance, children, optimized) => {
    const { vnode, slots } = instance;
    let needDeletionCheck = true;
    let deletionComparisonTarget = EMPTY_OBJ;
    if (vnode.shapeFlag & 32) {
      const type = children._;
      if (type) {
        if (!!(define_process_env_default$2.NODE_ENV !== "production") && isHmrUpdating) {
          assignSlots(slots, children, optimized);
          trigger(instance, "set", "$slots");
        } else if (optimized && type === 1) {
          needDeletionCheck = false;
        } else {
          assignSlots(slots, children, optimized);
        }
      } else {
        needDeletionCheck = !children.$stable;
        normalizeObjectSlots(children, slots);
      }
      deletionComparisonTarget = children;
    } else if (children) {
      normalizeVNodeSlots(instance, children);
      deletionComparisonTarget = { default: 1 };
    }
    if (needDeletionCheck) {
      for (const key in slots) {
        if (!isInternalKey(key) && deletionComparisonTarget[key] == null) {
          delete slots[key];
        }
      }
    }
  };
  let supported;
  let perf;
  function startMeasure(instance, type) {
    if (instance.appContext.config.performance && isSupported()) {
      perf.mark(`vue-${type}-${instance.uid}`);
    }
    if (!!(define_process_env_default$2.NODE_ENV !== "production") || false) {
      devtoolsPerfStart(instance, type, isSupported() ? perf.now() : Date.now());
    }
  }
  function endMeasure(instance, type) {
    if (instance.appContext.config.performance && isSupported()) {
      const startTag = `vue-${type}-${instance.uid}`;
      const endTag = startTag + `:end`;
      const measureName = `<${formatComponentName(instance, instance.type)}> ${type}`;
      perf.mark(endTag);
      perf.measure(measureName, startTag, endTag);
      perf.clearMeasures(measureName);
      perf.clearMarks(startTag);
      perf.clearMarks(endTag);
    }
    if (!!(define_process_env_default$2.NODE_ENV !== "production") || false) {
      devtoolsPerfEnd(instance, type, isSupported() ? perf.now() : Date.now());
    }
  }
  function isSupported() {
    if (supported !== void 0) {
      return supported;
    }
    if (typeof window !== "undefined" && window.performance) {
      supported = true;
      perf = window.performance;
    } else {
      supported = false;
    }
    return supported;
  }
  function initFeatureFlags() {
    const needWarn = [];
    if (!!(define_process_env_default$2.NODE_ENV !== "production") && needWarn.length) {
      const multi = needWarn.length > 1;
      console.warn(
        `Feature flag${multi ? `s` : ``} ${needWarn.join(", ")} ${multi ? `are` : `is`} not explicitly defined. You are running the esm-bundler build of Vue, which expects these compile-time feature flags to be globally injected via the bundler config in order to get better tree-shaking in the production bundle.

For more details, see https://link.vuejs.org/feature-flags.`
      );
    }
  }
  const queuePostRenderEffect = queueEffectWithSuspense;
  function createRenderer(options) {
    return baseCreateRenderer(options);
  }
  function baseCreateRenderer(options, createHydrationFns) {
    {
      initFeatureFlags();
    }
    const target = getGlobalThis();
    target.__VUE__ = true;
    if (!!(define_process_env_default$2.NODE_ENV !== "production") || false) {
      setDevtoolsHook$1(target.__VUE_DEVTOOLS_GLOBAL_HOOK__, target);
    }
    const {
      insert: hostInsert,
      remove: hostRemove,
      patchProp: hostPatchProp,
      createElement: hostCreateElement,
      createText: hostCreateText,
      createComment: hostCreateComment,
      setText: hostSetText,
      setElementText: hostSetElementText,
      parentNode: hostParentNode,
      nextSibling: hostNextSibling,
      setScopeId: hostSetScopeId = NOOP,
      insertStaticContent: hostInsertStaticContent
    } = options;
    const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, namespace = void 0, slotScopeIds = null, optimized = !!(define_process_env_default$2.NODE_ENV !== "production") && isHmrUpdating ? false : !!n2.dynamicChildren) => {
      if (n1 === n2) {
        return;
      }
      if (n1 && !isSameVNodeType(n1, n2)) {
        anchor = getNextHostNode(n1);
        unmount(n1, parentComponent, parentSuspense, true);
        n1 = null;
      }
      if (n2.patchFlag === -2) {
        optimized = false;
        n2.dynamicChildren = null;
      }
      const { type, ref: ref3, shapeFlag } = n2;
      switch (type) {
        case Text:
          processText(n1, n2, container, anchor);
          break;
        case Comment:
          processCommentNode(n1, n2, container, anchor);
          break;
        case Static:
          if (n1 == null) {
            mountStaticNode(n2, container, anchor, namespace);
          } else if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
            patchStaticNode(n1, n2, container, namespace);
          }
          break;
        case Fragment:
          processFragment(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
          break;
        default:
          if (shapeFlag & 1) {
            processElement(
              n1,
              n2,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized
            );
          } else if (shapeFlag & 6) {
            processComponent(
              n1,
              n2,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized
            );
          } else if (shapeFlag & 64) {
            type.process(
              n1,
              n2,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized,
              internals
            );
          } else if (shapeFlag & 128) {
            type.process(
              n1,
              n2,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized,
              internals
            );
          } else if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
            warn$1("Invalid VNode type:", type, `(${typeof type})`);
          }
      }
      if (ref3 != null && parentComponent) {
        setRef(ref3, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
      } else if (ref3 == null && n1 && n1.ref != null) {
        setRef(n1.ref, null, parentSuspense, n1, true);
      }
    };
    const processText = (n1, n2, container, anchor) => {
      if (n1 == null) {
        hostInsert(
          n2.el = hostCreateText(n2.children),
          container,
          anchor
        );
      } else {
        const el = n2.el = n1.el;
        if (n2.children !== n1.children) {
          if (!!(define_process_env_default$2.NODE_ENV !== "production") && isHmrUpdating && n2.patchFlag === -1 && "__elIndex" in n1) {
            const childNodes = container.childNodes;
            const newChild = hostCreateText(n2.children);
            const oldChild = childNodes[n2.__elIndex = n1.__elIndex];
            hostInsert(newChild, container, oldChild);
            hostRemove(oldChild);
          } else {
            hostSetText(el, n2.children);
          }
        }
      }
    };
    const processCommentNode = (n1, n2, container, anchor) => {
      if (n1 == null) {
        hostInsert(
          n2.el = hostCreateComment(n2.children || ""),
          container,
          anchor
        );
      } else {
        n2.el = n1.el;
      }
    };
    const mountStaticNode = (n2, container, anchor, namespace) => {
      [n2.el, n2.anchor] = hostInsertStaticContent(
        n2.children,
        container,
        anchor,
        namespace,
        n2.el,
        n2.anchor
      );
    };
    const patchStaticNode = (n1, n2, container, namespace) => {
      if (n2.children !== n1.children) {
        const anchor = hostNextSibling(n1.anchor);
        removeStaticNode(n1);
        [n2.el, n2.anchor] = hostInsertStaticContent(
          n2.children,
          container,
          anchor,
          namespace
        );
      } else {
        n2.el = n1.el;
        n2.anchor = n1.anchor;
      }
    };
    const moveStaticNode = ({ el, anchor }, container, nextSibling) => {
      let next;
      while (el && el !== anchor) {
        next = hostNextSibling(el);
        hostInsert(el, container, nextSibling);
        el = next;
      }
      hostInsert(anchor, container, nextSibling);
    };
    const removeStaticNode = ({ el, anchor }) => {
      let next;
      while (el && el !== anchor) {
        next = hostNextSibling(el);
        hostRemove(el);
        el = next;
      }
      hostRemove(anchor);
    };
    const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
      if (n2.type === "svg") {
        namespace = "svg";
      } else if (n2.type === "math") {
        namespace = "mathml";
      }
      if (n1 == null) {
        mountElement(
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } else {
        const customElement = !!(n1.el && n1.el._isVueCE) ? n1.el : null;
        try {
          if (customElement) {
            customElement._beginPatch();
          }
          patchElement(
            n1,
            n2,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } finally {
          if (customElement) {
            customElement._endPatch();
          }
        }
      }
    };
    const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
      let el;
      let vnodeHook;
      const { props, shapeFlag, transition, dirs } = vnode;
      el = vnode.el = hostCreateElement(
        vnode.type,
        namespace,
        props && props.is,
        props
      );
      if (shapeFlag & 8) {
        hostSetElementText(el, vnode.children);
      } else if (shapeFlag & 16) {
        mountChildren(
          vnode.children,
          el,
          null,
          parentComponent,
          parentSuspense,
          resolveChildrenNamespace(vnode, namespace),
          slotScopeIds,
          optimized
        );
      }
      if (dirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "created");
      }
      setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
      if (props) {
        for (const key in props) {
          if (key !== "value" && !isReservedProp(key)) {
            hostPatchProp(el, key, null, props[key], namespace, parentComponent);
          }
        }
        if ("value" in props) {
          hostPatchProp(el, "value", null, props.value, namespace);
        }
        if (vnodeHook = props.onVnodeBeforeMount) {
          invokeVNodeHook(vnodeHook, parentComponent, vnode);
        }
      }
      if (!!(define_process_env_default$2.NODE_ENV !== "production") || false) {
        def(el, "__vnode", vnode, true);
        def(el, "__vueParentComponent", parentComponent, true);
      }
      if (dirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
      }
      const needCallTransitionHooks = needTransition(parentSuspense, transition);
      if (needCallTransitionHooks) {
        transition.beforeEnter(el);
      }
      hostInsert(el, container, anchor);
      if ((vnodeHook = props && props.onVnodeMounted) || needCallTransitionHooks || dirs) {
        queuePostRenderEffect(() => {
          vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
          needCallTransitionHooks && transition.enter(el);
          dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
        }, parentSuspense);
      }
    };
    const setScopeId = (el, vnode, scopeId, slotScopeIds, parentComponent) => {
      if (scopeId) {
        hostSetScopeId(el, scopeId);
      }
      if (slotScopeIds) {
        for (let i = 0; i < slotScopeIds.length; i++) {
          hostSetScopeId(el, slotScopeIds[i]);
        }
      }
      if (parentComponent) {
        let subTree = parentComponent.subTree;
        if (!!(define_process_env_default$2.NODE_ENV !== "production") && subTree.patchFlag > 0 && subTree.patchFlag & 2048) {
          subTree = filterSingleRoot(subTree.children) || subTree;
        }
        if (vnode === subTree || isSuspense(subTree.type) && (subTree.ssContent === vnode || subTree.ssFallback === vnode)) {
          const parentVNode = parentComponent.vnode;
          setScopeId(
            el,
            parentVNode,
            parentVNode.scopeId,
            parentVNode.slotScopeIds,
            parentComponent.parent
          );
        }
      }
    };
    const mountChildren = (children, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, start = 0) => {
      for (let i = start; i < children.length; i++) {
        const child = children[i] = optimized ? cloneIfMounted(children[i]) : normalizeVNode(children[i]);
        patch(
          null,
          child,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      }
    };
    const patchElement = (n1, n2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
      const el = n2.el = n1.el;
      if (!!(define_process_env_default$2.NODE_ENV !== "production") || false) {
        el.__vnode = n2;
      }
      let { patchFlag, dynamicChildren, dirs } = n2;
      patchFlag |= n1.patchFlag & 16;
      const oldProps = n1.props || EMPTY_OBJ;
      const newProps = n2.props || EMPTY_OBJ;
      let vnodeHook;
      parentComponent && toggleRecurse(parentComponent, false);
      if (vnodeHook = newProps.onVnodeBeforeUpdate) {
        invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
      }
      if (dirs) {
        invokeDirectiveHook(n2, n1, parentComponent, "beforeUpdate");
      }
      parentComponent && toggleRecurse(parentComponent, true);
      if (!!(define_process_env_default$2.NODE_ENV !== "production") && isHmrUpdating) {
        patchFlag = 0;
        optimized = false;
        dynamicChildren = null;
      }
      if (oldProps.innerHTML && newProps.innerHTML == null || oldProps.textContent && newProps.textContent == null) {
        hostSetElementText(el, "");
      }
      if (dynamicChildren) {
        patchBlockChildren(
          n1.dynamicChildren,
          dynamicChildren,
          el,
          parentComponent,
          parentSuspense,
          resolveChildrenNamespace(n2, namespace),
          slotScopeIds
        );
        if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
          traverseStaticChildren(n1, n2);
        }
      } else if (!optimized) {
        patchChildren(
          n1,
          n2,
          el,
          null,
          parentComponent,
          parentSuspense,
          resolveChildrenNamespace(n2, namespace),
          slotScopeIds,
          false
        );
      }
      if (patchFlag > 0) {
        if (patchFlag & 16) {
          patchProps(el, oldProps, newProps, parentComponent, namespace);
        } else {
          if (patchFlag & 2) {
            if (oldProps.class !== newProps.class) {
              hostPatchProp(el, "class", null, newProps.class, namespace);
            }
          }
          if (patchFlag & 4) {
            hostPatchProp(el, "style", oldProps.style, newProps.style, namespace);
          }
          if (patchFlag & 8) {
            const propsToUpdate = n2.dynamicProps;
            for (let i = 0; i < propsToUpdate.length; i++) {
              const key = propsToUpdate[i];
              const prev = oldProps[key];
              const next = newProps[key];
              if (next !== prev || key === "value") {
                hostPatchProp(el, key, prev, next, namespace, parentComponent);
              }
            }
          }
        }
        if (patchFlag & 1) {
          if (n1.children !== n2.children) {
            hostSetElementText(el, n2.children);
          }
        }
      } else if (!optimized && dynamicChildren == null) {
        patchProps(el, oldProps, newProps, parentComponent, namespace);
      }
      if ((vnodeHook = newProps.onVnodeUpdated) || dirs) {
        queuePostRenderEffect(() => {
          vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
          dirs && invokeDirectiveHook(n2, n1, parentComponent, "updated");
        }, parentSuspense);
      }
    };
    const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, namespace, slotScopeIds) => {
      for (let i = 0; i < newChildren.length; i++) {
        const oldVNode = oldChildren[i];
        const newVNode = newChildren[i];
        const container = (
          // oldVNode may be an errored async setup() component inside Suspense
          // which will not have a mounted element
          oldVNode.el && // - In the case of a Fragment, we need to provide the actual parent
          // of the Fragment itself so it can move its children.
          (oldVNode.type === Fragment || // - In the case of different nodes, there is going to be a replacement
          // which also requires the correct parent container
          !isSameVNodeType(oldVNode, newVNode) || // - In the case of a component, it could contain anything.
          oldVNode.shapeFlag & (6 | 64 | 128)) ? hostParentNode(oldVNode.el) : (
            // In other cases, the parent container is not actually used so we
            // just pass the block element here to avoid a DOM parentNode call.
            fallbackContainer
          )
        );
        patch(
          oldVNode,
          newVNode,
          container,
          null,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          true
        );
      }
    };
    const patchProps = (el, oldProps, newProps, parentComponent, namespace) => {
      if (oldProps !== newProps) {
        if (oldProps !== EMPTY_OBJ) {
          for (const key in oldProps) {
            if (!isReservedProp(key) && !(key in newProps)) {
              hostPatchProp(
                el,
                key,
                oldProps[key],
                null,
                namespace,
                parentComponent
              );
            }
          }
        }
        for (const key in newProps) {
          if (isReservedProp(key)) continue;
          const next = newProps[key];
          const prev = oldProps[key];
          if (next !== prev && key !== "value") {
            hostPatchProp(el, key, prev, next, namespace, parentComponent);
          }
        }
        if ("value" in newProps) {
          hostPatchProp(el, "value", oldProps.value, newProps.value, namespace);
        }
      }
    };
    const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
      const fragmentStartAnchor = n2.el = n1 ? n1.el : hostCreateText("");
      const fragmentEndAnchor = n2.anchor = n1 ? n1.anchor : hostCreateText("");
      let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
      if (!!(define_process_env_default$2.NODE_ENV !== "production") && // #5523 dev root fragment may inherit directives
      (isHmrUpdating || patchFlag & 2048)) {
        patchFlag = 0;
        optimized = false;
        dynamicChildren = null;
      }
      if (fragmentSlotScopeIds) {
        slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
      }
      if (n1 == null) {
        hostInsert(fragmentStartAnchor, container, anchor);
        hostInsert(fragmentEndAnchor, container, anchor);
        mountChildren(
          // #10007
          // such fragment like `<></>` will be compiled into
          // a fragment which doesn't have a children.
          // In this case fallback to an empty array
          n2.children || [],
          container,
          fragmentEndAnchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } else {
        if (patchFlag > 0 && patchFlag & 64 && dynamicChildren && // #2715 the previous fragment could've been a BAILed one as a result
        // of renderSlot() with no valid children
        n1.dynamicChildren && n1.dynamicChildren.length === dynamicChildren.length) {
          patchBlockChildren(
            n1.dynamicChildren,
            dynamicChildren,
            container,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds
          );
          if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
            traverseStaticChildren(n1, n2);
          } else if (
            // #2080 if the stable fragment has a key, it's a <template v-for> that may
            //  get moved around. Make sure all root level vnodes inherit el.
            // #2134 or if it's a component root, it may also get moved around
            // as the component is being moved.
            n2.key != null || parentComponent && n2 === parentComponent.subTree
          ) {
            traverseStaticChildren(
              n1,
              n2,
              true
              /* shallow */
            );
          }
        } else {
          patchChildren(
            n1,
            n2,
            container,
            fragmentEndAnchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        }
      }
    };
    const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
      n2.slotScopeIds = slotScopeIds;
      if (n1 == null) {
        if (n2.shapeFlag & 512) {
          parentComponent.ctx.activate(
            n2,
            container,
            anchor,
            namespace,
            optimized
          );
        } else {
          mountComponent(
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            optimized
          );
        }
      } else {
        updateComponent(n1, n2, optimized);
      }
    };
    const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, namespace, optimized) => {
      const instance = initialVNode.component = createComponentInstance(
        initialVNode,
        parentComponent,
        parentSuspense
      );
      if (!!(define_process_env_default$2.NODE_ENV !== "production") && instance.type.__hmrId) {
        registerHMR(instance);
      }
      if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
        pushWarningContext(initialVNode);
        startMeasure(instance, `mount`);
      }
      if (isKeepAlive(initialVNode)) {
        instance.ctx.renderer = internals;
      }
      {
        if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
          startMeasure(instance, `init`);
        }
        setupComponent(instance, false, optimized);
        if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
          endMeasure(instance, `init`);
        }
      }
      if (!!(define_process_env_default$2.NODE_ENV !== "production") && isHmrUpdating) initialVNode.el = null;
      if (instance.asyncDep) {
        parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect, optimized);
        if (!initialVNode.el) {
          const placeholder = instance.subTree = createVNode(Comment);
          processCommentNode(null, placeholder, container, anchor);
          initialVNode.placeholder = placeholder.el;
        }
      } else {
        setupRenderEffect(
          instance,
          initialVNode,
          container,
          anchor,
          parentSuspense,
          namespace,
          optimized
        );
      }
      if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
        popWarningContext();
        endMeasure(instance, `mount`);
      }
    };
    const updateComponent = (n1, n2, optimized) => {
      const instance = n2.component = n1.component;
      if (shouldUpdateComponent(n1, n2, optimized)) {
        if (instance.asyncDep && !instance.asyncResolved) {
          if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
            pushWarningContext(n2);
          }
          updateComponentPreRender(instance, n2, optimized);
          if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
            popWarningContext();
          }
          return;
        } else {
          instance.next = n2;
          instance.update();
        }
      } else {
        n2.el = n1.el;
        instance.vnode = n2;
      }
    };
    const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, namespace, optimized) => {
      const componentUpdateFn = () => {
        if (!instance.isMounted) {
          let vnodeHook;
          const { el, props } = initialVNode;
          const { bm, m, parent, root, type } = instance;
          const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
          toggleRecurse(instance, false);
          if (bm) {
            invokeArrayFns(bm);
          }
          if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeBeforeMount)) {
            invokeVNodeHook(vnodeHook, parent, initialVNode);
          }
          toggleRecurse(instance, true);
          {
            if (root.ce && // @ts-expect-error _def is private
            root.ce._def.shadowRoot !== false) {
              root.ce._injectChildStyle(type);
            }
            if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
              startMeasure(instance, `render`);
            }
            const subTree = instance.subTree = renderComponentRoot(instance);
            if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
              endMeasure(instance, `render`);
            }
            if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
              startMeasure(instance, `patch`);
            }
            patch(
              null,
              subTree,
              container,
              anchor,
              instance,
              parentSuspense,
              namespace
            );
            if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
              endMeasure(instance, `patch`);
            }
            initialVNode.el = subTree.el;
          }
          if (m) {
            queuePostRenderEffect(m, parentSuspense);
          }
          if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeMounted)) {
            const scopedInitialVNode = initialVNode;
            queuePostRenderEffect(
              () => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode),
              parentSuspense
            );
          }
          if (initialVNode.shapeFlag & 256 || parent && isAsyncWrapper(parent.vnode) && parent.vnode.shapeFlag & 256) {
            instance.a && queuePostRenderEffect(instance.a, parentSuspense);
          }
          instance.isMounted = true;
          if (!!(define_process_env_default$2.NODE_ENV !== "production") || false) {
            devtoolsComponentAdded(instance);
          }
          initialVNode = container = anchor = null;
        } else {
          let { next, bu, u, parent, vnode } = instance;
          {
            const nonHydratedAsyncRoot = locateNonHydratedAsyncRoot(instance);
            if (nonHydratedAsyncRoot) {
              if (next) {
                next.el = vnode.el;
                updateComponentPreRender(instance, next, optimized);
              }
              nonHydratedAsyncRoot.asyncDep.then(() => {
                if (!instance.isUnmounted) {
                  componentUpdateFn();
                }
              });
              return;
            }
          }
          let originNext = next;
          let vnodeHook;
          if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
            pushWarningContext(next || instance.vnode);
          }
          toggleRecurse(instance, false);
          if (next) {
            next.el = vnode.el;
            updateComponentPreRender(instance, next, optimized);
          } else {
            next = vnode;
          }
          if (bu) {
            invokeArrayFns(bu);
          }
          if (vnodeHook = next.props && next.props.onVnodeBeforeUpdate) {
            invokeVNodeHook(vnodeHook, parent, next, vnode);
          }
          toggleRecurse(instance, true);
          if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
            startMeasure(instance, `render`);
          }
          const nextTree = renderComponentRoot(instance);
          if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
            endMeasure(instance, `render`);
          }
          const prevTree = instance.subTree;
          instance.subTree = nextTree;
          if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
            startMeasure(instance, `patch`);
          }
          patch(
            prevTree,
            nextTree,
            // parent may have changed if it's in a teleport
            hostParentNode(prevTree.el),
            // anchor may have changed if it's in a fragment
            getNextHostNode(prevTree),
            instance,
            parentSuspense,
            namespace
          );
          if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
            endMeasure(instance, `patch`);
          }
          next.el = nextTree.el;
          if (originNext === null) {
            updateHOCHostEl(instance, nextTree.el);
          }
          if (u) {
            queuePostRenderEffect(u, parentSuspense);
          }
          if (vnodeHook = next.props && next.props.onVnodeUpdated) {
            queuePostRenderEffect(
              () => invokeVNodeHook(vnodeHook, parent, next, vnode),
              parentSuspense
            );
          }
          if (!!(define_process_env_default$2.NODE_ENV !== "production") || false) {
            devtoolsComponentUpdated(instance);
          }
          if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
            popWarningContext();
          }
        }
      };
      instance.scope.on();
      const effect2 = instance.effect = new ReactiveEffect(componentUpdateFn);
      instance.scope.off();
      const update = instance.update = effect2.run.bind(effect2);
      const job = instance.job = effect2.runIfDirty.bind(effect2);
      job.i = instance;
      job.id = instance.uid;
      effect2.scheduler = () => queueJob(job);
      toggleRecurse(instance, true);
      if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
        effect2.onTrack = instance.rtc ? (e) => invokeArrayFns(instance.rtc, e) : void 0;
        effect2.onTrigger = instance.rtg ? (e) => invokeArrayFns(instance.rtg, e) : void 0;
      }
      update();
    };
    const updateComponentPreRender = (instance, nextVNode, optimized) => {
      nextVNode.component = instance;
      const prevProps = instance.vnode.props;
      instance.vnode = nextVNode;
      instance.next = null;
      updateProps(instance, nextVNode.props, prevProps, optimized);
      updateSlots(instance, nextVNode.children, optimized);
      pauseTracking();
      flushPreFlushCbs(instance);
      resetTracking();
    };
    const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized = false) => {
      const c1 = n1 && n1.children;
      const prevShapeFlag = n1 ? n1.shapeFlag : 0;
      const c2 = n2.children;
      const { patchFlag, shapeFlag } = n2;
      if (patchFlag > 0) {
        if (patchFlag & 128) {
          patchKeyedChildren(
            c1,
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
          return;
        } else if (patchFlag & 256) {
          patchUnkeyedChildren(
            c1,
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
          return;
        }
      }
      if (shapeFlag & 8) {
        if (prevShapeFlag & 16) {
          unmountChildren(c1, parentComponent, parentSuspense);
        }
        if (c2 !== c1) {
          hostSetElementText(container, c2);
        }
      } else {
        if (prevShapeFlag & 16) {
          if (shapeFlag & 16) {
            patchKeyedChildren(
              c1,
              c2,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized
            );
          } else {
            unmountChildren(c1, parentComponent, parentSuspense, true);
          }
        } else {
          if (prevShapeFlag & 8) {
            hostSetElementText(container, "");
          }
          if (shapeFlag & 16) {
            mountChildren(
              c2,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized
            );
          }
        }
      }
    };
    const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
      c1 = c1 || EMPTY_ARR;
      c2 = c2 || EMPTY_ARR;
      const oldLength = c1.length;
      const newLength = c2.length;
      const commonLength = Math.min(oldLength, newLength);
      let i;
      for (i = 0; i < commonLength; i++) {
        const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
        patch(
          c1[i],
          nextChild,
          container,
          null,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      }
      if (oldLength > newLength) {
        unmountChildren(
          c1,
          parentComponent,
          parentSuspense,
          true,
          false,
          commonLength
        );
      } else {
        mountChildren(
          c2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized,
          commonLength
        );
      }
    };
    const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
      let i = 0;
      const l2 = c2.length;
      let e1 = c1.length - 1;
      let e2 = l2 - 1;
      while (i <= e1 && i <= e2) {
        const n1 = c1[i];
        const n2 = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
        if (isSameVNodeType(n1, n2)) {
          patch(
            n1,
            n2,
            container,
            null,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else {
          break;
        }
        i++;
      }
      while (i <= e1 && i <= e2) {
        const n1 = c1[e1];
        const n2 = c2[e2] = optimized ? cloneIfMounted(c2[e2]) : normalizeVNode(c2[e2]);
        if (isSameVNodeType(n1, n2)) {
          patch(
            n1,
            n2,
            container,
            null,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else {
          break;
        }
        e1--;
        e2--;
      }
      if (i > e1) {
        if (i <= e2) {
          const nextPos = e2 + 1;
          const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
          while (i <= e2) {
            patch(
              null,
              c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]),
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized
            );
            i++;
          }
        }
      } else if (i > e2) {
        while (i <= e1) {
          unmount(c1[i], parentComponent, parentSuspense, true);
          i++;
        }
      } else {
        const s1 = i;
        const s2 = i;
        const keyToNewIndexMap = /* @__PURE__ */ new Map();
        for (i = s2; i <= e2; i++) {
          const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
          if (nextChild.key != null) {
            if (!!(define_process_env_default$2.NODE_ENV !== "production") && keyToNewIndexMap.has(nextChild.key)) {
              warn$1(
                `Duplicate keys found during update:`,
                JSON.stringify(nextChild.key),
                `Make sure keys are unique.`
              );
            }
            keyToNewIndexMap.set(nextChild.key, i);
          }
        }
        let j;
        let patched = 0;
        const toBePatched = e2 - s2 + 1;
        let moved = false;
        let maxNewIndexSoFar = 0;
        const newIndexToOldIndexMap = new Array(toBePatched);
        for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;
        for (i = s1; i <= e1; i++) {
          const prevChild = c1[i];
          if (patched >= toBePatched) {
            unmount(prevChild, parentComponent, parentSuspense, true);
            continue;
          }
          let newIndex;
          if (prevChild.key != null) {
            newIndex = keyToNewIndexMap.get(prevChild.key);
          } else {
            for (j = s2; j <= e2; j++) {
              if (newIndexToOldIndexMap[j - s2] === 0 && isSameVNodeType(prevChild, c2[j])) {
                newIndex = j;
                break;
              }
            }
          }
          if (newIndex === void 0) {
            unmount(prevChild, parentComponent, parentSuspense, true);
          } else {
            newIndexToOldIndexMap[newIndex - s2] = i + 1;
            if (newIndex >= maxNewIndexSoFar) {
              maxNewIndexSoFar = newIndex;
            } else {
              moved = true;
            }
            patch(
              prevChild,
              c2[newIndex],
              container,
              null,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized
            );
            patched++;
          }
        }
        const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : EMPTY_ARR;
        j = increasingNewIndexSequence.length - 1;
        for (i = toBePatched - 1; i >= 0; i--) {
          const nextIndex = s2 + i;
          const nextChild = c2[nextIndex];
          const anchorVNode = c2[nextIndex + 1];
          const anchor = nextIndex + 1 < l2 ? (
            // #13559, #14173 fallback to el placeholder for unresolved async component
            anchorVNode.el || resolveAsyncComponentPlaceholder(anchorVNode)
          ) : parentAnchor;
          if (newIndexToOldIndexMap[i] === 0) {
            patch(
              null,
              nextChild,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized
            );
          } else if (moved) {
            if (j < 0 || i !== increasingNewIndexSequence[j]) {
              move(nextChild, container, anchor, 2);
            } else {
              j--;
            }
          }
        }
      }
    };
    const move = (vnode, container, anchor, moveType, parentSuspense = null) => {
      const { el, type, transition, children, shapeFlag } = vnode;
      if (shapeFlag & 6) {
        move(vnode.component.subTree, container, anchor, moveType);
        return;
      }
      if (shapeFlag & 128) {
        vnode.suspense.move(container, anchor, moveType);
        return;
      }
      if (shapeFlag & 64) {
        type.move(vnode, container, anchor, internals);
        return;
      }
      if (type === Fragment) {
        hostInsert(el, container, anchor);
        for (let i = 0; i < children.length; i++) {
          move(children[i], container, anchor, moveType);
        }
        hostInsert(vnode.anchor, container, anchor);
        return;
      }
      if (type === Static) {
        moveStaticNode(vnode, container, anchor);
        return;
      }
      const needTransition2 = moveType !== 2 && shapeFlag & 1 && transition;
      if (needTransition2) {
        if (moveType === 0) {
          transition.beforeEnter(el);
          hostInsert(el, container, anchor);
          queuePostRenderEffect(() => transition.enter(el), parentSuspense);
        } else {
          const { leave, delayLeave, afterLeave } = transition;
          const remove22 = () => {
            if (vnode.ctx.isUnmounted) {
              hostRemove(el);
            } else {
              hostInsert(el, container, anchor);
            }
          };
          const performLeave = () => {
            if (el._isLeaving) {
              el[leaveCbKey](
                true
                /* cancelled */
              );
            }
            leave(el, () => {
              remove22();
              afterLeave && afterLeave();
            });
          };
          if (delayLeave) {
            delayLeave(el, remove22, performLeave);
          } else {
            performLeave();
          }
        }
      } else {
        hostInsert(el, container, anchor);
      }
    };
    const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
      const {
        type,
        props,
        ref: ref3,
        children,
        dynamicChildren,
        shapeFlag,
        patchFlag,
        dirs,
        cacheIndex
      } = vnode;
      if (patchFlag === -2) {
        optimized = false;
      }
      if (ref3 != null) {
        pauseTracking();
        setRef(ref3, null, parentSuspense, vnode, true);
        resetTracking();
      }
      if (cacheIndex != null) {
        parentComponent.renderCache[cacheIndex] = void 0;
      }
      if (shapeFlag & 256) {
        parentComponent.ctx.deactivate(vnode);
        return;
      }
      const shouldInvokeDirs = shapeFlag & 1 && dirs;
      const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
      let vnodeHook;
      if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeBeforeUnmount)) {
        invokeVNodeHook(vnodeHook, parentComponent, vnode);
      }
      if (shapeFlag & 6) {
        unmountComponent(vnode.component, parentSuspense, doRemove);
      } else {
        if (shapeFlag & 128) {
          vnode.suspense.unmount(parentSuspense, doRemove);
          return;
        }
        if (shouldInvokeDirs) {
          invokeDirectiveHook(vnode, null, parentComponent, "beforeUnmount");
        }
        if (shapeFlag & 64) {
          vnode.type.remove(
            vnode,
            parentComponent,
            parentSuspense,
            internals,
            doRemove
          );
        } else if (dynamicChildren && // #5154
        // when v-once is used inside a block, setBlockTracking(-1) marks the
        // parent block with hasOnce: true
        // so that it doesn't take the fast path during unmount - otherwise
        // components nested in v-once are never unmounted.
        !dynamicChildren.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
        (type !== Fragment || patchFlag > 0 && patchFlag & 64)) {
          unmountChildren(
            dynamicChildren,
            parentComponent,
            parentSuspense,
            false,
            true
          );
        } else if (type === Fragment && patchFlag & (128 | 256) || !optimized && shapeFlag & 16) {
          unmountChildren(children, parentComponent, parentSuspense);
        }
        if (doRemove) {
          remove2(vnode);
        }
      }
      if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeUnmounted) || shouldInvokeDirs) {
        queuePostRenderEffect(() => {
          vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
          shouldInvokeDirs && invokeDirectiveHook(vnode, null, parentComponent, "unmounted");
        }, parentSuspense);
      }
    };
    const remove2 = (vnode) => {
      const { type, el, anchor, transition } = vnode;
      if (type === Fragment) {
        if (!!(define_process_env_default$2.NODE_ENV !== "production") && vnode.patchFlag > 0 && vnode.patchFlag & 2048 && transition && !transition.persisted) {
          vnode.children.forEach((child) => {
            if (child.type === Comment) {
              hostRemove(child.el);
            } else {
              remove2(child);
            }
          });
        } else {
          removeFragment(el, anchor);
        }
        return;
      }
      if (type === Static) {
        removeStaticNode(vnode);
        return;
      }
      const performRemove = () => {
        hostRemove(el);
        if (transition && !transition.persisted && transition.afterLeave) {
          transition.afterLeave();
        }
      };
      if (vnode.shapeFlag & 1 && transition && !transition.persisted) {
        const { leave, delayLeave } = transition;
        const performLeave = () => leave(el, performRemove);
        if (delayLeave) {
          delayLeave(vnode.el, performRemove, performLeave);
        } else {
          performLeave();
        }
      } else {
        performRemove();
      }
    };
    const removeFragment = (cur, end) => {
      let next;
      while (cur !== end) {
        next = hostNextSibling(cur);
        hostRemove(cur);
        cur = next;
      }
      hostRemove(end);
    };
    const unmountComponent = (instance, parentSuspense, doRemove) => {
      if (!!(define_process_env_default$2.NODE_ENV !== "production") && instance.type.__hmrId) {
        unregisterHMR(instance);
      }
      const { bum, scope, job, subTree, um, m, a } = instance;
      invalidateMount(m);
      invalidateMount(a);
      if (bum) {
        invokeArrayFns(bum);
      }
      scope.stop();
      if (job) {
        job.flags |= 8;
        unmount(subTree, instance, parentSuspense, doRemove);
      }
      if (um) {
        queuePostRenderEffect(um, parentSuspense);
      }
      queuePostRenderEffect(() => {
        instance.isUnmounted = true;
      }, parentSuspense);
      if (!!(define_process_env_default$2.NODE_ENV !== "production") || false) {
        devtoolsComponentRemoved(instance);
      }
    };
    const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start = 0) => {
      for (let i = start; i < children.length; i++) {
        unmount(children[i], parentComponent, parentSuspense, doRemove, optimized);
      }
    };
    const getNextHostNode = (vnode) => {
      if (vnode.shapeFlag & 6) {
        return getNextHostNode(vnode.component.subTree);
      }
      if (vnode.shapeFlag & 128) {
        return vnode.suspense.next();
      }
      const el = hostNextSibling(vnode.anchor || vnode.el);
      const teleportEnd = el && el[TeleportEndKey];
      return teleportEnd ? hostNextSibling(teleportEnd) : el;
    };
    let isFlushing = false;
    const render = (vnode, container, namespace) => {
      let instance;
      if (vnode == null) {
        if (container._vnode) {
          unmount(container._vnode, null, null, true);
          instance = container._vnode.component;
        }
      } else {
        patch(
          container._vnode || null,
          vnode,
          container,
          null,
          null,
          null,
          namespace
        );
      }
      container._vnode = vnode;
      if (!isFlushing) {
        isFlushing = true;
        flushPreFlushCbs(instance);
        flushPostFlushCbs();
        isFlushing = false;
      }
    };
    const internals = {
      p: patch,
      um: unmount,
      m: move,
      r: remove2,
      mt: mountComponent,
      mc: mountChildren,
      pc: patchChildren,
      pbc: patchBlockChildren,
      n: getNextHostNode,
      o: options
    };
    let hydrate;
    return {
      render,
      hydrate,
      createApp: createAppAPI(render)
    };
  }
  function resolveChildrenNamespace({ type, props }, currentNamespace) {
    return currentNamespace === "svg" && type === "foreignObject" || currentNamespace === "mathml" && type === "annotation-xml" && props && props.encoding && props.encoding.includes("html") ? void 0 : currentNamespace;
  }
  function toggleRecurse({ effect: effect2, job }, allowed) {
    if (allowed) {
      effect2.flags |= 32;
      job.flags |= 4;
    } else {
      effect2.flags &= -33;
      job.flags &= -5;
    }
  }
  function needTransition(parentSuspense, transition) {
    return (!parentSuspense || parentSuspense && !parentSuspense.pendingBranch) && transition && !transition.persisted;
  }
  function traverseStaticChildren(n1, n2, shallow = false) {
    const ch1 = n1.children;
    const ch2 = n2.children;
    if (isArray(ch1) && isArray(ch2)) {
      for (let i = 0; i < ch1.length; i++) {
        const c1 = ch1[i];
        let c2 = ch2[i];
        if (c2.shapeFlag & 1 && !c2.dynamicChildren) {
          if (c2.patchFlag <= 0 || c2.patchFlag === 32) {
            c2 = ch2[i] = cloneIfMounted(ch2[i]);
            c2.el = c1.el;
          }
          if (!shallow && c2.patchFlag !== -2)
            traverseStaticChildren(c1, c2);
        }
        if (c2.type === Text) {
          if (c2.patchFlag !== -1) {
            c2.el = c1.el;
          } else {
            c2.__elIndex = i + // take fragment start anchor into account
            (n1.type === Fragment ? 1 : 0);
          }
        }
        if (c2.type === Comment && !c2.el) {
          c2.el = c1.el;
        }
        if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
          c2.el && (c2.el.__vnode = c2);
        }
      }
    }
  }
  function getSequence(arr) {
    const p2 = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
      const arrI = arr[i];
      if (arrI !== 0) {
        j = result[result.length - 1];
        if (arr[j] < arrI) {
          p2[i] = j;
          result.push(i);
          continue;
        }
        u = 0;
        v = result.length - 1;
        while (u < v) {
          c = u + v >> 1;
          if (arr[result[c]] < arrI) {
            u = c + 1;
          } else {
            v = c;
          }
        }
        if (arrI < arr[result[u]]) {
          if (u > 0) {
            p2[i] = result[u - 1];
          }
          result[u] = i;
        }
      }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
      result[u] = v;
      v = p2[v];
    }
    return result;
  }
  function locateNonHydratedAsyncRoot(instance) {
    const subComponent = instance.subTree.component;
    if (subComponent) {
      if (subComponent.asyncDep && !subComponent.asyncResolved) {
        return subComponent;
      } else {
        return locateNonHydratedAsyncRoot(subComponent);
      }
    }
  }
  function invalidateMount(hooks) {
    if (hooks) {
      for (let i = 0; i < hooks.length; i++)
        hooks[i].flags |= 8;
    }
  }
  function resolveAsyncComponentPlaceholder(anchorVnode) {
    if (anchorVnode.placeholder) {
      return anchorVnode.placeholder;
    }
    const instance = anchorVnode.component;
    if (instance) {
      return resolveAsyncComponentPlaceholder(instance.subTree);
    }
    return null;
  }
  const isSuspense = (type) => type.__isSuspense;
  function queueEffectWithSuspense(fn, suspense) {
    if (suspense && suspense.pendingBranch) {
      if (isArray(fn)) {
        suspense.effects.push(...fn);
      } else {
        suspense.effects.push(fn);
      }
    } else {
      queuePostFlushCb(fn);
    }
  }
  const Fragment = /* @__PURE__ */ Symbol.for("v-fgt");
  const Text = /* @__PURE__ */ Symbol.for("v-txt");
  const Comment = /* @__PURE__ */ Symbol.for("v-cmt");
  const Static = /* @__PURE__ */ Symbol.for("v-stc");
  const blockStack = [];
  let currentBlock = null;
  function openBlock(disableTracking = false) {
    blockStack.push(currentBlock = disableTracking ? null : []);
  }
  function closeBlock() {
    blockStack.pop();
    currentBlock = blockStack[blockStack.length - 1] || null;
  }
  let isBlockTreeEnabled = 1;
  function setBlockTracking(value, inVOnce = false) {
    isBlockTreeEnabled += value;
    if (value < 0 && currentBlock && inVOnce) {
      currentBlock.hasOnce = true;
    }
  }
  function setupBlock(vnode) {
    vnode.dynamicChildren = isBlockTreeEnabled > 0 ? currentBlock || EMPTY_ARR : null;
    closeBlock();
    if (isBlockTreeEnabled > 0 && currentBlock) {
      currentBlock.push(vnode);
    }
    return vnode;
  }
  function createElementBlock(type, props, children, patchFlag, dynamicProps, shapeFlag) {
    return setupBlock(
      createBaseVNode(
        type,
        props,
        children,
        patchFlag,
        dynamicProps,
        shapeFlag,
        true
      )
    );
  }
  function createBlock(type, props, children, patchFlag, dynamicProps) {
    return setupBlock(
      createVNode(
        type,
        props,
        children,
        patchFlag,
        dynamicProps,
        true
      )
    );
  }
  function isVNode(value) {
    return value ? value.__v_isVNode === true : false;
  }
  function isSameVNodeType(n1, n2) {
    if (!!(define_process_env_default$2.NODE_ENV !== "production") && n2.shapeFlag & 6 && n1.component) {
      const dirtyInstances = hmrDirtyComponents.get(n2.type);
      if (dirtyInstances && dirtyInstances.has(n1.component)) {
        n1.shapeFlag &= -257;
        n2.shapeFlag &= -513;
        return false;
      }
    }
    return n1.type === n2.type && n1.key === n2.key;
  }
  const createVNodeWithArgsTransform = (...args) => {
    return _createVNode(
      ...args
    );
  };
  const normalizeKey = ({ key }) => key != null ? key : null;
  const normalizeRef = ({
    ref: ref3,
    ref_key,
    ref_for
  }) => {
    if (typeof ref3 === "number") {
      ref3 = "" + ref3;
    }
    return ref3 != null ? isString(ref3) || isRef(ref3) || isFunction(ref3) ? { i: currentRenderingInstance, r: ref3, k: ref_key, f: !!ref_for } : ref3 : null;
  };
  function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1, isBlockNode = false, needFullChildrenNormalization = false) {
    const vnode = {
      __v_isVNode: true,
      __v_skip: true,
      type,
      props,
      key: props && normalizeKey(props),
      ref: props && normalizeRef(props),
      scopeId: currentScopeId,
      slotScopeIds: null,
      children,
      component: null,
      suspense: null,
      ssContent: null,
      ssFallback: null,
      dirs: null,
      transition: null,
      el: null,
      anchor: null,
      target: null,
      targetStart: null,
      targetAnchor: null,
      staticCount: 0,
      shapeFlag,
      patchFlag,
      dynamicProps,
      dynamicChildren: null,
      appContext: null,
      ctx: currentRenderingInstance
    };
    if (needFullChildrenNormalization) {
      normalizeChildren(vnode, children);
      if (shapeFlag & 128) {
        type.normalize(vnode);
      }
    } else if (children) {
      vnode.shapeFlag |= isString(children) ? 8 : 16;
    }
    if (!!(define_process_env_default$2.NODE_ENV !== "production") && vnode.key !== vnode.key) {
      warn$1(`VNode created with invalid key (NaN). VNode type:`, vnode.type);
    }
    if (isBlockTreeEnabled > 0 && // avoid a block node from tracking itself
    !isBlockNode && // has current parent block
    currentBlock && // presence of a patch flag indicates this node needs patching on updates.
    // component nodes also should always be patched, because even if the
    // component doesn't need to update, it needs to persist the instance on to
    // the next vnode so that it can be properly unmounted later.
    (vnode.patchFlag > 0 || shapeFlag & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
    // vnode should not be considered dynamic due to handler caching.
    vnode.patchFlag !== 32) {
      currentBlock.push(vnode);
    }
    return vnode;
  }
  const createVNode = !!(define_process_env_default$2.NODE_ENV !== "production") ? createVNodeWithArgsTransform : _createVNode;
  function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
    if (!type || type === NULL_DYNAMIC_COMPONENT) {
      if (!!(define_process_env_default$2.NODE_ENV !== "production") && !type) {
        warn$1(`Invalid vnode type when creating vnode: ${type}.`);
      }
      type = Comment;
    }
    if (isVNode(type)) {
      const cloned = cloneVNode(
        type,
        props,
        true
        /* mergeRef: true */
      );
      if (children) {
        normalizeChildren(cloned, children);
      }
      if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) {
        if (cloned.shapeFlag & 6) {
          currentBlock[currentBlock.indexOf(type)] = cloned;
        } else {
          currentBlock.push(cloned);
        }
      }
      cloned.patchFlag = -2;
      return cloned;
    }
    if (isClassComponent(type)) {
      type = type.__vccOpts;
    }
    if (props) {
      props = guardReactiveProps(props);
      let { class: klass, style } = props;
      if (klass && !isString(klass)) {
        props.class = normalizeClass(klass);
      }
      if (isObject(style)) {
        if (isProxy(style) && !isArray(style)) {
          style = extend({}, style);
        }
        props.style = normalizeStyle(style);
      }
    }
    const shapeFlag = isString(type) ? 1 : isSuspense(type) ? 128 : isTeleport(type) ? 64 : isObject(type) ? 4 : isFunction(type) ? 2 : 0;
    if (!!(define_process_env_default$2.NODE_ENV !== "production") && shapeFlag & 4 && isProxy(type)) {
      type = toRaw(type);
      warn$1(
        `Vue received a Component that was made a reactive object. This can lead to unnecessary performance overhead and should be avoided by marking the component with \`markRaw\` or using \`shallowRef\` instead of \`ref\`.`,
        `
Component that was made reactive: `,
        type
      );
    }
    return createBaseVNode(
      type,
      props,
      children,
      patchFlag,
      dynamicProps,
      shapeFlag,
      isBlockNode,
      true
    );
  }
  function guardReactiveProps(props) {
    if (!props) return null;
    return isProxy(props) || isInternalObject(props) ? extend({}, props) : props;
  }
  function cloneVNode(vnode, extraProps, mergeRef = false, cloneTransition = false) {
    const { props, ref: ref3, patchFlag, children, transition } = vnode;
    const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
    const cloned = {
      __v_isVNode: true,
      __v_skip: true,
      type: vnode.type,
      props: mergedProps,
      key: mergedProps && normalizeKey(mergedProps),
      ref: extraProps && extraProps.ref ? (
        // #2078 in the case of <component :is="vnode" ref="extra"/>
        // if the vnode itself already has a ref, cloneVNode will need to merge
        // the refs so the single vnode can be set on multiple refs
        mergeRef && ref3 ? isArray(ref3) ? ref3.concat(normalizeRef(extraProps)) : [ref3, normalizeRef(extraProps)] : normalizeRef(extraProps)
      ) : ref3,
      scopeId: vnode.scopeId,
      slotScopeIds: vnode.slotScopeIds,
      children: !!(define_process_env_default$2.NODE_ENV !== "production") && patchFlag === -1 && isArray(children) ? children.map(deepCloneVNode) : children,
      target: vnode.target,
      targetStart: vnode.targetStart,
      targetAnchor: vnode.targetAnchor,
      staticCount: vnode.staticCount,
      shapeFlag: vnode.shapeFlag,
      // if the vnode is cloned with extra props, we can no longer assume its
      // existing patch flag to be reliable and need to add the FULL_PROPS flag.
      // note: preserve flag for fragments since they use the flag for children
      // fast paths only.
      patchFlag: extraProps && vnode.type !== Fragment ? patchFlag === -1 ? 16 : patchFlag | 16 : patchFlag,
      dynamicProps: vnode.dynamicProps,
      dynamicChildren: vnode.dynamicChildren,
      appContext: vnode.appContext,
      dirs: vnode.dirs,
      transition,
      // These should technically only be non-null on mounted VNodes. However,
      // they *should* be copied for kept-alive vnodes. So we just always copy
      // them since them being non-null during a mount doesn't affect the logic as
      // they will simply be overwritten.
      component: vnode.component,
      suspense: vnode.suspense,
      ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
      ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
      placeholder: vnode.placeholder,
      el: vnode.el,
      anchor: vnode.anchor,
      ctx: vnode.ctx,
      ce: vnode.ce
    };
    if (transition && cloneTransition) {
      setTransitionHooks(
        cloned,
        transition.clone(cloned)
      );
    }
    return cloned;
  }
  function deepCloneVNode(vnode) {
    const cloned = cloneVNode(vnode);
    if (isArray(vnode.children)) {
      cloned.children = vnode.children.map(deepCloneVNode);
    }
    return cloned;
  }
  function createTextVNode(text = " ", flag = 0) {
    return createVNode(Text, null, text, flag);
  }
  function createStaticVNode(content, numberOfNodes) {
    const vnode = createVNode(Static, null, content);
    vnode.staticCount = numberOfNodes;
    return vnode;
  }
  function createCommentVNode(text = "", asBlock = false) {
    return asBlock ? (openBlock(), createBlock(Comment, null, text)) : createVNode(Comment, null, text);
  }
  function normalizeVNode(child) {
    if (child == null || typeof child === "boolean") {
      return createVNode(Comment);
    } else if (isArray(child)) {
      return createVNode(
        Fragment,
        null,
        // #3666, avoid reference pollution when reusing vnode
        child.slice()
      );
    } else if (isVNode(child)) {
      return cloneIfMounted(child);
    } else {
      return createVNode(Text, null, String(child));
    }
  }
  function cloneIfMounted(child) {
    return child.el === null && child.patchFlag !== -1 || child.memo ? child : cloneVNode(child);
  }
  function normalizeChildren(vnode, children) {
    let type = 0;
    const { shapeFlag } = vnode;
    if (children == null) {
      children = null;
    } else if (isArray(children)) {
      type = 16;
    } else if (typeof children === "object") {
      if (shapeFlag & (1 | 64)) {
        const slot = children.default;
        if (slot) {
          slot._c && (slot._d = false);
          normalizeChildren(vnode, slot());
          slot._c && (slot._d = true);
        }
        return;
      } else {
        type = 32;
        const slotFlag = children._;
        if (!slotFlag && !isInternalObject(children)) {
          children._ctx = currentRenderingInstance;
        } else if (slotFlag === 3 && currentRenderingInstance) {
          if (currentRenderingInstance.slots._ === 1) {
            children._ = 1;
          } else {
            children._ = 2;
            vnode.patchFlag |= 1024;
          }
        }
      }
    } else if (isFunction(children)) {
      children = { default: children, _ctx: currentRenderingInstance };
      type = 32;
    } else {
      children = String(children);
      if (shapeFlag & 64) {
        type = 16;
        children = [createTextVNode(children)];
      } else {
        type = 8;
      }
    }
    vnode.children = children;
    vnode.shapeFlag |= type;
  }
  function mergeProps(...args) {
    const ret = {};
    for (let i = 0; i < args.length; i++) {
      const toMerge = args[i];
      for (const key in toMerge) {
        if (key === "class") {
          if (ret.class !== toMerge.class) {
            ret.class = normalizeClass([ret.class, toMerge.class]);
          }
        } else if (key === "style") {
          ret.style = normalizeStyle([ret.style, toMerge.style]);
        } else if (isOn(key)) {
          const existing = ret[key];
          const incoming = toMerge[key];
          if (incoming && existing !== incoming && !(isArray(existing) && existing.includes(incoming))) {
            ret[key] = existing ? [].concat(existing, incoming) : incoming;
          }
        } else if (key !== "") {
          ret[key] = toMerge[key];
        }
      }
    }
    return ret;
  }
  function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
    callWithAsyncErrorHandling(hook, instance, 7, [
      vnode,
      prevVNode
    ]);
  }
  const emptyAppContext = createAppContext();
  let uid = 0;
  function createComponentInstance(vnode, parent, suspense) {
    const type = vnode.type;
    const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
    const instance = {
      uid: uid++,
      vnode,
      type,
      parent,
      appContext,
      root: null,
      // to be immediately set
      next: null,
      subTree: null,
      // will be set synchronously right after creation
      effect: null,
      update: null,
      // will be set synchronously right after creation
      job: null,
      scope: new EffectScope(
        true
        /* detached */
      ),
      render: null,
      proxy: null,
      exposed: null,
      exposeProxy: null,
      withProxy: null,
      provides: parent ? parent.provides : Object.create(appContext.provides),
      ids: parent ? parent.ids : ["", 0, 0],
      accessCache: null,
      renderCache: [],
      // local resolved assets
      components: null,
      directives: null,
      // resolved props and emits options
      propsOptions: normalizePropsOptions(type, appContext),
      emitsOptions: normalizeEmitsOptions(type, appContext),
      // emit
      emit: null,
      // to be set immediately
      emitted: null,
      // props default value
      propsDefaults: EMPTY_OBJ,
      // inheritAttrs
      inheritAttrs: type.inheritAttrs,
      // state
      ctx: EMPTY_OBJ,
      data: EMPTY_OBJ,
      props: EMPTY_OBJ,
      attrs: EMPTY_OBJ,
      slots: EMPTY_OBJ,
      refs: EMPTY_OBJ,
      setupState: EMPTY_OBJ,
      setupContext: null,
      // suspense related
      suspense,
      suspenseId: suspense ? suspense.pendingId : 0,
      asyncDep: null,
      asyncResolved: false,
      // lifecycle hooks
      // not using enums here because it results in computed properties
      isMounted: false,
      isUnmounted: false,
      isDeactivated: false,
      bc: null,
      c: null,
      bm: null,
      m: null,
      bu: null,
      u: null,
      um: null,
      bum: null,
      da: null,
      a: null,
      rtg: null,
      rtc: null,
      ec: null,
      sp: null
    };
    if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
      instance.ctx = createDevRenderContext(instance);
    } else {
      instance.ctx = { _: instance };
    }
    instance.root = parent ? parent.root : instance;
    instance.emit = emit.bind(null, instance);
    if (vnode.ce) {
      vnode.ce(instance);
    }
    return instance;
  }
  let currentInstance = null;
  const getCurrentInstance = () => currentInstance || currentRenderingInstance;
  let internalSetCurrentInstance;
  let setInSSRSetupState;
  {
    const g = getGlobalThis();
    const registerGlobalSetter = (key, setter) => {
      let setters;
      if (!(setters = g[key])) setters = g[key] = [];
      setters.push(setter);
      return (v) => {
        if (setters.length > 1) setters.forEach((set) => set(v));
        else setters[0](v);
      };
    };
    internalSetCurrentInstance = registerGlobalSetter(
      `__VUE_INSTANCE_SETTERS__`,
      (v) => currentInstance = v
    );
    setInSSRSetupState = registerGlobalSetter(
      `__VUE_SSR_SETTERS__`,
      (v) => isInSSRComponentSetup = v
    );
  }
  const setCurrentInstance = (instance) => {
    const prev = currentInstance;
    internalSetCurrentInstance(instance);
    instance.scope.on();
    return () => {
      instance.scope.off();
      internalSetCurrentInstance(prev);
    };
  };
  const unsetCurrentInstance = () => {
    currentInstance && currentInstance.scope.off();
    internalSetCurrentInstance(null);
  };
  const isBuiltInTag = /* @__PURE__ */ makeMap("slot,component");
  function validateComponentName(name, { isNativeTag }) {
    if (isBuiltInTag(name) || isNativeTag(name)) {
      warn$1(
        "Do not use built-in or reserved HTML elements as component id: " + name
      );
    }
  }
  function isStatefulComponent(instance) {
    return instance.vnode.shapeFlag & 4;
  }
  let isInSSRComponentSetup = false;
  function setupComponent(instance, isSSR = false, optimized = false) {
    isSSR && setInSSRSetupState(isSSR);
    const { props, children } = instance.vnode;
    const isStateful = isStatefulComponent(instance);
    initProps(instance, props, isStateful, isSSR);
    initSlots(instance, children, optimized || isSSR);
    const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : void 0;
    isSSR && setInSSRSetupState(false);
    return setupResult;
  }
  function setupStatefulComponent(instance, isSSR) {
    const Component = instance.type;
    if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
      if (Component.name) {
        validateComponentName(Component.name, instance.appContext.config);
      }
      if (Component.components) {
        const names = Object.keys(Component.components);
        for (let i = 0; i < names.length; i++) {
          validateComponentName(names[i], instance.appContext.config);
        }
      }
      if (Component.directives) {
        const names = Object.keys(Component.directives);
        for (let i = 0; i < names.length; i++) {
          validateDirectiveName(names[i]);
        }
      }
      if (Component.compilerOptions && isRuntimeOnly()) {
        warn$1(
          `"compilerOptions" is only supported when using a build of Vue that includes the runtime compiler. Since you are using a runtime-only build, the options should be passed via your build tool config instead.`
        );
      }
    }
    instance.accessCache = /* @__PURE__ */ Object.create(null);
    instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);
    if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
      exposePropsOnRenderContext(instance);
    }
    const { setup } = Component;
    if (setup) {
      pauseTracking();
      const setupContext = instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null;
      const reset = setCurrentInstance(instance);
      const setupResult = callWithErrorHandling(
        setup,
        instance,
        0,
        [
          !!(define_process_env_default$2.NODE_ENV !== "production") ? shallowReadonly(instance.props) : instance.props,
          setupContext
        ]
      );
      const isAsyncSetup = isPromise(setupResult);
      resetTracking();
      reset();
      if ((isAsyncSetup || instance.sp) && !isAsyncWrapper(instance)) {
        markAsyncBoundary(instance);
      }
      if (isAsyncSetup) {
        setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
        if (isSSR) {
          return setupResult.then((resolvedResult) => {
            handleSetupResult(instance, resolvedResult, isSSR);
          }).catch((e) => {
            handleError(e, instance, 0);
          });
        } else {
          instance.asyncDep = setupResult;
          if (!!(define_process_env_default$2.NODE_ENV !== "production") && !instance.suspense) {
            const name = formatComponentName(instance, Component);
            warn$1(
              `Component <${name}>: setup function returned a promise, but no <Suspense> boundary was found in the parent component tree. A component with async setup() must be nested in a <Suspense> in order to be rendered.`
            );
          }
        }
      } else {
        handleSetupResult(instance, setupResult, isSSR);
      }
    } else {
      finishComponentSetup(instance, isSSR);
    }
  }
  function handleSetupResult(instance, setupResult, isSSR) {
    if (isFunction(setupResult)) {
      if (instance.type.__ssrInlineRender) {
        instance.ssrRender = setupResult;
      } else {
        instance.render = setupResult;
      }
    } else if (isObject(setupResult)) {
      if (!!(define_process_env_default$2.NODE_ENV !== "production") && isVNode(setupResult)) {
        warn$1(
          `setup() should not return VNodes directly - return a render function instead.`
        );
      }
      if (!!(define_process_env_default$2.NODE_ENV !== "production") || false) {
        instance.devtoolsRawSetupState = setupResult;
      }
      instance.setupState = proxyRefs(setupResult);
      if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
        exposeSetupStateOnRenderContext(instance);
      }
    } else if (!!(define_process_env_default$2.NODE_ENV !== "production") && setupResult !== void 0) {
      warn$1(
        `setup() should return an object. Received: ${setupResult === null ? "null" : typeof setupResult}`
      );
    }
    finishComponentSetup(instance, isSSR);
  }
  const isRuntimeOnly = () => true;
  function finishComponentSetup(instance, isSSR, skipOptions) {
    const Component = instance.type;
    if (!instance.render) {
      instance.render = Component.render || NOOP;
    }
    {
      const reset = setCurrentInstance(instance);
      pauseTracking();
      try {
        applyOptions(instance);
      } finally {
        resetTracking();
        reset();
      }
    }
    if (!!(define_process_env_default$2.NODE_ENV !== "production") && !Component.render && instance.render === NOOP && !isSSR) {
      if (Component.template) {
        warn$1(
          `Component provided template option but runtime compilation is not supported in this build of Vue. Configure your bundler to alias "vue" to "vue/dist/vue.esm-bundler.js".`
        );
      } else {
        warn$1(`Component is missing template or render function: `, Component);
      }
    }
  }
  const attrsProxyHandlers = !!(define_process_env_default$2.NODE_ENV !== "production") ? {
    get(target, key) {
      markAttrsAccessed();
      track(target, "get", "");
      return target[key];
    },
    set() {
      warn$1(`setupContext.attrs is readonly.`);
      return false;
    },
    deleteProperty() {
      warn$1(`setupContext.attrs is readonly.`);
      return false;
    }
  } : {
    get(target, key) {
      track(target, "get", "");
      return target[key];
    }
  };
  function getSlotsProxy(instance) {
    return new Proxy(instance.slots, {
      get(target, key) {
        track(instance, "get", "$slots");
        return target[key];
      }
    });
  }
  function createSetupContext(instance) {
    const expose = (exposed) => {
      if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
        if (instance.exposed) {
          warn$1(`expose() should be called only once per setup().`);
        }
        if (exposed != null) {
          let exposedType = typeof exposed;
          if (exposedType === "object") {
            if (isArray(exposed)) {
              exposedType = "array";
            } else if (isRef(exposed)) {
              exposedType = "ref";
            }
          }
          if (exposedType !== "object") {
            warn$1(
              `expose() should be passed a plain object, received ${exposedType}.`
            );
          }
        }
      }
      instance.exposed = exposed || {};
    };
    if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
      let attrsProxy;
      let slotsProxy;
      return Object.freeze({
        get attrs() {
          return attrsProxy || (attrsProxy = new Proxy(instance.attrs, attrsProxyHandlers));
        },
        get slots() {
          return slotsProxy || (slotsProxy = getSlotsProxy(instance));
        },
        get emit() {
          return (event, ...args) => instance.emit(event, ...args);
        },
        expose
      });
    } else {
      return {
        attrs: new Proxy(instance.attrs, attrsProxyHandlers),
        slots: instance.slots,
        emit: instance.emit,
        expose
      };
    }
  }
  function getComponentPublicInstance(instance) {
    if (instance.exposed) {
      return instance.exposeProxy || (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
        get(target, key) {
          if (key in target) {
            return target[key];
          } else if (key in publicPropertiesMap) {
            return publicPropertiesMap[key](instance);
          }
        },
        has(target, key) {
          return key in target || key in publicPropertiesMap;
        }
      }));
    } else {
      return instance.proxy;
    }
  }
  const classifyRE = /(?:^|[-_])\w/g;
  const classify = (str) => str.replace(classifyRE, (c) => c.toUpperCase()).replace(/[-_]/g, "");
  function getComponentName(Component, includeInferred = true) {
    return isFunction(Component) ? Component.displayName || Component.name : Component.name || includeInferred && Component.__name;
  }
  function formatComponentName(instance, Component, isRoot = false) {
    let name = getComponentName(Component);
    if (!name && Component.__file) {
      const match = Component.__file.match(/([^/\\]+)\.\w+$/);
      if (match) {
        name = match[1];
      }
    }
    if (!name && instance) {
      const inferFromRegistry = (registry) => {
        for (const key in registry) {
          if (registry[key] === Component) {
            return key;
          }
        }
      };
      name = inferFromRegistry(instance.components) || instance.parent && inferFromRegistry(
        instance.parent.type.components
      ) || inferFromRegistry(instance.appContext.components);
    }
    return name ? classify(name) : isRoot ? `App` : `Anonymous`;
  }
  function isClassComponent(value) {
    return isFunction(value) && "__vccOpts" in value;
  }
  const computed = (getterOrOptions, debugOptions) => {
    const c = computed$1(getterOrOptions, debugOptions, isInSSRComponentSetup);
    if (!!(define_process_env_default$2.NODE_ENV !== "production")) {
      const i = getCurrentInstance();
      if (i && i.appContext.config.warnRecursiveComputed) {
        c._warnRecursive = true;
      }
    }
    return c;
  };
  function initCustomFormatter() {
    if (!!!(define_process_env_default$2.NODE_ENV !== "production") || typeof window === "undefined") {
      return;
    }
    const vueStyle = { style: "color:#3ba776" };
    const numberStyle = { style: "color:#1677ff" };
    const stringStyle = { style: "color:#f5222d" };
    const keywordStyle = { style: "color:#eb2f96" };
    const formatter = {
      __vue_custom_formatter: true,
      header(obj) {
        if (!isObject(obj)) {
          return null;
        }
        if (obj.__isVue) {
          return ["div", vueStyle, `VueInstance`];
        } else if (isRef(obj)) {
          pauseTracking();
          const value = obj.value;
          resetTracking();
          return [
            "div",
            {},
            ["span", vueStyle, genRefFlag(obj)],
            "<",
            formatValue(value),
            `>`
          ];
        } else if (isReactive(obj)) {
          return [
            "div",
            {},
            ["span", vueStyle, isShallow(obj) ? "ShallowReactive" : "Reactive"],
            "<",
            formatValue(obj),
            `>${isReadonly(obj) ? ` (readonly)` : ``}`
          ];
        } else if (isReadonly(obj)) {
          return [
            "div",
            {},
            ["span", vueStyle, isShallow(obj) ? "ShallowReadonly" : "Readonly"],
            "<",
            formatValue(obj),
            ">"
          ];
        }
        return null;
      },
      hasBody(obj) {
        return obj && obj.__isVue;
      },
      body(obj) {
        if (obj && obj.__isVue) {
          return [
            "div",
            {},
            ...formatInstance(obj.$)
          ];
        }
      }
    };
    function formatInstance(instance) {
      const blocks = [];
      if (instance.type.props && instance.props) {
        blocks.push(createInstanceBlock("props", toRaw(instance.props)));
      }
      if (instance.setupState !== EMPTY_OBJ) {
        blocks.push(createInstanceBlock("setup", instance.setupState));
      }
      if (instance.data !== EMPTY_OBJ) {
        blocks.push(createInstanceBlock("data", toRaw(instance.data)));
      }
      const computed2 = extractKeys(instance, "computed");
      if (computed2) {
        blocks.push(createInstanceBlock("computed", computed2));
      }
      const injected = extractKeys(instance, "inject");
      if (injected) {
        blocks.push(createInstanceBlock("injected", injected));
      }
      blocks.push([
        "div",
        {},
        [
          "span",
          {
            style: keywordStyle.style + ";opacity:0.66"
          },
          "$ (internal): "
        ],
        ["object", { object: instance }]
      ]);
      return blocks;
    }
    function createInstanceBlock(type, target) {
      target = extend({}, target);
      if (!Object.keys(target).length) {
        return ["span", {}];
      }
      return [
        "div",
        { style: "line-height:1.25em;margin-bottom:0.6em" },
        [
          "div",
          {
            style: "color:#476582"
          },
          type
        ],
        [
          "div",
          {
            style: "padding-left:1.25em"
          },
          ...Object.keys(target).map((key) => {
            return [
              "div",
              {},
              ["span", keywordStyle, key + ": "],
              formatValue(target[key], false)
            ];
          })
        ]
      ];
    }
    function formatValue(v, asRaw = true) {
      if (typeof v === "number") {
        return ["span", numberStyle, v];
      } else if (typeof v === "string") {
        return ["span", stringStyle, JSON.stringify(v)];
      } else if (typeof v === "boolean") {
        return ["span", keywordStyle, v];
      } else if (isObject(v)) {
        return ["object", { object: asRaw ? toRaw(v) : v }];
      } else {
        return ["span", stringStyle, String(v)];
      }
    }
    function extractKeys(instance, type) {
      const Comp = instance.type;
      if (isFunction(Comp)) {
        return;
      }
      const extracted = {};
      for (const key in instance.ctx) {
        if (isKeyOfType(Comp, key, type)) {
          extracted[key] = instance.ctx[key];
        }
      }
      return extracted;
    }
    function isKeyOfType(Comp, key, type) {
      const opts = Comp[type];
      if (isArray(opts) && opts.includes(key) || isObject(opts) && key in opts) {
        return true;
      }
      if (Comp.extends && isKeyOfType(Comp.extends, key, type)) {
        return true;
      }
      if (Comp.mixins && Comp.mixins.some((m) => isKeyOfType(m, key, type))) {
        return true;
      }
    }
    function genRefFlag(v) {
      if (isShallow(v)) {
        return `ShallowRef`;
      }
      if (v.effect) {
        return `ComputedRef`;
      }
      return `Ref`;
    }
    if (window.devtoolsFormatters) {
      window.devtoolsFormatters.push(formatter);
    } else {
      window.devtoolsFormatters = [formatter];
    }
  }
  const version = "3.5.26";
  const warn = !!(define_process_env_default$2.NODE_ENV !== "production") ? warn$1 : NOOP;
  var define_process_env_default$1 = {};
  let policy = void 0;
  const tt = typeof window !== "undefined" && window.trustedTypes;
  if (tt) {
    try {
      policy = /* @__PURE__ */ tt.createPolicy("vue", {
        createHTML: (val) => val
      });
    } catch (e) {
      !!(define_process_env_default$1.NODE_ENV !== "production") && warn(`Error creating trusted types policy: ${e}`);
    }
  }
  const unsafeToTrustedHTML = policy ? (val) => policy.createHTML(val) : (val) => val;
  const svgNS = "http://www.w3.org/2000/svg";
  const mathmlNS = "http://www.w3.org/1998/Math/MathML";
  const doc = typeof document !== "undefined" ? document : null;
  const templateContainer = doc && /* @__PURE__ */ doc.createElement("template");
  const nodeOps = {
    insert: (child, parent, anchor) => {
      parent.insertBefore(child, anchor || null);
    },
    remove: (child) => {
      const parent = child.parentNode;
      if (parent) {
        parent.removeChild(child);
      }
    },
    createElement: (tag, namespace, is, props) => {
      const el = namespace === "svg" ? doc.createElementNS(svgNS, tag) : namespace === "mathml" ? doc.createElementNS(mathmlNS, tag) : is ? doc.createElement(tag, { is }) : doc.createElement(tag);
      if (tag === "select" && props && props.multiple != null) {
        el.setAttribute("multiple", props.multiple);
      }
      return el;
    },
    createText: (text) => doc.createTextNode(text),
    createComment: (text) => doc.createComment(text),
    setText: (node, text) => {
      node.nodeValue = text;
    },
    setElementText: (el, text) => {
      el.textContent = text;
    },
    parentNode: (node) => node.parentNode,
    nextSibling: (node) => node.nextSibling,
    querySelector: (selector) => doc.querySelector(selector),
    setScopeId(el, id) {
      el.setAttribute(id, "");
    },
    // __UNSAFE__
    // Reason: innerHTML.
    // Static content here can only come from compiled templates.
    // As long as the user only uses trusted templates, this is safe.
    insertStaticContent(content, parent, anchor, namespace, start, end) {
      const before = anchor ? anchor.previousSibling : parent.lastChild;
      if (start && (start === end || start.nextSibling)) {
        while (true) {
          parent.insertBefore(start.cloneNode(true), anchor);
          if (start === end || !(start = start.nextSibling)) break;
        }
      } else {
        templateContainer.innerHTML = unsafeToTrustedHTML(
          namespace === "svg" ? `<svg>${content}</svg>` : namespace === "mathml" ? `<math>${content}</math>` : content
        );
        const template = templateContainer.content;
        if (namespace === "svg" || namespace === "mathml") {
          const wrapper = template.firstChild;
          while (wrapper.firstChild) {
            template.appendChild(wrapper.firstChild);
          }
          template.removeChild(wrapper);
        }
        parent.insertBefore(template, anchor);
      }
      return [
        // first
        before ? before.nextSibling : parent.firstChild,
        // last
        anchor ? anchor.previousSibling : parent.lastChild
      ];
    }
  };
  const vtcKey = /* @__PURE__ */ Symbol("_vtc");
  function patchClass(el, value, isSVG) {
    const transitionClasses = el[vtcKey];
    if (transitionClasses) {
      value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(" ");
    }
    if (value == null) {
      el.removeAttribute("class");
    } else if (isSVG) {
      el.setAttribute("class", value);
    } else {
      el.className = value;
    }
  }
  const vShowOriginalDisplay = /* @__PURE__ */ Symbol("_vod");
  const vShowHidden = /* @__PURE__ */ Symbol("_vsh");
  const CSS_VAR_TEXT = /* @__PURE__ */ Symbol(!!(define_process_env_default$1.NODE_ENV !== "production") ? "CSS_VAR_TEXT" : "");
  const displayRE = /(?:^|;)\s*display\s*:/;
  function patchStyle(el, prev, next) {
    const style = el.style;
    const isCssString = isString(next);
    let hasControlledDisplay = false;
    if (next && !isCssString) {
      if (prev) {
        if (!isString(prev)) {
          for (const key in prev) {
            if (next[key] == null) {
              setStyle(style, key, "");
            }
          }
        } else {
          for (const prevStyle of prev.split(";")) {
            const key = prevStyle.slice(0, prevStyle.indexOf(":")).trim();
            if (next[key] == null) {
              setStyle(style, key, "");
            }
          }
        }
      }
      for (const key in next) {
        if (key === "display") {
          hasControlledDisplay = true;
        }
        setStyle(style, key, next[key]);
      }
    } else {
      if (isCssString) {
        if (prev !== next) {
          const cssVarText = style[CSS_VAR_TEXT];
          if (cssVarText) {
            next += ";" + cssVarText;
          }
          style.cssText = next;
          hasControlledDisplay = displayRE.test(next);
        }
      } else if (prev) {
        el.removeAttribute("style");
      }
    }
    if (vShowOriginalDisplay in el) {
      el[vShowOriginalDisplay] = hasControlledDisplay ? style.display : "";
      if (el[vShowHidden]) {
        style.display = "none";
      }
    }
  }
  const semicolonRE = /[^\\];\s*$/;
  const importantRE = /\s*!important$/;
  function setStyle(style, name, val) {
    if (isArray(val)) {
      val.forEach((v) => setStyle(style, name, v));
    } else {
      if (val == null) val = "";
      if (!!(define_process_env_default$1.NODE_ENV !== "production")) {
        if (semicolonRE.test(val)) {
          warn(
            `Unexpected semicolon at the end of '${name}' style value: '${val}'`
          );
        }
      }
      if (name.startsWith("--")) {
        style.setProperty(name, val);
      } else {
        const prefixed = autoPrefix(style, name);
        if (importantRE.test(val)) {
          style.setProperty(
            hyphenate(prefixed),
            val.replace(importantRE, ""),
            "important"
          );
        } else {
          style[prefixed] = val;
        }
      }
    }
  }
  const prefixes = ["Webkit", "Moz", "ms"];
  const prefixCache = {};
  function autoPrefix(style, rawName) {
    const cached = prefixCache[rawName];
    if (cached) {
      return cached;
    }
    let name = camelize(rawName);
    if (name !== "filter" && name in style) {
      return prefixCache[rawName] = name;
    }
    name = capitalize(name);
    for (let i = 0; i < prefixes.length; i++) {
      const prefixed = prefixes[i] + name;
      if (prefixed in style) {
        return prefixCache[rawName] = prefixed;
      }
    }
    return rawName;
  }
  const xlinkNS = "http://www.w3.org/1999/xlink";
  function patchAttr(el, key, value, isSVG, instance, isBoolean2 = isSpecialBooleanAttr(key)) {
    if (isSVG && key.startsWith("xlink:")) {
      if (value == null) {
        el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
      } else {
        el.setAttributeNS(xlinkNS, key, value);
      }
    } else {
      if (value == null || isBoolean2 && !includeBooleanAttr(value)) {
        el.removeAttribute(key);
      } else {
        el.setAttribute(
          key,
          isBoolean2 ? "" : isSymbol(value) ? String(value) : value
        );
      }
    }
  }
  function patchDOMProp(el, key, value, parentComponent, attrName) {
    if (key === "innerHTML" || key === "textContent") {
      if (value != null) {
        el[key] = key === "innerHTML" ? unsafeToTrustedHTML(value) : value;
      }
      return;
    }
    const tag = el.tagName;
    if (key === "value" && tag !== "PROGRESS" && // custom elements may use _value internally
    !tag.includes("-")) {
      const oldValue = tag === "OPTION" ? el.getAttribute("value") || "" : el.value;
      const newValue = value == null ? (
        // #11647: value should be set as empty string for null and undefined,
        // but <input type="checkbox"> should be set as 'on'.
        el.type === "checkbox" ? "on" : ""
      ) : String(value);
      if (oldValue !== newValue || !("_value" in el)) {
        el.value = newValue;
      }
      if (value == null) {
        el.removeAttribute(key);
      }
      el._value = value;
      return;
    }
    let needRemove = false;
    if (value === "" || value == null) {
      const type = typeof el[key];
      if (type === "boolean") {
        value = includeBooleanAttr(value);
      } else if (value == null && type === "string") {
        value = "";
        needRemove = true;
      } else if (type === "number") {
        value = 0;
        needRemove = true;
      }
    }
    try {
      el[key] = value;
    } catch (e) {
      if (!!(define_process_env_default$1.NODE_ENV !== "production") && !needRemove) {
        warn(
          `Failed setting prop "${key}" on <${tag.toLowerCase()}>: value ${value} is invalid.`,
          e
        );
      }
    }
    needRemove && el.removeAttribute(attrName || key);
  }
  function addEventListener(el, event, handler, options) {
    el.addEventListener(event, handler, options);
  }
  function removeEventListener(el, event, handler, options) {
    el.removeEventListener(event, handler, options);
  }
  const veiKey = /* @__PURE__ */ Symbol("_vei");
  function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
    const invokers = el[veiKey] || (el[veiKey] = {});
    const existingInvoker = invokers[rawName];
    if (nextValue && existingInvoker) {
      existingInvoker.value = !!(define_process_env_default$1.NODE_ENV !== "production") ? sanitizeEventValue(nextValue, rawName) : nextValue;
    } else {
      const [name, options] = parseName(rawName);
      if (nextValue) {
        const invoker = invokers[rawName] = createInvoker(
          !!(define_process_env_default$1.NODE_ENV !== "production") ? sanitizeEventValue(nextValue, rawName) : nextValue,
          instance
        );
        addEventListener(el, name, invoker, options);
      } else if (existingInvoker) {
        removeEventListener(el, name, existingInvoker, options);
        invokers[rawName] = void 0;
      }
    }
  }
  const optionsModifierRE = /(?:Once|Passive|Capture)$/;
  function parseName(name) {
    let options;
    if (optionsModifierRE.test(name)) {
      options = {};
      let m;
      while (m = name.match(optionsModifierRE)) {
        name = name.slice(0, name.length - m[0].length);
        options[m[0].toLowerCase()] = true;
      }
    }
    const event = name[2] === ":" ? name.slice(3) : hyphenate(name.slice(2));
    return [event, options];
  }
  let cachedNow = 0;
  const p = /* @__PURE__ */ Promise.resolve();
  const getNow = () => cachedNow || (p.then(() => cachedNow = 0), cachedNow = Date.now());
  function createInvoker(initialValue, instance) {
    const invoker = (e) => {
      if (!e._vts) {
        e._vts = Date.now();
      } else if (e._vts <= invoker.attached) {
        return;
      }
      callWithAsyncErrorHandling(
        patchStopImmediatePropagation(e, invoker.value),
        instance,
        5,
        [e]
      );
    };
    invoker.value = initialValue;
    invoker.attached = getNow();
    return invoker;
  }
  function sanitizeEventValue(value, propName) {
    if (isFunction(value) || isArray(value)) {
      return value;
    }
    warn(
      `Wrong type passed as event handler to ${propName} - did you forget @ or : in front of your prop?
Expected function or array of functions, received type ${typeof value}.`
    );
    return NOOP;
  }
  function patchStopImmediatePropagation(e, value) {
    if (isArray(value)) {
      const originalStop = e.stopImmediatePropagation;
      e.stopImmediatePropagation = () => {
        originalStop.call(e);
        e._stopped = true;
      };
      return value.map(
        (fn) => (e2) => !e2._stopped && fn && fn(e2)
      );
    } else {
      return value;
    }
  }
  const isNativeOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // lowercase letter
  key.charCodeAt(2) > 96 && key.charCodeAt(2) < 123;
  const patchProp = (el, key, prevValue, nextValue, namespace, parentComponent) => {
    const isSVG = namespace === "svg";
    if (key === "class") {
      patchClass(el, nextValue, isSVG);
    } else if (key === "style") {
      patchStyle(el, prevValue, nextValue);
    } else if (isOn(key)) {
      if (!isModelListener(key)) {
        patchEvent(el, key, prevValue, nextValue, parentComponent);
      }
    } else if (key[0] === "." ? (key = key.slice(1), true) : key[0] === "^" ? (key = key.slice(1), false) : shouldSetAsProp(el, key, nextValue, isSVG)) {
      patchDOMProp(el, key, nextValue);
      if (!el.tagName.includes("-") && (key === "value" || key === "checked" || key === "selected")) {
        patchAttr(el, key, nextValue, isSVG, parentComponent, key !== "value");
      }
    } else if (
      // #11081 force set props for possible async custom element
      el._isVueCE && (/[A-Z]/.test(key) || !isString(nextValue))
    ) {
      patchDOMProp(el, camelize(key), nextValue, parentComponent, key);
    } else {
      if (key === "true-value") {
        el._trueValue = nextValue;
      } else if (key === "false-value") {
        el._falseValue = nextValue;
      }
      patchAttr(el, key, nextValue, isSVG);
    }
  };
  function shouldSetAsProp(el, key, value, isSVG) {
    if (isSVG) {
      if (key === "innerHTML" || key === "textContent") {
        return true;
      }
      if (key in el && isNativeOn(key) && isFunction(value)) {
        return true;
      }
      return false;
    }
    if (key === "spellcheck" || key === "draggable" || key === "translate" || key === "autocorrect") {
      return false;
    }
    if (key === "sandbox" && el.tagName === "IFRAME") {
      return false;
    }
    if (key === "form") {
      return false;
    }
    if (key === "list" && el.tagName === "INPUT") {
      return false;
    }
    if (key === "type" && el.tagName === "TEXTAREA") {
      return false;
    }
    if (key === "width" || key === "height") {
      const tag = el.tagName;
      if (tag === "IMG" || tag === "VIDEO" || tag === "CANVAS" || tag === "SOURCE") {
        return false;
      }
    }
    if (isNativeOn(key) && isString(value)) {
      return false;
    }
    return key in el;
  }
  const getModelAssigner = (vnode) => {
    const fn = vnode.props["onUpdate:modelValue"] || false;
    return isArray(fn) ? (value) => invokeArrayFns(fn, value) : fn;
  };
  function onCompositionStart(e) {
    e.target.composing = true;
  }
  function onCompositionEnd(e) {
    const target = e.target;
    if (target.composing) {
      target.composing = false;
      target.dispatchEvent(new Event("input"));
    }
  }
  const assignKey = /* @__PURE__ */ Symbol("_assign");
  function castValue(value, trim, number) {
    if (trim) value = value.trim();
    if (number) value = looseToNumber(value);
    return value;
  }
  const vModelText = {
    created(el, { modifiers: { lazy, trim, number } }, vnode) {
      el[assignKey] = getModelAssigner(vnode);
      const castToNumber = number || vnode.props && vnode.props.type === "number";
      addEventListener(el, lazy ? "change" : "input", (e) => {
        if (e.target.composing) return;
        el[assignKey](castValue(el.value, trim, castToNumber));
      });
      if (trim || castToNumber) {
        addEventListener(el, "change", () => {
          el.value = castValue(el.value, trim, castToNumber);
        });
      }
      if (!lazy) {
        addEventListener(el, "compositionstart", onCompositionStart);
        addEventListener(el, "compositionend", onCompositionEnd);
        addEventListener(el, "change", onCompositionEnd);
      }
    },
    // set value on mounted so it's after min/max for type="range"
    mounted(el, { value }) {
      el.value = value == null ? "" : value;
    },
    beforeUpdate(el, { value, oldValue, modifiers: { lazy, trim, number } }, vnode) {
      el[assignKey] = getModelAssigner(vnode);
      if (el.composing) return;
      const elValue = (number || el.type === "number") && !/^0\d/.test(el.value) ? looseToNumber(el.value) : el.value;
      const newValue = value == null ? "" : value;
      if (elValue === newValue) {
        return;
      }
      if (document.activeElement === el && el.type !== "range") {
        if (lazy && value === oldValue) {
          return;
        }
        if (trim && el.value.trim() === newValue) {
          return;
        }
      }
      el.value = newValue;
    }
  };
  const vModelCheckbox = {
    // #4096 array checkboxes need to be deep traversed
    deep: true,
    created(el, _, vnode) {
      el[assignKey] = getModelAssigner(vnode);
      addEventListener(el, "change", () => {
        const modelValue = el._modelValue;
        const elementValue = getValue(el);
        const checked = el.checked;
        const assign = el[assignKey];
        if (isArray(modelValue)) {
          const index = looseIndexOf(modelValue, elementValue);
          const found = index !== -1;
          if (checked && !found) {
            assign(modelValue.concat(elementValue));
          } else if (!checked && found) {
            const filtered = [...modelValue];
            filtered.splice(index, 1);
            assign(filtered);
          }
        } else if (isSet(modelValue)) {
          const cloned = new Set(modelValue);
          if (checked) {
            cloned.add(elementValue);
          } else {
            cloned.delete(elementValue);
          }
          assign(cloned);
        } else {
          assign(getCheckboxValue(el, checked));
        }
      });
    },
    // set initial checked on mount to wait for true-value/false-value
    mounted: setChecked,
    beforeUpdate(el, binding, vnode) {
      el[assignKey] = getModelAssigner(vnode);
      setChecked(el, binding, vnode);
    }
  };
  function setChecked(el, { value, oldValue }, vnode) {
    el._modelValue = value;
    let checked;
    if (isArray(value)) {
      checked = looseIndexOf(value, vnode.props.value) > -1;
    } else if (isSet(value)) {
      checked = value.has(vnode.props.value);
    } else {
      if (value === oldValue) return;
      checked = looseEqual(value, getCheckboxValue(el, true));
    }
    if (el.checked !== checked) {
      el.checked = checked;
    }
  }
  const vModelSelect = {
    // <select multiple> value need to be deep traversed
    deep: true,
    created(el, { value, modifiers: { number } }, vnode) {
      const isSetModel = isSet(value);
      addEventListener(el, "change", () => {
        const selectedVal = Array.prototype.filter.call(el.options, (o) => o.selected).map(
          (o) => number ? looseToNumber(getValue(o)) : getValue(o)
        );
        el[assignKey](
          el.multiple ? isSetModel ? new Set(selectedVal) : selectedVal : selectedVal[0]
        );
        el._assigning = true;
        nextTick(() => {
          el._assigning = false;
        });
      });
      el[assignKey] = getModelAssigner(vnode);
    },
    // set value in mounted & updated because <select> relies on its children
    // <option>s.
    mounted(el, { value }) {
      setSelected(el, value);
    },
    beforeUpdate(el, _binding, vnode) {
      el[assignKey] = getModelAssigner(vnode);
    },
    updated(el, { value }) {
      if (!el._assigning) {
        setSelected(el, value);
      }
    }
  };
  function setSelected(el, value) {
    const isMultiple = el.multiple;
    const isArrayValue = isArray(value);
    if (isMultiple && !isArrayValue && !isSet(value)) {
      !!(define_process_env_default$1.NODE_ENV !== "production") && warn(
        `<select multiple v-model> expects an Array or Set value for its binding, but got ${Object.prototype.toString.call(value).slice(8, -1)}.`
      );
      return;
    }
    for (let i = 0, l = el.options.length; i < l; i++) {
      const option = el.options[i];
      const optionValue = getValue(option);
      if (isMultiple) {
        if (isArrayValue) {
          const optionType = typeof optionValue;
          if (optionType === "string" || optionType === "number") {
            option.selected = value.some((v) => String(v) === String(optionValue));
          } else {
            option.selected = looseIndexOf(value, optionValue) > -1;
          }
        } else {
          option.selected = value.has(optionValue);
        }
      } else if (looseEqual(getValue(option), value)) {
        if (el.selectedIndex !== i) el.selectedIndex = i;
        return;
      }
    }
    if (!isMultiple && el.selectedIndex !== -1) {
      el.selectedIndex = -1;
    }
  }
  function getValue(el) {
    return "_value" in el ? el._value : el.value;
  }
  function getCheckboxValue(el, checked) {
    const key = checked ? "_trueValue" : "_falseValue";
    return key in el ? el[key] : checked;
  }
  const systemModifiers = ["ctrl", "shift", "alt", "meta"];
  const modifierGuards = {
    stop: (e) => e.stopPropagation(),
    prevent: (e) => e.preventDefault(),
    self: (e) => e.target !== e.currentTarget,
    ctrl: (e) => !e.ctrlKey,
    shift: (e) => !e.shiftKey,
    alt: (e) => !e.altKey,
    meta: (e) => !e.metaKey,
    left: (e) => "button" in e && e.button !== 0,
    middle: (e) => "button" in e && e.button !== 1,
    right: (e) => "button" in e && e.button !== 2,
    exact: (e, modifiers) => systemModifiers.some((m) => e[`${m}Key`] && !modifiers.includes(m))
  };
  const withModifiers = (fn, modifiers) => {
    const cache = fn._withMods || (fn._withMods = {});
    const cacheKey = modifiers.join(".");
    return cache[cacheKey] || (cache[cacheKey] = ((event, ...args) => {
      for (let i = 0; i < modifiers.length; i++) {
        const guard = modifierGuards[modifiers[i]];
        if (guard && guard(event, modifiers)) return;
      }
      return fn(event, ...args);
    }));
  };
  const rendererOptions = /* @__PURE__ */ extend({ patchProp }, nodeOps);
  let renderer;
  function ensureRenderer() {
    return renderer || (renderer = createRenderer(rendererOptions));
  }
  const createApp = ((...args) => {
    const app = ensureRenderer().createApp(...args);
    if (!!(define_process_env_default$1.NODE_ENV !== "production")) {
      injectNativeTagCheck(app);
      injectCompilerOptionsCheck(app);
    }
    const { mount } = app;
    app.mount = (containerOrSelector) => {
      const container = normalizeContainer(containerOrSelector);
      if (!container) return;
      const component = app._component;
      if (!isFunction(component) && !component.render && !component.template) {
        component.template = container.innerHTML;
      }
      if (container.nodeType === 1) {
        container.textContent = "";
      }
      const proxy = mount(container, false, resolveRootNamespace(container));
      if (container instanceof Element) {
        container.removeAttribute("v-cloak");
        container.setAttribute("data-v-app", "");
      }
      return proxy;
    };
    return app;
  });
  function resolveRootNamespace(container) {
    if (container instanceof SVGElement) {
      return "svg";
    }
    if (typeof MathMLElement === "function" && container instanceof MathMLElement) {
      return "mathml";
    }
  }
  function injectNativeTagCheck(app) {
    Object.defineProperty(app.config, "isNativeTag", {
      value: (tag) => isHTMLTag(tag) || isSVGTag(tag) || isMathMLTag(tag),
      writable: false
    });
  }
  function injectCompilerOptionsCheck(app) {
    {
      const isCustomElement = app.config.isCustomElement;
      Object.defineProperty(app.config, "isCustomElement", {
        get() {
          return isCustomElement;
        },
        set() {
          warn(
            `The \`isCustomElement\` config option is deprecated. Use \`compilerOptions.isCustomElement\` instead.`
          );
        }
      });
      const compilerOptions = app.config.compilerOptions;
      const msg = `The \`compilerOptions\` config option is only respected when using a build of Vue.js that includes the runtime compiler (aka "full build"). Since you are using the runtime-only build, \`compilerOptions\` must be passed to \`@vue/compiler-dom\` in the build setup instead.
- For vue-loader: pass it via vue-loader's \`compilerOptions\` loader option.
- For vue-cli: see https://cli.vuejs.org/guide/webpack.html#modifying-options-of-a-loader
- For vite: pass it via @vitejs/plugin-vue options. See https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#example-for-passing-options-to-vuecompiler-sfc`;
      Object.defineProperty(app.config, "compilerOptions", {
        get() {
          warn(msg);
          return compilerOptions;
        },
        set() {
          warn(msg);
        }
      });
    }
  }
  function normalizeContainer(container) {
    if (isString(container)) {
      const res = document.querySelector(container);
      if (!!(define_process_env_default$1.NODE_ENV !== "production") && !res) {
        warn(
          `Failed to mount app: mount target selector "${container}" returned null.`
        );
      }
      return res;
    }
    if (!!(define_process_env_default$1.NODE_ENV !== "production") && window.ShadowRoot && container instanceof window.ShadowRoot && container.mode === "closed") {
      warn(
        `mounting on a ShadowRoot with \`{mode: "closed"}\` may lead to unpredictable bugs`
      );
    }
    return container;
  }
  var define_process_env_default = {};
  function initDev() {
    {
      initCustomFormatter();
    }
  }
  if (!!(define_process_env_default.NODE_ENV !== "production")) {
    initDev();
  }
  const _hoisted_1$b = { key: 0 };
  const _sfc_main$b = {
    __name: "Header",
    props: {
      isConnected: Boolean,
      isConnecting: Boolean,
      connectionStatus: String,
      totalDevices: Number,
      totalPgns: Number
    },
    setup(__props) {
      return (_ctx, _cache) => {
        return openBlock(), createElementBlock("header", null, [
          _cache[7] || (_cache[7] = createBaseVNode("h1", null, "NMEA live analysis", -1)),
          createBaseVNode("div", {
            class: normalizeClass([{ connected: __props.isConnected }, "status"])
          }, [
            _cache[6] || (_cache[6] = createBaseVNode("div", { class: "status-dot" }, null, -1)),
            createBaseVNode("span", null, toDisplayString(__props.connectionStatus), 1),
            __props.isConnected ? (openBlock(), createElementBlock("span", _hoisted_1$b, "• " + toDisplayString(__props.totalDevices) + " devices • " + toDisplayString(__props.totalPgns) + " PGNs/sentences", 1)) : createCommentVNode("", true),
            !__props.isConnected ? (openBlock(), createElementBlock("button", {
              key: 1,
              class: "btn btn-primary btn-sm",
              onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("connectWebSocket"))
            }, [
              createBaseVNode("i", {
                class: normalizeClass([__props.isConnecting ? "btn-fa-plug-circle-bolt" : "fa-plug", "fas fa-plug"])
              }, null, 2),
              _cache[3] || (_cache[3] = createTextVNode(" Connect ", -1))
            ])) : __props.isConnecting ? (openBlock(), createElementBlock("button", {
              key: 2,
              class: "btn btn-primary btn-sm",
              onClick: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("connectWebSocket"))
            }, [
              createBaseVNode("i", {
                class: normalizeClass([__props.isConnecting ? "btn-fa-plug-circle-bolt" : "fa-plug", "fas fa-plug-circle-bolt"])
              }, null, 2),
              _cache[4] || (_cache[4] = createTextVNode(" Connecting ", -1))
            ])) : createCommentVNode("", true),
            __props.isConnected ? (openBlock(), createElementBlock("button", {
              key: 3,
              class: "btn btn-danger btn-sm",
              onClick: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("disconnectWebSocket"))
            }, [..._cache[5] || (_cache[5] = [
              createBaseVNode("i", { class: "fas fa-plug-circle-minus" }, null, -1),
              createTextVNode(" Disconnect ", -1)
            ])])) : createCommentVNode("", true)
          ], 2)
        ]);
      };
    }
  };
  const _hoisted_1$a = { class: "stats-bar" };
  const _hoisted_2$9 = { class: "stat-card" };
  const _hoisted_3$8 = { class: "stat-number" };
  const _hoisted_4$8 = { class: "stat-card" };
  const _hoisted_5$8 = { class: "stat-number" };
  const _hoisted_6$8 = { class: "stat-card" };
  const _hoisted_7$6 = { class: "stat-number" };
  const _sfc_main$a = {
    __name: "StatsBar",
    props: {
      totalDevices: Number,
      totalPgns: Number,
      totalUpdates: Number,
      historyLength: Number
    },
    setup(__props) {
      return (_ctx, _cache) => {
        return openBlock(), createElementBlock("div", _hoisted_1$a, [
          createBaseVNode("div", _hoisted_2$9, [
            createBaseVNode("div", _hoisted_3$8, toDisplayString(__props.totalDevices), 1),
            _cache[0] || (_cache[0] = createBaseVNode("div", { class: "stat-label" }, "Devices", -1))
          ]),
          createBaseVNode("div", _hoisted_4$8, [
            createBaseVNode("div", _hoisted_5$8, toDisplayString(__props.totalPgns), 1),
            _cache[1] || (_cache[1] = createBaseVNode("div", { class: "stat-label" }, "Active PGNs", -1))
          ]),
          createBaseVNode("div", _hoisted_6$8, [
            createBaseVNode("div", _hoisted_7$6, toDisplayString(__props.totalUpdates), 1),
            _cache[2] || (_cache[2] = createBaseVNode("div", { class: "stat-label" }, "Total Updates", -1))
          ])
        ]);
      };
    }
  };
  const _hoisted_1$9 = { class: "controls" };
  const _hoisted_2$8 = ["value"];
  const _hoisted_3$7 = ["value"];
  const _hoisted_4$7 = ["value"];
  const _hoisted_5$7 = ["value"];
  const _hoisted_6$7 = ["value"];
  const _sfc_main$9 = {
    __name: "Controls",
    props: {
      freezePGNs: Boolean,
      autoUpdate: Boolean,
      searchQuery: String,
      serverFilter: String,
      pgnFilter: String,
      serversList: Array,
      uniquePgns: Array
    },
    emits: [
      "update:autoUpdate",
      "update:searchQuery",
      "update:serverFilter",
      "update:pgnFilter",
      "toggle-auto-update",
      "toggleFreezePGNs"
    ],
    setup(__props, { emit: __emit }) {
      const props = __props;
      const emit2 = __emit;
      function toggleAutoUpdate() {
        emit2("update:autoUpdate", !props.autoUpdate);
      }
      return (_ctx, _cache) => {
        return openBlock(), createElementBlock("div", _hoisted_1$9, [
          createBaseVNode("button", {
            class: "btn",
            onClick: toggleAutoUpdate
          }, [
            createBaseVNode("i", {
              class: normalizeClass(__props.autoUpdate ? "fas fa-pause" : "fas fa-play")
            }, null, 2),
            createTextVNode(" " + toDisplayString(__props.autoUpdate ? "Pause Updates" : "Resume Updates"), 1)
          ]),
          createBaseVNode("button", {
            class: "btn btn-outline",
            onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("toggleFreezePGNs"))
          }, [
            !__props.freezePGNs ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
              _cache[4] || (_cache[4] = createBaseVNode("i", { class: "fas fa-play" }, null, -1)),
              _cache[5] || (_cache[5] = createTextVNode(" Pause display ", -1))
            ], 64)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
              _cache[6] || (_cache[6] = createBaseVNode("i", { class: "fas fa-pause" }, null, -1)),
              _cache[7] || (_cache[7] = createTextVNode(" Resume live update ", -1))
            ], 64))
          ]),
          createBaseVNode("input", {
            value: __props.searchQuery,
            class: "search",
            placeholder: "Search PGNs or fields...",
            onInput: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("update:searchQuery", $event.target.value))
          }, null, 40, _hoisted_2$8),
          createBaseVNode("select", {
            value: __props.serverFilter,
            class: "search",
            onChange: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("update:serverFilter", $event.target.value))
          }, [
            _cache[8] || (_cache[8] = createBaseVNode("option", { value: "" }, "All Servers", -1)),
            (openBlock(true), createElementBlock(Fragment, null, renderList(__props.serversList, (server) => {
              return openBlock(), createElementBlock("option", {
                key: server,
                value: server
              }, " Server " + toDisplayString(server), 9, _hoisted_4$7);
            }), 128))
          ], 40, _hoisted_3$7),
          createBaseVNode("select", {
            value: __props.pgnFilter,
            class: "search",
            onChange: _cache[3] || (_cache[3] = ($event) => _ctx.$emit("update:pgnFilter", $event.target.value))
          }, [
            _cache[9] || (_cache[9] = createBaseVNode("option", { value: "" }, "All PGNs", -1)),
            (openBlock(true), createElementBlock(Fragment, null, renderList(__props.uniquePgns, (pgn) => {
              return openBlock(), createElementBlock("option", {
                key: pgn,
                value: pgn
              }, " PGN " + toDisplayString(pgn), 9, _hoisted_6$7);
            }), 128))
          ], 40, _hoisted_5$7)
        ]);
      };
    }
  };
  const _hoisted_1$8 = { class: "device-name" };
  const _hoisted_2$7 = { class: "device-src" };
  const _hoisted_3$6 = { class: "device-stats" };
  const _hoisted_4$6 = { class: "device-stat" };
  const _hoisted_5$6 = { class: "device-stat-value" };
  const _hoisted_6$6 = { class: "device-stat" };
  const _hoisted_7$5 = { class: "device-stat-value" };
  const _hoisted_8$4 = { class: "device-stat" };
  const _hoisted_9$4 = { class: "device-stat-value" };
  const _hoisted_10$4 = { class: "device-stat" };
  const _hoisted_11$4 = { class: "device-stat-value" };
  const _hoisted_12$4 = { class: "pgn-list" };
  const _hoisted_13$3 = ["onClick"];
  const _hoisted_14$3 = { class: "server-list" };
  const _sfc_main$8 = {
    __name: "DeviceCard",
    props: {
      device: Object,
      selected: Boolean,
      pgnFilter: [String, Number],
      serverFilter: [String, Number]
    },
    emits: ["selectDevice", "filterPgn"],
    setup(__props) {
      function formatTime(timestamp, short = false) {
        if (!timestamp) return "N/A";
        const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
        const now = /* @__PURE__ */ new Date();
        const diff = now - date;
        if (short) {
          const minutes = Math.floor(diff / 6e4);
          if (minutes < 1) return "Just now";
          if (minutes < 60) return `${minutes}m ago`;
          return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        }
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          fractionalSecondDigits: 3
        });
      }
      return (_ctx, _cache) => {
        return openBlock(), createElementBlock("div", {
          class: normalizeClass([{ active: __props.selected }, "device-card"]),
          onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("selectDevice", __props.device.src))
        }, [
          createBaseVNode("div", _hoisted_1$8, [
            createBaseVNode("span", null, toDisplayString(__props.device.name), 1),
            createBaseVNode("span", _hoisted_2$7, "SRC: " + toDisplayString(__props.device.src), 1)
          ]),
          createBaseVNode("div", _hoisted_3$6, [
            createBaseVNode("div", _hoisted_4$6, [
              _cache[1] || (_cache[1] = createBaseVNode("div", { class: "device-stat-label" }, "PGNs", -1)),
              createBaseVNode("div", _hoisted_5$6, toDisplayString(__props.device.pgnCount), 1)
            ]),
            createBaseVNode("div", _hoisted_6$6, [
              _cache[2] || (_cache[2] = createBaseVNode("div", { class: "device-stat-label" }, "Updates", -1)),
              createBaseVNode("div", _hoisted_7$5, toDisplayString(__props.device.updates), 1)
            ]),
            createBaseVNode("div", _hoisted_8$4, [
              _cache[3] || (_cache[3] = createBaseVNode("div", { class: "device-stat-label" }, "First Seen", -1)),
              createBaseVNode("div", _hoisted_9$4, toDisplayString(formatTime(__props.device.firstSeen, true)), 1)
            ]),
            createBaseVNode("div", _hoisted_10$4, [
              _cache[4] || (_cache[4] = createBaseVNode("div", { class: "device-stat-label" }, "Last Seen", -1)),
              createBaseVNode("div", _hoisted_11$4, toDisplayString(formatTime(__props.device.lastSeen, true)), 1)
            ])
          ]),
          createBaseVNode("div", _hoisted_12$4, [
            _cache[5] || (_cache[5] = createTextVNode(" PGN's: ", -1)),
            (openBlock(true), createElementBlock(Fragment, null, renderList(__props.device.pgns, ([pgn, pgnInfo]) => {
              return openBlock(), createElementBlock("span", {
                key: pgn,
                class: normalizeClass({ "item": true, "active": pgn == __props.pgnFilter }),
                onClick: withModifiers(($event) => _ctx.$emit("filterPgn", pgn), ["stop"])
              }, toDisplayString(pgn), 11, _hoisted_13$3);
            }), 128))
          ]),
          createBaseVNode("div", _hoisted_14$3, [
            _cache[6] || (_cache[6] = createTextVNode(" Servers: ", -1)),
            (openBlock(true), createElementBlock(Fragment, null, renderList(__props.device.servers, (server) => {
              return openBlock(), createElementBlock("span", {
                key: server,
                class: normalizeClass({ "item": true, "active": server == __props.serverFilter })
              }, toDisplayString(server), 3);
            }), 128))
          ])
        ], 2);
      };
    }
  };
  const _hoisted_1$7 = { class: "panel" };
  const _hoisted_2$6 = { class: "panel-header" };
  const _hoisted_3$5 = {
    class: "stat-number",
    style: { "font-size": "1.5rem" }
  };
  const _hoisted_4$5 = { class: "panel-content" };
  const _hoisted_5$5 = { class: "devicesList" };
  const _hoisted_6$5 = {
    key: 0,
    class: "empty-state"
  };
  const _sfc_main$7 = {
    __name: "DevicesPanel",
    props: {
      devicesList: Array,
      selectedDevice: [String, Number],
      serverFilter: [String, Number],
      pgnFilter: String
    },
    emits: ["selectDevice", "filterPgn", "trackPgn"],
    setup(__props) {
      return (_ctx, _cache) => {
        return openBlock(), createElementBlock("div", _hoisted_1$7, [
          createBaseVNode("div", _hoisted_2$6, [
            _cache[2] || (_cache[2] = createBaseVNode("h3", { class: "panelTitle" }, [
              createBaseVNode("i", { class: "fas fa-microchip" }),
              createTextVNode(" Connected Devices ")
            ], -1)),
            createBaseVNode("span", _hoisted_3$5, toDisplayString(__props.devicesList.length), 1)
          ]),
          createBaseVNode("div", _hoisted_4$5, [
            createBaseVNode("div", _hoisted_5$5, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(__props.devicesList, (device) => {
                return openBlock(), createBlock(_sfc_main$8, {
                  key: device.src,
                  device,
                  pgnFilter: __props.pgnFilter,
                  selected: __props.selectedDevice === device.src,
                  serverFilter: __props.serverFilter,
                  onFilterPgn: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("filterPgn", $event)),
                  onSelectDevice: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("selectDevice", $event))
                }, null, 8, ["device", "pgnFilter", "selected", "serverFilter"]);
              }), 128)),
              __props.devicesList.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_6$5, [..._cache[3] || (_cache[3] = [
                createBaseVNode("i", { class: "fas fa-plug" }, null, -1),
                createBaseVNode("p", null, "No devices connected yet", -1)
              ])])) : createCommentVNode("", true)
            ])
          ])
        ]);
      };
    }
  };
  const _hoisted_1$6 = { class: "pgn-header" };
  const _hoisted_2$5 = { class: "pgn-id" };
  const _hoisted_3$4 = { key: 2 };
  const _hoisted_4$4 = { style: { "color": "var(--text-light)", "font-size": "0.9rem", "text-align": "right" } };
  const _hoisted_5$4 = { class: "pgn-description" };
  const _hoisted_6$4 = { class: "fields-grid" };
  const _hoisted_7$4 = { class: "field-name" };
  const _hoisted_8$3 = { class: "field-value" };
  const _hoisted_9$3 = { class: "small" };
  const _hoisted_10$3 = { class: "small" };
  const _hoisted_11$3 = { key: 2 };
  const _hoisted_12$3 = { class: "small" };
  const _hoisted_13$2 = { class: "pgn-footer" };
  const _hoisted_14$2 = { style: { "color": "var(--text-light)" } };
  const _hoisted_15$2 = { class: "pgn-raw" };
  const _hoisted_16$2 = {
    key: 0,
    class: "pgn-history"
  };
  const _hoisted_17$2 = { class: "small" };
  const _hoisted_18$2 = { key: 0 };
  const _hoisted_19$2 = { class: "small" };
  const _sfc_main$6 = {
    __name: "PgnCard",
    props: {
      pgn: Object,
      pgnFilter: [String, Number],
      blockedPGNs: Set,
      trackingPGNs: Set,
      autoUpdate: Boolean
    },
    emits: ["selectDevice", "filterPgn", "blockPgn", "trackPgn"],
    setup(__props) {
      const props = __props;
      const computedPgn = computed(() => {
        return `0x${props.pgn.pgn.toString(16).padStart(5, "0").toUpperCase()}${props.pgn.src.toString(16).padStart(2, "0").toUpperCase()}`;
      });
      function formatTime(timestamp) {
        if (!timestamp) return "N/A";
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          fractionalSecondDigits: 3
        });
      }
      function formatValue(value) {
        if (value === null || value === void 0) return "null";
        if (typeof value === "object") return JSON.stringify(value);
        return String(value);
      }
      function formatAngle(value) {
        return (value * 57.295779).toFixed(3);
      }
      function formatPosition(value, isLatitude, precision = 5) {
        const hemisphere = isLatitude ? value >= 0 ? "N" : "S" : value >= 0 ? "E" : "W";
        const absValue = Math.abs(value);
        const degrees = Math.floor(absValue);
        const minutes = (absValue - degrees) * 60;
        const formattedMinutes = minutes.toFixed(3).padStart(6, "0");
        return `${hemisphere} ${degrees}°${formattedMinutes}'`;
      }
      function sub(a, b) {
        const len = a.toString().length > b.toString().length ? a.toString().length : b.toString().length;
        return (a - b).toFixed(len);
      }
      return (_ctx, _cache) => {
        return openBlock(), createElementBlock("div", {
          class: normalizeClass([{ updated: __props.pgn.isNew }, "pgn-card"])
        }, [
          createBaseVNode("div", _hoisted_1$6, [
            createBaseVNode("span", _hoisted_2$5, [
              __props.pgn.fields && __props.pgn.fields.longitude ? (openBlock(), createElementBlock("span", {
                key: 0,
                class: normalizeClass({ "text-success": __props.trackingPGNs.has(`${__props.pgn.src}:${__props.pgn.pgn}`) }),
                style: { "cursor": "crosshair" },
                onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("trackPgn", `${__props.pgn.src}:${__props.pgn.pgn}`))
              }, [..._cache[4] || (_cache[4] = [
                createBaseVNode("i", { class: "fas fa-map-location" }, null, -1),
                createTextVNode(" ", -1)
              ])], 2)) : createCommentVNode("", true),
              createBaseVNode("span", {
                style: { "cursor": "zoom-in" },
                onClick: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("filterPgn", __props.pgn.pgn))
              }, [..._cache[5] || (_cache[5] = [
                createBaseVNode("i", { class: "fas fa-magnifying-glass" }, null, -1),
                createTextVNode(" PGN ", -1)
              ])]),
              typeof __props.pgn.pgn === "number" ? (openBlock(), createElementBlock("span", {
                key: 1,
                class: normalizeClass({ "text-danger": __props.blockedPGNs.has(computedPgn.value) }),
                style: { "cursor": "not-allowed" },
                onClick: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("blockPgn", computedPgn.value))
              }, [..._cache[6] || (_cache[6] = [
                createBaseVNode("i", { class: "fas fa-ban" }, null, -1)
              ])], 2)) : createCommentVNode("", true),
              createTextVNode(" " + toDisplayString(__props.pgn.pgn) + " ", 1),
              typeof __props.pgn.pgn === "number" ? (openBlock(), createElementBlock("span", _hoisted_3$4, "[" + toDisplayString(__props.pgn.pgn.toString(16).padStart(5, "0").toUpperCase()) + "]", 1)) : createCommentVNode("", true)
            ]),
            createBaseVNode("span", _hoisted_4$4, [
              createBaseVNode("span", {
                style: { "cursor": "zoom-in" },
                onClick: _cache[3] || (_cache[3] = ($event) => _ctx.$emit("selectDevice", __props.pgn.src))
              }, "Device"),
              createTextVNode(" " + toDisplayString(`${__props.pgn.src} [${__props.pgn.src.toString(16).padStart(2, "0").toUpperCase()}]`), 1),
              _cache[7] || (_cache[7] = createBaseVNode("br", null, null, -1)),
              createBaseVNode("span", null, toDisplayString(__props.pgn.servers), 1)
            ])
          ]),
          createBaseVNode("div", _hoisted_5$4, toDisplayString(__props.pgn.description), 1),
          createBaseVNode("div", _hoisted_6$4, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(__props.pgn.fields, (value, field) => {
              return openBlock(), createElementBlock("div", {
                key: field,
                class: normalizeClass([{ updated: __props.pgn.updatedFields?.includes(field) }, "field-row"])
              }, [
                createBaseVNode("span", _hoisted_7$4, toDisplayString(field), 1),
                createBaseVNode("span", _hoisted_8$3, [
                  field === "latitude" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                    createTextVNode(toDisplayString(formatPosition(value, true)) + " ", 1),
                    _cache[8] || (_cache[8] = createBaseVNode("br", null, null, -1)),
                    createBaseVNode("span", _hoisted_9$3, toDisplayString(formatValue(value)), 1)
                  ], 64)) : field === "longitude" ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                    createTextVNode(toDisplayString(formatPosition(value, false)) + " ", 1),
                    _cache[9] || (_cache[9] = createBaseVNode("br", null, null, -1)),
                    createBaseVNode("span", _hoisted_10$3, toDisplayString(formatValue(value)), 1)
                  ], 64)) : field === "heading" || field === "windAngle" || field === "courseOverGroundMagnetic" || field === "courseOverGroundTrue" || field === "headingMagnetic" || field === "headingCompass" || field === "headingTrue" || field === "angleApparent" || field === "angleTrueWater" ? (openBlock(), createElementBlock("span", _hoisted_11$3, [
                    createTextVNode(toDisplayString(formatAngle(value)) + " ", 1),
                    _cache[10] || (_cache[10] = createBaseVNode("br", null, null, -1)),
                    createBaseVNode("span", _hoisted_12$3, toDisplayString(formatValue(value)), 1)
                  ])) : (openBlock(), createElementBlock(Fragment, { key: 3 }, [
                    createTextVNode(toDisplayString(formatValue(value)), 1)
                  ], 64))
                ])
              ], 2);
            }), 128))
          ]),
          createBaseVNode("div", _hoisted_13$2, [
            createBaseVNode("span", null, toDisplayString(formatTime(__props.pgn.timestamp)), 1),
            createBaseVNode("span", _hoisted_14$2, toDisplayString(__props.pgn.direction || "Unknown"), 1)
          ]),
          createBaseVNode("div", _hoisted_15$2, toDisplayString(__props.pgn.raw), 1),
          !__props.autoUpdate ? (openBlock(), createElementBlock("div", _hoisted_16$2, [
            createBaseVNode("table", null, [
              createBaseVNode("tbody", null, [
                createBaseVNode("tr", null, [
                  _cache[11] || (_cache[11] = createBaseVNode("th", null, "Timestamp", -1)),
                  (openBlock(true), createElementBlock(Fragment, null, renderList(__props.pgn.fields, (field, fieldName) => {
                    return openBlock(), createElementBlock("th", null, toDisplayString(fieldName), 1);
                  }), 256))
                ]),
                (openBlock(true), createElementBlock(Fragment, null, renderList(__props.pgn.history, (pgnHistory) => {
                  return openBlock(), createElementBlock("tr", null, [
                    pgnHistory && pgnHistory.src === __props.pgn.src && pgnHistory.pgn === __props.pgn.pgn ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                      createBaseVNode("td", _hoisted_17$2, [
                        createTextVNode(toDisplayString(formatTime(pgnHistory.timestamp)) + " ", 1),
                        _cache[12] || (_cache[12] = createBaseVNode("br", null, null, -1)),
                        createTextVNode(" " + toDisplayString(pgnHistory.serverAddress), 1)
                      ]),
                      (openBlock(true), createElementBlock(Fragment, null, renderList(__props.pgn.fields, (field, fieldName) => {
                        return openBlock(), createElementBlock("td", null, [
                          typeof pgnHistory["fields"] !== "undefined" && typeof pgnHistory["fields"][fieldName] === "number" ? (openBlock(), createElementBlock("div", _hoisted_18$2, toDisplayString(sub(__props.pgn.fields[fieldName] ?? "", pgnHistory.fields[fieldName] ?? "")), 1)) : createCommentVNode("", true),
                          createBaseVNode("div", _hoisted_19$2, toDisplayString(typeof pgnHistory["fields"] !== "undefined" && typeof pgnHistory["fields"][fieldName] !== "undefined" ? pgnHistory["fields"][fieldName] : "-"), 1)
                        ]);
                      }), 256))
                    ], 64)) : createCommentVNode("", true)
                  ]);
                }), 256))
              ])
            ])
          ])) : createCommentVNode("", true)
        ], 2);
      };
    }
  };
  const _hoisted_1$5 = { class: "panel" };
  const _hoisted_2$4 = { class: "panel-header" };
  const _hoisted_3$3 = { class: "panelTitle" };
  const _hoisted_4$3 = {
    class: "stat-number",
    style: { "font-size": "1.5rem" }
  };
  const _hoisted_5$3 = { class: "panel-content" };
  const _hoisted_6$3 = { class: "pgns-grid" };
  const _hoisted_7$3 = {
    key: 0,
    class: "empty-state"
  };
  const _sfc_main$5 = {
    __name: "PgnsPanel",
    props: {
      filteredPGNs: Array,
      blockedPGNs: Set,
      panelTitle: String,
      pgnFilter: String,
      autoUpdate: Boolean,
      trackingPGNs: Set
    },
    emits: ["selectDevice", "filterPgn", "blockPgn", "trackPgn"],
    setup(__props) {
      return (_ctx, _cache) => {
        return openBlock(), createElementBlock("div", _hoisted_1$5, [
          createBaseVNode("div", _hoisted_2$4, [
            createBaseVNode("h3", _hoisted_3$3, [
              _cache[4] || (_cache[4] = createBaseVNode("i", { class: "fas fa-stream" }, null, -1)),
              createTextVNode(" " + toDisplayString(__props.panelTitle), 1)
            ]),
            createBaseVNode("span", _hoisted_4$3, toDisplayString(__props.filteredPGNs.length), 1)
          ]),
          createBaseVNode("div", _hoisted_5$3, [
            createBaseVNode("div", _hoisted_6$3, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(__props.filteredPGNs, (pgn) => {
                return openBlock(), createBlock(_sfc_main$6, {
                  key: pgn.id,
                  autoUpdate: __props.autoUpdate,
                  blockedPGNs: __props.blockedPGNs,
                  pgn,
                  pgnFilter: __props.pgnFilter,
                  trackingPGNs: __props.trackingPGNs,
                  onBlockPgn: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("blockPgn", $event)),
                  onFilterPgn: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("filterPgn", $event)),
                  onSelectDevice: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("selectDevice", $event)),
                  onTrackPgn: _cache[3] || (_cache[3] = ($event) => _ctx.$emit("trackPgn", $event))
                }, null, 8, ["autoUpdate", "blockedPGNs", "pgn", "pgnFilter", "trackingPGNs"]);
              }), 128)),
              __props.filteredPGNs.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_7$3, [..._cache[5] || (_cache[5] = [
                createBaseVNode("i", { class: "fas fa-search" }, null, -1),
                createBaseVNode("p", null, "No PGNs match your filters", -1)
              ])])) : createCommentVNode("", true)
            ])
          ])
        ]);
      };
    }
  };
  const _hoisted_1$4 = { class: "dashboard" };
  const _sfc_main$4 = {
    __name: "Dashboard",
    props: {
      devicesList: Array,
      filteredPGNs: Array,
      blockedPGNs: Set,
      trackingPGNs: Set,
      selectedDevice: [String, Number],
      serverFilter: String,
      pgnFilter: String,
      panelTitle: String,
      autoUpdate: Boolean
    },
    emits: ["selectDevice", "filterPgn", "blockPgn", "trackPgn"],
    setup(__props, { emit: __emit }) {
      return (_ctx, _cache) => {
        return openBlock(), createElementBlock("div", _hoisted_1$4, [
          createVNode(_sfc_main$7, {
            devicesList: __props.devicesList,
            pgnFilter: __props.pgnFilter,
            selectedDevice: __props.selectedDevice,
            serverFilter: __props.serverFilter,
            onFilterPgn: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("filterPgn", $event)),
            onSelectDevice: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("selectDevice", $event))
          }, null, 8, ["devicesList", "pgnFilter", "selectedDevice", "serverFilter"]),
          createVNode(_sfc_main$5, {
            autoUpdate: __props.autoUpdate,
            blockedPGNs: __props.blockedPGNs,
            filteredPGNs: __props.filteredPGNs,
            panelTitle: __props.panelTitle,
            pgnFilter: __props.pgnFilter,
            trackingPGNs: __props.trackingPGNs,
            onBlockPgn: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("blockPgn", $event)),
            onFilterPgn: _cache[3] || (_cache[3] = ($event) => _ctx.$emit("filterPgn", $event)),
            onSelectDevice: _cache[4] || (_cache[4] = ($event) => _ctx.$emit("selectDevice", $event)),
            onTrackPgn: _cache[5] || (_cache[5] = ($event) => _ctx.$emit("trackPgn", $event))
          }, null, 8, ["autoUpdate", "blockedPGNs", "filteredPGNs", "panelTitle", "pgnFilter", "trackingPGNs"])
        ]);
      };
    }
  };
  const STORAGE_KEY = "nmea2000-config";
  const defaultConfig = {
    wsUrl: "ws://localhost:8080",
    // wsUrl:       'ws://192.168.1.111/api/websocket',
    autoConnect: true,
    autoTraceAfterRestart: true,
    showRawData: false,
    theme: "dark",
    dataServers: {
      "UDP": [
        //actisense
        {
          "enable": true,
          "port": "60001"
        },
        {
          "enable": false,
          "port": "60002"
        },
        //yden
        {
          "enable": false,
          "port": "10110"
        },
        {
          "enable": false,
          "port": "1456"
        }
      ],
      "TCP": [
        //actisense
        {
          "enable": true,
          "host": "192.168.1.111",
          "port": "60003"
        },
        //yden
        {
          "enable": false,
          "host": "192.168.1.222",
          "port": "1457"
        }
      ]
    }
    //we need to send the port to the server
  };
  const savedConfig = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const config = ref({ ...defaultConfig, ...savedConfig });
  function useConfigStore() {
    watch(config, (newConfig) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    }, { deep: true });
    function updateConfig(updates) {
      config.value = { ...config.value, ...updates };
    }
    function resetConfig() {
      config.value = { ...defaultConfig };
    }
    function setWsUrl(url) {
      config.value.wsUrl = url;
    }
    return {
      config,
      updateConfig,
      resetConfig,
      setWsUrl
    };
  }
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _hoisted_1$3 = { class: "modal-content" };
  const _hoisted_2$3 = { class: "modal-body" };
  const _hoisted_3$2 = { class: "config-section" };
  const _hoisted_4$2 = { class: "form-group" };
  const _hoisted_5$2 = { class: "form-group" };
  const _hoisted_6$2 = { class: "checkbox-label" };
  const _hoisted_7$2 = { class: "config-section" };
  const _hoisted_8$2 = {
    class: "table",
    style: { "width": "100%" }
  };
  const _hoisted_9$2 = { class: "d-flex" };
  const _hoisted_10$2 = { class: "checkbox-label" };
  const _hoisted_11$2 = ["onUpdate:modelValue"];
  const _hoisted_12$2 = ["onUpdate:modelValue"];
  const _hoisted_13$1 = ["onClick"];
  const _hoisted_14$1 = { class: "d-flex" };
  const _hoisted_15$1 = { class: "checkbox-label" };
  const _hoisted_16$1 = ["onUpdate:modelValue"];
  const _hoisted_17$1 = ["onUpdate:modelValue"];
  const _hoisted_18$1 = ["onUpdate:modelValue"];
  const _hoisted_19$1 = ["onClick"];
  const _hoisted_20$1 = { class: "config-section" };
  const _hoisted_21$1 = { class: "form-group" };
  const _hoisted_22$1 = { class: "checkbox-label" };
  const _hoisted_23$1 = { class: "form-group" };
  const _hoisted_24$1 = { class: "config-section" };
  const _hoisted_25$1 = { class: "form-group" };
  const _hoisted_26$1 = { class: "checkbox-label" };
  const _hoisted_27$1 = { class: "config-section" };
  const _hoisted_28$1 = { class: "connection-test" };
  const _hoisted_29$1 = ["disabled"];
  const _sfc_main$3 = {
    __name: "ConfigModal",
    props: {
      isVisible: Boolean
    },
    emits: ["close", "config-change"],
    setup(__props, { emit: __emit }) {
      const emit2 = __emit;
      const { config: config2, updateConfig, resetConfig } = useConfigStore();
      const localConfig = ref(JSON.parse(JSON.stringify(config2.value)));
      const testing = ref(false);
      const testResult = ref(null);
      const testStatus = computed(() => {
        if (testing.value) return "testing";
        if (!testResult.value) return "idle";
        return testResult.value.success ? "success" : "error";
      });
      const testIcon = computed(() => {
        switch (testStatus.value) {
          case "testing":
            return "fas fa-spinner fa-spin";
          case "success":
            return "fas fa-check-circle";
          case "error":
            return "fas fa-times-circle";
          default:
            return "fas fa-question-circle";
        }
      });
      const testMessage = computed(() => {
        if (testing.value) return "Testing connection...";
        if (!testResult.value) return "Not tested";
        return testResult.value.message;
      });
      function close() {
        emit2("close");
      }
      function saveConfig() {
        updateConfig(localConfig.value);
        emit2("config-change", localConfig.value);
        setTimeout(() => {
          emit2("close");
        }, 500);
      }
      function resetToDefaults() {
        if (confirm("Reset all settings to defaults?")) {
          resetConfig();
          localConfig.value = JSON.parse(JSON.stringify(config2.value));
        }
      }
      function addServer(type) {
        switch (type) {
          case "TCP":
            localConfig.value.dataServers?.TCP.push({
              "enable": false,
              "host": "",
              "port": ""
            });
            break;
          case "UDP":
            localConfig.value.dataServers?.UDP.push({
              "enable": false,
              "port": ""
            });
            break;
          default:
            console.error(`Type: "${type}" is not configured!`);
        }
      }
      function removeServer(type, index) {
        switch (type) {
          case "TCP":
            localConfig.value.dataServers?.TCP.splice(index, 1);
            break;
          case "UDP":
            localConfig.value.dataServers?.UDP.splice(index, 1);
            break;
          default:
            console.error(`Type: "${type}" is not configured!`);
        }
      }
      async function testConnection() {
        testing.value = true;
        testResult.value = null;
        try {
          const testWs = new WebSocket(localConfig.value.wsUrl);
          const timeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Connection timeout")), 5e3);
          });
          const connection = new Promise((resolve, reject) => {
            testWs.onopen = () => {
              testWs.close();
              resolve();
            };
            testWs.onerror = (error) => {
              reject(new Error("Connection failed"));
            };
          });
          await Promise.race([connection, timeout]);
          testResult.value = {
            success: true,
            message: "Connection successful!"
          };
        } catch (error) {
          testResult.value = {
            success: false,
            message: `Connection failed: ${error.message}`
          };
        } finally {
          testing.value = false;
        }
      }
      return (_ctx, _cache) => {
        return __props.isVisible ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: "modal-overlay",
          onClick: withModifiers(close, ["self"])
        }, [
          createBaseVNode("div", _hoisted_1$3, [
            createBaseVNode("div", { class: "modal-header" }, [
              _cache[7] || (_cache[7] = createBaseVNode("h2", null, [
                createBaseVNode("i", { class: "fas fa-cog" }),
                createTextVNode(" Configuration")
              ], -1)),
              createBaseVNode("button", {
                class: "modal-close",
                onClick: close
              }, "×")
            ]),
            createBaseVNode("div", _hoisted_2$3, [
              createBaseVNode("div", _hoisted_3$2, [
                _cache[11] || (_cache[11] = createBaseVNode("h3", null, [
                  createBaseVNode("i", { class: "fas fa-plug" }),
                  createTextVNode(" Connection Settings")
                ], -1)),
                createBaseVNode("div", _hoisted_4$2, [
                  _cache[8] || (_cache[8] = createBaseVNode("label", { for: "wsUrl" }, "WebSocket URL", -1)),
                  withDirectives(createBaseVNode("input", {
                    id: "wsUrl",
                    "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => localConfig.value.wsUrl = $event),
                    class: "form-control",
                    placeholder: "ws://localhost:8080",
                    type: "text"
                  }, null, 512), [
                    [vModelText, localConfig.value.wsUrl]
                  ]),
                  _cache[9] || (_cache[9] = createBaseVNode("div", { class: "form-help" }, " Enter the WebSocket URL for your NMEA 2000 data source ", -1))
                ]),
                createBaseVNode("div", _hoisted_5$2, [
                  createBaseVNode("label", _hoisted_6$2, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => localConfig.value.autoConnect = $event),
                      class: "form-checkbox",
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, localConfig.value.autoConnect]
                    ]),
                    _cache[10] || (_cache[10] = createBaseVNode("span", null, "Auto-connect on startup", -1))
                  ])
                ])
              ]),
              createBaseVNode("div", _hoisted_7$2, [
                _cache[19] || (_cache[19] = createBaseVNode("h3", null, [
                  createBaseVNode("i", { class: "fas fa-server" }),
                  createTextVNode(" Data servers")
                ], -1)),
                createBaseVNode("table", _hoisted_8$2, [
                  createBaseVNode("tbody", null, [
                    _cache[18] || (_cache[18] = createBaseVNode("tr", null, [
                      createBaseVNode("th", null, "UDP"),
                      createBaseVNode("th", null, "TCP")
                    ], -1)),
                    createBaseVNode("tr", null, [
                      createBaseVNode("td", null, [
                        (openBlock(true), createElementBlock(Fragment, null, renderList(localConfig.value.dataServers?.UDP, (udp, index) => {
                          return openBlock(), createElementBlock("div", _hoisted_9$2, [
                            createBaseVNode("label", _hoisted_10$2, [
                              withDirectives(createBaseVNode("input", {
                                "onUpdate:modelValue": ($event) => udp.enable = $event,
                                class: "form-checkbox",
                                type: "checkbox"
                              }, null, 8, _hoisted_11$2), [
                                [vModelCheckbox, udp.enable]
                              ]),
                              _cache[12] || (_cache[12] = createBaseVNode("span", null, null, -1))
                            ]),
                            withDirectives(createBaseVNode("input", {
                              "onUpdate:modelValue": ($event) => udp.port = $event,
                              class: "form-control",
                              style: { "max-width": "100px" },
                              type: "number"
                            }, null, 8, _hoisted_12$2), [
                              [vModelText, udp.port]
                            ]),
                            createBaseVNode("button", {
                              class: "btn btn-sm btn-danger",
                              onClick: ($event) => removeServer("UDP", index)
                            }, [..._cache[13] || (_cache[13] = [
                              createBaseVNode("i", { class: "fas fa-trash" }, null, -1)
                            ])], 8, _hoisted_13$1)
                          ]);
                        }), 256)),
                        createBaseVNode("button", {
                          class: "btn btn-success",
                          style: { "margin": "auto" },
                          onClick: _cache[2] || (_cache[2] = ($event) => addServer("UDP"))
                        }, [..._cache[14] || (_cache[14] = [
                          createBaseVNode("i", { class: "fas fa-plus-circle" }, null, -1),
                          createTextVNode(" Add Connection ", -1)
                        ])])
                      ]),
                      createBaseVNode("td", null, [
                        (openBlock(true), createElementBlock(Fragment, null, renderList(localConfig.value.dataServers?.TCP, (tcp, index) => {
                          return openBlock(), createElementBlock("div", _hoisted_14$1, [
                            createBaseVNode("label", _hoisted_15$1, [
                              withDirectives(createBaseVNode("input", {
                                "onUpdate:modelValue": ($event) => tcp.enable = $event,
                                class: "form-checkbox",
                                type: "checkbox"
                              }, null, 8, _hoisted_16$1), [
                                [vModelCheckbox, tcp.enable]
                              ]),
                              _cache[15] || (_cache[15] = createBaseVNode("span", null, null, -1))
                            ]),
                            withDirectives(createBaseVNode("input", {
                              "onUpdate:modelValue": ($event) => tcp.host = $event,
                              class: "form-control",
                              placeholder: "host"
                            }, null, 8, _hoisted_17$1), [
                              [vModelText, tcp.host]
                            ]),
                            withDirectives(createBaseVNode("input", {
                              "onUpdate:modelValue": ($event) => tcp.port = $event,
                              class: "form-control",
                              placeholder: "port",
                              style: { "max-width": "100px" },
                              type: "number"
                            }, null, 8, _hoisted_18$1), [
                              [vModelText, tcp.port]
                            ]),
                            createBaseVNode("button", {
                              class: "btn btn-sm btn-danger",
                              onClick: ($event) => removeServer("TCP", index)
                            }, [..._cache[16] || (_cache[16] = [
                              createBaseVNode("i", { class: "fas fa-trash" }, null, -1)
                            ])], 8, _hoisted_19$1)
                          ]);
                        }), 256)),
                        createBaseVNode("button", {
                          class: "btn btn-success",
                          style: { "margin": "auto" },
                          onClick: _cache[3] || (_cache[3] = ($event) => addServer("TCP"))
                        }, [..._cache[17] || (_cache[17] = [
                          createBaseVNode("i", { class: "fas fa-plus" }, null, -1),
                          createTextVNode(" Add Connection ", -1)
                        ])])
                      ])
                    ])
                  ])
                ])
              ]),
              createBaseVNode("div", _hoisted_20$1, [
                _cache[23] || (_cache[23] = createBaseVNode("h3", null, [
                  createBaseVNode("i", { class: "fas fa-desktop" }),
                  createTextVNode(" Display Settings")
                ], -1)),
                createBaseVNode("div", _hoisted_21$1, [
                  createBaseVNode("label", _hoisted_22$1, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => localConfig.value.showRawData = $event),
                      class: "form-checkbox",
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, localConfig.value.showRawData]
                    ]),
                    _cache[20] || (_cache[20] = createBaseVNode("span", null, "Show raw data in PGN cards", -1))
                  ])
                ]),
                createBaseVNode("div", _hoisted_23$1, [
                  _cache[22] || (_cache[22] = createBaseVNode("label", { for: "theme" }, "Theme", -1)),
                  withDirectives(createBaseVNode("select", {
                    id: "theme",
                    "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => localConfig.value.theme = $event),
                    class: "form-control"
                  }, [..._cache[21] || (_cache[21] = [
                    createBaseVNode("option", { value: "dark" }, "Dark", -1),
                    createBaseVNode("option", { value: "light" }, "Light", -1),
                    createBaseVNode("option", { value: "auto" }, "Auto (System)", -1)
                  ])], 512), [
                    [vModelSelect, localConfig.value.theme]
                  ])
                ])
              ]),
              createBaseVNode("div", _hoisted_24$1, [
                _cache[25] || (_cache[25] = createBaseVNode("h3", null, [
                  createBaseVNode("i", { class: "fas fa-map" }),
                  createTextVNode(" Map tracing")
                ], -1)),
                createBaseVNode("div", _hoisted_25$1, [
                  createBaseVNode("label", _hoisted_26$1, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => localConfig.value.autoTraceAfterRestart = $event),
                      class: "form-checkbox",
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, localConfig.value.autoTraceAfterRestart]
                    ]),
                    _cache[24] || (_cache[24] = createBaseVNode("span", null, "Automatically start tracing on refresh", -1))
                  ])
                ])
              ]),
              createBaseVNode("div", _hoisted_27$1, [
                _cache[27] || (_cache[27] = createBaseVNode("h3", null, [
                  createBaseVNode("i", { class: "fas fa-wifi" }),
                  createTextVNode(" Test Connection")
                ], -1)),
                createBaseVNode("div", _hoisted_28$1, [
                  createBaseVNode("div", {
                    class: normalizeClass([testStatus.value, "connection-status"])
                  }, [
                    createBaseVNode("i", {
                      class: normalizeClass(testIcon.value)
                    }, null, 2),
                    createTextVNode(" " + toDisplayString(testMessage.value), 1)
                  ], 2),
                  createBaseVNode("button", {
                    disabled: testing.value,
                    class: "btn btn-success",
                    onClick: testConnection
                  }, [
                    createBaseVNode("i", {
                      class: normalizeClass([{ spinning: testing.value }, "fas fa-sync"])
                    }, null, 2),
                    _cache[26] || (_cache[26] = createTextVNode(" Test Connection ", -1))
                  ], 8, _hoisted_29$1)
                ])
              ])
            ]),
            createBaseVNode("div", { class: "modal-footer" }, [
              createBaseVNode("button", {
                class: "btn btn-outline",
                onClick: resetToDefaults
              }, [..._cache[28] || (_cache[28] = [
                createBaseVNode("i", { class: "fas fa-undo" }, null, -1),
                createTextVNode(" Reset to Defaults ", -1)
              ])]),
              createBaseVNode("button", {
                class: "btn btn-primary",
                onClick: saveConfig
              }, [..._cache[29] || (_cache[29] = [
                createBaseVNode("i", { class: "fas fa-save" }, null, -1),
                createTextVNode(" Save & Close ", -1)
              ])]),
              createBaseVNode("button", {
                class: "btn btn-outline",
                onClick: close
              }, " Close ")
            ])
          ])
        ])) : createCommentVNode("", true);
      };
    }
  };
  const ConfigModal = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-47889089"]]);
  function useNmeaWebSocket(autoUpdate, config2) {
    const ws = ref(null);
    const isConnected = ref(false);
    const connectionError = ref(null);
    const isConnecting = ref(false);
    const freezePGNs = ref(false);
    const devicesPGNs = ref(/* @__PURE__ */ new Map());
    const servers = ref(/* @__PURE__ */ new Set());
    let lastPgn = ref({});
    const maxHistory = 50;
    const connectionStatus = computed(() => {
      if (connectionError.value) return "Error";
      if (isConnecting.value) return "Connecting";
      return isConnected.value ? "Connected" : "Disconnected";
    });
    function connectWebSocket() {
      if (isConnecting.value || !config2.value.wsUrl) return;
      isConnecting.value = true;
      connectionError.value = null;
      try {
        if (ws.value) {
          ws.value.close();
        }
        console.log(`Connecting to WebSocket: ${config2.value.wsUrl}`);
        ws.value = new WebSocket(config2.value.wsUrl);
        ws.value.onopen = () => {
          console.log("WebSocket connected");
          isConnected.value = true;
          isConnecting.value = false;
          connectionError.value = null;
          ws?.value?.send(JSON.stringify(getDataServers()));
          console.log("WebSocket servers configuration was sent!");
        };
        ws.value.onmessage = (event) => {
          if (!autoUpdate.value) return;
          try {
            const data = JSON.parse(event.data);
            processPgnUpdate(data.data);
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };
        ws.value.onclose = (event) => {
          console.log(`WebSocket disconnected: ${event.code} ${event.reason}`);
          isConnected.value = false;
          isConnecting.value = false;
          if (event.code !== 1e3) {
            setTimeout(() => {
              if (config2.value.autoConnect) {
                connectWebSocket();
              }
            }, 3e3);
          }
        };
        ws.value.onerror = (error) => {
          console.error("WebSocket error:", error);
          connectionError.value = error;
          isConnecting.value = false;
        };
      } catch (error) {
        console.error("Failed to create WebSocket:", error);
        connectionError.value = error;
        isConnecting.value = false;
      }
    }
    function disconnectWebSocket() {
      if (ws.value) {
        ws.value.close(1e3, "User disconnected");
        ws.value = null;
      }
      isConnected.value = false;
      isConnecting.value = false;
    }
    function reconnectWebSocket() {
      disconnectWebSocket();
      setTimeout(() => connectWebSocket(), 100);
    }
    function getDataServers() {
      let dataServers = {
        "servers": {
          UDP: [],
          TCP: []
        }
      };
      config2.value.dataServers.TCP.forEach((server) => {
        if (server.enable && server.host && server.port) {
          dataServers.servers.TCP.push({
            "host": server.host,
            "port": server.port
          });
        }
      });
      config2.value.dataServers.UDP.forEach((server) => {
        if (server.enable && server.port) {
          dataServers.servers.UDP.push(server.port);
        }
      });
      return dataServers;
    }
    watch(() => config2.value.wsUrl, (newUrl, oldUrl) => {
      if (newUrl !== oldUrl && config2.value.autoConnect) {
        reconnectWebSocket();
      }
    });
    watch(() => config2, (newServers, oldServers) => {
      if (ws?.value?.readyState) {
        ws?.value?.send(JSON.stringify(getDataServers()));
      }
    }, { deep: true });
    watch(() => config2.value.autoConnect, (newValue) => {
      if (newValue && !isConnected.value && !isConnecting.value) {
        connectWebSocket();
      } else if (!newValue && isConnected.value) {
        disconnectWebSocket();
      }
    });
    function updateDeviceData(pgnData) {
      const now = Date.now();
      const src = pgnData.src;
      const device = devicesPGNs.value.get(src);
      device.lastSeen = now;
      device.updates++;
      if (!device.name) {
        device.name = `Device ${pgnData.src}`;
      }
      switch (pgnData.pgn) {
        case 60928:
          if (pgnData.fields) {
            device.name = pgnData.fields.deviceName || pgnData.fields.manufacturerCode || pgnData.fields.deviceFunction || `Device ${pgnData.src}`;
            device.manufacturerCode = pgnData.fields.manufacturerCode ?? device.manufacturerCode;
            device.deviceInstance = pgnData.fields.deviceInstance ?? device.deviceInstance;
            device.deviceFunction = pgnData.fields.deviceFunction ?? device.deviceFunction;
            device.deviceClass = pgnData.fields.deviceClass ?? device.deviceClass;
            device.isoAddress = pgnData.fields.isoAddress ?? device.isoAddress;
          }
          break;
        case 126996:
          if (pgnData.fields) {
            device.n2kVersion = pgnData.fields.nmea2000Version;
            device.productCode = pgnData.fields.productCode;
            device.modelId = pgnData.fields.modelId;
            device.softwareVersion = pgnData.fields.softwareVersionCode;
            device.modelVersion = pgnData.fields.modelVersion;
            device.modelSerialCode = pgnData.fields.modelSerialCode;
            device.certificationLevel = pgnData.fields.certificationLevel;
            device.loadEquivalency = pgnData.fields.loadEquivalency;
          }
          break;
        case 126998:
          if (pgnData.fields) {
            device.installationDescription1 = pgnData.fields.installationDescription1;
            device.installationDescription2 = pgnData.fields.installationDescription2;
            device.manufacturerInformation = pgnData.fields.manufacturerInformation;
          }
          break;
      }
      if (!device.servers.has(pgnData.serverAddress)) {
        device.servers.add(pgnData.serverAddress);
      }
    }
    function updatePgnData(newData) {
      const src = newData.src;
      const pgnId = newData.pgn;
      if (!devicesPGNs.value.has(src)) {
        const now = /* @__PURE__ */ new Date();
        devicesPGNs.value.set(src, {
          src,
          firstSeen: now,
          lastSeen: now,
          pgnCount: 0,
          updates: 1,
          pgns: /* @__PURE__ */ new Map(),
          servers: /* @__PURE__ */ new Set()
        });
      }
      const device = devicesPGNs.value.get(src);
      const existingPgn = device.pgns.get(pgnId);
      const updatedFields = [];
      if (existingPgn) {
        if (newData.fields) {
          if (!freezePGNs.value) {
            Object.keys(newData.fields).forEach((field) => {
              if (existingPgn.fields && JSON.stringify(existingPgn.fields[field]) !== JSON.stringify(newData.fields[field])) {
                updatedFields.push(field);
                existingPgn.fields[field] = newData.fields[field];
              }
            });
            existingPgn.updatedFields = updatedFields;
          }
        }
        existingPgn.raw = newData.raw;
        existingPgn.history.unshift({
          historyId: `hist_${Date.now()}_${Math.random()}`,
          ...newData
        });
        if (existingPgn.history.length > maxHistory) {
          existingPgn.history.length = maxHistory;
        }
        if (!existingPgn.servers.includes(newData.serverAddress)) {
          existingPgn.servers.push(newData.serverAddress);
        }
      } else {
        newData.isNew = true;
        newData.history = [];
        newData.servers = [newData.serverAddress];
        device.pgns.set(pgnId, newData);
      }
      setTimeout(() => {
        const currentPgn = devicesPGNs.value.get(src)?.pgns.get(pgnId);
        if (currentPgn) {
          currentPgn.isNew = false;
          currentPgn.updatedFields = [];
        }
      }, 1e3);
    }
    function updateServers(pgnData) {
      if (!servers.value.has(pgnData.serverAddress)) {
        servers.value.add(pgnData.serverAddress, pgnData.serverAddress);
      }
    }
    function processPgnUpdate(pgnData) {
      lastPgn.value = pgnData;
      updatePgnData(pgnData);
      updateDeviceData(pgnData);
      updateServers(pgnData);
    }
    function clearAllData() {
      devicesPGNs.value.clear();
      servers.value.clear();
    }
    return {
      ws,
      isConnected,
      isConnecting,
      freezePGNs,
      connectionError,
      servers,
      devicesPGNs,
      lastPgn,
      processPgnUpdate,
      connectionStatus,
      connectWebSocket,
      disconnectWebSocket,
      reconnectWebSocket,
      clearAllData
    };
  }
  class PGNFilterAnalyzer {
    /**
     * Convert any input to a binary string of specified length
     * @param {number|string} pgn - PGN value (hex string or number)
     * @param {number} bitLength - Desired binary length
     * @returns {string} Binary string
     */
    static toBinary(pgn, bitLength) {
      let value;
      if (typeof pgn === "string") {
        if (pgn.startsWith("0x") || pgn.startsWith("0X")) {
          value = parseInt(pgn, 16);
        } else {
          value = parseInt(pgn, 10);
        }
      } else {
        value = pgn;
      }
      if (value > 4294967295) {
        return BigInt(value).toString(2).padStart(bitLength, "0");
      }
      return value.toString(2).padStart(bitLength, "0");
    }
    /**
     * Find minimum bit length needed for all PGNs
     * @param {Array} pgns - Array of PGNs
     * @returns {number} Required bit length
     */
    static getRequiredBitLength(pgns) {
      let maxBits = 0;
      for (const pgn of pgns) {
        let value;
        if (typeof pgn === "string") {
          if (pgn.startsWith("0x")) {
            value = parseInt(pgn, 16);
          } else {
            value = parseInt(pgn, 10);
          }
        } else {
          value = pgn;
        }
        let bits;
        if (value > 4294967295) {
          bits = BigInt(value).toString(2).length;
        } else {
          bits = Math.max(1, Math.floor(Math.log2(value)) + 1);
        }
        maxBits = Math.max(maxBits, bits);
      }
      return Math.max(maxBits, 1);
    }
    /**
     * Calculate bit mask where bits are the same across all PGNs
     * @param {string[]} binaries - Array of binary strings
     * @returns {string} Mask binary string (1=same, 0=different)
     */
    static calculateMask(binaries) {
      if (binaries.length === 0) return "";
      const length = binaries[0].length;
      let mask = "";
      for (let i = 0; i < length; i++) {
        const firstBit = binaries[0][i];
        let allSame = true;
        for (let j = 1; j < binaries.length; j++) {
          if (binaries[j][i] !== firstBit) {
            allSame = false;
            break;
          }
        }
        mask += allSame ? "1" : "0";
      }
      console.log("calculateMask", mask, binaries);
      return mask;
    }
    /**
     * Calculate filter value using mask
     * @param {string} mask - Mask binary string
     * @param {string} referenceBinary - Reference PGN binary
     * @returns {string} Filter value binary
     */
    static calculateFilterValue(mask, referenceBinary) {
      let filter = "";
      for (let i = 0; i < mask.length; i++) {
        filter += mask[i] === "1" ? referenceBinary[i] : "0";
      }
      return filter;
    }
    /**
     * Check if a PGN matches a filter
     * @param {string} pgnBinary - PGN binary to test
     * @param {string} mask - Mask binary
     * @param {string} filter - Filter value binary
     * @returns {boolean} True if matches filter
     */
    static matchesFilter(pgnBinary, mask, filter) {
      for (let i = 0; i < mask.length; i++) {
        if (mask[i] === "1" && pgnBinary[i] !== filter[i]) {
          return false;
        }
      }
      return true;
    }
    /**
     * Find all bits that are 1 in all PGNs
     * @param {string[]} binaries - Array of binary strings
     * @returns {string} Common ones binary string
     */
    static findCommonOnes(binaries) {
      if (binaries.length === 0) return "";
      const length = binaries[0].length;
      let result = "";
      for (let i = 0; i < length; i++) {
        let allOnes = true;
        for (const binary of binaries) {
          if (binary[i] !== "1") {
            allOnes = false;
            break;
          }
        }
        result += allOnes ? "1" : "0";
      }
      return result;
    }
    /**
     * Optimize filters to block specific PGNs while keeping others
     * @param {Array} blockPGNs - PGNs to block
     * @param {Array} keepPGNs - PGNs to keep (must not be blocked)
     * @param {Object} options - Configuration options
     * @returns {Object} Result with filters and analysis
     */
    static analyze(blockPGNs, keepPGNs, options = {}) {
      const {
        maxFilters = 8,
        strictMode = true,
        customBitLength = null
      } = options;
      if (!Array.isArray(blockPGNs) || !Array.isArray(keepPGNs)) {
        throw new Error("blockPGNs and keepPGNs must be arrays");
      }
      const allPGNs = [...blockPGNs, ...keepPGNs];
      const bitLength = customBitLength || this.getRequiredBitLength(allPGNs);
      const blockBinaries = blockPGNs.map((pgn) => this.toBinary(pgn, bitLength));
      const keepBinaries = keepPGNs.map((pgn) => this.toBinary(pgn, bitLength));
      const filters = [];
      const remainingToBlock = [...blockBinaries];
      const conflicts = [];
      const createFilter = (binaries) => {
        console.log("createFiltercreateFilter", binaries);
        const mask = this.calculateMask(binaries);
        const filterValue = this.calculateFilterValue(mask, binaries[0]);
        return {
          mask,
          filterValue,
          maskHex: "0x" + this.binaryToHex(mask),
          filterHex: "0x" + this.binaryToHex(filterValue),
          blockedBinaries: binaries
        };
      };
      const filterBlocksWanted = (filter) => {
        for (const keepBinary of keepBinaries) {
          if (this.matchesFilter(keepBinary, filter.mask, filter.filterValue)) {
            return true;
          }
        }
        return false;
      };
      console.log("remainingToBlockremainingToBlock", remainingToBlock);
      while (remainingToBlock.length > 0 && filters.length < maxFilters) {
        console.log("remainingToBlock.length", remainingToBlock.length);
        const candidateFilter = createFilter(remainingToBlock);
        console.log("!filterBlocksWanted", filterBlocksWanted(candidateFilter));
        if (!filterBlocksWanted(candidateFilter)) {
          const blockedIndices = [];
          const stillRemaining = [];
          for (let i = 0; i < remainingToBlock.length; i++) {
            if (this.matchesFilter(
              remainingToBlock[i],
              candidateFilter.mask,
              candidateFilter.filterValue
            )) {
              blockedIndices.push(i);
            } else {
              stillRemaining.push(remainingToBlock[i]);
            }
          }
          filters.push({
            ...candidateFilter,
            blockedCount: blockedIndices.length,
            blockedPGNs: blockedIndices.map(
              (idx) => blockPGNs[blockBinaries.indexOf(remainingToBlock[idx])]
            )
          });
          remainingToBlock.splice(0, remainingToBlock.length, ...stillRemaining);
        } else {
          console.log("asdfasdfasd");
          if (remainingToBlock.length === 1) {
            const conflictedPGN = blockPGNs[blockBinaries.indexOf(remainingToBlock[0])];
            conflicts.push({
              pgn: conflictedPGN,
              reason: "Cannot block without affecting wanted PGNs",
              binary: remainingToBlock[0]
            });
            if (strictMode) {
              throw new Error(`Cannot block PGN ${this.pgnToString(conflictedPGN)} without blocking wanted PGNs: ${conflictedPGN}`);
            }
            remainingToBlock.shift();
          } else {
            let splitBit = -1;
            const length = remainingToBlock[0].length;
            for (let i = 0; i < length; i++) {
              const firstBit = remainingToBlock[0][i];
              let differs = false;
              for (let j = 1; j < remainingToBlock.length; j++) {
                if (remainingToBlock[j][i] !== firstBit) {
                  differs = true;
                  break;
                }
              }
              if (differs) {
                splitBit = i;
                break;
              }
            }
            if (splitBit === -1) {
              const conflictedGroup = remainingToBlock.map(
                (b) => blockPGNs[blockBinaries.indexOf(b)]
              );
              conflicts.push({
                devicesPGNs: conflictedGroup,
                reason: "Entire group conflicts with wanted PGNs",
                binaries: [...remainingToBlock]
              });
              if (strictMode) {
                throw new Error(`Cannot block group of PGNs without blocking wanted PGNs: ${conflictedGroup.map((p2) => this.pgnToString(p2)).join(", ")}`);
              }
              remainingToBlock.length = 0;
            } else {
              const group0 = [];
              const group1 = [];
              for (const binary of remainingToBlock) {
                if (binary[splitBit] === "0") {
                  group0.push(binary);
                } else {
                  group1.push(binary);
                }
              }
              if (group0.length > 0) {
                const filter0 = createFilter(group0);
                if (!filterBlocksWanted(filter0)) {
                  const blockedPGNs0 = group0.map(
                    (b) => blockPGNs[blockBinaries.indexOf(b)]
                  );
                  filters.push({
                    ...filter0,
                    blockedCount: group0.length,
                    blockedPGNs: blockedPGNs0
                  });
                } else {
                  remainingToBlock.push(...group0);
                }
              }
              if (group1.length > 0) {
                const filter1 = createFilter(group1);
                if (!filterBlocksWanted(filter1)) {
                  const blockedPGNs1 = group1.map(
                    (b) => blockPGNs[blockBinaries.indexOf(b)]
                  );
                  filters.push({
                    ...filter1,
                    blockedCount: group1.length,
                    blockedPGNs: blockedPGNs1
                  });
                } else {
                  remainingToBlock.push(...group1);
                }
              }
              const processed = [...group0, ...group1];
              remainingToBlock.length = 0;
              const allRemaining = blockBinaries.filter((b) => !processed.includes(b)).filter((b) => !filters.some((f) => f.blockedBinaries.includes(b)));
              remainingToBlock.push(...allRemaining);
            }
          }
        }
      }
      const totalBlocked = filters.reduce((sum, filter) => sum + filter.blockedCount, 0);
      const totalToBlock = blockPGNs.length;
      const efficiency = totalToBlock > 0 ? totalBlocked / totalToBlock * 100 : 100;
      return {
        filters: filters.map((filter) => ({
          mask: filter.maskHex,
          filter: filter.filterHex,
          maskBinary: filter.mask,
          filterBinary: filter.filterValue,
          blockedCount: filter.blockedCount,
          blockedPGNs: filter.blockedPGNs.map((p2) => this.pgnToString(p2))
        })),
        analysis: {
          bitLengthUsed: bitLength,
          totalFilters: filters.length,
          totalPGNsToBlock: totalToBlock,
          successfullyBlocked: totalBlocked,
          efficiency: efficiency.toFixed(1) + "%",
          remainingToBlock: remainingToBlock.length,
          conflicts: conflicts.map((c) => ({
            ...c,
            devicesPGNs: Array.isArray(c.devicesPGNs) ? c.devicesPGNs.map((p2) => this.pgnToString(p2)) : this.pgnToString(c.pgn)
          })),
          maxFiltersReached: filters.length >= maxFilters
        },
        raw: {
          blockBinaries,
          keepBinaries,
          bitLength
        }
      };
    }
    /**
     * Simple mask calculation for a group of PGNs
     * @param {Array} pgns - Array of PGNs
     * @param {number} bitLength - Bit length (auto-detected if not provided)
     * @returns {Object} Mask analysis
     */
    static calculateSimpleMask(pgns, bitLength = null) {
      if (pgns.length === 0) {
        return {
          mask: "0x0",
          filter: "0x0",
          commonOnes: "0x0",
          bitLength: 0
        };
      }
      const actualBitLength = bitLength || this.getRequiredBitLength(pgns);
      const binaries = pgns.map((pgn) => this.toBinary(pgn, actualBitLength));
      const mask = this.calculateMask(binaries);
      const filterValue = this.calculateFilterValue(mask, binaries[0]);
      const commonOnes = this.findCommonOnes(binaries);
      return {
        mask: "0x" + this.binaryToHex(mask),
        filter: "0x" + this.binaryToHex(filterValue),
        commonOnes: "0x" + this.binaryToHex(commonOnes),
        maskBinary: mask,
        filterBinary: filterValue,
        commonOnesBinary: commonOnes,
        bitLength: actualBitLength,
        binaryRepresentations: binaries
      };
    }
    /**
     * Convert binary string to hex
     * @param {string} binary - Binary string
     * @returns {string} Hex string without 0x prefix
     */
    static binaryToHex(binary) {
      return parseInt(binary, 2).toString(16).toUpperCase();
    }
    /**
     * Format PGN for display
     * @param {number|string} pgn - PGN value
     * @returns {string} Formatted string
     */
    static pgnToString(pgn) {
      if (typeof pgn === "string") {
        return pgn;
      }
      return `0x${pgn.toString(16).toUpperCase()} (${pgn})`;
    }
    /**
     * Test if a specific PGN would be blocked by filters
     * @param {number|string} pgn - PGN to test
     * @param {Array} filters - Filters from analyze() result
     * @param {number} bitLength - Bit length
     * @returns {boolean} True if would be blocked
     */
    static wouldBeBlocked(pgn, filters, bitLength) {
      const binary = this.toBinary(pgn, bitLength);
      for (const filter of filters) {
        if (this.matchesFilter(binary, filter.maskBinary, filter.filterBinary)) {
          return true;
        }
      }
      return false;
    }
  }
  const _sfc_main$2 = {
    name: "PGNFilter",
    props: {
      selectedDevice: [null, String, Number],
      filteredPGNs: Array,
      blockedPGNs: Set
    },
    data() {
      return {
        blockPGNsInput: "",
        keepPGNsInput: "",
        strictMode: true,
        maxFilters: 8,
        bitLength: 0,
        result: null,
        error: null
      };
    },
    methods: {
      parsePGNInput(input) {
        if (!input.trim()) return [];
        return input.split(/[,;\n\r\s]+/).map((p2) => p2.trim()).filter((p2) => p2).map((p2) => {
          if (p2.startsWith("0x") || p2.startsWith("0X")) {
            return parseInt(p2, 16);
          }
          return parseInt(p2, 10);
        }).filter((p2) => !isNaN(p2));
      },
      analyze() {
        this.error = null;
        this.result = null;
        try {
          const blockPGNs = this.parsePGNInput(this.blockPGNsInput);
          const keepPGNs = this.parsePGNInput(this.keepPGNsInput);
          if (blockPGNs.length === 0) {
            throw new Error("Please enter at least one PGN to block");
          }
          const options = {
            maxFilters: this.maxFilters,
            strictMode: this.strictMode
          };
          if (this.bitLength > 0) {
            options.customBitLength = this.bitLength;
          }
          this.result = PGNFilterAnalyzer.analyze(blockPGNs, keepPGNs, options);
        } catch (err) {
          this.error = err.message;
          console.error("Analysis error:", err);
        }
      },
      loadPNGs() {
        console.log("loadPNGsloadPNGs", this.filteredPGNs, this.blockedPGNs);
        this.filteredPGNs.forEach((pgn) => {
          const pgnAddr = `${pgn.pgn.toString(16).padStart(5, "0")}${pgn.src.toString(16).padStart(2, "0")}`.toUpperCase();
          console.log(pgn.pgn, pgn.src, pgnAddr);
          if (this.blockPGNsInput.toUpperCase().includes(pgnAddr)) {
            console.log("Already blocked", this.blockPGNsInput.includes(pgnAddr));
          }
          if (this.blockedPGNs.has(pgnAddr)) {
            return;
          }
          if (!this.keepPGNsInput.includes(pgnAddr) && !this.blockPGNsInput.includes(pgnAddr) && !this.blockedPGNs.has("0x" + pgnAddr)) {
            if (this.keepPGNsInput) {
              this.keepPGNsInput += ", ";
            }
            this.keepPGNsInput += "0x" + pgnAddr;
          }
        });
        this.keepPGNsInput = this.keepPGNsInput.trim();
        this.blockedPGNs.forEach((pgnAddr) => {
          if (!this.blockPGNsInput.includes(pgnAddr)) {
            if (this.blockPGNsInput) {
              this.blockPGNsInput += ", ";
            }
            this.blockPGNsInput += pgnAddr;
          }
          console.log("blocc pgnAddr", pgnAddr, this.blockPGNsInput);
        });
      },
      reset() {
        this.blockPGNsInput = "";
        this.keepPGNsInput = "";
        this.result = null;
        this.error = null;
      },
      copyResults() {
        if (!this.result) return;
        let text = "";
        this.result.filters.forEach((filter) => {
          text += `#DROP + ${filter.blockedPGNs.join(", ")}
match(CAN1, ${filter.filter}, ${filter.mask})
{
}`;
        });
        console.log(text);
        navigator.clipboard.writeText(text).then(() => {
          alert("Results copied to clipboard!");
        });
      }
    },
    watch: {
      blockPGNsInput: function(newVal, oldVal) {
        if (newVal) ;
        else {
          console.log("blockPGNsInputblockPGNsInput", newVal, oldVal);
        }
      },
      blockedPGNs: function(newVal, oldVal) {
        console.log("blockedPGNsblockedPGNs", newVal, oldVal);
        if (newVal) ;
        else {
          console.log("blockedPGNsblockedPGNs", newVal, oldVal);
        }
      }
    }
  };
  const _hoisted_1$2 = { class: "pgnFilter" };
  const _hoisted_2$2 = { class: "input-section" };
  const _hoisted_3$1 = { class: "input-group" };
  const _hoisted_4$1 = { class: "input-group" };
  const _hoisted_5$1 = { class: "options-section" };
  const _hoisted_6$1 = { class: "button-section" };
  const _hoisted_7$1 = {
    key: 0,
    class: "results-section"
  };
  const _hoisted_8$1 = { class: "filter-details" };
  const _hoisted_9$1 = { key: 0 };
  const _hoisted_10$1 = { class: "analysis-section" };
  const _hoisted_11$1 = { key: 0 };
  const _hoisted_12$1 = {
    key: 1,
    class: "error-section"
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return openBlock(), createElementBlock("div", _hoisted_1$2, [
      _cache[21] || (_cache[21] = createBaseVNode("h2", null, "PGN Filter Optimizer", -1)),
      createBaseVNode("div", _hoisted_2$2, [
        createBaseVNode("div", _hoisted_3$1, [
          _cache[9] || (_cache[9] = createBaseVNode("label", null, "PGNs to Block:", -1)),
          withDirectives(createBaseVNode("textarea", {
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.blockPGNsInput = $event),
            placeholder: "Enter PGNs to block (comma separated)\nExample: 0x1F112, 0x1F801, 129025",
            rows: "4"
          }, null, 512), [
            [vModelText, $data.blockPGNsInput]
          ])
        ]),
        createBaseVNode("div", _hoisted_4$1, [
          _cache[10] || (_cache[10] = createBaseVNode("label", null, "PGNs to Keep:", -1)),
          withDirectives(createBaseVNode("textarea", {
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.keepPGNsInput = $event),
            placeholder: "Enter PGNs to keep (comma separated)\nExample: 0x1F802, 0x1F803",
            rows: "4"
          }, null, 512), [
            [vModelText, $data.keepPGNsInput]
          ])
        ])
      ]),
      createBaseVNode("div", _hoisted_5$1, [
        createBaseVNode("label", null, [
          withDirectives(createBaseVNode("input", {
            "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.strictMode = $event),
            type: "checkbox"
          }, null, 512), [
            [vModelCheckbox, $data.strictMode]
          ]),
          _cache[11] || (_cache[11] = createTextVNode(" Strict Mode ", -1))
        ]),
        createBaseVNode("label", null, [
          _cache[12] || (_cache[12] = createTextVNode(" Max Filters: ", -1)),
          withDirectives(createBaseVNode("input", {
            "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.maxFilters = $event),
            max: "16",
            min: "1",
            type: "number"
          }, null, 512), [
            [
              vModelText,
              $data.maxFilters,
              void 0,
              { number: true }
            ]
          ])
        ]),
        createBaseVNode("label", null, [
          _cache[14] || (_cache[14] = createTextVNode(" Bit Length: ", -1)),
          withDirectives(createBaseVNode("select", {
            "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $data.bitLength = $event)
          }, [..._cache[13] || (_cache[13] = [
            createStaticVNode('<option value="0" data-v-7130d404>Auto</option><option value="11" data-v-7130d404>11-bit (CAN 2.0A)</option><option value="18" data-v-7130d404>18-bit (PGN only)</option><option value="29" data-v-7130d404>29-bit (J1939)</option><option value="32" data-v-7130d404>32-bit</option>', 5)
          ])], 512), [
            [
              vModelSelect,
              $data.bitLength,
              void 0,
              { number: true }
            ]
          ])
        ])
      ]),
      createBaseVNode("div", _hoisted_6$1, [
        createBaseVNode("button", {
          class: "btn",
          onClick: _cache[5] || (_cache[5] = (...args) => $options.analyze && $options.analyze(...args))
        }, "Calculate Filters"),
        createBaseVNode("button", {
          class: "btn",
          onClick: _cache[6] || (_cache[6] = (...args) => $options.loadPNGs && $options.loadPNGs(...args))
        }, "Load PNG's"),
        createBaseVNode("button", {
          class: "btn",
          onClick: _cache[7] || (_cache[7] = (...args) => $options.reset && $options.reset(...args))
        }, "Reset")
      ]),
      $data.result ? (openBlock(), createElementBlock("div", _hoisted_7$1, [
        createBaseVNode("h3", null, "Optimized Filters (" + toDisplayString($data.result.filters.length) + ")", 1),
        (openBlock(true), createElementBlock(Fragment, null, renderList($data.result.filters, (filter, index) => {
          return openBlock(), createElementBlock("div", {
            key: index,
            class: "filter-card"
          }, [
            createBaseVNode("h4", null, "Filter " + toDisplayString(index + 1) + ": " + toDisplayString(filter.filter) + " " + toDisplayString(filter.mask), 1),
            createBaseVNode("div", _hoisted_8$1, [
              createBaseVNode("div", null, [
                _cache[15] || (_cache[15] = createBaseVNode("strong", null, "Mask:", -1)),
                createTextVNode(" " + toDisplayString(filter.mask), 1)
              ]),
              createBaseVNode("div", null, [
                _cache[16] || (_cache[16] = createBaseVNode("strong", null, "Filter Value:", -1)),
                createTextVNode(" " + toDisplayString(filter.filter), 1)
              ]),
              createBaseVNode("div", null, [
                _cache[17] || (_cache[17] = createBaseVNode("strong", null, "Blocks:", -1)),
                createTextVNode(" " + toDisplayString(filter.blockedCount) + " PGN(s)", 1)
              ]),
              filter.blockedPGNs.length ? (openBlock(), createElementBlock("div", _hoisted_9$1, [
                _cache[18] || (_cache[18] = createBaseVNode("strong", null, "Blocked PGNs:", -1)),
                createTextVNode(" " + toDisplayString(filter.blockedPGNs.join(", ")), 1)
              ])) : createCommentVNode("", true)
            ])
          ]);
        }), 128)),
        createBaseVNode("div", _hoisted_10$1, [
          _cache[20] || (_cache[20] = createBaseVNode("h4", null, "Analysis", -1)),
          createBaseVNode("div", null, "Bit Length Used: " + toDisplayString($data.result.analysis.bitLengthUsed), 1),
          createBaseVNode("div", null, "Efficiency: " + toDisplayString($data.result.analysis.efficiency), 1),
          createBaseVNode("div", null, "Successfully Blocked: " + toDisplayString($data.result.analysis.successfullyBlocked) + "/" + toDisplayString($data.result.analysis.totalPGNsToBlock), 1),
          $data.result.analysis.conflicts.length ? (openBlock(), createElementBlock("div", _hoisted_11$1, [
            _cache[19] || (_cache[19] = createBaseVNode("strong", null, "Conflicts:", -1)),
            (openBlock(true), createElementBlock(Fragment, null, renderList($data.result.analysis.conflicts, (conflict, idx) => {
              return openBlock(), createElementBlock("div", {
                key: idx,
                class: "conflict"
              }, toDisplayString(conflict.reason) + ": " + toDisplayString(Array.isArray(conflict.devicesPGNs) ? conflict.devicesPGNs.join(", ") : conflict.devicesPGNs), 1);
            }), 128))
          ])) : createCommentVNode("", true)
        ]),
        createBaseVNode("div", {
          class: "btn",
          onClick: _cache[8] || (_cache[8] = (...args) => $options.copyResults && $options.copyResults(...args))
        }, "Copy")
      ])) : createCommentVNode("", true),
      $data.error ? (openBlock(), createElementBlock("div", _hoisted_12$1, toDisplayString($data.error), 1)) : createCommentVNode("", true)
    ]);
  }
  const PGNFilter = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-7130d404"]]);
  const _sfc_main$1 = {
    name: "GpsTracker",
    props: {
      autoUpdate: Boolean,
      trackingPGNs: Set,
      // Single point to add (reactive)
      pgn: {
        type: Object,
        // {fields :{ latitude, longitude, timestamp?, speed? }}
        default: null
      },
      // Auto-start tracking
      autoStart: {
        type: Boolean,
        default: false
      },
      // Maximum points to keep (0 = unlimited)
      maxPoints: {
        type: Number,
        default: 0
      },
      // Canvas dimensions
      width: {
        type: Number,
        default: 800
      },
      height: {
        type: Number,
        default: 600
      }
    },
    data() {
      return {
        // Track data
        tracks: /* @__PURE__ */ new Map(),
        // Map<trackId, { name, color, points[], isActive }>
        activeTrackId: null,
        isTracking: false,
        startTime: null,
        currentPosition: null,
        previousPosition: null,
        // Canvas rendering
        canvasWidth: this.width,
        canvasHeight: this.height,
        ctx: null,
        zoom: 10,
        panX: 0,
        panY: 0,
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
        lastPanX: 0,
        lastPanY: 0,
        // Settings
        autoCenter: true,
        showGrid: true,
        showAllTracks: true,
        showTime: true,
        // Mouse position
        mousePosition: null,
        mouseCanvasX: 0,
        mouseCanvasY: 0,
        // Metrics
        totalDistance: 0,
        currentSpeed: 0,
        avgSpeed: 0,
        lastUpdateTime: null,
        // Animation
        animationFrame: null,
        needsRedraw: true,
        // Color palette for tracks
        colorPalette: [
          "#2196F3",
          // Blue
          "#4CAF50",
          // Green
          "#FF9800",
          // Orange
          "#9C27B0",
          // Purple
          "#F44336",
          // Red
          "#00BCD4",
          // Cyan
          "#FFEB3B",
          // Yellow
          "#795548",
          // Brown
          "#607D8B",
          // Blue Grey
          "#E91E63"
          // Pink
        ]
      };
    },
    computed: {
      activeTrack() {
        if (!this.activeTrackId || !this.tracks.has(this.activeTrackId)) {
          return null;
        }
        return this.tracks.get(this.activeTrackId);
      },
      hasTrack() {
        return this.activeTrack && this.activeTrack.points.length > 0;
      },
      statusClass() {
        if (!this.isTracking) return "status-stopped";
        if (!this.autoUpdate) return "status-paused";
        return "status-tracking";
      },
      statusText() {
        if (!this.isTracking) return "Stopped";
        if (!this.autoUpdate) return "Paused";
        return "Tracking";
      },
      zoomLevel() {
        return this.zoom.toFixed(2);
      },
      scaleLabel() {
        const scaleMeters = 100 / this.zoom;
        if (scaleMeters >= 1e3) {
          return `${(scaleMeters / 1e3).toFixed(2)} km`;
        }
        return `${scaleMeters.toFixed(2)} m`;
      },
      currentMarkerStyle() {
        if (!this.currentPosition) return {};
        const point = this.projectToCanvas(
          this.currentPosition.latitude,
          this.currentPosition.longitude
        );
        return {
          left: `${point.x}px`,
          top: `${point.y}px`
        };
      },
      duration() {
        if (!this.activeTrack || this.activeTrack.points.length < 2) return "00:00";
        const firstPoint = this.activeTrack.points[0];
        const lastPoint = this.activeTrack.points[this.activeTrack.points.length - 1];
        const start = firstPoint.timestamp || this.startTime;
        const end = lastPoint.timestamp || Date.now();
        const diff = end - start;
        const hours = Math.floor(diff / 36e5);
        const minutes = Math.floor(diff % 36e5 / 6e4);
        if (hours > 0) {
          return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
        }
        return `${minutes.toString().padStart(2, "0")}:${Math.floor(diff % 6e4 / 1e3).toString().padStart(2, "0")}`;
      }
    },
    watch: {
      pgn(newPgn) {
        try {
          if (!newPgn || !newPgn.fields || typeof newPgn.fields.latitude === "undefined" || typeof newPgn.fields.longitude === "undefined" || !newPgn.fields.latitude || !newPgn.fields.longitude) {
            return;
          }
          if (!this.isTracking || !this.autoUpdate) {
            return;
          }
          this.trackingPGNs.forEach((tracked) => {
            if (`${newPgn.src}:${newPgn.pgn}` !== tracked) {
              return;
            }
            const trackId = tracked || "default";
            if (!this.tracks.has(trackId)) {
              this.createTrack(trackId);
            }
            if (!this.activeTrackId) {
              this.activeTrackId = trackId;
            }
            if (this.isTracking) {
              this.addPointToTrack(trackId, {
                latitude: newPgn.fields.latitude,
                longitude: newPgn.fields.longitude,
                timestamp: Date.now()
              });
            }
          });
        } catch (e) {
          console.error("Error processing PGN:", e);
        }
      },
      isTracking(newVal) {
        if (newVal) {
          this.startTime = Date.now();
          this.$emit("tracking-started");
        } else {
          this.$emit("tracking-stopped", {
            tracks: this.tracks.size,
            totalPoints: this.getAllPoints().length,
            totalDistance: this.getTotalDistance()
          });
        }
      },
      activeTrackId(newTrackId) {
        this.updateMetrics();
        this.needsRedraw = true;
      },
      showAllTracks() {
        this.needsRedraw = true;
      },
      showTime() {
        this.needsRedraw = true;
      },
      zoom() {
        this.needsRedraw = true;
      },
      panX() {
        this.needsRedraw = true;
      },
      panY() {
        this.needsRedraw = true;
      },
      showGrid() {
        this.needsRedraw = true;
      }
    },
    mounted() {
      this.initCanvas();
      this.setupAnimation();
      if (this.autoStart) {
        this.startTracking();
      }
      window.addEventListener("resize", this.handleResize);
    },
    beforeDestroy() {
      window.removeEventListener("resize", this.handleResize);
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
      }
    },
    methods: {
      initCanvas() {
        const canvas = this.$refs.canvas;
        this.ctx = canvas.getContext("2d");
        const dpr = 1;
        this.canvasWidth = this.width * dpr;
        this.canvasHeight = this.height * dpr;
        canvas.width = this.canvasWidth;
        canvas.height = this.canvasHeight;
        canvas.style.width = `${this.width}px`;
        canvas.style.height = `${this.height}px`;
        this.ctx.scale(dpr, dpr);
      },
      setupAnimation() {
        const animate = () => {
          if (this.needsRedraw) {
            this.draw();
            this.needsRedraw = false;
          }
          this.animationFrame = requestAnimationFrame(animate);
        };
        animate();
      },
      // Track management methods
      createTrack(trackId, name = null) {
        const colorIndex = this.tracks.size % this.colorPalette.length;
        const track2 = {
          name: name || `Track ${this.tracks.size + 1}`,
          color: this.colorPalette[colorIndex],
          points: [],
          isActive: true
        };
        this.tracks.set(trackId, track2);
        if (!this.activeTrackId) {
          this.activeTrackId = trackId;
        }
        this.$emit("track-created", { trackId, track: track2 });
        this.needsRedraw = true;
      },
      removeTrack(trackId) {
        if (this.tracks.has(trackId)) {
          this.tracks.delete(trackId);
          if (this.activeTrackId === trackId) {
            this.activeTrackId = this.tracks.keys().next().value || null;
          }
          this.$emit("track-removed", trackId);
          this.needsRedraw = true;
        }
        this.$emit("trackPgn", trackId);
      },
      setActiveTrack(trackId) {
        if (this.tracks.has(trackId)) {
          this.activeTrackId = trackId;
          this.$emit("track-activated", trackId);
        }
      },
      clearTrack(trackId) {
        if (trackId && this.tracks.has(trackId)) {
          const track2 = this.tracks.get(trackId);
          track2.points = [];
          track2.startTime = null;
          this.tracks.set(trackId, track2);
          if (this.activeTrackId === trackId) {
            this.currentPosition = null;
            this.previousPosition = null;
            this.totalDistance = 0;
            this.currentSpeed = 0;
            this.avgSpeed = 0;
          }
          this.$emit("track-cleared", trackId);
          this.needsRedraw = true;
        }
      },
      clearAllTracks() {
        this.tracks.clear();
        this.activeTrackId = null;
        this.currentPosition = null;
        this.previousPosition = null;
        this.totalDistance = 0;
        this.currentSpeed = 0;
        this.avgSpeed = 0;
        this.startTime = null;
        this.panX = 0;
        this.panY = 0;
        this.zoom = 150;
        this.$emit("all-tracks-cleared");
        this.needsRedraw = true;
      },
      updateTrackColor() {
        if (this.activeTrack) {
          this.$emit("track-updated", {
            trackId: this.activeTrackId,
            field: "color",
            value: this.activeTrack.color
          });
          this.needsRedraw = true;
        }
      },
      addPointToTrack(trackId, point) {
        if (!this.tracks.has(trackId)) return;
        const track2 = this.tracks.get(trackId);
        const newPoint = {
          latitude: point.latitude,
          longitude: point.longitude,
          timestamp: point.timestamp || Date.now(),
          speed: point.speed || 0
        };
        track2.points.push(newPoint);
        this.tracks.set(trackId, track2);
        if (trackId === this.activeTrackId) {
          this.currentPosition = newPoint;
          if (this.previousPosition) {
            this.totalDistance += this.calculateDistance(
              this.previousPosition.latitude,
              this.previousPosition.longitude,
              point.latitude,
              point.longitude
            );
          }
          this.previousPosition = newPoint;
          this.currentSpeed = newPoint.speed;
          if (this.autoCenter && this.isTracking) {
            this.centerOnPoint(newPoint);
          }
        }
        if (this.maxPoints > 0 && track2.points.length > this.maxPoints) {
          track2.points.shift();
          this.tracks.set(trackId, track2);
        }
        this.$emit("point-added", {
          trackId,
          point: newPoint,
          totalPoints: track2.points.length
        });
        this.$emit("track-updated", {
          trackId,
          field: "points",
          value: track2.points
        });
        this.needsRedraw = true;
      },
      // Project latitude/longitude to canvas coordinates
      projectToCanvas(lat, lon) {
        const scale = 111319.9 * this.zoom;
        let refLat = 0, refLon = 0;
        const allPoints = this.getAllPoints();
        if (allPoints.length > 0) {
          refLat = allPoints[0].latitude;
          refLon = allPoints[0].longitude;
        } else if (this.currentPosition) {
          refLat = this.currentPosition.latitude;
          refLon = this.currentPosition.longitude;
        }
        const x = this.width / 2 + (lon - refLon) * scale * Math.cos(refLat * Math.PI / 180) + this.panX;
        const y = this.height / 2 - (lat - refLat) * scale + this.panY;
        return { x, y };
      },
      // Convert canvas coordinates to lat/lon
      canvasToLatLon(x, y) {
        const scale = 111319.9 * this.zoom;
        let refLat = 0, refLon = 0;
        const allPoints = this.getAllPoints();
        if (allPoints.length > 0) {
          refLat = allPoints[0].latitude;
          refLon = allPoints[0].longitude;
        }
        const lon = refLon + (x - this.width / 2 - this.panX) / (scale * Math.cos(refLat * Math.PI / 180));
        const lat = refLat - (y - this.height / 2 - this.panY) / scale;
        return { lat, lon };
      },
      draw() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.width, this.height);
        if (this.showGrid) {
          this.drawGrid();
        }
        for (const [trackId, track2] of this.tracks) {
          if (this.showAllTracks || trackId === this.activeTrackId) {
            this.drawTrack(trackId, track2);
          }
        }
        if (this.activeTrack && this.activeTrack.points.length > 0) {
          this.drawPoints(this.activeTrack);
        }
        if (this.activeTrack && this.activeTrack.points.length > 0) {
          this.drawMarkers(this.activeTrack);
        }
      },
      drawGrid() {
        this.ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
        this.ctx.lineWidth = 1;
        const gridSize = 50;
        const startX = this.panX % gridSize - gridSize;
        const startY = this.panY % gridSize - gridSize;
        for (let x = startX; x < this.width; x += gridSize) {
          this.ctx.beginPath();
          this.ctx.moveTo(x, 0);
          this.ctx.lineTo(x, this.height);
          this.ctx.stroke();
        }
        for (let y = startY; y < this.height; y += gridSize) {
          this.ctx.beginPath();
          this.ctx.moveTo(0, y);
          this.ctx.lineTo(this.width, y);
          this.ctx.stroke();
        }
      },
      drawTrack(trackId, track2) {
        if (track2.points.length < 2) return;
        this.ctx.beginPath();
        this.ctx.strokeStyle = track2.color;
        this.ctx.lineWidth = trackId === this.activeTrackId ? 3 : 2;
        this.ctx.lineJoin = "round";
        this.ctx.lineCap = "round";
        this.ctx.globalAlpha = trackId === this.activeTrackId ? 1 : 0.7;
        const firstPoint = this.projectToCanvas(
          track2.points[0].latitude,
          track2.points[0].longitude
        );
        this.ctx.moveTo(firstPoint.x, firstPoint.y);
        for (let i = 1; i < track2.points.length; i++) {
          const point = this.projectToCanvas(
            track2.points[i].latitude,
            track2.points[i].longitude
          );
          this.ctx.lineTo(point.x, point.y);
        }
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
      },
      drawPoints(track2) {
        track2.points.forEach((point, index) => {
          const canvasPoint = this.projectToCanvas(point.latitude, point.longitude);
          this.ctx.beginPath();
          this.ctx.fillStyle = index === track2.points.length - 1 ? "#F44336" : (
            // Red for last point
            this.darkenColor(track2.color, 0.2)
          );
          this.ctx.arc(canvasPoint.x, canvasPoint.y, 3, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.beginPath();
          this.ctx.strokeStyle = "#FFFFFF";
          this.ctx.lineWidth = 1;
          this.ctx.arc(canvasPoint.x, canvasPoint.y, 3, 0, Math.PI * 2);
          this.ctx.stroke();
          this.ctx.font = "10px Arial";
          this.ctx.fillStyle = "#000000";
          this.ctx.textAlign = "left";
          this.ctx.textBaseline = "middle";
          this.ctx.fillText(
            `${(index + 1).toString()} [${this.showTime ? this.formatTimeWithSeconds(point.timestamp) : ""}]`,
            // Add 1 to start counting from 1 instead of 0
            canvasPoint.x + 10,
            // Offset to the right of the point
            canvasPoint.y
            // Same vertical position
          );
        });
      },
      drawMarkers(track2) {
        const startPoint = this.projectToCanvas(
          track2.points[0].latitude,
          track2.points[0].longitude
        );
        this.ctx.beginPath();
        this.ctx.fillStyle = "#4CAF50";
        this.ctx.arc(startPoint.x, startPoint.y, 6, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = "#FFFFFF";
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.font = "bold 10px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText("S", startPoint.x, startPoint.y);
        if (!this.isTracking) {
          const endPoint = this.projectToCanvas(
            track2.points[track2.points.length - 1].latitude,
            track2.points[track2.points.length - 1].longitude
          );
          this.ctx.beginPath();
          this.ctx.fillStyle = "#F44336";
          this.ctx.arc(endPoint.x, endPoint.y, 6, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.strokeStyle = "#FFFFFF";
          this.ctx.lineWidth = 2;
          this.ctx.stroke();
          this.ctx.fillStyle = "#FFFFFF";
          this.ctx.fillText("F", endPoint.x, endPoint.y);
        }
      },
      // Core tracking methods
      startTracking() {
        this.isTracking = true;
        this.startTime = Date.now();
        this.$emit("tracking-started");
      },
      stopTracking() {
        this.isTracking = false;
        this.$emit("tracking-stopped", {
          tracks: this.tracks.size,
          totalPoints: this.getAllPoints().length,
          totalDistance: this.getTotalDistance()
        });
      },
      toggleTracking() {
        if (this.isTracking) {
          this.stopTracking();
        } else {
          if (!this.autoUpdate) {
            this.$emit("update:autoUpdate", true);
          }
          this.startTracking();
        }
      },
      centerOnPoint(point) {
        if (!point) return;
        const canvasPoint = this.projectToCanvas(point.latitude, point.longitude);
        const targetX = this.width / 2;
        const targetY = this.height / 4;
        this.panX += targetX - canvasPoint.x;
        this.panY += targetY - canvasPoint.y;
        this.needsRedraw = true;
      },
      updateMetrics() {
        if (!this.activeTrack || this.activeTrack.points.length < 2) {
          this.avgSpeed = 0;
          this.totalDistance = this.activeTrack ? this.calculateTrackDistance(this.activeTrack) : 0;
          return;
        }
        const points = this.activeTrack.points;
        const firstPoint = points[0];
        const lastPoint = points[points.length - 1];
        const totalTime = (lastPoint.timestamp - firstPoint.timestamp) / 36e5;
        this.totalDistance = this.calculateTrackDistance(this.activeTrack);
        if (totalTime > 0) {
          this.avgSpeed = this.totalDistance / totalTime;
        }
      },
      // Canvas interaction
      handleWheel(event) {
        const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
        const mouseX = event.offsetX;
        const mouseY = event.offsetY;
        const worldBefore = this.canvasToLatLon(mouseX, mouseY);
        this.zoom *= zoomFactor;
        this.zoom = Math.max(0.1, Math.min(this.zoom, 20));
        const worldAfter = this.canvasToLatLon(mouseX, mouseY);
        const deltaLon = worldAfter.lon - worldBefore.lon;
        const deltaLat = worldAfter.lat - worldBefore.lat;
        const scale = 111319.9 * this.zoom;
        this.panX -= deltaLon * scale * Math.cos(worldBefore.lat * Math.PI / 180);
        this.panY += deltaLat * scale;
        this.needsRedraw = true;
      },
      startDrag(event) {
        this.isDragging = true;
        this.dragStartX = event.offsetX;
        this.dragStartY = event.offsetY;
        this.lastPanX = this.panX;
        this.lastPanY = this.panY;
      },
      handleMouseMove(event) {
        const mouseX = event.offsetX;
        const mouseY = event.offsetY;
        this.mousePosition = this.canvasToLatLon(mouseX, mouseY);
        this.mouseCanvasX = mouseX;
        this.mouseCanvasY = mouseY;
        if (this.isDragging) {
          const deltaX = mouseX - this.dragStartX;
          const deltaY = mouseY - this.dragStartY;
          this.panX = this.lastPanX + deltaX;
          this.panY = this.lastPanY + deltaY;
          this.needsRedraw = true;
        }
      },
      endDrag() {
        this.isDragging = false;
      },
      zoomIn() {
        this.zoom *= 1.2;
        this.needsRedraw = true;
      },
      zoomOut() {
        this.zoom *= 0.8;
        this.needsRedraw = true;
      },
      // Utility methods
      calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      },
      calculateTrackDistance(track2) {
        if (track2.points.length < 2) return 0;
        let distance = 0;
        for (let i = 1; i < track2.points.length; i++) {
          distance += this.calculateDistance(
            track2.points[i - 1].latitude,
            track2.points[i - 1].longitude,
            track2.points[i].latitude,
            track2.points[i].longitude
          );
        }
        return distance;
      },
      formatTimeWithSeconds(timestamp) {
        return new Date(timestamp).toISOString().substring(11);
      },
      formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString();
      },
      getAllPoints() {
        const allPoints = [];
        for (const track2 of this.tracks.values()) {
          allPoints.push(...track2.points);
        }
        return allPoints;
      },
      getTotalDistance() {
        let total = 0;
        for (const track2 of this.tracks.values()) {
          total += this.calculateTrackDistance(track2);
        }
        return total;
      },
      darkenColor(color, amount) {
        let r = parseInt(color.slice(1, 3), 16);
        let g = parseInt(color.slice(3, 5), 16);
        let b = parseInt(color.slice(5, 7), 16);
        r = Math.floor(r * (1 - amount));
        g = Math.floor(g * (1 - amount));
        b = Math.floor(b * (1 - amount));
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      },
      // Export methods
      exportActiveTrack() {
        if (!this.activeTrack) return;
        const geojson = {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: this.activeTrack.points.map((p2) => [p2.longitude, p2.latitude])
              },
              properties: {
                color: this.activeTrack.color,
                points: this.activeTrack.points.length,
                distance: this.totalDistance,
                duration: this.duration
              }
            }
          ]
        };
        this.downloadFile(`${this.activeTrackId}.geojson`, JSON.stringify(geojson, null, 2));
      },
      exportAllTracks() {
        const features = [];
        for (const [trackId, track2] of this.tracks) {
          if (track2.points.length > 0) {
            features.push({
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: track2.points.map((p2) => [p2.longitude, p2.latitude])
              },
              properties: {
                id: trackId,
                color: track2.color,
                points: track2.points.length,
                distance: this.calculateTrackDistance(track2)
              }
            });
          }
        }
        const geojson = {
          type: "FeatureCollection",
          features
        };
        this.downloadFile("all-tracks.geojson", JSON.stringify(geojson, null, 2));
      },
      copyActiveTrack() {
        if (!this.activeTrack) return;
        const text = JSON.stringify({
          trackId: this.activeTrackId,
          ...this.activeTrack
        }, null, 2);
        navigator.clipboard.writeText(text).then(() => {
          this.$emit("copied");
        });
      },
      downloadFile(filename, content) {
        const blob = new Blob([content], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      },
      // Demo
      simulateMultipleTracks() {
        this.clearAllTracks();
        const trackIds = ["boat-1", "boat-2", "boat-3"];
        const centers = [
          { lat: 40.7128, lon: -74.006 },
          { lat: 40.72, lon: -74.01 },
          { lat: 40.705, lon: -74 }
        ];
        trackIds.forEach((trackId, index) => {
          this.createTrack(trackId, `Boat ${index + 1}`);
          this.startTracking();
          const points = 20;
          const radius = 3e-3 * (index + 1);
          for (let i = 0; i < points; i++) {
            setTimeout(() => {
              const angle = i / points * Math.PI * 2 + index * Math.PI / 3;
              const lat = centers[index].lat + Math.sin(angle) * radius * (i / points);
              const lon = centers[index].lon + Math.cos(angle) * radius * (i / points);
              this.addPointToTrack(trackId, {
                latitude: lat,
                longitude: lon,
                timestamp: Date.now()
              });
            }, i * 100);
          }
        });
        setTimeout(() => {
          this.stopTracking();
        }, trackIds.length * 20 * 100 + 100);
      },
      fitToView() {
        const allPoints = this.getAllPoints();
        if (allPoints.length === 0) return;
        let minLat = allPoints[0].latitude;
        let maxLat = allPoints[0].latitude;
        let minLon = allPoints[0].longitude;
        let maxLon = allPoints[0].longitude;
        allPoints.forEach((point) => {
          minLat = Math.min(minLat, point.latitude);
          maxLat = Math.max(maxLat, point.latitude);
          minLon = Math.min(minLon, point.longitude);
          maxLon = Math.max(maxLon, point.longitude);
        });
        const latSpan = maxLat - minLat;
        const lonSpan = maxLon - minLon;
        const scaleLat = this.height * 0.8 / (latSpan * 111319.9);
        const scaleLon = this.width * 0.8 / (lonSpan * 111319.9 * Math.cos(minLat * Math.PI / 180));
        this.zoom = Math.min(scaleLat, scaleLon, 20);
        this.zoom = Math.max(this.zoom, 0.1);
        const centerLat = (minLat + maxLat) / 2;
        const centerLon = (minLon + maxLon) / 2;
        const centerPoint = this.projectToCanvas(centerLat, centerLon);
        this.panX = this.width / 2 - centerPoint.x;
        this.panY = this.height / 2 - centerPoint.y;
        this.needsRedraw = true;
      },
      handleResize() {
        this.needsRedraw = true;
      }
    }
  };
  const _hoisted_1$1 = { class: "gps-tracker" };
  const _hoisted_2$1 = { class: "panel" };
  const _hoisted_3 = { class: "panel-header" };
  const _hoisted_4 = { class: "left-controls" };
  const _hoisted_5 = ["title"];
  const _hoisted_6 = { key: 0 };
  const _hoisted_7 = { key: 1 };
  const _hoisted_8 = { key: 2 };
  const _hoisted_9 = ["disabled"];
  const _hoisted_10 = ["disabled"];
  const _hoisted_11 = ["value"];
  const _hoisted_12 = { class: "center-controls" };
  const _hoisted_13 = { class: "zoom-controls" };
  const _hoisted_14 = { class: "toggle" };
  const _hoisted_15 = { class: "toggle" };
  const _hoisted_16 = { class: "toggle" };
  const _hoisted_17 = { class: "toggle" };
  const _hoisted_18 = { class: "right-controls" };
  const _hoisted_19 = { class: "track-info" };
  const _hoisted_20 = { key: 0 };
  const _hoisted_21 = { key: 1 };
  const _hoisted_22 = { key: 2 };
  const _hoisted_23 = ["height", "width"];
  const _hoisted_24 = {
    key: 0,
    class: "no-data-overlay"
  };
  const _hoisted_25 = { class: "no-data-content" };
  const _hoisted_26 = { key: 0 };
  const _hoisted_27 = { key: 1 };
  const _hoisted_28 = { class: "scale-bar" };
  const _hoisted_29 = { class: "scale-label" };
  const _hoisted_30 = {
    key: 2,
    class: "coordinates-display"
  };
  const _hoisted_31 = {
    key: 3,
    class: "tracks-list-panel"
  };
  const _hoisted_32 = { class: "tracks-container" };
  const _hoisted_33 = ["onClick"];
  const _hoisted_34 = { class: "track-info" };
  const _hoisted_35 = { class: "track-name" };
  const _hoisted_36 = { class: "track-details" };
  const _hoisted_37 = { key: 0 };
  const _hoisted_38 = { class: "track-actions" };
  const _hoisted_39 = ["onClick"];
  const _hoisted_40 = { class: "info-panel" };
  const _hoisted_41 = { class: "info-section" };
  const _hoisted_42 = {
    key: 0,
    class: "position-info"
  };
  const _hoisted_43 = { class: "coord" };
  const _hoisted_44 = { class: "value" };
  const _hoisted_45 = { class: "coord" };
  const _hoisted_46 = { class: "coord" };
  const _hoisted_47 = { class: "value" };
  const _hoisted_48 = {
    key: 0,
    class: "coord"
  };
  const _hoisted_49 = { class: "value" };
  const _hoisted_50 = {
    key: 1,
    class: "no-position"
  };
  const _hoisted_51 = { class: "info-section" };
  const _hoisted_52 = { class: "stats-grid" };
  const _hoisted_53 = { class: "stat" };
  const _hoisted_54 = { class: "stat-value" };
  const _hoisted_55 = { class: "stat" };
  const _hoisted_56 = { class: "stat-value" };
  const _hoisted_57 = { class: "stat" };
  const _hoisted_58 = { class: "stat-value" };
  const _hoisted_59 = { class: "stat" };
  const _hoisted_60 = { class: "stat-value" };
  const _hoisted_61 = { class: "info-section" };
  const _hoisted_62 = { class: "export-buttons" };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return openBlock(), createElementBlock("div", _hoisted_1$1, [
      createBaseVNode("div", _hoisted_2$1, [
        createBaseVNode("div", _hoisted_3, [
          createBaseVNode("div", _hoisted_4, [
            createBaseVNode("button", {
              class: normalizeClass(["track-btn", { active: $data.isTracking, paused: !$props.autoUpdate }]),
              title: $data.isTracking ? "Stop tracking" : "Start tracking",
              onClick: _cache[0] || (_cache[0] = (...args) => $options.toggleTracking && $options.toggleTracking(...args))
            }, [
              $data.isTracking && $props.autoUpdate ? (openBlock(), createElementBlock("span", _hoisted_6, "●")) : !$props.autoUpdate ? (openBlock(), createElementBlock("span", _hoisted_7, "❚❚")) : (openBlock(), createElementBlock("span", _hoisted_8, "▶")),
              createTextVNode(" " + toDisplayString($data.isTracking ? !$props.autoUpdate ? "Paused" : "Tracking" : "Start Track"), 1)
            ], 10, _hoisted_5),
            createBaseVNode("button", {
              class: "btn",
              onClick: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("update:autoUpdate", !$props.autoUpdate))
            }, [
              createBaseVNode("i", {
                class: normalizeClass($props.autoUpdate ? "fas fa-pause" : "fas fa-play")
              }, null, 2),
              createTextVNode(" " + toDisplayString($props.autoUpdate ? "Pause Updates" : "Resume Updates"), 1)
            ]),
            createBaseVNode("button", {
              disabled: !$options.hasTrack,
              class: "clear-btn",
              onClick: _cache[2] || (_cache[2] = ($event) => $options.clearTrack(_ctx.tracked))
            }, " Clear This Track ", 8, _hoisted_9),
            createBaseVNode("button", {
              disabled: $data.tracks.size === 0,
              class: "clear-btn",
              onClick: _cache[3] || (_cache[3] = (...args) => $options.clearAllTracks && $options.clearAllTracks(...args))
            }, " Clear All Tracks ", 8, _hoisted_10),
            withDirectives(createBaseVNode("select", {
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $data.activeTrackId = $event),
              class: "track-select"
            }, [
              _cache[21] || (_cache[21] = createBaseVNode("option", { value: "" }, "Select Track", -1)),
              (openBlock(true), createElementBlock(Fragment, null, renderList($data.tracks, ([trackId, trackData]) => {
                return openBlock(), createElementBlock("option", {
                  key: trackId,
                  value: trackId
                }, toDisplayString(trackId) + " (" + toDisplayString(trackData.points.length) + " points) ", 9, _hoisted_11);
              }), 128))
            ], 512), [
              [vModelSelect, $data.activeTrackId]
            ])
          ]),
          createBaseVNode("div", _hoisted_12, [
            createBaseVNode("div", _hoisted_13, [
              createBaseVNode("button", {
                title: "Zoom out",
                onClick: _cache[5] || (_cache[5] = (...args) => $options.zoomOut && $options.zoomOut(...args))
              }, "-"),
              createBaseVNode("span", null, toDisplayString($options.zoomLevel) + "x", 1),
              createBaseVNode("button", {
                title: "Zoom in",
                onClick: _cache[6] || (_cache[6] = (...args) => $options.zoomIn && $options.zoomIn(...args))
              }, "+")
            ]),
            createBaseVNode("label", _hoisted_14, [
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $data.autoCenter = $event),
                type: "checkbox"
              }, null, 512), [
                [vModelCheckbox, $data.autoCenter]
              ]),
              _cache[22] || (_cache[22] = createBaseVNode("span", null, "Auto-center", -1))
            ]),
            createBaseVNode("label", _hoisted_15, [
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => $data.showGrid = $event),
                type: "checkbox"
              }, null, 512), [
                [vModelCheckbox, $data.showGrid]
              ]),
              _cache[23] || (_cache[23] = createBaseVNode("span", null, "Grid", -1))
            ]),
            createBaseVNode("label", _hoisted_16, [
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => $data.showAllTracks = $event),
                type: "checkbox"
              }, null, 512), [
                [vModelCheckbox, $data.showAllTracks]
              ]),
              _cache[24] || (_cache[24] = createBaseVNode("span", null, "Show All Tracks", -1))
            ]),
            createBaseVNode("label", _hoisted_17, [
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => $data.showTime = $event),
                type: "checkbox"
              }, null, 512), [
                [vModelCheckbox, $data.showTime]
              ]),
              _cache[25] || (_cache[25] = createBaseVNode("span", null, "Show time", -1))
            ])
          ]),
          createBaseVNode("div", _hoisted_18, [
            createBaseVNode("div", {
              class: normalizeClass([$options.statusClass, "status-indicator"])
            }, toDisplayString($options.statusText), 3),
            createBaseVNode("div", _hoisted_19, [
              $options.activeTrack ? (openBlock(), createElementBlock("span", _hoisted_20, "Points: " + toDisplayString($options.activeTrack.points.length), 1)) : createCommentVNode("", true),
              $options.activeTrack && $data.totalDistance > 0 ? (openBlock(), createElementBlock("span", _hoisted_21, toDisplayString($data.totalDistance.toFixed(2)) + " km", 1)) : createCommentVNode("", true),
              $options.activeTrack && $options.activeTrack.points.length > 0 ? (openBlock(), createElementBlock("span", _hoisted_22, toDisplayString($options.duration), 1)) : createCommentVNode("", true),
              createBaseVNode("span", null, "Tracks: " + toDisplayString($data.tracks.size), 1)
            ])
          ])
        ]),
        createBaseVNode("div", {
          class: normalizeClass([{ "cursor-grab": !$data.isDragging, "cursor-grabbing": $data.isDragging }, "canvas-container"]),
          onMousedown: _cache[12] || (_cache[12] = (...args) => $options.startDrag && $options.startDrag(...args)),
          onMouseleave: _cache[13] || (_cache[13] = (...args) => $options.endDrag && $options.endDrag(...args)),
          onMousemove: _cache[14] || (_cache[14] = (...args) => $options.handleMouseMove && $options.handleMouseMove(...args)),
          onMouseup: _cache[15] || (_cache[15] = (...args) => $options.endDrag && $options.endDrag(...args))
        }, [
          createBaseVNode("canvas", {
            ref: "canvas",
            height: $data.canvasHeight,
            width: $data.canvasWidth
          }, null, 8, _hoisted_23),
          !$options.hasTrack && $data.tracks.size === 0 ? (openBlock(), createElementBlock("div", _hoisted_24, [
            createBaseVNode("div", _hoisted_25, [
              _cache[26] || (_cache[26] = createBaseVNode("div", { class: "icon" }, "📍", -1)),
              _cache[27] || (_cache[27] = createBaseVNode("h3", null, "No Track Data", -1)),
              !$data.isTracking ? (openBlock(), createElementBlock("p", _hoisted_26, 'Click "Start Track" to begin recording')) : (openBlock(), createElementBlock("p", _hoisted_27, "Waiting for GPS data...")),
              createBaseVNode("button", {
                class: "demo-btn",
                onClick: _cache[11] || (_cache[11] = (...args) => $options.simulateMultipleTracks && $options.simulateMultipleTracks(...args))
              }, " Try Demo Tracks ")
            ])
          ])) : createCommentVNode("", true),
          $data.currentPosition && $data.isTracking && !$props.autoUpdate ? (openBlock(), createElementBlock("div", {
            key: 1,
            style: normalizeStyle($options.currentMarkerStyle),
            class: "current-marker"
          }, [..._cache[28] || (_cache[28] = [
            createBaseVNode("div", { class: "pulse" }, null, -1),
            createBaseVNode("div", { class: "center-dot" }, null, -1)
          ])], 4)) : createCommentVNode("", true),
          createBaseVNode("div", _hoisted_28, [
            _cache[29] || (_cache[29] = createBaseVNode("div", { class: "scale-line" }, null, -1)),
            createBaseVNode("div", _hoisted_29, toDisplayString($options.scaleLabel), 1)
          ]),
          $data.mousePosition ? (openBlock(), createElementBlock("div", _hoisted_30, toDisplayString($data.mousePosition.lat.toFixed(6)) + ", " + toDisplayString($data.mousePosition.lon.toFixed(6)), 1)) : createCommentVNode("", true),
          $data.tracks.size > 0 ? (openBlock(), createElementBlock("div", _hoisted_31, [
            createBaseVNode("h4", null, "All Tracks (" + toDisplayString($data.tracks.size) + ")", 1),
            createBaseVNode("div", _hoisted_32, [
              (openBlock(true), createElementBlock(Fragment, null, renderList($data.tracks, ([trackId, trackData]) => {
                return openBlock(), createElementBlock("div", {
                  key: trackId,
                  class: normalizeClass(["track-item", { "active": trackId === $data.activeTrackId }]),
                  onClick: ($event) => $options.setActiveTrack(trackId)
                }, [
                  createBaseVNode("div", {
                    style: normalizeStyle({ backgroundColor: trackData.color }),
                    class: "track-color"
                  }, null, 4),
                  createBaseVNode("div", _hoisted_34, [
                    createBaseVNode("div", _hoisted_35, toDisplayString(trackId), 1),
                    createBaseVNode("div", _hoisted_36, [
                      createBaseVNode("span", null, toDisplayString(trackData.points.length) + " points", 1),
                      createBaseVNode("span", null, toDisplayString($options.calculateTrackDistance(trackData).toFixed(2)) + " km", 1),
                      trackData.points.length > 0 ? (openBlock(), createElementBlock("span", _hoisted_37, toDisplayString($options.formatTime(trackData.points[trackData.points.length - 1].timestamp)), 1)) : createCommentVNode("", true)
                    ])
                  ]),
                  createBaseVNode("div", _hoisted_38, [
                    createBaseVNode("button", {
                      class: "remove-btn",
                      title: "Remove track",
                      onClick: withModifiers(($event) => $options.removeTrack(trackId), ["stop"])
                    }, " × ", 8, _hoisted_39)
                  ])
                ], 10, _hoisted_33);
              }), 128))
            ])
          ])) : createCommentVNode("", true)
        ], 34),
        createBaseVNode("div", _hoisted_40, [
          createBaseVNode("div", _hoisted_41, [
            _cache[34] || (_cache[34] = createBaseVNode("h4", null, "Current Track", -1)),
            $options.activeTrack ? (openBlock(), createElementBlock("div", _hoisted_42, [
              createBaseVNode("div", _hoisted_43, [
                _cache[30] || (_cache[30] = createBaseVNode("span", { class: "label" }, "Track ID:", -1)),
                createBaseVNode("span", _hoisted_44, toDisplayString($data.activeTrackId), 1)
              ]),
              createBaseVNode("div", _hoisted_45, [
                _cache[31] || (_cache[31] = createBaseVNode("span", { class: "label" }, "Color:", -1)),
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => $options.activeTrack.color = $event),
                  class: "color-picker",
                  type: "color",
                  onChange: _cache[17] || (_cache[17] = (...args) => $options.updateTrackColor && $options.updateTrackColor(...args))
                }, null, 544), [
                  [vModelText, $options.activeTrack.color]
                ])
              ]),
              createBaseVNode("div", _hoisted_46, [
                _cache[32] || (_cache[32] = createBaseVNode("span", { class: "label" }, "Points:", -1)),
                createBaseVNode("span", _hoisted_47, toDisplayString($options.activeTrack.points.length), 1)
              ]),
              $data.currentPosition ? (openBlock(), createElementBlock("div", _hoisted_48, [
                _cache[33] || (_cache[33] = createBaseVNode("span", { class: "label" }, "Last Position:", -1)),
                createBaseVNode("span", _hoisted_49, toDisplayString($options.formatTime($data.currentPosition.timestamp)), 1)
              ])) : createCommentVNode("", true)
            ])) : (openBlock(), createElementBlock("div", _hoisted_50, " No track selected "))
          ]),
          createBaseVNode("div", _hoisted_51, [
            _cache[39] || (_cache[39] = createBaseVNode("h4", null, "Track Statistics", -1)),
            createBaseVNode("div", _hoisted_52, [
              createBaseVNode("div", _hoisted_53, [
                createBaseVNode("div", _hoisted_54, toDisplayString($options.activeTrack ? $options.activeTrack.points.length : 0), 1),
                _cache[35] || (_cache[35] = createBaseVNode("div", { class: "stat-label" }, "Points", -1))
              ]),
              createBaseVNode("div", _hoisted_55, [
                createBaseVNode("div", _hoisted_56, toDisplayString($data.totalDistance.toFixed(2)), 1),
                _cache[36] || (_cache[36] = createBaseVNode("div", { class: "stat-label" }, "km", -1))
              ]),
              createBaseVNode("div", _hoisted_57, [
                createBaseVNode("div", _hoisted_58, toDisplayString($options.duration), 1),
                _cache[37] || (_cache[37] = createBaseVNode("div", { class: "stat-label" }, "Duration", -1))
              ]),
              createBaseVNode("div", _hoisted_59, [
                createBaseVNode("div", _hoisted_60, toDisplayString($data.avgSpeed.toFixed(1)), 1),
                _cache[38] || (_cache[38] = createBaseVNode("div", { class: "stat-label" }, "km/h avg", -1))
              ])
            ])
          ]),
          createBaseVNode("div", _hoisted_61, [
            _cache[40] || (_cache[40] = createBaseVNode("h4", null, "Export", -1)),
            createBaseVNode("div", _hoisted_62, [
              createBaseVNode("button", {
                title: "Export active track",
                onClick: _cache[18] || (_cache[18] = (...args) => $options.exportActiveTrack && $options.exportActiveTrack(...args))
              }, "Export Active"),
              createBaseVNode("button", {
                title: "Export all tracks",
                onClick: _cache[19] || (_cache[19] = (...args) => $options.exportAllTracks && $options.exportAllTracks(...args))
              }, "Export All"),
              createBaseVNode("button", {
                title: "Copy to clipboard",
                onClick: _cache[20] || (_cache[20] = (...args) => $options.copyActiveTrack && $options.copyActiveTrack(...args))
              }, "📋")
            ])
          ])
        ])
      ])
    ]);
  }
  const GpsTracker = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-82f9ab4e"]]);
  const _hoisted_1 = { class: "app-container" };
  const _hoisted_2 = {
    key: 0,
    class: "error-banner"
  };
  const _sfc_main = {
    __name: "App",
    setup(__props) {
      const { config: config2 } = useConfigStore();
      const selectedDevice = ref(null);
      const searchQuery = ref("");
      const serverFilter = ref("");
      const pgnFilter = ref("");
      const autoUpdate = ref(false);
      const isConfigModalVisible = ref(false);
      const blockedPGNs = ref(/* @__PURE__ */ new Set());
      const trackingPGNs = ref(loadFromLocalStorage("trackingPGNs", "Set"));
      let freezePGNsArray = [];
      const {
        isConnected,
        isConnecting,
        connectionError,
        freezePGNs,
        servers,
        devicesPGNs,
        lastPgn,
        connectionStatus,
        connectWebSocket,
        disconnectWebSocket,
        reconnectWebSocket,
        clearAllData
      } = useNmeaWebSocket(autoUpdate, config2);
      const themeClass = computed(() => {
        if (config2.value.theme === "auto") {
          return window.matchMedia("(prefers-color-scheme: dark)").matches ? "theme-dark" : "theme-light";
        }
        return `theme-${config2.value.theme}`;
      });
      const devicesList = computed(() => {
        return Array.from(devicesPGNs.value.values()).sort((a, b) => {
          return a.src.toString().localeCompare(b.src.toString(), void 0, { numeric: true, sensitivity: "base" });
        });
      });
      const serversList = computed(() => {
        console.log("calcll serversList");
        return Array.from(servers.value.values());
      });
      const allPgns = computed(() => {
        console.log("redoo all!");
        if (freezePGNsArray.length) {
          if (freezePGNs) {
            return freezePGNsArray;
          } else {
            freezePGNsArray = [];
          }
        }
        const all = [];
        for (const [src, device] of devicesPGNs.value.entries()) {
          for (const [pgnId, pgnData] of device.pgns.entries()) {
            all.push(pgnData);
          }
        }
        all.sort((a, b) => {
          a.pgn.toString().localeCompare(b.pgn.toString(), void 0, { numeric: true, sensitivity: "base" });
        });
        if (freezePGNs.value) {
          console.log(freezePGNs);
        }
        return all;
      });
      const filteredPGNs = computed(() => {
        let filtered = allPgns.value;
        if (selectedDevice.value !== null) {
          filtered = filtered.filter((pgn) => pgn.src.toString() === selectedDevice.value.toString());
        }
        if (serverFilter.value !== "" && serverFilter.value !== null) {
          filtered = filtered.filter(
            (pgn) => pgn.serverAddress.toString() === serverFilter.value.toString() || pgn.servers.includes(serverFilter.value.toString())
          );
        }
        if (pgnFilter.value !== "" && pgnFilter.value !== null) {
          filtered = filtered.filter(
            (pgn) => pgn.pgn.toString() === pgnFilter.value.toString()
          );
        }
        if (searchQuery.value) {
          const query = searchQuery.value.toLowerCase();
          filtered = filtered.filter(
            (pgn) => typeof pgn.description === "string" && pgn.description.toLowerCase().includes(query) || typeof pgn.serverAddress === "string" && pgn.serverAddress.toLowerCase().includes(query) || pgn.pgn.toString().includes(query) || Object.keys(pgn.fields || {}).some(
              (field) => field.toLowerCase().includes(query)
            )
            //to check the value is very intensive for computation!!!!
            // ||
            // Object.values(pgn.fields || {}).some(value =>
            //     String(value).toLowerCase().includes(query)
            // )
          );
        }
        filtered.sort((a, b) => (Number(a.src) || 0) - (Number(b.src) || 0));
        filtered.sort((a, b) => (Number(a.pgn) || 0) - (Number(b.pgn) || 0));
        return filtered;
      });
      const totalDevices = computed(() => devicesPGNs.value.size);
      const totalPgns = computed(() => allPgns.value.length);
      const totalUpdates = computed(
        () => Array.from(devicesPGNs.value.values()).reduce((sum, device) => sum + device.updates, 0)
      );
      const uniquePgns = computed(() => {
        const pgnSet = /* @__PURE__ */ new Set();
        allPgns.value.forEach((pgn) => pgnSet.add(pgn.pgn));
        return Array.from(pgnSet).sort((a, b) => a - b);
      });
      const panelTitle = computed(() => {
        if (selectedDevice.value) {
          return `Device ${selectedDevice.value} PGNs`;
        }
        if (serverFilter.value) {
          return `Server ${serverFilter.value} PGNs`;
        }
        return "All PGNs";
      });
      function selectDevice(src) {
        selectedDevice.value = selectedDevice.value === src ? null : src;
      }
      function trackPgn(track2) {
        const key = typeof track2 === "string" ? track2 : `${track2.src}:${track2.pgn}`;
        if (trackingPGNs.value.has(key)) {
          trackingPGNs.value.delete(key);
        } else {
          trackingPGNs.value.add(key);
        }
        saveToLocalStorage("trackingPGNs");
      }
      function filterPgn(value, event) {
        if (event) {
          event.stopPropagation();
        }
        pgnFilter.value = pgnFilter.value != value ? value.toString() : "";
      }
      function blockPgn(pgn, event) {
        if (event) {
          event.stopPropagation();
        }
        if (typeof pgn === "string") {
          if (pgn.startsWith("0x") || pgn.startsWith("0X")) {
            pgn = parseInt(pgn, 16);
          } else {
            pgn = parseInt(pgn, 10);
          }
        }
        pgn = `0x${pgn.toString(16).padStart(7, "0").toUpperCase()}`;
        if (blockedPGNs.value.has(pgn)) {
          blockedPGNs.value.delete(pgn);
        } else {
          blockedPGNs.value.add(pgn);
        }
      }
      function toggleFreezePGNs() {
        freezePGNs.value = !freezePGNs.value;
      }
      function reconnect() {
        reconnectWebSocket();
      }
      function onConfigChange(newConfig) {
        if (newConfig.theme !== config2.value.theme) {
          applyTheme(newConfig.theme);
        }
      }
      function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
      }
      function loadFromLocalStorage(key, type) {
        try {
          const savedValue = localStorage.getItem(key);
          switch (type) {
            case "Set":
              const setArray = JSON.parse(savedValue);
              console.log("Loaded trackingPGNs from localStorage:", setArray);
              return new Set(setArray);
            case "Map":
              const mapArray = JSON.parse(savedValue);
              console.log("Loaded trackingPGNs from localStorage:", mapArray);
              return new Map(mapArray);
            default:
              return JSON.parse(savedValue);
          }
        } catch (error) {
          console.error("Error loading from localStorage:", "key", error);
          localStorage.removeItem(key);
        }
        switch (type) {
          case "Set":
            return /* @__PURE__ */ new Set();
          case "Map":
            return /* @__PURE__ */ new Map();
          default:
            return null;
        }
      }
      function saveToLocalStorage(KEY, type) {
        const trackingArray = Array.from(trackingPGNs.value);
        localStorage.setItem(KEY, JSON.stringify(trackingArray));
      }
      onMounted(() => {
        applyTheme(config2.value.theme);
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        mediaQuery.addEventListener("change", () => {
          if (config2.value.theme === "auto") {
            applyTheme("auto");
          }
        });
        if (config2.value.autoConnect) {
          connectWebSocket();
        }
      });
      return (_ctx, _cache) => {
        return openBlock(), createElementBlock("div", {
          id: "app",
          class: normalizeClass(themeClass.value)
        }, [
          createBaseVNode("div", _hoisted_1, [
            createVNode(_sfc_main$b, {
              "is-connected": unref(isConnected),
              isConnecting: unref(isConnecting),
              "connection-status": unref(connectionStatus),
              "total-devices": totalDevices.value,
              "total-pgns": totalPgns.value,
              onConnectWebSocket: unref(connectWebSocket),
              onDisconnectWebSocket: unref(disconnectWebSocket),
              onOpenSettings: _cache[0] || (_cache[0] = ($event) => isConfigModalVisible.value = true)
            }, null, 8, ["is-connected", "isConnecting", "connection-status", "total-devices", "total-pgns", "onConnectWebSocket", "onDisconnectWebSocket"]),
            unref(connectionError) ? (openBlock(), createElementBlock("div", _hoisted_2, [
              _cache[10] || (_cache[10] = createBaseVNode("i", { class: "fas fa-exclamation-triangle" }, null, -1)),
              createTextVNode(" Connection Error: " + toDisplayString(unref(connectionError).message) + " ", 1),
              createBaseVNode("button", {
                class: "btn btn-sm",
                onClick: reconnect
              }, [..._cache[9] || (_cache[9] = [
                createBaseVNode("i", { class: "fas fa-redo" }, null, -1),
                createTextVNode(" Reconnect ", -1)
              ])])
            ])) : createCommentVNode("", true),
            createVNode(_sfc_main$a, {
              totalDevices: totalDevices.value,
              totalPgns: totalPgns.value,
              totalUpdates: totalUpdates.value
            }, null, 8, ["totalDevices", "totalPgns", "totalUpdates"]),
            createVNode(_sfc_main$9, {
              autoUpdate: autoUpdate.value,
              freezePGNs: unref(freezePGNs),
              searchQuery: searchQuery.value,
              serverFilter: serverFilter.value,
              pgnFilter: pgnFilter.value,
              devicesList: devicesList.value,
              serversList: serversList.value,
              uniquePgns: uniquePgns.value,
              "onUpdate:autoUpdate": _cache[1] || (_cache[1] = ($event) => autoUpdate.value = $event),
              "onUpdate:searchQuery": _cache[2] || (_cache[2] = ($event) => searchQuery.value = $event),
              "onUpdate:pgnFilter": _cache[3] || (_cache[3] = ($event) => pgnFilter.value = $event),
              "onUpdate:serverFilter": _cache[4] || (_cache[4] = ($event) => serverFilter.value = $event),
              onToggleFreezePGNs: toggleFreezePGNs,
              onClearData: unref(clearAllData)
            }, null, 8, ["autoUpdate", "freezePGNs", "searchQuery", "serverFilter", "pgnFilter", "devicesList", "serversList", "uniquePgns", "onClearData"]),
            createVNode(_sfc_main$4, {
              autoUpdate: autoUpdate.value,
              devicesList: devicesList.value,
              filteredPGNs: filteredPGNs.value,
              selectedDevice: selectedDevice.value,
              serverFilter: serverFilter.value,
              pgnFilter: pgnFilter.value,
              blockedPGNs: blockedPGNs.value,
              panelTitle: panelTitle.value,
              trackingPGNs: trackingPGNs.value,
              onSelectDevice: selectDevice,
              onFilterPgn: filterPgn,
              onBlockPgn: blockPgn,
              onToggleFreezePGNs: toggleFreezePGNs,
              onTrackPgn: trackPgn
            }, null, 8, ["autoUpdate", "devicesList", "filteredPGNs", "selectedDevice", "serverFilter", "pgnFilter", "blockedPGNs", "panelTitle", "trackingPGNs"]),
            createTextVNode(" " + toDisplayString(unref(config2).autoTraceAfterRestart) + " ", 1),
            createVNode(GpsTracker, {
              autoUpdate: autoUpdate.value,
              "onUpdate:autoUpdate": _cache[5] || (_cache[5] = ($event) => autoUpdate.value = $event),
              ref: "tracker",
              trackingPGNs: trackingPGNs.value,
              onTrackPgn: trackPgn,
              pgn: unref(lastPgn),
              autoStart: unref(config2).autoTraceAfterRestart,
              width: 2e3,
              height: 1200,
              "line-color": "#3F51B5",
              "point-color": "#FF9800",
              onPointAdded: _cache[6] || (_cache[6] = () => {
              })
            }, null, 8, ["autoUpdate", "trackingPGNs", "pgn", "autoStart"]),
            createVNode(PGNFilter, {
              selectedDevice: selectedDevice.value,
              filteredPGNs: filteredPGNs.value,
              blockedPGNs: blockedPGNs.value
            }, null, 8, ["selectedDevice", "filteredPGNs", "blockedPGNs"]),
            createBaseVNode("button", {
              class: "config-button",
              onClick: _cache[7] || (_cache[7] = ($event) => isConfigModalVisible.value = true)
            }, [..._cache[11] || (_cache[11] = [
              createBaseVNode("i", { class: "fas fa-cog" }, null, -1)
            ])]),
            isConfigModalVisible.value ? (openBlock(), createBlock(ConfigModal, {
              key: 1,
              "is-visible": isConfigModalVisible.value,
              onClose: _cache[8] || (_cache[8] = ($event) => isConfigModalVisible.value = false),
              onConfigChange
            }, null, 8, ["is-visible"])) : createCommentVNode("", true)
          ])
        ], 2);
      };
    }
  };
  createApp(_sfc_main).mount("#app");
})();
//# sourceMappingURL=nmea-app.iife.js.map
