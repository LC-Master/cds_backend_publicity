// @bun
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
function __accessProp(key) {
  return this[key];
}
var __toESMCache_node;
var __toESMCache_esm;
var __toESM = (mod, isNodeMode, target) => {
  var canCache = mod != null && typeof mod === "object";
  if (canCache) {
    var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
    var cached = cache.get(mod);
    if (cached)
      return cached;
  }
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: __accessProp.bind(mod, key),
        enumerable: true
      });
  if (canCache)
    cache.set(mod, to);
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __require = import.meta.require;

// node_modules/paseto/lib/errors.js
var require_errors = __commonJS((exports, module) => {
  var CODES = {
    PasetoNotSupported: "ERR_PASETO_NOT_SUPPORTED",
    PasetoDecryptionFailed: "ERR_PASETO_DECRYPTION_FAILED",
    PasetoInvalid: "ERR_PASETO_INVALID",
    PasetoVerificationFailed: "ERR_PASETO_VERIFICATION_FAILED",
    PasetoClaimInvalid: "ERR_PASETO_CLAIM_INVALID"
  };

  class PasetoError extends Error {
    constructor(message) {
      super(message);
      this.name = this.constructor.name;
      this.code = CODES[this.constructor.name];
      Error.captureStackTrace(this, this.constructor);
    }
  }
  exports.PasetoError = PasetoError;
  exports.PasetoNotSupported = class PasetoNotSupported extends PasetoError {
  };
  exports.PasetoDecryptionFailed = class PasetoDecryptionFailed extends PasetoError {
  };
  exports.PasetoInvalid = class PasetoInvalid extends PasetoError {
  };
  exports.PasetoVerificationFailed = class PasetoVerificationFailed extends PasetoError {
  };
  exports.PasetoClaimInvalid = class PasetoClaimInvalid extends PasetoError {
  };
});

// node_modules/paseto/lib/help/is_object.js
var require_is_object = __commonJS((exports, module) => {
  module.exports = (input) => !!input && input.constructor === Object;
});

// node_modules/paseto/lib/help/check_footer.js
var require_check_footer = __commonJS((exports, module) => {
  var isObject = require_is_object();
  module.exports = function checkFooter(footer) {
    if (typeof footer === "undefined") {
      return Buffer.from("");
    }
    if (Buffer.isBuffer(footer)) {
      return footer;
    }
    if (isObject(footer)) {
      return Buffer.from(JSON.stringify(footer), "utf8");
    }
    if (typeof footer !== "string") {
      throw new TypeError("options.footer must be a string, Buffer, or a plain object");
    }
    return Buffer.from(footer, "utf8");
  };
});

// node_modules/paseto/lib/help/ms.js
var require_ms = __commonJS((exports, module) => {
  var second = 1000;
  var minute = second * 60;
  var hour = minute * 60;
  var day = hour * 24;
  var week = day * 7;
  var year = day * 365.25;
  var REGEX = /^(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)$/i;
  module.exports = (str) => {
    const matched = REGEX.exec(str);
    if (!matched) {
      throw new TypeError(`invalid time period format ("${str}")`);
    }
    const value = parseFloat(matched[1]);
    const unit = matched[2].toLowerCase();
    switch (unit) {
      case "sec":
      case "secs":
      case "second":
      case "seconds":
      case "s":
        return Math.round(value * second);
      case "minute":
      case "minutes":
      case "min":
      case "mins":
      case "m":
        return Math.round(value * minute);
      case "hour":
      case "hours":
      case "hr":
      case "hrs":
      case "h":
        return Math.round(value * hour);
      case "day":
      case "days":
      case "d":
        return Math.round(value * day);
      case "week":
      case "weeks":
      case "w":
        return Math.round(value * week);
      case "year":
      case "years":
      case "yr":
      case "yrs":
      case "y":
        return Math.round(value * year);
    }
  };
});

// node_modules/paseto/lib/help/apply_options.js
var require_apply_options = __commonJS((exports, module) => {
  var ms = require_ms();
  module.exports = ({ audience, expiresIn, iat = true, issuer, jti, kid, notBefore, now = new Date, subject }, payload) => {
    if (!(now instanceof Date) || !now.getTime()) {
      throw new TypeError("options.now must be a valid Date object");
    }
    const unix = now.getTime();
    if (iat !== undefined) {
      if (typeof iat !== "boolean") {
        throw new TypeError("options.iat must be a boolean");
      }
      if (iat) {
        payload.iat = new Date(unix);
      }
    }
    if (expiresIn !== undefined) {
      if (typeof expiresIn !== "string") {
        throw new TypeError("options.expiresIn must be a string");
      }
      payload.exp = new Date(unix + ms(expiresIn));
    }
    if (notBefore !== undefined) {
      if (typeof notBefore !== "string") {
        throw new TypeError("options.notBefore must be a string");
      }
      payload.nbf = new Date(unix + ms(notBefore));
    }
    if (audience !== undefined) {
      if (typeof audience !== "string") {
        throw new TypeError("options.audience must be a string");
      }
      payload.aud = audience;
    }
    if (issuer !== undefined) {
      if (typeof issuer !== "string") {
        throw new TypeError("options.issuer must be a string");
      }
      payload.iss = issuer;
    }
    if (subject !== undefined) {
      if (typeof subject !== "string") {
        throw new TypeError("options.subject must be a string");
      }
      payload.sub = subject;
    }
    if (kid !== undefined) {
      if (typeof kid !== "string") {
        throw new TypeError("options.kid must be a string");
      }
      payload.kid = kid;
    }
    if (jti !== undefined) {
      if (typeof jti !== "string") {
        throw new TypeError("options.jti must be a string");
      }
      payload.jti = jti;
    }
    return payload;
  };
});

// node_modules/paseto/lib/help/check_payload.js
var require_check_payload = __commonJS((exports, module) => {
  var applyOptions = require_apply_options();
  var isObject = require_is_object();
  var deepClone = (payload) => JSON.parse(JSON.stringify(payload));
  module.exports = (payload, options) => {
    if (Buffer.isBuffer(payload)) {
      if (Object.keys(options).length !== 0) {
        throw new TypeError("options cannot contain claims when payload is a Buffer");
      }
      return payload;
    }
    if (!isObject(payload)) {
      throw new TypeError("payload must be a Buffer or a plain object");
    }
    payload = deepClone(payload);
    payload = applyOptions(options, payload);
    return Buffer.from(JSON.stringify(payload), "utf-8");
  };
});

// node_modules/paseto/lib/help/le64.js
var require_le64 = __commonJS((exports, module) => {
  var { PasetoNotSupported } = require_errors();
  module.exports = (n) => {
    if (!Number.isSafeInteger(n)) {
      throw new PasetoNotSupported("message is too long for Node.js to safely process");
    }
    const up = ~~(n / 4294967295);
    const dn = n % 4294967295 - up;
    const buf = Buffer.allocUnsafe(8);
    buf.writeUInt32LE(up, 4);
    buf.writeUInt32LE(dn, 0);
    return buf;
  };
});

// node_modules/paseto/lib/help/pae.js
var require_pae = __commonJS((exports, module) => {
  var le64 = require_le64();
  module.exports = (...pieces) => {
    pieces = pieces.filter(Boolean);
    let accumulator = le64(pieces.length);
    for (let piece of pieces) {
      piece = Buffer.from(piece, "utf8");
      const len = le64(Buffer.byteLength(piece));
      accumulator = Buffer.concat([accumulator, len, piece]);
    }
    return accumulator;
  };
});

// node_modules/paseto/lib/help/base64url.js
var require_base64url = __commonJS((exports, module) => {
  exports.encode = (input) => input.toString("base64url");
  exports.decode = (input) => Buffer.from(input, "base64");
});

// node_modules/paseto/lib/help/pack.js
var require_pack = __commonJS((exports, module) => {
  var { encode } = require_base64url();
  module.exports = function pack(header, footer, ...payload) {
    let token = `${header}${encode(Buffer.concat(payload))}`;
    if (footer.byteLength) {
      token += `.${encode(footer)}`;
    }
    return token;
  };
});

// node_modules/paseto/lib/help/timing_safe_equal.js
var require_timing_safe_equal = __commonJS((exports, module) => {
  var { timingSafeEqual: TSE } = __require("crypto");
  var paddedBuffer = (input, length) => {
    if (input.length === length) {
      return input;
    }
    const buffer = Buffer.alloc(length);
    input.copy(buffer);
    return buffer;
  };
  var timingSafeEqual = (a, b) => {
    const length = Math.max(a.length, b.length);
    return TSE(paddedBuffer(a, length), paddedBuffer(b, length));
  };
  module.exports = timingSafeEqual;
});

// node_modules/paseto/lib/help/crypto_worker.js
var require_crypto_worker = __commonJS((exports, module) => {
  var crypto = __require("crypto");
  var util = __require("util");
  var pae = require_pae();
  var pack = require_pack();
  var { PasetoDecryptionFailed } = require_errors();
  var timingSafeEqual = require_timing_safe_equal();
  var {
    webcrypto: { subtle }
  } = crypto;
  var hkdf = util.promisify(crypto.hkdf);
  var EK_INFO = Buffer.from("paseto-encryption-key");
  var AK_INFO = Buffer.from("paseto-auth-key-for-aead");
  var EMPTY = Buffer.alloc(0);
  async function v1encrypt(m, f, k) {
    const h = "v1.local.";
    const n = hmac(m, crypto.randomBytes(32)).subarray(0, 32);
    const salt = n.subarray(0, 16);
    const [ek, ak] = await Promise.all([
      hkdf("sha384", k, salt, EK_INFO, 32).then(Buffer.from),
      hkdf("sha384", k, salt, AK_INFO, 32).then(Buffer.from)
    ]);
    const c = await encrypt(m, ek, n.subarray(16));
    const preAuth = pae(h, n, c, f);
    const t = hmac(preAuth, ak);
    return pack(h, f, n, c, t);
  }
  async function v1decrypt(raw, f, k) {
    const h = "v1.local.";
    const n = raw.subarray(0, 32);
    const t = raw.subarray(-48);
    const c = raw.subarray(32, -48);
    const salt = n.subarray(0, 16);
    const [ek, ak] = await Promise.all([
      hkdf("sha384", k, salt, EK_INFO, 32).then(Buffer.from),
      hkdf("sha384", k, salt, AK_INFO, 32).then(Buffer.from)
    ]);
    const preAuth = pae(h, n, c, f);
    const t2 = hmac(preAuth, ak);
    if (!timingSafeEqual(t, t2))
      throw new PasetoDecryptionFailed("decryption failed");
    const payload = await decrypt(c, ek, n.subarray(16));
    if (!payload)
      throw new PasetoDecryptionFailed("decryption failed");
    return payload;
  }
  async function v3encrypt(m, f, k, i) {
    const h = "v3.local.";
    const n = crypto.randomBytes(32);
    const [tmp, ak] = await Promise.all([
      hkdf("sha384", k, EMPTY, Buffer.concat([EK_INFO, n]), 48).then(Buffer.from),
      hkdf("sha384", k, EMPTY, Buffer.concat([AK_INFO, n]), 48).then(Buffer.from)
    ]);
    const ek = tmp.subarray(0, 32);
    const n2 = tmp.subarray(32);
    const c = await encrypt(m, ek, n2);
    const preAuth = pae(h, n, c, f, i);
    const t = hmac(preAuth, ak);
    return pack(h, f, n, c, t);
  }
  async function v3decrypt(raw, f, k, i) {
    const h = "v3.local.";
    const n = raw.subarray(0, 32);
    const t = raw.subarray(-48);
    const c = raw.subarray(32, -48);
    const [tmp, ak] = await Promise.all([
      hkdf("sha384", k, EMPTY, Buffer.concat([EK_INFO, n]), 48).then(Buffer.from),
      hkdf("sha384", k, EMPTY, Buffer.concat([AK_INFO, n]), 48).then(Buffer.from)
    ]);
    const ek = tmp.subarray(0, 32);
    const n2 = tmp.subarray(32);
    const preAuth = pae(h, n, c, f, i);
    const t2 = hmac(preAuth, ak);
    if (!timingSafeEqual(t, t2))
      throw new PasetoDecryptionFailed("decryption failed");
    const payload = await decrypt(c, ek, n2);
    if (!payload)
      throw new PasetoDecryptionFailed("decryption failed");
    return payload;
  }
  var hmac = (data, key) => crypto.createHmac("sha384", key).update(data).digest();
  var ctr = async (op, data, key, iv) => subtle[op]({ name: "AES-CTR", counter: iv, length: 16 }, await subtle.importKey("raw", key, "AES-CTR", false, [op]), data).then(Buffer.from);
  var encrypt = ctr.bind(undefined, "encrypt");
  var decrypt = ctr.bind(undefined, "decrypt");
  module.exports = {
    sign: util.promisify(crypto.sign),
    verify: util.promisify(crypto.verify),
    "v1.local-encrypt": v1encrypt,
    "v1.local-decrypt": v1decrypt,
    "v3.local-encrypt": v3encrypt,
    "v3.local-decrypt": v3decrypt
  };
});

// node_modules/paseto/lib/help/sign.js
var require_sign = __commonJS((exports, module) => {
  var { sign } = require_crypto_worker();
  var pae = require_pae();
  var pack = require_pack();
  module.exports = async function signPaseto(h, m, f, alg, key, i, eo) {
    const m2 = pae(eo, h, m, f, i);
    const sig = await sign(alg, m2, key);
    return pack(h, f, m, sig);
  };
});

// node_modules/paseto/lib/help/is_key_object.js
var require_is_key_object = __commonJS((exports, module) => {
  var { KeyObject } = __require("crypto");
  var { isKeyObject } = __require("util/types");
  if (!isKeyObject) {
    isKeyObject = (obj) => obj != null && obj instanceof KeyObject;
  }
  module.exports = isKeyObject;
});

// node_modules/paseto/lib/v1/sign.js
var require_sign2 = __commonJS((exports, module) => {
  var {
    constants: { RSA_PKCS1_PSS_PADDING: padding, RSA_PSS_SALTLEN_DIGEST: saltLength },
    createPrivateKey
  } = __require("crypto");
  var checkFooter = require_check_footer();
  var checkPayload = require_check_payload();
  var sign = require_sign();
  var isKeyObject = require_is_key_object();
  function checkKey(key) {
    if (typeof key === "string" && key.startsWith("k1.secret.")) {
      try {
        const der = Buffer.from(key.slice(10), "base64url");
        key = { key: der, format: "der", type: "pkcs1" };
      } catch {}
    }
    if (!isKeyObject(key)) {
      try {
        key = createPrivateKey(key);
      } catch {}
    }
    if (!isKeyObject(key)) {
      throw new TypeError("invalid key provided");
    }
    if (key.type !== "private" || key.asymmetricKeyType !== "rsa" || key.asymmetricKeyDetails.modulusLength !== 2048) {
      throw new TypeError("v1.public signing key must be a private RSA key with 2048 bit modulus length");
    }
    return key;
  }
  module.exports = async function v1Sign(payload, key, { footer, ...options } = {}) {
    const m = checkPayload(payload, options);
    const f = checkFooter(footer);
    key = checkKey(key);
    return sign("v1.public.", m, f, "sha384", { key, padding, saltLength });
  };
});

// node_modules/paseto/lib/help/assert_payload.js
var require_assert_payload = __commonJS((exports, module) => {
  var { PasetoClaimInvalid } = require_errors();
  var ms = require_ms();
  module.exports = ({
    ignoreExp,
    ignoreNbf,
    ignoreIat,
    maxTokenAge,
    subject,
    issuer,
    clockTolerance,
    audience,
    now = new Date
  }, payload) => {
    if (!(now instanceof Date) || !now.getTime()) {
      throw new TypeError("options.now must be a valid Date object");
    }
    const unix = now.getTime();
    if ("iss" in payload && typeof payload.iss !== "string") {
      throw new PasetoClaimInvalid("payload.iss must be a string");
    }
    if (issuer !== undefined) {
      if (typeof issuer !== "string") {
        throw new TypeError("options.issuer must be a string");
      }
      if (payload.iss !== issuer) {
        throw new PasetoClaimInvalid("issuer mismatch");
      }
    }
    if ("sub" in payload && typeof payload.sub !== "string") {
      throw new PasetoClaimInvalid("payload.sub must be a string");
    }
    if (subject !== undefined) {
      if (typeof subject !== "string") {
        throw new TypeError("options.subject must be a string");
      }
      if (payload.sub !== subject) {
        throw new PasetoClaimInvalid("subject mismatch");
      }
    }
    if ("aud" in payload && typeof payload.aud !== "string") {
      throw new PasetoClaimInvalid("payload.aud must be a string");
    }
    if (audience !== undefined) {
      if (typeof audience !== "string") {
        throw new TypeError("options.audience must be a string");
      }
      if (payload.aud !== audience) {
        throw new PasetoClaimInvalid("audience mismatch");
      }
    }
    if (clockTolerance !== undefined && typeof clockTolerance !== "string") {
      throw new TypeError("options.clockTolerance must be a string");
    }
    const tolerance = clockTolerance ? ms(clockTolerance) : 0;
    let iat;
    if ("iat" in payload) {
      if (typeof payload.iat !== "string") {
        throw new PasetoClaimInvalid("payload.iat must be a string");
      }
      iat = new Date(payload.iat).getTime();
      if (!iat) {
        throw new PasetoClaimInvalid("payload.iat must be a valid ISO8601 string");
      }
      if (!ignoreIat) {
        if (iat > unix + tolerance) {
          throw new PasetoClaimInvalid("token issued in the future");
        }
      }
    }
    if ("nbf" in payload) {
      if (typeof payload.nbf !== "string") {
        throw new PasetoClaimInvalid("payload.nbf must be a string");
      }
      const nbf = new Date(payload.nbf).getTime();
      if (!nbf) {
        throw new PasetoClaimInvalid("payload.nbf must be a valid ISO8601 string");
      }
      if (!ignoreNbf) {
        if (nbf > unix + tolerance) {
          throw new PasetoClaimInvalid("token is not active yet");
        }
      }
    }
    if ("exp" in payload) {
      if (typeof payload.exp !== "string") {
        throw new PasetoClaimInvalid("payload.exp must be a string");
      }
      const exp = new Date(payload.exp).getTime();
      if (!exp) {
        throw new PasetoClaimInvalid("payload.exp must be a valid ISO8601 string");
      }
      if (!ignoreExp) {
        if (exp <= unix - tolerance) {
          throw new PasetoClaimInvalid("token is expired");
        }
      }
    }
    if (maxTokenAge !== undefined) {
      if (typeof maxTokenAge !== "string") {
        throw new TypeError("options.maxTokenAge must be a string");
      }
      if (!("iat" in payload)) {
        throw new PasetoClaimInvalid("missing iat claim");
      }
      if (iat + ms(maxTokenAge) < unix + tolerance) {
        throw new PasetoClaimInvalid("maxTokenAge exceeded");
      }
    }
  };
});

// node_modules/paseto/lib/help/parse_paseto_payload.js
var require_parse_paseto_payload = __commonJS((exports, module) => {
  var { PasetoInvalid } = require_errors();
  var { strict: assert2 } = __require("assert");
  var isObject = require_is_object();
  module.exports = (payload) => {
    try {
      const parsed = JSON.parse(payload);
      assert2(isObject(parsed));
      return parsed;
    } catch {
      throw new PasetoInvalid("All PASETO payloads MUST be a JSON object");
    }
  };
});

// node_modules/paseto/lib/help/consume.js
var require_consume = __commonJS((exports, module) => {
  var assert2 = __require("assert");
  var { PasetoInvalid } = require_errors();
  var assertPayload = require_assert_payload();
  var { decode } = require_base64url();
  var parse = require_parse_paseto_payload();
  function pre(h, token) {
    if (typeof token !== "string") {
      throw new TypeError(`token must be a string, got: ${typeof token}`);
    }
    if (token.slice(0, h.length) !== h) {
      throw new PasetoInvalid(`token is not a ${h.slice(0, h.length - 1)} PASETO`);
    }
    let { 0: raw, 1: f = "", length } = token.slice(h.length).split(".");
    try {
      assert2(length <= 2);
      raw = decode(raw);
      f = decode(f);
    } catch {
      throw new PasetoInvalid("token is not a PASETO formatted value");
    }
    return { raw, f };
  }
  function post(version, buffer, options, complete, m, f, purpose) {
    if (buffer) {
      if (Object.keys(options).length !== 0) {
        throw new TypeError("options cannot contain claims when options.buffer is true");
      }
      if (complete) {
        return { payload: m, footer: f?.length ? f : undefined, version, purpose };
      }
      return m;
    }
    const payload = parse(m);
    assertPayload(options, payload);
    if (complete) {
      return { payload, footer: f?.length ? f : undefined, version, purpose };
    }
    return payload;
  }
  module.exports = {
    post,
    pre
  };
});

// node_modules/paseto/lib/help/verify.js
var require_verify = __commonJS((exports, module) => {
  var { PasetoVerificationFailed } = require_errors();
  var { verify } = require_crypto_worker();
  var pae = require_pae();
  var { pre } = require_consume();
  module.exports = async function verifyPaseto(h, token, alg, sigLength, key, i, eo) {
    const { raw, f } = pre(h, token);
    const m = raw.subarray(0, -sigLength);
    const s = raw.subarray(-sigLength);
    const m2 = pae(eo, h, m, f, i);
    if (!await verify(alg, m2, key, s)) {
      throw new PasetoVerificationFailed("invalid signature");
    }
    return {
      m,
      footer: f.length ? f : undefined
    };
  };
});

// node_modules/paseto/lib/v1/verify.js
var require_verify2 = __commonJS((exports, module) => {
  var {
    constants: { RSA_PKCS1_PSS_PADDING: padding, RSA_PSS_SALTLEN_DIGEST: saltLength },
    createPublicKey
  } = __require("crypto");
  var verify = require_verify();
  var isKeyObject = require_is_key_object();
  var { post } = require_consume();
  function checkKey(key) {
    if (typeof key === "string" && key.startsWith("k1.public.")) {
      try {
        const der = Buffer.from(key.slice(10), "base64url");
        key = { key: der, format: "der", type: "pkcs1" };
      } catch {}
    }
    if (!isKeyObject(key) || key.type === "private") {
      try {
        key = createPublicKey(key);
      } catch {}
    }
    if (!isKeyObject(key)) {
      throw new TypeError("invalid key provided");
    }
    if (key.type !== "public" || key.asymmetricKeyType !== "rsa" || key.asymmetricKeyDetails.modulusLength !== 2048) {
      throw new TypeError("v1.public verify key must be a public RSA key with 2048 bit modulus length");
    }
    return key;
  }
  module.exports = async function v1Verify(token, key, { complete = false, buffer = false, ...options } = {}) {
    key = checkKey(key);
    const { m, footer } = await verify("v1.public.", token, "sha384", 256, {
      key,
      padding,
      saltLength
    });
    return post("v1", buffer, options, complete, m, footer, "public");
  };
});

// node_modules/paseto/lib/help/symmetric_key_check.js
var require_symmetric_key_check = __commonJS((exports, module) => {
  var { createSecretKey } = __require("crypto");
  var isKeyObject = require_is_key_object();
  module.exports = function checkKey(header, key) {
    if (typeof key === "string" && key.startsWith(`k${header.slice(1)}`)) {
      key = Buffer.from(key.slice(header.length), "base64url");
    }
    if (!isKeyObject(key)) {
      try {
        key = createSecretKey(key);
      } catch {}
    }
    if (!isKeyObject(key)) {
      throw new TypeError("invalid key provided");
    }
    if (key.type !== "secret" || key.symmetricKeySize !== 32) {
      throw new TypeError(`${header} secret key must be 32 bytes long symmetric key`);
    }
    return key;
  };
});

// node_modules/paseto/lib/v1/encrypt.js
var require_encrypt = __commonJS((exports, module) => {
  var checkFooter = require_check_footer();
  var checkKey = require_symmetric_key_check().bind(undefined, "v1.local");
  var checkPayload = require_check_payload();
  var { "v1.local-encrypt": encrypt } = require_crypto_worker();
  module.exports = async function v1Encrypt(payload, key, { footer, ...options } = {}) {
    const m = checkPayload(payload, options);
    key = checkKey(key);
    const f = checkFooter(footer);
    const k = key.export();
    return encrypt(m, f, k);
  };
});

// node_modules/paseto/lib/v1/decrypt.js
var require_decrypt = __commonJS((exports, module) => {
  var { "v1.local-decrypt": decrypt } = require_crypto_worker();
  var checkKey = require_symmetric_key_check().bind(undefined, "v1.local");
  var { pre, post } = require_consume();
  var h = "v1.local.";
  module.exports = async function v1Decrypt(token, key, { complete = false, buffer = false, ...options } = {}) {
    const { raw, f } = pre(h, token);
    key = checkKey(key);
    const k = key.export();
    const m = await decrypt(raw, f, k);
    return post("v1", buffer, options, complete, m, f, "local");
  };
});

// node_modules/paseto/lib/v1/key.js
var require_key = __commonJS((exports, module) => {
  var crypto = __require("crypto");
  var { promisify } = __require("util");
  var { PasetoNotSupported } = require_errors();
  var generateKeyPair = promisify(crypto.generateKeyPair);
  var generateSecretKey = promisify(crypto.generateKey);
  async function generateKey(purpose, { format = "keyobject" } = {}) {
    if (format !== "keyobject" && format !== "paserk")
      throw new TypeError("invalid format");
    switch (purpose) {
      case "local": {
        const keyobject = await generateSecretKey("aes", { length: 256 });
        if (format === "paserk") {
          return `k1.local.${keyobject.export().toString("base64url")}`;
        }
        return keyobject;
      }
      case "public": {
        const { privateKey, publicKey } = await generateKeyPair("rsa", { modulusLength: 2048 });
        if (format === "paserk") {
          return {
            secretKey: `k1.secret.${privateKey.export({ format: "der", type: "pkcs1" }).toString("base64url")}`,
            publicKey: `k1.public.${publicKey.export({ format: "der", type: "pkcs1" }).toString("base64url")}`
          };
        }
        return privateKey;
      }
      default:
        throw new PasetoNotSupported("unsupported v1 purpose");
    }
  }
  module.exports = generateKey;
});

// node_modules/paseto/lib/v1/index.js
var require_v1 = __commonJS((exports, module) => {
  var sign = require_sign2();
  var verify = require_verify2();
  var encrypt = require_encrypt();
  var decrypt = require_decrypt();
  var generateKey = require_key();
  module.exports = { sign, verify, encrypt, decrypt, generateKey };
});

// node_modules/paseto/lib/v2/key.js
var require_key2 = __commonJS((exports, module) => {
  var assert2 = __require("assert");
  var crypto = __require("crypto");
  var { promisify } = __require("util");
  var { PasetoNotSupported } = require_errors();
  var isKeyObject = require_is_key_object();
  var generateKeyPair = promisify(crypto.generateKeyPair);
  function _checkPrivateKey(v, key) {
    if (typeof key === "string" && key.startsWith(`k${v.slice(1)}.secret.`)) {
      try {
        key = Buffer.from(key.slice(10), "base64url");
        assert2.strictEqual(key.byteLength, 64);
      } catch {}
    }
    if (Buffer.isBuffer(key)) {
      try {
        key = bytesToKeyObject(key);
      } catch {}
    }
    if (!isKeyObject(key)) {
      try {
        key = crypto.createPrivateKey(key);
      } catch {}
    }
    if (!isKeyObject(key)) {
      throw new TypeError("invalid key provided");
    }
    if (key.type !== "private" || key.asymmetricKeyType !== "ed25519") {
      throw new TypeError(`${v}.public signing key must be a private ed25519 key`);
    }
    return key;
  }
  function _checkPublicKey(v, key) {
    if (typeof key === "string" && key.startsWith(`k${v.slice(1)}.public.`)) {
      try {
        key = Buffer.from(key.slice(10), "base64url");
        assert2.strictEqual(key.byteLength, 32);
      } catch {}
    }
    if (Buffer.isBuffer(key)) {
      try {
        key = bytesToKeyObject(key);
      } catch {}
    }
    if (!isKeyObject(key) || key.type === "private") {
      try {
        key = crypto.createPublicKey(key);
      } catch {}
    }
    if (!isKeyObject(key)) {
      throw new TypeError("invalid key provided");
    }
    if (key.type !== "public" || key.asymmetricKeyType !== "ed25519") {
      throw new TypeError(`${v}.public verify key must be a public ed25519 key`);
    }
    return key;
  }
  async function _generateKey(v, purpose, { format = "keyobject" } = {}) {
    if (format !== "keyobject" && format !== "paserk")
      throw new TypeError("invalid format");
    switch (purpose) {
      case "public": {
        const { privateKey, publicKey } = await generateKeyPair("ed25519");
        if (format === "paserk") {
          return {
            secretKey: `k${v.slice(1)}.secret.${keyObjectToBytes(privateKey).toString("base64url")}`,
            publicKey: `k${v.slice(1)}.public.${keyObjectToBytes(publicKey).toString("base64url")}`
          };
        }
        return privateKey;
      }
      default:
        throw new PasetoNotSupported(`unsupported ${v} purpose`);
    }
  }
  function bytesToKeyObject(bytes) {
    if (!Buffer.isBuffer(bytes)) {
      throw new TypeError("bytes must be a Buffer");
    }
    switch (bytes.byteLength) {
      case 64: {
        const keyObject = crypto.createPrivateKey({
          key: Buffer.concat([
            Buffer.from("302e020100300506032b657004220420", "hex"),
            bytes.subarray(0, 32)
          ]),
          format: "der",
          type: "pkcs8"
        });
        if (!bytes.subarray(32).equals(Buffer.from(keyObject.export({ format: "jwk" }).x, "base64"))) {
          throw new TypeError("invalid byte sequence");
        }
        return keyObject;
      }
      case 32:
        return crypto.createPublicKey({
          key: Buffer.concat([Buffer.from("302a300506032b6570032100", "hex"), bytes]),
          format: "der",
          type: "spki"
        });
      default:
        throw new TypeError("bytes must be 64 bytes (private key), or 32 bytes (public key)");
    }
  }
  function _keyObjectToBytes(v, keyObject) {
    if (!isKeyObject(keyObject)) {
      throw new TypeError("keyObject must be a KeyObject instance");
    }
    if (keyObject.type === "secret" || keyObject.asymmetricKeyType !== "ed25519") {
      throw new TypeError(`${v}.public key must be an Ed25519 key`);
    }
    switch (keyObject.type) {
      case "public":
        return Buffer.from(keyObject.export({ format: "jwk" }).x, "base64");
      case "private": {
        const { d, x } = keyObject.export({ format: "jwk" });
        return Buffer.concat([Buffer.from(d, "base64"), Buffer.from(x, "base64")]);
      }
    }
  }
  async function generateKey(...args) {
    return _generateKey("v2", ...args);
  }
  function keyObjectToBytes(...args) {
    return _keyObjectToBytes("v2", ...args);
  }
  module.exports = {
    _checkPrivateKey,
    _checkPublicKey,
    _generateKey,
    _keyObjectToBytes,
    bytesToKeyObject,
    generateKey,
    keyObjectToBytes
  };
});

// node_modules/paseto/lib/v2/sign.js
var require_sign3 = __commonJS((exports, module) => {
  var checkFooter = require_check_footer();
  var checkPayload = require_check_payload();
  var sign = require_sign();
  var { _checkPrivateKey } = require_key2();
  var checkKey = _checkPrivateKey.bind(undefined, "v2");
  module.exports = async function v2Sign(payload, key, { footer, ...options } = {}) {
    const m = checkPayload(payload, options);
    key = checkKey(key);
    const f = checkFooter(footer);
    return sign("v2.public.", m, f, undefined, key);
  };
});

// node_modules/paseto/lib/v2/verify.js
var require_verify3 = __commonJS((exports, module) => {
  var verify = require_verify();
  var { _checkPublicKey } = require_key2();
  var { post } = require_consume();
  var checkKey = _checkPublicKey.bind(undefined, "v2");
  module.exports = async function v2Verify(token, key, { complete = false, buffer = false, ...options } = {}) {
    key = checkKey(key);
    const { m, footer } = await verify("v2.public.", token, undefined, 64, key);
    return post("v2", buffer, options, complete, m, footer, "public");
  };
});

