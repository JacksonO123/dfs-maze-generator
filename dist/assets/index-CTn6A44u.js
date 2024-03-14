var un = Object.defineProperty;
var hn = (n, e, t) =>
  e in n
    ? un(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t })
    : (n[e] = t);
var y = (n, e, t) => (hn(n, typeof e != "symbol" ? e + "" : e, t), t);
(function () {
  const e = document.createElement("link").relList;
  if (e && e.supports && e.supports("modulepreload")) return;
  for (const r of document.querySelectorAll('link[rel="modulepreload"]')) o(r);
  new MutationObserver((r) => {
    for (const i of r)
      if (i.type === "childList")
        for (const c of i.addedNodes)
          c.tagName === "LINK" && c.rel === "modulepreload" && o(c);
  }).observe(document, { childList: !0, subtree: !0 });
  function t(r) {
    const i = {};
    return (
      r.integrity && (i.integrity = r.integrity),
      r.referrerPolicy && (i.referrerPolicy = r.referrerPolicy),
      r.crossOrigin === "use-credentials"
        ? (i.credentials = "include")
        : r.crossOrigin === "anonymous"
          ? (i.credentials = "omit")
          : (i.credentials = "same-origin"),
      i
    );
  }
  function o(r) {
    if (r.ep) return;
    r.ep = !0;
    const i = t(r);
    fetch(r.href, i);
  }
})();
class sn {
  constructor() {
    y(this, "contexts");
    this.contexts = [];
  }
  currentContext() {
    return this.contexts[this.contexts.length - 1];
  }
  addContext(e) {
    this.contexts.push(e);
  }
  popContext() {
    return this.contexts.pop();
  }
  getContext() {
    return this.contexts;
  }
}
const ge = new sn(),
  ee = () => ge.currentContext();
class fn {
  constructor() {
    y(this, "owned");
    y(this, "disposeEvents");
    (this.owned = new Set()), (this.disposeEvents = []);
  }
  own(e) {
    this.owned.add(e);
  }
  ownMany(e) {
    e.forEach((t) => {
      this.owned.add(t);
    });
  }
  dispose() {
    this.runDisposeEvents(), this.owned.clear();
  }
  runDisposeEvents() {
    this.disposeEvents.forEach((e) => e()), (this.disposeEvents = []);
  }
  onDispose(e) {
    this.disposeEvents.push(e);
    const t = this.disposeEvents.length - 1;
    return (o) => {
      this.disposeEvents.length > t && (this.disposeEvents[t] = o);
    };
  }
  addEffect(e) {
    this.owned.forEach((t) => t.addEffect(e));
  }
  removeEffect(e) {
    this.owned.forEach((t) => t.removeEffect(e));
  }
  getOwned() {
    return [...this.owned];
  }
}
const pe = (n, e = !0) => {
    const t = new fn();
    return (
      ge.addContext(t),
      n(),
      ge.popContext(),
      ee() && e && ne(() => Se(t)),
      () => Se(t)
    );
  },
  Se = (n) => {
    n.dispose();
  },
  ne = (n) => {
    const e = ee();
    if (e) return e.onDispose(n);
  },
  qe = (n) => {
    const e = pe(() => {
      n();
      const t = ee();
      t &&
        (t.addEffect(n),
        ne(() => {
          t.removeEffect(n);
        }));
    });
    ne(e);
  },
  ln = () => {
    let n = null,
      e;
    return [
      () => (n == null ? void 0 : n()),
      (t) => {
        e ? e(t) : (e = ne(t)), (n = t);
      },
    ];
  };
let we = [];
const le = (n, e) => {
    const t = te(e);
    Array.isArray(t) ? t.forEach((o) => n.appendChild(o)) : n.appendChild(t);
  },
  pn = (n, e = document.body) => {
    pe(() => {
      le(e, n), we.forEach((t) => t()), (we = []);
    });
  },
  te = (n) =>
    n instanceof Node
      ? n
      : Array.isArray(n)
        ? n.map((e) => te(e)).flat()
        : new Text(n + ""),
  gn = (n, e) => {
    const t = te(e);
    Array.isArray(t) ? n.after(...t) : n.after(t);
  },
  xe = (n, e) => {
    const t = te(e);
    Array.isArray(t) ? n.before(...t.reverse()) : n.before(t);
  },
  wn = (n, e, t, o) => {
    if (Array.isArray(n)) {
      if (n.length === 0) {
        o ? xe(o, e) : le(t, e);
        return;
      }
      if (Array.isArray(e)) {
        for (; n.length > e.length; ) n[n.length - 1].remove(), n.pop();
        let r = 0;
        for (; r < n.length; r++) n[r].replaceWith(e[r]);
        for (; r < e.length; ) e[r - 1].after(e[r]), r++;
      } else {
        for (; n.length > 1; ) n[n.length - 1].remove(), n.pop();
        n[0].replaceWith(e);
      }
    } else if (Array.isArray(e)) {
      if (e.length === 0) {
        n.remove();
        return;
      }
      const r = e.shift();
      n.replaceWith(r), gn(r, e);
    } else n.replaceWith(e);
  },
  xn = (n) => {
    const e = `$$${n.type}`;
    let t = (n.composedPath && n.composedPath()[0]) || n.target;
    for (
      n.target !== t &&
        Object.defineProperty(n, "target", { configurable: !0, value: t }),
        Object.defineProperty(n, "currentTarget", {
          configurable: !0,
          get() {
            return t || document;
          },
        });
      t;

    ) {
      const o = t[e];
      if (o && !t.disabled) {
        const r = t[`${e}Data`];
        r !== void 0 ? o(r, n) : o(n);
      }
      t = t.parentNode;
    }
  },
  ze = "_$DX_DELEGATE",
  Te = (n, e) => {
    let t;
    const o = pe(() => {
      t = n(e);
    });
    return ne(o), t;
  },
  Re = (n, e, t) => {
    const r = (() => {
      const i = document.createElement("template");
      return (
        (i.innerHTML = n),
        t ? i.content.firstChild.firstChild : i.content.firstChild
      );
    })();
    return () => (r == null ? void 0 : r.cloneNode(!0));
  },
  yn = (n, e, t = null, o) => {
    if (
      (o &&
        console.log("HAS INITIAL", {
          parent: n,
          accessor: e,
          marker: t,
          initial: o,
        }),
      typeof e == "function")
    ) {
      let r = null,
        i = null,
        c = !1;
      const [a, u] = ln();
      qe(() => {
        if (!i && ((i = ee() || null), !i)) return;
        a();
        let f = [];
        const l = pe(() => {
          let s = e();
          if (!c) {
            const g = ee();
            g && (f = g.getOwned());
          }
          if (s === !1 || s === null || s === void 0)
            if (r !== null) {
              const g = new Text();
              r.replaceWith(g), (r = g);
              return;
            } else s = "";
          const h = te(s);
          r === null ? (t !== null ? xe(t, h) : le(n, h)) : wn(r, h, n, t),
            (r = h);
        }, !1);
        c || (i.ownMany(f), (c = !0)), u(l);
      });
    } else t ? xe(t, e) : le(n, e);
  },
  Mn = (n) => {
    we.push(n);
  },
  vn = (n, e = document) => {
    const t = e[ze] || (e[ze] = new Set());
    for (let o = 0; o < n.length; o++) {
      const r = n[o];
      t.has(r) || (t.add(r), e.addEventListener(r, xn));
    }
  },
  mn = (n) => {
    qe(() => n({}));
  };
let B = 1e-6,
  z = Float32Array;
