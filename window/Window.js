import ns from 'ima/namespace';

ns.namespace('ima.window');

/**
 * The {@codelink Window} interface defines various utility API for easier
 * cross-environment usage of various low-level client-side JavaScript APIs
 * available through various global objects.
 *
 * @interface Window
 * @namespace ima.window
 * @module ima
 * @submodule ima.window
 */
export default class Window {

	/**
	 * Returns {@code true} if invoked at the client side.
	 *
	 * @method isClient
	 * @return {boolean} {@code true} if invoked at the client side.
	 */
	isClient() {}

	/**
	 * Returns {@code true} if the cookies are set and processed with every
	 * HTTP request and response automatically by the environment.
	 *
	 * @method isCookieEnabled
	 * @return {boolean} {@code true} if cookies are handled automatically by
	 *         the environment.
	 */
	isCookieEnabled() {}

	/**
	 * Returns {@code true} if the session storage is supported.
	 *
	 * @method hasSessionStorage
	 * @return {boolean} {@code true} if the session storage is supported.
	 */
	hasSessionStorage() {}

	/**
	 * Returns {@code true} if the WebSockets are supported.
	 *
	 * @method hasWebSocket
	 * @return {boolean} {@code true} if the WebSockets are supported.
	 */
	hasWebSocket() {}

	/**
	 * Returns {@code true} if the history manipulation API is supported.
	 *
	 * @method hasHistoryAPI
	 * @return {boolean} {@code true} if the history manipulation API is
	 *         supported.
	 */
	hasHistoryAPI() {}

	/**
	 * Sets the new page title of the document.
	 *
	 * @method setTitle
	 * @param {string} title The new page title.
	 */
	setTitle(title) {}

	/**
	 * Returns the current {@code WebSocket} implementation to use.
	 *
	 * @method getWebSocket
	 * @return {function(new: WebSocket)} The current {@code WebSocket}
	 *         implementation.
	 */
	getWebSocket() {}

	/**
	 * Returns the native {@code window} object representing the global context
	 * at the client-side. The method returns {@code undefined} if used at the
	 * server-side.
	 *
	 * @method getWindow
	 * @return {(undefined|Window)} The {@code window} object at the
	 *         client-side, or {@code undefined} at the server-side.
	 */
	getWindow() {}

	/**
	 * Returns the number of pixels the viewport is scrolled horizontally.
	 *
	 * @method getScrollX
	 * @return {number} The number of pixels the viewport is scrolled
	 *         horizontally.
	 */
	getScrollX() {}

	/**
	 * Returns the number of pixels the document is scrolled vertically.
	 *
	 * @method getScrollY
	 * @return {number} The number of pixels the document is scrolled
	 *         vertically.
	 */
	getScrollY() {}

	/**
	 * Scrolls the viewport to the specified location (if possible).
	 *
	 * @method scrollTo
	 * @param {number} x Horizontal scroll offset in pixels.
	 * @param {number} y Vertical scroll offset in pixels.
	 */
	scrollTo(x, y) {}

	/**
	 * Returns the domain of the current document's URL as
	 * {@code `${protocol}://${host}`}.
	 *
	 * @method getDomain
	 * @return {string} The current domain.
	 */
	getDomain() {}

	/**
	 * Returns the application's host.
	 *
	 * @method getHost
	 * @return {string} The current host.
	 */
	getHost() {}

	/**
	 * Returns the path part of the current URL, including the query string.
	 *
	 * @method getPath
	 * @return {string} The path and query string parts of the current URL.
	 */
	getPath() {}

	/**
	 * Returns the current document's URL.
	 *
	 * @method getUrl
	 * @return {string} The current document's URL.
	 */
	getUrl() {}

	/**
	 * Returns the document's body element. The method returns
	 * {@code undefined} if invoked at the server-side.
	 *
	 * @method getBody
	 * @return {(undefined|HTMLBodyElement)} The document's body element, or
	 *         {@code undefined} if invoked at the server side.
	 */
	getBody() {}