// node_modules/paseto/lib/v2/index.js
var require_v2 = __commonJS((exports, module) => {
  var sign = require_sign3();
  var verify = require_verify3();
  var { generateKey, bytesToKeyObject, keyObjectToBytes } = require_key2();
  module.exports = { sign, verify, generateKey, bytesToKeyObject, keyObjectToBytes };
});

// node_modules/paseto/lib/help/check_assertion.js
var require_check_assertion = __commonJS((exports, module) => {
  module.exports = function checkAssertion(assertion) {
    if (typeof assertion === "undefined") {
      return Buffer.from("");
    }
    if (Buffer.isBuffer(assertion)) {
      return assertion;
    }
    if (typeof assertion !== "string") {
      throw new TypeError("options.assertion must be a string, or a Buffer");
    }
    return Buffer.from(assertion, "utf8");
  };
});

// node_modules/paseto/lib/help/compress_pk.js
var require_compress_pk = __commonJS((exports, module) => {
  module.exports = (key) => {
    const { x, y } = key.export({ format: "jwk" });
    const yB = Buffer.from(y, "base64");
    const sign = 2 + (yB[yB.length - 1] & 1);
    return Buffer.concat([Buffer.alloc(1, sign), Buffer.from(x, "base64")]);
  };
});

// node_modules/paseto/lib/v3/key.js
var require_key3 = __commonJS((exports, module) => {
  var crypto = __require("crypto");
  var { promisify } = __require("util");
  var { PasetoNotSupported } = require_errors();
  var isKeyObject = require_is_key_object();
  var compressPk = require_compress_pk();
  var generateKeyPair = promisify(crypto.generateKeyPair);
  var generateSecretKey = promisify(crypto.generateKey);
  async function generateKey(purpose, { format = "keyobject" } = {}) {
    if (format !== "keyobject" && format !== "paserk")
      throw new TypeError("invalid format");
    switch (purpose) {
      case "local": {
        const keyobject = await generateSecretKey("aes", { length: 256 });
        if (format === "paserk") {
          return `k3.local.${keyobject.export().toString("base64url")}`;
        }
        return keyobject;
      }
      case "public": {
        const { privateKey, publicKey } = await generateKeyPair("ec", { namedCurve: "P-384" });
        if (format === "paserk") {
          return {
            secretKey: `k3.secret.${keyObjectToBytes(privateKey).toString("base64url")}`,
            publicKey: `k3.public.${keyObjectToBytes(publicKey).toString("base64url")}`
          };
        }
        return privateKey;
      }
      default:
        throw new PasetoNotSupported("unsupported v3 purpose");
    }
  }
  function bytesToKeyObject(bytes) {
    if (!Buffer.isBuffer(bytes)) {
      throw new TypeError("bytes must be a Buffer");
    }
    switch (bytes.byteLength) {
      case 48:
        return crypto.createPrivateKey({
          key: Buffer.concat([
            Buffer.from("303e0201010430", "hex"),
            bytes,
            Buffer.from("a00706052b81040022", "hex")
          ]),
          format: "der",
          type: "sec1"
        });
      case 49:
        if (bytes[0] !== 2 && bytes[0] !== 3) {
          throw new TypeError("invalid compressed public key");
        }
        return crypto.createPublicKey({
          key: Buffer.concat([
            Buffer.from("3046301006072a8648ce3d020106052b81040022033200", "hex"),
            bytes
          ]),
          format: "der",
          type: "spki"
        });
      case 97:
        if (bytes[0] !== 4) {
          throw new TypeError("invalid uncompressed public key");
        }
        return crypto.createPublicKey({
          key: Buffer.concat([
            Buffer.from("3076301006072a8648ce3d020106052b81040022036200", "hex"),
            bytes
          ]),
          format: "der",
          type: "spki"
        });
      default:
        throw new TypeError("bytes must be 48 bytes (private key), 49 bytes (compressed public key), or 97 bytes (uncompressed public key)");
    }
  }
  function keyObjectToBytes(keyObject) {
    if (!isKeyObject(keyObject)) {
      throw new TypeError("keyObject must be a KeyObject instance");
    }
    if (keyObject.type === "secret" || keyObject.asymmetricKeyType !== "ec" || keyObject.asymmetricKeyDetails.namedCurve !== "secp384r1") {
      throw new TypeError("v3.public key must be an EC P-384 key");
    }
    switch (keyObject.type) {
      case "public":
        return compressPk(keyObject);
      case "private":
        return Buffer.from(keyObject.export({ format: "jwk" }).d, "base64");
    }
  }
  module.exports = {
    generateKey,
    bytesToKeyObject,
    keyObjectToBytes
  };
});

// node_modules/paseto/lib/v3/sign.js
var require_sign4 = __commonJS((exports, module) => {
  var { createPrivateKey } = __require("crypto");
  var checkFooter = require_check_footer();
  var checkPayload = require_check_payload();
  var checkAssertion = require_check_assertion();
  var sign = require_sign();
  var isKeyObject = require_is_key_object();
  var { bytesToKeyObject } = require_key3();
  var compressPk = require_compress_pk();
  function checkKey(key) {
    if (typeof key === "string" && key.startsWith("k3.secret.")) {
      try {
        key = Buffer.from(key.slice(10), "base64url");
        assert.strictEqual(key.byteLength, 48);
      } catch {}
    }
    if (Buffer.isBuffer(key)) {
      try {
        key = bytesToKeyObject(key);
      } catch {}
    }
    if (!isKeyObject(key)) {
      try {
        key = createPrivateKey(key);
      } catch {}
    }
    if (!isKeyObject(key)) {
      throw new TypeError("invalid key provided");
    }
    if (key.type !== "private" || key.asymmetricKeyType !== "ec" || key.asymmetricKeyDetails.namedCurve !== "secp384r1") {
      throw new TypeError("v3.public signing key must be a private EC P-384 key");
    }
    return key;
  }
  module.exports = async function v3Sign(payload, key, { footer, assertion, ...options } = {}) {
    const m = checkPayload(payload, options);
    const f = checkFooter(footer);
    const i = checkAssertion(assertion);
    key = checkKey(key);
    return sign("v3.public.", m, f, "sha384", { key, dsaEncoding: "ieee-p1363" }, i, compressPk(key));
  };
});

// node_modules/paseto/lib/v3/verify.js
var require_verify4 = __commonJS((exports, module) => {
  var { createPublicKey } = __require("crypto");
  var checkAssertion = require_check_assertion();
  var verify = require_verify();
  var isKeyObject = require_is_key_object();
  var { bytesToKeyObject } = require_key3();
  var compressPk = require_compress_pk();
  var { post } = require_consume();
  function checkKey(key) {
    if (typeof key === "string" && key.startsWith("k3.public.")) {
      try {
        key = Buffer.from(key.slice(10), "base64url");
        assert.strictEqual(key.byteLength, 49);
      } catch {}
    }
    if (Buffer.isBuffer(key)) {
      try {
        key = bytesToKeyObject(key);
      } catch {}
    }
    if (!isKeyObject(key) || key.type === "private") {
      try {
        key = createPublicKey(key);
      } catch {}
    }
    if (!isKeyObject(key)) {
      throw new TypeError("invalid key provided");
    }
    if (key.type !== "public" || key.asymmetricKeyType !== "ec" || key.asymmetricKeyDetails.namedCurve !== "secp384r1") {
      throw new TypeError("v3.public verify key must be a public EC P-384 key");
    }
    return key;
  }
  module.exports = async function v3Verify(token, key, { complete = false, buffer = false, assertion, ...options } = {}) {
    key = checkKey(key);
    const i = checkAssertion(assertion);
    const { m, footer } = await verify("v3.public.", token, "sha384", 96, { key, dsaEncoding: "ieee-p1363" }, i, compressPk(key));
    return post("v3", buffer, options, complete, m, footer, "public");
  };
});

// node_modules/paseto/lib/v3/encrypt.js
var require_encrypt2 = __commonJS((exports, module) => {
  var checkFooter = require_check_footer();
  var checkKey = require_symmetric_key_check().bind(undefined, "v3.local");
  var checkPayload = require_check_payload();
  var checkAssertion = require_check_assertion();
  var { "v3.local-encrypt": encrypt } = require_crypto_worker();
  module.exports = async function v3Encrypt(payload, key, { footer, assertion, ...options } = {}) {
    const m = checkPayload(payload, options);
    key = checkKey(key);
    const f = checkFooter(footer);
    const i = checkAssertion(assertion);
    const k = key.export();
    return encrypt(m, f, k, i);
  };
});

// node_modules/paseto/lib/v3/decrypt.js
var require_decrypt2 = __commonJS((exports, module) => {
  var { "v3.local-decrypt": decrypt } = require_crypto_worker();
  var checkKey = require_symmetric_key_check().bind(undefined, "v3.local");
  var checkAssertion = require_check_assertion();
  var { pre, post } = require_consume();
  var h = "v3.local.";
  module.exports = async function v3Decrypt(token, key, { complete = false, buffer = false, assertion, ...options } = {}) {
    const { raw, f } = pre(h, token);
    key = checkKey(key);
    const i = checkAssertion(assertion);
    const k = key.export();
    const m = await decrypt(raw, f, k, i);
    return post("v3", buffer, options, complete, m, f, "local");
  };
});

// node_modules/paseto/lib/v3/index.js
var require_v3 = __commonJS((exports, module) => {
  var sign = require_sign4();
  var verify = require_verify4();
  var encrypt = require_encrypt2();
  var decrypt = require_decrypt2();
  var { generateKey, bytesToKeyObject, keyObjectToBytes } = require_key3();
  module.exports = { sign, verify, encrypt, decrypt, generateKey, bytesToKeyObject, keyObjectToBytes };
});

// node_modules/paseto/lib/v4/key.js
var require_key4 = __commonJS((exports, module) => {
  var {
    _checkPrivateKey,
    _checkPublicKey,
    _generateKey,
    _keyObjectToBytes,
    bytesToKeyObject
  } = require_key2();
  async function generateKey(...args) {
    return _generateKey("v4", ...args);
  }
  function keyObjectToBytes(...args) {
    return _keyObjectToBytes("v4", ...args);
  }
  module.exports = {
    _checkPrivateKey,
    _checkPublicKey,
    bytesToKeyObject,
    generateKey,
    keyObjectToBytes
  };
});

// node_modules/paseto/lib/v4/sign.js
var require_sign5 = __commonJS((exports, module) => {
  var checkFooter = require_check_footer();
  var checkPayload = require_check_payload();
  var checkAssertion = require_check_assertion();
  var sign = require_sign();
  var { _checkPrivateKey } = require_key4();
  var checkKey = _checkPrivateKey.bind(undefined, "v4");
  module.exports = async function v4Sign(payload, key, { footer, assertion, ...options } = {}) {
    const m = checkPayload(payload, options);
    const i = checkAssertion(assertion);
    key = checkKey(key);
    const f = checkFooter(footer);
    return sign("v4.public.", m, f, undefined, key, i);
  };
});

// node_modules/paseto/lib/v4/verify.js
var require_verify5 = __commonJS((exports, module) => {
  var checkAssertion = require_check_assertion();
  var verify = require_verify();
  var { _checkPublicKey } = require_key4();
  var { post } = require_consume();
  var checkKey = _checkPublicKey.bind(undefined, "v4");
  module.exports = async function v4Verify(token, key, { complete = false, buffer = false, assertion, ...options } = {}) {
    key = checkKey(key);
    const i = checkAssertion(assertion);
    const { m, footer } = await verify("v4.public.", token, undefined, 64, key, i);
    return post("v4", buffer, options, complete, m, footer, "public");
  };
});

// node_modules/paseto/lib/v4/index.js
var require_v4 = __commonJS((exports, module) => {
  var sign = require_sign5();
  var verify = require_verify5();
  var { generateKey, bytesToKeyObject, keyObjectToBytes } = require_key4();
  module.exports = { sign, verify, generateKey, bytesToKeyObject, keyObjectToBytes };
});

// node_modules/paseto/lib/general/decode.js
var require_decode = __commonJS((exports, module) => {
  var { PasetoInvalid, PasetoNotSupported } = require_errors();
  var { decode } = require_base64url();
  var parsePayload = require_parse_paseto_payload();
  module.exports = (token, { parse = true } = {}) => {
    if (typeof token !== "string") {
      throw new TypeError("token must be a string");
    }
    const { 0: version, 1: purpose, 2: payload, 3: footer, length } = token.split(".");
    if (length !== 3 && length !== 4) {
      throw new PasetoInvalid("token is not a PASETO formatted value");
    }
    if (version !== "v1" && version !== "v2" && version !== "v3" && version !== "v4") {
      throw new PasetoNotSupported("unsupported PASETO version");
    }
    if (purpose !== "local" && purpose !== "public") {
      throw new PasetoNotSupported("unsupported PASETO purpose");
    }
    const result = {
      footer: footer ? decode(footer) : undefined,
      payload: undefined,
      version,
      purpose
    };
    if (purpose === "local") {
      return result;
    }
    const sigLength = version === "v1" ? 256 : version === "v3" ? 96 : 64;
    let raw;
    try {
      raw = decode(payload).subarray(0, -sigLength);
    } catch {
      throw new PasetoInvalid("token is not a PASETO formatted value");
    }
    if (!parse) {
      result.payload = raw;
    } else {
      result.payload = parsePayload(raw);
    }
    return result;
  };
});

// node_modules/paseto/lib/general/index.js
var require_general = __commonJS((exports, module) => {
  var decode = require_decode();
  module.exports = { decode };
});

// node_modules/paseto/lib/index.js
var require_lib = __commonJS((exports, module) => {
  var errors = require_errors();
  var V1 = require_v1();
  var V2 = require_v2();
  var V3 = require_v3();
  var V4 = require_v4();
  var { decode } = require_general();
  module.exports = { decode, V1, V2, V3, V4, errors };
});

// node_modules/pino-std-serializers/lib/err-helpers.js
var require_err_helpers = __commonJS((exports, module) => {
  var isErrorLike = (err) => {
    return err && typeof err.message === "string";
  };
  var getErrorCause = (err) => {
    if (!err)
      return;
    const cause = err.cause;
    if (typeof cause === "function") {
      const causeResult = err.cause();
      return isErrorLike(causeResult) ? causeResult : undefined;
    } else {
      return isErrorLike(cause) ? cause : undefined;
    }
  };
  var _stackWithCauses = (err, seen) => {
    if (!isErrorLike(err))
      return "";
    const stack = err.stack || "";
    if (seen.has(err)) {
      return stack + `
causes have become circular...`;
    }
    const cause = getErrorCause(err);
    if (cause) {
      seen.add(err);
      return stack + `
caused by: ` + _stackWithCauses(cause, seen);
    } else {
      return stack;
    }
  };
  var stackWithCauses = (err) => _stackWithCauses(err, new Set);
  var _messageWithCauses = (err, seen, skip) => {
    if (!isErrorLike(err))
      return "";
    const message = skip ? "" : err.message || "";
    if (seen.has(err)) {
      return message + ": ...";
    }
    const cause = getErrorCause(err);
    if (cause) {
      seen.add(err);
      const skipIfVErrorStyleCause = typeof err.cause === "function";
      return message + (skipIfVErrorStyleCause ? "" : ": ") + _messageWithCauses(cause, seen, skipIfVErrorStyleCause);
    } else {
      return message;
    }
  };
  var messageWithCauses = (err) => _messageWithCauses(err, new Set);
  module.exports = {
    isErrorLike,
    getErrorCause,
    stackWithCauses,
    messageWithCauses
  };
});

// node_modules/pino-std-serializers/lib/err-proto.js
var require_err_proto = __commonJS((exports, module) => {
  var seen = Symbol("circular-ref-tag");
  var rawSymbol = Symbol("pino-raw-err-ref");
  var pinoErrProto = Object.create({}, {
    type: {
      enumerable: true,
      writable: true,
      value: undefined
    },
    message: {
      enumerable: true,
      writable: true,
      value: undefined
    },
    stack: {
      enumerable: true,
      writable: true,
      value: undefined
    },
    aggregateErrors: {
      enumerable: true,
      writable: true,
      value: undefined
    },
    raw: {
      enumerable: false,
      get: function() {
        return this[rawSymbol];
      },
      set: function(val) {
        this[rawSymbol] = val;
      }
    }
  });
  Object.defineProperty(pinoErrProto, rawSymbol, {
    writable: true,
    value: {}
  });
  module.exports = {
    pinoErrProto,
    pinoErrorSymbols: {
      seen,
      rawSymbol
    }
  };
});

// node_modules/pino-std-serializers/lib/err.js
var require_err = __commonJS((exports, module) => {
  module.exports = errSerializer;
  var { messageWithCauses, stackWithCauses, isErrorLike } = require_err_helpers();
  var { pinoErrProto, pinoErrorSymbols } = require_err_proto();
  var { seen } = pinoErrorSymbols;
  var { toString } = Object.prototype;
  function errSerializer(err) {
    if (!isErrorLike(err)) {
      return err;
    }
    err[seen] = undefined;
    const _err = Object.create(pinoErrProto);
    _err.type = toString.call(err.constructor) === "[object Function]" ? err.constructor.name : err.name;
    _err.message = messageWithCauses(err);
    _err.stack = stackWithCauses(err);
    if (Array.isArray(err.errors)) {
      _err.aggregateErrors = err.errors.map((err2) => errSerializer(err2));
    }
    for (const key in err) {
      if (_err[key] === undefined) {
        const val = err[key];
        if (isErrorLike(val)) {
          if (key !== "cause" && !Object.prototype.hasOwnProperty.call(val, seen)) {
            _err[key] = errSerializer(val);
          }
        } else {
          _err[key] = val;
        }
      }
    }
    delete err[seen];
    _err.raw = err;
    return _err;
  }
});

// node_modules/pino-std-serializers/lib/err-with-cause.js
var require_err_with_cause = __commonJS((exports, module) => {
  module.exports = errWithCauseSerializer;
  var { isErrorLike } = require_err_helpers();
  var { pinoErrProto, pinoErrorSymbols } = require_err_proto();
  var { seen } = pinoErrorSymbols;
  var { toString } = Object.prototype;
  function errWithCauseSerializer(err) {
    if (!isErrorLike(err)) {
      return err;
    }
    err[seen] = undefined;
    const _err = Object.create(pinoErrProto);
    _err.type = toString.call(err.constructor) === "[object Function]" ? err.constructor.name : err.name;
    _err.message = err.message;
    _err.stack = err.stack;
    if (Array.isArray(err.errors)) {
      _err.aggregateErrors = err.errors.map((err2) => errWithCauseSerializer(err2));
    }
    if (isErrorLike(err.cause) && !Object.prototype.hasOwnProperty.call(err.cause, seen)) {
      _err.cause = errWithCauseSerializer(err.cause);
    }
    for (const key in err) {
      if (_err[key] === undefined) {
        const val = err[key];
        if (isErrorLike(val)) {
          if (!Object.prototype.hasOwnProperty.call(val, seen)) {
            _err[key] = errWithCauseSerializer(val);
          }
        } else {
          _err[key] = val;
        }
      }
    }
    delete err[seen];
    _err.raw = err;
    return _err;
  }
});

// node_modules/pino-std-serializers/lib/req.js
var require_req = __commonJS((exports, module) => {
  module.exports = {
    mapHttpRequest,
    reqSerializer
  };
  var rawSymbol = Symbol("pino-raw-req-ref");
  var pinoReqProto = Object.create({}, {
    id: {
      enumerable: true,
      writable: true,
      value: ""
    },
    method: {
      enumerable: true,
      writable: true,
      value: ""
    },
    url: {
      enumerable: true,
      writable: true,
      value: ""
    },
    query: {
      enumerable: true,
      writable: true,
      value: ""
    },
    params: {
      enumerable: true,
      writable: true,
      value: ""
    },
    headers: {
      enumerable: true,
      writable: true,
      value: {}
    },
    remoteAddress: {
      enumerable: true,
      writable: true,
      value: ""
    },
    remotePort: {
      enumerable: true,
      writable: true,
      value: ""
    },
    raw: {
      enumerable: false,
      get: function() {
        return this[rawSymbol];
      },
      set: function(val) {
        this[rawSymbol] = val;
      }
    }
  });
  Object.defineProperty(pinoReqProto, rawSymbol, {
    writable: true,
    value: {}
  });
  function reqSerializer(req) {
    const connection = req.info || req.socket;
    const _req = Object.create(pinoReqProto);
    _req.id = typeof req.id === "function" ? req.id() : req.id || (req.info ? req.info.id : undefined);
    _req.method = req.method;
    if (req.originalUrl) {
      _req.url = req.originalUrl;
    } else {
      const path = req.path;
      _req.url = typeof path === "string" ? path : req.url ? req.url.path || req.url : undefined;
    }
    if (req.query) {
      _req.query = req.query;
    }
    if (req.params) {
      _req.params = req.params;
    }
    _req.headers = req.headers;
    _req.remoteAddress = connection && connection.remoteAddress;
    _req.remotePort = connection && connection.remotePort;
    _req.raw = req.raw || req;
    return _req;
  }
  function mapHttpRequest(req) {
    return {
      req: reqSerializer(req)
    };
  }
});

// node_modules/pino-std-serializers/lib/res.js
var require_res = __commonJS((exports, module) => {
  module.exports = {
    mapHttpResponse,
    resSerializer
  };
  var rawSymbol = Symbol("pino-raw-res-ref");
  var pinoResProto = Object.create({}, {
    statusCode: {
      enumerable: true,
      writable: true,
      value: 0
    },
    headers: {
      enumerable: true,
      writable: true,
      value: ""
    },
    raw: {
      enumerable: false,
      get: function() {
        return this[rawSymbol];
      },
      set: function(val) {
        this[rawSymbol] = val;
      }
    }
  });
  Object.defineProperty(pinoResProto, rawSymbol, {
    writable: true,
    value: {}
  });
  function resSerializer(res) {
    const _res = Object.create(pinoResProto);
    _res.statusCode = res.headersSent ? res.statusCode : null;
    _res.headers = res.getHeaders ? res.getHeaders() : res._headers;
    _res.raw = res;
    return _res;
  }
  function mapHttpResponse(res) {
    return {
      res: resSerializer(res)
    };
  }
});

// node_modules/pino-std-serializers/index.js
var require_pino_std_serializers = __commonJS((exports, module) => {
  var errSerializer = require_err();
  var errWithCauseSerializer = require_err_with_cause();
  var reqSerializers = require_req();
  var resSerializers = require_res();
  module.exports = {
    err: errSerializer,
    errWithCause: errWithCauseSerializer,
    mapHttpRequest: reqSerializers.mapHttpRequest,
    mapHttpResponse: resSerializers.mapHttpResponse,
    req: reqSerializers.reqSerializer,
    res: resSerializers.resSerializer,
    wrapErrorSerializer: function wrapErrorSerializer(customSerializer) {
      if (customSerializer === errSerializer)
        return customSerializer;
      return function wrapErrSerializer(err) {
        return customSerializer(errSerializer(err));
      };
    },
    wrapRequestSerializer: function wrapRequestSerializer(customSerializer) {
      if (customSerializer === reqSerializers.reqSerializer)
        return customSerializer;
      return function wrappedReqSerializer(req) {
        return customSerializer(reqSerializers.reqSerializer(req));
      };
    },
    wrapResponseSerializer: function wrapResponseSerializer(customSerializer) {
      if (customSerializer === resSerializers.resSerializer)
        return customSerializer;
      return function wrappedResSerializer(res) {
        return customSerializer(resSerializers.resSerializer(res));
      };
    }
  };
});

// node_modules/pino/lib/caller.js
var require_caller = __commonJS((exports, module) => {
  function noOpPrepareStackTrace(_, stack) {
    return stack;
  }
  module.exports = function getCallers() {
    const originalPrepare = Error.prepareStackTrace;
    Error.prepareStackTrace = noOpPrepareStackTrace;
    const stack = new Error().stack;
    Error.prepareStackTrace = originalPrepare;
    if (!Array.isArray(stack)) {
      return;
    }
    const entries = stack.slice(2);
    const fileNames = [];
    for (const entry of entries) {
      if (!entry) {
        continue;
      }
      fileNames.push(entry.getFileName());
    }
    return fileNames;
  };
});

// node_modules/@pinojs/redact/index.js
var require_redact = __commonJS((exports, module) => {
  function deepClone(obj) {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    if (obj instanceof Array) {
      const cloned = [];
      for (let i = 0;i < obj.length; i++) {
        cloned[i] = deepClone(obj[i]);
      }
      return cloned;
    }
    if (typeof obj === "object") {
      const cloned = Object.create(Object.getPrototypeOf(obj));
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          cloned[key] = deepClone(obj[key]);
        }
      }
      return cloned;
    }
    return obj;
  }
  function parsePath(path) {
    const parts = [];
    let current = "";
    let inBrackets = false;
    let inQuotes = false;
    let quoteChar = "";
    for (let i = 0;i < path.length; i++) {
      const char = path[i];
      if (!inBrackets && char === ".") {
        if (current) {
          parts.push(current);
          current = "";
        }
      } else if (char === "[") {
        if (current) {
          parts.push(current);
          current = "";
        }
        inBrackets = true;
      } else if (char === "]" && inBrackets) {
        parts.push(current);
        current = "";
        inBrackets = false;
        inQuotes = false;
      } else if ((char === '"' || char === "'") && inBrackets) {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuotes = false;
          quoteChar = "";
        } else {
          current += char;
        }
      } else {
        current += char;
      }
    }
    if (current) {
      parts.push(current);
    }
    return parts;
  }
  function setValue(obj, parts, value) {
    let current = obj;
    for (let i = 0;i < parts.length - 1; i++) {
      const key = parts[i];
      if (typeof current !== "object" || current === null || !(key in current)) {
        return false;
      }
      if (typeof current[key] !== "object" || current[key] === null) {
        return false;
      }
      current = current[key];
    }
    const lastKey = parts[parts.length - 1];
    if (lastKey === "*") {
      if (Array.isArray(current)) {
        for (let i = 0;i < current.length; i++) {
          current[i] = value;
        }
      } else if (typeof current === "object" && current !== null) {
        for (const key in current) {
          if (Object.prototype.hasOwnProperty.call(current, key)) {
            current[key] = value;
          }
        }
      }
    } else {
      if (typeof current === "object" && current !== null && lastKey in current && Object.prototype.hasOwnProperty.call(current, lastKey)) {
        current[lastKey] = value;
      }
    }
    return true;
  }
  function removeKey(obj, parts) {
    let current = obj;
    for (let i = 0;i < parts.length - 1; i++) {
      const key = parts[i];
      if (typeof current !== "object" || current === null || !(key in current)) {
        return false;
      }
      if (typeof current[key] !== "object" || current[key] === null) {
        return false;
      }
      current = current[key];
    }
    const lastKey = parts[parts.length - 1];
    if (lastKey === "*") {
      if (Array.isArray(current)) {
        for (let i = 0;i < current.length; i++) {
          current[i] = undefined;
        }
      } else if (typeof current === "object" && current !== null) {
        for (const key in current) {
          if (Object.prototype.hasOwnProperty.call(current, key)) {
            delete current[key];
          }
        }
      }
    } else {
      if (typeof current === "object" && current !== null && lastKey in current && Object.prototype.hasOwnProperty.call(current, lastKey)) {
        delete current[lastKey];
      }
    }
    return true;
  }
  var PATH_NOT_FOUND = Symbol("PATH_NOT_FOUND");
  function getValueIfExists(obj, parts) {
    let current = obj;
    for (const part of parts) {
      if (current === null || current === undefined) {
        return PATH_NOT_FOUND;
      }
      if (typeof current !== "object" || current === null) {
        return PATH_NOT_FOUND;
      }
      if (!(part in current)) {
        return PATH_NOT_FOUND;
      }
      current = current[part];
    }
    return current;
  }
  function getValue(obj, parts) {
    let current = obj;
    for (const part of parts) {
      if (current === null || current === undefined) {
        return;
      }
      if (typeof current !== "object" || current === null) {
        return;
      }
      current = current[part];
    }
    return current;
  }
  function redactPaths(obj, paths, censor, remove = false) {
    for (const path of paths) {
      const parts = parsePath(path);
      if (parts.includes("*")) {
        redactWildcardPath(obj, parts, censor, path, remove);
      } else {
        if (remove) {
          removeKey(obj, parts);
        } else {
          const value = getValueIfExists(obj, parts);
          if (value === PATH_NOT_FOUND) {
            continue;
          }
          const actualCensor = typeof censor === "function" ? censor(value, parts) : censor;
          setValue(obj, parts, actualCensor);
        }
      }
    }
  }
  function redactWildcardPath(obj, parts, censor, originalPath, remove = false) {
    const wildcardIndex = parts.indexOf("*");
    if (wildcardIndex === parts.length - 1) {
      const parentParts = parts.slice(0, -1);
      let current = obj;
      for (const part of parentParts) {
        if (current === null || current === undefined)
          return;
        if (typeof current !== "object" || current === null)
          return;
        current = current[part];
      }
      if (Array.isArray(current)) {
        if (remove) {
          for (let i = 0;i < current.length; i++) {
            current[i] = undefined;
          }
        } else {
          for (let i = 0;i < current.length; i++) {
            const indexPath = [...parentParts, i.toString()];
            const actualCensor = typeof censor === "function" ? censor(current[i], indexPath) : censor;
            current[i] = actualCensor;
          }
        }
      } else if (typeof current === "object" && current !== null) {
        if (remove) {
          const keysToDelete = [];
          for (const key in current) {
            if (Object.prototype.hasOwnProperty.call(current, key)) {
              keysToDelete.push(key);
            }
          }
          for (const key of keysToDelete) {
            delete current[key];
          }
        } else {
          for (const key in current) {
            const keyPath = [...parentParts, key];
            const actualCensor = typeof censor === "function" ? censor(current[key], keyPath) : censor;
            current[key] = actualCensor;
          }
        }
      }
    } else {
      redactIntermediateWildcard(obj, parts, censor, wildcardIndex, originalPath, remove);
    }
  }
  function redactIntermediateWildcard(obj, parts, censor, wildcardIndex, originalPath, remove = false) {
    const beforeWildcard = parts.slice(0, wildcardIndex);
    const afterWildcard = parts.slice(wildcardIndex + 1);
    const pathArray = [];
    function traverse(current, pathLength) {
      if (pathLength === beforeWildcard.length) {
        if (Array.isArray(current)) {
          for (let i = 0;i < current.length; i++) {
            pathArray[pathLength] = i.toString();
            traverse(current[i], pathLength + 1);
          }
        } else if (typeof current === "object" && current !== null) {
          for (const key in current) {
            pathArray[pathLength] = key;
            traverse(current[key], pathLength + 1);
          }
        }
      } else if (pathLength < beforeWildcard.length) {
        const nextKey = beforeWildcard[pathLength];
        if (current && typeof current === "object" && current !== null && nextKey in current) {
          pathArray[pathLength] = nextKey;
          traverse(current[nextKey], pathLength + 1);
        }
      } else {
        if (afterWildcard.includes("*")) {
          const wrappedCensor = typeof censor === "function" ? (value, path) => {
            const fullPath = [...pathArray.slice(0, pathLength), ...path];
            return censor(value, fullPath);
          } : censor;
          redactWildcardPath(current, afterWildcard, wrappedCensor, originalPath, remove);
        } else {
          if (remove) {
            removeKey(current, afterWildcard);
          } else {
            const actualCensor = typeof censor === "function" ? censor(getValue(current, afterWildcard), [...pathArray.slice(0, pathLength), ...afterWildcard]) : censor;
            setValue(current, afterWildcard, actualCensor);
          }
        }
      }
    }
    if (beforeWildcard.length === 0) {
      traverse(obj, 0);
    } else {
      let current = obj;
      for (let i = 0;i < beforeWildcard.length; i++) {
        const part = beforeWildcard[i];
        if (current === null || current === undefined)
          return;
        if (typeof current !== "object" || current === null)
          return;
        current = current[part];
        pathArray[i] = part;
      }
      if (current !== null && current !== undefined) {
        traverse(current, beforeWildcard.length);
      }
    }
  }
  function buildPathStructure(pathsToClone) {
    if (pathsToClone.length === 0) {
      return null;
    }
    const pathStructure = new Map;
    for (const path of pathsToClone) {
      const parts = parsePath(path);
      let current = pathStructure;
      for (let i = 0;i < parts.length; i++) {
        const part = parts[i];
        if (!current.has(part)) {
          current.set(part, new Map);
        }
        current = current.get(part);
      }
    }
    return pathStructure;
  }
  function selectiveClone(obj, pathStructure) {
    if (!pathStructure) {
      return obj;
    }
    function cloneSelectively(source, pathMap, depth = 0) {
      if (!pathMap || pathMap.size === 0) {
        return source;
      }
      if (source === null || typeof source !== "object") {
        return source;
      }
      if (source instanceof Date) {
        return new Date(source.getTime());
      }
      if (Array.isArray(source)) {
        const cloned2 = [];
        for (let i = 0;i < source.length; i++) {
          const indexStr = i.toString();
          if (pathMap.has(indexStr) || pathMap.has("*")) {
            cloned2[i] = cloneSelectively(source[i], pathMap.get(indexStr) || pathMap.get("*"));
          } else {
            cloned2[i] = source[i];
          }
        }
        return cloned2;
      }
      const cloned = Object.create(Object.getPrototypeOf(source));
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          if (pathMap.has(key) || pathMap.has("*")) {
            cloned[key] = cloneSelectively(source[key], pathMap.get(key) || pathMap.get("*"));
          } else {
            cloned[key] = source[key];
          }
        }
      }
      return cloned;
    }
    return cloneSelectively(obj, pathStructure);
  }
  function validatePath(path) {
    if (typeof path !== "string") {
      throw new Error("Paths must be (non-empty) strings");
    }
    if (path === "") {
      throw new Error("Invalid redaction path ()");
    }
    if (path.includes("..")) {
      throw new Error(`Invalid redaction path (${path})`);
    }
    if (path.includes(",")) {
      throw new Error(`Invalid redaction path (${path})`);
    }
    let bracketCount = 0;
    let inQuotes = false;
    let quoteChar = "";
    for (let i = 0;i < path.length; i++) {
      const char = path[i];
      if ((char === '"' || char === "'") && bracketCount > 0) {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuotes = false;
          quoteChar = "";
        }
      } else if (char === "[" && !inQuotes) {
        bracketCount++;
      } else if (char === "]" && !inQuotes) {
        bracketCount--;
        if (bracketCount < 0) {
          throw new Error(`Invalid redaction path (${path})`);
        }
      }
    }
    if (bracketCount !== 0) {
      throw new Error(`Invalid redaction path (${path})`);
    }
  }
  function validatePaths(paths) {
    if (!Array.isArray(paths)) {
      throw new TypeError("paths must be an array");
    }
    for (const path of paths) {
      validatePath(path);
    }
  }
  function slowRedact(options = {}) {
    const {
      paths = [],
      censor = "[REDACTED]",
      serialize = JSON.stringify,
      strict = true,
      remove = false
    } = options;
    validatePaths(paths);
    const pathStructure = buildPathStructure(paths);
    return function redact(obj) {
      if (strict && (obj === null || typeof obj !== "object")) {
        if (obj === null || obj === undefined) {
          return serialize ? serialize(obj) : obj;
        }
        if (typeof obj !== "object") {
          return serialize ? serialize(obj) : obj;
        }
      }
      const cloned = selectiveClone(obj, pathStructure);
      const original = obj;
      let actualCensor = censor;
      if (typeof censor === "function") {
        actualCensor = censor;
      }
      redactPaths(cloned, paths, actualCensor, remove);
      if (serialize === false) {
        cloned.restore = function() {
          return deepClone(original);
        };
        return cloned;
      }
      if (typeof serialize === "function") {
        return serialize(cloned);
      }
      return JSON.stringify(cloned);
    };
  }
  module.exports = slowRedact;
});

