export var init = (ns, oc, config) => { //jshint ignore:line

	//**************START VENDORS**************

	oc.constant('$Helper', ns.Vendor.$Helper);
	oc.constant('$Promise', Promise);

	//React
	oc.constant('$React', ns.Vendor.React);
	oc.constant('$ReactDOM', ns.Vendor.ReactDOM);
	oc.constant('$ReactDOMServer', ns.Vendor.ReactDOMServer);

	//SuperAgent
	oc.constant('$SuperAgent', ns.Vendor.SuperAgent);

	//*************END VENDORS*****************



	//*************START CONSTANTS*****************
	oc.constant('$Settings', config);
	oc.constant('$Env', config.$Env);
	oc.constant('$Protocol', config.$Protocol);
	oc.constant('$Secure', config.$Protocol === 'https:' ? true : false);

	oc.constant('$ROUTER_CONSTANTS', { ROUTE_NAMES: ns.Core.Router.ROUTE_NAMES, EVENTS: ns.Core.Router.EVENTS });
	oc.constant('$HTTP_STATUS_CODE', ns.Core.Http.STATUS_CODE);

	//*************END CONSTANTS*****************



	//*************START CORE**************

	//Window helper
	if (typeof window !== 'undefined' && window !== null) {
		oc.provide(ns.Core.Interface.Window, ns.Core.Window.Client);
	} else {
		oc.provide(ns.Core.Interface.Window, ns.Core.Window.Server);
	}
	oc.bind('$Window', ns.Core.Interface.Window);

	//Core Error
	oc.bind('$Error', ns.Core.IMAError);

	//Dictionary
	oc.provide(ns.Core.Interface.Dictionary, ns.Core.Dictionary.MessageFormat);
	oc.bind('$Dictionary', ns.Core.Interface.Dictionary);
	oc.bind('$Intl', ns.Core.Dictionary.IntlFormat);

	//Request & Response
	oc.bind('$Request', ns.Core.Router.Request);
	oc.bind('$Response', ns.Core.Router.Response);

	//Storage
	oc.constant('$CookieTransformFunction', { encode: (s) => s, decode: (s) => s });
	oc.bind('$CookieStorage', ns.Core.Storage.Cookie, ['$Window', '$Request', '$Response']);
	if (oc.get('$Window').hasSessionStorage()) {
		oc.bind('$SessionStorage', ns.Core.Storage.Session);
	} else {
		oc.bind('$SessionStorage', ns.Core.Storage.Map);
	}
	oc.bind('$MapStorage', ns.Core.Storage.Map);
	oc.bind('$WeakMapStorage', ns.Core.Storage.WeakMap, [{
		entryTtl: 30 * 60 * 1000,
		maxEntries: 1000,
		gcInterval: 60 * 1000,
		gcEntryCountTreshold: 16
	}]);
	oc.bind('$SessionMapStorage', ns.Core.Storage.SessionMap, ['$MapStorage', '$SessionStorage']);

	// Dispatcher
	oc.provide(ns.Core.Interface.Dispatcher, ns.Core.Event.Dispatcher);
	oc.bind('$Dispatcher', ns.Core.Interface.Dispatcher);

	// Custom Event Bus
	oc.provide(ns.Core.Interface.EventBus, ns.Core.Event.Bus, ['$Window']);
	oc.bind('$EventBus', ns.Core.Interface.EventBus);

	//Cache
	oc.constant('$CacheEntry', ns.Core.Cache.Entry);
	if (oc.get('$Window').hasSessionStorage()) {
		oc.constant('$CacheStorage', oc.get('$SessionMapStorage'));
	} else {
		oc.constant('$CacheStorage', oc.get('$MapStorage'));
	}
	oc.bind('$CacheFactory', ns.Core.Cache.Factory, ['$CacheEntry']);
	oc.provide(ns.Core.Interface.Cache, ns.Core.Cache.Handler, ['$CacheStorage', '$CacheFactory', '$Helper', config.$Cache]);
	oc.bind('$Cache', ns.Core.Interface.Cache);

	//SEO
	oc.bind('$MetaManager', ns.Core.Meta.Manager);
	oc.bind('$DecoratorController', ns.Core.Decorator.Controller);
	oc.bind('$DecoratorPageStateManager', ns.Core.Decorator.PageStateManager);

	//Page
	oc.bind('$PageStateManager', ns.Core.Page.StateManager);
	oc.bind('$PageFactory', ns.Core.Page.Factory, [oc]);
	oc.constant('$PageRenderViewAdapter', ns.Core.Page.Render.ViewAdapter);
	oc.bind('$PageRenderFactory', ns.Core.Page.Render.Factory, [oc, '$React', '$PageRenderViewAdapter']);
	if (oc.get('$Window').isClient()) {
		oc.provide(ns.Core.Interface.PageRender, ns.Core.Page.Render.Client, ['$PageRenderFactory', '$Helper', '$ReactDOM', '$Settings', '$Window']);
	} else {
		oc.provide(ns.Core.Interface.PageRender, ns.Core.Page.Render.Server, ['$PageRenderFactory', '$Helper', '$ReactDOMServer', '$Settings', '$Response', '$Cache']);
	}
	oc.bind('$PageRender', ns.Core.Interface.PageRender);
	//oc.provide(ns.Core.Interface.PageManager, ns.Core.Page.Manager, ['$PageFactory', '$PageRender', '$PageStateManager', '$Window', '$EventBus']);
	if (oc.get('$Window').isClient()) {
		oc.provide(ns.Core.Interface.PageManager, ns.Core.Page.Manager.Client, ['$PageFactory', '$PageRender', '$PageStateManager', '$Window', '$EventBus']);
	} else {
		oc.provide(ns.Core.Interface.PageManager, ns.Core.Page.Manager.Server, ['$PageFactory', '$PageRender', '$PageStateManager']);
	}
	oc.bind('$PageManager', ns.Core.Interface.PageManager);

	//Router
	oc.constant('$Route', ns.Core.Router.Route);
	oc.bind('$RouterFactory', ns.Core.Router.Factory, ['$Route']);
	if (oc.get('$Window').isClient()) {
		oc.provide(ns.Core.Interface.Router, ns.Core.Router.Client, ['$PageManager', '$RouterFactory', '$Dispatcher', '$ROUTER_CONSTANTS', '$Window']);
	} else {
		oc.provide(ns.Core.Interface.Router, ns.Core.Router.Server, ['$PageManager', '$RouterFactory', '$Dispatcher', '$ROUTER_CONSTANTS', '$Request', '$Response']);
	}
	oc.bind('$Router', ns.Core.Interface.Router);

	//SuperAgent
	oc.bind('$HttpTransformer', ns.Core.Http.Transformer);
	oc.bind('$HttpProxy', ns.Core.Http.Proxy, ['$SuperAgent', '$HTTP_STATUS_CODE', '$HttpTransformer', '$Window']);
	oc.provide(ns.Core.Interface.HttpAgent, ns.Core.Http.Agent, ['$HttpProxy', '$Cache', '$CookieStorage', config.$Http]);
	oc.bind('$Http', ns.Core.Interface.HttpAgent);

	//Dev tools
	oc.bind('$DevTool', ns.Core.Debug.DevTool, ['$PageManager', '$PageStateManager', '$Window', '$Dispatcher']);

	//*************END CORE****************

};