	/**
	 * Returns the HTML element with the specified {@code id} attribute value.
	 *
	 * @method getElementById
	 * @param {string} id The value of the {@code id} attribute to look for.
	 * @return {?HTMLElement} The element with the specified id, or
	 *         {@code null} if no such element exists.
	 */
	getElementById(id) {}

	/**
	 * Returns the first element matching the specified CSS 3 selector.
	 *
	 * @method querySelector
	 * @param {string} selector The CSS selector.
	 * @return {?HTMLElement} The first element matching the CSS selector or
	 *         {@code null} if no such element exists.
	 */
	querySelector(selector) {}

	/**
	 * Returns a node list of all elements matching the specified CSS 3
	 * selector.
	 *
	 * @method querySelectorAll
	 * @param {string} selector The CSS selector.
	 * @return {NodeList} A node list containing all elements matching the
	 *         specified CSS selector.
	 */
	querySelectorAll(selector) {}

	/**
	 * Performs a hard redirect (discarding the current JavaScript state) to
	 * the specified URL.
	 *
	 * @method redirect
	 * @param {string} url The URL to which the browser will be redirected.
	 */
	redirect(url) {}

	/**
	 * Pushes a new state to the browser history. The method has no effect if
	 * the current browser does not support the history API (IE9).
	 *
	 * @method pushState
	 * @param {Object<string, *>} state A state object associated with the
	 *        history item, preferably representing the page state.
	 * @param {string} title The page title related to the state. Note that
	 *        this parameter is ignored by some browsers.
	 * @param {string} url The new URL at which the state is available.
	 */
	pushState(state, title, url) {}

	/**
	 * Replaces the current history entry. The method has no effect if the
	 * current browser does not support the history API (IE9).
	 *
	 * @method replaceState
	 * @param {Object<string, *>} state A state object associated with the
	 *        history item, preferably representing the page state.
	 * @param {string} title The page title related to the state. Note that
	 *        this parameter is ignored by some browsers.
	 * @param {string} url The new URL at which the state is available.
	 */
	replaceState(state, title, url) {}

	/**
	 * Create new instance of CustomEvent of the specified name and using the
	 * provided options.
	 *
	 * @method createCustomEvent
	 * @param {string} name Custom event's name (sometimes referred to as the
	 *        event's type).
	 * @param {Object<string, *>} options The custom event's options.
	 * @return {CustomEvent} The created custom event.
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
	 */
	createCustomEvent(name, options) {}

	/**
	 * Registers the provided event listener to be executed when the specified
	 * event occurs on the specified event target.
	 *
	 * Registering the same event listener for the same event on the same event
	 * target with the same {@code useCapture} flag value repeatedly has no
	 * effect.
	 *
	 * @method bindEventListener
	 * @param {EventTarget} eventTarget The event target.
	 * @param {string} event The name of the event.
	 * @param {function(Event)} listener The event listener.
	 * @param {boolean=} [useCapture=false] If true, the method initiates event
	 *        capture. After initiating capture, all events of the specified
	 *        type will be dispatched to the registered listener before being
	 *        dispatched to any EventTarget beneath it in the DOM tree. Events
	 *        which are bubbling upward through the tree will not trigger a
	 *        listener designated to use capture.
	 */
	bindEventListener(eventTarget, event, listener, useCapture = false) {}

	/**
	 * Deregisters the provided event listener, so it will no longer we
	 * executed when the specified event occurs on the specified event target.
	 *
	 * The method has no effect if the provided event listener is not
	 * registered to be executed at the specified event.
	 *
	 * @method unbindEventListener
	 * @param {EventTarget} eventTarget The event target.
	 * @param {string} event The name of the event.
	 * @param {function(Event)} listener The event listener.
	 * @param {boolean=} [useCapture=false] The {@code useCapture} flag value
	 *        that was used when the listener was registered.
	 */
	unbindEventListener(eventTarget, event, listener, useCapture = false) {}
}

ns.ima.window.Window = Window;
