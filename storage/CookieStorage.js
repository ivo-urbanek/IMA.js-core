import ns from 'ima/namespace';
import IMAError from 'ima/error/GenericError';
import MapStorage from 'ima/storage/MapStorage';

ns.namespace('ima.storage');

/**
 * Implementation note: while this is not the largest possible value for a
 * {@code Date} instance, it is considered "safe enough", because we don't
 * expect this code to be around by the year 10 000. For those whom it might be
 * of intereset, the largest value we know of is
 * {@code new Date('Sat Sep 13 275760 00:00:00 GMT+0000 (UTC)')}.
 *
 * @const
 * @property MAX_EXPIRE_DATE
 * @type {Date}
 */
const MAX_EXPIRE_DATE = new Date('Fri, 31 Dec 9999 23:59:59 UTC');

/**
 * Separator used to separate cookie declarations in the {@code Cookie} HTTP
 * header or the return value of the {@code document.cookie} property.
 *
 * @const
 * @property COOKIE_SEPARATOR
 * @type {string}
 */
const COOKIE_SEPARATOR = '; ';

/**
 * Storage of cookies, mirroring the cookies to the current request / response
 * at the server side and the {@code document.cookie} property at the client
 * side. The storage caches the cookies internally.
 *
 * @class CookieStorage
 * @extends ima.storage.Map
 * @namespace ima.storage
 * @module ima
 * @submodule ima.storage
 *
 * @requires ima.Router.Request
 * @requires ima.Router.Response
 */
export default class CookieStorage extends MapStorage {
	/**
	 * Initializes the cookie storage.
	 *
	 * @constructor
	 * @method constructor
	 * @param {ima.window.Window} window The window utility.
	 * @param {ima.router.Request} request The current HTTP request.
	 * @param {ima.router.Response} response The current HTTP response.
	 * @example
	 *      cookie.set('cookie', 'value', { expires: 10 }); // cookie expires
	 *                                                      // after 10s
	 *      cookie.set('cookie'); // delete cookie
	 *
	 */
	constructor(window, request, response) {
		super();

		/**
		 * The window utility used to determine whether the IMA is being run
		 * at the client or at the server.
		 *
		 * @private
		 * @property _window
		 * @type {ima.window.Window}
		 */
		this._window = window;

		/**
		 * The current HTTP request. This field is used at the server side.
		 *
		 * @private
		 * @property _request
		 * @type {ima.router.Request}
		 */
		this._request = request;

		/**
		 * The current HTTP response. This field is used at the server side.
		 *
		 * @private
		 * @property _response
		 * @type {ima.router.Response}
		 */
		this._response = response;

		/**
		 * The overriding cookie attribute values.
		 *
		 * @private
		 * @property _options
		 * @type {{path: string, secure: boolean, httpOnly: boolean,
		 *       domain: string, expires: (Date|number|null),
		 *       maxAge: (number|null)}}
		 */
		this._options = {
			path: '/',
			expires: null,
			maxAge: null,
			secure: false,
			httpOnly: false,
			domain: ''
		};

		/**
		 * Transform encode and decode functions for cookie value.
		 *
		 * @private
		 * @property _transformFunction
		 * @type {{encode: function, decode: function}}
		 */
		this._transformFunction = {
			encode: (s) => s,
			decode: (s) => s
		};
	}

	/**
	 * @inheritdoc
	 * @method init
	 */
	init(options = {}, transformFunction = {}) {
		this._transformFunction = Object.assign(
			this._transformFunction,
			transformFunction
		);
		this._options = Object.assign(this._options, options);
		this._parse();

		return this;
	}

	/**
	 * @inheritdoc
	 * @method has
	 */
	has(name) {
		return super.has(name);
	}

	/**
	 * @inheritdoc
	 * @method get
	 */
	get(name) {
		if (super.has(name)) {
			return super.get(name).value;
		} else {
			return undefined;
		}
	}

	/**
	 * @inheritdoc
	 * @method set
	 * @param {string} name The key identifying the storage entry.
	 * @param {*} value The storage entry value.
	 * @param {{
	 *            maxAge: number=,
	 *            expires: (string|Date)=,
	 *            domain: string=,
	 *            path: string=,
	 *            httpOnly: boolean=,
	 *            secure: boolean=
	 *        }=} options The cookie options. The {@code maxAge} is the maximum
	 *        age in seconds of the cookie before it will be deleted, the
	 *        {@code expires} is an alternative to that, specifying the moment
	 *        at which the cookie will be discarded. The {@code domain} and
	 *        {@code path} specify the cookie's domain and path. The
	 *        {@code httpOnly} and {@code secure} flags set the flags of the
	 *        same name of the cookie.
	 */
	set(name, value, options = {}) {
		options = Object.assign({}, this._options, options);

		if (value === undefined) {
			options.expires = -1;
		}

		if (options.maxAge || options.expires) {
			options.expires = this._getExpirationAsDate(options.maxAge || options.expires);
			delete options.maxAge; // we use the expires option instead
		}

		value = this._sanitizeCookieValue(value + '');

		if (this._window.isClient()) {
			document.cookie = this._generateCookieString(name, value, options);
		} else {
			this._response.setCookie(name, value, options);
		}
		super.set(name, { value, options });

		return this;
	}