// node_modules/pino/lib/symbols.js
var require_symbols = __commonJS((exports, module) => {
  var setLevelSym = Symbol("pino.setLevel");
  var getLevelSym = Symbol("pino.getLevel");
  var levelValSym = Symbol("pino.levelVal");
  var levelCompSym = Symbol("pino.levelComp");
  var useLevelLabelsSym = Symbol("pino.useLevelLabels");
  var useOnlyCustomLevelsSym = Symbol("pino.useOnlyCustomLevels");
  var mixinSym = Symbol("pino.mixin");
  var lsCacheSym = Symbol("pino.lsCache");
  var chindingsSym = Symbol("pino.chindings");
  var asJsonSym = Symbol("pino.asJson");
  var writeSym = Symbol("pino.write");
  var redactFmtSym = Symbol("pino.redactFmt");
  var timeSym = Symbol("pino.time");
  var timeSliceIndexSym = Symbol("pino.timeSliceIndex");
  var streamSym = Symbol("pino.stream");
  var stringifySym = Symbol("pino.stringify");
  var stringifySafeSym = Symbol("pino.stringifySafe");
  var stringifiersSym = Symbol("pino.stringifiers");
  var endSym = Symbol("pino.end");
  var formatOptsSym = Symbol("pino.formatOpts");
  var messageKeySym = Symbol("pino.messageKey");
  var errorKeySym = Symbol("pino.errorKey");
  var nestedKeySym = Symbol("pino.nestedKey");
  var nestedKeyStrSym = Symbol("pino.nestedKeyStr");
  var mixinMergeStrategySym = Symbol("pino.mixinMergeStrategy");
  var msgPrefixSym = Symbol("pino.msgPrefix");
  var wildcardFirstSym = Symbol("pino.wildcardFirst");
  var serializersSym = Symbol.for("pino.serializers");
  var formattersSym = Symbol.for("pino.formatters");
  var hooksSym = Symbol.for("pino.hooks");
  var needsMetadataGsym = Symbol.for("pino.metadata");
  module.exports = {
    setLevelSym,
    getLevelSym,
    levelValSym,
    levelCompSym,
    useLevelLabelsSym,
    mixinSym,
    lsCacheSym,
    chindingsSym,
    asJsonSym,
    writeSym,
    serializersSym,
    redactFmtSym,
    timeSym,
    timeSliceIndexSym,
    streamSym,
    stringifySym,
    stringifySafeSym,
    stringifiersSym,
    endSym,
    formatOptsSym,
    messageKeySym,
    errorKeySym,
    nestedKeySym,
    wildcardFirstSym,
    needsMetadataGsym,
    useOnlyCustomLevelsSym,
    formattersSym,
    hooksSym,
    nestedKeyStrSym,
    mixinMergeStrategySym,
    msgPrefixSym
  };
});

