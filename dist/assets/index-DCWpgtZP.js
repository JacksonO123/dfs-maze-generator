var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity)
      fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy)
      fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
class Owner {
  constructor() {
    __publicField(this, "contexts");
    this.contexts = [];
  }
  currentContext() {
    return this.contexts[this.contexts.length - 1];
  }
  addContext(context) {
    this.contexts.push(context);
  }
  popContext() {
    return this.contexts.pop();
  }
  getContext() {
    return this.contexts;
  }
}
const owner = new Owner();
const currentContext = () => owner.currentContext();
const track = (state) => {
  const current = currentContext();
  if (!current)
    return;
  current.own(state);
};
class Context {
  constructor() {
    __publicField(this, "owned");
    __publicField(this, "disposeEvents");
    this.owned = /* @__PURE__ */ new Set();
    this.disposeEvents = [];
  }
  own(state) {
    this.owned.add(state);
  }
  ownMany(states) {
    states.forEach((state) => {
      this.owned.add(state);
    });
  }
  dispose() {
    this.runDisposeEvents();
    this.owned.clear();
  }
  runDisposeEvents() {
    this.disposeEvents.forEach((event) => event());
    this.disposeEvents = [];
  }
  onDispose(fn) {
    this.disposeEvents.push(fn);
    const index = this.disposeEvents.length - 1;
    return (newFn) => {
      if (this.disposeEvents.length > index) {
        this.disposeEvents[index] = newFn;
      }
    };
  }
  addEffect(fn) {
    this.owned.forEach((signal) => signal.addEffect(fn));
  }
  removeEffect(fn) {
    this.owned.forEach((signal) => signal.removeEffect(fn));
  }
  getOwned() {
    return [...this.owned];
  }
}
class State {
  constructor(state) {
    __publicField(this, "effects");
    __publicField(this, "value");
    this.value = state;
    this.effects = [];
  }
  _read() {
    return this.value;
  }
  read() {
    track(this);
    return this._read();
  }
  _write(newValue) {
    this.value = newValue;
  }
  write(newValue) {
    this._write(newValue);
    this.effects.forEach((effect) => effect());
  }
  dispose() {
    this.effects = [];
  }
  addEffect(fn) {
    this.effects.push(fn);
  }
  removeEffect(fn) {
    this.effects = this.effects.filter((effect) => effect !== fn);
  }
}
const trackScope = (fn, registerCleanup = true) => {
  const current = new Context();
  owner.addContext(current);
  fn();
  owner.popContext();
  const outerContext = currentContext();
  if (outerContext && registerCleanup) {
    onCleanup(() => cleanup(current));
  }
  return () => cleanup(current);
};
const cleanup = (context) => {
  context.dispose();
};
const onCleanup = (fn) => {
  const context = currentContext();
  if (!context)
    return;
  return context.onDispose(fn);
};
const createSignal = (value) => {
  const current = new State(value);
  return [
    () => current.read(),
    (value2) => current.write(typeof value2 === "function" ? value2(current._read()) : value2)
  ];
};
const createEffect = (fn) => {
  const cleanup2 = trackScope(() => {
    fn();
    const current = currentContext();
    if (!current)
      return;
    current.addEffect(fn);
    onCleanup(() => {
      current.removeEffect(fn);
    });
  });
  onCleanup(cleanup2);
};
const cleanupHandler = () => {
  let cleanup2 = null;
  let updateCleanup = void 0;
  return [
    () => cleanup2 == null ? void 0 : cleanup2(),
    (newCleanup) => {
      if (updateCleanup) {
        updateCleanup(newCleanup);
      } else {
        updateCleanup = onCleanup(newCleanup);
      }
      cleanup2 = newCleanup;
    }
  ];
};
let mountEvents = [];
const renderChild = (parent, target) => {
  const element = jsxElementToElement(target);
  if (Array.isArray(element)) {
    element.forEach((item) => parent.appendChild(item));
  } else {
    parent.appendChild(element);
  }
};
const mount = (comp, root = document.body) => {
  trackScope(() => {
    renderChild(root, comp);
    mountEvents.forEach((event) => event());
    mountEvents = [];
  });
};
const jsxElementToElement = (jsxEl) => {
  if (jsxEl instanceof Node)
    return jsxEl;
  if (Array.isArray(jsxEl)) {
    return jsxEl.map((el) => jsxElementToElement(el)).flat();
  }
  return new Text(jsxEl + "");
};
const insertAfter = (target, el) => {
  const element = jsxElementToElement(el);
  if (Array.isArray(element)) {
    target.after(...element);
  } else {
    target.after(element);
  }
};
const insertBefore = (target, el) => {
  const element = jsxElementToElement(el);
  if (Array.isArray(element)) {
    target.before(...element.reverse());
  } else {
    target.before(element);
  }
};
const replaceElements = (target, el, parent, after) => {
  if (Array.isArray(target)) {
    if (target.length === 0) {
      if (after)
        insertBefore(after, el);
      else
        renderChild(parent, el);
      return;
    }
    if (Array.isArray(el)) {
      while (target.length > el.length) {
        target[target.length - 1].remove();
        target.pop();
      }
      let i = 0;
      for (; i < target.length; i++) {
        target[i].replaceWith(el[i]);
      }
      while (i < el.length) {
        el[i - 1].after(el[i]);
        i++;
      }
    } else {
      while (target.length > 1) {
        target[target.length - 1].remove();
        target.pop();
      }
      target[0].replaceWith(el);
    }
  } else {
    if (Array.isArray(el)) {
      if (el.length === 0) {
        target.remove();
        return;
      }
      const first = el.shift();
      target.replaceWith(first);
      insertAfter(first, el);
    } else {
      target.replaceWith(el);
    }
  }
};
const eventHandler = (e) => {
  const key = `$$${e.type}`;
  let node = e.composedPath && e.composedPath()[0] || e.target;
  if (e.target !== node) {
    Object.defineProperty(e, "target", {
      configurable: true,
      value: node
    });
  }
  Object.defineProperty(e, "currentTarget", {
    configurable: true,
    get() {
      return node || document;
    }
  });
  while (node) {
    const handler = node[key];
    if (handler && !node.disabled) {
      const data = node[`${key}Data`];
      if (data !== void 0)
        handler(data, e);
      else {
        handler(e);
      }
    }
    node = node.parentNode;
  }
};
const $$EVENTS = "_$DX_DELEGATE";
const createComponent = (comp, props) => {
  let res;
  const cleanup2 = trackScope(() => {
    res = comp(props);
  });
  onCleanup(cleanup2);
  return res;
};
const template = (str, _, isSvg) => {
  const create = () => {
    const el2 = document.createElement("template");
    el2.innerHTML = str;
    return isSvg ? el2.content.firstChild.firstChild : el2.content.firstChild;
  };
  const el = create();
  return () => el == null ? void 0 : el.cloneNode(true);
};
const insert = (parent, accessor, marker = null, initial) => {
  if (initial) {
    console.log("HAS INITIAL", { parent, accessor, marker, initial });
  }
  if (typeof accessor === "function") {
    let prevEl = null;
    let context = null;
    let computed = false;
    const [prevCleanup, addCleanup] = cleanupHandler();
    createEffect(() => {
      if (!context) {
        context = currentContext() || null;
        if (!context)
          return;
      }
      prevCleanup();
      let innerOwned = [];
      const cleanup2 = trackScope(() => {
        let value = accessor();
        if (!computed) {
          const current = currentContext();
          if (current)
            innerOwned = current.getOwned();
        }
        if (value === false || value === null || value === void 0) {
          if (prevEl !== null) {
            const text = new Text();
            prevEl.replaceWith(text);
            prevEl = text;
            return;
          } else {
            value = "";
          }
        }
        const el = jsxElementToElement(value);
        if (prevEl === null) {
          if (marker !== null)
            insertBefore(marker, el);
          else
            renderChild(parent, el);
        } else
          replaceElements(prevEl, el, parent, marker);
        prevEl = el;
      }, false);
      if (!computed) {
        context.ownMany(innerOwned);
        computed = true;
      }
      addCleanup(cleanup2);
    });
  } else {
    if (marker)
      insertBefore(marker, accessor);
    else
      renderChild(parent, accessor);
  }
};
const onMount = (cb) => {
  mountEvents.push(cb);
};
const className = (el, classStr) => {
  const classes = classStr.split(" ");
  console.log(el.classList, classes);
  classes.forEach((item) => el.classList.add(item));
};
const delegateEvents = (events, doc = document) => {
  const e = doc[$$EVENTS] || (doc[$$EVENTS] = /* @__PURE__ */ new Set());
  for (let i = 0; i < events.length; i++) {
    const name = events[i];
    if (!e.has(name)) {
      e.add(name);
      doc.addEventListener(name, eventHandler);
    }
  }
};
const createEffectJsx = (fn) => {
  const cb = () => fn({});
  createEffect(cb);
};
let EPSILON = 1e-6;
let VecType$2 = Float32Array;
function setDefaultType$6(ctor) {
  const oldType = VecType$2;
  VecType$2 = ctor;
  return oldType;
}
function create$5(x = 0, y = 0) {
  const dst = new VecType$2(2);
  if (x !== void 0) {
    dst[0] = x;
    if (y !== void 0) {
      dst[1] = y;
    }
  }
  return dst;
}
let VecType$1 = Float32Array;
function setDefaultType$5(ctor) {
  const oldType = VecType$1;
  VecType$1 = ctor;
  return oldType;
}
function create$4(x, y, z) {
  const dst = new VecType$1(3);
  if (x !== void 0) {
    dst[0] = x;
    if (y !== void 0) {
      dst[1] = y;
      if (z !== void 0) {
        dst[2] = z;
      }
    }
  }
  return dst;
}
const fromValues$3 = create$5;
function set$5(x, y, dst) {
  dst = dst || new VecType$2(2);
  dst[0] = x;
  dst[1] = y;
  return dst;
}
function ceil$2(v, dst) {
  dst = dst || new VecType$2(2);
  dst[0] = Math.ceil(v[0]);
  dst[1] = Math.ceil(v[1]);
  return dst;
}
function floor$2(v, dst) {
  dst = dst || new VecType$2(2);
  dst[0] = Math.floor(v[0]);
  dst[1] = Math.floor(v[1]);
  return dst;
}
function round$2(v, dst) {
  dst = dst || new VecType$2(2);
  dst[0] = Math.round(v[0]);
  dst[1] = Math.round(v[1]);
  return dst;
}
function clamp$2(v, min = 0, max = 1, dst) {
  dst = dst || new VecType$2(2);
  dst[0] = Math.min(max, Math.max(min, v[0]));
  dst[1] = Math.min(max, Math.max(min, v[1]));
  return dst;
}
function add$3(a, b, dst) {
  dst = dst || new VecType$2(2);
  dst[0] = a[0] + b[0];
  dst[1] = a[1] + b[1];
  return dst;
}
function addScaled$2(a, b, scale, dst) {
  dst = dst || new VecType$2(2);
  dst[0] = a[0] + b[0] * scale;
  dst[1] = a[1] + b[1] * scale;
  return dst;
}
function angle$2(a, b) {
  const ax = a[0];
  const ay = a[1];
  const bx = a[0];
  const by = a[1];
  const mag1 = Math.sqrt(ax * ax + ay * ay);
  const mag2 = Math.sqrt(bx * bx + by * by);
  const mag = mag1 * mag2;
  const cosine = mag && dot$3(a, b) / mag;
  return Math.acos(cosine);
}
function subtract$3(a, b, dst) {
  dst = dst || new VecType$2(2);
  dst[0] = a[0] - b[0];
  dst[1] = a[1] - b[1];
  return dst;
}
const sub$3 = subtract$3;
function equalsApproximately$5(a, b) {
  return Math.abs(a[0] - b[0]) < EPSILON && Math.abs(a[1] - b[1]) < EPSILON;
}
function equals$5(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}
function lerp$3(a, b, t, dst) {
  dst = dst || new VecType$2(2);
  dst[0] = a[0] + t * (b[0] - a[0]);
  dst[1] = a[1] + t * (b[1] - a[1]);
  return dst;
}
function lerpV$2(a, b, t, dst) {
  dst = dst || new VecType$2(2);
  dst[0] = a[0] + t[0] * (b[0] - a[0]);
  dst[1] = a[1] + t[1] * (b[1] - a[1]);
  return dst;
}
function max$2(a, b, dst) {
  dst = dst || new VecType$2(2);
  dst[0] = Math.max(a[0], b[0]);
  dst[1] = Math.max(a[1], b[1]);
  return dst;
}
function min$2(a, b, dst) {
  dst = dst || new VecType$2(2);
  dst[0] = Math.min(a[0], b[0]);
  dst[1] = Math.min(a[1], b[1]);
  return dst;
}
function mulScalar$3(v, k, dst) {
  dst = dst || new VecType$2(2);
  dst[0] = v[0] * k;
  dst[1] = v[1] * k;
  return dst;
}
const scale$5 = mulScalar$3;
function divScalar$3(v, k, dst) {
  dst = dst || new VecType$2(2);
  dst[0] = v[0] / k;
  dst[1] = v[1] / k;
  return dst;
}
function inverse$5(v, dst) {
  dst = dst || new VecType$2(2);
  dst[0] = 1 / v[0];
  dst[1] = 1 / v[1];
  return dst;
}
const invert$4 = inverse$5;
function cross$1(a, b, dst) {
  dst = dst || new VecType$1(3);
  const z = a[0] * b[1] - a[1] * b[0];
  dst[0] = 0;
  dst[1] = 0;
  dst[2] = z;
  return dst;
}
function dot$3(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}
function length$3(v) {
  const v0 = v[0];
  const v1 = v[1];
  return Math.sqrt(v0 * v0 + v1 * v1);
}
const len$3 = length$3;
function lengthSq$3(v) {
  const v0 = v[0];
  const v1 = v[1];
  return v0 * v0 + v1 * v1;
}
const lenSq$3 = lengthSq$3;
function distance$2(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}
const dist$2 = distance$2;
function distanceSq$2(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
}
const distSq$2 = distanceSq$2;
function normalize$3(v, dst) {
  dst = dst || new VecType$2(2);
  const v0 = v[0];
  const v1 = v[1];
  const len = Math.sqrt(v0 * v0 + v1 * v1);
  if (len > 1e-5) {
    dst[0] = v0 / len;
    dst[1] = v1 / len;
  } else {
    dst[0] = 0;
    dst[1] = 0;
  }
  return dst;
}
function negate$4(v, dst) {
  dst = dst || new VecType$2(2);
  dst[0] = -v[0];
  dst[1] = -v[1];
  return dst;
}
function copy$5(v, dst) {
  dst = dst || new VecType$2(2);
  dst[0] = v[0];
  dst[1] = v[1];
  return dst;
}
const clone$5 = copy$5;
function multiply$5(a, b, dst) {
  dst = dst || new VecType$2(2);
  dst[0] = a[0] * b[0];
  dst[1] = a[1] * b[1];
  return dst;
}
const mul$5 = multiply$5;
function divide$2(a, b, dst) {
  dst = dst || new VecType$2(2);
  dst[0] = a[0] / b[0];
  dst[1] = a[1] / b[1];
  return dst;
}
const div$2 = divide$2;
function random$1(scale = 1, dst) {
  dst = dst || new VecType$2(2);
  const angle = Math.random() * 2 * Math.PI;
  dst[0] = Math.cos(angle) * scale;
  dst[1] = Math.sin(angle) * scale;
  return dst;
}
function zero$2(dst) {
  dst = dst || new VecType$2(2);
  dst[0] = 0;
  dst[1] = 0;
  return dst;
}
function transformMat4$2(v, m, dst) {
  dst = dst || new VecType$2(2);
  const x = v[0];
  const y = v[1];
  dst[0] = x * m[0] + y * m[4] + m[12];
  dst[1] = x * m[1] + y * m[5] + m[13];
  return dst;
}
function transformMat3$1(v, m, dst) {
  dst = dst || new VecType$2(2);
  const x = v[0];
  const y = v[1];
  dst[0] = m[0] * x + m[4] * y + m[8];
  dst[1] = m[1] * x + m[5] * y + m[9];
  return dst;
}
var vec2Impl = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  create: create$5,
  setDefaultType: setDefaultType$6,
  fromValues: fromValues$3,
  set: set$5,
  ceil: ceil$2,
  floor: floor$2,
  round: round$2,
  clamp: clamp$2,
  add: add$3,
  addScaled: addScaled$2,
  angle: angle$2,
  subtract: subtract$3,
  sub: sub$3,
  equalsApproximately: equalsApproximately$5,
  equals: equals$5,
  lerp: lerp$3,
  lerpV: lerpV$2,
  max: max$2,
  min: min$2,
  mulScalar: mulScalar$3,
  scale: scale$5,
  divScalar: divScalar$3,
  inverse: inverse$5,
  invert: invert$4,
  cross: cross$1,
  dot: dot$3,
  length: length$3,
  len: len$3,
  lengthSq: lengthSq$3,
  lenSq: lenSq$3,
  distance: distance$2,
  dist: dist$2,
  distanceSq: distanceSq$2,
  distSq: distSq$2,
  normalize: normalize$3,
  negate: negate$4,
  copy: copy$5,
  clone: clone$5,
  multiply: multiply$5,
  mul: mul$5,
  divide: divide$2,
  div: div$2,
  random: random$1,
  zero: zero$2,
  transformMat4: transformMat4$2,
  transformMat3: transformMat3$1
});
const ctorMap = /* @__PURE__ */ new Map([
  [Float32Array, () => new Float32Array(12)],
  [Float64Array, () => new Float64Array(12)],
  [Array, () => new Array(12).fill(0)]
]);
ctorMap.get(Float32Array);
const fromValues$2 = create$4;
function set$3(x, y, z, dst) {
  dst = dst || new VecType$1(3);
  dst[0] = x;
  dst[1] = y;
  dst[2] = z;
  return dst;
}
function ceil$1(v, dst) {
  dst = dst || new VecType$1(3);
  dst[0] = Math.ceil(v[0]);
  dst[1] = Math.ceil(v[1]);
  dst[2] = Math.ceil(v[2]);
  return dst;
}
function floor$1(v, dst) {
  dst = dst || new VecType$1(3);
  dst[0] = Math.floor(v[0]);
  dst[1] = Math.floor(v[1]);
  dst[2] = Math.floor(v[2]);
  return dst;
}
function round$1(v, dst) {
  dst = dst || new VecType$1(3);
  dst[0] = Math.round(v[0]);
  dst[1] = Math.round(v[1]);
  dst[2] = Math.round(v[2]);
  return dst;
}
function clamp$1(v, min = 0, max = 1, dst) {
  dst = dst || new VecType$1(3);
  dst[0] = Math.min(max, Math.max(min, v[0]));
  dst[1] = Math.min(max, Math.max(min, v[1]));
  dst[2] = Math.min(max, Math.max(min, v[2]));
  return dst;
}
function add$2(a, b, dst) {
  dst = dst || new VecType$1(3);
  dst[0] = a[0] + b[0];
  dst[1] = a[1] + b[1];
  dst[2] = a[2] + b[2];
  return dst;
}
function addScaled$1(a, b, scale, dst) {
  dst = dst || new VecType$1(3);
  dst[0] = a[0] + b[0] * scale;
  dst[1] = a[1] + b[1] * scale;
  dst[2] = a[2] + b[2] * scale;
  return dst;
}
function angle$1(a, b) {
  const ax = a[0];
  const ay = a[1];
  const az = a[2];
  const bx = a[0];
  const by = a[1];
  const bz = a[2];
  const mag1 = Math.sqrt(ax * ax + ay * ay + az * az);
  const mag2 = Math.sqrt(bx * bx + by * by + bz * bz);
  const mag = mag1 * mag2;
  const cosine = mag && dot$2(a, b) / mag;
  return Math.acos(cosine);
}
function subtract$2(a, b, dst) {
  dst = dst || new VecType$1(3);
  dst[0] = a[0] - b[0];
  dst[1] = a[1] - b[1];
  dst[2] = a[2] - b[2];
  return dst;
}
const sub$2 = subtract$2;
function equalsApproximately$3(a, b) {
  return Math.abs(a[0] - b[0]) < EPSILON && Math.abs(a[1] - b[1]) < EPSILON && Math.abs(a[2] - b[2]) < EPSILON;
}
function equals$3(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}
function lerp$2(a, b, t, dst) {
  dst = dst || new VecType$1(3);
  dst[0] = a[0] + t * (b[0] - a[0]);
  dst[1] = a[1] + t * (b[1] - a[1]);
  dst[2] = a[2] + t * (b[2] - a[2]);
  return dst;
}
function lerpV$1(a, b, t, dst) {
  dst = dst || new VecType$1(3);
  dst[0] = a[0] + t[0] * (b[0] - a[0]);
  dst[1] = a[1] + t[1] * (b[1] - a[1]);
  dst[2] = a[2] + t[2] * (b[2] - a[2]);
  return dst;
}
function max$1(a, b, dst) {
  dst = dst || new VecType$1(3);
  dst[0] = Math.max(a[0], b[0]);
  dst[1] = Math.max(a[1], b[1]);
  dst[2] = Math.max(a[2], b[2]);
  return dst;
}
function min$1(a, b, dst) {
  dst = dst || new VecType$1(3);
  dst[0] = Math.min(a[0], b[0]);
  dst[1] = Math.min(a[1], b[1]);
  dst[2] = Math.min(a[2], b[2]);
  return dst;
}
function mulScalar$2(v, k, dst) {
  dst = dst || new VecType$1(3);
  dst[0] = v[0] * k;
  dst[1] = v[1] * k;
  dst[2] = v[2] * k;
  return dst;
}
const scale$3 = mulScalar$2;
function divScalar$2(v, k, dst) {
  dst = dst || new VecType$1(3);
  dst[0] = v[0] / k;
  dst[1] = v[1] / k;
  dst[2] = v[2] / k;
  return dst;
}
function inverse$3(v, dst) {
  dst = dst || new VecType$1(3);
  dst[0] = 1 / v[0];
  dst[1] = 1 / v[1];
  dst[2] = 1 / v[2];
  return dst;
}
const invert$2 = inverse$3;
function cross(a, b, dst) {
  dst = dst || new VecType$1(3);
  const t1 = a[2] * b[0] - a[0] * b[2];
  const t2 = a[0] * b[1] - a[1] * b[0];
  dst[0] = a[1] * b[2] - a[2] * b[1];
  dst[1] = t1;
  dst[2] = t2;
  return dst;
}
function dot$2(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function length$2(v) {
  const v0 = v[0];
  const v1 = v[1];
  const v2 = v[2];
  return Math.sqrt(v0 * v0 + v1 * v1 + v2 * v2);
}
const len$2 = length$2;
function lengthSq$2(v) {
  const v0 = v[0];
  const v1 = v[1];
  const v2 = v[2];
  return v0 * v0 + v1 * v1 + v2 * v2;
}
const lenSq$2 = lengthSq$2;
function distance$1(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
const dist$1 = distance$1;
function distanceSq$1(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return dx * dx + dy * dy + dz * dz;
}
const distSq$1 = distanceSq$1;
function normalize$2(v, dst) {
  dst = dst || new VecType$1(3);
  const v0 = v[0];
  const v1 = v[1];
  const v2 = v[2];
  const len = Math.sqrt(v0 * v0 + v1 * v1 + v2 * v2);
  if (len > 1e-5) {
    dst[0] = v0 / len;
    dst[1] = v1 / len;
    dst[2] = v2 / len;
  } else {
    dst[0] = 0;
    dst[1] = 0;
    dst[2] = 0;
  }
  return dst;
}
function negate$2(v, dst) {
  dst = dst || new VecType$1(3);
  dst[0] = -v[0];
  dst[1] = -v[1];
  dst[2] = -v[2];
  return dst;
}
function copy$3(v, dst) {
  dst = dst || new VecType$1(3);
  dst[0] = v[0];
  dst[1] = v[1];
  dst[2] = v[2];
  return dst;
}
const clone$3 = copy$3;
function multiply$3(a, b, dst) {
  dst = dst || new VecType$1(3);
  dst[0] = a[0] * b[0];
  dst[1] = a[1] * b[1];
  dst[2] = a[2] * b[2];
  return dst;
}
const mul$3 = multiply$3;
function divide$1(a, b, dst) {
  dst = dst || new VecType$1(3);
  dst[0] = a[0] / b[0];
  dst[1] = a[1] / b[1];
  dst[2] = a[2] / b[2];
  return dst;
}
const div$1 = divide$1;
function random(scale = 1, dst) {
  dst = dst || new VecType$1(3);
  const angle = Math.random() * 2 * Math.PI;
  const z = Math.random() * 2 - 1;
  const zScale = Math.sqrt(1 - z * z) * scale;
  dst[0] = Math.cos(angle) * zScale;
  dst[1] = Math.sin(angle) * zScale;
  dst[2] = z * scale;
  return dst;
}
function zero$1(dst) {
  dst = dst || new VecType$1(3);
  dst[0] = 0;
  dst[1] = 0;
  dst[2] = 0;
  return dst;
}
function transformMat4$1(v, m, dst) {
  dst = dst || new VecType$1(3);
  const x = v[0];
  const y = v[1];
  const z = v[2];
  const w = m[3] * x + m[7] * y + m[11] * z + m[15] || 1;
  dst[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
  dst[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
  dst[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
  return dst;
}
function transformMat4Upper3x3(v, m, dst) {
  dst = dst || new VecType$1(3);
  const v0 = v[0];
  const v1 = v[1];
  const v2 = v[2];
  dst[0] = v0 * m[0 * 4 + 0] + v1 * m[1 * 4 + 0] + v2 * m[2 * 4 + 0];
  dst[1] = v0 * m[0 * 4 + 1] + v1 * m[1 * 4 + 1] + v2 * m[2 * 4 + 1];
  dst[2] = v0 * m[0 * 4 + 2] + v1 * m[1 * 4 + 2] + v2 * m[2 * 4 + 2];
  return dst;
}
function transformMat3(v, m, dst) {
  dst = dst || new VecType$1(3);
  const x = v[0];
  const y = v[1];
  const z = v[2];
  dst[0] = x * m[0] + y * m[4] + z * m[8];
  dst[1] = x * m[1] + y * m[5] + z * m[9];
  dst[2] = x * m[2] + y * m[6] + z * m[10];
  return dst;
}
function transformQuat(v, q, dst) {
  dst = dst || new VecType$1(3);
  const qx = q[0];
  const qy = q[1];
  const qz = q[2];
  const w2 = q[3] * 2;
  const x = v[0];
  const y = v[1];
  const z = v[2];
  const uvX = qy * z - qz * y;
  const uvY = qz * x - qx * z;
  const uvZ = qx * y - qy * x;
  dst[0] = x + uvX * w2 + (qy * uvZ - qz * uvY) * 2;
  dst[1] = y + uvY * w2 + (qz * uvX - qx * uvZ) * 2;
  dst[2] = z + uvZ * w2 + (qx * uvY - qy * uvX) * 2;
  return dst;
}
function getTranslation$1(m, dst) {
  dst = dst || new VecType$1(3);
  dst[0] = m[12];
  dst[1] = m[13];
  dst[2] = m[14];
  return dst;
}
function getAxis$1(m, axis, dst) {
  dst = dst || new VecType$1(3);
  const off = axis * 4;
  dst[0] = m[off + 0];
  dst[1] = m[off + 1];
  dst[2] = m[off + 2];
  return dst;
}
function getScaling$1(m, dst) {
  dst = dst || new VecType$1(3);
  const xx = m[0];
  const xy = m[1];
  const xz = m[2];
  const yx = m[4];
  const yy = m[5];
  const yz = m[6];
  const zx = m[8];
  const zy = m[9];
  const zz = m[10];
  dst[0] = Math.sqrt(xx * xx + xy * xy + xz * xz);
  dst[1] = Math.sqrt(yx * yx + yy * yy + yz * yz);
  dst[2] = Math.sqrt(zx * zx + zy * zy + zz * zz);
  return dst;
}
var vec3Impl = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  create: create$4,
  setDefaultType: setDefaultType$5,
  fromValues: fromValues$2,
  set: set$3,
  ceil: ceil$1,
  floor: floor$1,
  round: round$1,
  clamp: clamp$1,
  add: add$2,
  addScaled: addScaled$1,
  angle: angle$1,
  subtract: subtract$2,
  sub: sub$2,
  equalsApproximately: equalsApproximately$3,
  equals: equals$3,
  lerp: lerp$2,
  lerpV: lerpV$1,
  max: max$1,
  min: min$1,
  mulScalar: mulScalar$2,
  scale: scale$3,
  divScalar: divScalar$2,
  inverse: inverse$3,
  invert: invert$2,
  cross,
  dot: dot$2,
  length: length$2,
  len: len$2,
  lengthSq: lengthSq$2,
  lenSq: lenSq$2,
  distance: distance$1,
  dist: dist$1,
  distanceSq: distanceSq$1,
  distSq: distSq$1,
  normalize: normalize$2,
  negate: negate$2,
  copy: copy$3,
  clone: clone$3,
  multiply: multiply$3,
  mul: mul$3,
  divide: divide$1,
  div: div$1,
  random,
  zero: zero$1,
  transformMat4: transformMat4$1,
  transformMat4Upper3x3,
  transformMat3,
  transformQuat,
  getTranslation: getTranslation$1,
  getAxis: getAxis$1,
  getScaling: getScaling$1
});
let MatType = Float32Array;
function setDefaultType$3(ctor) {
  const oldType = MatType;
  MatType = ctor;
  return oldType;
}
function create$2(v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15) {
  const dst = new MatType(16);
  if (v0 !== void 0) {
    dst[0] = v0;
    if (v1 !== void 0) {
      dst[1] = v1;
      if (v2 !== void 0) {
        dst[2] = v2;
        if (v3 !== void 0) {
          dst[3] = v3;
          if (v4 !== void 0) {
            dst[4] = v4;
            if (v5 !== void 0) {
              dst[5] = v5;
              if (v6 !== void 0) {
                dst[6] = v6;
                if (v7 !== void 0) {
                  dst[7] = v7;
                  if (v8 !== void 0) {
                    dst[8] = v8;
                    if (v9 !== void 0) {
                      dst[9] = v9;
                      if (v10 !== void 0) {
                        dst[10] = v10;
                        if (v11 !== void 0) {
                          dst[11] = v11;
                          if (v12 !== void 0) {
                            dst[12] = v12;
                            if (v13 !== void 0) {
                              dst[13] = v13;
                              if (v14 !== void 0) {
                                dst[14] = v14;
                                if (v15 !== void 0) {
                                  dst[15] = v15;
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return dst;
}
function set$2(v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15, dst) {
  dst = dst || new MatType(16);
  dst[0] = v0;
  dst[1] = v1;
  dst[2] = v2;
  dst[3] = v3;
  dst[4] = v4;
  dst[5] = v5;
  dst[6] = v6;
  dst[7] = v7;
  dst[8] = v8;
  dst[9] = v9;
  dst[10] = v10;
  dst[11] = v11;
  dst[12] = v12;
  dst[13] = v13;
  dst[14] = v14;
  dst[15] = v15;
  return dst;
}
function fromMat3(m3, dst) {
  dst = dst || new MatType(16);
  dst[0] = m3[0];
  dst[1] = m3[1];
  dst[2] = m3[2];
  dst[3] = 0;
  dst[4] = m3[4];
  dst[5] = m3[5];
  dst[6] = m3[6];
  dst[7] = 0;
  dst[8] = m3[8];
  dst[9] = m3[9];
  dst[10] = m3[10];
  dst[11] = 0;
  dst[12] = 0;
  dst[13] = 0;
  dst[14] = 0;
  dst[15] = 1;
  return dst;
}
function fromQuat(q, dst) {
  dst = dst || new MatType(16);
  const x = q[0];
  const y = q[1];
  const z = q[2];
  const w = q[3];
  const x2 = x + x;
  const y2 = y + y;
  const z2 = z + z;
  const xx = x * x2;
  const yx = y * x2;
  const yy = y * y2;
  const zx = z * x2;
  const zy = z * y2;
  const zz = z * z2;
  const wx = w * x2;
  const wy = w * y2;
  const wz = w * z2;
  dst[0] = 1 - yy - zz;
  dst[1] = yx + wz;
  dst[2] = zx - wy;
  dst[3] = 0;
  dst[4] = yx - wz;
  dst[5] = 1 - xx - zz;
  dst[6] = zy + wx;
  dst[7] = 0;
  dst[8] = zx + wy;
  dst[9] = zy - wx;
  dst[10] = 1 - xx - yy;
  dst[11] = 0;
  dst[12] = 0;
  dst[13] = 0;
  dst[14] = 0;
  dst[15] = 1;
  return dst;
}
function negate$1(m, dst) {
  dst = dst || new MatType(16);
  dst[0] = -m[0];
  dst[1] = -m[1];
  dst[2] = -m[2];
  dst[3] = -m[3];
  dst[4] = -m[4];
  dst[5] = -m[5];
  dst[6] = -m[6];
  dst[7] = -m[7];
  dst[8] = -m[8];
  dst[9] = -m[9];
  dst[10] = -m[10];
  dst[11] = -m[11];
  dst[12] = -m[12];
  dst[13] = -m[13];
  dst[14] = -m[14];
  dst[15] = -m[15];
  return dst;
}
function copy$2(m, dst) {
  dst = dst || new MatType(16);
  dst[0] = m[0];
  dst[1] = m[1];
  dst[2] = m[2];
  dst[3] = m[3];
  dst[4] = m[4];
  dst[5] = m[5];
  dst[6] = m[6];
  dst[7] = m[7];
  dst[8] = m[8];
  dst[9] = m[9];
  dst[10] = m[10];
  dst[11] = m[11];
  dst[12] = m[12];
  dst[13] = m[13];
  dst[14] = m[14];
  dst[15] = m[15];
  return dst;
}
const clone$2 = copy$2;
function equalsApproximately$2(a, b) {
  return Math.abs(a[0] - b[0]) < EPSILON && Math.abs(a[1] - b[1]) < EPSILON && Math.abs(a[2] - b[2]) < EPSILON && Math.abs(a[3] - b[3]) < EPSILON && Math.abs(a[4] - b[4]) < EPSILON && Math.abs(a[5] - b[5]) < EPSILON && Math.abs(a[6] - b[6]) < EPSILON && Math.abs(a[7] - b[7]) < EPSILON && Math.abs(a[8] - b[8]) < EPSILON && Math.abs(a[9] - b[9]) < EPSILON && Math.abs(a[10] - b[10]) < EPSILON && Math.abs(a[11] - b[11]) < EPSILON && Math.abs(a[12] - b[12]) < EPSILON && Math.abs(a[13] - b[13]) < EPSILON && Math.abs(a[14] - b[14]) < EPSILON && Math.abs(a[15] - b[15]) < EPSILON;
}
function equals$2(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] && a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
}
function identity$1(dst) {
  dst = dst || new MatType(16);
  dst[0] = 1;
  dst[1] = 0;
  dst[2] = 0;
  dst[3] = 0;
  dst[4] = 0;
  dst[5] = 1;
  dst[6] = 0;
  dst[7] = 0;
  dst[8] = 0;
  dst[9] = 0;
  dst[10] = 1;
  dst[11] = 0;
  dst[12] = 0;
  dst[13] = 0;
  dst[14] = 0;
  dst[15] = 1;
  return dst;
}
function transpose(m, dst) {
  dst = dst || new MatType(16);
  if (dst === m) {
    let t;
    t = m[1];
    m[1] = m[4];
    m[4] = t;
    t = m[2];
    m[2] = m[8];
    m[8] = t;
    t = m[3];
    m[3] = m[12];
    m[12] = t;
    t = m[6];
    m[6] = m[9];
    m[9] = t;
    t = m[7];
    m[7] = m[13];
    m[13] = t;
    t = m[11];
    m[11] = m[14];
    m[14] = t;
    return dst;
  }
  const m00 = m[0 * 4 + 0];
  const m01 = m[0 * 4 + 1];
  const m02 = m[0 * 4 + 2];
  const m03 = m[0 * 4 + 3];
  const m10 = m[1 * 4 + 0];
  const m11 = m[1 * 4 + 1];
  const m12 = m[1 * 4 + 2];
  const m13 = m[1 * 4 + 3];
  const m20 = m[2 * 4 + 0];
  const m21 = m[2 * 4 + 1];
  const m22 = m[2 * 4 + 2];
  const m23 = m[2 * 4 + 3];
  const m30 = m[3 * 4 + 0];
  const m31 = m[3 * 4 + 1];
  const m32 = m[3 * 4 + 2];
  const m33 = m[3 * 4 + 3];
  dst[0] = m00;
  dst[1] = m10;
  dst[2] = m20;
  dst[3] = m30;
  dst[4] = m01;
  dst[5] = m11;
  dst[6] = m21;
  dst[7] = m31;
  dst[8] = m02;
  dst[9] = m12;
  dst[10] = m22;
  dst[11] = m32;
  dst[12] = m03;
  dst[13] = m13;
  dst[14] = m23;
  dst[15] = m33;
  return dst;
}
function inverse$2(m, dst) {
  dst = dst || new MatType(16);
  const m00 = m[0 * 4 + 0];
  const m01 = m[0 * 4 + 1];
  const m02 = m[0 * 4 + 2];
  const m03 = m[0 * 4 + 3];
  const m10 = m[1 * 4 + 0];
  const m11 = m[1 * 4 + 1];
  const m12 = m[1 * 4 + 2];
  const m13 = m[1 * 4 + 3];
  const m20 = m[2 * 4 + 0];
  const m21 = m[2 * 4 + 1];
  const m22 = m[2 * 4 + 2];
  const m23 = m[2 * 4 + 3];
  const m30 = m[3 * 4 + 0];
  const m31 = m[3 * 4 + 1];
  const m32 = m[3 * 4 + 2];
  const m33 = m[3 * 4 + 3];
  const tmp0 = m22 * m33;
  const tmp1 = m32 * m23;
  const tmp2 = m12 * m33;
  const tmp3 = m32 * m13;
  const tmp4 = m12 * m23;
  const tmp5 = m22 * m13;
  const tmp6 = m02 * m33;
  const tmp7 = m32 * m03;
  const tmp8 = m02 * m23;
  const tmp9 = m22 * m03;
  const tmp10 = m02 * m13;
  const tmp11 = m12 * m03;
  const tmp12 = m20 * m31;
  const tmp13 = m30 * m21;
  const tmp14 = m10 * m31;
  const tmp15 = m30 * m11;
  const tmp16 = m10 * m21;
  const tmp17 = m20 * m11;
  const tmp18 = m00 * m31;
  const tmp19 = m30 * m01;
  const tmp20 = m00 * m21;
  const tmp21 = m20 * m01;
  const tmp22 = m00 * m11;
  const tmp23 = m10 * m01;
  const t0 = tmp0 * m11 + tmp3 * m21 + tmp4 * m31 - (tmp1 * m11 + tmp2 * m21 + tmp5 * m31);
  const t1 = tmp1 * m01 + tmp6 * m21 + tmp9 * m31 - (tmp0 * m01 + tmp7 * m21 + tmp8 * m31);
  const t2 = tmp2 * m01 + tmp7 * m11 + tmp10 * m31 - (tmp3 * m01 + tmp6 * m11 + tmp11 * m31);
  const t3 = tmp5 * m01 + tmp8 * m11 + tmp11 * m21 - (tmp4 * m01 + tmp9 * m11 + tmp10 * m21);
  const d = 1 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);
  dst[0] = d * t0;
  dst[1] = d * t1;
  dst[2] = d * t2;
  dst[3] = d * t3;
  dst[4] = d * (tmp1 * m10 + tmp2 * m20 + tmp5 * m30 - (tmp0 * m10 + tmp3 * m20 + tmp4 * m30));
  dst[5] = d * (tmp0 * m00 + tmp7 * m20 + tmp8 * m30 - (tmp1 * m00 + tmp6 * m20 + tmp9 * m30));
  dst[6] = d * (tmp3 * m00 + tmp6 * m10 + tmp11 * m30 - (tmp2 * m00 + tmp7 * m10 + tmp10 * m30));
  dst[7] = d * (tmp4 * m00 + tmp9 * m10 + tmp10 * m20 - (tmp5 * m00 + tmp8 * m10 + tmp11 * m20));
  dst[8] = d * (tmp12 * m13 + tmp15 * m23 + tmp16 * m33 - (tmp13 * m13 + tmp14 * m23 + tmp17 * m33));
  dst[9] = d * (tmp13 * m03 + tmp18 * m23 + tmp21 * m33 - (tmp12 * m03 + tmp19 * m23 + tmp20 * m33));
  dst[10] = d * (tmp14 * m03 + tmp19 * m13 + tmp22 * m33 - (tmp15 * m03 + tmp18 * m13 + tmp23 * m33));
  dst[11] = d * (tmp17 * m03 + tmp20 * m13 + tmp23 * m23 - (tmp16 * m03 + tmp21 * m13 + tmp22 * m23));
  dst[12] = d * (tmp14 * m22 + tmp17 * m32 + tmp13 * m12 - (tmp16 * m32 + tmp12 * m12 + tmp15 * m22));
  dst[13] = d * (tmp20 * m32 + tmp12 * m02 + tmp19 * m22 - (tmp18 * m22 + tmp21 * m32 + tmp13 * m02));
  dst[14] = d * (tmp18 * m12 + tmp23 * m32 + tmp15 * m02 - (tmp22 * m32 + tmp14 * m02 + tmp19 * m12));
  dst[15] = d * (tmp22 * m22 + tmp16 * m02 + tmp21 * m12 - (tmp20 * m12 + tmp23 * m22 + tmp17 * m02));
  return dst;
}
function determinant(m) {
  const m00 = m[0 * 4 + 0];
  const m01 = m[0 * 4 + 1];
  const m02 = m[0 * 4 + 2];
  const m03 = m[0 * 4 + 3];
  const m10 = m[1 * 4 + 0];
  const m11 = m[1 * 4 + 1];
  const m12 = m[1 * 4 + 2];
  const m13 = m[1 * 4 + 3];
  const m20 = m[2 * 4 + 0];
  const m21 = m[2 * 4 + 1];
  const m22 = m[2 * 4 + 2];
  const m23 = m[2 * 4 + 3];
  const m30 = m[3 * 4 + 0];
  const m31 = m[3 * 4 + 1];
  const m32 = m[3 * 4 + 2];
  const m33 = m[3 * 4 + 3];
  const tmp0 = m22 * m33;
  const tmp1 = m32 * m23;
  const tmp2 = m12 * m33;
  const tmp3 = m32 * m13;
  const tmp4 = m12 * m23;
  const tmp5 = m22 * m13;
  const tmp6 = m02 * m33;
  const tmp7 = m32 * m03;
  const tmp8 = m02 * m23;
  const tmp9 = m22 * m03;
  const tmp10 = m02 * m13;
  const tmp11 = m12 * m03;
  const t0 = tmp0 * m11 + tmp3 * m21 + tmp4 * m31 - (tmp1 * m11 + tmp2 * m21 + tmp5 * m31);
  const t1 = tmp1 * m01 + tmp6 * m21 + tmp9 * m31 - (tmp0 * m01 + tmp7 * m21 + tmp8 * m31);
  const t2 = tmp2 * m01 + tmp7 * m11 + tmp10 * m31 - (tmp3 * m01 + tmp6 * m11 + tmp11 * m31);
  const t3 = tmp5 * m01 + tmp8 * m11 + tmp11 * m21 - (tmp4 * m01 + tmp9 * m11 + tmp10 * m21);
  return m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3;
}
const invert$1 = inverse$2;
function multiply$2(a, b, dst) {
  dst = dst || new MatType(16);
  const a00 = a[0];
  const a01 = a[1];
  const a02 = a[2];
  const a03 = a[3];
  const a10 = a[4 + 0];
  const a11 = a[4 + 1];
  const a12 = a[4 + 2];
  const a13 = a[4 + 3];
  const a20 = a[8 + 0];
  const a21 = a[8 + 1];
  const a22 = a[8 + 2];
  const a23 = a[8 + 3];
  const a30 = a[12 + 0];
  const a31 = a[12 + 1];
  const a32 = a[12 + 2];
  const a33 = a[12 + 3];
  const b00 = b[0];
  const b01 = b[1];
  const b02 = b[2];
  const b03 = b[3];
  const b10 = b[4 + 0];
  const b11 = b[4 + 1];
  const b12 = b[4 + 2];
  const b13 = b[4 + 3];
  const b20 = b[8 + 0];
  const b21 = b[8 + 1];
  const b22 = b[8 + 2];
  const b23 = b[8 + 3];
  const b30 = b[12 + 0];
  const b31 = b[12 + 1];
  const b32 = b[12 + 2];
  const b33 = b[12 + 3];
  dst[0] = a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03;
  dst[1] = a01 * b00 + a11 * b01 + a21 * b02 + a31 * b03;
  dst[2] = a02 * b00 + a12 * b01 + a22 * b02 + a32 * b03;
  dst[3] = a03 * b00 + a13 * b01 + a23 * b02 + a33 * b03;
  dst[4] = a00 * b10 + a10 * b11 + a20 * b12 + a30 * b13;
  dst[5] = a01 * b10 + a11 * b11 + a21 * b12 + a31 * b13;
  dst[6] = a02 * b10 + a12 * b11 + a22 * b12 + a32 * b13;
  dst[7] = a03 * b10 + a13 * b11 + a23 * b12 + a33 * b13;
  dst[8] = a00 * b20 + a10 * b21 + a20 * b22 + a30 * b23;
  dst[9] = a01 * b20 + a11 * b21 + a21 * b22 + a31 * b23;
  dst[10] = a02 * b20 + a12 * b21 + a22 * b22 + a32 * b23;
  dst[11] = a03 * b20 + a13 * b21 + a23 * b22 + a33 * b23;
  dst[12] = a00 * b30 + a10 * b31 + a20 * b32 + a30 * b33;
  dst[13] = a01 * b30 + a11 * b31 + a21 * b32 + a31 * b33;
  dst[14] = a02 * b30 + a12 * b31 + a22 * b32 + a32 * b33;
  dst[15] = a03 * b30 + a13 * b31 + a23 * b32 + a33 * b33;
  return dst;
}
const mul$2 = multiply$2;
function setTranslation(a, v, dst) {
  dst = dst || identity$1();
  if (a !== dst) {
    dst[0] = a[0];
    dst[1] = a[1];
    dst[2] = a[2];
    dst[3] = a[3];
    dst[4] = a[4];
    dst[5] = a[5];
    dst[6] = a[6];
    dst[7] = a[7];
    dst[8] = a[8];
    dst[9] = a[9];
    dst[10] = a[10];
    dst[11] = a[11];
  }
  dst[12] = v[0];
  dst[13] = v[1];
  dst[14] = v[2];
  dst[15] = 1;
  return dst;
}
function getTranslation(m, dst) {
  dst = dst || create$4();
  dst[0] = m[12];
  dst[1] = m[13];
  dst[2] = m[14];
  return dst;
}
function getAxis(m, axis, dst) {
  dst = dst || create$4();
  const off = axis * 4;
  dst[0] = m[off + 0];
  dst[1] = m[off + 1];
  dst[2] = m[off + 2];
  return dst;
}
function setAxis(a, v, axis, dst) {
  if (dst !== a) {
    dst = copy$2(a, dst);
  }
  const off = axis * 4;
  dst[off + 0] = v[0];
  dst[off + 1] = v[1];
  dst[off + 2] = v[2];
  return dst;
}
function getScaling(m, dst) {
  dst = dst || create$4();
  const xx = m[0];
  const xy = m[1];
  const xz = m[2];
  const yx = m[4];
  const yy = m[5];
  const yz = m[6];
  const zx = m[8];
  const zy = m[9];
  const zz = m[10];
  dst[0] = Math.sqrt(xx * xx + xy * xy + xz * xz);
  dst[1] = Math.sqrt(yx * yx + yy * yy + yz * yz);
  dst[2] = Math.sqrt(zx * zx + zy * zy + zz * zz);
  return dst;
}
function perspective(fieldOfViewYInRadians, aspect, zNear, zFar, dst) {
  dst = dst || new MatType(16);
  const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewYInRadians);
  dst[0] = f / aspect;
  dst[1] = 0;
  dst[2] = 0;
  dst[3] = 0;
  dst[4] = 0;
  dst[5] = f;
  dst[6] = 0;
  dst[7] = 0;
  dst[8] = 0;
  dst[9] = 0;
  dst[11] = -1;
  dst[12] = 0;
  dst[13] = 0;
  dst[15] = 0;
  if (zFar === Infinity) {
    dst[10] = -1;
    dst[14] = -zNear;
  } else {
    const rangeInv = 1 / (zNear - zFar);
    dst[10] = zFar * rangeInv;
    dst[14] = zFar * zNear * rangeInv;
  }
  return dst;
}
function ortho(left, right, bottom, top, near, far, dst) {
  dst = dst || new MatType(16);
  dst[0] = 2 / (right - left);
  dst[1] = 0;
  dst[2] = 0;
  dst[3] = 0;
  dst[4] = 0;
  dst[5] = 2 / (top - bottom);
  dst[6] = 0;
  dst[7] = 0;
  dst[8] = 0;
  dst[9] = 0;
  dst[10] = 1 / (near - far);
  dst[11] = 0;
  dst[12] = (right + left) / (left - right);
  dst[13] = (top + bottom) / (bottom - top);
  dst[14] = near / (near - far);
  dst[15] = 1;
  return dst;
}
function frustum(left, right, bottom, top, near, far, dst) {
  dst = dst || new MatType(16);
  const dx = right - left;
  const dy = top - bottom;
  const dz = near - far;
  dst[0] = 2 * near / dx;
  dst[1] = 0;
  dst[2] = 0;
  dst[3] = 0;
  dst[4] = 0;
  dst[5] = 2 * near / dy;
  dst[6] = 0;
  dst[7] = 0;
  dst[8] = (left + right) / dx;
  dst[9] = (top + bottom) / dy;
  dst[10] = far / dz;
  dst[11] = -1;
  dst[12] = 0;
  dst[13] = 0;
  dst[14] = near * far / dz;
  dst[15] = 0;
  return dst;
}
let xAxis;
let yAxis;
let zAxis;
function aim(position, target, up, dst) {
  dst = dst || new MatType(16);
  xAxis = xAxis || create$4();
  yAxis = yAxis || create$4();
  zAxis = zAxis || create$4();
  normalize$2(subtract$2(target, position, zAxis), zAxis);
  normalize$2(cross(up, zAxis, xAxis), xAxis);
  normalize$2(cross(zAxis, xAxis, yAxis), yAxis);
  dst[0] = xAxis[0];
  dst[1] = xAxis[1];
  dst[2] = xAxis[2];
  dst[3] = 0;
  dst[4] = yAxis[0];
  dst[5] = yAxis[1];
  dst[6] = yAxis[2];
  dst[7] = 0;
  dst[8] = zAxis[0];
  dst[9] = zAxis[1];
  dst[10] = zAxis[2];
  dst[11] = 0;
  dst[12] = position[0];
  dst[13] = position[1];
  dst[14] = position[2];
  dst[15] = 1;
  return dst;
}
function cameraAim(eye, target, up, dst) {
  dst = dst || new MatType(16);
  xAxis = xAxis || create$4();
  yAxis = yAxis || create$4();
  zAxis = zAxis || create$4();
  normalize$2(subtract$2(eye, target, zAxis), zAxis);
  normalize$2(cross(up, zAxis, xAxis), xAxis);
  normalize$2(cross(zAxis, xAxis, yAxis), yAxis);
  dst[0] = xAxis[0];
  dst[1] = xAxis[1];
  dst[2] = xAxis[2];
  dst[3] = 0;
  dst[4] = yAxis[0];
  dst[5] = yAxis[1];
  dst[6] = yAxis[2];
  dst[7] = 0;
  dst[8] = zAxis[0];
  dst[9] = zAxis[1];
  dst[10] = zAxis[2];
  dst[11] = 0;
  dst[12] = eye[0];
  dst[13] = eye[1];
  dst[14] = eye[2];
  dst[15] = 1;
  return dst;
}
function lookAt(eye, target, up, dst) {
  dst = dst || new MatType(16);
  xAxis = xAxis || create$4();
  yAxis = yAxis || create$4();
  zAxis = zAxis || create$4();
  normalize$2(subtract$2(eye, target, zAxis), zAxis);
  normalize$2(cross(up, zAxis, xAxis), xAxis);
  normalize$2(cross(zAxis, xAxis, yAxis), yAxis);
  dst[0] = xAxis[0];
  dst[1] = yAxis[0];
  dst[2] = zAxis[0];
  dst[3] = 0;
  dst[4] = xAxis[1];
  dst[5] = yAxis[1];
  dst[6] = zAxis[1];
  dst[7] = 0;
  dst[8] = xAxis[2];
  dst[9] = yAxis[2];
  dst[10] = zAxis[2];
  dst[11] = 0;
  dst[12] = -(xAxis[0] * eye[0] + xAxis[1] * eye[1] + xAxis[2] * eye[2]);
  dst[13] = -(yAxis[0] * eye[0] + yAxis[1] * eye[1] + yAxis[2] * eye[2]);
  dst[14] = -(zAxis[0] * eye[0] + zAxis[1] * eye[1] + zAxis[2] * eye[2]);
  dst[15] = 1;
  return dst;
}
function translation(v, dst) {
  dst = dst || new MatType(16);
  dst[0] = 1;
  dst[1] = 0;
  dst[2] = 0;
  dst[3] = 0;
  dst[4] = 0;
  dst[5] = 1;
  dst[6] = 0;
  dst[7] = 0;
  dst[8] = 0;
  dst[9] = 0;
  dst[10] = 1;
  dst[11] = 0;
  dst[12] = v[0];
  dst[13] = v[1];
  dst[14] = v[2];
  dst[15] = 1;
  return dst;
}
function translate(m, v, dst) {
  dst = dst || new MatType(16);
  const v0 = v[0];
  const v1 = v[1];
  const v2 = v[2];
  const m00 = m[0];
  const m01 = m[1];
  const m02 = m[2];
  const m03 = m[3];
  const m10 = m[1 * 4 + 0];
  const m11 = m[1 * 4 + 1];
  const m12 = m[1 * 4 + 2];
  const m13 = m[1 * 4 + 3];
  const m20 = m[2 * 4 + 0];
  const m21 = m[2 * 4 + 1];
  const m22 = m[2 * 4 + 2];
  const m23 = m[2 * 4 + 3];
  const m30 = m[3 * 4 + 0];
  const m31 = m[3 * 4 + 1];
  const m32 = m[3 * 4 + 2];
  const m33 = m[3 * 4 + 3];
  if (m !== dst) {
    dst[0] = m00;
    dst[1] = m01;
    dst[2] = m02;
    dst[3] = m03;
    dst[4] = m10;
    dst[5] = m11;
    dst[6] = m12;
    dst[7] = m13;
    dst[8] = m20;
    dst[9] = m21;
    dst[10] = m22;
    dst[11] = m23;
  }
  dst[12] = m00 * v0 + m10 * v1 + m20 * v2 + m30;
  dst[13] = m01 * v0 + m11 * v1 + m21 * v2 + m31;
  dst[14] = m02 * v0 + m12 * v1 + m22 * v2 + m32;
  dst[15] = m03 * v0 + m13 * v1 + m23 * v2 + m33;
  return dst;
}
function rotationX(angleInRadians, dst) {
  dst = dst || new MatType(16);
  const c = Math.cos(angleInRadians);
  const s = Math.sin(angleInRadians);
  dst[0] = 1;
  dst[1] = 0;
  dst[2] = 0;
  dst[3] = 0;
  dst[4] = 0;
  dst[5] = c;
  dst[6] = s;
  dst[7] = 0;
  dst[8] = 0;
  dst[9] = -s;
  dst[10] = c;
  dst[11] = 0;
  dst[12] = 0;
  dst[13] = 0;
  dst[14] = 0;
  dst[15] = 1;
  return dst;
}
function rotateX$1(m, angleInRadians, dst) {
  dst = dst || new MatType(16);
  const m10 = m[4];
  const m11 = m[5];
  const m12 = m[6];
  const m13 = m[7];
  const m20 = m[8];
  const m21 = m[9];
  const m22 = m[10];
  const m23 = m[11];
  const c = Math.cos(angleInRadians);
  const s = Math.sin(angleInRadians);
  dst[4] = c * m10 + s * m20;
  dst[5] = c * m11 + s * m21;
  dst[6] = c * m12 + s * m22;
  dst[7] = c * m13 + s * m23;
  dst[8] = c * m20 - s * m10;
  dst[9] = c * m21 - s * m11;
  dst[10] = c * m22 - s * m12;
  dst[11] = c * m23 - s * m13;
  if (m !== dst) {
    dst[0] = m[0];
    dst[1] = m[1];
    dst[2] = m[2];
    dst[3] = m[3];
    dst[12] = m[12];
    dst[13] = m[13];
    dst[14] = m[14];
    dst[15] = m[15];
  }
  return dst;
}
function rotationY(angleInRadians, dst) {
  dst = dst || new MatType(16);
  const c = Math.cos(angleInRadians);
  const s = Math.sin(angleInRadians);
  dst[0] = c;
  dst[1] = 0;
  dst[2] = -s;
  dst[3] = 0;
  dst[4] = 0;
  dst[5] = 1;
  dst[6] = 0;
  dst[7] = 0;
  dst[8] = s;
  dst[9] = 0;
  dst[10] = c;
  dst[11] = 0;
  dst[12] = 0;
  dst[13] = 0;
  dst[14] = 0;
  dst[15] = 1;
  return dst;
}
function rotateY$1(m, angleInRadians, dst) {
  dst = dst || new MatType(16);
  const m00 = m[0 * 4 + 0];
  const m01 = m[0 * 4 + 1];
  const m02 = m[0 * 4 + 2];
  const m03 = m[0 * 4 + 3];
  const m20 = m[2 * 4 + 0];
  const m21 = m[2 * 4 + 1];
  const m22 = m[2 * 4 + 2];
  const m23 = m[2 * 4 + 3];
  const c = Math.cos(angleInRadians);
  const s = Math.sin(angleInRadians);
  dst[0] = c * m00 - s * m20;
  dst[1] = c * m01 - s * m21;
  dst[2] = c * m02 - s * m22;
  dst[3] = c * m03 - s * m23;
  dst[8] = c * m20 + s * m00;
  dst[9] = c * m21 + s * m01;
  dst[10] = c * m22 + s * m02;
  dst[11] = c * m23 + s * m03;
  if (m !== dst) {
    dst[4] = m[4];
    dst[5] = m[5];
    dst[6] = m[6];
    dst[7] = m[7];
    dst[12] = m[12];
    dst[13] = m[13];
    dst[14] = m[14];
    dst[15] = m[15];
  }
  return dst;
}
function rotationZ(angleInRadians, dst) {
  dst = dst || new MatType(16);
  const c = Math.cos(angleInRadians);
  const s = Math.sin(angleInRadians);
  dst[0] = c;
  dst[1] = s;
  dst[2] = 0;
  dst[3] = 0;
  dst[4] = -s;
  dst[5] = c;
  dst[6] = 0;
  dst[7] = 0;
  dst[8] = 0;
  dst[9] = 0;
  dst[10] = 1;
  dst[11] = 0;
  dst[12] = 0;
  dst[13] = 0;
  dst[14] = 0;
  dst[15] = 1;
  return dst;
}
function rotateZ$1(m, angleInRadians, dst) {
  dst = dst || new MatType(16);
  const m00 = m[0 * 4 + 0];
  const m01 = m[0 * 4 + 1];
  const m02 = m[0 * 4 + 2];
  const m03 = m[0 * 4 + 3];
  const m10 = m[1 * 4 + 0];
  const m11 = m[1 * 4 + 1];
  const m12 = m[1 * 4 + 2];
  const m13 = m[1 * 4 + 3];
  const c = Math.cos(angleInRadians);
  const s = Math.sin(angleInRadians);
  dst[0] = c * m00 + s * m10;
  dst[1] = c * m01 + s * m11;
  dst[2] = c * m02 + s * m12;
  dst[3] = c * m03 + s * m13;
  dst[4] = c * m10 - s * m00;
  dst[5] = c * m11 - s * m01;
  dst[6] = c * m12 - s * m02;
  dst[7] = c * m13 - s * m03;
  if (m !== dst) {
    dst[8] = m[8];
    dst[9] = m[9];
    dst[10] = m[10];
    dst[11] = m[11];
    dst[12] = m[12];
    dst[13] = m[13];
    dst[14] = m[14];
    dst[15] = m[15];
  }
  return dst;
}
function axisRotation(axis, angleInRadians, dst) {
  dst = dst || new MatType(16);
  let x = axis[0];
  let y = axis[1];
  let z = axis[2];
  const n = Math.sqrt(x * x + y * y + z * z);
  x /= n;
  y /= n;
  z /= n;
  const xx = x * x;
  const yy = y * y;
  const zz = z * z;
  const c = Math.cos(angleInRadians);
  const s = Math.sin(angleInRadians);
  const oneMinusCosine = 1 - c;
  dst[0] = xx + (1 - xx) * c;
  dst[1] = x * y * oneMinusCosine + z * s;
  dst[2] = x * z * oneMinusCosine - y * s;
  dst[3] = 0;
  dst[4] = x * y * oneMinusCosine - z * s;
  dst[5] = yy + (1 - yy) * c;
  dst[6] = y * z * oneMinusCosine + x * s;
  dst[7] = 0;
  dst[8] = x * z * oneMinusCosine + y * s;
  dst[9] = y * z * oneMinusCosine - x * s;
  dst[10] = zz + (1 - zz) * c;
  dst[11] = 0;
  dst[12] = 0;
  dst[13] = 0;
  dst[14] = 0;
  dst[15] = 1;
  return dst;
}
const rotation = axisRotation;
function axisRotate(m, axis, angleInRadians, dst) {
  dst = dst || new MatType(16);
  let x = axis[0];
  let y = axis[1];
  let z = axis[2];
  const n = Math.sqrt(x * x + y * y + z * z);
  x /= n;
  y /= n;
  z /= n;
  const xx = x * x;
  const yy = y * y;
  const zz = z * z;
  const c = Math.cos(angleInRadians);
  const s = Math.sin(angleInRadians);
  const oneMinusCosine = 1 - c;
  const r00 = xx + (1 - xx) * c;
  const r01 = x * y * oneMinusCosine + z * s;
  const r02 = x * z * oneMinusCosine - y * s;
  const r10 = x * y * oneMinusCosine - z * s;
  const r11 = yy + (1 - yy) * c;
  const r12 = y * z * oneMinusCosine + x * s;
  const r20 = x * z * oneMinusCosine + y * s;
  const r21 = y * z * oneMinusCosine - x * s;
  const r22 = zz + (1 - zz) * c;
  const m00 = m[0];
  const m01 = m[1];
  const m02 = m[2];
  const m03 = m[3];
  const m10 = m[4];
  const m11 = m[5];
  const m12 = m[6];
  const m13 = m[7];
  const m20 = m[8];
  const m21 = m[9];
  const m22 = m[10];
  const m23 = m[11];
  dst[0] = r00 * m00 + r01 * m10 + r02 * m20;
  dst[1] = r00 * m01 + r01 * m11 + r02 * m21;
  dst[2] = r00 * m02 + r01 * m12 + r02 * m22;
  dst[3] = r00 * m03 + r01 * m13 + r02 * m23;
  dst[4] = r10 * m00 + r11 * m10 + r12 * m20;
  dst[5] = r10 * m01 + r11 * m11 + r12 * m21;
  dst[6] = r10 * m02 + r11 * m12 + r12 * m22;
  dst[7] = r10 * m03 + r11 * m13 + r12 * m23;
  dst[8] = r20 * m00 + r21 * m10 + r22 * m20;
  dst[9] = r20 * m01 + r21 * m11 + r22 * m21;
  dst[10] = r20 * m02 + r21 * m12 + r22 * m22;
  dst[11] = r20 * m03 + r21 * m13 + r22 * m23;
  if (m !== dst) {
    dst[12] = m[12];
    dst[13] = m[13];
    dst[14] = m[14];
    dst[15] = m[15];
  }
  return dst;
}
const rotate = axisRotate;
function scaling(v, dst) {
  dst = dst || new MatType(16);
  dst[0] = v[0];
  dst[1] = 0;
  dst[2] = 0;
  dst[3] = 0;
  dst[4] = 0;
  dst[5] = v[1];
  dst[6] = 0;
  dst[7] = 0;
  dst[8] = 0;
  dst[9] = 0;
  dst[10] = v[2];
  dst[11] = 0;
  dst[12] = 0;
  dst[13] = 0;
  dst[14] = 0;
  dst[15] = 1;
  return dst;
}
function scale$2(m, v, dst) {
  dst = dst || new MatType(16);
  const v0 = v[0];
  const v1 = v[1];
  const v2 = v[2];
  dst[0] = v0 * m[0 * 4 + 0];
  dst[1] = v0 * m[0 * 4 + 1];
  dst[2] = v0 * m[0 * 4 + 2];
  dst[3] = v0 * m[0 * 4 + 3];
  dst[4] = v1 * m[1 * 4 + 0];
  dst[5] = v1 * m[1 * 4 + 1];
  dst[6] = v1 * m[1 * 4 + 2];
  dst[7] = v1 * m[1 * 4 + 3];
  dst[8] = v2 * m[2 * 4 + 0];
  dst[9] = v2 * m[2 * 4 + 1];
  dst[10] = v2 * m[2 * 4 + 2];
  dst[11] = v2 * m[2 * 4 + 3];
  if (m !== dst) {
    dst[12] = m[12];
    dst[13] = m[13];
    dst[14] = m[14];
    dst[15] = m[15];
  }
  return dst;
}
function uniformScaling(s, dst) {
  dst = dst || new MatType(16);
  dst[0] = s;
  dst[1] = 0;
  dst[2] = 0;
  dst[3] = 0;
  dst[4] = 0;
  dst[5] = s;
  dst[6] = 0;
  dst[7] = 0;
  dst[8] = 0;
  dst[9] = 0;
  dst[10] = s;
  dst[11] = 0;
  dst[12] = 0;
  dst[13] = 0;
  dst[14] = 0;
  dst[15] = 1;
  return dst;
}
function uniformScale(m, s, dst) {
  dst = dst || new MatType(16);
  dst[0] = s * m[0 * 4 + 0];
  dst[1] = s * m[0 * 4 + 1];
  dst[2] = s * m[0 * 4 + 2];
  dst[3] = s * m[0 * 4 + 3];
  dst[4] = s * m[1 * 4 + 0];
  dst[5] = s * m[1 * 4 + 1];
  dst[6] = s * m[1 * 4 + 2];
  dst[7] = s * m[1 * 4 + 3];
  dst[8] = s * m[2 * 4 + 0];
  dst[9] = s * m[2 * 4 + 1];
  dst[10] = s * m[2 * 4 + 2];
  dst[11] = s * m[2 * 4 + 3];
  if (m !== dst) {
    dst[12] = m[12];
    dst[13] = m[13];
    dst[14] = m[14];
    dst[15] = m[15];
  }
  return dst;
}
var mat4Impl = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  setDefaultType: setDefaultType$3,
  create: create$2,
  set: set$2,
  fromMat3,
  fromQuat,
  negate: negate$1,
  copy: copy$2,
  clone: clone$2,
  equalsApproximately: equalsApproximately$2,
  equals: equals$2,
  identity: identity$1,
  transpose,
  inverse: inverse$2,
  determinant,
  invert: invert$1,
  multiply: multiply$2,
  mul: mul$2,
  setTranslation,
  getTranslation,
  getAxis,
  setAxis,
  getScaling,
  perspective,
  ortho,
  frustum,
  aim,
  cameraAim,
  lookAt,
  translation,
  translate,
  rotationX,
  rotateX: rotateX$1,
  rotationY,
  rotateY: rotateY$1,
  rotationZ,
  rotateZ: rotateZ$1,
  axisRotation,
  rotation,
  axisRotate,
  rotate,
  scaling,
  scale: scale$2,
  uniformScaling,
  uniformScale
});
const BUF_LEN = 11;
class VertexCache {
  constructor() {
    __publicField(this, "vertices", []);
    __publicField(this, "hasUpdated", true);
  }
  setCache(vertices) {
    this.vertices = vertices;
    this.hasUpdated = false;
  }
  getCache() {
    return this.vertices;
  }
  updated() {
    this.hasUpdated = true;
  }
  shouldUpdate() {
    return this.hasUpdated;
  }
  getVertexCount() {
    return this.vertices.length / BUF_LEN;
  }
}
class SimulationElement {
  constructor(pos, color2 = new Color()) {
    __publicField(this, "pos");
    __publicField(this, "color");
    __publicField(this, "camera");
    __publicField(this, "vertexCache");
    this.pos = pos;
    vec3ToPixelRatio(this.pos);
    this.color = color2;
    this.vertexCache = new VertexCache();
    this.camera = null;
  }
  setPos(pos) {
    this.pos = pos;
  }
  getPos() {
    return this.pos;
  }
  setCamera(camera) {
    this.camera = camera;
  }
  fill(newColor, t = 0, f) {
    const diffR = newColor.r - this.color.r;
    const diffG = newColor.g - this.color.g;
    const diffB = newColor.b - this.color.b;
    const diffA = newColor.a - this.color.a;
    const finalColor = newColor.clone();
    return transitionValues((p) => {
      this.color.r += diffR * p;
      this.color.g += diffG * p;
      this.color.b += diffB * p;
      this.color.a += diffA * p;
      this.vertexCache.updated();
    }, () => {
      this.color = finalColor;
      this.vertexCache.updated();
    }, t, f);
  }
  getColor() {
    return this.color;
  }
  move(amount, t = 0, f) {
    const finalPos = vec3Impl.create();
    vec3Impl.add(finalPos, this.pos, amount);
    return transitionValues((p) => {
      const x = amount[0] * p;
      const y = amount[1] * p;
      const z = amount[2] * p;
      vec3Impl.add(this.pos, this.pos, vector3(x, y, z));
      this.vertexCache.updated();
    }, () => {
      this.pos = finalPos;
      this.vertexCache.updated();
    }, t, f);
  }
  moveTo(pos, t = 0, f) {
    const diff = vec3Impl.create();
    vec3Impl.sub(diff, pos, this.pos);
    return transitionValues((p) => {
      const x = diff[0] * p;
      const y = diff[1] * p;
      const z = diff[2] * p;
      vec3Impl.add(this.pos, this.pos, vector3(x, y, z));
      this.vertexCache.updated();
    }, () => {
      this.pos = pos;
      this.vertexCache.updated();
    }, t, f);
  }
}
class Square extends SimulationElement {
  /**
   * @param vertexColors{Record<number, Color>} - 0 is top left vertex, numbers increase clockwise
   */
  constructor(pos, width, height, color2, rotation2, vertexColors) {
    super(vec3fromVec2(pos), color2);
    __publicField(this, "width");
    __publicField(this, "height");
    __publicField(this, "rotation");
    __publicField(this, "vertexColors");
    __publicField(this, "points");
    this.width = width * devicePixelRatio;
    this.height = height * devicePixelRatio;
    this.rotation = rotation2 || 0;
    this.vertexColors = vertexColors || {};
    this.points = [
      vector2(this.width / 2, this.height / 2),
      vector2(-this.width / 2, this.height / 2),
      vector2(-this.width / 2, -this.height / 2),
      vector2(this.width / 2, -this.height / 2)
    ];
  }
  scaleWidth(amount, t = 0, f) {
    const finalWidth = this.width * amount;
    const diffWidth = finalWidth - this.width;
    return transitionValues((p) => {
      this.width += diffWidth * p;
      this.vertexCache.updated();
    }, () => {
      this.width = finalWidth;
      this.vertexCache.updated();
    }, t, f);
  }
  scaleHeight(amount, t = 0, f) {
    const finalHeight = this.height * amount;
    const diffHeight = finalHeight - this.height;
    return transitionValues((p) => {
      this.height += diffHeight * p;
      this.vertexCache.updated();
    }, () => {
      this.height = finalHeight;
      this.vertexCache.updated();
    }, t, f);
  }
  scale(amount, t = 0, f) {
    const finalWidth = this.width * amount;
    const finalHeight = this.height * amount;
    const diffWidth = finalWidth - this.width;
    const diffHeight = finalHeight - this.height;
    return transitionValues((p) => {
      this.width += diffWidth * p;
      this.height += diffHeight * p;
      this.vertexCache.updated();
    }, () => {
      this.width = finalWidth;
      this.height = finalHeight;
      this.vertexCache.updated();
    }, t, f);
  }
  setWidth(num, t = 0, f) {
    num *= devicePixelRatio;
    const diffWidth = num - this.width;
    return transitionValues((p) => {
      this.width += diffWidth * p;
      this.vertexCache.updated();
    }, () => {
      this.width = num;
      this.vertexCache.updated();
    }, t, f);
  }
  setHeight(num, t = 0, f) {
    num *= devicePixelRatio;
    const diffHeight = num - this.height;
    return transitionValues((p) => {
      this.height += diffHeight * p;
      this.vertexCache.updated();
    }, () => {
      this.height = num;
      this.vertexCache.updated();
    }, t, f);
  }
  rotate(rotation2, t = 0, f) {
    const finalRotation = this.rotation + rotation2;
    return transitionValues((p) => {
      this.rotation += rotation2 * p;
      this.vertexCache.updated();
    }, () => {
      this.rotation = finalRotation;
      this.vertexCache.updated();
    }, t, f);
  }
  setRotation(newRotation, t = 0, f) {
    const diff = newRotation - this.rotation;
    return transitionValues((p) => {
      this.rotation += diff * p;
      this.vertexCache.updated();
    }, () => {
      this.rotation = newRotation;
      this.vertexCache.updated();
    }, t, f);
  }
  getBuffer(camera, force) {
    const resBuffer = [];
    const vertexOrder = [0, 1, 2, 0, 2, 3];
    if (this.vertexCache.shouldUpdate() || force) {
      const rotationMat = mat4Impl.identity();
      mat4Impl.rotateZ(rotationMat, this.rotation, rotationMat);
      const points = this.points.map((vec) => {
        vec2Impl.transformMat4(vec, rotationMat, vec);
        const pos = vector2();
        vec2Impl.clone(this.getPos(), pos);
        pos[1] = camera.getScreenSize()[1] - pos[1];
        pos[0] += this.width / 2;
        pos[1] -= this.height / 2;
        vec2Impl.add(vec, pos, vec);
        return vec;
      });
      vertexOrder.forEach((vertex) => {
        let vertexColor = this.vertexColors[vertex];
        vertexColor = vertexColor ? vertexColor : this.getColor();
        resBuffer.push(...vertexBuffer2d(vec3fromVec2(points[vertex]), vertexColor));
      });
      this.vertexCache.setCache(resBuffer);
      return resBuffer;
    }
    return this.vertexCache.getCache();
  }
}
function vertexBuffer2d(point, color2, uv = vector2()) {
  return [...point, 1, ...color2.toBuffer(), ...uv, 0];
}
function vector3(x = 0, y = 0, z = 0) {
  return vec3Impl.fromValues(x, y, z);
}
function vector2(x = 0, y = 0) {
  return vec2Impl.fromValues(x, y, 0);
}
function vec3ToPixelRatio(vec) {
  vec3Impl.mul(vec, vector3(devicePixelRatio, devicePixelRatio, devicePixelRatio), vec);
}
function vec3fromVec2(vec) {
  return vector3(vec[0], vec[1]);
}
function color(r, g, b, a) {
  return new Color(r, g, b, a);
}
function colorf(val, a) {
  return color(val, val, val, a);
}
const buildProjectionMatrix = (aspectRatio, zNear = 1, zFar = 500) => {
  const fov = 2 * Math.PI / 5;
  return mat4Impl.perspective(fov, aspectRatio, zNear, zFar);
};
const getTransformationMatrix = (pos, rotation2, projectionMatrix) => {
  const modelViewProjectionMatrix = mat4Impl.create();
  const viewMatrix = mat4Impl.identity();
  const camPos = vector3();
  vec3Impl.clone(pos, camPos);
  vec3Impl.scale(camPos, -1, camPos);
  mat4Impl.rotateZ(viewMatrix, rotation2[2], viewMatrix);
  mat4Impl.rotateY(viewMatrix, rotation2[1], viewMatrix);
  mat4Impl.rotateX(viewMatrix, rotation2[0], viewMatrix);
  mat4Impl.translate(viewMatrix, camPos, viewMatrix);
  mat4Impl.multiply(projectionMatrix, viewMatrix, modelViewProjectionMatrix);
  return modelViewProjectionMatrix;
};
const getOrthoMatrix = (screenSize) => {
  return mat4Impl.ortho(0, screenSize[0], 0, screenSize[1], 0, 100);
};
const buildDepthTexture = (device, width, height) => {
  return device.createTexture({
    size: [width, height],
    format: "depth24plus",
    usage: GPUTextureUsage.RENDER_ATTACHMENT
  });
};
const applyElementToScene = (scene, camera, el) => {
  if (!camera)
    throw logger.error("Camera is not initialized in element");
  if (el instanceof SimulationElement) {
    el.setCamera(camera);
    scene.push(el);
  } else {
    throw logger.error("Cannot add invalid SimulationElement");
  }
};
class Logger {
  constructor() {
  }
  fmt(msg) {
    return `SimJS: ${msg}`;
  }
  log(msg) {
    console.log(this.fmt(msg));
  }
  error(msg) {
    return new Error(this.fmt(msg));
  }
  warn(msg) {
    console.warn(this.fmt(msg));
  }
  log_error(msg) {
    console.error(this.fmt(msg));
  }
}
const logger = new Logger();
const vertexSize = 44;
const colorOffset = 16;
const uvOffset = 32;
const is3dOffset = 40;
const shader = `
struct Uniforms {
  modelViewProjectionMatrix : mat4x4<f32>,
  orthoProjectionMatrix : mat4x4<f32>,
  screenSize : vec2<f32>,
}
 
@binding(0) @group(0) var<uniform> uniforms : Uniforms;

struct VertexOutput {
  @builtin(position) Position : vec4<f32>,
  @location(0) fragUV : vec2<f32>,
  @location(1) fragColor : vec4<f32>,
  @location(2) fragPosition: vec4<f32>,
}

@vertex
fn vertex_main(
  @location(0) position : vec4<f32>,
  @location(1) color : vec4<f32>,
  @location(2) uv : vec2<f32>,
  @location(3) is3d : f32
) -> VertexOutput {
  var output : VertexOutput;

  if is3d == 1 {
    output.Position = uniforms.modelViewProjectionMatrix * position;
  } else {
    output.Position = uniforms.orthoProjectionMatrix * position;
  }
  output.fragUV = uv;
  output.fragPosition = position;
  output.fragColor = color;
  return output;
}

@fragment
fn fragment_main(
  @location(0) fragUV: vec2<f32>,
  @location(1) fragColor: vec4<f32>,
  @location(2) fragPosition: vec4<f32>
) -> @location(0) vec4<f32> {
  return fragColor;
  // return fragPosition;
}
`;
const simjsFrameRateCss = `@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono&family=Roboto:wght@100&display=swap');

.simjs-frame-rate {
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 8px 12px;
  z-index: 1000;
  font-family: Roboto Mono;
  font-size: 16px;
}`;
class FrameRateView {
  constructor(show) {
    __publicField(this, "el");
    __publicField(this, "fpsBuffer", []);
    __publicField(this, "maxFpsBufferLength", 8);
    this.el = document.createElement("div");
    this.el.classList.add("simjs-frame-rate");
    const style = document.createElement("style");
    style.innerHTML = simjsFrameRateCss;
    if (show) {
      document.head.appendChild(style);
      document.body.appendChild(this.el);
    }
  }
  updateFrameRate(num) {
    if (this.fpsBuffer.length < this.maxFpsBufferLength) {
      this.fpsBuffer.push(num);
    } else {
      this.fpsBuffer.shift();
      this.fpsBuffer.push(num);
    }
    const fps = Math.round(this.fpsBuffer.reduce((acc, curr) => acc + curr, 0) / this.fpsBuffer.length);
    this.el.innerHTML = `${fps} FPS`;
  }
}
class Simulation {
  constructor(idOrCanvasRef, camera = null, showFrameRate = false) {
    __publicField(this, "canvasRef", null);
    __publicField(this, "bgColor", new Color(255, 255, 255));
    __publicField(this, "scene", []);
    __publicField(this, "fittingElement", false);
    __publicField(this, "running", true);
    __publicField(this, "frameRateView");
    __publicField(this, "camera");
    if (typeof idOrCanvasRef === "string") {
      const ref = document.getElementById(idOrCanvasRef);
      if (ref !== null)
        this.canvasRef = ref;
      else
        throw logger.error(`Cannot find canvas with id ${idOrCanvasRef}`);
    } else if (idOrCanvasRef instanceof HTMLCanvasElement) {
      this.canvasRef = idOrCanvasRef;
    } else {
      throw logger.error(`Canvas ref/id provided is invalid`);
    }
    const parent = this.canvasRef.parentElement;
    if (!camera)
      this.camera = new Camera(vector3());
    else
      this.camera = camera;
    if (parent === null)
      throw logger.error("Canvas parent is null");
    addEventListener("resize", () => {
      if (this.fittingElement) {
        const width = parent.clientWidth;
        const height = parent.clientHeight;
        this.setCanvasSize(width, height);
      }
    });
    this.frameRateView = new FrameRateView(showFrameRate);
    this.frameRateView.updateFrameRate(1);
  }
  add(el) {
    applyElementToScene(this.scene, this.camera, el);
  }
  setCanvasSize(width, height) {
    this.assertHasCanvas();
    this.canvasRef.width = width * devicePixelRatio;
    this.canvasRef.height = height * devicePixelRatio;
    this.canvasRef.style.width = width + "px";
    this.canvasRef.style.height = height + "px";
  }
  start() {
    (async () => {
      this.assertHasCanvas();
      this.running = true;
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter)
        throw logger.error("Adapter is null");
      const ctx = this.canvasRef.getContext("webgpu");
      if (!ctx)
        throw logger.error("Context is null");
      const device = await adapter.requestDevice();
      ctx.configure({
        device,
        format: "bgra8unorm"
      });
      const screenSize = vector2(this.canvasRef.width, this.canvasRef.height);
      this.camera.setScreenSize(screenSize);
      this.render(device, ctx);
    })();
  }
  stop() {
    this.running = false;
  }
  setBackground(color2) {
    this.bgColor = color2;
  }
  render(device, ctx) {
    this.assertHasCanvas();
    const canvas = this.canvasRef;
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    const shaderModule = device.createShaderModule({ code: shader });
    ctx.configure({
      device,
      format: presentationFormat,
      alphaMode: "premultiplied"
    });
    const pipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: shaderModule,
        entryPoint: "vertex_main",
        buffers: [
          {
            arrayStride: vertexSize,
            attributes: [
              {
                // position
                shaderLocation: 0,
                offset: 0,
                format: "float32x4"
              },
              {
                // color
                shaderLocation: 1,
                offset: colorOffset,
                format: "float32x4"
              },
              {
                // size
                shaderLocation: 2,
                offset: uvOffset,
                format: "float32x2"
              },
              {
                // is3d
                shaderLocation: 3,
                offset: is3dOffset,
                format: "float32"
              }
            ]
          }
        ]
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fragment_main",
        targets: [
          {
            format: presentationFormat
          }
        ]
      },
      primitive: {
        topology: "triangle-list"
      },
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: "less",
        format: "depth24plus"
      }
    });
    const uniformBufferSize = 4 * 16 + 4 * 16 + 4 * 2 + 8;
    const uniformBuffer = device.createBuffer({
      size: uniformBufferSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    const uniformBindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: {
            buffer: uniformBuffer
          }
        }
      ]
    });
    const colorAttachment = {
      // @ts-ignore
      view: void 0,
      clearValue: this.bgColor.toObject(),
      loadOp: "clear",
      storeOp: "store"
    };
    let aspect = canvas.width / canvas.height;
    let projectionMatrix = buildProjectionMatrix(aspect);
    let modelViewProjectionMatrix;
    let orthoMatrix;
    const updateModelViewProjectionMatrix = () => {
      modelViewProjectionMatrix = getTransformationMatrix(this.camera.getPos(), this.camera.getRotation(), projectionMatrix);
    };
    updateModelViewProjectionMatrix();
    const updateOrthoMatrix = () => {
      orthoMatrix = getOrthoMatrix(this.camera.getScreenSize());
    };
    updateOrthoMatrix();
    let depthTexture = buildDepthTexture(device, canvas.width, canvas.height);
    const renderPassDescriptor = {
      colorAttachments: [colorAttachment],
      depthStencilAttachment: {
        view: depthTexture.createView(),
        depthClearValue: 1,
        depthLoadOp: "clear",
        depthStoreOp: "store"
      }
    };
    let prev = Date.now() - 10;
    let prevFps = 0;
    const frame = async () => {
      if (!this.running || !canvas)
        return;
      requestAnimationFrame(frame);
      const now = Date.now();
      const diff = Math.max(now - prev, 1);
      prev = now;
      const fps = 1e3 / diff;
      if (fps === prevFps) {
        this.frameRateView.updateFrameRate(fps);
      }
      prevFps = fps;
      canvas.width = canvas.clientWidth * devicePixelRatio;
      canvas.height = canvas.clientHeight * devicePixelRatio;
      const screenSize = this.camera.getScreenSize();
      if (screenSize[0] !== canvas.width || screenSize[1] !== canvas.height) {
        this.camera.setScreenSize(vector2(canvas.width, canvas.height));
        screenSize[0] = canvas.width;
        screenSize[1] = canvas.height;
        aspect = this.camera.getAspectRatio();
        projectionMatrix = buildProjectionMatrix(aspect);
        updateModelViewProjectionMatrix();
        depthTexture = buildDepthTexture(device, screenSize[0], screenSize[1]);
        renderPassDescriptor.depthStencilAttachment.view = depthTexture.createView();
      }
      renderPassDescriptor.colorAttachments[0].view = ctx.getCurrentTexture().createView();
      if (this.camera.hasUpdated()) {
        updateOrthoMatrix();
        updateModelViewProjectionMatrix();
      }
      device.queue.writeBuffer(uniformBuffer, 0, modelViewProjectionMatrix.buffer, modelViewProjectionMatrix.byteOffset, modelViewProjectionMatrix.byteLength);
      device.queue.writeBuffer(
        uniformBuffer,
        4 * 16,
        // 4x4 matrix
        orthoMatrix.buffer,
        orthoMatrix.byteOffset,
        orthoMatrix.byteLength
      );
      device.queue.writeBuffer(
        uniformBuffer,
        4 * 16 + 4 * 16,
        // 4x4 matrix + 4x4 matrix
        screenSize.buffer,
        screenSize.byteOffset,
        screenSize.byteLength
      );
      let vertexArray = [];
      for (let i = 0; i < this.scene.length; i++) {
        const buffer = this.scene[i].getBuffer(this.camera, this.camera.hasUpdated());
        vertexArray = vertexArray.concat(buffer);
      }
      this.camera.updateConsumed();
      const vertexF32Array = new Float32Array(vertexArray);
      const vertexBuffer = device.createBuffer({
        size: vertexF32Array.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true
      });
      new Float32Array(vertexBuffer.getMappedRange()).set(vertexF32Array);
      vertexBuffer.unmap();
      const vertexCount = vertexF32Array.length / BUF_LEN;
      const commandEncoder = device.createCommandEncoder();
      const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
      passEncoder.setPipeline(pipeline);
      passEncoder.setBindGroup(0, uniformBindGroup);
      passEncoder.setVertexBuffer(0, vertexBuffer);
      passEncoder.draw(vertexCount);
      passEncoder.end();
      device.queue.submit([commandEncoder.finish()]);
    };
    requestAnimationFrame(frame);
  }
  fitElement() {
    this.assertHasCanvas();
    this.fittingElement = true;
    const parent = this.canvasRef.parentElement;
    if (parent !== null) {
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      this.setCanvasSize(width, height);
    }
  }
  assertHasCanvas() {
    if (this.canvasRef === null) {
      throw logger.error(`cannot complete action, canvas is null`);
    }
  }
}
class SceneCollection extends SimulationElement {
  constructor(name) {
    super(vector3());
    __publicField(this, "name");
    __publicField(this, "scene");
    this.name = name;
    this.scene = [];
  }
  getName() {
    return this.name;
  }
  add(el) {
    applyElementToScene(this.scene, this.camera, el);
  }
  empty() {
    this.scene = [];
  }
  getBuffer(camera, force) {
    const res = [];
    this.scene.forEach((item) => res.push(...item.getBuffer(camera, force)));
    return res;
  }
}
class Camera {
  constructor(pos, rotation2 = vector3()) {
    __publicField(this, "pos");
    __publicField(this, "rotation");
    __publicField(this, "aspectRatio", 1);
    __publicField(this, "updated");
    __publicField(this, "screenSize", vector2());
    this.pos = pos;
    this.updated = false;
    this.rotation = rotation2;
  }
  setScreenSize(size) {
    this.screenSize = size;
    this.aspectRatio = size[0] / size[1];
    this.updated = true;
  }
  getScreenSize() {
    return this.screenSize;
  }
  hasUpdated() {
    return this.updated;
  }
  updateConsumed() {
    this.updated = false;
  }
  move(amount, t = 0, f) {
    const initial = vector3();
    vec3Impl.clone(this.pos, initial);
    return transitionValues((p) => {
      const x = amount[0] * p;
      const y = amount[1] * p;
      const z = amount[2] * p;
      const diff = vector3(x, y, z);
      vec3Impl.add(this.pos, diff, this.pos);
    }, () => {
      vec3Impl.add(initial, amount, this.pos);
    }, t, f);
  }
  moveTo(pos, t = 0, f) {
    const diff = vector3();
    vec3Impl.sub(pos, this.pos, diff);
    return transitionValues((p) => {
      const x = diff[0] * p;
      const y = diff[1] * p;
      const z = diff[2] * p;
      const amount = vector3(x, y, z);
      vec3Impl.add(this.pos, amount, this.pos);
    }, () => {
      vec3Impl.clone(pos, this.pos);
    }, t, f);
  }
  rotateTo(value, t = 0, f) {
    const diff = vec3Impl.clone(value);
    vec3Impl.sub(diff, diff, this.rotation);
    return transitionValues((p) => {
      const x = diff[0] * p;
      const y = diff[1] * p;
      const z = diff[2] * p;
      vec3Impl.add(this.rotation, this.rotation, vector3(x, y, z));
      this.updated = true;
    }, () => {
      this.rotation = value;
    }, t, f);
  }
  rotate(amount, t = 0, f) {
    const initial = vector3();
    vec3Impl.clone(this.rotation, initial);
    return transitionValues((p) => {
      const x = amount[0] * p;
      const y = amount[1] * p;
      const z = amount[2] * p;
      vec3Impl.add(this.rotation, vector3(x, y, z), this.rotation);
      this.updated = true;
    }, () => {
      vec3Impl.add(initial, amount, this.rotation);
    }, t, f);
  }
  getRotation() {
    return this.rotation;
  }
  getPos() {
    return this.pos;
  }
  getAspectRatio() {
    return this.aspectRatio;
  }
}
class Color {
  // 0.0 - 1.0
  constructor(r = 0, g = 0, b = 0, a = 1) {
    __publicField(this, "r");
    // 0 - 255
    __publicField(this, "g");
    // 0 - 255
    __publicField(this, "b");
    // 0 - 255
    __publicField(this, "a");
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
  clone() {
    return new Color(this.r, this.g, this.b, this.a);
  }
  toBuffer() {
    return [this.r / 255, this.g / 255, this.b / 255, this.a];
  }
  toObject() {
    return {
      r: this.r / 255,
      g: this.g / 255,
      b: this.b / 255,
      a: this.a
    };
  }
}
function transitionValues(callback1, callback2, transitionLength, func) {
  return new Promise((resolve) => {
    if (transitionLength == 0) {
      callback2();
      resolve();
    } else {
      let prevPercent = 0;
      let prevTime = Date.now();
      const step = (t, f) => {
        const newT = f(t);
        callback1(newT - prevPercent, t);
        prevPercent = newT;
        const now = Date.now();
        let diff = now - prevTime;
        diff = diff === 0 ? 1 : diff;
        const fpsScale = 1 / diff;
        const inc = 1 / (1e3 * fpsScale * transitionLength);
        prevTime = now;
        if (t < 1) {
          window.requestAnimationFrame(() => step(t + inc, f));
        } else {
          callback2();
          resolve();
        }
      };
      step(0, func ? func : linearStep);
    }
  });
}
function linearStep(n) {
  return n;
}
var _tmpl$$2 = /* @__PURE__ */ template(`<label class=switch><input type=checkbox><div>`);
const Switch = () => {
  const [active, setActive] = createSignal(false);
  const handleClick = () => {
    setActive((prev) => !prev);
  };
  return (() => {
    var _el$ = _tmpl$$2(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling;
    _el$.$$click = handleClick;
    createEffectJsx(() => className(_el$3, `slider ${active() ? "active" : ""}`));
    return _el$;
  })();
};
delegateEvents(["click"]);
class Graph {
  constructor(keyFn) {
    __publicField(this, "values");
    __publicField(this, "connections");
    __publicField(this, "kenFn");
    this.connections = /* @__PURE__ */ new Map();
    this.values = /* @__PURE__ */ new Map();
    this.kenFn = keyFn;
  }
  addConnection(from, to) {
    const fromKey = this.kenFn(from);
    const toKey = this.kenFn(to);
    this.values.set(fromKey, from);
    this.values.set(toKey, to);
    const connections = this.connections.get(fromKey) || [];
    connections.push(toKey);
    this.connections.set(fromKey, connections);
  }
  connectionsFromKey(key) {
    return this.connections.get(key);
  }
  fromKey(key) {
    return this.values.get(key);
  }
}
const vectorToKey = (mazeLen, vec) => vec[0] * ((mazeLen - 1) / 2) + vec[1];
const generateMazeGraph = (maze) => {
  const graph = new Graph(
    (vec) => vectorToKey(maze[0].length, vec)
  );
  for (let i = 1; i < maze.length - 1; i += 2) {
    for (let j = 1; j < maze[i].length - 1; j += 2) {
      const pos = vector2(i, j);
      if (i > 1)
        graph.addConnection(pos, vector2(i - 2, j));
      if (j > 1)
        graph.addConnection(pos, vector2(i, j - 2));
      if (i < maze.length - 2)
        graph.addConnection(pos, vector2(i + 2, j));
      if (j < maze[i].length - 2)
        graph.addConnection(pos, vector2(i, j + 2));
    }
  }
  return graph;
};
const initMaze = (rows, cols) => Array(rows).fill([]).map(() => Array(cols).fill(0));
const cloneMaze = (maze) => maze.map((row) => [...row]);
const getFilteredConnections = (graph, key, visited) => {
  return graph.connectionsFromKey(key).filter((item) => !visited.has(item));
};
const addStartEnd = (maze) => {
  maze[0][1] = 1;
  maze[maze.length - 1][maze[maze.length - 1].length - 2] = 1;
  return maze;
};
const generateMaze = (rows, cols) => {
  const maze = initMaze(rows, cols);
  const steps = [];
  const graph = generateMazeGraph(maze);
  const visited = /* @__PURE__ */ new Set();
  const idStack = [vectorToKey(cols, vector2(1, 1))];
  for (let i = 0; i < rows * cols; i++) {
    if (idStack.length === 0)
      break;
    const prevKey = idStack[idStack.length - 2];
    const key = idStack[idStack.length - 1];
    visited.add(key);
    const pos = graph.fromKey(key);
    if (prevKey) {
      const prevPos = graph.fromKey(prevKey);
      const midPos = vector2(
        (pos[0] + prevPos[0]) / 2,
        (pos[1] + prevPos[1]) / 2
      );
      if (maze[midPos[0]][midPos[1]] === 0) {
        steps.push([midPos[0], midPos[1]]);
      }
      maze[midPos[0]][midPos[1]] = 1;
    }
    if (maze[pos[0]][pos[1]] === 0) {
      steps.push([pos[0], pos[1]]);
    }
    maze[pos[0]][pos[1]] = 1;
    const connections = getFilteredConnections(graph, key, visited);
    if (connections.length === 0) {
      idStack.pop();
      continue;
    }
    idStack.push(connections[Math.floor(Math.random() * connections.length)]);
  }
  addStartEnd(maze);
  steps.push([0, 1]);
  steps.push([maze[0].length - 1, maze.length - 2]);
  return [maze, steps];
};
var _tmpl$$1 = /* @__PURE__ */ template(`<div class=maze><div class=controls><button>Generate</button></div><canvas id=canvas>`);
const Maze = (props) => {
  const [animate, setAnimate] = createSignal(false);
  const animationDelay = props.animationDelay || 10;
  const squareCollection = new SceneCollection("squares");
  let mazeStates = [];
  let currentState = 0;
  const drawMaze = (maze) => {
    squareCollection.empty();
    for (let i = 0; i < maze.length; i++) {
      for (let j = 0; j < maze[i].length; j++) {
        if (maze[i][j] > 0)
          continue;
        const square = new Square(vector2(j * props.squareSize, i * props.squareSize), props.squareSize, props.squareSize, colorf(0));
        squareCollection.add(square);
      }
    }
  };
  const setMazeStates = (steps) => {
    const emptyMaze = initMaze(props.height, props.width);
    for (let i = 0; i < steps.length; i++) {
      emptyMaze[steps[i][0]][steps[i][1]] = 1;
      const clone = cloneMaze(emptyMaze);
      mazeStates.push(clone);
    }
    currentState = mazeStates.length - 1;
  };
  let timeoutIds = [];
  const generate = () => {
    timeoutIds.forEach((id) => clearTimeout(id));
    drawMaze(initMaze(props.height, props.width));
    mazeStates = [];
    const newTimeoutIds = [];
    const [maze, steps] = generateMaze(props.height, props.width);
    setMazeStates(steps);
    if (animate()) {
      for (let i = 0; i < mazeStates.length; i++) {
        const timeoutId = setTimeout(() => {
          drawMaze(mazeStates[i]);
        }, i * animationDelay);
        newTimeoutIds.push(timeoutId);
      }
    } else {
      drawMaze(maze);
    }
    timeoutIds = newTimeoutIds;
  };
  onMount(() => {
    const canvas = new Simulation("canvas");
    canvas.fitElement();
    canvas.start();
    canvas.add(squareCollection);
    generate();
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft")
        Math.max(currentState--, 0);
      else if (e.key === "ArrowRight")
        Math.min(currentState++, mazeStates.length - 1);
      drawMaze(mazeStates[currentState]);
    });
  });
  return (() => {
    var _el$ = _tmpl$$1(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild;
    _el$3.$$click = generate;
    insert(_el$2, createComponent(Switch, {}), null);
    createEffectJsx((_p$) => {
      var _v$ = `${props.height * props.squareSize}px`, _v$2 = `${props.width * props.squareSize}px`;
      _v$ !== _p$.e && ((_p$.e = _v$) != null ? _el$.style.setProperty("height", _v$) : _el$.style.removeProperty("height"));
      _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$.style.setProperty("width", _v$2) : _el$.style.removeProperty("width"));
      return _p$;
    });
    return _el$;
  })();
};
delegateEvents(["click"]);
var _tmpl$ = /* @__PURE__ */ template(`<div class=root>`);
const App = () => {
  return (() => {
    var _el$ = _tmpl$();
    insert(_el$, createComponent(Maze, {
      height: 51,
      width: 51,
      squareSize: 10,
      animationDelay: 8
    }));
    return _el$;
  })();
};
mount(createComponent(App, {}));