	/**
	 * @inheritdoc
	 * @method delete
	 */
	delete(name) {
		if (this.has(name)) {
			this.set(name);
			super.delete(name);
		}

		return this;
	}

	/**
	 * @inheritdoc
	 * @method clear
	 */
	clear() {
		for (var cookieName of super.keys()) {
			this.delete(cookieName);
		}

		return super.clear();
	}

	/**
	 * @inheritdoc
	 * @method keys
	 */
	keys() {
		return super.keys();
	}

	/**
	 * @inheritdoc
	 * @method size
	 */
	size() {
		return super.size();
	}

	/**
	 * Returns all cookies in this storage serialized to a string compatible
	 * with the {@code Cookie} HTTP header.
	 *
	 * @method getCookiesStringForCookieHeader
	 * @return {string} All cookies in this storage serialized to a string
	 *         compatible with the {@code Cookie} HTTP header.
	 */
	getCookiesStringForCookieHeader() {
		var cookieStrings = [];

		for (var cookieName of super.keys()) {
			var cookieItem = super.get(cookieName);

			cookieStrings.push(this._generateCookieString(
				cookieName,
				cookieItem.value,
				{}
			));
		}

		return cookieStrings.join(COOKIE_SEPARATOR);
	}

	/**
	 * Parses cookies from the provided {@code Set-Cookie} HTTP header value.
	 *
	 * The parsed cookies will be set to the internal storage, and the current
	 * HTTP response (via the {@code Set-Cookie} HTTP header) if at the server
	 * side, or the browser (via the {@code document.cookie} property).
	 *
	 * @method parseFromSetCookieHeader
	 * @param {string} setCookieHeader The value of the {@code Set-Cookie} HTTP
	 *        header.
	 */
	parseFromSetCookieHeader(setCookieHeader) {
		var cookie = this._extractCookie(setCookieHeader);

		if (cookie.name !== null) {
			this.set(cookie.name, cookie.value, cookie.options);
		}
	}

	/**
	 * Parses cookies from a cookie string and sets the parsed cookies to the
	 * internal storage.
	 *
	 * The method obtains the cookie string from the request's {@code Cookie}
	 * HTTP header when used at the server side, and the {@code document.cookie}
	 * property at the client side.
	 *
	 * @private
	 * @method _parse
	 */
	_parse() {
		var cookiesString = this._window.isClient() ?
			document.cookie : this._request.getCookieHeader();
		var cookiesArray = cookiesString ?
			cookiesString.split(COOKIE_SEPARATOR) : [];

		for (var i = 0; i < cookiesArray.length; i++) {
			var cookie = this._extractCookie(cookiesArray[i]);

			if (cookie.name !== null) {
				cookie.options = Object.assign(
					{},
					this._options,
					cookie.options
				);

				super.set(cookie.name, {
					value: this._sanitizeCookieValue(cookie.value),
					options: cookie.options
				});
			}
		}
	}

	/**
	 * Creates a copy of the provided word (or text) that has its first
	 * character converted to lower case.
	 *
	 * @private
	 * @method _firstLetterToLowerCase
	 * @param {string} word The word (or any text) that should have its first
	 *        character converted to lower case.
	 * @return {string} A copy of the provided string with its first character
	 *         converted to lower case.
	 */
	_firstLetterToLowerCase(word) {
		return word.charAt(0).toLowerCase() + word.substring(1);
	}

