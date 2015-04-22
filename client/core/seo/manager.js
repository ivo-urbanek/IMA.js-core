import ns from 'imajs/client/core/namespace.js';

ns.namespace('Core.Seo');

/**
 * Default implementation of the {@codelink Core.Interface.Seo} interface.
 *
 * @class Manager
 * @implements Core.Interface.Seo
 * @namespace Core.Seo
 * @module Core
 * @submodule Core.Seo
 */
class Manager extends ns.Core.Interface.Seo {
	/**
	 * Initializes the SEO page attributes manager.
	 *
	 * @method constructor
	 * @constructor
	 */
	constructor() {
		super();

		/**
		 * The page title.
		 *
		 * @property _title
		 * @private
		 * @type {string}
		 * @default ''
		 */
		this._title = '';

		/**
		 * Storage of generic meta information.
		 *
		 * @property _metaName
		 * @type {Map<string, string>}
		 */
		this._metaName = new Map();

		/**
		 * Storage of specialized meta information.
		 *
		 * @property _metaProperty
		 * @type {Map<string, string>}
		 */
		this._metaProperty = new Map();
	}

	/**
	 * Sets the page title.
	 *
	 * @inheritdoc
	 * @override
	 * @method setTitle
	 * @param {string} title The new page title.
	 */
	setTitle(title) {
		this._title = title;
	}

	/**
	 * Returns the page title. The method returns an empty string if no page
	 * title has been set yet.
	 *
	 * @inheritdoc
	 * @override
	 * @method getTitle
	 * @return {string} The paget title currently stored in this seo manager.
	 */
	getTitle() {
		return this._title;
	}

	/**
	 * Set the specified generic meta information.
	 *
	 * @inheritdoc
	 * @override
	 * @method setMetaName
	 * @param {string} name Meta information name, for example {@code keywords}.
	 * @param {string} value The meta information value.
	 */
	setMetaName(name, value) {
		this._metaName.set(name, value);
	}

	/**
	 * Returns the value of the specified generic meta information. The method
	 * returns an empty string for missing meta information (to make the returned
	 * value React-friendly).
	 *
	 * @inheritdoc
	 * @override
	 * @method getMetaName
	 * @param {string} name The name of the generic meta information.
	 * @return {string} The value of the generic meta information, or an empty
	 *         string.
	 */
	getMetaName(name) {
		return this._metaName.get(name) || '';
	}

	/**
	 * Returns the names of the currently known generic meta information.
	 *
	 * @inheritdoc
	 * @override
	 * @method getMetaNames
	 * @return {string[]} The names of the currently known generic meta
	 *         information.
	 */
	getMetaNames() {
		return Array.from(this._metaName.keys());
	}

	/**
	 * Sets the specified specialized meta information.
	 *
	 * @inheritdoc
	 * @override
	 * @method setMetaProperty
	 * @param {string} name Name of the specialized meta information.
	 * @param {string} value The value of the meta information.
	 */
	setMetaProperty(name, value) {
		this._metaProperty.set(name, value);
	}

	/**
	 * Returns the value of the specified specialized meta information. The
	 * method returns an empty string for missing meta information (to make the
	 * returned value React-friendly).
	 *
	 * @inheritdoc
	 * @override
	 * @method getMetaProperty
	 * @param {string} name The name of the specialized meta information.
	 * @return {string} The value of the specified meta information, or an empty
	 *         string.
	 */
	getMetaProperty(name) {
		return this._metaProperty.get(name) || '';
	}

	/**
	 * Returns the names of the currently known specialized meta information.
	 *
	 * @inheritdoc
	 * @override
	 * @method getMetaProperties
	 * @return {string[]} The names of the currently known specialized meta
	 *         information.
	 */
	getMetaProperties() {
		return Array.from(this._metaProperty.keys());
	}
}

ns.Core.Seo.Manager = Manager;
