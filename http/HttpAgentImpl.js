import ns from 'ima/namespace';
import IMAError from 'ima/error/GenericError';
import HttpAgentInterface from 'ima/http/HttpAgent';

ns.namespace('ima.http');

/**
 * Implementation of the {@codelink ima.http.HttpAgent} interface with
 * internal caching of completed and ongoing HTTP requests and cookie storage.
 *
 * @class httpAgentImpl
 * @implements ima.http.HttpAgent
 * @namespace ima.http
 * @module ima
 * @submodule ima.http
 *
 * @requires ima.http.SuperAgentProxy
 * @requires ima.cache.Cache
 * @requires ima.storage.CookieStorage
point */
export default class HttpAgentImpl extends HttpAgentInterface {
	/**
	 * Initializes the HTTP handler.
	 *
	 * @method constructor
	 * @constructor
	 * @param {ima.http.Proxy} proxy The low-level HTTP proxy for sending the
	 *        HTTP requests.
	 * @param {ima.cache.Cache} cache Cache to use for caching ongoing and
	 *        completed requests.
	 * @param {ima.storage.Cookie} cookie The cookie storage to use
	 *        internally.
	 * @param {Object<string, *>} config Configuration of the HTTP handler for
	 *        the current application environment, specifying the various
	 *        default request option values and cache option values.
	 * @example
	 *      http
	 *          .get('url', { data: data }, {
	 *              ttl: 2000,
	 *              repeatRequest: 1,
	 *              withCredentials: true,
	 *              timeout: 2000,
	 *              accept: 'application/json',
	 *              language: 'en'
	 *          })
	 *          .then((response) => {
	 *              //resolve
	 *          }
	 *          .catch((error) => {
	 *             //catch
	 *          });
	 * @example
	 *      http
	 *          .setDefaultHeader('Accept-Language', 'en')
	 *          .clearDefaultHeaders();
	 */
	constructor(proxy, cache, cookie, config) {
		super();

		/**
		 * HTTP proxy, used to execute the HTTP requests.
		 *
		 * @private
		 * @property _proxy
		 * @type {ima.http.SuperAgentProxy}
		 */
		this._proxy = proxy;

		/**
		 * Internal request cache, used to cache completed request results.
		 *
		 * @private
		 * @property _cache
		 * @type {ima.cache.Cache}
		 */
		this._cache = cache;

		/**
		 * Cookie storage, used to keep track of cookies received from the
		 * server and send them with the subsequent requests to the server.
		 *
		 * @private
		 * @property _cookie
		 * @type {ima.storage.CookieStorage}
		 */
		this._cookie = cookie;

		/**
		 * Cache options.
		 *
		 * @private
		 * @property _cacheOptions
		 * @type {Object<string, string>}
		 */
		this._cacheOptions = config.cacheOptions;

		/**
		 * Default request options.
		 *
		 * @private
		 * @property _defaultRequestOptions
		 * @type {Object<string, (number|string)>}
		 */
		this._defaultRequestOptions = config.defaultRequestOptions;

		/**
		 * Internal request cache, used to cache ongoing requests.
		 *
		 * @private
		 * @property _internalCacheOfPromises
		 * @type {Map}
		 */
		this._internalCacheOfPromises = new Map();
	}

	/**
	 * @inheritdoc
	 * @method get
	 */
	get(url, data, options = {}) {
		return this._requestWithCheckCache('get', url, data, options);
	}

	/**
	 * @inheritdoc
	 * @method post
	 */
	post(url, data, options = {}) {
		return this._requestWithCheckCache(
			'post',
			url,
			data,
			Object.assign({}, options, { cache: false })
		);
	}

	/**
	 * @inheritdoc
	 * @method put
	 */
	put(url, data, options = {}) {
		return this._requestWithCheckCache(
			'put',
			url,
			data,
			Object.assign({}, options, { cache: false })
		);
	}

	/**
	 * @inheritdoc
	 * @method patch
	 */
	patch(url, data, options = {}) {
		return this._requestWithCheckCache(
			'patch',
			url,
			data,
			Object.assign({}, options, { cache: false })
		);
	}

	/**
	 * @inheritdoc
	 * @method delete
	 */
	delete(url, data, options = {}) {
		return this._requestWithCheckCache(
			'delete',
			url,
			data,
			Object.assign({}, options, { cache: false })
		);
	}

	/**
	 * @inheritdoc
	 * @method getCacheKey
	 */
	getCacheKey(method, url, data) {
		return this._cacheOptions.prefix +
				this._getCacheKeySuffix(method, url, data);
	}

	/**
	 * @inheritdoc
	 * @method setDefaultHeader
	 */
	setDefaultHeader(header, value) {
		this._proxy.setDefaultHeader(header, value);

		return this;
	}

	/**
	 * @inheritdoc
	 * @method clearDefaultHeaders
	 */
	clearDefaultHeaders() {
		this._proxy.clearDefaultHeaders();

		return this;
	}