// node_modules/pino/lib/redaction.js
var require_redaction = __commonJS((exports, module) => {
  var Redact = require_redact();
  var { redactFmtSym, wildcardFirstSym } = require_symbols();
  var rx = /[^.[\]]+|\[([^[\]]*?)\]/g;
  var CENSOR = "[Redacted]";
  var strict = false;
  function redaction(opts, serialize) {
    const { paths, censor, remove } = handle(opts);
    const shape = paths.reduce((o, str) => {
      rx.lastIndex = 0;
      const first = rx.exec(str);
      const next = rx.exec(str);
      let ns = first[1] !== undefined ? first[1].replace(/^(?:"|'|`)(.*)(?:"|'|`)$/, "$1") : first[0];
      if (ns === "*") {
        ns = wildcardFirstSym;
      }
      if (next === null) {
        o[ns] = null;
        return o;
      }
      if (o[ns] === null) {
        return o;
      }
      const { index } = next;
      const nextPath = `${str.substr(index, str.length - 1)}`;
      o[ns] = o[ns] || [];
      if (ns !== wildcardFirstSym && o[ns].length === 0) {
        o[ns].push(...o[wildcardFirstSym] || []);
      }
      if (ns === wildcardFirstSym) {
        Object.keys(o).forEach(function(k) {
          if (o[k]) {
            o[k].push(nextPath);
          }
        });
      }
      o[ns].push(nextPath);
      return o;
    }, {});
    const result = {
      [redactFmtSym]: Redact({ paths, censor, serialize, strict, remove })
    };
    const topCensor = (...args) => {
      return typeof censor === "function" ? serialize(censor(...args)) : serialize(censor);
    };
    return [...Object.keys(shape), ...Object.getOwnPropertySymbols(shape)].reduce((o, k) => {
      if (shape[k] === null) {
        o[k] = (value) => topCensor(value, [k]);
      } else {
        const wrappedCensor = typeof censor === "function" ? (value, path) => {
          return censor(value, [k, ...path]);
        } : censor;
        o[k] = Redact({
          paths: shape[k],
          censor: wrappedCensor,
          serialize,
          strict,
          remove
        });
      }
      return o;
    }, result);
  }
  function handle(opts) {
    if (Array.isArray(opts)) {
      opts = { paths: opts, censor: CENSOR };
      return opts;
    }
    let { paths, censor = CENSOR, remove } = opts;
    if (Array.isArray(paths) === false) {
      throw Error("pino \u2013 redact must contain an array of strings");
    }
    if (remove === true)
      censor = undefined;
    return { paths, censor, remove };
  }
  module.exports = redaction;
});

// node_modules/pino/lib/time.js
var require_time = __commonJS((exports, module) => {
  var nullTime = () => "";
  var epochTime = () => `,"time":${Date.now()}`;
  var unixTime = () => `,"time":${Math.round(Date.now() / 1000)}`;
  var isoTime = () => `,"time":"${new Date(Date.now()).toISOString()}"`;
  var NS_PER_MS = 1000000n;
  var NS_PER_SEC = 1000000000n;
  var startWallTimeNs = BigInt(Date.now()) * NS_PER_MS;
  var startHrTime = process.hrtime.bigint();
  var isoTimeNano = () => {
    const elapsedNs = process.hrtime.bigint() - startHrTime;
    const currentTimeNs = startWallTimeNs + elapsedNs;
    const secondsSinceEpoch = currentTimeNs / NS_PER_SEC;
    const nanosWithinSecond = currentTimeNs % NS_PER_SEC;
    const msSinceEpoch = Number(secondsSinceEpoch * 1000n + nanosWithinSecond / 1000000n);
    const date = new Date(msSinceEpoch);
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const day = date.getUTCDate().toString().padStart(2, "0");
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    const seconds = date.getUTCSeconds().toString().padStart(2, "0");
    return `,"time":"${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${nanosWithinSecond.toString().padStart(9, "0")}Z"`;
  };
  module.exports = { nullTime, epochTime, unixTime, isoTime, isoTimeNano };
});

// node_modules/quick-format-unescaped/index.js
var require_quick_format_unescaped = __commonJS((exports, module) => {
  function tryStringify(o) {
    try {
      return JSON.stringify(o);
    } catch (e) {
      return '"[Circular]"';
    }
  }
  module.exports = format;
  function format(f, args, opts) {
    var ss = opts && opts.stringify || tryStringify;
    var offset = 1;
    if (typeof f === "object" && f !== null) {
      var len = args.length + offset;
      if (len === 1)
        return f;
      var objects = new Array(len);
      objects[0] = ss(f);
      for (var index = 1;index < len; index++) {
        objects[index] = ss(args[index]);
      }
      return objects.join(" ");
    }
    if (typeof f !== "string") {
      return f;
    }
    var argLen = args.length;
    if (argLen === 0)
      return f;
    var str = "";
    var a = 1 - offset;
    var lastPos = -1;
    var flen = f && f.length || 0;
    for (var i = 0;i < flen; ) {
      if (f.charCodeAt(i) === 37 && i + 1 < flen) {
        lastPos = lastPos > -1 ? lastPos : 0;
        switch (f.charCodeAt(i + 1)) {
          case 100:
          case 102:
            if (a >= argLen)
              break;
            if (args[a] == null)
              break;
            if (lastPos < i)
              str += f.slice(lastPos, i);
            str += Number(args[a]);
            lastPos = i + 2;
            i++;
            break;
          case 105:
            if (a >= argLen)
              break;
            if (args[a] == null)
              break;
            if (lastPos < i)
              str += f.slice(lastPos, i);
            str += Math.floor(Number(args[a]));
            lastPos = i + 2;
            i++;
            break;
          case 79:
          case 111:
          case 106:
            if (a >= argLen)
              break;
            if (args[a] === undefined)
              break;
            if (lastPos < i)
              str += f.slice(lastPos, i);
            var type = typeof args[a];
            if (type === "string") {
              str += "'" + args[a] + "'";
              lastPos = i + 2;
              i++;
              break;
            }
            if (type === "function") {
              str += args[a].name || "<anonymous>";
              lastPos = i + 2;
              i++;
              break;
            }
            str += ss(args[a]);
            lastPos = i + 2;
            i++;
            break;
          case 115:
            if (a >= argLen)
              break;
            if (lastPos < i)
              str += f.slice(lastPos, i);
            str += String(args[a]);
            lastPos = i + 2;
            i++;
            break;
          case 37:
            if (lastPos < i)
              str += f.slice(lastPos, i);
            str += "%";
            lastPos = i + 2;
            i++;
            a--;
            break;
        }
        ++a;
      }
      ++i;
    }
    if (lastPos === -1)
      return f;
    else if (lastPos < flen) {
      str += f.slice(lastPos);
    }
    return str;
  }
});

// node_modules/atomic-sleep/index.js
var require_atomic_sleep = __commonJS((exports, module) => {
  if (typeof SharedArrayBuffer !== "undefined" && typeof Atomics !== "undefined") {
    let sleep = function(ms) {
      const valid = ms > 0 && ms < Infinity;
      if (valid === false) {
        if (typeof ms !== "number" && typeof ms !== "bigint") {
          throw TypeError("sleep: ms must be a number");
        }
        throw RangeError("sleep: ms must be a number that is greater than 0 but less than Infinity");
      }
      Atomics.wait(nil, 0, 0, Number(ms));
    };
    const nil = new Int32Array(new SharedArrayBuffer(4));
    module.exports = sleep;
  } else {
    let sleep = function(ms) {
      const valid = ms > 0 && ms < Infinity;
      if (valid === false) {
        if (typeof ms !== "number" && typeof ms !== "bigint") {
          throw TypeError("sleep: ms must be a number");
        }
        throw RangeError("sleep: ms must be a number that is greater than 0 but less than Infinity");
      }
      const target = Date.now() + Number(ms);
      while (target > Date.now()) {}
    };
    module.exports = sleep;
  }
});

// node_modules/sonic-boom/index.js
var require_sonic_boom = __commonJS((exports, module) => {
  var fs = __require("fs");
  var EventEmitter = __require("events");
  var inherits = __require("util").inherits;
  var path = __require("path");
  var sleep = require_atomic_sleep();
  var assert2 = __require("assert");
  var BUSY_WRITE_TIMEOUT = 100;
  var kEmptyBuffer = Buffer.allocUnsafe(0);
  var MAX_WRITE = 16 * 1024;
  var kContentModeBuffer = "buffer";
  var kContentModeUtf8 = "utf8";
  var [major, minor] = (process.versions.node || "0.0").split(".").map(Number);
  var kCopyBuffer = major >= 22 && minor >= 7;
  function openFile(file, sonic) {
    sonic._opening = true;
    sonic._writing = true;
    sonic._asyncDrainScheduled = false;
    function fileOpened(err, fd) {
      if (err) {
        sonic._reopening = false;
        sonic._writing = false;
        sonic._opening = false;
        if (sonic.sync) {
          process.nextTick(() => {
            if (sonic.listenerCount("error") > 0) {
              sonic.emit("error", err);
            }
          });
        } else {
          sonic.emit("error", err);
        }
        return;
      }
      const reopening = sonic._reopening;
      sonic.fd = fd;
      sonic.file = file;
      sonic._reopening = false;
      sonic._opening = false;
      sonic._writing = false;
      if (sonic.sync) {
        process.nextTick(() => sonic.emit("ready"));
      } else {
        sonic.emit("ready");
      }
      if (sonic.destroyed) {
        return;
      }
      if (!sonic._writing && sonic._len > sonic.minLength || sonic._flushPending) {
        sonic._actualWrite();
      } else if (reopening) {
        process.nextTick(() => sonic.emit("drain"));
      }
    }
    const flags = sonic.append ? "a" : "w";
    const mode = sonic.mode;
    if (sonic.sync) {
      try {
        if (sonic.mkdir)
          fs.mkdirSync(path.dirname(file), { recursive: true });
        const fd = fs.openSync(file, flags, mode);
        fileOpened(null, fd);
      } catch (err) {
        fileOpened(err);
        throw err;
      }
    } else if (sonic.mkdir) {
      fs.mkdir(path.dirname(file), { recursive: true }, (err) => {
        if (err)
          return fileOpened(err);
        fs.open(file, flags, mode, fileOpened);
      });
    } else {
      fs.open(file, flags, mode, fileOpened);
    }
  }
  function SonicBoom(opts) {
    if (!(this instanceof SonicBoom)) {
      return new SonicBoom(opts);
    }
    let { fd, dest, minLength, maxLength, maxWrite, periodicFlush, sync, append = true, mkdir, retryEAGAIN, fsync, contentMode, mode } = opts || {};
    fd = fd || dest;
    this._len = 0;
    this.fd = -1;
    this._bufs = [];
    this._lens = [];
    this._writing = false;
    this._ending = false;
    this._reopening = false;
    this._asyncDrainScheduled = false;
    this._flushPending = false;
    this._hwm = Math.max(minLength || 0, 16387);
    this.file = null;
    this.destroyed = false;
    this.minLength = minLength || 0;
    this.maxLength = maxLength || 0;
    this.maxWrite = maxWrite || MAX_WRITE;
    this._periodicFlush = periodicFlush || 0;
    this._periodicFlushTimer = undefined;
    this.sync = sync || false;
    this.writable = true;
    this._fsync = fsync || false;
    this.append = append || false;
    this.mode = mode;
    this.retryEAGAIN = retryEAGAIN || (() => true);
    this.mkdir = mkdir || false;
    let fsWriteSync;
    let fsWrite;
    if (contentMode === kContentModeBuffer) {
      this._writingBuf = kEmptyBuffer;
      this.write = writeBuffer;
      this.flush = flushBuffer;
      this.flushSync = flushBufferSync;
      this._actualWrite = actualWriteBuffer;
      fsWriteSync = () => fs.writeSync(this.fd, this._writingBuf);
      fsWrite = () => fs.write(this.fd, this._writingBuf, this.release);
    } else if (contentMode === undefined || contentMode === kContentModeUtf8) {
      this._writingBuf = "";
      this.write = write;
      this.flush = flush;
      this.flushSync = flushSync;
      this._actualWrite = actualWrite;
      fsWriteSync = () => {
        if (Buffer.isBuffer(this._writingBuf)) {
          return fs.writeSync(this.fd, this._writingBuf);
        }
        return fs.writeSync(this.fd, this._writingBuf, "utf8");
      };
      fsWrite = () => {
        if (Buffer.isBuffer(this._writingBuf)) {
          return fs.write(this.fd, this._writingBuf, this.release);
        }
        return fs.write(this.fd, this._writingBuf, "utf8", this.release);
      };
    } else {
      throw new Error(`SonicBoom supports "${kContentModeUtf8}" and "${kContentModeBuffer}", but passed ${contentMode}`);
    }
    if (typeof fd === "number") {
      this.fd = fd;
      process.nextTick(() => this.emit("ready"));
    } else if (typeof fd === "string") {
      openFile(fd, this);
    } else {
      throw new Error("SonicBoom supports only file descriptors and files");
    }
    if (this.minLength >= this.maxWrite) {
      throw new Error(`minLength should be smaller than maxWrite (${this.maxWrite})`);
    }
    this.release = (err, n) => {
      if (err) {
        if ((err.code === "EAGAIN" || err.code === "EBUSY") && this.retryEAGAIN(err, this._writingBuf.length, this._len - this._writingBuf.length)) {
          if (this.sync) {
            try {
              sleep(BUSY_WRITE_TIMEOUT);
              this.release(undefined, 0);
            } catch (err2) {
              this.release(err2);
            }
          } else {
            setTimeout(fsWrite, BUSY_WRITE_TIMEOUT);
          }
        } else {
          this._writing = false;
          this.emit("error", err);
        }
        return;
      }
      this.emit("write", n);
      const releasedBufObj = releaseWritingBuf(this._writingBuf, this._len, n);
      this._len = releasedBufObj.len;
      this._writingBuf = releasedBufObj.writingBuf;
      if (this._writingBuf.length) {
        if (!this.sync) {
          fsWrite();
          return;
        }
        try {
          do {
            const n2 = fsWriteSync();
            const releasedBufObj2 = releaseWritingBuf(this._writingBuf, this._len, n2);
            this._len = releasedBufObj2.len;
            this._writingBuf = releasedBufObj2.writingBuf;
          } while (this._writingBuf.length);
        } catch (err2) {
          this.release(err2);
          return;
        }
      }
      if (this._fsync) {
        fs.fsyncSync(this.fd);
      }
      const len = this._len;
      if (this._reopening) {
        this._writing = false;
        this._reopening = false;
        this.reopen();
      } else if (len > this.minLength) {
        this._actualWrite();
      } else if (this._ending) {
        if (len > 0) {
          this._actualWrite();
        } else {
          this._writing = false;
          actualClose(this);
        }
      } else {
        this._writing = false;
        if (this.sync) {
          if (!this._asyncDrainScheduled) {
            this._asyncDrainScheduled = true;
            process.nextTick(emitDrain, this);
          }
        } else {
          this.emit("drain");
        }
      }
    };
    this.on("newListener", function(name) {
      if (name === "drain") {
        this._asyncDrainScheduled = false;
      }
    });
    if (this._periodicFlush !== 0) {
      this._periodicFlushTimer = setInterval(() => this.flush(null), this._periodicFlush);
      this._periodicFlushTimer.unref();
    }
  }
  function releaseWritingBuf(writingBuf, len, n) {
    if (typeof writingBuf === "string") {
      writingBuf = Buffer.from(writingBuf);
    }
    len = Math.max(len - n, 0);
    writingBuf = writingBuf.subarray(n);
    return { writingBuf, len };
  }
  function emitDrain(sonic) {
    const hasListeners = sonic.listenerCount("drain") > 0;
    if (!hasListeners)
      return;
    sonic._asyncDrainScheduled = false;
    sonic.emit("drain");
  }
  inherits(SonicBoom, EventEmitter);
  function mergeBuf(bufs, len) {
    if (bufs.length === 0) {
      return kEmptyBuffer;
    }
    if (bufs.length === 1) {
      return bufs[0];
    }
    return Buffer.concat(bufs, len);
  }
  function write(data) {
    if (this.destroyed) {
      throw new Error("SonicBoom destroyed");
    }
    data = "" + data;
    const dataLen = Buffer.byteLength(data);
    const len = this._len + dataLen;
    const bufs = this._bufs;
    if (this.maxLength && len > this.maxLength) {
      this.emit("drop", data);
      return this._len < this._hwm;
    }
    if (bufs.length === 0 || Buffer.byteLength(bufs[bufs.length - 1]) + dataLen > this.maxWrite) {
      bufs.push(data);
    } else {
      bufs[bufs.length - 1] += data;
    }
    this._len = len;
    if (!this._writing && this._len >= this.minLength) {
      this._actualWrite();
    }
    return this._len < this._hwm;
  }
  function writeBuffer(data) {
    if (this.destroyed) {
      throw new Error("SonicBoom destroyed");
    }
    const len = this._len + data.length;
    const bufs = this._bufs;
    const lens = this._lens;
    if (this.maxLength && len > this.maxLength) {
      this.emit("drop", data);
      return this._len < this._hwm;
    }
    if (bufs.length === 0 || lens[lens.length - 1] + data.length > this.maxWrite) {
      bufs.push([data]);
      lens.push(data.length);
    } else {
      bufs[bufs.length - 1].push(data);
      lens[lens.length - 1] += data.length;
    }
    this._len = len;
    if (!this._writing && this._len >= this.minLength) {
      this._actualWrite();
    }
    return this._len < this._hwm;
  }
  function callFlushCallbackOnDrain(cb) {
    this._flushPending = true;
    const onDrain = () => {
      if (!this._fsync) {
        try {
          fs.fsync(this.fd, (err) => {
            this._flushPending = false;
            cb(err);
          });
        } catch (err) {
          cb(err);
        }
      } else {
        this._flushPending = false;
        cb();
      }
      this.off("error", onError);
    };
    const onError = (err) => {
      this._flushPending = false;
      cb(err);
      this.off("drain", onDrain);
    };
    this.once("drain", onDrain);
    this.once("error", onError);
  }
  function flush(cb) {
    if (cb != null && typeof cb !== "function") {
      throw new Error("flush cb must be a function");
    }
    if (this.destroyed) {
      const error = new Error("SonicBoom destroyed");
      if (cb) {
        cb(error);
        return;
      }
      throw error;
    }
    if (this.minLength <= 0) {
      cb?.();
      return;
    }
    if (cb) {
      callFlushCallbackOnDrain.call(this, cb);
    }
    if (this._writing) {
      return;
    }
    if (this._bufs.length === 0) {
      this._bufs.push("");
    }
    this._actualWrite();
  }
  function flushBuffer(cb) {
    if (cb != null && typeof cb !== "function") {
      throw new Error("flush cb must be a function");
    }
    if (this.destroyed) {
      const error = new Error("SonicBoom destroyed");
      if (cb) {
        cb(error);
        return;
      }
      throw error;
    }
    if (this.minLength <= 0) {
      cb?.();
      return;
    }
    if (cb) {
      callFlushCallbackOnDrain.call(this, cb);
    }
    if (this._writing) {
      return;
    }
    if (this._bufs.length === 0) {
      this._bufs.push([]);
      this._lens.push(0);
    }
    this._actualWrite();
  }
  SonicBoom.prototype.reopen = function(file) {
    if (this.destroyed) {
      throw new Error("SonicBoom destroyed");
    }
    if (this._opening) {
      this.once("ready", () => {
        this.reopen(file);
      });
      return;
    }
    if (this._ending) {
      return;
    }
    if (!this.file) {
      throw new Error("Unable to reopen a file descriptor, you must pass a file to SonicBoom");
    }
    if (file) {
      this.file = file;
    }
    this._reopening = true;
    if (this._writing) {
      return;
    }
    const fd = this.fd;
    this.once("ready", () => {
      if (fd !== this.fd) {
        fs.close(fd, (err) => {
          if (err) {
            return this.emit("error", err);
          }
        });
      }
    });
    openFile(this.file, this);
  };
  SonicBoom.prototype.end = function() {
    if (this.destroyed) {
      throw new Error("SonicBoom destroyed");
    }
    if (this._opening) {
      this.once("ready", () => {
        this.end();
      });
      return;
    }
    if (this._ending) {
      return;
    }
    this._ending = true;
    if (this._writing) {
      return;
    }
    if (this._len > 0 && this.fd >= 0) {
      this._actualWrite();
    } else {
      actualClose(this);
    }
  };
  function flushSync() {
    if (this.destroyed) {
      throw new Error("SonicBoom destroyed");
    }
    if (this.fd < 0) {
      throw new Error("sonic boom is not ready yet");
    }
    if (!this._writing && this._writingBuf.length > 0) {
      this._bufs.unshift(this._writingBuf);
      this._writingBuf = "";
    }
    let buf = "";
    while (this._bufs.length || buf.length) {
      if (buf.length <= 0) {
        buf = this._bufs[0];
      }
      try {
        const n = Buffer.isBuffer(buf) ? fs.writeSync(this.fd, buf) : fs.writeSync(this.fd, buf, "utf8");
        const releasedBufObj = releaseWritingBuf(buf, this._len, n);
        buf = releasedBufObj.writingBuf;
        this._len = releasedBufObj.len;
        if (buf.length <= 0) {
          this._bufs.shift();
        }
      } catch (err) {
        const shouldRetry = err.code === "EAGAIN" || err.code === "EBUSY";
        if (shouldRetry && !this.retryEAGAIN(err, buf.length, this._len - buf.length)) {
          throw err;
        }
        sleep(BUSY_WRITE_TIMEOUT);
      }
    }
    try {
      fs.fsyncSync(this.fd);
    } catch {}
  }
  function flushBufferSync() {
    if (this.destroyed) {
      throw new Error("SonicBoom destroyed");
    }
    if (this.fd < 0) {
      throw new Error("sonic boom is not ready yet");
    }
    if (!this._writing && this._writingBuf.length > 0) {
      this._bufs.unshift([this._writingBuf]);
      this._writingBuf = kEmptyBuffer;
    }
    let buf = kEmptyBuffer;
    while (this._bufs.length || buf.length) {
      if (buf.length <= 0) {
        buf = mergeBuf(this._bufs[0], this._lens[0]);
      }
      try {
        const n = fs.writeSync(this.fd, buf);
        buf = buf.subarray(n);
        this._len = Math.max(this._len - n, 0);
        if (buf.length <= 0) {
          this._bufs.shift();
          this._lens.shift();
        }
      } catch (err) {
        const shouldRetry = err.code === "EAGAIN" || err.code === "EBUSY";
        if (shouldRetry && !this.retryEAGAIN(err, buf.length, this._len - buf.length)) {
          throw err;
        }
        sleep(BUSY_WRITE_TIMEOUT);
      }
    }
  }
  SonicBoom.prototype.destroy = function() {
    if (this.destroyed) {
      return;
    }
    actualClose(this);
  };
  function actualWrite() {
    const release = this.release;
    this._writing = true;
    this._writingBuf = this._writingBuf.length ? this._writingBuf : this._bufs.shift() || "";
    if (this.sync) {
      try {
        const written = Buffer.isBuffer(this._writingBuf) ? fs.writeSync(this.fd, this._writingBuf) : fs.writeSync(this.fd, this._writingBuf, "utf8");
        release(null, written);
      } catch (err) {
        release(err);
      }
    } else {
      fs.write(this.fd, this._writingBuf, release);
    }
  }
  function actualWriteBuffer() {
    const release = this.release;
    this._writing = true;
    this._writingBuf = this._writingBuf.length ? this._writingBuf : mergeBuf(this._bufs.shift(), this._lens.shift());
    if (this.sync) {
      try {
        const written = fs.writeSync(this.fd, this._writingBuf);
        release(null, written);
      } catch (err) {
        release(err);
      }
    } else {
      if (kCopyBuffer) {
        this._writingBuf = Buffer.from(this._writingBuf);
      }
      fs.write(this.fd, this._writingBuf, release);
    }
  }
  function actualClose(sonic) {
    if (sonic.fd === -1) {
      sonic.once("ready", actualClose.bind(null, sonic));
      return;
    }
    if (sonic._periodicFlushTimer !== undefined) {
      clearInterval(sonic._periodicFlushTimer);
    }
    sonic.destroyed = true;
    sonic._bufs = [];
    sonic._lens = [];
    assert2(typeof sonic.fd === "number", `sonic.fd must be a number, got ${typeof sonic.fd}`);
    try {
      fs.fsync(sonic.fd, closeWrapped);
    } catch {}
    function closeWrapped() {
      if (sonic.fd !== 1 && sonic.fd !== 2) {
        fs.close(sonic.fd, done);
      } else {
        done();
      }
    }
    function done(err) {
      if (err) {
        sonic.emit("error", err);
        return;
      }
      if (sonic._ending && !sonic._writing) {
        sonic.emit("finish");
      }
      sonic.emit("close");
    }
  }
  SonicBoom.SonicBoom = SonicBoom;
  SonicBoom.default = SonicBoom;
  module.exports = SonicBoom;
});

// node_modules/on-exit-leak-free/index.js
var require_on_exit_leak_free = __commonJS((exports, module) => {
  var refs = {
    exit: [],
    beforeExit: []
  };
  var functions = {
    exit: onExit,
    beforeExit: onBeforeExit
  };
  var registry;
  function ensureRegistry() {
    if (registry === undefined) {
      registry = new FinalizationRegistry(clear);
    }
  }
  function install(event) {
    if (refs[event].length > 0) {
      return;
    }
    process.on(event, functions[event]);
  }
  function uninstall(event) {
    if (refs[event].length > 0) {
      return;
    }
    process.removeListener(event, functions[event]);
    if (refs.exit.length === 0 && refs.beforeExit.length === 0) {
      registry = undefined;
    }
  }
  function onExit() {
    callRefs("exit");
  }
  function onBeforeExit() {
    callRefs("beforeExit");
  }
  function callRefs(event) {
    for (const ref of refs[event]) {
      const obj = ref.deref();
      const fn = ref.fn;
      if (obj !== undefined) {
        fn(obj, event);
      }
    }
    refs[event] = [];
  }
  function clear(ref) {
    for (const event of ["exit", "beforeExit"]) {
      const index = refs[event].indexOf(ref);
      refs[event].splice(index, index + 1);
      uninstall(event);
    }
  }
  function _register(event, obj, fn) {
    if (obj === undefined) {
      throw new Error("the object can't be undefined");
    }
    install(event);
    const ref = new WeakRef(obj);
    ref.fn = fn;
    ensureRegistry();
    registry.register(obj, ref);
    refs[event].push(ref);
  }
  function register(obj, fn) {
    _register("exit", obj, fn);
  }
  function registerBeforeExit(obj, fn) {
    _register("beforeExit", obj, fn);
  }
  function unregister(obj) {
    if (registry === undefined) {
      return;
    }
    registry.unregister(obj);
    for (const event of ["exit", "beforeExit"]) {
      refs[event] = refs[event].filter((ref) => {
        const _obj = ref.deref();
        return _obj && _obj !== obj;
      });
      uninstall(event);
    }
  }
  module.exports = {
    register,
    registerBeforeExit,
    unregister
  };
});

// node_modules/thread-stream/package.json
var require_package = __commonJS((exports, module) => {
  module.exports = {
    name: "thread-stream",
    version: "4.0.0",
    description: "A streaming way to send data to a Node.js Worker Thread",
    main: "index.js",
    types: "index.d.ts",
    engines: {
      node: ">=20"
    },
    dependencies: {
      "real-require": "^0.2.0"
    },
    devDependencies: {
      "@types/node": "^22.0.0",
      "@yao-pkg/pkg": "^6.0.0",
      borp: "^0.21.0",
      desm: "^1.3.0",
      eslint: "^9.39.1",
      fastbench: "^1.0.1",
      husky: "^9.0.6",
      neostandard: "^0.12.2",
      "pino-elasticsearch": "^8.0.0",
      "sonic-boom": "^4.0.1",
      "ts-node": "^10.8.0",
      typescript: "~5.7.3"
    },
    scripts: {
      build: "tsc --noEmit",
      lint: "eslint",
      test: "npm run lint && npm run build && npm run transpile && borp --pattern 'test/*.test.{js,mjs}'",
      "test:ci": "npm run lint && npm run transpile && borp --pattern 'test/*.test.{js,mjs}'",
      "test:yarn": "npm run transpile && borp --pattern 'test/*.test.js'",
      transpile: "sh ./test/ts/transpile.sh",
      prepare: "husky install"
    },
    repository: {
      type: "git",
      url: "git+https://github.com/mcollina/thread-stream.git"
    },
    keywords: [
      "worker",
      "thread",
      "threads",
      "stream"
    ],
    author: "Matteo Collina <hello@matteocollina.com>",
    license: "MIT",
    bugs: {
      url: "https://github.com/mcollina/thread-stream/issues"
    },
    homepage: "https://github.com/mcollina/thread-stream#readme"
  };
});

// node_modules/thread-stream/lib/wait.js
var require_wait = __commonJS((exports, module) => {
  var WAIT_MS = 1e4;
  function wait(state, index, expected, timeout, done) {
    const max = timeout === Infinity ? Infinity : Date.now() + timeout;
    const check = () => {
      const current = Atomics.load(state, index);
      if (current === expected) {
        done(null, "ok");
        return;
      }
      if (max !== Infinity && Date.now() > max) {
        done(null, "timed-out");
        return;
      }
      const remaining = max === Infinity ? WAIT_MS : Math.min(WAIT_MS, Math.max(1, max - Date.now()));
      const result = Atomics.waitAsync(state, index, current, remaining);
      if (result.async) {
        result.value.then(check);
      } else {
        setImmediate(check);
      }
    };
    check();
  }
  function waitDiff(state, index, expected, timeout, done) {
    const max = timeout === Infinity ? Infinity : Date.now() + timeout;
    const check = () => {
      const current = Atomics.load(state, index);
      if (current !== expected) {
        done(null, "ok");
        return;
      }
      if (max !== Infinity && Date.now() > max) {
        done(null, "timed-out");
        return;
      }
      const remaining = max === Infinity ? WAIT_MS : Math.min(WAIT_MS, Math.max(1, max - Date.now()));
      const result = Atomics.waitAsync(state, index, expected, remaining);
      if (result.async) {
        result.value.then(check);
      } else {
        setImmediate(check);
      }
    };
    check();
  }
  module.exports = { wait, waitDiff };
});

// node_modules/thread-stream/lib/indexes.js
var require_indexes = __commonJS((exports, module) => {
  var WRITE_INDEX = 4;
  var READ_INDEX = 8;
  module.exports = {
    WRITE_INDEX,
    READ_INDEX
  };
});

// node_modules/thread-stream/index.js
var require_thread_stream = __commonJS((exports, module) => {
  var __dirname = "C:\\Users\\programador2.lfrq\\Desktop\\proyects\\backend\\node_modules\\thread-stream";
  var { version } = require_package();
  var { EventEmitter } = __require("events");
  var { Worker } = __require("worker_threads");
  var { join } = __require("path");
  var { pathToFileURL } = __require("url");
  var { wait } = require_wait();
  var {
    WRITE_INDEX,
    READ_INDEX
  } = require_indexes();
  var buffer = __require("buffer");
  var assert2 = __require("assert");
  var kImpl = Symbol("kImpl");
  var MAX_STRING = buffer.constants.MAX_STRING_LENGTH;

  class FakeWeakRef {
    constructor(value) {
      this._value = value;
    }
    deref() {
      return this._value;
    }
  }

  class FakeFinalizationRegistry {
    register() {}
    unregister() {}
  }
  var FinalizationRegistry2 = process.env.NODE_V8_COVERAGE ? FakeFinalizationRegistry : global.FinalizationRegistry || FakeFinalizationRegistry;
  var WeakRef2 = process.env.NODE_V8_COVERAGE ? FakeWeakRef : global.WeakRef || FakeWeakRef;
  var registry = new FinalizationRegistry2((worker) => {
    if (worker.exited) {
      return;
    }
    worker.terminate();
  });
  function createWorker(stream, opts) {
    const { filename, workerData } = opts;
    const bundlerOverrides = "__bundlerPathsOverrides" in globalThis ? globalThis.__bundlerPathsOverrides : {};
    const toExecute = bundlerOverrides["thread-stream-worker"] || join(__dirname, "lib", "worker.js");
    const worker = new Worker(toExecute, {
      ...opts.workerOpts,
      trackUnmanagedFds: false,
      workerData: {
        filename: filename.indexOf("file://") === 0 ? filename : pathToFileURL(filename).href,
        dataBuf: stream[kImpl].dataBuf,
        stateBuf: stream[kImpl].stateBuf,
        workerData: {
          $context: {
            threadStreamVersion: version
          },
          ...workerData
        }
      }
    });
    worker.stream = new FakeWeakRef(stream);
    worker.on("message", onWorkerMessage);
    worker.on("exit", onWorkerExit);
    registry.register(stream, worker);
    return worker;
  }
  function drain(stream) {
    assert2(!stream[kImpl].sync);
    if (stream[kImpl].needDrain) {
      stream[kImpl].needDrain = false;
      stream.emit("drain");
    }
  }
  function nextFlush(stream) {
    const writeIndex = Atomics.load(stream[kImpl].state, WRITE_INDEX);
    let leftover = stream[kImpl].data.length - writeIndex;
    if (leftover > 0) {
      if (stream[kImpl].buf.length === 0) {
        stream[kImpl].flushing = false;
        if (stream[kImpl].ending) {
          end(stream);
        } else if (stream[kImpl].needDrain) {
          process.nextTick(drain, stream);
        }
        return;
      }
      let toWrite = stream[kImpl].buf.slice(0, leftover);
      let toWriteBytes = Buffer.byteLength(toWrite);
      if (toWriteBytes <= leftover) {
        stream[kImpl].buf = stream[kImpl].buf.slice(leftover);
        write(stream, toWrite, nextFlush.bind(null, stream));
      } else {
        stream.flush(() => {
          if (stream.destroyed) {
            return;
          }
          Atomics.store(stream[kImpl].state, READ_INDEX, 0);
          Atomics.store(stream[kImpl].state, WRITE_INDEX, 0);
          Atomics.notify(stream[kImpl].state, READ_INDEX);
          while (toWriteBytes > stream[kImpl].data.length) {
            leftover = leftover / 2;
            toWrite = stream[kImpl].buf.slice(0, leftover);
            toWriteBytes = Buffer.byteLength(toWrite);
          }
          stream[kImpl].buf = stream[kImpl].buf.slice(leftover);
          write(stream, toWrite, nextFlush.bind(null, stream));
        });
      }
    } else if (leftover === 0) {
      if (writeIndex === 0 && stream[kImpl].buf.length === 0) {
        return;
      }
      stream.flush(() => {
        Atomics.store(stream[kImpl].state, READ_INDEX, 0);
        Atomics.store(stream[kImpl].state, WRITE_INDEX, 0);
        Atomics.notify(stream[kImpl].state, READ_INDEX);
        nextFlush(stream);
      });
    } else {
      destroy(stream, new Error("overwritten"));
    }
  }
  function onWorkerMessage(msg) {
    const stream = this.stream.deref();
    if (stream === undefined) {
      this.exited = true;
      this.terminate();
      return;
    }
    switch (msg.code) {
      case "READY":
        this.stream = new WeakRef2(stream);
        stream.flush(() => {
          stream[kImpl].ready = true;
          stream.emit("ready");
        });
        break;
      case "ERROR":
        destroy(stream, msg.err);
        break;
      case "EVENT":
        if (Array.isArray(msg.args)) {
          stream.emit(msg.name, ...msg.args);
        } else {
          stream.emit(msg.name, msg.args);
        }
        break;
      case "WARNING":
        process.emitWarning(msg.err);
        break;
      default:
        destroy(stream, new Error("this should not happen: " + msg.code));
    }
  }
  function onWorkerExit(code) {
    const stream = this.stream.deref();
    if (stream === undefined) {
      return;
    }
    registry.unregister(stream);
    stream.worker.exited = true;
    stream.worker.off("exit", onWorkerExit);
    destroy(stream, code !== 0 ? new Error("the worker thread exited") : null);
  }

  class ThreadStream extends EventEmitter {
    constructor(opts = {}) {
      super();
      if (opts.bufferSize < 4) {
        throw new Error("bufferSize must at least fit a 4-byte utf-8 char");
      }
      this[kImpl] = {};
      this[kImpl].stateBuf = new SharedArrayBuffer(128);
      this[kImpl].state = new Int32Array(this[kImpl].stateBuf);
      this[kImpl].dataBuf = new SharedArrayBuffer(opts.bufferSize || 4 * 1024 * 1024);
      this[kImpl].data = Buffer.from(this[kImpl].dataBuf);
      this[kImpl].sync = opts.sync || false;
      this[kImpl].ending = false;
      this[kImpl].ended = false;
      this[kImpl].needDrain = false;
      this[kImpl].destroyed = false;
      this[kImpl].flushing = false;
      this[kImpl].ready = false;
      this[kImpl].finished = false;
      this[kImpl].errored = null;
      this[kImpl].closed = false;
      this[kImpl].buf = "";
      this.worker = createWorker(this, opts);
      this.on("message", (message, transferList) => {
        this.worker.postMessage(message, transferList);
      });
    }
    write(data) {
      if (this[kImpl].destroyed) {
        error(this, new Error("the worker has exited"));
        return false;
      }
      if (this[kImpl].ending) {
        error(this, new Error("the worker is ending"));
        return false;
      }
      if (this[kImpl].flushing && this[kImpl].buf.length + data.length >= MAX_STRING) {
        try {
          writeSync(this);
          this[kImpl].flushing = true;
        } catch (err) {
          destroy(this, err);
          return false;
        }
      }
      this[kImpl].buf += data;
      if (this[kImpl].sync) {
        try {
          writeSync(this);
          return true;
        } catch (err) {
          destroy(this, err);
          return false;
        }
      }
      if (!this[kImpl].flushing) {
        this[kImpl].flushing = true;
        setImmediate(nextFlush, this);
      }
      this[kImpl].needDrain = this[kImpl].data.length - this[kImpl].buf.length - Atomics.load(this[kImpl].state, WRITE_INDEX) <= 0;
      return !this[kImpl].needDrain;
    }
    end() {
      if (this[kImpl].destroyed) {
        return;
      }
      this[kImpl].ending = true;
      end(this);
    }
    flush(cb) {
      if (this[kImpl].destroyed) {
        if (typeof cb === "function") {
          process.nextTick(cb, new Error("the worker has exited"));
        }
        return;
      }
      const writeIndex = Atomics.load(this[kImpl].state, WRITE_INDEX);
      wait(this[kImpl].state, READ_INDEX, writeIndex, Infinity, (err, res) => {
        if (err) {
          destroy(this, err);
          process.nextTick(cb, err);
          return;
        }
        if (res === "not-equal") {
          this.flush(cb);
          return;
        }
        process.nextTick(cb);
      });
    }
    flushSync() {
      if (this[kImpl].destroyed) {
        return;
      }
      writeSync(this);
      flushSync(this);
    }
    unref() {
      this.worker.unref();
    }
    ref() {
      this.worker.ref();
    }
    get ready() {
      return this[kImpl].ready;
    }
    get destroyed() {
      return this[kImpl].destroyed;
    }
    get closed() {
      return this[kImpl].closed;
    }
    get writable() {
      return !this[kImpl].destroyed && !this[kImpl].ending;
    }
    get writableEnded() {
      return this[kImpl].ending;
    }
    get writableFinished() {
      return this[kImpl].finished;
    }
    get writableNeedDrain() {
      return this[kImpl].needDrain;
    }
    get writableObjectMode() {
      return false;
    }
    get writableErrored() {
      return this[kImpl].errored;
    }
  }
  function error(stream, err) {
    setImmediate(() => {
      stream.emit("error", err);
    });
  }
  function destroy(stream, err) {
    if (stream[kImpl].destroyed) {
      return;
    }
    stream[kImpl].destroyed = true;
    if (err) {
      stream[kImpl].errored = err;
      error(stream, err);
    }
    if (!stream.worker.exited) {
      stream.worker.terminate().catch(() => {}).then(() => {
        stream[kImpl].closed = true;
        stream.emit("close");
      });
    } else {
      setImmediate(() => {
        stream[kImpl].closed = true;
        stream.emit("close");
      });
    }
  }
  function write(stream, data, cb) {
    const current = Atomics.load(stream[kImpl].state, WRITE_INDEX);
    const length = Buffer.byteLength(data);
    stream[kImpl].data.write(data, current);
    Atomics.store(stream[kImpl].state, WRITE_INDEX, current + length);
    Atomics.notify(stream[kImpl].state, WRITE_INDEX);
    cb();
    return true;
  }
  function end(stream) {
    if (stream[kImpl].ended || !stream[kImpl].ending || stream[kImpl].flushing) {
      return;
    }
    stream[kImpl].ended = true;
    try {
      stream.flushSync();
      let readIndex = Atomics.load(stream[kImpl].state, READ_INDEX);
      Atomics.store(stream[kImpl].state, WRITE_INDEX, -1);
      Atomics.notify(stream[kImpl].state, WRITE_INDEX);
      let spins = 0;
      while (readIndex !== -1) {
        Atomics.wait(stream[kImpl].state, READ_INDEX, readIndex, 1000);
        readIndex = Atomics.load(stream[kImpl].state, READ_INDEX);
        if (readIndex === -2) {
          destroy(stream, new Error("end() failed"));
          return;
        }
        if (++spins === 10) {
          destroy(stream, new Error("end() took too long (10s)"));
          return;
        }
      }
      process.nextTick(() => {
        stream[kImpl].finished = true;
        stream.emit("finish");
      });
    } catch (err) {
      destroy(stream, err);
    }
  }
  function writeSync(stream) {
    const cb = () => {
      if (stream[kImpl].ending) {
        end(stream);
      } else if (stream[kImpl].needDrain) {
        process.nextTick(drain, stream);
      }
    };
    stream[kImpl].flushing = false;
    while (stream[kImpl].buf.length !== 0) {
      const writeIndex = Atomics.load(stream[kImpl].state, WRITE_INDEX);
      let leftover = stream[kImpl].data.length - writeIndex;
      if (leftover === 0) {
        flushSync(stream);
        Atomics.store(stream[kImpl].state, READ_INDEX, 0);
        Atomics.store(stream[kImpl].state, WRITE_INDEX, 0);
        Atomics.notify(stream[kImpl].state, READ_INDEX);
        continue;
      } else if (leftover < 0) {
        throw new Error("overwritten");
      }
      let toWrite = stream[kImpl].buf.slice(0, leftover);
      let toWriteBytes = Buffer.byteLength(toWrite);
      if (toWriteBytes <= leftover) {
        stream[kImpl].buf = stream[kImpl].buf.slice(leftover);
        write(stream, toWrite, cb);
      } else {
        flushSync(stream);
        Atomics.store(stream[kImpl].state, READ_INDEX, 0);
        Atomics.store(stream[kImpl].state, WRITE_INDEX, 0);
        Atomics.notify(stream[kImpl].state, READ_INDEX);
        while (toWriteBytes > stream[kImpl].buf.length) {
          leftover = leftover / 2;
          toWrite = stream[kImpl].buf.slice(0, leftover);
          toWriteBytes = Buffer.byteLength(toWrite);
        }
        stream[kImpl].buf = stream[kImpl].buf.slice(leftover);
        write(stream, toWrite, cb);
      }
    }
  }
  function flushSync(stream) {
    if (stream[kImpl].flushing) {
      throw new Error("unable to flush while flushing");
    }
    const writeIndex = Atomics.load(stream[kImpl].state, WRITE_INDEX);
    let spins = 0;
    while (true) {
      const readIndex = Atomics.load(stream[kImpl].state, READ_INDEX);
      if (readIndex === -2) {
        throw Error("_flushSync failed");
      }
      if (readIndex !== writeIndex) {
        Atomics.wait(stream[kImpl].state, READ_INDEX, readIndex, 1000);
      } else {
        break;
      }
      if (++spins === 10) {
        throw new Error("_flushSync took too long (10s)");
      }
    }
  }
  module.exports = ThreadStream;
});

// node_modules/pino/lib/transport.js
var require_transport = __commonJS((exports, module) => {
  var __dirname = "C:\\Users\\programador2.lfrq\\Desktop\\proyects\\backend\\node_modules\\pino\\lib";
  var { createRequire } = __require("module");
  var { existsSync } = __require("fs");
  var getCallers = require_caller();
  var { join, isAbsolute, sep } = __require("path");
  var { fileURLToPath } = __require("url");
  var sleep = require_atomic_sleep();
  var onExit = require_on_exit_leak_free();
  var ThreadStream = require_thread_stream();
  function setupOnExit(stream) {
    onExit.register(stream, autoEnd);
    onExit.registerBeforeExit(stream, flush);
    stream.on("close", function() {
      onExit.unregister(stream);
    });
  }
  function hasPreloadFlags() {
    const execArgv = process.execArgv;
    for (let i = 0;i < execArgv.length; i++) {
      const arg = execArgv[i];
      if (arg === "--import" || arg === "--require" || arg === "-r") {
        return true;
      }
      if (arg.startsWith("--import=") || arg.startsWith("--require=") || arg.startsWith("-r=")) {
        return true;
      }
    }
    return false;
  }
  function sanitizeNodeOptions(nodeOptions) {
    const tokens = nodeOptions.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g);
    if (!tokens) {
      return nodeOptions;
    }
    const sanitized = [];
    let changed = false;
    for (let i = 0;i < tokens.length; i++) {
      const token = tokens[i];
      if (token === "--require" || token === "-r" || token === "--import") {
        const next = tokens[i + 1];
        if (next && shouldDropPreload(next)) {
          changed = true;
          i++;
          continue;
        }
        sanitized.push(token);
        if (next) {
          sanitized.push(next);
          i++;
        }
        continue;
      }
      if (token.startsWith("--require=") || token.startsWith("-r=") || token.startsWith("--import=")) {
        const value = token.slice(token.indexOf("=") + 1);
        if (shouldDropPreload(value)) {
          changed = true;
          continue;
        }
      }
      sanitized.push(token);
    }
    return changed ? sanitized.join(" ") : nodeOptions;
  }
  function shouldDropPreload(value) {
    const unquoted = stripQuotes(value);
    if (!unquoted) {
      return false;
    }
    let path = unquoted;
    if (path.startsWith("file://")) {
      try {
        path = fileURLToPath(path);
      } catch {
        return false;
      }
    }
    return isAbsolute(path) && !existsSync(path);
  }
  function stripQuotes(value) {
    const first = value[0];
    const last = value[value.length - 1];
    if (first === '"' && last === '"' || first === "'" && last === "'") {
      return value.slice(1, -1);
    }
    return value;
  }
  function buildStream(filename, workerData, workerOpts, sync, name) {
    if (!workerOpts.execArgv && hasPreloadFlags() && __require.main === undefined) {
      workerOpts = {
        ...workerOpts,
        execArgv: []
      };
    }
    if (!workerOpts.env && process.env.NODE_OPTIONS) {
      const nodeOptions = sanitizeNodeOptions(process.env.NODE_OPTIONS);
      if (nodeOptions !== process.env.NODE_OPTIONS) {
        workerOpts = {
          ...workerOpts,
          env: {
            ...process.env,
            NODE_OPTIONS: nodeOptions
          }
        };
      }
    }
    workerOpts = { ...workerOpts, name };
    const stream = new ThreadStream({
      filename,
      workerData,
      workerOpts,
      sync
    });
    stream.on("ready", onReady);
    stream.on("close", function() {
      process.removeListener("exit", onExit2);
    });
    process.on("exit", onExit2);
    function onReady() {
      process.removeListener("exit", onExit2);
      stream.unref();
      if (workerOpts.autoEnd !== false) {
        setupOnExit(stream);
      }
    }
    function onExit2() {
      if (stream.closed) {
        return;
      }
      stream.flushSync();
      sleep(100);
      stream.end();
    }
    return stream;
  }
  function autoEnd(stream) {
    stream.ref();
    stream.flushSync();
    stream.end();
    stream.once("close", function() {
      stream.unref();
    });
  }
  function flush(stream) {
    stream.flushSync();
  }
  function transport(fullOptions) {
    const { pipeline, targets, levels, dedupe, worker = {}, caller = getCallers(), sync = false } = fullOptions;
    const options = {
      ...fullOptions.options
    };
    const callers = typeof caller === "string" ? [caller] : caller;
    const bundlerOverrides = typeof globalThis === "object" && Object.prototype.hasOwnProperty.call(globalThis, "__bundlerPathsOverrides") && globalThis.__bundlerPathsOverrides && typeof globalThis.__bundlerPathsOverrides === "object" ? globalThis.__bundlerPathsOverrides : Object.create(null);
    let target = fullOptions.target;
    if (target && targets) {
      throw new Error("only one of target or targets can be specified");
    }
    if (targets) {
      target = bundlerOverrides["pino-worker"] || join(__dirname, "worker.js");
      options.targets = targets.filter((dest) => dest.target).map((dest) => {
        return {
          ...dest,
          target: fixTarget(dest.target)
        };
      });
      options.pipelines = targets.filter((dest) => dest.pipeline).map((dest) => {
        return dest.pipeline.map((t) => {
          return {
            ...t,
            level: dest.level,
            target: fixTarget(t.target)
          };
        });
      });
    } else if (pipeline) {
      target = bundlerOverrides["pino-worker"] || join(__dirname, "worker.js");
      options.pipelines = [pipeline.map((dest) => {
        return {
          ...dest,
          target: fixTarget(dest.target)
        };
      })];
    }
    if (levels) {
      options.levels = levels;
    }
    if (dedupe) {
      options.dedupe = dedupe;
    }
    options.pinoWillSendConfig = true;
    const name = targets || pipeline ? "pino.transport" : target;
    return buildStream(fixTarget(target), options, worker, sync, name);
    function fixTarget(origin) {
      origin = bundlerOverrides[origin] || origin;
      if (isAbsolute(origin) || origin.indexOf("file://") === 0) {
        return origin;
      }
      if (origin === "pino/file") {
        return join(__dirname, "..", "file.js");
      }
      let fixTarget2;
      for (const filePath of callers) {
        try {
          const context = filePath === "node:repl" ? process.cwd() + sep : filePath;
          fixTarget2 = createRequire(context).resolve(origin);
          break;
        } catch (err) {
          continue;
        }
      }
      if (!fixTarget2) {
        throw new Error(`unable to determine transport target for "${origin}"`);
      }
      return fixTarget2;
    }
  }
  module.exports = transport;
});

// node_modules/pino/lib/tools.js
var require_tools = __commonJS((exports, module) => {
  var diagChan = __require("diagnostics_channel");
  var format = require_quick_format_unescaped();
  var { mapHttpRequest, mapHttpResponse } = require_pino_std_serializers();
  var SonicBoom = require_sonic_boom();
  var onExit = require_on_exit_leak_free();
  var {
    lsCacheSym,
    chindingsSym,
    writeSym,
    serializersSym,
    formatOptsSym,
    endSym,
    stringifiersSym,
    stringifySym,
    stringifySafeSym,
    wildcardFirstSym,
    nestedKeySym,
    formattersSym,
    messageKeySym,
    errorKeySym,
    nestedKeyStrSym,
    msgPrefixSym
  } = require_symbols();
  var { isMainThread } = __require("worker_threads");
  var transport = require_transport();
  var [nodeMajor] = process.versions.node.split(".").map((v) => Number(v));
  var asJsonChan = diagChan.tracingChannel("pino_asJson");
  var asString = nodeMajor >= 25 ? (str) => JSON.stringify(str) : _asString;
  function noop() {}
  function genLog(level, hook) {
    if (!hook)
      return LOG;
    return function hookWrappedLog(...args) {
      hook.call(this, args, LOG, level);
    };
    function LOG(o, ...n) {
      if (typeof o === "object") {
        let msg = o;
        if (o !== null) {
          if (o.method && o.headers && o.socket) {
            o = mapHttpRequest(o);
          } else if (typeof o.setHeader === "function") {
            o = mapHttpResponse(o);
          }
        }
        let formatParams;
        if (msg === null && n.length === 0) {
          formatParams = [null];
        } else {
          msg = n.shift();
          formatParams = n;
        }
        if (typeof this[msgPrefixSym] === "string" && msg !== undefined && msg !== null) {
          msg = this[msgPrefixSym] + msg;
        }
        this[writeSym](o, format(msg, formatParams, this[formatOptsSym]), level);
      } else {
        let msg = o === undefined ? n.shift() : o;
        if (typeof this[msgPrefixSym] === "string" && msg !== undefined && msg !== null) {
          msg = this[msgPrefixSym] + msg;
        }
        this[writeSym](null, format(msg, n, this[formatOptsSym]), level);
      }
    }
  }
  function _asString(str) {
    let result = "";
    let last = 0;
    let found = false;
    let point = 255;
    const l = str.length;
    if (l > 100) {
      return JSON.stringify(str);
    }
    for (var i = 0;i < l && point >= 32; i++) {
      point = str.charCodeAt(i);
      if (point === 34 || point === 92) {
        result += str.slice(last, i) + "\\";
        last = i;
        found = true;
      }
    }
    if (!found) {
      result = str;
    } else {
      result += str.slice(last);
    }
    return point < 32 ? JSON.stringify(str) : '"' + result + '"';
  }
  function asJson(obj, msg, num, time) {
    if (asJsonChan.hasSubscribers === false) {
      return _asJson.call(this, obj, msg, num, time);
    }
    const store = { instance: this, arguments };
    return asJsonChan.traceSync(_asJson, store, this, obj, msg, num, time);
  }
  function _asJson(obj, msg, num, time) {
    const stringify2 = this[stringifySym];
    const stringifySafe = this[stringifySafeSym];
    const stringifiers = this[stringifiersSym];
    const end = this[endSym];
    const chindings = this[chindingsSym];
    const serializers = this[serializersSym];
    const formatters = this[formattersSym];
    const messageKey = this[messageKeySym];
    const errorKey = this[errorKeySym];
    let data = this[lsCacheSym][num] + time;
    data = data + chindings;
    let value;
    if (formatters.log) {
      obj = formatters.log(obj);
    }
    const wildcardStringifier = stringifiers[wildcardFirstSym];
    let propStr = "";
    for (const key in obj) {
      value = obj[key];
      if (Object.prototype.hasOwnProperty.call(obj, key) && value !== undefined) {
        if (serializers[key]) {
          value = serializers[key](value);
        } else if (key === errorKey && serializers.err) {
          value = serializers.err(value);
        }
        const stringifier = stringifiers[key] || wildcardStringifier;
        switch (typeof value) {
          case "undefined":
          case "function":
            continue;
          case "number":
            if (Number.isFinite(value) === false) {
              value = null;
            }
          case "boolean":
            if (stringifier)
              value = stringifier(value);
            break;
          case "string":
            value = (stringifier || asString)(value);
            break;
          default:
            value = (stringifier || stringify2)(value, stringifySafe);
        }
        if (value === undefined)
          continue;
        const strKey = asString(key);
        propStr += "," + strKey + ":" + value;
      }
    }
    let msgStr = "";
    if (msg !== undefined) {
      value = serializers[messageKey] ? serializers[messageKey](msg) : msg;
      const stringifier = stringifiers[messageKey] || wildcardStringifier;
      switch (typeof value) {
        case "function":
          break;
        case "number":
          if (Number.isFinite(value) === false) {
            value = null;
          }
        case "boolean":
          if (stringifier)
            value = stringifier(value);
          msgStr = ',"' + messageKey + '":' + value;
          break;
        case "string":
          value = (stringifier || asString)(value);
          msgStr = ',"' + messageKey + '":' + value;
          break;
        default:
          value = (stringifier || stringify2)(value, stringifySafe);
          msgStr = ',"' + messageKey + '":' + value;
      }
    }
    if (this[nestedKeySym] && propStr) {
      return data + this[nestedKeyStrSym] + propStr.slice(1) + "}" + msgStr + end;
    } else {
      return data + propStr + msgStr + end;
    }
  }
  function asChindings(instance, bindings) {
    let value;
    let data = instance[chindingsSym];
    const stringify2 = instance[stringifySym];
    const stringifySafe = instance[stringifySafeSym];
    const stringifiers = instance[stringifiersSym];
    const wildcardStringifier = stringifiers[wildcardFirstSym];
    const serializers = instance[serializersSym];
    const formatter = instance[formattersSym].bindings;
    bindings = formatter(bindings);
    for (const key in bindings) {
      value = bindings[key];
      const valid = (key.length < 5 || key !== "level" && key !== "serializers" && key !== "formatters" && key !== "customLevels") && bindings.hasOwnProperty(key) && value !== undefined;
      if (valid === true) {
        value = serializers[key] ? serializers[key](value) : value;
        value = (stringifiers[key] || wildcardStringifier || stringify2)(value, stringifySafe);
        if (value === undefined)
          continue;
        data += ',"' + key + '":' + value;
      }
    }
    return data;
  }
  function hasBeenTampered(stream) {
    return stream.write !== stream.constructor.prototype.write;
  }
  function buildSafeSonicBoom(opts) {
    const stream = new SonicBoom(opts);
    stream.on("error", filterBrokenPipe);
    if (!opts.sync && isMainThread) {
      onExit.register(stream, autoEnd);
      stream.on("close", function() {
        onExit.unregister(stream);
      });
    }
    return stream;
    function filterBrokenPipe(err) {
      if (err.code === "EPIPE") {
        stream.write = noop;
        stream.end = noop;
        stream.flushSync = noop;
        stream.destroy = noop;
        return;
      }
      stream.removeListener("error", filterBrokenPipe);
      stream.emit("error", err);
    }
  }
  function autoEnd(stream, eventName) {
    if (stream.destroyed) {
      return;
    }
    if (eventName === "beforeExit") {
      stream.flush();
      stream.on("drain", function() {
        stream.end();
      });
    } else {
      stream.flushSync();
    }
  }
  function createArgsNormalizer(defaultOptions) {
    return function normalizeArgs(instance, caller, opts = {}, stream) {
      if (typeof opts === "string") {
        stream = buildSafeSonicBoom({ dest: opts });
        opts = {};
      } else if (typeof stream === "string") {
        if (opts && opts.transport) {
          throw Error("only one of option.transport or stream can be specified");
        }
        stream = buildSafeSonicBoom({ dest: stream });
      } else if (opts instanceof SonicBoom || opts.writable || opts._writableState) {
        stream = opts;
        opts = {};
      } else if (opts.transport) {
        if (opts.transport instanceof SonicBoom || opts.transport.writable || opts.transport._writableState) {
          throw Error("option.transport do not allow stream, please pass to option directly. e.g. pino(transport)");
        }
        if (opts.transport.targets && opts.transport.targets.length && opts.formatters && typeof opts.formatters.level === "function") {
          throw Error("option.transport.targets do not allow custom level formatters");
        }
        let customLevels;
        if (opts.customLevels) {
          customLevels = opts.useOnlyCustomLevels ? opts.customLevels : Object.assign({}, opts.levels, opts.customLevels);
        }
        stream = transport({ caller, ...opts.transport, levels: customLevels });
      }
      opts = Object.assign({}, defaultOptions, opts);
      opts.serializers = Object.assign({}, defaultOptions.serializers, opts.serializers);
      opts.formatters = Object.assign({}, defaultOptions.formatters, opts.formatters);
      if (opts.prettyPrint) {
        throw new Error("prettyPrint option is no longer supported, see the pino-pretty package (https://github.com/pinojs/pino-pretty)");
      }
      const { enabled, onChild } = opts;
      if (enabled === false)
        opts.level = "silent";
      if (!onChild)
        opts.onChild = noop;
      if (!stream) {
        if (!hasBeenTampered(process.stdout)) {
          stream = buildSafeSonicBoom({ fd: process.stdout.fd || 1 });
        } else {
          stream = process.stdout;
        }
      }
      return { opts, stream };
    };
  }
  function stringify(obj, stringifySafeFn) {
    try {
      return JSON.stringify(obj);
    } catch (_) {
      try {
        const stringify2 = stringifySafeFn || this[stringifySafeSym];
        return stringify2(obj);
      } catch (_2) {
        return '"[unable to serialize, circular reference is too complex to analyze]"';
      }
    }
  }
  function buildFormatters(level, bindings, log) {
    return {
      level,
      bindings,
      log
    };
  }
  function normalizeDestFileDescriptor(destination) {
    const fd = Number(destination);
    if (typeof destination === "string" && Number.isFinite(fd)) {
      return fd;
    }
    if (destination === undefined) {
      return 1;
    }
    return destination;
  }
  module.exports = {
    noop,
    buildSafeSonicBoom,
    asChindings,
    asJson,
    genLog,
    createArgsNormalizer,
    stringify,
    buildFormatters,
    normalizeDestFileDescriptor
  };
});

// node_modules/pino/lib/constants.js
var require_constants = __commonJS((exports, module) => {
  var DEFAULT_LEVELS = {
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60
  };
  var SORTING_ORDER = {
    ASC: "ASC",
    DESC: "DESC"
  };
  module.exports = {
    DEFAULT_LEVELS,
    SORTING_ORDER
  };
});

// node_modules/pino/lib/levels.js
var require_levels = __commonJS((exports, module) => {
  var {
    lsCacheSym,
    levelValSym,
    useOnlyCustomLevelsSym,
    streamSym,
    formattersSym,
    hooksSym,
    levelCompSym
  } = require_symbols();
  var { noop, genLog } = require_tools();
  var { DEFAULT_LEVELS, SORTING_ORDER } = require_constants();
  var levelMethods = {
    fatal: (hook) => {
      const logFatal = genLog(DEFAULT_LEVELS.fatal, hook);
      return function(...args) {
        const stream = this[streamSym];
        logFatal.call(this, ...args);
        if (typeof stream.flushSync === "function") {
          try {
            stream.flushSync();
          } catch (e) {}
        }
      };
    },
    error: (hook) => genLog(DEFAULT_LEVELS.error, hook),
    warn: (hook) => genLog(DEFAULT_LEVELS.warn, hook),
    info: (hook) => genLog(DEFAULT_LEVELS.info, hook),
    debug: (hook) => genLog(DEFAULT_LEVELS.debug, hook),
    trace: (hook) => genLog(DEFAULT_LEVELS.trace, hook)
  };
  var nums = Object.keys(DEFAULT_LEVELS).reduce((o, k) => {
    o[DEFAULT_LEVELS[k]] = k;
    return o;
  }, {});
  var initialLsCache = Object.keys(nums).reduce((o, k) => {
    o[k] = '{"level":' + Number(k);
    return o;
  }, {});
  function genLsCache(instance) {
    const formatter = instance[formattersSym].level;
    const { labels } = instance.levels;
    const cache = {};
    for (const label in labels) {
      const level = formatter(labels[label], Number(label));
      cache[label] = JSON.stringify(level).slice(0, -1);
    }
    instance[lsCacheSym] = cache;
    return instance;
  }
  function isStandardLevel(level, useOnlyCustomLevels) {
    if (useOnlyCustomLevels) {
      return false;
    }
    switch (level) {
      case "fatal":
      case "error":
      case "warn":
      case "info":
      case "debug":
      case "trace":
        return true;
      default:
        return false;
    }
  }
  function setLevel(level) {
    const { labels, values } = this.levels;
    if (typeof level === "number") {
      if (labels[level] === undefined)
        throw Error("unknown level value" + level);
      level = labels[level];
    }
    if (values[level] === undefined)
      throw Error("unknown level " + level);
    const preLevelVal = this[levelValSym];
    const levelVal = this[levelValSym] = values[level];
    const useOnlyCustomLevelsVal = this[useOnlyCustomLevelsSym];
    const levelComparison = this[levelCompSym];
    const hook = this[hooksSym].logMethod;
    for (const key in values) {
      if (levelComparison(values[key], levelVal) === false) {
        this[key] = noop;
        continue;
      }
      this[key] = isStandardLevel(key, useOnlyCustomLevelsVal) ? levelMethods[key](hook) : genLog(values[key], hook);
    }
    this.emit("level-change", level, levelVal, labels[preLevelVal], preLevelVal, this);
  }
  function getLevel(level) {
    const { levels, levelVal } = this;
    return levels && levels.labels ? levels.labels[levelVal] : "";
  }
  function isLevelEnabled(logLevel) {
    const { values } = this.levels;
    const logLevelVal = values[logLevel];
    return logLevelVal !== undefined && this[levelCompSym](logLevelVal, this[levelValSym]);
  }
  function compareLevel(direction, current, expected) {
    if (direction === SORTING_ORDER.DESC) {
      return current <= expected;
    }
    return current >= expected;
  }
  function genLevelComparison(levelComparison) {
    if (typeof levelComparison === "string") {
      return compareLevel.bind(null, levelComparison);
    }
    return levelComparison;
  }
  function mappings(customLevels = null, useOnlyCustomLevels = false) {
    const customNums = customLevels ? Object.keys(customLevels).reduce((o, k) => {
      o[customLevels[k]] = k;
      return o;
    }, {}) : null;
    const labels = Object.assign(Object.create(Object.prototype, { Infinity: { value: "silent" } }), useOnlyCustomLevels ? null : nums, customNums);
    const values = Object.assign(Object.create(Object.prototype, { silent: { value: Infinity } }), useOnlyCustomLevels ? null : DEFAULT_LEVELS, customLevels);
    return { labels, values };
  }
  function assertDefaultLevelFound(defaultLevel, customLevels, useOnlyCustomLevels) {
    if (typeof defaultLevel === "number") {
      const values = [].concat(Object.keys(customLevels || {}).map((key) => customLevels[key]), useOnlyCustomLevels ? [] : Object.keys(nums).map((level) => +level), Infinity);
      if (!values.includes(defaultLevel)) {
        throw Error(`default level:${defaultLevel} must be included in custom levels`);
      }
      return;
    }
    const labels = Object.assign(Object.create(Object.prototype, { silent: { value: Infinity } }), useOnlyCustomLevels ? null : DEFAULT_LEVELS, customLevels);
    if (!(defaultLevel in labels)) {
      throw Error(`default level:${defaultLevel} must be included in custom levels`);
    }
  }
  function assertNoLevelCollisions(levels, customLevels) {
    const { labels, values } = levels;
    for (const k in customLevels) {
      if (k in values) {
        throw Error("levels cannot be overridden");
      }
      if (customLevels[k] in labels) {
        throw Error("pre-existing level values cannot be used for new levels");
      }
    }
  }
  function assertLevelComparison(levelComparison) {
    if (typeof levelComparison === "function") {
      return;
    }
    if (typeof levelComparison === "string" && Object.values(SORTING_ORDER).includes(levelComparison)) {
      return;
    }
    throw new Error('Levels comparison should be one of "ASC", "DESC" or "function" type');
  }
  module.exports = {
    initialLsCache,
    genLsCache,
    levelMethods,
    getLevel,
    setLevel,
    isLevelEnabled,
    mappings,
    assertNoLevelCollisions,
    assertDefaultLevelFound,
    genLevelComparison,
    assertLevelComparison
  };
});

// node_modules/pino/lib/meta.js
var require_meta = __commonJS((exports, module) => {
  module.exports = { version: "10.3.1" };
});

// node_modules/pino/lib/proto.js
var require_proto = __commonJS((exports, module) => {
  var { EventEmitter } = __require("events");
  var {
    lsCacheSym,
    levelValSym,
    setLevelSym,
    getLevelSym,
    chindingsSym,
    mixinSym,
    asJsonSym,
    writeSym,
    mixinMergeStrategySym,
    timeSym,
    timeSliceIndexSym,
    streamSym,
    serializersSym,
    formattersSym,
    errorKeySym,
    messageKeySym,
    useOnlyCustomLevelsSym,
    needsMetadataGsym,
    redactFmtSym,
    stringifySym,
    formatOptsSym,
    stringifiersSym,
    msgPrefixSym,
    hooksSym
  } = require_symbols();
  var {
    getLevel,
    setLevel,
    isLevelEnabled,
    mappings,
    initialLsCache,
    genLsCache,
    assertNoLevelCollisions
  } = require_levels();
  var {
    asChindings,
    asJson,
    buildFormatters,
    stringify,
    noop
  } = require_tools();
  var {
    version
  } = require_meta();
  var redaction = require_redaction();
  var constructor = class Pino {
  };
  var prototype = {
    constructor,
    child,
    bindings,
    setBindings,
    flush,
    isLevelEnabled,
    version,
    get level() {
      return this[getLevelSym]();
    },
    set level(lvl) {
      this[setLevelSym](lvl);
    },
    get levelVal() {
      return this[levelValSym];
    },
    set levelVal(n) {
      throw Error("levelVal is read-only");
    },
    get msgPrefix() {
      return this[msgPrefixSym];
    },
    get [Symbol.toStringTag]() {
      return "Pino";
    },
    [lsCacheSym]: initialLsCache,
    [writeSym]: write,
    [asJsonSym]: asJson,
    [getLevelSym]: getLevel,
    [setLevelSym]: setLevel
  };
  Object.setPrototypeOf(prototype, EventEmitter.prototype);
  module.exports = function() {
    return Object.create(prototype);
  };
  var resetChildingsFormatter = (bindings2) => bindings2;
  function child(bindings2, options) {
    if (!bindings2) {
      throw Error("missing bindings for child Pino");
    }
    const serializers = this[serializersSym];
    const formatters = this[formattersSym];
    const instance = Object.create(this);
    if (options == null) {
      if (instance[formattersSym].bindings !== resetChildingsFormatter) {
        instance[formattersSym] = buildFormatters(formatters.level, resetChildingsFormatter, formatters.log);
      }
      instance[chindingsSym] = asChindings(instance, bindings2);
      if (this.onChild !== noop) {
        this.onChild(instance);
      }
      return instance;
    }
    if (options.hasOwnProperty("serializers") === true) {
      instance[serializersSym] = Object.create(null);
      for (const k in serializers) {
        instance[serializersSym][k] = serializers[k];
      }
      const parentSymbols = Object.getOwnPropertySymbols(serializers);
      for (var i = 0;i < parentSymbols.length; i++) {
        const ks = parentSymbols[i];
        instance[serializersSym][ks] = serializers[ks];
      }
      for (const bk in options.serializers) {
        instance[serializersSym][bk] = options.serializers[bk];
      }
      const bindingsSymbols = Object.getOwnPropertySymbols(options.serializers);
      for (var bi = 0;bi < bindingsSymbols.length; bi++) {
        const bks = bindingsSymbols[bi];
        instance[serializersSym][bks] = options.serializers[bks];
      }
    } else
      instance[serializersSym] = serializers;
    if (options.hasOwnProperty("formatters")) {
      const { level, bindings: chindings, log } = options.formatters;
      instance[formattersSym] = buildFormatters(level || formatters.level, chindings || resetChildingsFormatter, log || formatters.log);
    } else {
      instance[formattersSym] = buildFormatters(formatters.level, resetChildingsFormatter, formatters.log);
    }
    if (options.hasOwnProperty("customLevels") === true) {
      assertNoLevelCollisions(this.levels, options.customLevels);
      instance.levels = mappings(options.customLevels, instance[useOnlyCustomLevelsSym]);
      genLsCache(instance);
    }
    if (typeof options.redact === "object" && options.redact !== null || Array.isArray(options.redact)) {
      instance.redact = options.redact;
      const stringifiers = redaction(instance.redact, stringify);
      const formatOpts = { stringify: stringifiers[redactFmtSym] };
      instance[stringifySym] = stringify;
      instance[stringifiersSym] = stringifiers;
      instance[formatOptsSym] = formatOpts;
    }
    if (typeof options.msgPrefix === "string") {
      instance[msgPrefixSym] = (this[msgPrefixSym] || "") + options.msgPrefix;
    }
    instance[chindingsSym] = asChindings(instance, bindings2);
    if (options.level !== undefined && options.level !== this.level || options.hasOwnProperty("customLevels")) {
      const childLevel = options.level || this.level;
      instance[setLevelSym](childLevel);
    }
    this.onChild(instance);
    return instance;
  }
  function bindings() {
    const chindings = this[chindingsSym];
    const chindingsJson = `{${chindings.substr(1)}}`;
    const bindingsFromJson = JSON.parse(chindingsJson);
    delete bindingsFromJson.pid;
    delete bindingsFromJson.hostname;
    return bindingsFromJson;
  }
  function setBindings(newBindings) {
    const chindings = asChindings(this, newBindings);
    this[chindingsSym] = chindings;
  }
  function defaultMixinMergeStrategy(mergeObject, mixinObject) {
    return Object.assign(mixinObject, mergeObject);
  }
  function write(_obj, msg, num) {
    const t = this[timeSym]();
    const mixin = this[mixinSym];
    const errorKey = this[errorKeySym];
    const messageKey = this[messageKeySym];
    const mixinMergeStrategy = this[mixinMergeStrategySym] || defaultMixinMergeStrategy;
    let obj;
    const streamWriteHook = this[hooksSym].streamWrite;
    if (_obj === undefined || _obj === null) {
      obj = {};
    } else if (_obj instanceof Error) {
      obj = { [errorKey]: _obj };
      if (msg === undefined) {
        msg = _obj.message;
      }
    } else {
      obj = _obj;
      if (msg === undefined && _obj[messageKey] === undefined && _obj[errorKey]) {
        msg = _obj[errorKey].message;
      }
    }
    if (mixin) {
      obj = mixinMergeStrategy(obj, mixin(obj, num, this));
    }
    const s = this[asJsonSym](obj, msg, num, t);
    const stream = this[streamSym];
    if (stream[needsMetadataGsym] === true) {
      stream.lastLevel = num;
      stream.lastObj = obj;
      stream.lastMsg = msg;
      stream.lastTime = t.slice(this[timeSliceIndexSym]);
      stream.lastLogger = this;
    }
    stream.write(streamWriteHook ? streamWriteHook(s) : s);
  }
  function flush(cb) {
    if (cb != null && typeof cb !== "function") {
      throw Error("callback must be a function");
    }
    const stream = this[streamSym];
    if (typeof stream.flush === "function") {
      stream.flush(cb || noop);
    } else if (cb)
      cb();
  }
});

// node_modules/safe-stable-stringify/index.js
var require_safe_stable_stringify = __commonJS((exports, module) => {
  var { hasOwnProperty } = Object.prototype;
  var stringify = configure();
  stringify.configure = configure;
  stringify.stringify = stringify;
  stringify.default = stringify;
  exports.stringify = stringify;
  exports.configure = configure;
  module.exports = stringify;
  var strEscapeSequencesRegExp = /[\u0000-\u001f\u0022\u005c\ud800-\udfff]/;
  function strEscape(str) {
    if (str.length < 5000 && !strEscapeSequencesRegExp.test(str)) {
      return `"${str}"`;
    }
    return JSON.stringify(str);
  }
  function sort(array, comparator) {
    if (array.length > 200 || comparator) {
      return array.sort(comparator);
    }
    for (let i = 1;i < array.length; i++) {
      const currentValue = array[i];
      let position = i;
      while (position !== 0 && array[position - 1] > currentValue) {
        array[position] = array[position - 1];
        position--;
      }
      array[position] = currentValue;
    }
    return array;
  }
  var typedArrayPrototypeGetSymbolToStringTag = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Object.getPrototypeOf(new Int8Array)), Symbol.toStringTag).get;
  function isTypedArrayWithEntries(value) {
    return typedArrayPrototypeGetSymbolToStringTag.call(value) !== undefined && value.length !== 0;
  }
  function stringifyTypedArray(array, separator, maximumBreadth) {
    if (array.length < maximumBreadth) {
      maximumBreadth = array.length;
    }
    const whitespace = separator === "," ? "" : " ";
    let res = `"0":${whitespace}${array[0]}`;
    for (let i = 1;i < maximumBreadth; i++) {
      res += `${separator}"${i}":${whitespace}${array[i]}`;
    }
    return res;
  }
  function getCircularValueOption(options) {
    if (hasOwnProperty.call(options, "circularValue")) {
      const circularValue = options.circularValue;
      if (typeof circularValue === "string") {
        return `"${circularValue}"`;
      }
      if (circularValue == null) {
        return circularValue;
      }
      if (circularValue === Error || circularValue === TypeError) {
        return {
          toString() {
            throw new TypeError("Converting circular structure to JSON");
          }
        };
      }
      throw new TypeError('The "circularValue" argument must be of type string or the value null or undefined');
    }
    return '"[Circular]"';
  }
  function getDeterministicOption(options) {
    let value;
    if (hasOwnProperty.call(options, "deterministic")) {
      value = options.deterministic;
      if (typeof value !== "boolean" && typeof value !== "function") {
        throw new TypeError('The "deterministic" argument must be of type boolean or comparator function');
      }
    }
    return value === undefined ? true : value;
  }
  function getBooleanOption(options, key) {
    let value;
    if (hasOwnProperty.call(options, key)) {
      value = options[key];
      if (typeof value !== "boolean") {
        throw new TypeError(`The "${key}" argument must be of type boolean`);
      }
    }
    return value === undefined ? true : value;
  }
  function getPositiveIntegerOption(options, key) {
    let value;
    if (hasOwnProperty.call(options, key)) {
      value = options[key];
      if (typeof value !== "number") {
        throw new TypeError(`The "${key}" argument must be of type number`);
      }
      if (!Number.isInteger(value)) {
        throw new TypeError(`The "${key}" argument must be an integer`);
      }
      if (value < 1) {
        throw new RangeError(`The "${key}" argument must be >= 1`);
      }
    }
    return value === undefined ? Infinity : value;
  }
  function getItemCount(number) {
    if (number === 1) {
      return "1 item";
    }
    return `${number} items`;
  }
  function getUniqueReplacerSet(replacerArray) {
    const replacerSet = new Set;
    for (const value of replacerArray) {
      if (typeof value === "string" || typeof value === "number") {
        replacerSet.add(String(value));
      }
    }
    return replacerSet;
  }
  function getStrictOption(options) {
    if (hasOwnProperty.call(options, "strict")) {
      const value = options.strict;
      if (typeof value !== "boolean") {
        throw new TypeError('The "strict" argument must be of type boolean');
      }
      if (value) {
        return (value2) => {
          let message = `Object can not safely be stringified. Received type ${typeof value2}`;
          if (typeof value2 !== "function")
            message += ` (${value2.toString()})`;
          throw new Error(message);
        };
      }
    }
  }
  function configure(options) {
    options = { ...options };
    const fail = getStrictOption(options);
    if (fail) {
      if (options.bigint === undefined) {
        options.bigint = false;
      }
      if (!("circularValue" in options)) {
        options.circularValue = Error;
      }
    }
    const circularValue = getCircularValueOption(options);
    const bigint = getBooleanOption(options, "bigint");
    const deterministic = getDeterministicOption(options);
    const comparator = typeof deterministic === "function" ? deterministic : undefined;
    const maximumDepth = getPositiveIntegerOption(options, "maximumDepth");
    const maximumBreadth = getPositiveIntegerOption(options, "maximumBreadth");
    function stringifyFnReplacer(key, parent, stack, replacer, spacer, indentation) {
      let value = parent[key];
      if (typeof value === "object" && value !== null && typeof value.toJSON === "function") {
        value = value.toJSON(key);
      }
      value = replacer.call(parent, key, value);
      switch (typeof value) {
        case "string":
          return strEscape(value);
        case "object": {
          if (value === null) {
            return "null";
          }
          if (stack.indexOf(value) !== -1) {
            return circularValue;
          }
          let res = "";
          let join = ",";
          const originalIndentation = indentation;
          if (Array.isArray(value)) {
            if (value.length === 0) {
              return "[]";
            }
            if (maximumDepth < stack.length + 1) {
              return '"[Array]"';
            }
            stack.push(value);
            if (spacer !== "") {
              indentation += spacer;
              res += `
${indentation}`;
              join = `,
${indentation}`;
            }
            const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
            let i = 0;
            for (;i < maximumValuesToStringify - 1; i++) {
              const tmp2 = stringifyFnReplacer(String(i), value, stack, replacer, spacer, indentation);
              res += tmp2 !== undefined ? tmp2 : "null";
              res += join;
            }
            const tmp = stringifyFnReplacer(String(i), value, stack, replacer, spacer, indentation);
            res += tmp !== undefined ? tmp : "null";
            if (value.length - 1 > maximumBreadth) {
              const removedKeys = value.length - maximumBreadth - 1;
              res += `${join}"... ${getItemCount(removedKeys)} not stringified"`;
            }
            if (spacer !== "") {
              res += `
${originalIndentation}`;
            }
            stack.pop();
            return `[${res}]`;
          }
          let keys = Object.keys(value);
          const keyLength = keys.length;
          if (keyLength === 0) {
            return "{}";
          }
          if (maximumDepth < stack.length + 1) {
            return '"[Object]"';
          }
          let whitespace = "";
          let separator = "";
          if (spacer !== "") {
            indentation += spacer;
            join = `,
${indentation}`;
            whitespace = " ";
          }
          const maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
          if (deterministic && !isTypedArrayWithEntries(value)) {
            keys = sort(keys, comparator);
          }
          stack.push(value);
          for (let i = 0;i < maximumPropertiesToStringify; i++) {
            const key2 = keys[i];
            const tmp = stringifyFnReplacer(key2, value, stack, replacer, spacer, indentation);
            if (tmp !== undefined) {
              res += `${separator}${strEscape(key2)}:${whitespace}${tmp}`;
              separator = join;
            }
          }
          if (keyLength > maximumBreadth) {
            const removedKeys = keyLength - maximumBreadth;
            res += `${separator}"...":${whitespace}"${getItemCount(removedKeys)} not stringified"`;
            separator = join;
          }
          if (spacer !== "" && separator.length > 1) {
            res = `
${indentation}${res}
${originalIndentation}`;
          }
          stack.pop();
          return `{${res}}`;
        }
        case "number":
          return isFinite(value) ? String(value) : fail ? fail(value) : "null";
        case "boolean":
          return value === true ? "true" : "false";
        case "undefined":
          return;
        case "bigint":
          if (bigint) {
            return String(value);
          }
        default:
          return fail ? fail(value) : undefined;
      }
    }
    function stringifyArrayReplacer(key, value, stack, replacer, spacer, indentation) {
      if (typeof value === "object" && value !== null && typeof value.toJSON === "function") {
        value = value.toJSON(key);
      }
      switch (typeof value) {
        case "string":
          return strEscape(value);
        case "object": {
          if (value === null) {
            return "null";
          }
          if (stack.indexOf(value) !== -1) {
            return circularValue;
          }
          const originalIndentation = indentation;
          let res = "";
          let join = ",";
          if (Array.isArray(value)) {
            if (value.length === 0) {
              return "[]";
            }
            if (maximumDepth < stack.length + 1) {
              return '"[Array]"';
            }
            stack.push(value);
            if (spacer !== "") {
              indentation += spacer;
              res += `
${indentation}`;
              join = `,
${indentation}`;
            }
            const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
            let i = 0;
            for (;i < maximumValuesToStringify - 1; i++) {
              const tmp2 = stringifyArrayReplacer(String(i), value[i], stack, replacer, spacer, indentation);
              res += tmp2 !== undefined ? tmp2 : "null";
              res += join;
            }
            const tmp = stringifyArrayReplacer(String(i), value[i], stack, replacer, spacer, indentation);
            res += tmp !== undefined ? tmp : "null";
            if (value.length - 1 > maximumBreadth) {
              const removedKeys = value.length - maximumBreadth - 1;
              res += `${join}"... ${getItemCount(removedKeys)} not stringified"`;
            }
            if (spacer !== "") {
              res += `
${originalIndentation}`;
            }
            stack.pop();
            return `[${res}]`;
          }
          stack.push(value);
          let whitespace = "";
          if (spacer !== "") {
            indentation += spacer;
            join = `,
${indentation}`;
            whitespace = " ";
          }
          let separator = "";
          for (const key2 of replacer) {
            const tmp = stringifyArrayReplacer(key2, value[key2], stack, replacer, spacer, indentation);
            if (tmp !== undefined) {
              res += `${separator}${strEscape(key2)}:${whitespace}${tmp}`;
              separator = join;
            }
          }
          if (spacer !== "" && separator.length > 1) {
            res = `
${indentation}${res}
${originalIndentation}`;
          }
          stack.pop();
          return `{${res}}`;
        }
        case "number":
          return isFinite(value) ? String(value) : fail ? fail(value) : "null";
        case "boolean":
          return value === true ? "true" : "false";
        case "undefined":
          return;
        case "bigint":
          if (bigint) {
            return String(value);
          }
        default:
          return fail ? fail(value) : undefined;
      }
    }
    function stringifyIndent(key, value, stack, spacer, indentation) {
      switch (typeof value) {
        case "string":
          return strEscape(value);
        case "object": {
          if (value === null) {
            return "null";
          }
          if (typeof value.toJSON === "function") {
            value = value.toJSON(key);
            if (typeof value !== "object") {
              return stringifyIndent(key, value, stack, spacer, indentation);
            }
            if (value === null) {
              return "null";
            }
          }
          if (stack.indexOf(value) !== -1) {
            return circularValue;
          }
          const originalIndentation = indentation;
          if (Array.isArray(value)) {
            if (value.length === 0) {
              return "[]";
            }
            if (maximumDepth < stack.length + 1) {
              return '"[Array]"';
            }
            stack.push(value);
            indentation += spacer;
            let res2 = `
${indentation}`;
            const join2 = `,
${indentation}`;
            const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
            let i = 0;
            for (;i < maximumValuesToStringify - 1; i++) {
              const tmp2 = stringifyIndent(String(i), value[i], stack, spacer, indentation);
              res2 += tmp2 !== undefined ? tmp2 : "null";
              res2 += join2;
            }
            const tmp = stringifyIndent(String(i), value[i], stack, spacer, indentation);
            res2 += tmp !== undefined ? tmp : "null";
            if (value.length - 1 > maximumBreadth) {
              const removedKeys = value.length - maximumBreadth - 1;
              res2 += `${join2}"... ${getItemCount(removedKeys)} not stringified"`;
            }
            res2 += `
${originalIndentation}`;
            stack.pop();
            return `[${res2}]`;
          }
          let keys = Object.keys(value);
          const keyLength = keys.length;
          if (keyLength === 0) {
            return "{}";
          }
          if (maximumDepth < stack.length + 1) {
            return '"[Object]"';
          }
          indentation += spacer;
          const join = `,
${indentation}`;
          let res = "";
          let separator = "";
          let maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
          if (isTypedArrayWithEntries(value)) {
            res += stringifyTypedArray(value, join, maximumBreadth);
            keys = keys.slice(value.length);
            maximumPropertiesToStringify -= value.length;
            separator = join;
          }
          if (deterministic) {
            keys = sort(keys, comparator);
          }
          stack.push(value);
          for (let i = 0;i < maximumPropertiesToStringify; i++) {
            const key2 = keys[i];
            const tmp = stringifyIndent(key2, value[key2], stack, spacer, indentation);
            if (tmp !== undefined) {
              res += `${separator}${strEscape(key2)}: ${tmp}`;
              separator = join;
            }
          }
          if (keyLength > maximumBreadth) {
            const removedKeys = keyLength - maximumBreadth;
            res += `${separator}"...": "${getItemCount(removedKeys)} not stringified"`;
            separator = join;
          }
          if (separator !== "") {
            res = `
${indentation}${res}
${originalIndentation}`;
          }
          stack.pop();
          return `{${res}}`;
        }
        case "number":
          return isFinite(value) ? String(value) : fail ? fail(value) : "null";
        case "boolean":
          return value === true ? "true" : "false";
        case "undefined":
          return;
        case "bigint":
          if (bigint) {
            return String(value);
          }
        default:
          return fail ? fail(value) : undefined;
      }
    }
    function stringifySimple(key, value, stack) {
      switch (typeof value) {
        case "string":
          return strEscape(value);
        case "object": {
          if (value === null) {
            return "null";
          }
          if (typeof value.toJSON === "function") {
            value = value.toJSON(key);
            if (typeof value !== "object") {
              return stringifySimple(key, value, stack);
            }
            if (value === null) {
              return "null";
            }
          }
          if (stack.indexOf(value) !== -1) {
            return circularValue;
          }
          let res = "";
          const hasLength = value.length !== undefined;
          if (hasLength && Array.isArray(value)) {
            if (value.length === 0) {
              return "[]";
            }
            if (maximumDepth < stack.length + 1) {
              return '"[Array]"';
            }
            stack.push(value);
            const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
            let i = 0;
            for (;i < maximumValuesToStringify - 1; i++) {
              const tmp2 = stringifySimple(String(i), value[i], stack);
              res += tmp2 !== undefined ? tmp2 : "null";
              res += ",";
            }
            const tmp = stringifySimple(String(i), value[i], stack);
            res += tmp !== undefined ? tmp : "null";
            if (value.length - 1 > maximumBreadth) {
              const removedKeys = value.length - maximumBreadth - 1;
              res += `,"... ${getItemCount(removedKeys)} not stringified"`;
            }
            stack.pop();
            return `[${res}]`;
          }
          let keys = Object.keys(value);
          const keyLength = keys.length;
          if (keyLength === 0) {
            return "{}";
          }
          if (maximumDepth < stack.length + 1) {
            return '"[Object]"';
          }
          let separator = "";
          let maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
          if (hasLength && isTypedArrayWithEntries(value)) {
            res += stringifyTypedArray(value, ",", maximumBreadth);
            keys = keys.slice(value.length);
            maximumPropertiesToStringify -= value.length;
            separator = ",";
          }
          if (deterministic) {
            keys = sort(keys, comparator);
          }
          stack.push(value);
          for (let i = 0;i < maximumPropertiesToStringify; i++) {
            const key2 = keys[i];
            const tmp = stringifySimple(key2, value[key2], stack);
            if (tmp !== undefined) {
              res += `${separator}${strEscape(key2)}:${tmp}`;
              separator = ",";
            }
          }
          if (keyLength > maximumBreadth) {
            const removedKeys = keyLength - maximumBreadth;
            res += `${separator}"...":"${getItemCount(removedKeys)} not stringified"`;
          }
          stack.pop();
          return `{${res}}`;
        }
        case "number":
          return isFinite(value) ? String(value) : fail ? fail(value) : "null";
        case "boolean":
          return value === true ? "true" : "false";
        case "undefined":
          return;
        case "bigint":
          if (bigint) {
            return String(value);
          }
        default:
          return fail ? fail(value) : undefined;
      }
    }
    function stringify2(value, replacer, space) {
      if (arguments.length > 1) {
        let spacer = "";
        if (typeof space === "number") {
          spacer = " ".repeat(Math.min(space, 10));
        } else if (typeof space === "string") {
          spacer = space.slice(0, 10);
        }
        if (replacer != null) {
          if (typeof replacer === "function") {
            return stringifyFnReplacer("", { "": value }, [], replacer, spacer, "");
          }
          if (Array.isArray(replacer)) {
            return stringifyArrayReplacer("", value, [], getUniqueReplacerSet(replacer), spacer, "");
          }
        }
        if (spacer.length !== 0) {
          return stringifyIndent("", value, [], spacer, "");
        }
      }
      return stringifySimple("", value, []);
    }
    return stringify2;
  }
});

