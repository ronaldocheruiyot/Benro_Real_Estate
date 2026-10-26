function idOf(val) {
  if (val == null) return val;
  if (typeof val === "string") return val;
  if (typeof val === "object" && typeof val.toString === "function") {
    const name = val.constructor?.name;
    if (name === "ObjectId" || val._bsontype === "ObjectId") {
      return val.toString();
    }
  }
  return val;
}

/** Convert Mongo docs to frontend-friendly objects with string `id`. */
export function serialize(doc) {
  if (!doc) return null;
  const obj = typeof doc.toObject === "function" ? doc.toObject({ virtuals: true }) : { ...doc };
  obj.id = idOf(obj._id) || obj.id;
  delete obj._id;
  delete obj.__v;
  if (obj.password) delete obj.password;

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val && typeof val === "object" && (val.constructor?.name === "ObjectId" || val._bsontype === "ObjectId")) {
      obj[key] = val.toString();
    } else if (Array.isArray(val)) {
      obj[key] = val.map((item) => {
        if (item && typeof item === "object" && (item.constructor?.name === "ObjectId" || item._bsontype === "ObjectId")) {
          return item.toString();
        }
        if (item && typeof item === "object" && item._id) {
          return serialize(item);
        }
        return item;
      });
    } else if (val && typeof val === "object" && val._id && !Buffer.isBuffer(val) && !(val instanceof Date)) {
      obj[key] = serialize(val);
    }
  }
  return obj;
}

export function serializeMany(docs) {
  return (docs || []).map(serialize);
}