	/**
	 * Check cache and if data isnt available then make real request.
	 *
	 * @private
	 * @method _requestWithCheckCache
	 * @param {string} method The HTTP method to use.
	 * @param {string} url The URL to which the request should be sent.
	 * @param {Object<string, (boolean|number|string|Date)>} data The data to
	 *        send with the request.
	 * * @param {{timeout: number=, ttl: number=, repeatRequest: number=,
	 *        headers: Object<string, string>=, cache: boolean=,
	 *        withCredentials: boolean}=} options
	 *        Optional request options. The {@code timeout} specifies the
	 *        request timeout in milliseconds, the {@code ttl} specified how
	 *        long the request may be cached in milliseconds, the
	 *        {@code repeatRequest} specifies the maximum number of tries to
	 *        repeat the request if the request fails, The {@code headers} set
	 *        request headers. The {@code cache} can be used to bypass the
	 *        cache of pending and finished HTTP requests. The
	 *        {@code withCredentials} that indicates whether requests should be
	 *        made using credentials such as cookies or authorization headers.
	 * @return {Promise<*>} A promise that resolves to the response body parsed
	 *         as JSON.
	 */
	_requestWithCheckCache(method, url, data, options) {
		options = this._prepareOptions(options);

		if (options.cache) {
			var cachedData = this._getCachedData(method, url, data);

			if (cachedData) {
				return cachedData;
			}
		}

		return this._request(method, url, data, options);
	}

	/**
	 * Tests whether an ongoing or completed HTTP request for the specified URL
	 * and data is present in the internal cache and, if it is, the method
	 * returns a promise that resolves to the response body parsed as JSON.
	 *
	 * The method returns {@code null} if no such request is present in the
	 * cache.
	 *
	 * @private
	 * @method _getCachedData
	 * @param {string} method The HTTP method used by the request.
	 * @param {string} url The URL to which the request was made.
	 * @param {Object<string, (boolean|number|string|Date)>} data The data sent
	 *        to the server with the request.
	 * @return {?Promise<*>} A promise that will resolve to the server response
	 *         body parsed as JSON, or {@code null} if no such request is
	 *         present in the cache.
	 */
	_getCachedData(method, url, data) {
		var cacheKey = this.getCacheKey(method, url, data);

		if (this._internalCacheOfPromises.has(cacheKey)) {
			return this._internalCacheOfPromises.get(cacheKey);
		}

		if (this._cache.has(cacheKey)) {
			var cacheData = this._cache.get(cacheKey);

			return Promise.resolve(cacheData);
		}

		return null;
	}

	/**
	 * Sends a new HTTP request using the specified method to the specified
	 * url. The request will carry the provided data as query parameters if the
	 * HTTP method is GET, but the data will be sent as request body for any
	 * other request method.
	 *
	 * @private
	 * @method _request
	 * @param {string} method HTTP method to use.
	 * @param {string} url The URL to which the request is sent.
	 * @param {Object<string, (boolean|number|string|Date)>} data The data sent
	 *        with the request.
	 * @param {{timeout: number=, ttl: number=, repeatRequest: number=,
	 *        headers: Object<string, string>=, cache: boolean=,
	 *        withCredentials: boolean}=} options
	 *        Optional request options. The {@code timeout} specifies the
	 *        request timeout in milliseconds, the {@code ttl} specified how
	 *        long the request may be cached in milliseconds, the
	 *        {@code repeatRequest} specifies the maximum number of tries to
	 *        repeat the request if the request fails, The {@code headers} set
	 *        request headers. The {@code cache} can be used to bypass the
	 *        cache of pending and finished HTTP requests. The
	 *        {@code withCredentials} that indicates whether requests should be
	 *        made using credentials such as cookies or authorization headers.
	 * @return {Promise<*>} A promise that resolves the to response body parsed
	 *         as JSON.
	 */
	_request(method, url, data, options) {
		var cacheKey = this.getCacheKey(method, url, data);

		var cachePromise = (
			this._proxy
				.request(method, url, data, options)
				.then((response) => {
					return this._proxyResolved(response);
				}, (errorParams) => {
					return this._proxyRejected(errorParams);
				})
		);

		this._internalCacheOfPromises.set(cacheKey, cachePromise);

		return cachePromise;
	}

	/**
	 * Handles successful completion of an HTTP request by the HTTP proxy.
	 *
	 * The method also updates the internal cookie storage with the cookies
	 * recieved from the server.
	 *
	 * @private
	 * @method _proxyResolved
	 * @param {Vendor.SuperAgent.Response} response Server response.
	 * @return {{status: number, body: *, params: Object, headers: Object, cached: boolean}}
	 */
	_proxyResolved(response) {
		var agentResponse = {
			status: response.status,
			body: response.body,
			params: response.params,
			headers: response.header,
			cached: false
		};
		var cacheKey = this.getCacheKey(
			agentResponse.params.method,
			agentResponse.params.url,
			agentResponse.params.data
		);

		this._internalCacheOfPromises.delete(cacheKey);

		if (agentResponse.params.options.cache) {
			this._saveAgentResponseToCache(agentResponse);
		}

		if (this._proxy.haveToSetCookiesManually()) {
			this._setCookiesFromResponse(agentResponse);
		}

		return agentResponse;
	}