function $n(n) {
  const e = z;
  return (z = n), e;
}
function Ve(n = 0, e = 0) {
  const t = new z(2);
  return n !== void 0 && ((t[0] = n), e !== void 0 && (t[1] = e)), t;
}
let m = Float32Array;
function Cn(n) {
  const e = m;
  return (m = n), e;
}
function Y(n, e, t) {
  const o = new m(3);
  return (
    n !== void 0 &&
      ((o[0] = n), e !== void 0 && ((o[1] = e), t !== void 0 && (o[2] = t))),
    o
  );
}
const Sn = Ve;
function zn(n, e, t) {
  return (t = t || new z(2)), (t[0] = n), (t[1] = e), t;
}
function An(n, e) {
  return (
    (e = e || new z(2)), (e[0] = Math.ceil(n[0])), (e[1] = Math.ceil(n[1])), e
  );
}
function Pn(n, e) {
  return (
    (e = e || new z(2)), (e[0] = Math.floor(n[0])), (e[1] = Math.floor(n[1])), e
  );
}
function En(n, e) {
  return (
    (e = e || new z(2)), (e[0] = Math.round(n[0])), (e[1] = Math.round(n[1])), e
  );
}
function qn(n, e = 0, t = 1, o) {
  return (
    (o = o || new z(2)),
    (o[0] = Math.min(t, Math.max(e, n[0]))),
    (o[1] = Math.min(t, Math.max(e, n[1]))),
    o
  );
}
function Tn(n, e, t) {
  return (t = t || new z(2)), (t[0] = n[0] + e[0]), (t[1] = n[1] + e[1]), t;
}
function Rn(n, e, t, o) {
  return (
    (o = o || new z(2)), (o[0] = n[0] + e[0] * t), (o[1] = n[1] + e[1] * t), o
  );
}
function Vn(n, e) {
  const t = n[0],
    o = n[1],
    r = n[0],
    i = n[1],
    c = Math.sqrt(t * t + o * o),
    a = Math.sqrt(r * r + i * i),
    u = c * a,
    f = u && Le(n, e) / u;
  return Math.acos(f);
}
function Be(n, e, t) {
  return (t = t || new z(2)), (t[0] = n[0] - e[0]), (t[1] = n[1] - e[1]), t;
}
const Bn = Be;
function On(n, e) {
  return Math.abs(n[0] - e[0]) < B && Math.abs(n[1] - e[1]) < B;
}
function Fn(n, e) {
  return n[0] === e[0] && n[1] === e[1];
}
function Ln(n, e, t, o) {
  return (
    (o = o || new z(2)),
    (o[0] = n[0] + t * (e[0] - n[0])),
    (o[1] = n[1] + t * (e[1] - n[1])),
    o
  );
}
function Un(n, e, t, o) {
  return (
    (o = o || new z(2)),
    (o[0] = n[0] + t[0] * (e[0] - n[0])),
    (o[1] = n[1] + t[1] * (e[1] - n[1])),
    o
  );
}
function _n(n, e, t) {
  return (
    (t = t || new z(2)),
    (t[0] = Math.max(n[0], e[0])),
    (t[1] = Math.max(n[1], e[1])),
    t
  );
}
function Hn(n, e, t) {
  return (
    (t = t || new z(2)),
    (t[0] = Math.min(n[0], e[0])),
    (t[1] = Math.min(n[1], e[1])),
    t
  );
}
function Oe(n, e, t) {
  return (t = t || new z(2)), (t[0] = n[0] * e), (t[1] = n[1] * e), t;
}
const Dn = Oe;
function bn(n, e, t) {
  return (t = t || new z(2)), (t[0] = n[0] / e), (t[1] = n[1] / e), t;
}
function Fe(n, e) {
  return (e = e || new z(2)), (e[0] = 1 / n[0]), (e[1] = 1 / n[1]), e;
}
const jn = Fe;
function Wn(n, e, t) {
  t = t || new m(3);
  const o = n[0] * e[1] - n[1] * e[0];
  return (t[0] = 0), (t[1] = 0), (t[2] = o), t;
}
function Le(n, e) {
  return n[0] * e[0] + n[1] * e[1];
}
function Ue(n) {
  const e = n[0],
    t = n[1];
  return Math.sqrt(e * e + t * t);
}
const Gn = Ue;
function _e(n) {
  const e = n[0],
    t = n[1];
  return e * e + t * t;
}
const Nn = _e;
function He(n, e) {
  const t = n[0] - e[0],
    o = n[1] - e[1];
  return Math.sqrt(t * t + o * o);
}
const Kn = He;
function De(n, e) {
  const t = n[0] - e[0],
    o = n[1] - e[1];
  return t * t + o * o;
}
const In = De;
function Xn(n, e) {
  e = e || new z(2);
  const t = n[0],
    o = n[1],
    r = Math.sqrt(t * t + o * o);
  return (
    r > 1e-5 ? ((e[0] = t / r), (e[1] = o / r)) : ((e[0] = 0), (e[1] = 0)), e
  );
}
function Yn(n, e) {
  return (e = e || new z(2)), (e[0] = -n[0]), (e[1] = -n[1]), e;
}
function be(n, e) {
  return (e = e || new z(2)), (e[0] = n[0]), (e[1] = n[1]), e;
}
const Zn = be;
function je(n, e, t) {
  return (t = t || new z(2)), (t[0] = n[0] * e[0]), (t[1] = n[1] * e[1]), t;
}
const Qn = je;
function We(n, e, t) {
  return (t = t || new z(2)), (t[0] = n[0] / e[0]), (t[1] = n[1] / e[1]), t;
}
const Jn = We;
function kn(n = 1, e) {
  e = e || new z(2);
  const t = Math.random() * 2 * Math.PI;
  return (e[0] = Math.cos(t) * n), (e[1] = Math.sin(t) * n), e;
}
function dn(n) {
  return (n = n || new z(2)), (n[0] = 0), (n[1] = 0), n;
}
function et(n, e, t) {
  t = t || new z(2);
  const o = n[0],
    r = n[1];
  return (
    (t[0] = o * e[0] + r * e[4] + e[12]),
    (t[1] = o * e[1] + r * e[5] + e[13]),
    t
  );
}
function nt(n, e, t) {
  t = t || new z(2);
  const o = n[0],
    r = n[1];
  return (
    (t[0] = e[0] * o + e[4] * r + e[8]), (t[1] = e[1] * o + e[5] * r + e[9]), t
  );
}
var d = Object.freeze({
  __proto__: null,
  create: Ve,
  setDefaultType: $n,
  fromValues: Sn,
  set: zn,
  ceil: An,
  floor: Pn,
  round: En,
  clamp: qn,
  add: Tn,
  addScaled: Rn,
  angle: Vn,
  subtract: Be,
  sub: Bn,
  equalsApproximately: On,
  equals: Fn,
  lerp: Ln,
  lerpV: Un,
  max: _n,
  min: Hn,
  mulScalar: Oe,
  scale: Dn,
  divScalar: bn,
  inverse: Fe,
  invert: jn,
  cross: Wn,
  dot: Le,
  length: Ue,
  len: Gn,
  lengthSq: _e,
  lenSq: Nn,
  distance: He,
  dist: Kn,
  distanceSq: De,
  distSq: In,
  normalize: Xn,
  negate: Yn,
  copy: be,
  clone: Zn,
  multiply: je,
  mul: Qn,
  divide: We,
  div: Jn,
  random: kn,
  zero: dn,
  transformMat4: et,
  transformMat3: nt,
});
const tt = new Map([
  [Float32Array, () => new Float32Array(12)],
  [Float64Array, () => new Float64Array(12)],
  [Array, () => new Array(12).fill(0)],
]);
tt.get(Float32Array);
const ot = Y;
function rt(n, e, t, o) {
  return (o = o || new m(3)), (o[0] = n), (o[1] = e), (o[2] = t), o;
}
function it(n, e) {
  return (
    (e = e || new m(3)),
    (e[0] = Math.ceil(n[0])),
    (e[1] = Math.ceil(n[1])),
    (e[2] = Math.ceil(n[2])),
    e
  );
}
function ct(n, e) {
  return (
    (e = e || new m(3)),
    (e[0] = Math.floor(n[0])),
    (e[1] = Math.floor(n[1])),
    (e[2] = Math.floor(n[2])),
    e
  );
}
function at(n, e) {
  return (
    (e = e || new m(3)),
    (e[0] = Math.round(n[0])),
    (e[1] = Math.round(n[1])),
    (e[2] = Math.round(n[2])),
    e
  );
}
function ut(n, e = 0, t = 1, o) {
  return (
    (o = o || new m(3)),
    (o[0] = Math.min(t, Math.max(e, n[0]))),
    (o[1] = Math.min(t, Math.max(e, n[1]))),
    (o[2] = Math.min(t, Math.max(e, n[2]))),
    o
  );
}
function ht(n, e, t) {
  return (
    (t = t || new m(3)),
    (t[0] = n[0] + e[0]),
    (t[1] = n[1] + e[1]),
    (t[2] = n[2] + e[2]),
    t
  );
}
function st(n, e, t, o) {
  return (
    (o = o || new m(3)),
    (o[0] = n[0] + e[0] * t),
    (o[1] = n[1] + e[1] * t),
    (o[2] = n[2] + e[2] * t),
    o
  );
}
function ft(n, e) {
  const t = n[0],
    o = n[1],
    r = n[2],
    i = n[0],
    c = n[1],
    a = n[2],
    u = Math.sqrt(t * t + o * o + r * r),
    f = Math.sqrt(i * i + c * c + a * a),
    l = u * f,
    s = l && Ke(n, e) / l;
  return Math.acos(s);
}
function oe(n, e, t) {
  return (
    (t = t || new m(3)),
    (t[0] = n[0] - e[0]),
    (t[1] = n[1] - e[1]),
    (t[2] = n[2] - e[2]),
    t
  );
}
const lt = oe;
function pt(n, e) {
  return (
    Math.abs(n[0] - e[0]) < B &&
    Math.abs(n[1] - e[1]) < B &&
    Math.abs(n[2] - e[2]) < B
  );
}
function gt(n, e) {
  return n[0] === e[0] && n[1] === e[1] && n[2] === e[2];
}
function wt(n, e, t, o) {
  return (
    (o = o || new m(3)),
    (o[0] = n[0] + t * (e[0] - n[0])),
    (o[1] = n[1] + t * (e[1] - n[1])),
    (o[2] = n[2] + t * (e[2] - n[2])),
    o
  );
}
function xt(n, e, t, o) {
  return (
    (o = o || new m(3)),
    (o[0] = n[0] + t[0] * (e[0] - n[0])),
    (o[1] = n[1] + t[1] * (e[1] - n[1])),
    (o[2] = n[2] + t[2] * (e[2] - n[2])),
    o
  );
}
function yt(n, e, t) {
  return (
    (t = t || new m(3)),
    (t[0] = Math.max(n[0], e[0])),
    (t[1] = Math.max(n[1], e[1])),
    (t[2] = Math.max(n[2], e[2])),
    t
  );
}
function Mt(n, e, t) {
  return (
    (t = t || new m(3)),
    (t[0] = Math.min(n[0], e[0])),
    (t[1] = Math.min(n[1], e[1])),
    (t[2] = Math.min(n[2], e[2])),
    t
  );
}
function Ge(n, e, t) {
  return (
    (t = t || new m(3)),
    (t[0] = n[0] * e),
    (t[1] = n[1] * e),
    (t[2] = n[2] * e),
    t
  );
}
const vt = Ge;
function mt(n, e, t) {
  return (
    (t = t || new m(3)),
    (t[0] = n[0] / e),
    (t[1] = n[1] / e),
    (t[2] = n[2] / e),
    t
  );
}
function Ne(n, e) {
  return (
    (e = e || new m(3)),
    (e[0] = 1 / n[0]),
    (e[1] = 1 / n[1]),
    (e[2] = 1 / n[2]),
    e
  );
}
const $t = Ne;
function k(n, e, t) {
  t = t || new m(3);
  const o = n[2] * e[0] - n[0] * e[2],
    r = n[0] * e[1] - n[1] * e[0];
  return (t[0] = n[1] * e[2] - n[2] * e[1]), (t[1] = o), (t[2] = r), t;
}
function Ke(n, e) {
  return n[0] * e[0] + n[1] * e[1] + n[2] * e[2];
}
function Ie(n) {
  const e = n[0],
    t = n[1],
    o = n[2];
  return Math.sqrt(e * e + t * t + o * o);
}
const Ct = Ie;
function Xe(n) {
  const e = n[0],
    t = n[1],
    o = n[2];
  return e * e + t * t + o * o;
}
const St = Xe;
function Ye(n, e) {
  const t = n[0] - e[0],
    o = n[1] - e[1],
    r = n[2] - e[2];
  return Math.sqrt(t * t + o * o + r * r);
}
const zt = Ye;
function Ze(n, e) {
  const t = n[0] - e[0],
    o = n[1] - e[1],
    r = n[2] - e[2];
  return t * t + o * o + r * r;
}
const At = Ze;
function Q(n, e) {
  e = e || new m(3);
  const t = n[0],
    o = n[1],
    r = n[2],
    i = Math.sqrt(t * t + o * o + r * r);
  return (
    i > 1e-5
      ? ((e[0] = t / i), (e[1] = o / i), (e[2] = r / i))
      : ((e[0] = 0), (e[1] = 0), (e[2] = 0)),
    e
  );
}
function Pt(n, e) {
  return (e = e || new m(3)), (e[0] = -n[0]), (e[1] = -n[1]), (e[2] = -n[2]), e;
}
function Qe(n, e) {
  return (e = e || new m(3)), (e[0] = n[0]), (e[1] = n[1]), (e[2] = n[2]), e;
}
const Et = Qe;
function Je(n, e, t) {
  return (
    (t = t || new m(3)),
    (t[0] = n[0] * e[0]),
    (t[1] = n[1] * e[1]),
    (t[2] = n[2] * e[2]),
    t
  );
}
const qt = Je;
function ke(n, e, t) {
  return (
    (t = t || new m(3)),
    (t[0] = n[0] / e[0]),
    (t[1] = n[1] / e[1]),
    (t[2] = n[2] / e[2]),
    t
  );
}
const Tt = ke;
function Rt(n = 1, e) {
  e = e || new m(3);
  const t = Math.random() * 2 * Math.PI,
    o = Math.random() * 2 - 1,
    r = Math.sqrt(1 - o * o) * n;
  return (e[0] = Math.cos(t) * r), (e[1] = Math.sin(t) * r), (e[2] = o * n), e;
}
function Vt(n) {
  return (n = n || new m(3)), (n[0] = 0), (n[1] = 0), (n[2] = 0), n;
}
function Bt(n, e, t) {
  t = t || new m(3);
  const o = n[0],
    r = n[1],
    i = n[2],
    c = e[3] * o + e[7] * r + e[11] * i + e[15] || 1;
  return (
    (t[0] = (e[0] * o + e[4] * r + e[8] * i + e[12]) / c),
    (t[1] = (e[1] * o + e[5] * r + e[9] * i + e[13]) / c),
    (t[2] = (e[2] * o + e[6] * r + e[10] * i + e[14]) / c),
    t
  );
}
function Ot(n, e, t) {
  t = t || new m(3);
  const o = n[0],
    r = n[1],
    i = n[2];
  return (
    (t[0] = o * e[0 * 4 + 0] + r * e[1 * 4 + 0] + i * e[2 * 4 + 0]),
    (t[1] = o * e[0 * 4 + 1] + r * e[1 * 4 + 1] + i * e[2 * 4 + 1]),
    (t[2] = o * e[0 * 4 + 2] + r * e[1 * 4 + 2] + i * e[2 * 4 + 2]),
    t
  );
}
function Ft(n, e, t) {
  t = t || new m(3);
  const o = n[0],
    r = n[1],
    i = n[2];
  return (
    (t[0] = o * e[0] + r * e[4] + i * e[8]),
    (t[1] = o * e[1] + r * e[5] + i * e[9]),
    (t[2] = o * e[2] + r * e[6] + i * e[10]),
    t
  );
}
function Lt(n, e, t) {
  t = t || new m(3);
  const o = e[0],
    r = e[1],
    i = e[2],
    c = e[3] * 2,
    a = n[0],
    u = n[1],
    f = n[2],
    l = r * f - i * u,
    s = i * a - o * f,
    h = o * u - r * a;
  return (
    (t[0] = a + l * c + (r * h - i * s) * 2),
    (t[1] = u + s * c + (i * l - o * h) * 2),
    (t[2] = f + h * c + (o * s - r * l) * 2),
    t
  );
}
function Ut(n, e) {
  return (e = e || new m(3)), (e[0] = n[12]), (e[1] = n[13]), (e[2] = n[14]), e;
}
function _t(n, e, t) {
  t = t || new m(3);
  const o = e * 4;
  return (t[0] = n[o + 0]), (t[1] = n[o + 1]), (t[2] = n[o + 2]), t;
}
function Ht(n, e) {
  e = e || new m(3);
  const t = n[0],
    o = n[1],
    r = n[2],
    i = n[4],
    c = n[5],
    a = n[6],
    u = n[8],
    f = n[9],
    l = n[10];
  return (
    (e[0] = Math.sqrt(t * t + o * o + r * r)),
    (e[1] = Math.sqrt(i * i + c * c + a * a)),
    (e[2] = Math.sqrt(u * u + f * f + l * l)),
    e
  );
}
var R = Object.freeze({
  __proto__: null,
  create: Y,
  setDefaultType: Cn,
  fromValues: ot,
  set: rt,
  ceil: it,
  floor: ct,
  round: at,
  clamp: ut,
  add: ht,
  addScaled: st,
  angle: ft,
  subtract: oe,
  sub: lt,
  equalsApproximately: pt,
  equals: gt,
  lerp: wt,
  lerpV: xt,
  max: yt,
  min: Mt,
  mulScalar: Ge,
  scale: vt,
  divScalar: mt,
  inverse: Ne,
  invert: $t,
  cross: k,
  dot: Ke,
  length: Ie,
  len: Ct,
  lengthSq: Xe,
  lenSq: St,
  distance: Ye,
  dist: zt,
  distanceSq: Ze,
  distSq: At,
  normalize: Q,
  negate: Pt,
  copy: Qe,
  clone: Et,
  multiply: Je,
  mul: qt,
  divide: ke,
  div: Tt,
  random: Rt,
  zero: Vt,
  transformMat4: Bt,
  transformMat4Upper3x3: Ot,
  transformMat3: Ft,
  transformQuat: Lt,
  getTranslation: Ut,
  getAxis: _t,
  getScaling: Ht,
});
let $ = Float32Array;
function Dt(n) {
  const e = $;
  return ($ = n), e;
}
function bt(n, e, t, o, r, i, c, a, u, f, l, s, h, g, w, x) {
  const p = new $(16);
  return (
    n !== void 0 &&
      ((p[0] = n),
      e !== void 0 &&
        ((p[1] = e),
        t !== void 0 &&
          ((p[2] = t),
          o !== void 0 &&
            ((p[3] = o),
            r !== void 0 &&
              ((p[4] = r),
              i !== void 0 &&
                ((p[5] = i),
                c !== void 0 &&
                  ((p[6] = c),
                  a !== void 0 &&
                    ((p[7] = a),
                    u !== void 0 &&
                      ((p[8] = u),
                      f !== void 0 &&
                        ((p[9] = f),
                        l !== void 0 &&
                          ((p[10] = l),
                          s !== void 0 &&
                            ((p[11] = s),
                            h !== void 0 &&
                              ((p[12] = h),
                              g !== void 0 &&
                                ((p[13] = g),
                                w !== void 0 &&
                                  ((p[14] = w),
                                  x !== void 0 && (p[15] = x)))))))))))))))),
    p
  );
}
function jt(n, e, t, o, r, i, c, a, u, f, l, s, h, g, w, x, p) {
  return (
    (p = p || new $(16)),
    (p[0] = n),
    (p[1] = e),
    (p[2] = t),
    (p[3] = o),
    (p[4] = r),
    (p[5] = i),
    (p[6] = c),
    (p[7] = a),
    (p[8] = u),
    (p[9] = f),
    (p[10] = l),
    (p[11] = s),
    (p[12] = h),
    (p[13] = g),
    (p[14] = w),
    (p[15] = x),
    p
  );
}
function Wt(n, e) {
  return (
    (e = e || new $(16)),
    (e[0] = n[0]),
    (e[1] = n[1]),
    (e[2] = n[2]),
    (e[3] = 0),
    (e[4] = n[4]),
    (e[5] = n[5]),
    (e[6] = n[6]),
    (e[7] = 0),
    (e[8] = n[8]),
    (e[9] = n[9]),
    (e[10] = n[10]),
    (e[11] = 0),
    (e[12] = 0),
    (e[13] = 0),
    (e[14] = 0),
    (e[15] = 1),
    e
  );
}
function Gt(n, e) {
  e = e || new $(16);
  const t = n[0],
    o = n[1],
    r = n[2],
    i = n[3],
    c = t + t,
    a = o + o,
    u = r + r,
    f = t * c,
    l = o * c,
    s = o * a,
    h = r * c,
    g = r * a,
    w = r * u,
    x = i * c,
    p = i * a,
    v = i * u;
  return (
    (e[0] = 1 - s - w),
    (e[1] = l + v),
    (e[2] = h - p),
    (e[3] = 0),
    (e[4] = l - v),
    (e[5] = 1 - f - w),
    (e[6] = g + x),
    (e[7] = 0),
    (e[8] = h + p),
    (e[9] = g - x),
    (e[10] = 1 - f - s),
    (e[11] = 0),
    (e[12] = 0),
    (e[13] = 0),
    (e[14] = 0),
    (e[15] = 1),
    e
  );
}
function Nt(n, e) {
  return (
    (e = e || new $(16)),
    (e[0] = -n[0]),
    (e[1] = -n[1]),
    (e[2] = -n[2]),
    (e[3] = -n[3]),
    (e[4] = -n[4]),
    (e[5] = -n[5]),
    (e[6] = -n[6]),
    (e[7] = -n[7]),
    (e[8] = -n[8]),
    (e[9] = -n[9]),
    (e[10] = -n[10]),
    (e[11] = -n[11]),
    (e[12] = -n[12]),
    (e[13] = -n[13]),
    (e[14] = -n[14]),
    (e[15] = -n[15]),
    e
  );
}
function ye(n, e) {
  return (
    (e = e || new $(16)),
    (e[0] = n[0]),
    (e[1] = n[1]),
    (e[2] = n[2]),
    (e[3] = n[3]),
    (e[4] = n[4]),
    (e[5] = n[5]),
    (e[6] = n[6]),
    (e[7] = n[7]),
    (e[8] = n[8]),
    (e[9] = n[9]),
    (e[10] = n[10]),
    (e[11] = n[11]),
    (e[12] = n[12]),
    (e[13] = n[13]),
    (e[14] = n[14]),
    (e[15] = n[15]),
    e
  );
}
const Kt = ye;
function It(n, e) {
  return (
    Math.abs(n[0] - e[0]) < B &&
    Math.abs(n[1] - e[1]) < B &&
    Math.abs(n[2] - e[2]) < B &&
    Math.abs(n[3] - e[3]) < B &&
    Math.abs(n[4] - e[4]) < B &&
    Math.abs(n[5] - e[5]) < B &&
    Math.abs(n[6] - e[6]) < B &&
    Math.abs(n[7] - e[7]) < B &&
    Math.abs(n[8] - e[8]) < B &&
    Math.abs(n[9] - e[9]) < B &&
    Math.abs(n[10] - e[10]) < B &&
    Math.abs(n[11] - e[11]) < B &&
    Math.abs(n[12] - e[12]) < B &&
    Math.abs(n[13] - e[13]) < B &&
    Math.abs(n[14] - e[14]) < B &&
    Math.abs(n[15] - e[15]) < B
  );
}
function Xt(n, e) {
  return (
    n[0] === e[0] &&
    n[1] === e[1] &&
    n[2] === e[2] &&
    n[3] === e[3] &&
    n[4] === e[4] &&
    n[5] === e[5] &&
    n[6] === e[6] &&
    n[7] === e[7] &&
    n[8] === e[8] &&
    n[9] === e[9] &&
    n[10] === e[10] &&
    n[11] === e[11] &&
    n[12] === e[12] &&
    n[13] === e[13] &&
    n[14] === e[14] &&
    n[15] === e[15]
  );
}
function de(n) {
  return (
    (n = n || new $(16)),
    (n[0] = 1),
    (n[1] = 0),
    (n[2] = 0),
    (n[3] = 0),
    (n[4] = 0),
    (n[5] = 1),
    (n[6] = 0),
    (n[7] = 0),
    (n[8] = 0),
    (n[9] = 0),
    (n[10] = 1),
    (n[11] = 0),
    (n[12] = 0),
    (n[13] = 0),
    (n[14] = 0),
    (n[15] = 1),
    n
  );
}
function Yt(n, e) {
  if (((e = e || new $(16)), e === n)) {
    let M;
    return (
      (M = n[1]),
      (n[1] = n[4]),
      (n[4] = M),
      (M = n[2]),
      (n[2] = n[8]),
      (n[8] = M),
      (M = n[3]),
      (n[3] = n[12]),
      (n[12] = M),
      (M = n[6]),
      (n[6] = n[9]),
      (n[9] = M),
      (M = n[7]),
      (n[7] = n[13]),
      (n[13] = M),
      (M = n[11]),
      (n[11] = n[14]),
      (n[14] = M),
      e
    );
  }
  const t = n[0 * 4 + 0],
    o = n[0 * 4 + 1],
    r = n[0 * 4 + 2],
    i = n[0 * 4 + 3],
    c = n[1 * 4 + 0],
    a = n[1 * 4 + 1],
    u = n[1 * 4 + 2],
    f = n[1 * 4 + 3],
    l = n[2 * 4 + 0],
    s = n[2 * 4 + 1],
    h = n[2 * 4 + 2],
    g = n[2 * 4 + 3],
    w = n[3 * 4 + 0],
    x = n[3 * 4 + 1],
    p = n[3 * 4 + 2],
    v = n[3 * 4 + 3];
  return (
    (e[0] = t),
    (e[1] = c),
    (e[2] = l),
    (e[3] = w),
    (e[4] = o),
    (e[5] = a),
    (e[6] = s),
    (e[7] = x),
    (e[8] = r),
    (e[9] = u),
    (e[10] = h),
    (e[11] = p),
    (e[12] = i),
    (e[13] = f),
    (e[14] = g),
    (e[15] = v),
    e
  );
}
function en(n, e) {
  e = e || new $(16);
  const t = n[0 * 4 + 0],
    o = n[0 * 4 + 1],
    r = n[0 * 4 + 2],
    i = n[0 * 4 + 3],
    c = n[1 * 4 + 0],
    a = n[1 * 4 + 1],
    u = n[1 * 4 + 2],
    f = n[1 * 4 + 3],
    l = n[2 * 4 + 0],
    s = n[2 * 4 + 1],
    h = n[2 * 4 + 2],
    g = n[2 * 4 + 3],
    w = n[3 * 4 + 0],
    x = n[3 * 4 + 1],
    p = n[3 * 4 + 2],
    v = n[3 * 4 + 3],
    M = h * v,
    E = p * g,
    q = u * v,
    T = p * f,
    O = u * g,
    H = h * f,
    F = r * v,
    A = p * i,
    _ = r * g,
    L = h * i,
    U = r * f,
    j = u * i,
    D = l * x,
    V = w * s,
    W = c * x,
    I = w * a,
    N = c * s,
    ie = l * a,
    ce = t * x,
    ae = w * o,
    ue = t * s,
    he = l * o,
    se = t * a,
    fe = c * o,
    ve = M * a + T * s + O * x - (E * a + q * s + H * x),
    me = E * o + F * s + L * x - (M * o + A * s + _ * x),
    $e = q * o + A * a + U * x - (T * o + F * a + j * x),
    Ce = H * o + _ * a + j * s - (O * o + L * a + U * s),
    G = 1 / (t * ve + c * me + l * $e + w * Ce);
  return (
    (e[0] = G * ve),
    (e[1] = G * me),
    (e[2] = G * $e),
    (e[3] = G * Ce),
    (e[4] = G * (E * c + q * l + H * w - (M * c + T * l + O * w))),
    (e[5] = G * (M * t + A * l + _ * w - (E * t + F * l + L * w))),
    (e[6] = G * (T * t + F * c + j * w - (q * t + A * c + U * w))),
    (e[7] = G * (O * t + L * c + U * l - (H * t + _ * c + j * l))),
    (e[8] = G * (D * f + I * g + N * v - (V * f + W * g + ie * v))),
    (e[9] = G * (V * i + ce * g + he * v - (D * i + ae * g + ue * v))),
    (e[10] = G * (W * i + ae * f + se * v - (I * i + ce * f + fe * v))),
    (e[11] = G * (ie * i + ue * f + fe * g - (N * i + he * f + se * g))),
    (e[12] = G * (W * h + ie * p + V * u - (N * p + D * u + I * h))),
    (e[13] = G * (ue * p + D * r + ae * h - (ce * h + he * p + V * r))),
    (e[14] = G * (ce * u + fe * p + I * r - (se * p + W * r + ae * u))),
    (e[15] = G * (se * h + N * r + he * u - (ue * u + fe * h + ie * r))),
    e
  );
}
function Zt(n) {
  const e = n[0],
    t = n[0 * 4 + 1],
    o = n[0 * 4 + 2],
    r = n[0 * 4 + 3],
    i = n[1 * 4 + 0],
    c = n[1 * 4 + 1],
    a = n[1 * 4 + 2],
    u = n[1 * 4 + 3],
    f = n[2 * 4 + 0],
    l = n[2 * 4 + 1],
    s = n[2 * 4 + 2],
    h = n[2 * 4 + 3],
    g = n[3 * 4 + 0],
    w = n[3 * 4 + 1],
    x = n[3 * 4 + 2],
    p = n[3 * 4 + 3],
    v = s * p,
    M = x * h,
    E = a * p,
    q = x * u,
    T = a * h,
    O = s * u,
    H = o * p,
    F = x * r,
    A = o * h,
    _ = s * r,
    L = o * u,
    U = a * r,
    j = v * c + q * l + T * w - (M * c + E * l + O * w),
    D = M * t + H * l + _ * w - (v * t + F * l + A * w),
    V = E * t + F * c + L * w - (q * t + H * c + U * w),
    W = O * t + A * c + U * l - (T * t + _ * c + L * l);
  return e * j + i * D + f * V + g * W;
}
const Qt = en;
function nn(n, e, t) {
  t = t || new $(16);
  const o = n[0],
    r = n[1],
    i = n[2],
    c = n[3],
    a = n[4],
    u = n[5],
    f = n[6],
    l = n[7],
    s = n[8],
    h = n[9],
    g = n[10],
    w = n[11],
    x = n[12],
    p = n[13],
    v = n[14],
    M = n[15],
    E = e[0],
    q = e[1],
    T = e[2],
    O = e[3],
    H = e[4],
    F = e[5],
    A = e[6],
    _ = e[7],
    L = e[8],
    U = e[9],
    j = e[10],
    D = e[11],
    V = e[12],
    W = e[13],
    I = e[14],
    N = e[15];
  return (
    (t[0] = o * E + a * q + s * T + x * O),
    (t[1] = r * E + u * q + h * T + p * O),
    (t[2] = i * E + f * q + g * T + v * O),
    (t[3] = c * E + l * q + w * T + M * O),
    (t[4] = o * H + a * F + s * A + x * _),
    (t[5] = r * H + u * F + h * A + p * _),
    (t[6] = i * H + f * F + g * A + v * _),
    (t[7] = c * H + l * F + w * A + M * _),
    (t[8] = o * L + a * U + s * j + x * D),
    (t[9] = r * L + u * U + h * j + p * D),
    (t[10] = i * L + f * U + g * j + v * D),
    (t[11] = c * L + l * U + w * j + M * D),
    (t[12] = o * V + a * W + s * I + x * N),
    (t[13] = r * V + u * W + h * I + p * N),
    (t[14] = i * V + f * W + g * I + v * N),
    (t[15] = c * V + l * W + w * I + M * N),
    t
  );
}
const Jt = nn;
function kt(n, e, t) {
  return (
    (t = t || de()),
    n !== t &&
      ((t[0] = n[0]),
      (t[1] = n[1]),
      (t[2] = n[2]),
      (t[3] = n[3]),
      (t[4] = n[4]),
      (t[5] = n[5]),
      (t[6] = n[6]),
      (t[7] = n[7]),
      (t[8] = n[8]),
      (t[9] = n[9]),
      (t[10] = n[10]),
      (t[11] = n[11])),
    (t[12] = e[0]),
    (t[13] = e[1]),
    (t[14] = e[2]),
    (t[15] = 1),
    t
  );
}
function dt(n, e) {
  return (e = e || Y()), (e[0] = n[12]), (e[1] = n[13]), (e[2] = n[14]), e;
}
function eo(n, e, t) {
  t = t || Y();
  const o = e * 4;
  return (t[0] = n[o + 0]), (t[1] = n[o + 1]), (t[2] = n[o + 2]), t;
}
function no(n, e, t, o) {
  o !== n && (o = ye(n, o));
  const r = t * 4;
  return (o[r + 0] = e[0]), (o[r + 1] = e[1]), (o[r + 2] = e[2]), o;
}
function to(n, e) {
  e = e || Y();
  const t = n[0],
    o = n[1],
    r = n[2],
    i = n[4],
    c = n[5],
    a = n[6],
    u = n[8],
    f = n[9],
    l = n[10];
  return (
    (e[0] = Math.sqrt(t * t + o * o + r * r)),
    (e[1] = Math.sqrt(i * i + c * c + a * a)),
    (e[2] = Math.sqrt(u * u + f * f + l * l)),
    e
  );
}
function oo(n, e, t, o, r) {
  r = r || new $(16);
  const i = Math.tan(Math.PI * 0.5 - 0.5 * n);
  if (
    ((r[0] = i / e),
    (r[1] = 0),
    (r[2] = 0),
    (r[3] = 0),
    (r[4] = 0),
    (r[5] = i),
    (r[6] = 0),
    (r[7] = 0),
    (r[8] = 0),
    (r[9] = 0),
    (r[11] = -1),
    (r[12] = 0),
    (r[13] = 0),
    (r[15] = 0),
    o === 1 / 0)
  )
    (r[10] = -1), (r[14] = -t);
  else {
    const c = 1 / (t - o);
    (r[10] = o * c), (r[14] = o * t * c);
  }
  return r;
}
function ro(n, e, t, o, r, i, c) {
  return (
    (c = c || new $(16)),
    (c[0] = 2 / (e - n)),
    (c[1] = 0),
    (c[2] = 0),
    (c[3] = 0),
    (c[4] = 0),
    (c[5] = 2 / (o - t)),
    (c[6] = 0),
    (c[7] = 0),
    (c[8] = 0),
    (c[9] = 0),
    (c[10] = 1 / (r - i)),
    (c[11] = 0),
    (c[12] = (e + n) / (n - e)),
    (c[13] = (o + t) / (t - o)),
    (c[14] = r / (r - i)),
    (c[15] = 1),
    c
  );
}
function io(n, e, t, o, r, i, c) {
  c = c || new $(16);
  const a = e - n,
    u = o - t,
    f = r - i;
  return (
    (c[0] = (2 * r) / a),
    (c[1] = 0),
    (c[2] = 0),
    (c[3] = 0),
    (c[4] = 0),
    (c[5] = (2 * r) / u),
    (c[6] = 0),
    (c[7] = 0),
    (c[8] = (n + e) / a),
    (c[9] = (o + t) / u),
    (c[10] = i / f),
    (c[11] = -1),
    (c[12] = 0),
    (c[13] = 0),
    (c[14] = (r * i) / f),
    (c[15] = 0),
    c
  );
}
let S, P, C;
function co(n, e, t, o) {
  return (
    (o = o || new $(16)),
    (S = S || Y()),
    (P = P || Y()),
    (C = C || Y()),
    Q(oe(e, n, C), C),
    Q(k(t, C, S), S),
    Q(k(C, S, P), P),
    (o[0] = S[0]),
    (o[1] = S[1]),
    (o[2] = S[2]),
    (o[3] = 0),
    (o[4] = P[0]),
    (o[5] = P[1]),
    (o[6] = P[2]),
    (o[7] = 0),
    (o[8] = C[0]),
    (o[9] = C[1]),
    (o[10] = C[2]),
    (o[11] = 0),
    (o[12] = n[0]),
    (o[13] = n[1]),
    (o[14] = n[2]),
    (o[15] = 1),
    o
  );
}
function ao(n, e, t, o) {
  return (
    (o = o || new $(16)),
    (S = S || Y()),
    (P = P || Y()),
    (C = C || Y()),
    Q(oe(n, e, C), C),
    Q(k(t, C, S), S),
    Q(k(C, S, P), P),
    (o[0] = S[0]),
    (o[1] = S[1]),
    (o[2] = S[2]),
    (o[3] = 0),
    (o[4] = P[0]),
    (o[5] = P[1]),
    (o[6] = P[2]),
    (o[7] = 0),
    (o[8] = C[0]),
    (o[9] = C[1]),
    (o[10] = C[2]),
    (o[11] = 0),
    (o[12] = n[0]),
    (o[13] = n[1]),
    (o[14] = n[2]),
    (o[15] = 1),
    o
  );
}
function uo(n, e, t, o) {
  return (
    (o = o || new $(16)),
    (S = S || Y()),
    (P = P || Y()),
    (C = C || Y()),
    Q(oe(n, e, C), C),
    Q(k(t, C, S), S),
    Q(k(C, S, P), P),
    (o[0] = S[0]),
    (o[1] = P[0]),
    (o[2] = C[0]),
    (o[3] = 0),
    (o[4] = S[1]),
    (o[5] = P[1]),
    (o[6] = C[1]),
    (o[7] = 0),
    (o[8] = S[2]),
    (o[9] = P[2]),
    (o[10] = C[2]),
    (o[11] = 0),
    (o[12] = -(S[0] * n[0] + S[1] * n[1] + S[2] * n[2])),
    (o[13] = -(P[0] * n[0] + P[1] * n[1] + P[2] * n[2])),
    (o[14] = -(C[0] * n[0] + C[1] * n[1] + C[2] * n[2])),
    (o[15] = 1),
    o
  );
}
function ho(n, e) {
  return (
    (e = e || new $(16)),
    (e[0] = 1),
    (e[1] = 0),
    (e[2] = 0),
    (e[3] = 0),
    (e[4] = 0),
    (e[5] = 1),
    (e[6] = 0),
    (e[7] = 0),
    (e[8] = 0),
    (e[9] = 0),
    (e[10] = 1),
    (e[11] = 0),
    (e[12] = n[0]),
    (e[13] = n[1]),
    (e[14] = n[2]),
    (e[15] = 1),
    e
  );
}
function so(n, e, t) {
  t = t || new $(16);
  const o = e[0],
    r = e[1],
    i = e[2],
    c = n[0],
    a = n[1],
    u = n[2],
    f = n[3],
    l = n[1 * 4 + 0],
    s = n[1 * 4 + 1],
    h = n[1 * 4 + 2],
    g = n[1 * 4 + 3],
    w = n[2 * 4 + 0],
    x = n[2 * 4 + 1],
    p = n[2 * 4 + 2],
    v = n[2 * 4 + 3],
    M = n[3 * 4 + 0],
    E = n[3 * 4 + 1],
    q = n[3 * 4 + 2],
    T = n[3 * 4 + 3];
  return (
    n !== t &&
      ((t[0] = c),
      (t[1] = a),
      (t[2] = u),
      (t[3] = f),
      (t[4] = l),
      (t[5] = s),
      (t[6] = h),
      (t[7] = g),
      (t[8] = w),
      (t[9] = x),
      (t[10] = p),
      (t[11] = v)),
    (t[12] = c * o + l * r + w * i + M),
    (t[13] = a * o + s * r + x * i + E),
    (t[14] = u * o + h * r + p * i + q),
    (t[15] = f * o + g * r + v * i + T),
    t
  );
}
function fo(n, e) {
  e = e || new $(16);
  const t = Math.cos(n),
    o = Math.sin(n);
  return (
    (e[0] = 1),
    (e[1] = 0),
    (e[2] = 0),
    (e[3] = 0),
    (e[4] = 0),
    (e[5] = t),
    (e[6] = o),
    (e[7] = 0),
    (e[8] = 0),
    (e[9] = -o),
    (e[10] = t),
    (e[11] = 0),
    (e[12] = 0),
    (e[13] = 0),
    (e[14] = 0),
    (e[15] = 1),
    e
  );
}
function lo(n, e, t) {
  t = t || new $(16);
  const o = n[4],
    r = n[5],
    i = n[6],
    c = n[7],
    a = n[8],
    u = n[9],
    f = n[10],
    l = n[11],
    s = Math.cos(e),
    h = Math.sin(e);
  return (
    (t[4] = s * o + h * a),
    (t[5] = s * r + h * u),
    (t[6] = s * i + h * f),
    (t[7] = s * c + h * l),
    (t[8] = s * a - h * o),
    (t[9] = s * u - h * r),
    (t[10] = s * f - h * i),
    (t[11] = s * l - h * c),
    n !== t &&
      ((t[0] = n[0]),
      (t[1] = n[1]),
      (t[2] = n[2]),
      (t[3] = n[3]),
      (t[12] = n[12]),
      (t[13] = n[13]),
      (t[14] = n[14]),
      (t[15] = n[15])),
    t
  );
}
function po(n, e) {
  e = e || new $(16);
  const t = Math.cos(n),
    o = Math.sin(n);
  return (
    (e[0] = t),
    (e[1] = 0),
    (e[2] = -o),
    (e[3] = 0),
    (e[4] = 0),
    (e[5] = 1),
    (e[6] = 0),
    (e[7] = 0),
    (e[8] = o),
    (e[9] = 0),
    (e[10] = t),
    (e[11] = 0),
    (e[12] = 0),
    (e[13] = 0),
    (e[14] = 0),
    (e[15] = 1),
    e
  );
}
function go(n, e, t) {
  t = t || new $(16);
  const o = n[0 * 4 + 0],
    r = n[0 * 4 + 1],
    i = n[0 * 4 + 2],
    c = n[0 * 4 + 3],
    a = n[2 * 4 + 0],
    u = n[2 * 4 + 1],
    f = n[2 * 4 + 2],
    l = n[2 * 4 + 3],
    s = Math.cos(e),
    h = Math.sin(e);
  return (
    (t[0] = s * o - h * a),
    (t[1] = s * r - h * u),
    (t[2] = s * i - h * f),
    (t[3] = s * c - h * l),
    (t[8] = s * a + h * o),
    (t[9] = s * u + h * r),
    (t[10] = s * f + h * i),
    (t[11] = s * l + h * c),
    n !== t &&
      ((t[4] = n[4]),
      (t[5] = n[5]),
      (t[6] = n[6]),
      (t[7] = n[7]),
      (t[12] = n[12]),
      (t[13] = n[13]),
      (t[14] = n[14]),
      (t[15] = n[15])),
    t
  );
}
function wo(n, e) {
  e = e || new $(16);
  const t = Math.cos(n),
    o = Math.sin(n);
  return (
    (e[0] = t),
    (e[1] = o),
    (e[2] = 0),
    (e[3] = 0),
    (e[4] = -o),
    (e[5] = t),
    (e[6] = 0),
    (e[7] = 0),
    (e[8] = 0),
    (e[9] = 0),
    (e[10] = 1),
    (e[11] = 0),
    (e[12] = 0),
    (e[13] = 0),
    (e[14] = 0),
    (e[15] = 1),
    e
  );
}
function xo(n, e, t) {
  t = t || new $(16);
  const o = n[0 * 4 + 0],
    r = n[0 * 4 + 1],
    i = n[0 * 4 + 2],
    c = n[0 * 4 + 3],
    a = n[1 * 4 + 0],
    u = n[1 * 4 + 1],
    f = n[1 * 4 + 2],
    l = n[1 * 4 + 3],
    s = Math.cos(e),
    h = Math.sin(e);
  return (
    (t[0] = s * o + h * a),
    (t[1] = s * r + h * u),
    (t[2] = s * i + h * f),
    (t[3] = s * c + h * l),
    (t[4] = s * a - h * o),
    (t[5] = s * u - h * r),
    (t[6] = s * f - h * i),
    (t[7] = s * l - h * c),
    n !== t &&
      ((t[8] = n[8]),
      (t[9] = n[9]),
      (t[10] = n[10]),
      (t[11] = n[11]),
      (t[12] = n[12]),
      (t[13] = n[13]),
      (t[14] = n[14]),
      (t[15] = n[15])),
    t
  );
}
function tn(n, e, t) {
  t = t || new $(16);
  let o = n[0],
    r = n[1],
    i = n[2];
  const c = Math.sqrt(o * o + r * r + i * i);
  (o /= c), (r /= c), (i /= c);
  const a = o * o,
    u = r * r,
    f = i * i,
    l = Math.cos(e),
    s = Math.sin(e),
    h = 1 - l;
  return (
    (t[0] = a + (1 - a) * l),
    (t[1] = o * r * h + i * s),
    (t[2] = o * i * h - r * s),
    (t[3] = 0),
    (t[4] = o * r * h - i * s),
    (t[5] = u + (1 - u) * l),
    (t[6] = r * i * h + o * s),
    (t[7] = 0),
    (t[8] = o * i * h + r * s),
    (t[9] = r * i * h - o * s),
    (t[10] = f + (1 - f) * l),
    (t[11] = 0),
    (t[12] = 0),
    (t[13] = 0),
    (t[14] = 0),
    (t[15] = 1),
    t
  );
}
const yo = tn;
function on(n, e, t, o) {
  o = o || new $(16);
  let r = e[0],
    i = e[1],
    c = e[2];
  const a = Math.sqrt(r * r + i * i + c * c);
  (r /= a), (i /= a), (c /= a);
  const u = r * r,
    f = i * i,
    l = c * c,
    s = Math.cos(t),
    h = Math.sin(t),
    g = 1 - s,
    w = u + (1 - u) * s,
    x = r * i * g + c * h,
    p = r * c * g - i * h,
    v = r * i * g - c * h,
    M = f + (1 - f) * s,
    E = i * c * g + r * h,
    q = r * c * g + i * h,
    T = i * c * g - r * h,
    O = l + (1 - l) * s,
    H = n[0],
    F = n[1],
    A = n[2],
    _ = n[3],
    L = n[4],
    U = n[5],
    j = n[6],
    D = n[7],
    V = n[8],
    W = n[9],
    I = n[10],
    N = n[11];
  return (
    (o[0] = w * H + x * L + p * V),
    (o[1] = w * F + x * U + p * W),
    (o[2] = w * A + x * j + p * I),
    (o[3] = w * _ + x * D + p * N),
    (o[4] = v * H + M * L + E * V),
    (o[5] = v * F + M * U + E * W),
    (o[6] = v * A + M * j + E * I),
    (o[7] = v * _ + M * D + E * N),
    (o[8] = q * H + T * L + O * V),
    (o[9] = q * F + T * U + O * W),
    (o[10] = q * A + T * j + O * I),
    (o[11] = q * _ + T * D + O * N),
    n !== o &&
      ((o[12] = n[12]), (o[13] = n[13]), (o[14] = n[14]), (o[15] = n[15])),
    o
  );
}
const Mo = on;
function vo(n, e) {
  return (
    (e = e || new $(16)),
    (e[0] = n[0]),
    (e[1] = 0),
    (e[2] = 0),
    (e[3] = 0),
    (e[4] = 0),
    (e[5] = n[1]),
    (e[6] = 0),
    (e[7] = 0),
    (e[8] = 0),
    (e[9] = 0),
    (e[10] = n[2]),
    (e[11] = 0),
    (e[12] = 0),
    (e[13] = 0),
    (e[14] = 0),
    (e[15] = 1),
    e
  );
}
function mo(n, e, t) {
  t = t || new $(16);
  const o = e[0],
    r = e[1],
    i = e[2];
  return (
    (t[0] = o * n[0 * 4 + 0]),
    (t[1] = o * n[0 * 4 + 1]),
    (t[2] = o * n[0 * 4 + 2]),
    (t[3] = o * n[0 * 4 + 3]),
    (t[4] = r * n[1 * 4 + 0]),
    (t[5] = r * n[1 * 4 + 1]),
    (t[6] = r * n[1 * 4 + 2]),
    (t[7] = r * n[1 * 4 + 3]),
    (t[8] = i * n[2 * 4 + 0]),
    (t[9] = i * n[2 * 4 + 1]),
    (t[10] = i * n[2 * 4 + 2]),
    (t[11] = i * n[2 * 4 + 3]),
    n !== t &&
      ((t[12] = n[12]), (t[13] = n[13]), (t[14] = n[14]), (t[15] = n[15])),
    t
  );
}
function $o(n, e) {
  return (
    (e = e || new $(16)),
    (e[0] = n),
    (e[1] = 0),
    (e[2] = 0),
    (e[3] = 0),
    (e[4] = 0),
    (e[5] = n),
    (e[6] = 0),
    (e[7] = 0),
    (e[8] = 0),
    (e[9] = 0),
    (e[10] = n),
    (e[11] = 0),
    (e[12] = 0),
    (e[13] = 0),
    (e[14] = 0),
    (e[15] = 1),
    e
  );
}
function Co(n, e, t) {
  return (
    (t = t || new $(16)),
    (t[0] = e * n[0 * 4 + 0]),
    (t[1] = e * n[0 * 4 + 1]),
    (t[2] = e * n[0 * 4 + 2]),
    (t[3] = e * n[0 * 4 + 3]),
    (t[4] = e * n[1 * 4 + 0]),
    (t[5] = e * n[1 * 4 + 1]),
    (t[6] = e * n[1 * 4 + 2]),
    (t[7] = e * n[1 * 4 + 3]),
    (t[8] = e * n[2 * 4 + 0]),
    (t[9] = e * n[2 * 4 + 1]),
    (t[10] = e * n[2 * 4 + 2]),
    (t[11] = e * n[2 * 4 + 3]),
    n !== t &&
      ((t[12] = n[12]), (t[13] = n[13]), (t[14] = n[14]), (t[15] = n[15])),
    t
  );
}
var Z = Object.freeze({
  __proto__: null,
  setDefaultType: Dt,
  create: bt,
  set: jt,
  fromMat3: Wt,
  fromQuat: Gt,
  negate: Nt,
  copy: ye,
  clone: Kt,
  equalsApproximately: It,
  equals: Xt,
  identity: de,
  transpose: Yt,
  inverse: en,
  determinant: Zt,
  invert: Qt,
  multiply: nn,
  mul: Jt,
  setTranslation: kt,
  getTranslation: dt,
  getAxis: eo,
  setAxis: no,
  getScaling: to,
  perspective: oo,
  ortho: ro,
  frustum: io,
  aim: co,
  cameraAim: ao,
  lookAt: uo,
  translation: ho,
  translate: so,
  rotationX: fo,
  rotateX: lo,
  rotationY: po,
  rotateY: go,
  rotationZ: wo,
  rotateZ: xo,
  axisRotation: tn,
  rotation: yo,
  axisRotate: on,
  rotate: Mo,
  scaling: vo,
  scale: mo,
  uniformScaling: $o,
  uniformScale: Co,
});
const rn = 11;
class So {
  constructor() {
    y(this, "vertices", []);
    y(this, "hasUpdated", !0);
  }
  setCache(e) {
    (this.vertices = e), (this.hasUpdated = !1);
  }
  getCache() {
    return this.vertices;
  }
  updated() {
    this.hasUpdated = !0;
  }
  shouldUpdate() {
    return this.hasUpdated;
  }
  getVertexCount() {
    return this.vertices.length / rn;
  }
}
class Me {
  constructor(e, t = new re()) {
    y(this, "pos");
    y(this, "color");
    y(this, "camera");
    y(this, "vertexCache");
    (this.pos = e),
      Po(this.pos),
      (this.color = t),
      (this.vertexCache = new So()),
      (this.camera = null);
  }
  setPos(e) {
    this.pos = e;
  }
  getPos() {
    return this.pos;
  }
  setCamera(e) {
    this.camera = e;
  }
  fill(e, t = 0, o) {
    const r = e.r - this.color.r,
      i = e.g - this.color.g,
      c = e.b - this.color.b,
      a = e.a - this.color.a,
      u = e.clone();
    return X(
      (f) => {
        (this.color.r += r * f),
          (this.color.g += i * f),
          (this.color.b += c * f),
          (this.color.a += a * f),
          this.vertexCache.updated();
      },
      () => {
        (this.color = u), this.vertexCache.updated();
      },
      t,
      o,
    );
  }
  getColor() {
    return this.color;
  }
  move(e, t = 0, o) {
    const r = R.create();
    return (
      R.add(r, this.pos, e),
      X(
        (i) => {
          const c = e[0] * i,
            a = e[1] * i,
            u = e[2] * i;
          R.add(this.pos, this.pos, K(c, a, u)), this.vertexCache.updated();
        },
        () => {
          (this.pos = r), this.vertexCache.updated();
        },
        t,
        o,
      )
    );
  }
  moveTo(e, t = 0, o) {
    const r = R.create();
    return (
      R.sub(r, e, this.pos),
      X(
        (i) => {
          const c = r[0] * i,
            a = r[1] * i,
            u = r[2] * i;
          R.add(this.pos, this.pos, K(c, a, u)), this.vertexCache.updated();
        },
        () => {
          (this.pos = e), this.vertexCache.updated();
        },
        t,
        o,
      )
    );
  }
}
class zo extends Me {
  constructor(t, o, r, i, c, a) {
    super(Ae(t), i);
    y(this, "width");
    y(this, "height");
    y(this, "rotation");
    y(this, "vertexColors");
    (this.width = o * devicePixelRatio),
      (this.height = r * devicePixelRatio),
      (this.rotation = c || 0),
      (this.vertexColors = a || {});
  }
  scaleWidth(t, o = 0, r) {
    const i = this.width * t,
      c = i - this.width;
    return X(
      (a) => {
        (this.width += c * a), this.vertexCache.updated();
      },
      () => {
        (this.width = i), this.vertexCache.updated();
      },
      o,
      r,
    );
  }
  scaleHeight(t, o = 0, r) {
    const i = this.height * t,
      c = i - this.height;
    return X(
      (a) => {
        (this.height += c * a), this.vertexCache.updated();
      },
      () => {
        (this.height = i), this.vertexCache.updated();
      },
      o,
      r,
    );
  }
  scale(t, o = 0, r) {
    const i = this.width * t,
      c = this.height * t,
      a = i - this.width,
      u = c - this.height;
    return X(
      (f) => {
        (this.width += a * f),
          (this.height += u * f),
          this.vertexCache.updated();
      },
      () => {
        (this.width = i), (this.height = c), this.vertexCache.updated();
      },
      o,
      r,
    );
  }
  setWidth(t, o = 0, r) {
    t *= devicePixelRatio;
    const i = t - this.width;
    return X(
      (c) => {
        (this.width += i * c), this.vertexCache.updated();
      },
      () => {
        (this.width = t), this.vertexCache.updated();
      },
      o,
      r,
    );
  }
  setHeight(t, o = 0, r) {
    t *= devicePixelRatio;
    const i = t - this.height;
    return X(
      (c) => {
        (this.height += i * c), this.vertexCache.updated();
      },
      () => {
        (this.height = t), this.vertexCache.updated();
      },
      o,
      r,
    );
  }
  rotate(t, o = 0, r) {
    const i = this.rotation + t;
    return X(
      (c) => {
        (this.rotation += t * c), this.vertexCache.updated();
      },
      () => {
        (this.rotation = i), this.vertexCache.updated();
      },
      o,
      r,
    );
  }
  setRotation(t, o = 0, r) {
    const i = t - this.rotation;
    return X(
      (c) => {
        (this.rotation += i * c), this.vertexCache.updated();
      },
      () => {
        (this.rotation = t), this.vertexCache.updated();
      },
      o,
      r,
    );
  }
  getBuffer(t, o) {
    const r = [];
    if (this.vertexCache.shouldUpdate() || o) {
      const i = [
        b(this.width / 2, this.height / 2),
        b(-this.width / 2, this.height / 2),
        b(-this.width / 2, -this.height / 2),
        b(this.width / 2, -this.height / 2),
      ].map((a) => {
        const u = Z.identity();
        Z.rotateZ(u, this.rotation, u), d.transformMat4(a, u, a);
        const f = b();
        return (
          d.clone(this.getPos(), f),
          (f[1] = t.getScreenSize()[1] - f[1]),
          d.add(f, b(this.width / 2, -this.height / 2), f),
          d.add(a, f, a),
          a
        );
      });
      return (
        [0, 1, 2, 0, 2, 3].forEach((a) => {
          let u = this.vertexColors[a];
          (u = u || this.getColor()), r.push(...Ao(Ae(i[a]), u));
        }),
        this.vertexCache.setCache(r),
        r
      );
    }
    return this.vertexCache.getCache();
  }
}
function Ao(n, e, t = b()) {
  return [...n, 1, ...e.toBuffer(), ...t, 0];
}
function K(n = 0, e = 0, t = 0) {
  return R.fromValues(n, e, t);
}
function b(n = 0, e = 0) {
  return d.fromValues(n, e, 0);
}
function Po(n) {
  R.mul(n, K(devicePixelRatio, devicePixelRatio, devicePixelRatio), n);
}
function Ae(n) {
  return K(n[0], n[1]);
}
function Eo(n, e, t, o) {
  return new re(n, e, t, o);
}
function qo(n, e) {
  return Eo(n, n, n, e);
}
const Pe = (n, e = 1, t = 500) => {
    const o = (2 * Math.PI) / 5;
    return Z.perspective(o, n, e, t);
  },
  To = (n, e, t) => {
    const o = Z.create(),
      r = Z.identity(),
      i = K();
    return (
      R.clone(n, i),
      R.scale(i, -1, i),
      Z.rotateZ(r, e[2], r),
      Z.rotateY(r, e[1], r),
      Z.rotateX(r, e[0], r),
      Z.translate(r, i, r),
      Z.multiply(t, r, o),
      o
    );
  },
  Ro = (n) => Z.ortho(0, n[0], 0, n[1], 0, 100),
  Ee = (n, e, t) =>
    n.createTexture({
      size: [e, t],
      format: "depth24plus",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    }),
  cn = (n, e, t) => {
    if (!e) throw J.error("Camera is not initialized in element");
    if (t instanceof Me) t.setCamera(e), n.push(t);
    else throw J.error("Cannot add invalid SimulationElement");
  };