// node_modules/pino/lib/multistream.js
var require_multistream = __commonJS((exports, module) => {
  var metadata = Symbol.for("pino.metadata");
  var { DEFAULT_LEVELS } = require_constants();
  var DEFAULT_INFO_LEVEL = DEFAULT_LEVELS.info;
  function multistream(streamsArray, opts) {
    streamsArray = streamsArray || [];
    opts = opts || { dedupe: false };
    const streamLevels = Object.create(DEFAULT_LEVELS);
    streamLevels.silent = Infinity;
    if (opts.levels && typeof opts.levels === "object") {
      Object.keys(opts.levels).forEach((i) => {
        streamLevels[i] = opts.levels[i];
      });
    }
    const res = {
      write,
      add,
      remove,
      emit,
      flushSync,
      end,
      minLevel: 0,
      lastId: 0,
      streams: [],
      clone,
      [metadata]: true,
      streamLevels
    };
    if (Array.isArray(streamsArray)) {
      streamsArray.forEach(add, res);
    } else {
      add.call(res, streamsArray);
    }
    streamsArray = null;
    return res;
    function write(data) {
      let dest;
      const level = this.lastLevel;
      const { streams } = this;
      let recordedLevel = 0;
      let stream;
      for (let i = initLoopVar(streams.length, opts.dedupe);checkLoopVar(i, streams.length, opts.dedupe); i = adjustLoopVar(i, opts.dedupe)) {
        dest = streams[i];
        if (dest.level <= level) {
          if (recordedLevel !== 0 && recordedLevel !== dest.level) {
            break;
          }
          stream = dest.stream;
          if (stream[metadata]) {
            const { lastTime, lastMsg, lastObj, lastLogger } = this;
            stream.lastLevel = level;
            stream.lastTime = lastTime;
            stream.lastMsg = lastMsg;
            stream.lastObj = lastObj;
            stream.lastLogger = lastLogger;
          }
          stream.write(data);
          if (opts.dedupe) {
            recordedLevel = dest.level;
          }
        } else if (!opts.dedupe) {
          break;
        }
      }
    }
    function emit(...args) {
      for (const { stream } of this.streams) {
        if (typeof stream.emit === "function") {
          stream.emit(...args);
        }
      }
    }
    function flushSync() {
      for (const { stream } of this.streams) {
        if (typeof stream.flushSync === "function") {
          stream.flushSync();
        }
      }
    }
    function add(dest) {
      if (!dest) {
        return res;
      }
      const isStream = typeof dest.write === "function" || dest.stream;
      const stream_ = dest.write ? dest : dest.stream;
      if (!isStream) {
        throw Error("stream object needs to implement either StreamEntry or DestinationStream interface");
      }
      const { streams, streamLevels: streamLevels2 } = this;
      let level;
      if (typeof dest.levelVal === "number") {
        level = dest.levelVal;
      } else if (typeof dest.level === "string") {
        level = streamLevels2[dest.level];
      } else if (typeof dest.level === "number") {
        level = dest.level;
      } else {
        level = DEFAULT_INFO_LEVEL;
      }
      const dest_ = {
        stream: stream_,
        level,
        levelVal: undefined,
        id: ++res.lastId
      };
      streams.unshift(dest_);
      streams.sort(compareByLevel);
      this.minLevel = streams[0].level;
      return res;
    }
    function remove(id) {
      const { streams } = this;
      const index = streams.findIndex((s) => s.id === id);
      if (index >= 0) {
        streams.splice(index, 1);
        streams.sort(compareByLevel);
        this.minLevel = streams.length > 0 ? streams[0].level : -1;
      }
      return res;
    }
    function end() {
      for (const { stream } of this.streams) {
        if (typeof stream.flushSync === "function") {
          stream.flushSync();
        }
        stream.end();
      }
    }
    function clone(level) {
      const streams = new Array(this.streams.length);
      for (let i = 0;i < streams.length; i++) {
        streams[i] = {
          level,
          stream: this.streams[i].stream
        };
      }
      return {
        write,
        add,
        remove,
        minLevel: level,
        streams,
        clone,
        emit,
        flushSync,
        [metadata]: true
      };
    }
  }
  function compareByLevel(a, b) {
    return a.level - b.level;
  }
  function initLoopVar(length, dedupe) {
    return dedupe ? length - 1 : 0;
  }
  function adjustLoopVar(i, dedupe) {
    return dedupe ? i - 1 : i + 1;
  }
  function checkLoopVar(i, length, dedupe) {
    return dedupe ? i >= 0 : i < length;
  }
  module.exports = multistream;
});

