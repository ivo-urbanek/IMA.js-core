import ns from 'imajs/client/core/namespace';
import IMAError from 'imajs/client/core/imaError';

ns.namespace('Core.Dictionary');
/**
 * Implementation of the Intl localization messages for its dictionary.
 *
 * @class IntlFormat
 * @implements Core.Interface.Dictionary
 * @namespace Core.Dictionary
 * @module Core
 * @submodule Core.Dictionary
 */
export default class IntlFormat {

	/**
	 * Initializes the dictionary.
	 *
	 * @constructor
	 * @method constructor
	 * @example
	 * 		dictionary.formatNumber(1000, {style: 'currency', currency: 'USD'}, 'en-US');
	 */
	constructor() {

		/**
		 * Application language.
		 *
		 * @private
		 * @property _language
		 * @type {string}
		 */
		this._language = null;
	}

	/**
	 * Initializes this dictionary with the provided language.
	 *
	 * @method init
	 * @param {{language: string}} config
	 *        The dictionary configuration.
	 *        The language field is an ISO 639 language code specifying the
	 *        language of the provided phrases.
	 */
	init(config) {
		this._language = config.language;
	}

	/**
	* Returns the ISO 639 language code of the language this dictionary was
	* initialized with.
	*
	* @method getLanguage
	* @return {string} The language code representing the language of the
	*         localization phrases in this dictionary.
	*/
	getLanguage() {
		return this._language;
	}

	/**
	 * Formates number using Intl.FormatNumber.
	 *
	 * @method formatNumber
	 * @param {number|string} number Number to format.
	 * @param {Object<string, string>=} options Similar with Intl.NumberFormat options.
	 *		See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
	 * @return {string} The formated number.
	 */
	formatNumber(number, options, optLocale) {
		var locale = optLocale;
		if (!locale) {
			locale = this.getLanguage();
		}

		return new Intl.NumberFormat(locale, options).format(number);
	}

	/**
	 * Formates number using Intl.FormatDateTime.
	 *
	 * @method formatDateTime
	 * @param {date} dateTime Date to format.
	 * @param {Object<string, string>=} options Similar with Intl.NumberFormat options.
	 *		See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
	 * @return {string} The formated number.
	 */
	formatDateTime(dateTime, options, optLocale) {
		var locale = optLocale;
		if (!locale) {
			locale = this.getLanguage();
		}

		return new Intl.FormatDateTime(locale, options).format(dateTime);
	}
}

ns.Core.Dictionary.IntlFormat = IntlFormat;
