import ns from 'ima/namespace';
import IMAError from 'ima/imaError';
import EventBus from 'ima/interface/eventBus';

ns.namespace('Ima.Event');

/**
 * Global name of IMA.js custom event.
 *
 * @property IMA_EVENT
 * @const
 * @type {string}
 */
const IMA_EVENT = '$IMA.CustomEvent';

/**
 * Helper for custom events.
 *
 * It offers public methods for firing custom events
 * and two methods for catching events (e.g. inside view components).
 *
 * @class Bus
 * @implements Ima.Interface.EventBus
 * @namespace Ima.Event
 * @module Ima
 * @submodule Ima.Event
 */
export default class Bus extends EventBus {
	/**
	 * Initializes the custom event helper.
	 *
	 * @constructor
	 * @method constructor
	 */
	constructor(window) {
		super();

		/**
		 * @private
		 * @property _window
		 * @type {Ima.Interface.Window}
		 * @default window
		 */
		this._window = window;

		/**
		 * Map of listeners provided to the public API of this event bus to a
		 * map of event targets to a map of event names to actual listeners
		 * bound to the native API.
		 *
		 * The "listen all" event listeners are not registered in this map.
		 *
		 * @private
		 * @property _listeners
		 * @type {WeakMap<function(Event), WeakMap<EventTarget, Map<string, function(Event)>>>}
		 */
		this._listeners = new WeakMap();

		/**
		 * Map of event targets to listeners executed on all IMA.js event bus
		 * events.
		 *
		 * @private
		 * @property _allEventListeners
		 * @type {WeakMap<EventTarget, WeakSet<function(Event)>>}
		 */
		this._allEventListeners = new WeakMap();
	}

	/**
	 * @inheritdoc
	 * @method fire
	 */
	fire(eventSource, eventName, data, options = {}) {
		var eventInit = {};
		var params = { detail: { eventName, data } };
		var defaultOptions = { bubbles: true, cancelable: true };
		Object.assign(eventInit, defaultOptions, options, params);

		var e = this._window.createCustomEvent(IMA_EVENT, eventInit);

		if (eventSource && typeof eventSource.dispatchEvent !== 'undefined') {
			eventSource.dispatchEvent(e);
		} else {
			throw new IMAError(`Ima.Event.Bus.fire: The EventSource ` +
					`${eventSource} is not defined or can not dispatch ` +
					`event '${eventName}' (data: ${data}).`,
					{ eventSource, eventName, data, eventInit });
		}

		return this;
	}

	/**
	 * @inheritdoc
	 * @method listenAll
	 */
	listenAll(eventTarget, listener) {
		this._window.bindEventListener(eventTarget, IMA_EVENT, listener);

		if (!this._allEventListeners.has(eventTarget)) {
			this._allEventListeners.set(eventTarget, new WeakSet());
		}
		this._allEventListeners.get(eventTarget).add(listener);

		return this;
	}

	/**
	 * @inheritdoc
	 * @method listen
	 */
	listen(eventTarget, eventName, listener) {
		if (!this._listeners.has(listener)) {
			this._listeners.set(listener, new WeakMap());
		}

		var targetToEventName = this._listeners.get(listener);
		if (!targetToEventName.has(eventTarget)) {
			targetToEventName.set(eventTarget, new Map());
		}

		var eventNameToNativeListener = targetToEventName.get(eventTarget);
		var nativeListener = (e) => {
			if (e.detail.eventName === eventName) {
				listener(e);
			}
		};
		eventNameToNativeListener.set(eventName, nativeListener);

		this._window.bindEventListener(eventTarget, IMA_EVENT, nativeListener);

		return this;
	}

	/**
	 * @inheritdoc
	 * @method unlistenAll
	 */
	unlistenAll(eventTarget, listener) {
		this._window.unbindEventListener(eventTarget, IMA_EVENT, listener);

		var listenerRegistered =
				this._allEventListeners.has(eventTarget) &&
				this._allEventListeners.get(eventTarget).has(listener);
		if (listenerRegistered) {
			this._allEventListeners.get(eventTarget).delete(listener);
		}

		if ($Debug) {
			if (!listenerRegistered) {
				console.warn('The provided listener is not registered on ' +
						'the specified event target');
			}
		}

		return this;
	}

	/**
	 * @inheritdoc
	 * @method unlisten
	 */
	unlisten(eventTarget, eventName, listener) {
		if (!this._listeners.has(listener)) {
			if ($Debug) {
				console.warn('The provided listener is not bound to listen ' +
						'for the specified event on the specified event ' +
						'target');
			}

			return this;
		}

		var targets = this._listeners.get(listener);
		if (!targets.has(eventTarget)) {
			if ($Debug) {
				console.warn('The provided listener is not bound to listen ' +
						'for the specified event on the specified event ' +
						'target');
			}

			return this;
		}

		var eventNameToNativeListener = targets.get(eventTarget);
		if (!eventNameToNativeListener.has(eventName)) {
			if ($Debug) {
				console.warn('The provided listener is not bound to listen ' +
						'for the specified event on the specified event ' +
						'target');
			}

			return this;
		}

		var nativeListener = eventNameToNativeListener.get(eventName);
		this._window.unbindEventListener(
			eventTarget,
			IMA_EVENT,
			nativeListener
		);

		eventNameToNativeListener.delete(eventName);
		if (eventNameToNativeListener.size) {
			return this;
		}

		targets.delete(eventTarget);

		return this;
	}
}

ns.Ima.Event.Bus = Bus;