// node_modules/pino/pino.js
var require_pino = __commonJS((exports, module) => {
  var os = __require("os");
  var stdSerializers = require_pino_std_serializers();
  var caller = require_caller();
  var redaction = require_redaction();
  var time = require_time();
  var proto = require_proto();
  var symbols = require_symbols();
  var { configure } = require_safe_stable_stringify();
  var { assertDefaultLevelFound, mappings, genLsCache, genLevelComparison, assertLevelComparison } = require_levels();
  var { DEFAULT_LEVELS, SORTING_ORDER } = require_constants();
  var {
    createArgsNormalizer,
    asChindings,
    buildSafeSonicBoom,
    buildFormatters,
    stringify,
    normalizeDestFileDescriptor,
    noop
  } = require_tools();
  var { version } = require_meta();
  var {
    chindingsSym,
    redactFmtSym,
    serializersSym,
    timeSym,
    timeSliceIndexSym,
    streamSym,
    stringifySym,
    stringifySafeSym,
    stringifiersSym,
    setLevelSym,
    endSym,
    formatOptsSym,
    messageKeySym,
    errorKeySym,
    nestedKeySym,
    mixinSym,
    levelCompSym,
    useOnlyCustomLevelsSym,
    formattersSym,
    hooksSym,
    nestedKeyStrSym,
    mixinMergeStrategySym,
    msgPrefixSym
  } = symbols;
  var { epochTime, nullTime } = time;
  var { pid } = process;
  var hostname = os.hostname();
  var defaultErrorSerializer = stdSerializers.err;
  var defaultOptions = {
    level: "info",
    levelComparison: SORTING_ORDER.ASC,
    levels: DEFAULT_LEVELS,
    messageKey: "msg",
    errorKey: "err",
    nestedKey: null,
    enabled: true,
    base: { pid, hostname },
    serializers: Object.assign(Object.create(null), {
      err: defaultErrorSerializer
    }),
    formatters: Object.assign(Object.create(null), {
      bindings(bindings) {
        return bindings;
      },
      level(label, number) {
        return { level: number };
      }
    }),
    hooks: {
      logMethod: undefined,
      streamWrite: undefined
    },
    timestamp: epochTime,
    name: undefined,
    redact: null,
    customLevels: null,
    useOnlyCustomLevels: false,
    depthLimit: 5,
    edgeLimit: 100
  };
  var normalize = createArgsNormalizer(defaultOptions);
  var serializers = Object.assign(Object.create(null), stdSerializers);
  function pino(...args) {
    const instance = {};
    const { opts, stream } = normalize(instance, caller(), ...args);
    if (opts.level && typeof opts.level === "string" && DEFAULT_LEVELS[opts.level.toLowerCase()] !== undefined)
      opts.level = opts.level.toLowerCase();
    const {
      redact,
      crlf,
      serializers: serializers2,
      timestamp,
      messageKey,
      errorKey,
      nestedKey,
      base,
      name,
      level,
      customLevels,
      levelComparison,
      mixin,
      mixinMergeStrategy,
      useOnlyCustomLevels,
      formatters,
      hooks,
      depthLimit,
      edgeLimit,
      onChild,
      msgPrefix
    } = opts;
    const stringifySafe = configure({
      maximumDepth: depthLimit,
      maximumBreadth: edgeLimit
    });
    const allFormatters = buildFormatters(formatters.level, formatters.bindings, formatters.log);
    const stringifyFn = stringify.bind({
      [stringifySafeSym]: stringifySafe
    });
    const stringifiers = redact ? redaction(redact, stringifyFn) : {};
    const formatOpts = redact ? { stringify: stringifiers[redactFmtSym] } : { stringify: stringifyFn };
    const end = "}" + (crlf ? `\r
` : `
`);
    const coreChindings = asChindings.bind(null, {
      [chindingsSym]: "",
      [serializersSym]: serializers2,
      [stringifiersSym]: stringifiers,
      [stringifySym]: stringify,
      [stringifySafeSym]: stringifySafe,
      [formattersSym]: allFormatters
    });
    let chindings = "";
    if (base !== null) {
      if (name === undefined) {
        chindings = coreChindings(base);
      } else {
        chindings = coreChindings(Object.assign({}, base, { name }));
      }
    }
    const time2 = timestamp instanceof Function ? timestamp : timestamp ? epochTime : nullTime;
    const timeSliceIndex = time2().indexOf(":") + 1;
    if (useOnlyCustomLevels && !customLevels)
      throw Error("customLevels is required if useOnlyCustomLevels is set true");
    if (mixin && typeof mixin !== "function")
      throw Error(`Unknown mixin type "${typeof mixin}" - expected "function"`);
    if (msgPrefix && typeof msgPrefix !== "string")
      throw Error(`Unknown msgPrefix type "${typeof msgPrefix}" - expected "string"`);
    assertDefaultLevelFound(level, customLevels, useOnlyCustomLevels);
    const levels = mappings(customLevels, useOnlyCustomLevels);
    if (typeof stream.emit === "function") {
      stream.emit("message", { code: "PINO_CONFIG", config: { levels, messageKey, errorKey } });
    }
    assertLevelComparison(levelComparison);
    const levelCompFunc = genLevelComparison(levelComparison);
    Object.assign(instance, {
      levels,
      [levelCompSym]: levelCompFunc,
      [useOnlyCustomLevelsSym]: useOnlyCustomLevels,
      [streamSym]: stream,
      [timeSym]: time2,
      [timeSliceIndexSym]: timeSliceIndex,
      [stringifySym]: stringify,
      [stringifySafeSym]: stringifySafe,
      [stringifiersSym]: stringifiers,
      [endSym]: end,
      [formatOptsSym]: formatOpts,
      [messageKeySym]: messageKey,
      [errorKeySym]: errorKey,
      [nestedKeySym]: nestedKey,
      [nestedKeyStrSym]: nestedKey ? `,${JSON.stringify(nestedKey)}:{` : "",
      [serializersSym]: serializers2,
      [mixinSym]: mixin,
      [mixinMergeStrategySym]: mixinMergeStrategy,
      [chindingsSym]: chindings,
      [formattersSym]: allFormatters,
      [hooksSym]: hooks,
      silent: noop,
      onChild,
      [msgPrefixSym]: msgPrefix
    });
    Object.setPrototypeOf(instance, proto());
    genLsCache(instance);
    instance[setLevelSym](level);
    return instance;
  }
  module.exports = pino;
  module.exports.destination = (dest = process.stdout.fd) => {
    if (typeof dest === "object") {
      dest.dest = normalizeDestFileDescriptor(dest.dest || process.stdout.fd);
      return buildSafeSonicBoom(dest);
    } else {
      return buildSafeSonicBoom({ dest: normalizeDestFileDescriptor(dest), minLength: 0 });
    }
  };
  module.exports.transport = require_transport();
  module.exports.multistream = require_multistream();
  module.exports.levels = mappings();
  module.exports.stdSerializers = serializers;
  module.exports.stdTimeFunctions = Object.assign({}, time);
  module.exports.symbols = symbols;
  module.exports.version = version;
  module.exports.default = pino;
  module.exports.pino = pino;
});

// node_modules/colorette/index.cjs
var require_colorette = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var tty = __require("tty");
  function _interopNamespace(e) {
    if (e && e.__esModule)
      return e;
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function(k) {
        if (k !== "default") {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function() {
              return e[k];
            }
          });
        }
      });
    }
    n["default"] = e;
    return Object.freeze(n);
  }
  var tty__namespace = /* @__PURE__ */ _interopNamespace(tty);
  var {
    env = {},
    argv = [],
    platform = ""
  } = typeof process === "undefined" ? {} : process;
  var isDisabled = "NO_COLOR" in env || argv.includes("--no-color");
  var isForced = "FORCE_COLOR" in env || argv.includes("--color");
  var isWindows = platform === "win32";
  var isDumbTerminal = env.TERM === "dumb";
  var isCompatibleTerminal = tty__namespace && tty__namespace.isatty && tty__namespace.isatty(1) && env.TERM && !isDumbTerminal;
  var isCI = "CI" in env && (("GITHUB_ACTIONS" in env) || ("GITLAB_CI" in env) || ("CIRCLECI" in env));
  var isColorSupported = !isDisabled && (isForced || isWindows && !isDumbTerminal || isCompatibleTerminal || isCI);
  var replaceClose = (index, string, close, replace, head = string.substring(0, index) + replace, tail = string.substring(index + close.length), next = tail.indexOf(close)) => head + (next < 0 ? tail : replaceClose(next, tail, close, replace));
  var clearBleed = (index, string, open, close, replace) => index < 0 ? open + string + close : open + replaceClose(index, string, close, replace) + close;
  var filterEmpty = (open, close, replace = open, at = open.length + 1) => (string) => string || !(string === "" || string === undefined) ? clearBleed(("" + string).indexOf(close, at), string, open, close, replace) : "";
  var init = (open, close, replace) => filterEmpty(`\x1B[${open}m`, `\x1B[${close}m`, replace);
  var colors = {
    reset: init(0, 0),
    bold: init(1, 22, "\x1B[22m\x1B[1m"),
    dim: init(2, 22, "\x1B[22m\x1B[2m"),
    italic: init(3, 23),
    underline: init(4, 24),
    inverse: init(7, 27),
    hidden: init(8, 28),
    strikethrough: init(9, 29),
    black: init(30, 39),
    red: init(31, 39),
    green: init(32, 39),
    yellow: init(33, 39),
    blue: init(34, 39),
    magenta: init(35, 39),
    cyan: init(36, 39),
    white: init(37, 39),
    gray: init(90, 39),
    bgBlack: init(40, 49),
    bgRed: init(41, 49),
    bgGreen: init(42, 49),
    bgYellow: init(43, 49),
    bgBlue: init(44, 49),
    bgMagenta: init(45, 49),
    bgCyan: init(46, 49),
    bgWhite: init(47, 49),
    blackBright: init(90, 39),
    redBright: init(91, 39),
    greenBright: init(92, 39),
    yellowBright: init(93, 39),
    blueBright: init(94, 39),
    magentaBright: init(95, 39),
    cyanBright: init(96, 39),
    whiteBright: init(97, 39),
    bgBlackBright: init(100, 49),
    bgRedBright: init(101, 49),
    bgGreenBright: init(102, 49),
    bgYellowBright: init(103, 49),
    bgBlueBright: init(104, 49),
    bgMagentaBright: init(105, 49),
    bgCyanBright: init(106, 49),
    bgWhiteBright: init(107, 49)
  };
  var createColors = ({ useColor = isColorSupported } = {}) => useColor ? colors : Object.keys(colors).reduce((colors2, key) => ({ ...colors2, [key]: String }), {});
  var {
    reset,
    bold,
    dim,
    italic,
    underline,
    inverse,
    hidden,
    strikethrough,
    black,
    red,
    green,
    yellow,
    blue,
    magenta,
    cyan,
    white,
    gray,
    bgBlack,
    bgRed,
    bgGreen,
    bgYellow,
    bgBlue,
    bgMagenta,
    bgCyan,
    bgWhite,
    blackBright,
    redBright,
    greenBright,
    yellowBright,
    blueBright,
    magentaBright,
    cyanBright,
    whiteBright,
    bgBlackBright,
    bgRedBright,
    bgGreenBright,
    bgYellowBright,
    bgBlueBright,
    bgMagentaBright,
    bgCyanBright,
    bgWhiteBright
  } = createColors();
  exports.bgBlack = bgBlack;
  exports.bgBlackBright = bgBlackBright;
  exports.bgBlue = bgBlue;
  exports.bgBlueBright = bgBlueBright;
  exports.bgCyan = bgCyan;
  exports.bgCyanBright = bgCyanBright;
  exports.bgGreen = bgGreen;
  exports.bgGreenBright = bgGreenBright;
  exports.bgMagenta = bgMagenta;
  exports.bgMagentaBright = bgMagentaBright;
  exports.bgRed = bgRed;
  exports.bgRedBright = bgRedBright;
  exports.bgWhite = bgWhite;
  exports.bgWhiteBright = bgWhiteBright;
  exports.bgYellow = bgYellow;
  exports.bgYellowBright = bgYellowBright;
  exports.black = black;
  exports.blackBright = blackBright;
  exports.blue = blue;
  exports.blueBright = blueBright;
  exports.bold = bold;
  exports.createColors = createColors;
  exports.cyan = cyan;
  exports.cyanBright = cyanBright;
  exports.dim = dim;
  exports.gray = gray;
  exports.green = green;
  exports.greenBright = greenBright;
  exports.hidden = hidden;
  exports.inverse = inverse;
  exports.isColorSupported = isColorSupported;
  exports.italic = italic;
  exports.magenta = magenta;
  exports.magentaBright = magentaBright;
  exports.red = red;
  exports.redBright = redBright;
  exports.reset = reset;
  exports.strikethrough = strikethrough;
  exports.underline = underline;
  exports.white = white;
  exports.whiteBright = whiteBright;
  exports.yellow = yellow;
  exports.yellowBright = yellowBright;
});

// node_modules/wrappy/wrappy.js
var require_wrappy = __commonJS((exports, module) => {
  module.exports = wrappy;
  function wrappy(fn, cb) {
    if (fn && cb)
      return wrappy(fn)(cb);
    if (typeof fn !== "function")
      throw new TypeError("need wrapper function");
    Object.keys(fn).forEach(function(k) {
      wrapper[k] = fn[k];
    });
    return wrapper;
    function wrapper() {
      var args = new Array(arguments.length);
      for (var i = 0;i < args.length; i++) {
        args[i] = arguments[i];
      }
      var ret = fn.apply(this, args);
      var cb2 = args[args.length - 1];
      if (typeof ret === "function" && ret !== cb2) {
        Object.keys(cb2).forEach(function(k) {
          ret[k] = cb2[k];
        });
      }
      return ret;
    }
  }
});

// node_modules/once/once.js
var require_once = __commonJS((exports, module) => {
  var wrappy = require_wrappy();
  module.exports = wrappy(once);
  module.exports.strict = wrappy(onceStrict);
  once.proto = once(function() {
    Object.defineProperty(Function.prototype, "once", {
      value: function() {
        return once(this);
      },
      configurable: true
    });
    Object.defineProperty(Function.prototype, "onceStrict", {
      value: function() {
        return onceStrict(this);
      },
      configurable: true
    });
  });
  function once(fn) {
    var f = function() {
      if (f.called)
        return f.value;
      f.called = true;
      return f.value = fn.apply(this, arguments);
    };
    f.called = false;
    return f;
  }
  function onceStrict(fn) {
    var f = function() {
      if (f.called)
        throw new Error(f.onceError);
      f.called = true;
      return f.value = fn.apply(this, arguments);
    };
    var name = fn.name || "Function wrapped with `once`";
    f.onceError = name + " shouldn't be called more than once";
    f.called = false;
    return f;
  }
});

// node_modules/end-of-stream/index.js
var require_end_of_stream = __commonJS((exports, module) => {
  var once = require_once();
  var noop = function() {};
  var qnt = global.Bare ? queueMicrotask : process.nextTick.bind(process);
  var isRequest = function(stream) {
    return stream.setHeader && typeof stream.abort === "function";
  };
  var isChildProcess = function(stream) {
    return stream.stdio && Array.isArray(stream.stdio) && stream.stdio.length === 3;
  };
  var eos = function(stream, opts, callback) {
    if (typeof opts === "function")
      return eos(stream, null, opts);
    if (!opts)
      opts = {};
    callback = once(callback || noop);
    var ws = stream._writableState;
    var rs = stream._readableState;
    var readable = opts.readable || opts.readable !== false && stream.readable;
    var writable = opts.writable || opts.writable !== false && stream.writable;
    var cancelled = false;
    var onlegacyfinish = function() {
      if (!stream.writable)
        onfinish();
    };
    var onfinish = function() {
      writable = false;
      if (!readable)
        callback.call(stream);
    };
    var onend = function() {
      readable = false;
      if (!writable)
        callback.call(stream);
    };
    var onexit = function(exitCode) {
      callback.call(stream, exitCode ? new Error("exited with error code: " + exitCode) : null);
    };
    var onerror = function(err) {
      callback.call(stream, err);
    };
    var onclose = function() {
      qnt(onclosenexttick);
    };
    var onclosenexttick = function() {
      if (cancelled)
        return;
      if (readable && !(rs && (rs.ended && !rs.destroyed)))
        return callback.call(stream, new Error("premature close"));
      if (writable && !(ws && (ws.ended && !ws.destroyed)))
        return callback.call(stream, new Error("premature close"));
    };
    var onrequest = function() {
      stream.req.on("finish", onfinish);
    };
    if (isRequest(stream)) {
      stream.on("complete", onfinish);
      stream.on("abort", onclose);
      if (stream.req)
        onrequest();
      else
        stream.on("request", onrequest);
    } else if (writable && !ws) {
      stream.on("end", onlegacyfinish);
      stream.on("close", onlegacyfinish);
    }
    if (isChildProcess(stream))
      stream.on("exit", onexit);
    stream.on("end", onend);
    stream.on("finish", onfinish);
    if (opts.error !== false)
      stream.on("error", onerror);
    stream.on("close", onclose);
    return function() {
      cancelled = true;
      stream.removeListener("complete", onfinish);
      stream.removeListener("abort", onclose);
      stream.removeListener("request", onrequest);
      if (stream.req)
        stream.req.removeListener("finish", onfinish);
      stream.removeListener("end", onlegacyfinish);
      stream.removeListener("close", onlegacyfinish);
      stream.removeListener("finish", onfinish);
      stream.removeListener("exit", onexit);
      stream.removeListener("end", onend);
      stream.removeListener("error", onerror);
      stream.removeListener("close", onclose);
    };
  };
  module.exports = eos;
});

// node_modules/pump/index.js
var require_pump = __commonJS((exports, module) => {
  var once = require_once();
  var eos = require_end_of_stream();
  var fs;
  try {
    fs = __require("fs");
  } catch (e) {}
  var noop = function() {};
  var ancient = typeof process === "undefined" ? false : /^v?\.0/.test(process.version);
  var isFn = function(fn) {
    return typeof fn === "function";
  };
  var isFS = function(stream) {
    if (!ancient)
      return false;
    if (!fs)
      return false;
    return (stream instanceof (fs.ReadStream || noop) || stream instanceof (fs.WriteStream || noop)) && isFn(stream.close);
  };
  var isRequest = function(stream) {
    return stream.setHeader && isFn(stream.abort);
  };
  var destroyer = function(stream, reading, writing, callback) {
    callback = once(callback);
    var closed = false;
    stream.on("close", function() {
      closed = true;
    });
    eos(stream, { readable: reading, writable: writing }, function(err) {
      if (err)
        return callback(err);
      closed = true;
      callback();
    });
    var destroyed = false;
    return function(err) {
      if (closed)
        return;
      if (destroyed)
        return;
      destroyed = true;
      if (isFS(stream))
        return stream.close(noop);
      if (isRequest(stream))
        return stream.abort();
      if (isFn(stream.destroy))
        return stream.destroy();
      callback(err || new Error("stream was destroyed"));
    };
  };
  var call = function(fn) {
    fn();
  };
  var pipe = function(from, to) {
    return from.pipe(to);
  };
  var pump = function() {
    var streams = Array.prototype.slice.call(arguments);
    var callback = isFn(streams[streams.length - 1] || noop) && streams.pop() || noop;
    if (Array.isArray(streams[0]))
      streams = streams[0];
    if (streams.length < 2)
      throw new Error("pump requires two streams per minimum");
    var error;
    var destroys = streams.map(function(stream, i) {
      var reading = i < streams.length - 1;
      var writing = i > 0;
      return destroyer(stream, reading, writing, function(err) {
        if (!error)
          error = err;
        if (err)
          destroys.forEach(call);
        if (reading)
          return;
        destroys.forEach(call);
        callback(error);
      });
    });
    return streams.reduce(pipe);
  };
  module.exports = pump;
});

// node_modules/split2/index.js
var require_split2 = __commonJS((exports, module) => {
  var { Transform } = __require("stream");
  var { StringDecoder } = __require("string_decoder");
  var kLast = Symbol("last");
  var kDecoder = Symbol("decoder");
  function transform(chunk, enc, cb) {
    let list;
    if (this.overflow) {
      const buf = this[kDecoder].write(chunk);
      list = buf.split(this.matcher);
      if (list.length === 1)
        return cb();
      list.shift();
      this.overflow = false;
    } else {
      this[kLast] += this[kDecoder].write(chunk);
      list = this[kLast].split(this.matcher);
    }
    this[kLast] = list.pop();
    for (let i = 0;i < list.length; i++) {
      try {
        push(this, this.mapper(list[i]));
      } catch (error) {
        return cb(error);
      }
    }
    this.overflow = this[kLast].length > this.maxLength;
    if (this.overflow && !this.skipOverflow) {
      cb(new Error("maximum buffer reached"));
      return;
    }
    cb();
  }
  function flush(cb) {
    this[kLast] += this[kDecoder].end();
    if (this[kLast]) {
      try {
        push(this, this.mapper(this[kLast]));
      } catch (error) {
        return cb(error);
      }
    }
    cb();
  }
  function push(self, val) {
    if (val !== undefined) {
      self.push(val);
    }
  }
  function noop(incoming) {
    return incoming;
  }
  function split(matcher, mapper, options) {
    matcher = matcher || /\r?\n/;
    mapper = mapper || noop;
    options = options || {};
    switch (arguments.length) {
      case 1:
        if (typeof matcher === "function") {
          mapper = matcher;
          matcher = /\r?\n/;
        } else if (typeof matcher === "object" && !(matcher instanceof RegExp) && !matcher[Symbol.split]) {
          options = matcher;
          matcher = /\r?\n/;
        }
        break;
      case 2:
        if (typeof matcher === "function") {
          options = mapper;
          mapper = matcher;
          matcher = /\r?\n/;
        } else if (typeof mapper === "object") {
          options = mapper;
          mapper = noop;
        }
    }
    options = Object.assign({}, options);
    options.autoDestroy = true;
    options.transform = transform;
    options.flush = flush;
    options.readableObjectMode = true;
    const stream = new Transform(options);
    stream[kLast] = "";
    stream[kDecoder] = new StringDecoder("utf8");
    stream.matcher = matcher;
    stream.mapper = mapper;
    stream.maxLength = options.maxLength;
    stream.skipOverflow = options.skipOverflow || false;
    stream.overflow = false;
    stream._destroy = function(err, cb) {
      this._writableState.errorEmitted = false;
      cb(err);
    };
    return stream;
  }
  module.exports = split;
});

// node_modules/pino-abstract-transport/index.js
var require_pino_abstract_transport = __commonJS((exports, module) => {
  var metadata = Symbol.for("pino.metadata");
  var split = require_split2();
  var { Duplex } = __require("stream");
  var { parentPort, workerData } = __require("worker_threads");
  function createDeferred() {
    let resolve;
    let reject;
    const promise = new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
    promise.resolve = resolve;
    promise.reject = reject;
    return promise;
  }
  module.exports = function build(fn, opts = {}) {
    const waitForConfig = opts.expectPinoConfig === true && workerData?.workerData?.pinoWillSendConfig === true;
    const parseLines = opts.parse === "lines";
    const parseLine = typeof opts.parseLine === "function" ? opts.parseLine : JSON.parse;
    const close = opts.close || defaultClose;
    const stream = split(function(line) {
      let value;
      try {
        value = parseLine(line);
      } catch (error) {
        this.emit("unknown", line, error);
        return;
      }
      if (value === null) {
        this.emit("unknown", line, "Null value ignored");
        return;
      }
      if (typeof value !== "object") {
        value = {
          data: value,
          time: Date.now()
        };
      }
      if (stream[metadata]) {
        stream.lastTime = value.time;
        stream.lastLevel = value.level;
        stream.lastObj = value;
      }
      if (parseLines) {
        return line;
      }
      return value;
    }, { autoDestroy: true });
    stream._destroy = function(err, cb) {
      const promise = close(err, cb);
      if (promise && typeof promise.then === "function") {
        promise.then(cb, cb);
      }
    };
    if (opts.expectPinoConfig === true && workerData?.workerData?.pinoWillSendConfig !== true) {
      setImmediate(() => {
        stream.emit("error", new Error("This transport is not compatible with the current version of pino. Please upgrade pino to the latest version."));
      });
    }
    if (opts.metadata !== false) {
      stream[metadata] = true;
      stream.lastTime = 0;
      stream.lastLevel = 0;
      stream.lastObj = null;
    }
    if (waitForConfig) {
      let pinoConfig = {};
      const configReceived = createDeferred();
      parentPort.on("message", function handleMessage(message) {
        if (message.code === "PINO_CONFIG") {
          pinoConfig = message.config;
          configReceived.resolve();
          parentPort.off("message", handleMessage);
        }
      });
      Object.defineProperties(stream, {
        levels: {
          get() {
            return pinoConfig.levels;
          }
        },
        messageKey: {
          get() {
            return pinoConfig.messageKey;
          }
        },
        errorKey: {
          get() {
            return pinoConfig.errorKey;
          }
        }
      });
      return configReceived.then(finish);
    }
    return finish();
    function finish() {
      let res = fn(stream);
      if (res && typeof res.catch === "function") {
        res.catch((err) => {
          stream.destroy(err);
        });
        res = null;
      } else if (opts.enablePipelining && res) {
        return Duplex.from({ writable: stream, readable: res });
      }
      return stream;
    }
  };
  function defaultClose(err, cb) {
    process.nextTick(cb, err);
  }
});

// node_modules/pino-pretty/lib/constants.js
var require_constants2 = __commonJS((exports, module) => {
  module.exports = {
    DATE_FORMAT: "yyyy-mm-dd HH:MM:ss.l o",
    DATE_FORMAT_SIMPLE: "HH:MM:ss.l",
    ERROR_LIKE_KEYS: ["err", "error"],
    MESSAGE_KEY: "msg",
    LEVEL_KEY: "level",
    LEVEL_LABEL: "levelLabel",
    TIMESTAMP_KEY: "time",
    LEVELS: {
      default: "USERLVL",
      60: "FATAL",
      50: "ERROR",
      40: "WARN",
      30: "INFO",
      20: "DEBUG",
      10: "TRACE"
    },
    LEVEL_NAMES: {
      fatal: 60,
      error: 50,
      warn: 40,
      info: 30,
      debug: 20,
      trace: 10
    },
    LOGGER_KEYS: [
      "pid",
      "hostname",
      "name",
      "level",
      "time",
      "timestamp",
      "caller"
    ]
  };
});