	/**
	 * Handles rejection of the HTTP request by the HTTP proxy. The method
	 * tests whether there are any remaining tries for the request, and if
	 * there are any, it attempts re-send the request.
	 *
	 * The method rejects the internal request promise if there are no tries
	 * left.
	 *
	 * @private
	 * @method _proxyRejected
	 * @param {Object<string, *>} errorParams Error parameters, containing the
	 *        request url, data, method, options and other usefull data.
	 */
	_proxyRejected(errorParams) {
		var method = errorParams.method;
		var url = errorParams.url;
		var data = errorParams.data;

		if (errorParams.options.repeatRequest > 0) {
			errorParams.options.repeatRequest--;

			return this._request(method, url, data, errorParams.options);
		} else {
			var cacheKey = this.getCacheKey(method, url, data);
			this._internalCacheOfPromises.delete(cacheKey);

			var errorName = errorParams.errorName;
			var errorMessage = `${errorName}: ima.http.Agent:_proxyRejected`;
			var error = new IMAError(errorMessage, errorParams);
			return Promise.reject(error);
		}
	}

	/**
	 * Prepares the provided request options object by filling in missing
	 * options with default values and addding extra options used internally.
	 *
	 * @private
	 * @method _prepareOptions
	 * @param {{timeout: number=, ttl: number=, repeatRequest: number=,
	 *        headers: Object<string, string>=, cache: boolean=,
	 *        withCredentials: boolean}=} options
	 *        Optional request options. The {@code timeout} specifies the
	 *        request timeout in milliseconds, the {@code ttl} specified how
	 *        long the request may be cached in milliseconds, the
	 *        {@code repeatRequest} specifies the maximum number of tries to
	 *        repeat the request if the request fails, The {@code headers} set
	 *        request headers. The {@code cache} can be used to bypass the
	 *        cache of pending and finished HTTP requests. The
	 *        {@code withCredentials} that indicates whether requests should be
	 *        made using credentials such as cookies or authorization headers.
	 * @return {Object<string, (number|string)>} Request options with set
	 *         filled-in default values for missing fields, and extra options
	 *         used internally.
	 */
	_prepareOptions(options) {
		var extraOptions = {
			cookie: this._cookie.getCookiesStringForCookieHeader(),
			headers: {}
		};

		var composedOptions = Object.assign(
			{},
			this._defaultRequestOptions,
			extraOptions,
			options
		);

		composedOptions.headers = Object.assign(
			{},
			this._defaultRequestOptions.headers,
			options.headers || {}
		);

		return composedOptions;
	}

	/**
	 * Generates cache key suffix for an HTTP request to the specified URL with
	 * the specified data.
	 *
	 * @private
	 * @method _getCacheKeySuffix
	 * @param {string} method The HTTP method used by the request.
	 * @param {string} url The URL to which the request is sent.
	 * @param {Object<string, (boolean|number|string|Date)>} data The data sent
	 *        with the request.
	 * @return {string} The suffix of a cache key to use for a request to the
	 *         specified URL, carrying the specified data.
	 */
	_getCacheKeySuffix(method, url, data) {
		return `${method}:${url}?${JSON.stringify(data)}`;
	}

	/**
	 * Set all cookies from response headers set-cookie.
	 *
	 * @private
	 * @method setCookiesFromResponse
	 * @param {{status: number, body: *, params: Object, headers: Object, cached: boolean}} agentResponse
	 */
	_setCookiesFromResponse(agentResponse) {
		if (agentResponse.headers) {
			var receivedCookies = agentResponse.headers['set-cookie'];

			if (receivedCookies) {
				receivedCookies.forEach((cookieHeader) => {
					this._cookie.parseFromSetCookieHeader(cookieHeader);
				});
			}
		}
	}

	/**
	 * Save agent response to cache for next request.
	 *
	 * @private
	 * @method _saveAgentResponseToCache
	 * @param {{status: number, body: *, params: Object, headers: Object, cached: boolean}} agentResponse
	 */
	_saveAgentResponseToCache(agentResponse) {
		var cacheKey = this.getCacheKey(
			agentResponse.params.method,
			agentResponse.params.url,
			agentResponse.params.data
		);

		agentResponse.cached = true;
		var ttl = agentResponse.params.options.ttl;
		this._cache.set(cacheKey, agentResponse, ttl);
		agentResponse.cached = false;
	}
}

ns.ima.http.HttpAgentImpl = HttpAgentImpl;
