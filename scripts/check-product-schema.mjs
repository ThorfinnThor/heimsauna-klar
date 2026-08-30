import { readFile } from "node:fs/promises";

const schema = JSON.parse(await readFile(new URL("../data/schema/product.schema.json", import.meta.url), "utf8"));
const products = JSON.parse(await readFile(new URL("../data/products.json", import.meta.url), "utf8"));

function matchesType(value, type) {
  if (type === "null") return value === null;
  if (type === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
  if (type === "array") return Array.isArray(value);
  if (type === "integer") return Number.isInteger(value);
  if (type === "number") return typeof value === "number" && Number.isFinite(value);
  return typeof value === type;
}

function validate(value, rule, path) {
  const types = Array.isArray(rule.type) ? rule.type : rule.type ? [rule.type] : [];
  if (types.length > 0 && !types.some((type) => matchesType(value, type))) {
    throw new Error(`${path} has type ${typeof value}, expected ${types.join(" or ")}`);
  }
  if (rule.enum && !rule.enum.some((candidate) => Object.is(candidate, value))) {
    throw new Error(`${path} has an unsupported value`);
  }
  if (typeof value === "string") {
    if (rule.minLength !== undefined && value.length < rule.minLength) throw new Error(`${path} is too short`);
    if (rule.pattern && !new RegExp(rule.pattern).test(value)) throw new Error(`${path} does not match its pattern`);
    if (rule.format === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`${path} must be an ISO date`);
    if (rule.format === "uri" && !/^[a-z][a-z\d+.-]*:\/\//i.test(value)) throw new Error(`${path} must be a URI`);
  }
  if (typeof value === "number") {
    if (rule.minimum !== undefined && value < rule.minimum) throw new Error(`${path} is below minimum`);
    if (rule.exclusiveMinimum !== undefined && value <= rule.exclusiveMinimum) throw new Error(`${path} is not above exclusive minimum`);
    if (rule.maximum !== undefined && value > rule.maximum) throw new Error(`${path} is above maximum`);
  }
  if (Array.isArray(value)) {
    if (rule.minItems !== undefined && value.length < rule.minItems) throw new Error(`${path} needs at least ${rule.minItems} items`);
    if (rule.items) value.forEach((item, index) => validate(item, rule.items, `${path}[${index}]`));
  }
  if (matchesType(value, "object") && rule.properties) {
    for (const required of rule.required ?? []) {
      if (!(required in value)) throw new Error(`${path}.${required} is required by the schema`);
    }
    if (rule.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!(key in rule.properties)) throw new Error(`${path}.${key} is not declared in the schema`);
      }
    }
    for (const [key, childRule] of Object.entries(rule.properties)) {
      if (key in value) validate(value[key], childRule, `${path}.${key}`);
    }
  }
}

if (!Array.isArray(products)) throw new Error("data/products.json must contain an array");
products.forEach((product, index) => validate(product, schema, `products[${index}]`));
console.log(`Product schema check passed: ${products.length} records`);