// node_modules/pino-pretty/lib/utils/get-level-label-data.js
var require_get_level_label_data = __commonJS((exports, module) => {
  module.exports = getLevelLabelData;
  var { LEVELS, LEVEL_NAMES } = require_constants2();
  function getLevelLabelData(useOnlyCustomProps, customLevels, customLevelNames) {
    const levels = useOnlyCustomProps ? customLevels || LEVELS : Object.assign({}, LEVELS, customLevels);
    const levelNames = useOnlyCustomProps ? customLevelNames || LEVEL_NAMES : Object.assign({}, LEVEL_NAMES, customLevelNames);
    return function(level) {
      let levelNum = "default";
      if (Number.isInteger(+level)) {
        levelNum = Object.prototype.hasOwnProperty.call(levels, level) ? level : levelNum;
      } else {
        levelNum = Object.prototype.hasOwnProperty.call(levelNames, level.toLowerCase()) ? levelNames[level.toLowerCase()] : levelNum;
      }
      return [levels[levelNum], levelNum];
    };
  }
});

// node_modules/pino-pretty/lib/colors.js
var require_colors = __commonJS((exports, module) => {
  var nocolor = (input) => input;
  var plain = {
    default: nocolor,
    60: nocolor,
    50: nocolor,
    40: nocolor,
    30: nocolor,
    20: nocolor,
    10: nocolor,
    message: nocolor,
    greyMessage: nocolor,
    property: nocolor
  };
  var { createColors } = require_colorette();
  var getLevelLabelData = require_get_level_label_data();
  var availableColors = createColors({ useColor: true });
  var { white, bgRed, red, yellow, green, blue, gray, cyan, magenta } = availableColors;
  var colored = {
    default: white,
    60: bgRed,
    50: red,
    40: yellow,
    30: green,
    20: blue,
    10: gray,
    message: cyan,
    greyMessage: gray,
    property: magenta
  };
  function resolveCustomColoredColorizer(customColors) {
    return customColors.reduce(function(agg, [level, color]) {
      agg[level] = typeof availableColors[color] === "function" ? availableColors[color] : white;
      return agg;
    }, { default: white, message: cyan, greyMessage: gray, property: magenta });
  }
  function colorizeLevel(useOnlyCustomProps) {
    return function(level, colorizer, { customLevels, customLevelNames } = {}) {
      const [levelStr, levelNum] = getLevelLabelData(useOnlyCustomProps, customLevels, customLevelNames)(level);
      return Object.prototype.hasOwnProperty.call(colorizer, levelNum) ? colorizer[levelNum](levelStr) : colorizer.default(levelStr);
    };
  }
  function plainColorizer(useOnlyCustomProps) {
    const newPlainColorizer = colorizeLevel(useOnlyCustomProps);
    const customColoredColorizer = function(level, opts) {
      return newPlainColorizer(level, plain, opts);
    };
    customColoredColorizer.message = plain.message;
    customColoredColorizer.greyMessage = plain.greyMessage;
    customColoredColorizer.property = plain.property;
    customColoredColorizer.colors = createColors({ useColor: false });
    return customColoredColorizer;
  }
  function coloredColorizer(useOnlyCustomProps) {
    const newColoredColorizer = colorizeLevel(useOnlyCustomProps);
    const customColoredColorizer = function(level, opts) {
      return newColoredColorizer(level, colored, opts);
    };
    customColoredColorizer.message = colored.message;
    customColoredColorizer.property = colored.property;
    customColoredColorizer.greyMessage = colored.greyMessage;
    customColoredColorizer.colors = availableColors;
    return customColoredColorizer;
  }
  function customColoredColorizerFactory(customColors, useOnlyCustomProps) {
    const onlyCustomColored = resolveCustomColoredColorizer(customColors);
    const customColored = useOnlyCustomProps ? onlyCustomColored : Object.assign({}, colored, onlyCustomColored);
    const colorizeLevelCustom = colorizeLevel(useOnlyCustomProps);
    const customColoredColorizer = function(level, opts) {
      return colorizeLevelCustom(level, customColored, opts);
    };
    customColoredColorizer.colors = availableColors;
    customColoredColorizer.message = customColoredColorizer.message || customColored.message;
    customColoredColorizer.property = customColoredColorizer.property || customColored.property;
    customColoredColorizer.greyMessage = customColoredColorizer.greyMessage || customColored.greyMessage;
    return customColoredColorizer;
  }
  module.exports = function getColorizer(useColors = false, customColors, useOnlyCustomProps) {
    if (useColors && customColors !== undefined) {
      return customColoredColorizerFactory(customColors, useOnlyCustomProps);
    } else if (useColors) {
      return coloredColorizer(useOnlyCustomProps);
    }
    return plainColorizer(useOnlyCustomProps);
  };
});

// node_modules/pino-pretty/lib/utils/noop.js
var require_noop = __commonJS((exports, module) => {
  module.exports = function noop() {};
});

// node_modules/pino-pretty/lib/utils/build-safe-sonic-boom.js
var require_build_safe_sonic_boom = __commonJS((exports, module) => {
  module.exports = buildSafeSonicBoom;
  var { isMainThread } = __require("worker_threads");
  var SonicBoom = require_sonic_boom();
  var noop = require_noop();
  function buildSafeSonicBoom(opts) {
    const stream = new SonicBoom(opts);
    stream.on("error", filterBrokenPipe);
    if (!opts.sync && isMainThread) {
      setupOnExit(stream);
    }
    return stream;
    function filterBrokenPipe(err) {
      if (err.code === "EPIPE") {
        stream.write = noop;
        stream.end = noop;
        stream.flushSync = noop;
        stream.destroy = noop;
        return;
      }
      stream.removeListener("error", filterBrokenPipe);
    }
  }
  function setupOnExit(stream) {
    if (global.WeakRef && global.WeakMap && global.FinalizationRegistry) {
      const onExit = require_on_exit_leak_free();
      onExit.register(stream, autoEnd);
      stream.on("close", function() {
        onExit.unregister(stream);
      });
    }
  }
  function autoEnd(stream, eventName) {
    if (stream.destroyed) {
      return;
    }
    if (eventName === "beforeExit") {
      stream.flush();
      stream.on("drain", function() {
        stream.end();
      });
    } else {
      stream.flushSync();
    }
  }
});

// node_modules/pino-pretty/lib/utils/is-valid-date.js
var require_is_valid_date = __commonJS((exports, module) => {
  module.exports = isValidDate;
  function isValidDate(date) {
    return date instanceof Date && !Number.isNaN(date.getTime());
  }
});

// node_modules/pino-pretty/lib/utils/create-date.js
var require_create_date = __commonJS((exports, module) => {
  module.exports = createDate;
  var isValidDate = require_is_valid_date();
  function createDate(epoch) {
    let date = new Date(epoch);
    if (isValidDate(date)) {
      return date;
    }
    date = new Date(+epoch);
    return date;
  }
});

// node_modules/pino-pretty/lib/utils/split-property-key.js
var require_split_property_key = __commonJS((exports, module) => {
  module.exports = splitPropertyKey;
  function splitPropertyKey(key) {
    const result = [];
    let backslash = false;
    let segment = "";
    for (let i = 0;i < key.length; i++) {
      const c = key.charAt(i);
      if (c === "\\") {
        backslash = true;
        continue;
      }
      if (backslash) {
        backslash = false;
        segment += c;
        continue;
      }
      if (c === ".") {
        result.push(segment);
        segment = "";
        continue;
      }
      segment += c;
    }
    if (segment.length) {
      result.push(segment);
    }
    return result;
  }
});

// node_modules/pino-pretty/lib/utils/get-property-value.js
var require_get_property_value = __commonJS((exports, module) => {
  module.exports = getPropertyValue;
  var splitPropertyKey = require_split_property_key();
  function getPropertyValue(obj, property) {
    const props = Array.isArray(property) ? property : splitPropertyKey(property);
    for (const prop of props) {
      if (!Object.prototype.hasOwnProperty.call(obj, prop)) {
        return;
      }
      obj = obj[prop];
    }
    return obj;
  }
});

// node_modules/pino-pretty/lib/utils/delete-log-property.js
var require_delete_log_property = __commonJS((exports, module) => {
  module.exports = deleteLogProperty;
  var getPropertyValue = require_get_property_value();
  var splitPropertyKey = require_split_property_key();
  function deleteLogProperty(log, property) {
    const props = splitPropertyKey(property);
    const propToDelete = props.pop();
    log = getPropertyValue(log, props);
    if (log !== null && typeof log === "object" && Object.prototype.hasOwnProperty.call(log, propToDelete)) {
      delete log[propToDelete];
    }
  }
});

// node_modules/fast-copy/dist/cjs/index.cjs
var require_cjs = __commonJS((exports) => {
  var toStringFunction = Function.prototype.toString;
  var toStringObject = Object.prototype.toString;
  function getCleanClone(prototype) {
    if (!prototype) {
      return Object.create(null);
    }
    const Constructor = prototype.constructor;
    if (Constructor === Object) {
      return prototype === Object.prototype ? {} : Object.create(prototype);
    }
    if (Constructor && ~toStringFunction.call(Constructor).indexOf("[native code]")) {
      try {
        return new Constructor;
      } catch (_a) {}
    }
    return Object.create(prototype);
  }
  function getTag(value) {
    const stringTag = value[Symbol.toStringTag];
    if (stringTag) {
      return stringTag;
    }
    const type = toStringObject.call(value);
    return type.substring(8, type.length - 1);
  }
  var { hasOwnProperty, propertyIsEnumerable } = Object.prototype;
  function copyOwnDescriptor(original, clone, property, state) {
    const ownDescriptor = Object.getOwnPropertyDescriptor(original, property) || {
      configurable: true,
      enumerable: true,
      value: original[property],
      writable: true
    };
    const descriptor = ownDescriptor.get || ownDescriptor.set ? ownDescriptor : {
      configurable: ownDescriptor.configurable,
      enumerable: ownDescriptor.enumerable,
      value: state.copier(ownDescriptor.value, state),
      writable: ownDescriptor.writable
    };
    try {
      Object.defineProperty(clone, property, descriptor);
    } catch (_a) {
      clone[property] = descriptor.get ? descriptor.get() : descriptor.value;
    }
  }
  function copyOwnPropertiesStrict(value, clone, state) {
    const names = Object.getOwnPropertyNames(value);
    for (let index = 0;index < names.length; ++index) {
      copyOwnDescriptor(value, clone, names[index], state);
    }
    const symbols = Object.getOwnPropertySymbols(value);
    for (let index = 0;index < symbols.length; ++index) {
      copyOwnDescriptor(value, clone, symbols[index], state);
    }
    return clone;
  }
  function copyArrayLoose(array, state) {
    const clone = new state.Constructor;
    state.cache.set(array, clone);
    for (let index = 0;index < array.length; ++index) {
      clone[index] = state.copier(array[index], state);
    }
    return clone;
  }
  function copyArrayStrict(array, state) {
    const clone = new state.Constructor;
    state.cache.set(array, clone);
    return copyOwnPropertiesStrict(array, clone, state);
  }
  function copyArrayBuffer(arrayBuffer, _state) {
    return arrayBuffer.slice(0);
  }
  function copyBlob(blob, _state) {
    return blob.slice(0, blob.size, blob.type);
  }
  function copyDataView(dataView, state) {
    return new state.Constructor(copyArrayBuffer(dataView.buffer));
  }
  function copyDate(date, state) {
    return new state.Constructor(date.getTime());
  }
  function copyMapLoose(map, state) {
    const clone = new state.Constructor;
    state.cache.set(map, clone);
    map.forEach((value, key) => {
      clone.set(key, state.copier(value, state));
    });
    return clone;
  }
  function copyMapStrict(map, state) {
    return copyOwnPropertiesStrict(map, copyMapLoose(map, state), state);
  }
  function copyObjectLoose(object, state) {
    const clone = getCleanClone(state.prototype);
    state.cache.set(object, clone);
    for (const key in object) {
      if (hasOwnProperty.call(object, key)) {
        clone[key] = state.copier(object[key], state);
      }
    }
    const symbols = Object.getOwnPropertySymbols(object);
    for (let index = 0;index < symbols.length; ++index) {
      const symbol = symbols[index];
      if (propertyIsEnumerable.call(object, symbol)) {
        clone[symbol] = state.copier(object[symbol], state);
      }
    }
    return clone;
  }
  function copyObjectStrict(object, state) {
    const clone = getCleanClone(state.prototype);
    state.cache.set(object, clone);
    return copyOwnPropertiesStrict(object, clone, state);
  }
  function copyPrimitiveWrapper(primitiveObject, state) {
    return new state.Constructor(primitiveObject.valueOf());
  }
  function copyRegExp(regExp, state) {
    const clone = new state.Constructor(regExp.source, regExp.flags);
    clone.lastIndex = regExp.lastIndex;
    return clone;
  }
  function copySelf(value, _state) {
    return value;
  }
  function copySetLoose(set, state) {
    const clone = new state.Constructor;
    state.cache.set(set, clone);
    set.forEach((value) => {
      clone.add(state.copier(value, state));
    });
    return clone;
  }
  function copySetStrict(set, state) {
    return copyOwnPropertiesStrict(set, copySetLoose(set, state), state);
  }
  function createDefaultCache() {
    return new WeakMap;
  }
  function getOptions({ createCache: createCacheOverride, methods: methodsOverride, strict }) {
    const defaultMethods = {
      array: strict ? copyArrayStrict : copyArrayLoose,
      arrayBuffer: copyArrayBuffer,
      asyncGenerator: copySelf,
      blob: copyBlob,
      dataView: copyDataView,
      date: copyDate,
      error: copySelf,
      generator: copySelf,
      map: strict ? copyMapStrict : copyMapLoose,
      object: strict ? copyObjectStrict : copyObjectLoose,
      regExp: copyRegExp,
      set: strict ? copySetStrict : copySetLoose
    };
    const methods = methodsOverride ? Object.assign(defaultMethods, methodsOverride) : defaultMethods;
    const copiers = getTagSpecificCopiers(methods);
    const createCache = createCacheOverride || createDefaultCache;
    if (!copiers.Object || !copiers.Array) {
      throw new Error("An object and array copier must be provided.");
    }
    return { createCache, copiers, methods, strict: Boolean(strict) };
  }
  function getTagSpecificCopiers(methods) {
    return {
      Arguments: methods.object,
      Array: methods.array,
      ArrayBuffer: methods.arrayBuffer,
      AsyncGenerator: methods.asyncGenerator,
      Blob: methods.blob,
      Boolean: copyPrimitiveWrapper,
      DataView: methods.dataView,
      Date: methods.date,
      Error: methods.error,
      Float32Array: methods.arrayBuffer,
      Float64Array: methods.arrayBuffer,
      Generator: methods.generator,
      Int8Array: methods.arrayBuffer,
      Int16Array: methods.arrayBuffer,
      Int32Array: methods.arrayBuffer,
      Map: methods.map,
      Number: copyPrimitiveWrapper,
      Object: methods.object,
      Promise: copySelf,
      RegExp: methods.regExp,
      Set: methods.set,
      String: copyPrimitiveWrapper,
      WeakMap: copySelf,
      WeakSet: copySelf,
      Uint8Array: methods.arrayBuffer,
      Uint8ClampedArray: methods.arrayBuffer,
      Uint16Array: methods.arrayBuffer,
      Uint32Array: methods.arrayBuffer,
      Uint64Array: methods.arrayBuffer
    };
  }
  function createCopier(options = {}) {
    const { createCache, copiers } = getOptions(options);
    const { Array: copyArray, Object: copyObject } = copiers;
    function copier(value, state) {
      state.prototype = state.Constructor = undefined;
      if (!value || typeof value !== "object") {
        return value;
      }
      if (state.cache.has(value)) {
        return state.cache.get(value);
      }
      state.prototype = Object.getPrototypeOf(value);
      state.Constructor = state.prototype && state.prototype.constructor;
      if (!state.Constructor || state.Constructor === Object) {
        return copyObject(value, state);
      }
      if (Array.isArray(value)) {
        return copyArray(value, state);
      }
      const tagSpecificCopier = copiers[getTag(value)];
      if (tagSpecificCopier) {
        return tagSpecificCopier(value, state);
      }
      return typeof value.then === "function" ? value : copyObject(value, state);
    }
    return function copy2(value) {
      return copier(value, {
        Constructor: undefined,
        cache: createCache(),
        copier,
        prototype: undefined
      });
    };
  }
  var copyStrict = createCopier({ strict: true });
  var copy = createCopier();
  exports.copy = copy;
  exports.copyStrict = copyStrict;
  exports.createCopier = createCopier;
});

// node_modules/pino-pretty/lib/utils/filter-log.js
var require_filter_log = __commonJS((exports, module) => {
  module.exports = filterLog;
  var { createCopier } = require_cjs();
  var fastCopy = createCopier({});
  var deleteLogProperty = require_delete_log_property();
  function filterLog({ log, context }) {
    const { ignoreKeys, includeKeys } = context;
    const logCopy = fastCopy(log);
    if (includeKeys) {
      const logIncluded = {};
      includeKeys.forEach((key) => {
        logIncluded[key] = logCopy[key];
      });
      return logIncluded;
    }
    ignoreKeys.forEach((ignoreKey) => {
      deleteLogProperty(logCopy, ignoreKey);
    });
    return logCopy;
  }
});

// node_modules/dateformat/lib/dateformat.js
var require_dateformat = __commonJS((exports, module) => {
  function _typeof(obj) {
    "@babel/helpers - typeof";
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function _typeof2(obj2) {
        return typeof obj2;
      };
    } else {
      _typeof = function _typeof2(obj2) {
        return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
      };
    }
    return _typeof(obj);
  }
  (function(global2) {
    var _arguments = arguments;
    var dateFormat = function() {
      var token = /d{1,4}|D{3,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|W{1,2}|[LlopSZN]|"[^"]*"|'[^']*'/g;
      var timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
      var timezoneClip = /[^-+\dA-Z]/g;
      return function(date, mask, utc, gmt) {
        if (_arguments.length === 1 && kindOf(date) === "string" && !/\d/.test(date)) {
          mask = date;
          date = undefined;
        }
        date = date || date === 0 ? date : new Date;
        if (!(date instanceof Date)) {
          date = new Date(date);
        }
        if (isNaN(date)) {
          throw TypeError("Invalid date");
        }
        mask = String(dateFormat.masks[mask] || mask || dateFormat.masks["default"]);
        var maskSlice = mask.slice(0, 4);
        if (maskSlice === "UTC:" || maskSlice === "GMT:") {
          mask = mask.slice(4);
          utc = true;
          if (maskSlice === "GMT:") {
            gmt = true;
          }
        }
        var _ = function _2() {
          return utc ? "getUTC" : "get";
        };
        var _d = function d() {
          return date[_() + "Date"]();
        };
        var D = function D2() {
          return date[_() + "Day"]();
        };
        var _m = function m() {
          return date[_() + "Month"]();
        };
        var y = function y2() {
          return date[_() + "FullYear"]();
        };
        var _H = function H() {
          return date[_() + "Hours"]();
        };
        var _M = function M() {
          return date[_() + "Minutes"]();
        };
        var _s = function s() {
          return date[_() + "Seconds"]();
        };
        var _L = function L() {
          return date[_() + "Milliseconds"]();
        };
        var _o = function o() {
          return utc ? 0 : date.getTimezoneOffset();
        };
        var _W = function W() {
          return getWeek(date);
        };
        var _N = function N() {
          return getDayOfWeek(date);
        };
        var flags = { d: function d() {
          return _d();
        }, dd: function dd() {
          return pad(_d());
        }, ddd: function ddd() {
          return dateFormat.i18n.dayNames[D()];
        }, DDD: function DDD() {
          return getDayName({ y: y(), m: _m(), d: _d(), _: _(), dayName: dateFormat.i18n.dayNames[D()], short: true });
        }, dddd: function dddd() {
          return dateFormat.i18n.dayNames[D() + 7];
        }, DDDD: function DDDD() {
          return getDayName({ y: y(), m: _m(), d: _d(), _: _(), dayName: dateFormat.i18n.dayNames[D() + 7] });
        }, m: function m() {
          return _m() + 1;
        }, mm: function mm() {
          return pad(_m() + 1);
        }, mmm: function mmm() {
          return dateFormat.i18n.monthNames[_m()];
        }, mmmm: function mmmm() {
          return dateFormat.i18n.monthNames[_m() + 12];
        }, yy: function yy() {
          return String(y()).slice(2);
        }, yyyy: function yyyy() {
          return pad(y(), 4);
        }, h: function h() {
          return _H() % 12 || 12;
        }, hh: function hh() {
          return pad(_H() % 12 || 12);
        }, H: function H() {
          return _H();
        }, HH: function HH() {
          return pad(_H());
        }, M: function M() {
          return _M();
        }, MM: function MM() {
          return pad(_M());
        }, s: function s() {
          return _s();
        }, ss: function ss() {
          return pad(_s());
        }, l: function l() {
          return pad(_L(), 3);
        }, L: function L() {
          return pad(Math.floor(_L() / 10));
        }, t: function t() {
          return _H() < 12 ? dateFormat.i18n.timeNames[0] : dateFormat.i18n.timeNames[1];
        }, tt: function tt() {
          return _H() < 12 ? dateFormat.i18n.timeNames[2] : dateFormat.i18n.timeNames[3];
        }, T: function T() {
          return _H() < 12 ? dateFormat.i18n.timeNames[4] : dateFormat.i18n.timeNames[5];
        }, TT: function TT() {
          return _H() < 12 ? dateFormat.i18n.timeNames[6] : dateFormat.i18n.timeNames[7];
        }, Z: function Z() {
          return gmt ? "GMT" : utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, "").replace(/GMT\+0000/g, "UTC");
        }, o: function o() {
          return (_o() > 0 ? "-" : "+") + pad(Math.floor(Math.abs(_o()) / 60) * 100 + Math.abs(_o()) % 60, 4);
        }, p: function p() {
          return (_o() > 0 ? "-" : "+") + pad(Math.floor(Math.abs(_o()) / 60), 2) + ":" + pad(Math.floor(Math.abs(_o()) % 60), 2);
        }, S: function S() {
          return ["th", "st", "nd", "rd"][_d() % 10 > 3 ? 0 : (_d() % 100 - _d() % 10 != 10) * _d() % 10];
        }, W: function W() {
          return _W();
        }, WW: function WW() {
          return pad(_W());
        }, N: function N() {
          return _N();
        } };
        return mask.replace(token, function(match) {
          if (match in flags) {
            return flags[match]();
          }
          return match.slice(1, match.length - 1);
        });
      };
    }();
    dateFormat.masks = { default: "ddd mmm dd yyyy HH:MM:ss", shortDate: "m/d/yy", paddedShortDate: "mm/dd/yyyy", mediumDate: "mmm d, yyyy", longDate: "mmmm d, yyyy", fullDate: "dddd, mmmm d, yyyy", shortTime: "h:MM TT", mediumTime: "h:MM:ss TT", longTime: "h:MM:ss TT Z", isoDate: "yyyy-mm-dd", isoTime: "HH:MM:ss", isoDateTime: "yyyy-mm-dd'T'HH:MM:sso", isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'", expiresHeaderFormat: "ddd, dd mmm yyyy HH:MM:ss Z" };
    dateFormat.i18n = { dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], timeNames: ["a", "p", "am", "pm", "A", "P", "AM", "PM"] };
    var pad = function pad2(val, len) {
      val = String(val);
      len = len || 2;
      while (val.length < len) {
        val = "0" + val;
      }
      return val;
    };
    var getDayName = function getDayName2(_ref) {
      var { y, m, d, _, dayName } = _ref, _ref$short = _ref["short"], _short = _ref$short === undefined ? false : _ref$short;
      var today = new Date;
      var yesterday = new Date;
      yesterday.setDate(yesterday[_ + "Date"]() - 1);
      var tomorrow = new Date;
      tomorrow.setDate(tomorrow[_ + "Date"]() + 1);
      var today_d = function today_d2() {
        return today[_ + "Date"]();
      };
      var today_m = function today_m2() {
        return today[_ + "Month"]();
      };
      var today_y = function today_y2() {
        return today[_ + "FullYear"]();
      };
      var yesterday_d = function yesterday_d2() {
        return yesterday[_ + "Date"]();
      };
      var yesterday_m = function yesterday_m2() {
        return yesterday[_ + "Month"]();
      };
      var yesterday_y = function yesterday_y2() {
        return yesterday[_ + "FullYear"]();
      };
      var tomorrow_d = function tomorrow_d2() {
        return tomorrow[_ + "Date"]();
      };
      var tomorrow_m = function tomorrow_m2() {
        return tomorrow[_ + "Month"]();
      };
      var tomorrow_y = function tomorrow_y2() {
        return tomorrow[_ + "FullYear"]();
      };
      if (today_y() === y && today_m() === m && today_d() === d) {
        return _short ? "Tdy" : "Today";
      } else if (yesterday_y() === y && yesterday_m() === m && yesterday_d() === d) {
        return _short ? "Ysd" : "Yesterday";
      } else if (tomorrow_y() === y && tomorrow_m() === m && tomorrow_d() === d) {
        return _short ? "Tmw" : "Tomorrow";
      }
      return dayName;
    };
    var getWeek = function getWeek2(date) {
      var targetThursday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      targetThursday.setDate(targetThursday.getDate() - (targetThursday.getDay() + 6) % 7 + 3);
      var firstThursday = new Date(targetThursday.getFullYear(), 0, 4);
      firstThursday.setDate(firstThursday.getDate() - (firstThursday.getDay() + 6) % 7 + 3);
      var ds = targetThursday.getTimezoneOffset() - firstThursday.getTimezoneOffset();
      targetThursday.setHours(targetThursday.getHours() - ds);
      var weekDiff = (targetThursday - firstThursday) / (86400000 * 7);
      return 1 + Math.floor(weekDiff);
    };
    var getDayOfWeek = function getDayOfWeek2(date) {
      var dow = date.getDay();
      if (dow === 0) {
        dow = 7;
      }
      return dow;
    };
    var kindOf = function kindOf2(val) {
      if (val === null) {
        return "null";
      }
      if (val === undefined) {
        return "undefined";
      }
      if (_typeof(val) !== "object") {
        return _typeof(val);
      }
      if (Array.isArray(val)) {
        return "array";
      }
      return {}.toString.call(val).slice(8, -1).toLowerCase();
    };
    if (typeof define === "function" && define.amd) {
      define(function() {
        return dateFormat;
      });
    } else if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object") {
      module.exports = dateFormat;
    } else {
      global2.dateFormat = dateFormat;
    }
  })(undefined);
});

// node_modules/pino-pretty/lib/utils/format-time.js
var require_format_time = __commonJS((exports, module) => {
  module.exports = formatTime;
  var {
    DATE_FORMAT,
    DATE_FORMAT_SIMPLE
  } = require_constants2();
  var dateformat = require_dateformat();
  var createDate = require_create_date();
  var isValidDate = require_is_valid_date();
  function formatTime(epoch, translateTime = false) {
    if (translateTime === false) {
      return epoch;
    }
    const instant = createDate(epoch);
    if (!isValidDate(instant)) {
      return epoch;
    }
    if (translateTime === true) {
      return dateformat(instant, DATE_FORMAT_SIMPLE);
    }
    const upperFormat = translateTime.toUpperCase();
    if (upperFormat === "SYS:STANDARD") {
      return dateformat(instant, DATE_FORMAT);
    }
    const prefix = upperFormat.substr(0, 4);
    if (prefix === "SYS:" || prefix === "UTC:") {
      if (prefix === "UTC:") {
        return dateformat(instant, translateTime);
      }
      return dateformat(instant, translateTime.slice(4));
    }
    return dateformat(instant, `UTC:${translateTime}`);
  }
});

// node_modules/pino-pretty/lib/utils/handle-custom-levels-names-opts.js
var require_handle_custom_levels_names_opts = __commonJS((exports, module) => {
  module.exports = handleCustomLevelsNamesOpts;
  function handleCustomLevelsNamesOpts(cLevels) {
    if (!cLevels)
      return {};
    if (typeof cLevels === "string") {
      return cLevels.split(",").reduce((agg, value, idx) => {
        const [levelName, levelNum = idx] = value.split(":");
        agg[levelName.toLowerCase()] = levelNum;
        return agg;
      }, {});
    } else if (Object.prototype.toString.call(cLevels) === "[object Object]") {
      return Object.keys(cLevels).reduce((agg, levelName) => {
        agg[levelName.toLowerCase()] = cLevels[levelName];
        return agg;
      }, {});
    } else {
      return {};
    }
  }
});

// node_modules/pino-pretty/lib/utils/handle-custom-levels-opts.js
var require_handle_custom_levels_opts = __commonJS((exports, module) => {
  module.exports = handleCustomLevelsOpts;
  function handleCustomLevelsOpts(cLevels) {
    if (!cLevels)
      return {};
    if (typeof cLevels === "string") {
      return cLevels.split(",").reduce((agg, value, idx) => {
        const [levelName, levelNum = idx] = value.split(":");
        agg[levelNum] = levelName.toUpperCase();
        return agg;
      }, { default: "USERLVL" });
    } else if (Object.prototype.toString.call(cLevels) === "[object Object]") {
      return Object.keys(cLevels).reduce((agg, levelName) => {
        agg[cLevels[levelName]] = levelName.toUpperCase();
        return agg;
      }, { default: "USERLVL" });
    } else {
      return {};
    }
  }
});

// node_modules/pino-pretty/lib/utils/interpret-conditionals.js
var require_interpret_conditionals = __commonJS((exports, module) => {
  module.exports = interpretConditionals;
  var getPropertyValue = require_get_property_value();
  function interpretConditionals(messageFormat, log) {
    messageFormat = messageFormat.replace(/{if (.*?)}(.*?){end}/g, replacer);
    messageFormat = messageFormat.replace(/{if (.*?)}/g, "");
    messageFormat = messageFormat.replace(/{end}/g, "");
    return messageFormat.replace(/\s+/g, " ").trim();
    function replacer(_, key, value) {
      const propertyValue = getPropertyValue(log, key);
      if (propertyValue && value.includes(key)) {
        return value.replace(new RegExp("{" + key + "}", "g"), propertyValue);
      } else {
        return "";
      }
    }
  }
});

// node_modules/pino-pretty/lib/utils/is-object.js
var require_is_object2 = __commonJS((exports, module) => {
  module.exports = isObject;
  function isObject(input) {
    return Object.prototype.toString.apply(input) === "[object Object]";
  }
});

// node_modules/pino-pretty/lib/utils/join-lines-with-indentation.js
var require_join_lines_with_indentation = __commonJS((exports, module) => {
  module.exports = joinLinesWithIndentation;
  function joinLinesWithIndentation({ input, ident = "    ", eol = `
` }) {
    const lines = input.split(/\r?\n/);
    for (let i = 1;i < lines.length; i += 1) {
      lines[i] = ident + lines[i];
    }
    return lines.join(eol);
  }
});

