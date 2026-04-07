const TRANSIENT_NETWORK_CODES = new Set([
    "ECONNRESET",
    "ECONNABORTED",
    "ETIMEDOUT",
    "EAI_AGAIN",
    "ENOTFOUND",
    "EHOSTUNREACH",
    "ECONNREFUSED",
    "ERR_SOCKET_CLOSED",
]);

const RETRYABLE_HTTP_STATUS = new Set([408, 425, 429, 500, 502, 503, 504, 520, 522, 524]);

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isRetryableNetworkError(error) {
    const code = error?.code;
    const status = error?.response?.status;
    const message = String(error?.message || "").toLowerCase();

    if (TRANSIENT_NETWORK_CODES.has(code)) return true;
    if (typeof status === "number" && RETRYABLE_HTTP_STATUS.has(status)) return true;

    return (
        message.includes("socket hang up") ||
        message.includes("connection reset") ||
        message.includes("network error") ||
        message.includes("timed out")
    );
}

export function summarizeNetworkError(error) {
    const code = error?.code ? ` (${error.code})` : "";
    const status = error?.response?.status ? ` [HTTP ${error.response.status}]` : "";
    const message = error?.message || "Unknown network error";
    return `${message}${code}${status}`;
}

export async function withNetworkRetry(operation, options = {}) {
    const {
        attempts = 3,
        initialDelayMs = 300,
        maxDelayMs = 2500,
        shouldRetry = isRetryableNetworkError,
        onRetry,
    } = options;

    let lastError;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            const retryable = shouldRetry(error);

            if (!retryable || attempt >= attempts) {
                throw error;
            }

            const backoff = Math.min(initialDelayMs * 2 ** (attempt - 1), maxDelayMs);
            const jitter = Math.floor(Math.random() * 120);
            const delayMs = backoff + jitter;

            if (typeof onRetry === "function") {
                onRetry({ attempt, delayMs, error });
            }

            await sleep(delayMs);
        }
    }

    throw lastError;
}