class Vo {
  constructor() {}
  fmt(e) {
    return `SimJS: ${e}`;
  }
  log(e) {
    console.log(this.fmt(e));
  }
  error(e) {
    return new Error(this.fmt(e));
  }
  warn(e) {
    console.warn(this.fmt(e));
  }
  log_error(e) {
    console.error(this.fmt(e));
  }
}
const J = new Vo(),
  Bo = 44,
  Oo = 16,
  Fo = 32,
  Lo = 40,
  Uo = `
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
`,
  _o = `@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono&family=Roboto:wght@100&display=swap');

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
class Ho {
  constructor(e) {
    y(this, "el");
    y(this, "fpsBuffer", []);
    y(this, "maxFpsBufferLength", 8);
    (this.el = document.createElement("div")),
      this.el.classList.add("simjs-frame-rate");
    const t = document.createElement("style");
    (t.innerHTML = _o),
      e && (document.head.appendChild(t), document.body.appendChild(this.el));
  }
  updateFrameRate(e) {
    this.fpsBuffer.length < this.maxFpsBufferLength
      ? this.fpsBuffer.push(e)
      : (this.fpsBuffer.shift(), this.fpsBuffer.push(e));
    const t = Math.round(
      this.fpsBuffer.reduce((o, r) => o + r, 0) / this.fpsBuffer.length,
    );
    this.el.innerHTML = `${t} FPS`;
  }
}
class Do {
  constructor(e, t = null, o = !1) {
    y(this, "canvasRef", null);
    y(this, "bgColor", new re(255, 255, 255));
    y(this, "scene", []);
    y(this, "fittingElement", !1);
    y(this, "running", !0);
    y(this, "frameRateView");
    y(this, "camera");
    if (typeof e == "string") {
      const i = document.getElementById(e);
      if (i !== null) this.canvasRef = i;
      else throw J.error(`Cannot find canvas with id ${e}`);
    } else if (e instanceof HTMLCanvasElement) this.canvasRef = e;
    else throw J.error("Canvas ref/id provided is invalid");
    const r = this.canvasRef.parentElement;
    if ((t ? (this.camera = t) : (this.camera = new jo(K())), r === null))
      throw J.error("Canvas parent is null");
    addEventListener("resize", () => {
      if (this.fittingElement) {
        const i = r.clientWidth,
          c = r.clientHeight;
        this.setCanvasSize(i, c);
      }
    }),
      (this.frameRateView = new Ho(o)),
      this.frameRateView.updateFrameRate(1);
  }
  add(e) {
    cn(this.scene, this.camera, e);
  }
  setCanvasSize(e, t) {
    this.assertHasCanvas(),
      (this.canvasRef.width = e * devicePixelRatio),
      (this.canvasRef.height = t * devicePixelRatio),
      (this.canvasRef.style.width = e + "px"),
      (this.canvasRef.style.height = t + "px");
  }
  start() {
    (async () => {
      this.assertHasCanvas(), (this.running = !0);
      const e = await navigator.gpu.requestAdapter();
      if (!e) throw J.error("Adapter is null");
      const t = this.canvasRef.getContext("webgpu");
      if (!t) throw J.error("Context is null");
      const o = await e.requestDevice();
      t.configure({ device: o, format: "bgra8unorm" });
      const r = b(this.canvasRef.width, this.canvasRef.height);
      this.camera.setScreenSize(r), this.render(o, t);
    })();
  }
  stop() {
    this.running = !1;
  }
  setBackground(e) {
    this.bgColor = e;
  }
  render(e, t) {
    this.assertHasCanvas();
    const o = this.canvasRef;
    (o.width = o.clientWidth * devicePixelRatio),
      (o.height = o.clientHeight * devicePixelRatio);
    const r = navigator.gpu.getPreferredCanvasFormat(),
      i = e.createShaderModule({ code: Uo });
    t.configure({ device: e, format: r, alphaMode: "premultiplied" });
    const c = e.createRenderPipeline({
        layout: "auto",
        vertex: {
          module: i,
          entryPoint: "vertex_main",
          buffers: [
            {
              arrayStride: Bo,
              attributes: [
                { shaderLocation: 0, offset: 0, format: "float32x4" },
                { shaderLocation: 1, offset: Oo, format: "float32x4" },
                { shaderLocation: 2, offset: Fo, format: "float32x2" },
                { shaderLocation: 3, offset: Lo, format: "float32" },
              ],
            },
          ],
        },
        fragment: {
          module: i,
          entryPoint: "fragment_main",
          targets: [{ format: r }],
        },
        primitive: { topology: "triangle-list" },
        depthStencil: {
          depthWriteEnabled: !0,
          depthCompare: "less",
          format: "depth24plus",
        },
      }),
      a = 4 * 16 + 4 * 16 + 4 * 2 + 8,
      u = e.createBuffer({
        size: a,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      }),
      f = e.createBindGroup({
        layout: c.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: u } }],
      }),
      l = {
        view: void 0,
        clearValue: this.bgColor.toObject(),
        loadOp: "clear",
        storeOp: "store",
      };
    let s = o.width / o.height,
      h = Pe(s),
      g,
      w;
    const x = () => {
      g = To(this.camera.getPos(), this.camera.getRotation(), h);
    };
    x();
    const p = () => {
      w = Ro(this.camera.getScreenSize());
    };
    p();
    let v = Ee(e, o.width, o.height);
    const M = {
      colorAttachments: [l],
      depthStencilAttachment: {
        view: v.createView(),
        depthClearValue: 1,
        depthLoadOp: "clear",
        depthStoreOp: "store",
      },
    };
    let E = Date.now() - 10,
      q = 0;
    const T = () => {
      if (!this.running || !o) return;
      requestAnimationFrame(T);
      const O = Date.now(),
        H = Math.max(O - E, 1);
      E = O;
      const F = 1e3 / H;
      F === q && this.frameRateView.updateFrameRate(F),
        (q = F),
        (o.width = o.clientWidth * devicePixelRatio),
        (o.height = o.clientHeight * devicePixelRatio);
      const A = this.camera.getScreenSize();
      (A[0] !== o.width || A[1] !== o.height) &&
        (this.camera.setScreenSize(b(o.width, o.height)),
        (A[0] = o.width),
        (A[1] = o.height),
        (s = this.camera.getAspectRatio()),
        (h = Pe(s)),
        x(),
        (v = Ee(e, A[0], A[1])),
        (M.depthStencilAttachment.view = v.createView())),
        (M.colorAttachments[0].view = t.getCurrentTexture().createView()),
        this.camera.hasUpdated() && (p(), x()),
        e.queue.writeBuffer(u, 0, g.buffer, g.byteOffset, g.byteLength),
        e.queue.writeBuffer(u, 4 * 16, w.buffer, w.byteOffset, w.byteLength),
        e.queue.writeBuffer(
          u,
          4 * 16 + 4 * 16,
          A.buffer,
          A.byteOffset,
          A.byteLength,
        );
      const _ = [];
      this.scene.forEach((W) => {
        W.getBuffer(this.camera, this.camera.hasUpdated()).forEach((N) =>
          _.push(N),
        );
      }),
        this.camera.updateConsumed();
      const L = new Float32Array(_),
        U = e.createBuffer({
          size: L.byteLength,
          usage: GPUBufferUsage.VERTEX,
          mappedAtCreation: !0,
        });
      new Float32Array(U.getMappedRange()).set(L), U.unmap();
      const j = L.length / rn,
        D = e.createCommandEncoder(),
        V = D.beginRenderPass(M);
      V.setPipeline(c),
        V.setBindGroup(0, f),
        V.setVertexBuffer(0, U),
        V.draw(j),
        V.end(),
        e.queue.submit([D.finish()]);
    };
    requestAnimationFrame(T);
  }
  fitElement() {
    this.assertHasCanvas(), (this.fittingElement = !0);
    const e = this.canvasRef.parentElement;
    if (e !== null) {
      const t = e.clientWidth,
        o = e.clientHeight;
      this.setCanvasSize(t, o);
    }
  }
  assertHasCanvas() {
    if (this.canvasRef === null)
      throw J.error("cannot complete action, canvas is null");
  }
}
class bo extends Me {
  constructor(t) {
    super(K());
    y(this, "name");
    y(this, "scene");
    (this.name = t), (this.scene = []);
  }
  getName() {
    return this.name;
  }
  add(t) {
    cn(this.scene, this.camera, t);
  }
  empty() {
    this.scene = [];
  }
  getBuffer(t, o) {
    const r = [];
    return this.scene.forEach((i) => r.push(...i.getBuffer(t, o))), r;
  }
}
class jo {
  constructor(e, t = K()) {
    y(this, "pos");
    y(this, "rotation");
    y(this, "aspectRatio", 1);
    y(this, "updated");
    y(this, "screenSize", b());
    (this.pos = e), (this.updated = !1), (this.rotation = t);
  }
  setScreenSize(e) {
    (this.screenSize = e),
      (this.aspectRatio = e[0] / e[1]),
      (this.updated = !0);
  }
  getScreenSize() {
    return this.screenSize;
  }
  hasUpdated() {
    return this.updated;
  }
  updateConsumed() {
    this.updated = !1;
  }
  move(e, t = 0, o) {
    const r = K();
    return (
      R.clone(this.pos, r),
      X(
        (i) => {
          const c = e[0] * i,
            a = e[1] * i,
            u = e[2] * i,
            f = K(c, a, u);
          R.add(this.pos, f, this.pos);
        },
        () => {
          R.add(r, e, this.pos);
        },
        t,
        o,
      )
    );
  }
  moveTo(e, t = 0, o) {
    const r = K();
    return (
      R.sub(e, this.pos, r),
      X(
        (i) => {
          const c = r[0] * i,
            a = r[1] * i,
            u = r[2] * i,
            f = K(c, a, u);
          R.add(this.pos, f, this.pos);
        },
        () => {
          R.clone(e, this.pos);
        },
        t,
        o,
      )
    );
  }
  rotateTo(e, t = 0, o) {
    const r = R.clone(e);
    return (
      R.sub(r, r, this.rotation),
      X(
        (i) => {
          const c = r[0] * i,
            a = r[1] * i,
            u = r[2] * i;
          R.add(this.rotation, this.rotation, K(c, a, u)), (this.updated = !0);
        },
        () => {
          this.rotation = e;
        },
        t,
        o,
      )
    );
  }
  rotate(e, t = 0, o) {
    const r = K();
    return (
      R.clone(this.rotation, r),
      X(
        (i) => {
          const c = e[0] * i,
            a = e[1] * i,
            u = e[2] * i;
          R.add(this.rotation, K(c, a, u), this.rotation), (this.updated = !0);
        },
        () => {
          R.add(r, e, this.rotation);
        },
        t,
        o,
      )
    );
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
class re {
  constructor(e = 0, t = 0, o = 0, r = 1) {
    y(this, "r");
    y(this, "g");
    y(this, "b");
    y(this, "a");
    (this.r = e), (this.g = t), (this.b = o), (this.a = r);
  }
  clone() {
    return new re(this.r, this.g, this.b, this.a);
  }
  toBuffer() {
    return [this.r / 255, this.g / 255, this.b / 255, this.a];
  }
  toObject() {
    return { r: this.r / 255, g: this.g / 255, b: this.b / 255, a: this.a };
  }
}
function X(n, e, t, o) {
  return new Promise((r) => {
    if (t == 0) e(), r();
    else {
      let i = 0,
        c = Date.now();
      const a = (u, f) => {
        const l = f(u);
        n(l - i, u), (i = l);
        const s = Date.now();
        let h = s - c;
        h = h === 0 ? 1 : h;
        const w = 1 / (1e3 * (1 / h) * t);
        (c = s),
          u < 1 ? window.requestAnimationFrame(() => a(u + w, f)) : (e(), r());
      };
      a(0, o || Wo);
    }
  });
}
function Wo(n) {
  return n;
}
class Go {
  constructor(e) {
    y(this, "values");
    y(this, "connections");
    y(this, "kenFn");
    (this.connections = new Map()), (this.values = new Map()), (this.kenFn = e);
  }
  addConnection(e, t) {
    const o = this.kenFn(e),
      r = this.kenFn(t);
    this.values.set(o, e), this.values.set(r, t);
    const i = this.connections.get(o) || [];
    i.push(r), this.connections.set(o, i);
  }
  connectionsFromKey(e) {
    return this.connections.get(e);
  }
  fromKey(e) {
    return this.values.get(e);
  }
}
const an = (n, e) => e[0] * ((n - 1) / 2) + e[1],
  No = (n) => {
    const e = new Go((t) => an(n.length, t));
    for (let t = 1; t < n.length - 1; t += 2)
      for (let o = 1; o < n[t].length - 1; o += 2) {
        const r = b(t, o);
        t > 1 && e.addConnection(r, b(t - 2, o)),
          o > 1 && e.addConnection(r, b(t, o - 2)),
          t < n.length - 2 && e.addConnection(r, b(t + 2, o)),
          o < n[t].length - 2 && e.addConnection(r, b(t, o + 2));
      }
    return e;
  },
  Ko = (n, e) =>
    Array(e)
      .fill([])
      .map(() => Array(n).fill(0)),
  Io = (n, e, t) => n.connectionsFromKey(e).filter((o) => !t.has(o)),
  Xo = (n) => (
    (n[1][0] = 1), (n[n.length - 2][n[n.length - 1].length - 1] = 1), n
  ),
  Yo = (n) => n.map((e) => [...e]),
  Zo = (n, e, t, o) => {
    const r = Ko(n, e),
      i = 10,
      c = No(r),
      a = new Set();
    let u = [an(n, b(1, 1))],
      f = 0;
    for (let l = 0; l < n * e && u.length !== 0; l++) {
      const s = u[u.length - 2],
        h = u[u.length - 1];
      a.add(h);
      const g = c.fromKey(h);
      if (((r[g[0]][g[1]] = 1), s)) {
        const x = c.fromKey(s),
          p = b((g[0] + x[0]) / 2, (g[1] + x[1]) / 2);
        r[p[0]][p[1]] = 1;
      }
      const w = Io(c, h, a);
      if (o) {
        const x = Yo(r);
        setTimeout(() => {
          t(x);
        }, f * i),
          w.length > 0 && f++;
      }
      if (w.length === 0) {
        u.pop();
        continue;
      }
      u.push(w[Math.floor(Math.random() * w.length)]);
    }
    Xo(r),
      setTimeout(
        () => {
          t(r);
        },
        o ? n * e * i : 0,
      );
  };
var Qo = Re("<div class=maze><button>Generate</button><canvas id=canvas>");
const Jo = (n) => {
  const e = new bo("squares"),
    t = (r) => {
      e.empty();
      for (let i = 0; i < r.length; i++)
        for (let c = 0; c < r[i].length; c++) {
          const a = new zo(
            b(i * n.squareSize, c * n.squareSize),
            n.squareSize,
            n.squareSize,
            qo(r[i][c] * 255),
          );
          e.add(a);
        }
    },
    o = () => {
      Zo(n.width, n.height, t, !1);
    };
  return (
    Mn(() => {
      const r = new Do("canvas");
      r.fitElement(), r.start(), r.add(e), o();
    }),
    (() => {
      var r = Qo(),
        i = r.firstChild;
      return (
        (i.$$click = o),
        mn((c) => {
          var a = `${n.height * n.squareSize}px`,
            u = `${n.width * n.squareSize}px`;
          return (
            a !== c.e &&
              ((c.e = a) != null
                ? r.style.setProperty("height", a)
                : r.style.removeProperty("height")),
            u !== c.t &&
              ((c.t = u) != null
                ? r.style.setProperty("width", u)
                : r.style.removeProperty("width")),
            c
          );
        }),
        r
      );
    })()
  );
};
vn(["click"]);
var ko = Re("<div class=root>");
const er = () =>
  (() => {
    var n = ko();
    return yn(n, Te(Jo, { height: 51, width: 51, squareSize: 10 })), n;
  })();
pn(Te(er, {}));