// node_modules/pino-pretty/lib/utils/parse-factory-options.js
var require_parse_factory_options = __commonJS((exports, module) => {
  module.exports = parseFactoryOptions;
  var {
    LEVEL_NAMES
  } = require_constants2();
  var colors = require_colors();
  var handleCustomLevelsOpts = require_handle_custom_levels_opts();
  var handleCustomLevelsNamesOpts = require_handle_custom_levels_names_opts();
  var handleLevelLabelData = require_get_level_label_data();
  function parseFactoryOptions(options) {
    const EOL = options.crlf ? `\r
` : `
`;
    const IDENT = "    ";
    const {
      customPrettifiers,
      errorLikeObjectKeys,
      hideObject,
      levelFirst,
      levelKey,
      levelLabel,
      messageFormat,
      messageKey,
      minimumLevel,
      singleLine,
      timestampKey,
      translateTime
    } = options;
    const errorProps = options.errorProps.split(",");
    const useOnlyCustomProps = typeof options.useOnlyCustomProps === "boolean" ? options.useOnlyCustomProps : options.useOnlyCustomProps === "true";
    const customLevels = handleCustomLevelsOpts(options.customLevels);
    const customLevelNames = handleCustomLevelsNamesOpts(options.customLevels);
    const getLevelLabelData = handleLevelLabelData(useOnlyCustomProps, customLevels, customLevelNames);
    let customColors;
    if (options.customColors) {
      if (typeof options.customColors === "string") {
        customColors = options.customColors.split(",").reduce((agg, value) => {
          const [level, color] = value.split(":");
          const condition = useOnlyCustomProps ? options.customLevels : customLevelNames[level] !== undefined;
          const levelNum = condition ? customLevelNames[level] : LEVEL_NAMES[level];
          const colorIdx = levelNum !== undefined ? levelNum : level;
          agg.push([colorIdx, color]);
          return agg;
        }, []);
      } else if (typeof options.customColors === "object") {
        customColors = Object.keys(options.customColors).reduce((agg, value) => {
          const [level, color] = [value, options.customColors[value]];
          const condition = useOnlyCustomProps ? options.customLevels : customLevelNames[level] !== undefined;
          const levelNum = condition ? customLevelNames[level] : LEVEL_NAMES[level];
          const colorIdx = levelNum !== undefined ? levelNum : level;
          agg.push([colorIdx, color]);
          return agg;
        }, []);
      } else {
        throw new Error("options.customColors must be of type string or object.");
      }
    }
    const customProperties = { customLevels, customLevelNames };
    if (useOnlyCustomProps === true && !options.customLevels) {
      customProperties.customLevels = undefined;
      customProperties.customLevelNames = undefined;
    }
    const includeKeys = options.include !== undefined ? new Set(options.include.split(",")) : undefined;
    const ignoreKeys = !includeKeys && options.ignore ? new Set(options.ignore.split(",")) : undefined;
    const colorizer = colors(options.colorize, customColors, useOnlyCustomProps);
    const objectColorizer = options.colorizeObjects ? colorizer : colors(false, [], false);
    return {
      EOL,
      IDENT,
      colorizer,
      customColors,
      customLevelNames,
      customLevels,
      customPrettifiers,
      customProperties,
      errorLikeObjectKeys,
      errorProps,
      getLevelLabelData,
      hideObject,
      ignoreKeys,
      includeKeys,
      levelFirst,
      levelKey,
      levelLabel,
      messageFormat,
      messageKey,
      minimumLevel,
      objectColorizer,
      singleLine,
      timestampKey,
      translateTime,
      useOnlyCustomProps
    };
  }
});

// node_modules/fast-safe-stringify/index.js
var require_fast_safe_stringify = __commonJS((exports, module) => {
  module.exports = stringify;
  stringify.default = stringify;
  stringify.stable = deterministicStringify;
  stringify.stableStringify = deterministicStringify;
  var LIMIT_REPLACE_NODE = "[...]";
  var CIRCULAR_REPLACE_NODE = "[Circular]";
  var arr = [];
  var replacerStack = [];
  function defaultOptions() {
    return {
      depthLimit: Number.MAX_SAFE_INTEGER,
      edgesLimit: Number.MAX_SAFE_INTEGER
    };
  }
  function stringify(obj, replacer, spacer, options) {
    if (typeof options === "undefined") {
      options = defaultOptions();
    }
    decirc(obj, "", 0, [], undefined, 0, options);
    var res;
    try {
      if (replacerStack.length === 0) {
        res = JSON.stringify(obj, replacer, spacer);
      } else {
        res = JSON.stringify(obj, replaceGetterValues(replacer), spacer);
      }
    } catch (_) {
      return JSON.stringify("[unable to serialize, circular reference is too complex to analyze]");
    } finally {
      while (arr.length !== 0) {
        var part = arr.pop();
        if (part.length === 4) {
          Object.defineProperty(part[0], part[1], part[3]);
        } else {
          part[0][part[1]] = part[2];
        }
      }
    }
    return res;
  }
  function setReplace(replace, val, k, parent) {
    var propertyDescriptor = Object.getOwnPropertyDescriptor(parent, k);
    if (propertyDescriptor.get !== undefined) {
      if (propertyDescriptor.configurable) {
        Object.defineProperty(parent, k, { value: replace });
        arr.push([parent, k, val, propertyDescriptor]);
      } else {
        replacerStack.push([val, k, replace]);
      }
    } else {
      parent[k] = replace;
      arr.push([parent, k, val]);
    }
  }
  function decirc(val, k, edgeIndex, stack, parent, depth, options) {
    depth += 1;
    var i;
    if (typeof val === "object" && val !== null) {
      for (i = 0;i < stack.length; i++) {
        if (stack[i] === val) {
          setReplace(CIRCULAR_REPLACE_NODE, val, k, parent);
          return;
        }
      }
      if (typeof options.depthLimit !== "undefined" && depth > options.depthLimit) {
        setReplace(LIMIT_REPLACE_NODE, val, k, parent);
        return;
      }
      if (typeof options.edgesLimit !== "undefined" && edgeIndex + 1 > options.edgesLimit) {
        setReplace(LIMIT_REPLACE_NODE, val, k, parent);
        return;
      }
      stack.push(val);
      if (Array.isArray(val)) {
        for (i = 0;i < val.length; i++) {
          decirc(val[i], i, i, stack, val, depth, options);
        }
      } else {
        var keys = Object.keys(val);
        for (i = 0;i < keys.length; i++) {
          var key = keys[i];
          decirc(val[key], key, i, stack, val, depth, options);
        }
      }
      stack.pop();
    }
  }
  function compareFunction(a, b) {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  }
  function deterministicStringify(obj, replacer, spacer, options) {
    if (typeof options === "undefined") {
      options = defaultOptions();
    }
    var tmp = deterministicDecirc(obj, "", 0, [], undefined, 0, options) || obj;
    var res;
    try {
      if (replacerStack.length === 0) {
        res = JSON.stringify(tmp, replacer, spacer);
      } else {
        res = JSON.stringify(tmp, replaceGetterValues(replacer), spacer);
      }
    } catch (_) {
      return JSON.stringify("[unable to serialize, circular reference is too complex to analyze]");
    } finally {
      while (arr.length !== 0) {
        var part = arr.pop();
        if (part.length === 4) {
          Object.defineProperty(part[0], part[1], part[3]);
        } else {
          part[0][part[1]] = part[2];
        }
      }
    }
    return res;
  }
  function deterministicDecirc(val, k, edgeIndex, stack, parent, depth, options) {
    depth += 1;
    var i;
    if (typeof val === "object" && val !== null) {
      for (i = 0;i < stack.length; i++) {
        if (stack[i] === val) {
          setReplace(CIRCULAR_REPLACE_NODE, val, k, parent);
          return;
        }
      }
      try {
        if (typeof val.toJSON === "function") {
          return;
        }
      } catch (_) {
        return;
      }
      if (typeof options.depthLimit !== "undefined" && depth > options.depthLimit) {
        setReplace(LIMIT_REPLACE_NODE, val, k, parent);
        return;
      }
      if (typeof options.edgesLimit !== "undefined" && edgeIndex + 1 > options.edgesLimit) {
        setReplace(LIMIT_REPLACE_NODE, val, k, parent);
        return;
      }
      stack.push(val);
      if (Array.isArray(val)) {
        for (i = 0;i < val.length; i++) {
          deterministicDecirc(val[i], i, i, stack, val, depth, options);
        }
      } else {
        var tmp = {};
        var keys = Object.keys(val).sort(compareFunction);
        for (i = 0;i < keys.length; i++) {
          var key = keys[i];
          deterministicDecirc(val[key], key, i, stack, val, depth, options);
          tmp[key] = val[key];
        }
        if (typeof parent !== "undefined") {
          arr.push([parent, k, val]);
          parent[k] = tmp;
        } else {
          return tmp;
        }
      }
      stack.pop();
    }
  }
  function replaceGetterValues(replacer) {
    replacer = typeof replacer !== "undefined" ? replacer : function(k, v) {
      return v;
    };
    return function(key, val) {
      if (replacerStack.length > 0) {
        for (var i = 0;i < replacerStack.length; i++) {
          var part = replacerStack[i];
          if (part[1] === key && part[0] === val) {
            val = part[2];
            replacerStack.splice(i, 1);
            break;
          }
        }
      }
      return replacer.call(this, key, val);
    };
  }
});

// node_modules/pino-pretty/lib/utils/prettify-error.js
var require_prettify_error = __commonJS((exports, module) => {
  module.exports = prettifyError;
  var joinLinesWithIndentation = require_join_lines_with_indentation();
  function prettifyError({ keyName, lines, eol, ident }) {
    let result = "";
    const joinedLines = joinLinesWithIndentation({ input: lines, ident, eol });
    const splitLines = `${ident}${keyName}: ${joinedLines}${eol}`.split(eol);
    for (let j = 0;j < splitLines.length; j += 1) {
      if (j !== 0)
        result += eol;
      const line = splitLines[j];
      if (/^\s*"stack"/.test(line)) {
        const matches = /^(\s*"stack":)\s*(".*"),?$/.exec(line);
        if (matches && matches.length === 3) {
          const indentSize = /^\s*/.exec(line)[0].length + 4;
          const indentation = " ".repeat(indentSize);
          const stackMessage = matches[2];
          result += matches[1] + eol + indentation + JSON.parse(stackMessage).replace(/\n/g, eol + indentation);
        } else {
          result += line;
        }
      } else {
        result += line;
      }
    }
    return result;
  }
});

// node_modules/pino-pretty/lib/utils/prettify-object.js
var require_prettify_object = __commonJS((exports, module) => {
  module.exports = prettifyObject;
  var {
    LOGGER_KEYS
  } = require_constants2();
  var stringifySafe = require_fast_safe_stringify();
  var joinLinesWithIndentation = require_join_lines_with_indentation();
  var prettifyError = require_prettify_error();
  function prettifyObject({
    log,
    excludeLoggerKeys = true,
    skipKeys = [],
    context
  }) {
    const {
      EOL: eol,
      IDENT: ident,
      customPrettifiers,
      errorLikeObjectKeys: errorLikeKeys,
      objectColorizer,
      singleLine,
      colorizer
    } = context;
    const keysToIgnore = [].concat(skipKeys);
    if (excludeLoggerKeys === true)
      Array.prototype.push.apply(keysToIgnore, LOGGER_KEYS);
    let result = "";
    const { plain, errors } = Object.entries(log).reduce(({ plain: plain2, errors: errors2 }, [k, v]) => {
      if (keysToIgnore.includes(k) === false) {
        const pretty = typeof customPrettifiers[k] === "function" ? customPrettifiers[k](v, k, log, { colors: colorizer.colors }) : v;
        if (errorLikeKeys.includes(k)) {
          errors2[k] = pretty;
        } else {
          plain2[k] = pretty;
        }
      }
      return { plain: plain2, errors: errors2 };
    }, { plain: {}, errors: {} });
    if (singleLine) {
      if (Object.keys(plain).length > 0) {
        result += objectColorizer.greyMessage(stringifySafe(plain));
      }
      result += eol;
      result = result.replace(/\\\\/gi, "\\");
    } else {
      Object.entries(plain).forEach(([keyName, keyValue]) => {
        let lines = typeof customPrettifiers[keyName] === "function" ? keyValue : stringifySafe(keyValue, null, 2);
        if (lines === undefined)
          return;
        lines = lines.replace(/\\\\/gi, "\\");
        const joinedLines = joinLinesWithIndentation({ input: lines, ident, eol });
        result += `${ident}${objectColorizer.property(keyName)}:${joinedLines.startsWith(eol) ? "" : " "}${joinedLines}${eol}`;
      });
    }
    Object.entries(errors).forEach(([keyName, keyValue]) => {
      const lines = typeof customPrettifiers[keyName] === "function" ? keyValue : stringifySafe(keyValue, null, 2);
      if (lines === undefined)
        return;
      result += prettifyError({ keyName, lines, eol, ident });
    });
    return result;
  }
});

// node_modules/pino-pretty/lib/utils/prettify-error-log.js
var require_prettify_error_log = __commonJS((exports, module) => {
  module.exports = prettifyErrorLog;
  var {
    LOGGER_KEYS
  } = require_constants2();
  var isObject = require_is_object2();
  var joinLinesWithIndentation = require_join_lines_with_indentation();
  var prettifyObject = require_prettify_object();
  function prettifyErrorLog({ log, context }) {
    const {
      EOL: eol,
      IDENT: ident,
      errorProps: errorProperties,
      messageKey
    } = context;
    const stack = log.stack;
    const joinedLines = joinLinesWithIndentation({ input: stack, ident, eol });
    let result = `${ident}${joinedLines}${eol}`;
    if (errorProperties.length > 0) {
      const excludeProperties = LOGGER_KEYS.concat(messageKey, "type", "stack");
      let propertiesToPrint;
      if (errorProperties[0] === "*") {
        propertiesToPrint = Object.keys(log).filter((k) => excludeProperties.includes(k) === false);
      } else {
        propertiesToPrint = errorProperties.filter((k) => excludeProperties.includes(k) === false);
      }
      for (let i = 0;i < propertiesToPrint.length; i += 1) {
        const key = propertiesToPrint[i];
        if (key in log === false)
          continue;
        if (isObject(log[key])) {
          const prettifiedObject = prettifyObject({
            log: log[key],
            excludeLoggerKeys: false,
            context: {
              ...context,
              IDENT: ident + ident
            }
          });
          result = `${result}${ident}${key}: {${eol}${prettifiedObject}${ident}}${eol}`;
          continue;
        }
        result = `${result}${ident}${key}: ${log[key]}${eol}`;
      }
    }
    return result;
  }
});

// node_modules/pino-pretty/lib/utils/prettify-level.js
var require_prettify_level = __commonJS((exports, module) => {
  module.exports = prettifyLevel;
  var getPropertyValue = require_get_property_value();
  function prettifyLevel({ log, context }) {
    const {
      colorizer,
      customLevels,
      customLevelNames,
      levelKey,
      getLevelLabelData
    } = context;
    const prettifier = context.customPrettifiers?.level;
    const output = getPropertyValue(log, levelKey);
    if (output === undefined)
      return;
    const labelColorized = colorizer(output, { customLevels, customLevelNames });
    if (prettifier) {
      const [label] = getLevelLabelData(output);
      return prettifier(output, levelKey, log, { label, labelColorized, colors: colorizer.colors });
    }
    return labelColorized;
  }
});

// node_modules/pino-pretty/lib/utils/prettify-message.js
var require_prettify_message = __commonJS((exports, module) => {
  module.exports = prettifyMessage;
  var {
    LEVELS
  } = require_constants2();
  var getPropertyValue = require_get_property_value();
  var interpretConditionals = require_interpret_conditionals();
  function prettifyMessage({ log, context }) {
    const {
      colorizer,
      customLevels,
      levelKey,
      levelLabel,
      messageFormat,
      messageKey,
      useOnlyCustomProps
    } = context;
    if (messageFormat && typeof messageFormat === "string") {
      const parsedMessageFormat = interpretConditionals(messageFormat, log);
      const message = String(parsedMessageFormat).replace(/{([^{}]+)}/g, function(match, p1) {
        let level;
        if (p1 === levelLabel && (level = getPropertyValue(log, levelKey)) !== undefined) {
          const condition = useOnlyCustomProps ? customLevels === undefined : customLevels[level] === undefined;
          return condition ? LEVELS[level] : customLevels[level];
        }
        const value = getPropertyValue(log, p1);
        return value !== undefined ? value : "";
      });
      return colorizer.message(message);
    }
    if (messageFormat && typeof messageFormat === "function") {
      const msg = messageFormat(log, messageKey, levelLabel, { colors: colorizer.colors });
      return colorizer.message(msg);
    }
    if (messageKey in log === false)
      return;
    if (typeof log[messageKey] !== "string" && typeof log[messageKey] !== "number" && typeof log[messageKey] !== "boolean")
      return;
    return colorizer.message(log[messageKey]);
  }
});

// node_modules/pino-pretty/lib/utils/prettify-metadata.js
var require_prettify_metadata = __commonJS((exports, module) => {
  module.exports = prettifyMetadata;
  function prettifyMetadata({ log, context }) {
    const { customPrettifiers: prettifiers, colorizer } = context;
    let line = "";
    if (log.name || log.pid || log.hostname) {
      line += "(";
      if (log.name) {
        line += prettifiers.name ? prettifiers.name(log.name, "name", log, { colors: colorizer.colors }) : log.name;
      }
      if (log.pid) {
        const prettyPid = prettifiers.pid ? prettifiers.pid(log.pid, "pid", log, { colors: colorizer.colors }) : log.pid;
        if (log.name && log.pid) {
          line += "/" + prettyPid;
        } else {
          line += prettyPid;
        }
      }
      if (log.hostname) {
        const prettyHostname = prettifiers.hostname ? prettifiers.hostname(log.hostname, "hostname", log, { colors: colorizer.colors }) : log.hostname;
        line += `${line === "(" ? "on" : " on"} ${prettyHostname}`;
      }
      line += ")";
    }
    if (log.caller) {
      const prettyCaller = prettifiers.caller ? prettifiers.caller(log.caller, "caller", log, { colors: colorizer.colors }) : log.caller;
      line += `${line === "" ? "" : " "}<${prettyCaller}>`;
    }
    if (line === "") {
      return;
    } else {
      return line;
    }
  }
});

// node_modules/pino-pretty/lib/utils/prettify-time.js
var require_prettify_time = __commonJS((exports, module) => {
  module.exports = prettifyTime;
  var formatTime = require_format_time();
  function prettifyTime({ log, context }) {
    const {
      timestampKey,
      translateTime: translateFormat
    } = context;
    const prettifier = context.customPrettifiers?.time;
    let time = null;
    if (timestampKey in log) {
      time = log[timestampKey];
    } else if ("timestamp" in log) {
      time = log.timestamp;
    }
    if (time === null)
      return;
    const output = translateFormat ? formatTime(time, translateFormat) : time;
    return prettifier ? prettifier(output) : `[${output}]`;
  }
});

// node_modules/pino-pretty/lib/utils/index.js
var require_utils = __commonJS((exports, module) => {
  module.exports = {
    buildSafeSonicBoom: require_build_safe_sonic_boom(),
    createDate: require_create_date(),
    deleteLogProperty: require_delete_log_property(),
    filterLog: require_filter_log(),
    formatTime: require_format_time(),
    getPropertyValue: require_get_property_value(),
    handleCustomLevelsNamesOpts: require_handle_custom_levels_names_opts(),
    handleCustomLevelsOpts: require_handle_custom_levels_opts(),
    interpretConditionals: require_interpret_conditionals(),
    isObject: require_is_object2(),
    isValidDate: require_is_valid_date(),
    joinLinesWithIndentation: require_join_lines_with_indentation(),
    noop: require_noop(),
    parseFactoryOptions: require_parse_factory_options(),
    prettifyErrorLog: require_prettify_error_log(),
    prettifyError: require_prettify_error(),
    prettifyLevel: require_prettify_level(),
    prettifyMessage: require_prettify_message(),
    prettifyMetadata: require_prettify_metadata(),
    prettifyObject: require_prettify_object(),
    prettifyTime: require_prettify_time(),
    splitPropertyKey: require_split_property_key(),
    getLevelLabelData: require_get_level_label_data()
  };
});

// node_modules/secure-json-parse/index.js
var require_secure_json_parse = __commonJS((exports, module) => {
  var hasBuffer = typeof Buffer !== "undefined";
  var suspectProtoRx = /"(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])"\s*:/;
  var suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
  function _parse(text, reviver, options) {
    if (options == null) {
      if (reviver !== null && typeof reviver === "object") {
        options = reviver;
        reviver = undefined;
      }
    }
    if (hasBuffer && Buffer.isBuffer(text)) {
      text = text.toString();
    }
    if (text && text.charCodeAt(0) === 65279) {
      text = text.slice(1);
    }
    const obj = JSON.parse(text, reviver);
    if (obj === null || typeof obj !== "object") {
      return obj;
    }
    const protoAction = options && options.protoAction || "error";
    const constructorAction = options && options.constructorAction || "error";
    if (protoAction === "ignore" && constructorAction === "ignore") {
      return obj;
    }
    if (protoAction !== "ignore" && constructorAction !== "ignore") {
      if (suspectProtoRx.test(text) === false && suspectConstructorRx.test(text) === false) {
        return obj;
      }
    } else if (protoAction !== "ignore" && constructorAction === "ignore") {
      if (suspectProtoRx.test(text) === false) {
        return obj;
      }
    } else {
      if (suspectConstructorRx.test(text) === false) {
        return obj;
      }
    }
    return filter(obj, { protoAction, constructorAction, safe: options && options.safe });
  }
  function filter(obj, { protoAction = "error", constructorAction = "error", safe } = {}) {
    let next = [obj];
    while (next.length) {
      const nodes = next;
      next = [];
      for (const node of nodes) {
        if (protoAction !== "ignore" && Object.prototype.hasOwnProperty.call(node, "__proto__")) {
          if (safe === true) {
            return null;
          } else if (protoAction === "error") {
            throw new SyntaxError("Object contains forbidden prototype property");
          }
          delete node.__proto__;
        }
        if (constructorAction !== "ignore" && Object.prototype.hasOwnProperty.call(node, "constructor") && node.constructor !== null && typeof node.constructor === "object" && Object.prototype.hasOwnProperty.call(node.constructor, "prototype")) {
          if (safe === true) {
            return null;
          } else if (constructorAction === "error") {
            throw new SyntaxError("Object contains forbidden prototype property");
          }
          delete node.constructor;
        }
        for (const key in node) {
          const value = node[key];
          if (value && typeof value === "object") {
            next.push(value);
          }
        }
      }
    }
    return obj;
  }
  function parse(text, reviver, options) {
    const { stackTraceLimit } = Error;
    Error.stackTraceLimit = 0;
    try {
      return _parse(text, reviver, options);
    } finally {
      Error.stackTraceLimit = stackTraceLimit;
    }
  }
  function safeParse(text, reviver) {
    const { stackTraceLimit } = Error;
    Error.stackTraceLimit = 0;
    try {
      return _parse(text, reviver, { safe: true });
    } catch {
      return;
    } finally {
      Error.stackTraceLimit = stackTraceLimit;
    }
  }
  module.exports = parse;
  module.exports.default = parse;
  module.exports.parse = parse;
  module.exports.safeParse = safeParse;
  module.exports.scan = filter;
});

// node_modules/pino-pretty/lib/pretty.js
var require_pretty = __commonJS((exports, module) => {
  module.exports = pretty;
  var sjs = require_secure_json_parse();
  var isObject = require_is_object2();
  var prettifyErrorLog = require_prettify_error_log();
  var prettifyLevel = require_prettify_level();
  var prettifyMessage = require_prettify_message();
  var prettifyMetadata = require_prettify_metadata();
  var prettifyObject = require_prettify_object();
  var prettifyTime = require_prettify_time();
  var filterLog = require_filter_log();
  var {
    LEVELS,
    LEVEL_KEY,
    LEVEL_NAMES
  } = require_constants2();
  var jsonParser = (input) => {
    try {
      return { value: sjs.parse(input, { protoAction: "remove" }) };
    } catch (err) {
      return { err };
    }
  };
  function pretty(inputData) {
    let log;
    if (!isObject(inputData)) {
      const parsed = jsonParser(inputData);
      if (parsed.err || !isObject(parsed.value)) {
        return inputData + this.EOL;
      }
      log = parsed.value;
    } else {
      log = inputData;
    }
    if (this.minimumLevel) {
      let condition;
      if (this.useOnlyCustomProps) {
        condition = this.customLevels;
      } else {
        condition = this.customLevelNames[this.minimumLevel] !== undefined;
      }
      let minimum;
      if (condition) {
        minimum = this.customLevelNames[this.minimumLevel];
      } else {
        minimum = LEVEL_NAMES[this.minimumLevel];
      }
      if (!minimum) {
        minimum = typeof this.minimumLevel === "string" ? LEVEL_NAMES[this.minimumLevel] : LEVEL_NAMES[LEVELS[this.minimumLevel].toLowerCase()];
      }
      const level = log[this.levelKey === undefined ? LEVEL_KEY : this.levelKey];
      if (level < minimum)
        return;
    }
    const prettifiedMessage = prettifyMessage({ log, context: this.context });
    if (this.ignoreKeys || this.includeKeys) {
      log = filterLog({ log, context: this.context });
    }
    const prettifiedLevel = prettifyLevel({
      log,
      context: {
        ...this.context,
        ...this.context.customProperties
      }
    });
    const prettifiedMetadata = prettifyMetadata({ log, context: this.context });
    const prettifiedTime = prettifyTime({ log, context: this.context });
    let line = "";
    if (this.levelFirst && prettifiedLevel) {
      line = `${prettifiedLevel}`;
    }
    if (prettifiedTime && line === "") {
      line = `${prettifiedTime}`;
    } else if (prettifiedTime) {
      line = `${line} ${prettifiedTime}`;
    }
    if (!this.levelFirst && prettifiedLevel) {
      if (line.length > 0) {
        line = `${line} ${prettifiedLevel}`;
      } else {
        line = prettifiedLevel;
      }
    }
    if (prettifiedMetadata) {
      if (line.length > 0) {
        line = `${line} ${prettifiedMetadata}:`;
      } else {
        line = prettifiedMetadata;
      }
    }
    if (line.endsWith(":") === false && line !== "") {
      line += ":";
    }
    if (prettifiedMessage !== undefined) {
      if (line.length > 0) {
        line = `${line} ${prettifiedMessage}`;
      } else {
        line = prettifiedMessage;
      }
    }
    if (line.length > 0 && !this.singleLine) {
      line += this.EOL;
    }
    if (log.type === "Error" && typeof log.stack === "string") {
      const prettifiedErrorLog = prettifyErrorLog({ log, context: this.context });
      if (this.singleLine)
        line += this.EOL;
      line += prettifiedErrorLog;
    } else if (this.hideObject === false) {
      const skipKeys = [
        this.messageKey,
        this.levelKey,
        this.timestampKey
      ].map((key) => key.replaceAll(/\\/g, "")).filter((key) => {
        return typeof log[key] === "string" || typeof log[key] === "number" || typeof log[key] === "boolean";
      });
      const prettifiedObject = prettifyObject({
        log,
        skipKeys,
        context: this.context
      });
      if (this.singleLine && !/^\s$/.test(prettifiedObject)) {
        line += " ";
      }
      line += prettifiedObject;
    }
    return line;
  }
});

// node_modules/pino-pretty/index.js
var require_pino_pretty = __commonJS((exports, module) => {
  var { isColorSupported } = require_colorette();
  var pump = require_pump();
  var { Transform } = __require("stream");
  var abstractTransport = require_pino_abstract_transport();
  var colors = require_colors();
  var {
    ERROR_LIKE_KEYS,
    LEVEL_KEY,
    LEVEL_LABEL,
    MESSAGE_KEY,
    TIMESTAMP_KEY
  } = require_constants2();
  var {
    buildSafeSonicBoom,
    parseFactoryOptions
  } = require_utils();
  var pretty = require_pretty();
  var defaultOptions = {
    colorize: isColorSupported,
    colorizeObjects: true,
    crlf: false,
    customColors: null,
    customLevels: null,
    customPrettifiers: {},
    errorLikeObjectKeys: ERROR_LIKE_KEYS,
    errorProps: "",
    hideObject: false,
    ignore: "hostname",
    include: undefined,
    levelFirst: false,
    levelKey: LEVEL_KEY,
    levelLabel: LEVEL_LABEL,
    messageFormat: null,
    messageKey: MESSAGE_KEY,
    minimumLevel: undefined,
    outputStream: process.stdout,
    singleLine: false,
    timestampKey: TIMESTAMP_KEY,
    translateTime: true,
    useOnlyCustomProps: true
  };
  function prettyFactory(options) {
    const context = parseFactoryOptions(Object.assign({}, defaultOptions, options));
    return pretty.bind({ ...context, context });
  }
  function build(opts = {}) {
    let pretty2 = prettyFactory(opts);
    let destination;
    return abstractTransport(function(source) {
      source.on("message", function pinoConfigListener(message) {
        if (!message || message.code !== "PINO_CONFIG")
          return;
        Object.assign(opts, {
          messageKey: message.config.messageKey,
          errorLikeObjectKeys: Array.from(new Set([...opts.errorLikeObjectKeys || ERROR_LIKE_KEYS, message.config.errorKey])),
          customLevels: message.config.levels.values
        });
        pretty2 = prettyFactory(opts);
        source.off("message", pinoConfigListener);
      });
      const stream = new Transform({
        objectMode: true,
        autoDestroy: true,
        transform(chunk, enc, cb) {
          const line = pretty2(chunk);
          cb(null, line);
        }
      });
      if (typeof opts.destination === "object" && typeof opts.destination.write === "function") {
        destination = opts.destination;
      } else {
        destination = buildSafeSonicBoom({
          dest: opts.destination || 1,
          append: opts.append,
          mkdir: opts.mkdir,
          sync: opts.sync
        });
      }
      source.on("unknown", function(line) {
        destination.write(line + `
`);
      });
      pump(source, stream, destination);
      return stream;
    }, {
      parse: "lines",
      close(err, cb) {
        destination.on("close", () => {
          cb(err);
        });
      }
    });
  }
  module.exports = build;
  module.exports.build = build;
  module.exports.PinoPretty = build;
  module.exports.prettyFactory = prettyFactory;
  module.exports.colorizerFactory = colors;
  module.exports.isColorSupported = isColorSupported;
  module.exports.default = build;
});

// src/services/sse-token.service.ts
var import_paseto = __toESM(require_lib(), 1);
import path2 from "path";

// src/providers/logger.provider.ts
var import_pino = __toESM(require_pino(), 1);
var import_pino_pretty = __toESM(require_pino_pretty(), 1);
import path from "path";
import fs from "fs";
var logDir = path.join(process.cwd(), "logs");
var isProd = false;
if (!isProd && !fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
var baseOptions = {
  level: "info",
  timestamp: () => `,"time":"${new Date().toISOString()}"`
};
var logger = isProd ? import_pino.default(baseOptions, import_pino.default.destination({ sync: false })) : import_pino.default(baseOptions, import_pino.default.multistream([
  {
    level: "info",
    stream: import_pino_pretty.default({ colorize: true })
  },
  {
    level: "info",
    stream: import_pino_pretty.default({
      colorize: false,
      destination: path.join(logDir, "app.log"),
      sync: true
    })
  }
]));

// src/services/sse-token.service.ts
class SseTokenService {
  static async bootstrapSecurity() {
    const envPath = path2.join(process.cwd(), ".env").toString();
    const privateKey = Bun.env.PASETO_PRIVATE_KEY;
    if (!privateKey) {
      const { publicKey, secretKey } = await import_paseto.V4.generateKey("public", { format: "paserk" });
      if (!secretKey || !publicKey) {
        logger.error("Error generating PASETO keys");
        process.exit(1);
      }
      const env = Bun.file(envPath);
      if (!await env.exists()) {
        logger.warn(".env file not found. Creating a new one...");
        await Bun.write(envPath, `PASETO_PRIVATE_KEY=${secretKey}
PASETO_PUBLIC_KEY=${publicKey}
`);
        logger.info("\u2705 Keys generated and saved to environment.");
        process.exit(0);
      }
      const existingEnv = await env.text();
      existingEnv.split(`
`).forEach((line) => {
        if (line.startsWith("PASETO_PRIVATE_KEY=") || line.startsWith("PASETO_PUBLIC_KEY=")) {
          logger.warn("PASETO keys already defined in .env. Please review the file and restart the server.");
          process.exit(1);
        }
      });
      await Bun.write(envPath, existingEnv.trim() + `
PASETO_PRIVATE_KEY=${secretKey}
PASETO_PUBLIC_KEY=${publicKey}
`);
      logger.info("\u2705 Keys generated and saved to environment.");
      process.exit(0);
    }
    logger.info("Identity loaded. System ready.");
  }
  static async generate() {
    const token = await import_paseto.V4.sign({ device: "sse-client" }, Bun.env.PASETO_PRIVATE_KEY);
    return token;
  }
  static async validate(token) {
    try {
      const validation = await import_paseto.V4.verify(token, Bun.env.PASETO_PUBLIC_KEY);
      return validation && validation.device === "sse-client";
    } catch {
      return false;
    }
  }
}

// src/init.ts
async function init() {
  await SseTokenService.bootstrapSecurity();
}
init().catch((err) => {
  console.error("Initialization failed:", err);
  process.exit(1);
});
