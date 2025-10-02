/**
 * Converts a numeric timestamp (in milliseconds) into a human-readable date string.
 * 
 * By default, the date is returned in `DD.MM.YYYY` format.  
 * You can customize the output by:
 * - Setting `reversed` to `true` → format becomes `YYYY.MM.DD`.
 * - Providing a custom `delimiter` → replaces the `.` between date parts.
 * 
 * Throws an error for negative or zero timestamps to help catch invalid values early.
 *
 * @param {Object} options - The options object.
 * @param {number} options.timestamp - The timestamp in **milliseconds** since Unix epoch (Jan 1, 1970).
 * @param {boolean} [options.reversed=false] - If `true`, returns the date in reversed format (`YYYY<delimiter>MM<delimiter>DD`).
 * @param {string} [options.delimiter="."] - Custom delimiter to use between date components.
 * @returns {string} Formatted date string.
 * 
 * @throws {Error} If the timestamp is negative (time travel is not allowed).
 * @throws {Error} If the timestamp is zero (likely uninitialized or invalid).
 * 
 * @example
 * // Returns "24.08.2023"
 * convertToHumanDate({ timestamp: 1692835200000 });
 * 
 * @example
 * // Returns "2023.08.24"
 * convertToHumanDate({ timestamp: 1692835200000, reversed: true });
 * 
 * @example
 * // Returns "24/08/2023"
 * convertToHumanDate({ timestamp: 1692835200000, delimiter: "/" });
 * 
 * @example
 * // Returns "2023-08-24"
 * convertToHumanDate({ timestamp: 1692835200000, reversed: true, delimiter: "-" });
 * 
 * @example
 * // Throws: "Time travel is prohibited. Check the timestamp."
 * convertToHumanDate({ timestamp: -1000 });
 * 
 * @example
 * // Throws: "It was either a long time ago or recently..."
 * convertToHumanDate({ timestamp: 0 });
 */
export function convertToHumanDate({
    timestamp,
    reversed = false,
    delimiter = "."
}: {
    timestamp: number;
    reversed?: boolean;
    delimiter?: string;
}): string {
    if (timestamp < 0) throw new Error("Time travel is prohibited. Check the timestamp.");
    if (timestamp === 0) throw new Error("It was either a long time ago or recently. Check the timestamp, it looks like it's reset.");

    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return reversed
        ? `${year}${delimiter}${month}${delimiter}${day}`
        : `${day}${delimiter}${month}${delimiter}${year}`;
}


/**
 * Retrieves the value of an environment variable by its key.
 * 
 * Throws an error if the variable is not defined.
 * This is useful to enforce that required environment variables are present.
 *
 * @param {string} key - The name of the environment variable to retrieve.
 * @returns {string} The value of the environment variable.
 * 
 * @throws {Error} If the environment variable with the given key is not set.
 *
 * @example
 * // Assuming process.env.API_KEY = "abc123"
 * const apiKey = getValueFromEnv("API_KEY");
 * console.log(apiKey); // "abc123"
 *
 * @example
 * // If process.env.MISSING_KEY is undefined
 * getValueFromEnv("MISSING_KEY"); 
 * // Throws Error: "Missing env var MISSING_KEY"
 */
export function getValueFromEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var ${key}`);
  return v;
}
