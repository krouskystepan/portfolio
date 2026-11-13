export type HttpStatusClass = '1xx' | '2xx' | '3xx' | '4xx' | '5xx'

export type HttpStatusCode = {
  code: number
  name: string
  /** What the status means. */
  description: string
  /** When an API / server should return it. */
  whenToUse: string
  /** Common QA / testing note. */
  testingTip?: string
}

export const HTTP_STATUS_CLASSES: readonly HttpStatusClass[] = [
  '1xx',
  '2xx',
  '3xx',
  '4xx',
  '5xx'
]

export const HTTP_STATUS_CLASS_LABELS: Record<HttpStatusClass, string> = {
  '1xx': 'Informational',
  '2xx': 'Success',
  '3xx': 'Redirection',
  '4xx': 'Client error',
  '5xx': 'Server error'
}

export const HTTP_STATUS_CODES: readonly HttpStatusCode[] = [
  {
    code: 100,
    name: 'Continue',
    description:
      'The initial part of the request was received and the client may continue.',
    whenToUse:
      'Large uploads using Expect: 100-continue so the server can reject early.'
  },
  {
    code: 101,
    name: 'Switching Protocols',
    description: 'The server is switching to the protocol requested by the client.',
    whenToUse: 'WebSocket upgrade handshakes.'
  },
  {
    code: 102,
    name: 'Processing',
    description: 'The server has accepted the request but has no response yet (WebDAV).',
    whenToUse: 'Long-running WebDAV operations.'
  },
  {
    code: 103,
    name: 'Early Hints',
    description: 'Preliminary headers sent before the final response.',
    whenToUse: 'Preload hints (Link headers) while the server prepares the response.'
  },
  {
    code: 200,
    name: 'OK',
    description: 'The request succeeded.',
    whenToUse: 'Successful GET, or PUT/PATCH/POST that returns a body.',
    testingTip: 'Also assert the body shape - 200 with an error payload is a common bug.'
  },
  {
    code: 201,
    name: 'Created',
    description: 'The request succeeded and a new resource was created.',
    whenToUse: 'Successful POST that creates a resource; include a Location header.',
    testingTip: 'Check the Location header and that the resource is retrievable.'
  },
  {
    code: 202,
    name: 'Accepted',
    description: 'The request was accepted for processing but is not complete.',
    whenToUse: 'Async jobs / queues; return a status URL for polling.'
  },
  {
    code: 203,
    name: 'Non-Authoritative Information',
    description: 'Response was modified by a transforming proxy.',
    whenToUse: 'Rare; when a proxy alters the origin response.'
  },
  {
    code: 204,
    name: 'No Content',
    description: 'Success with no response body.',
    whenToUse: 'DELETE or PUT/PATCH when there is nothing to return.',
    testingTip: 'Assert the body is empty and Content-Length is 0 / absent.'
  },
  {
    code: 205,
    name: 'Reset Content',
    description: 'Success; the client should reset the document view.',
    whenToUse: 'After form submissions where the form should be cleared.'
  },
  {
    code: 206,
    name: 'Partial Content',
    description: 'Only part of the resource is returned (range request).',
    whenToUse: 'Range requests for large files, video seeking, resumable downloads.'
  },
  {
    code: 207,
    name: 'Multi-Status',
    description: 'Multiple independent statuses in one body (WebDAV).',
    whenToUse: 'Batch operations where each item has its own result.'
  },
  {
    code: 208,
    name: 'Already Reported',
    description: 'Members were already enumerated earlier in the response (WebDAV).',
    whenToUse: 'Avoid repeating bindings in a multi-status response.'
  },
  {
    code: 226,
    name: 'IM Used',
    description: 'Response is the result of instance manipulations (delta encoding).',
    whenToUse: 'Rare; delta encoding responses.'
  },
  {
    code: 300,
    name: 'Multiple Choices',
    description: 'The request has more than one possible response.',
    whenToUse: 'Rare; content negotiation lists alternatives.'
  },
  {
    code: 301,
    name: 'Moved Permanently',
    description: 'The resource has permanently moved to a new URL.',
    whenToUse: 'Permanent URL changes; clients and search engines update links.',
    testingTip: 'POST may be rewritten to GET by some clients - use 308 to preserve the method.'
  },
  {
    code: 302,
    name: 'Found',
    description: 'The resource is temporarily at a different URL.',
    whenToUse: 'Temporary redirects (e.g. after login).',
    testingTip: 'Check redirect following behaviour in your HTTP client.'
  },
  {
    code: 303,
    name: 'See Other',
    description: 'Redirect to another URL using GET.',
    whenToUse: 'Post/Redirect/Get pattern after a successful POST.'
  },
  {
    code: 304,
    name: 'Not Modified',
    description: 'The cached version is still valid.',
    whenToUse: 'Conditional GET with If-None-Match / If-Modified-Since.',
    testingTip: 'Verify ETag / Last-Modified round trips; the body must be empty.'
  },
  {
    code: 307,
    name: 'Temporary Redirect',
    description: 'Temporary redirect; the method and body must not change.',
    whenToUse: 'Temporary redirects that must preserve POST/PUT.'
  },
  {
    code: 308,
    name: 'Permanent Redirect',
    description: 'Permanent redirect; the method and body must not change.',
    whenToUse: 'Permanent moves of endpoints that accept non-GET methods.'
  },
  {
    code: 400,
    name: 'Bad Request',
    description: 'The server cannot process the request due to a client error.',
    whenToUse: 'Malformed syntax, invalid JSON, missing required fields.',
    testingTip: 'Assert the error body names the offending field.'
  },
  {
    code: 401,
    name: 'Unauthorized',
    description: 'Authentication is required or has failed.',
    whenToUse: 'Missing, expired, or invalid credentials; include WWW-Authenticate.',
    testingTip: 'Test missing, malformed, and expired tokens separately.'
  },
  {
    code: 402,
    name: 'Payment Required',
    description: 'Reserved for future digital payment use.',
    whenToUse: 'Sometimes used by APIs for quota / billing limits.'
  },
  {
    code: 403,
    name: 'Forbidden',
    description: 'Authenticated, but not allowed to access the resource.',
    whenToUse: 'Insufficient permissions / roles.',
    testingTip: 'Cover role-based access: each role vs each endpoint.'
  },
  {
    code: 404,
    name: 'Not Found',
    description: 'The resource does not exist (or is hidden).',
    whenToUse: 'Unknown ID or route; also to hide existence from unauthorized users.'
  },
  {
    code: 405,
    name: 'Method Not Allowed',
    description: 'The HTTP method is not supported for this resource.',
    whenToUse: 'e.g. DELETE on a read-only endpoint; include an Allow header.'
  },
  {
    code: 406,
    name: 'Not Acceptable',
    description: 'Cannot produce a response matching the Accept headers.',
    whenToUse: 'Content negotiation failure.'
  },
  {
    code: 407,
    name: 'Proxy Authentication Required',
    description: 'Authentication with a proxy is required.',
    whenToUse: 'Authenticating proxies.'
  },
  {
    code: 408,
    name: 'Request Timeout',
    description: 'The server timed out waiting for the request.',
    whenToUse: 'Client was too slow to send the full request.'
  },
  {
    code: 409,
    name: 'Conflict',
    description: 'The request conflicts with the current state of the resource.',
    whenToUse: 'Duplicate unique key, edit conflicts, version mismatch.',
    testingTip: 'Test creating a duplicate and concurrent updates.'
  },
  {
    code: 410,
    name: 'Gone',
    description: 'The resource was permanently removed.',
    whenToUse: 'Deliberately removed resources that will not return.'
  },
  {
    code: 411,
    name: 'Length Required',
    description: 'Content-Length header is required.',
    whenToUse: 'Server refuses requests without Content-Length.'
  },
  {
    code: 412,
    name: 'Precondition Failed',
    description: 'A precondition header evaluated to false.',
    whenToUse: 'If-Match / If-Unmodified-Since failures (optimistic concurrency).'
  },
  {
    code: 413,
    name: 'Content Too Large',
    description: 'The request body exceeds server limits (Payload Too Large).',
    whenToUse: 'Upload or body size limits.',
    testingTip: 'Boundary-test just below and above the documented limit.'
  },
  {
    code: 414,
    name: 'URI Too Long',
    description: 'The request URI is longer than the server will interpret.',
    whenToUse: 'Excessive query strings.'
  },
  {
    code: 415,
    name: 'Unsupported Media Type',
    description: 'The payload media type is not supported.',
    whenToUse: 'Wrong Content-Type (e.g. XML sent to a JSON-only endpoint).'
  },
  {
    code: 416,
    name: 'Range Not Satisfiable',
    description: 'The requested range cannot be served.',
    whenToUse: 'Range header outside the resource size.'
  },
  {
    code: 417,
    name: 'Expectation Failed',
    description: 'The Expect header cannot be met.',
    whenToUse: 'Servers rejecting Expect: 100-continue.'
  },
  {
    code: 418,
    name: "I'm a teapot",
    description: 'April Fools RFC 2324 joke status.',
    whenToUse: 'Easter eggs; occasionally used to flag blocked bots.'
  },
  {
    code: 421,
    name: 'Misdirected Request',
    description: 'The request was sent to a server unable to respond.',
    whenToUse: 'HTTP/2 connection reuse to the wrong origin.'
  },
  {
    code: 422,
    name: 'Unprocessable Content',
    description: 'Syntax is valid but the content is semantically invalid.',
    whenToUse: 'Validation failures on well-formed JSON (field rules, business rules).',
    testingTip: 'Assert per-field error messages and paths.'
  },
  {
    code: 423,
    name: 'Locked',
    description: 'The resource is locked (WebDAV).',
    whenToUse: 'Resource currently locked by another operation.'
  },
  {
    code: 424,
    name: 'Failed Dependency',
    description: 'Failed because a previous request failed (WebDAV).',
    whenToUse: 'Batch operations where a dependency failed.'
  },
  {
    code: 425,
    name: 'Too Early',
    description: 'The server is unwilling to risk processing a replayable request.',
    whenToUse: 'TLS early data (0-RTT) replay protection.'
  },
  {
    code: 426,
    name: 'Upgrade Required',
    description: 'The client must switch to a different protocol.',
    whenToUse: 'Requiring TLS or a newer HTTP version via the Upgrade header.'
  },
  {
    code: 428,
    name: 'Precondition Required',
    description: 'The server requires the request to be conditional.',
    whenToUse: 'Force If-Match on updates to avoid lost updates.'
  },
  {
    code: 429,
    name: 'Too Many Requests',
    description: 'Rate limit exceeded.',
    whenToUse: 'Throttling; include Retry-After.',
    testingTip: 'Verify the limit threshold, Retry-After value, and reset behaviour.'
  },
  {
    code: 431,
    name: 'Request Header Fields Too Large',
    description: 'Headers are too large.',
    whenToUse: 'Oversized cookies / headers.'
  },
  {
    code: 451,
    name: 'Unavailable For Legal Reasons',
    description: 'Access denied for legal reasons.',
    whenToUse: 'Censorship, DMCA takedown, geo-legal blocks.'
  },
  {
    code: 500,
    name: 'Internal Server Error',
    description: 'Unexpected server failure.',
    whenToUse: 'Unhandled exceptions; should not be returned for client mistakes.',
    testingTip: 'A 500 for bad input is a bug - it should be a 4xx.'
  },
  {
    code: 501,
    name: 'Not Implemented',
    description: 'The server does not support the requested functionality.',
    whenToUse: 'Unknown method or feature not built yet.'
  },
  {
    code: 502,
    name: 'Bad Gateway',
    description: 'Invalid response from an upstream server.',
    whenToUse: 'Gateway / proxy got a bad response from the origin.'
  },
  {
    code: 503,
    name: 'Service Unavailable',
    description: 'The server is temporarily unable to handle the request.',
    whenToUse: 'Maintenance or overload; include Retry-After.'
  },
  {
    code: 504,
    name: 'Gateway Timeout',
    description: 'Upstream server did not respond in time.',
    whenToUse: 'Gateway / proxy timeout waiting on the origin.'
  },
  {
    code: 505,
    name: 'HTTP Version Not Supported',
    description: 'The HTTP version is not supported.',
    whenToUse: 'Server rejects the protocol version used.'
  },
  {
    code: 506,
    name: 'Variant Also Negotiates',
    description: 'Circular reference in transparent content negotiation.',
    whenToUse: 'Rare server misconfiguration.'
  },
  {
    code: 507,
    name: 'Insufficient Storage',
    description: 'The server cannot store the representation (WebDAV).',
    whenToUse: 'Out of disk / quota on the server.'
  },
  {
    code: 508,
    name: 'Loop Detected',
    description: 'An infinite loop was detected (WebDAV).',
    whenToUse: 'Cyclic bindings during request processing.'
  },
  {
    code: 510,
    name: 'Not Extended',
    description: 'Further extensions to the request are required.',
    whenToUse: 'Rare; HTTP Extension Framework.'
  },
  {
    code: 511,
    name: 'Network Authentication Required',
    description: 'The client must authenticate to gain network access.',
    whenToUse: 'Captive portals (hotel / airport Wi-Fi).'
  }
]

export function getStatusClass(code: number): HttpStatusClass {
  if (code >= 500) return '5xx'
  if (code >= 400) return '4xx'
  if (code >= 300) return '3xx'
  if (code >= 200) return '2xx'
  return '1xx'
}

function normalize(text: string): string {
  return text.toLowerCase().trim()
}

/**
 * Search by code prefix ("4", "40", "404"), class ("4xx"), or free text across
 * name / description / usage. Multiple space-separated terms must all match.
 */
export function searchHttpStatusCodes(
  query: string,
  classFilter: HttpStatusClass | 'all' = 'all',
  list: readonly HttpStatusCode[] = HTTP_STATUS_CODES
): HttpStatusCode[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  return list.filter((entry) => {
    if (classFilter !== 'all' && getStatusClass(entry.code) !== classFilter) {
      return false
    }
    if (terms.length === 0) return true
    const haystack = normalize(
      `${entry.code} ${getStatusClass(entry.code)} ${entry.name} ${entry.description} ${entry.whenToUse} ${entry.testingTip ?? ''}`
    )
    const codeText = String(entry.code)
    return terms.every((term) => {
      if (/^\d{1,3}$/.test(term)) return codeText.startsWith(term)
      return haystack.includes(term)
    })
  })
}