	/**
	 * Generates a string representing the specified cookied, usable either
	 * with the {@code document.cookie} property or the {@code Set-Cookie} HTTP
	 * header.
	 *
	 * (Note that the {@code Cookie} HTTP header uses a slightly different
	 * syntax.)
	 *
	 * @private
	 * @method _generateCookieString
	 * @param {string} name The cookie name.
	 * @param {(boolean|number|string)} value The cookie value, will be
	 *        converted to string.
	 * @param {{path: string=, domain: string=, expires: Date=, secure: boolean=}} options
	 *        Cookie attributes. Only the attributes listed in the type
	 *        annotation of this field are supported. For documentation and
	 *        full list of cookie attributes see
	 *        http://tools.ietf.org/html/rfc2965#page-5
	 * @return {string} A string representing the cookie. Setting this string
	 *         to the {@code document.cookie} property will set the cookie to
	 *         the browser's cookie storage.
	 */
	_generateCookieString(name, value, options) {
		var cookieString = name + '=' + this._transformFunction.encode(value);

		cookieString += options.domain ? ';Domain=' + options.domain : '';
		cookieString += options.path ? ';Path=' + options.path : '';
		cookieString += options.expires ?
				';Expires=' + options.expires.toUTCString() : '';
		cookieString += options.httpOnly ? ';HttpOnly' : '';
		cookieString += options.secure ? ';Secure' : '';

		return cookieString;
	}

	/**
	 * Converts the provided cookie expiration to a {@code Date} instance.
	 *
	 * @private
	 * @method _getExpirationAsDate
	 * @param {(number|string|Date)} expiration Cookie expiration in seconds
	 *        from now, or as a string compatible with the {@code Date}
	 *        constructor.
	 * @return {Date} Cookie expiration as a {@code Date} instance.
	 */
	_getExpirationAsDate(expiration) {
		if (expiration instanceof Date) {
			return expiration;
		}

		if (typeof expiration === 'number') {
			return expiration === Infinity ?
				MAX_EXPIRE_DATE : new Date(Date.now() + expiration * 1000);
		}

		return expiration ? new Date(expiration) : MAX_EXPIRE_DATE;
	}

	/**
	 * Extract cookie name, value and options from cookie string.
	 *
	 * @private
	 * @method _extractCookie
	 * @param {string} cookieString The value of the {@code Set-Cookie} HTTP
	 *        header.
	 * @return {{name: (string|null) value: (string|null), options: Object<string, boolean|Date>}}
	 */
	_extractCookie(cookieString) {
		var cookieOptions = {};
		var cookieName = null;
		var cookieValue = null;

		var cookiePairs = cookieString.split(COOKIE_SEPARATOR.trim());

		cookiePairs.forEach((pair, index) => {
			var [name, value] = this._extractNameAndValue(pair, index);

			if (index === 0) {
				cookieName = name;
				cookieValue = value;
			} else {
				cookieOptions[name] = value;
			}
		});

		return {
			name: cookieName,
			value: cookieValue,
			options: cookieOptions
		};
	}

	/**
	 * Extract name and value for defined pair and pair index.
	 *
	 * @private
	 * @method _extractNameAndValue
	 * @param {string} pair
	 * @param {number} pairIndex
	 * @return {Array<(string|boolean|Date|null)>}
	 */
	_extractNameAndValue(pair, pairIndex) {
		var separatorIndexEqual = pair.indexOf('=');
		var name = '';
		var value = null;

		if (pairIndex === 0 && separatorIndexEqual < 0) {
			return [null, null];
		}

		if (separatorIndexEqual < 0) {
			name = pair.trim();
			value = true;
		} else {
			name = pair.substring(0, separatorIndexEqual).trim();

			value = this._transformFunction.decode(
				pair.substring(separatorIndexEqual + 1).trim()
			);

			// erase quoted values
			if ('"' === value[0]) {
				value = value.slice(1, -1);
			}

			if (name === 'Expires') {
				value = this._getExpirationAsDate(value);
			}

			if (name === 'Max-Age') {
				name = 'maxAge';
				value = parseInt(value, 10);
			}
		}

		if (pairIndex !== 0) {
			name = this._firstLetterToLowerCase(name);
		}

		return [
			name,
			value
		];
	}

	/**
	 * Sanitize cookie value by rules in
	 * (@see http://tools.ietf.org/html/rfc6265#section-4r.1.1). Erase all
	 * invalid characters from cookie value.
	 *
	 * @private
	 * @method _sanitizeCookieValue
	 * @param {string} value Cookie value
	 * @return {string} Sanitized value
	 */
	_sanitizeCookieValue(value) {
		var sanitizedValue = '';

		for (var keyChar = 0; keyChar < value.length; keyChar++) {
			var charCode = value.charCodeAt(keyChar);
			var char = value[keyChar];

			var isValid =
					(charCode >= 33) &&
					(charCode <= 126) &&
					(char !== '"') &&
					(char !== ';') &&
					(char !== '\\');
			if (isValid) {
				sanitizedValue += char;
			} else {
				if ($Debug) {
					throw new IMAError(`Invalid char ${char} code ` +
							`${charCode} in ${value}. Dropping invalid char ` +
							`from cookie value.`, { value, charCode, char });
				}
			}
		}

		return sanitizedValue;
	}
}

ns.ima.storage.CookieStorage = CookieStorage;
