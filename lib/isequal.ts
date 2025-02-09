export function isEqual(value: any, other: any): boolean {
  // Check if both are strictly equal
  if (value === other) {
    return true;
  }

  // Check for null or undefined
  if (value == null || other == null || typeof value !== typeof other) {
    return false;
  }

  // Handle arrays
  if (Array.isArray(value) && Array.isArray(other)) {
    if (value.length !== other.length) {
      return false;
    }
    return value.every((item, index) => isEqual(item, other[index]));
  }

  // Handle objects
  if (typeof value === "object" && typeof other === "object") {
    const valueKeys = Object.keys(value);
    const otherKeys = Object.keys(other);

    // Check if the objects have the same number of keys
    if (valueKeys.length !== otherKeys.length) {
      return false;
    }

    // Check if all keys and values are equal
    return valueKeys.every(
      (key) => other.hasOwnProperty(key) && isEqual(value[key], other[key])
    );
  }

  // For all other types (functions, symbols, etc.)
  return false;
}

// // Usage example:
// const a = { name: "Alice", items: [1, 2, 3] };
// const b = { name: "Alice", items: [1, 2, 3] };
// const c = { name: "Bob", items: [1, 2, 3] };

// console.log(isEqual(a, b)); // true
// console.log(isEqual(a, c)); // false
