(function() {
	var root;
	if ((typeof window !== 'undefined') && (window !== null)) {
		root = window;
	} else {
		root = global;
	}

	root.$IMA = root.$IMA || {};
	var modules = {};

	root.$IMA.Loader = {
		modules: modules,
		initializedModules: null,
		register: function(moduleName, dependencies, moduleFactory) {
			this.modules[moduleName] = {
				dependencies: dependencies,
				factory: moduleFactory,
				instance: null
			};
		},
		import: function(moduleName) {
			if (!this.modules[moduleName]) {
				throw new Error('$IMA.Loader.import: Module name ' +
						moduleName + ' is not registered. Update your ' +
						'build.js.');
			}

			return Promise.resolve(resolveModule(moduleName));
		},
		initAllModules: function() {

			Object.keys(modules).forEach(function(moduleName) {
				resolveModule(moduleName);
			});

			return Promise.resolve();
		}
	};

	function resolveModule(moduleName, dependencyOf) {
		if (!modules[moduleName]) {
			throw new Error('$IMA.Loader.import: Module name ' +
				moduleName + (
					dependencyOf ?
						(' (dependency of ' + dependencyOf + ')') :
						''
				) + ' is not registered. Update your build.js.');
		}

		var module = modules[moduleName];
		if (module.instance) {
			return module.instance;
		}

		var moduleInstance = {};
		var moduleInitializer = module.factory(function _export(key, value) {
			moduleInstance[key] = value;
		});
		module.instance = moduleInstance; // allow lazy circular dependencies

		var dependencies = module.dependencies.map(function(dependencyName) {
			var resolvedName = resolveModuleName(moduleName, dependencyName);
			return resolveModule(resolvedName, moduleName);
		});
		dependencies.forEach(function(dependency, index) {
			moduleInitializer.setters[index](dependency);
		});

		moduleInitializer.execute();

		return moduleInstance;
	}

	function resolveModuleName(currentModule, referencedModule) {
		var modulePath;
		if (referencedModule.substring(0, 2) === './') {
			if (currentModule.indexOf('/') > -1) {
				modulePath = currentModule.substring(
					0,
					currentModule.lastIndexOf('/')
				) + '/' + referencedModule.substring(2);
			} else { // the current module is in the application's root
				modulePath = referencedModule.substring(2);
			}
		} else if (referencedModule.substring(0, 3) === '../') {
			if (currentModule.indexOf('/') === -1) {
				throw new Error('The ' + currentModule + ' module imports ' +
						'from the module ' + referencedModule + ' which may ' +
						'reside outside of the application directory');
			}

			modulePath = currentModule.substring(
				0,
				currentModule.lastIndexOf('/')
			);
			modulePath = modulePath.substring(
				0,
				modulePath.lastIndexOf('/')
			) + '/' + referencedModule.substring(3);
		} else {
			return referencedModule;
		}

		modulePath = modulePath.replace(/\/\/+/g, '/');
		while (modulePath.indexOf('/./') > -1) {
			modulePath = modulePath.replace(/\/[.][\/]/g, '/');
		}
		while (modulePath.indexOf('../') > -1) {
			if (modulePath.substring(0, 3) === '../') {
				throw new Error('The ' + currentModule + ' module imports ' +
						'from the module ' + referencedModule + ' which may ' +
						'reside outside of the application directory');
			}
			modulePath = modulePath.replace(/\/[^.][^/]*\/[.][.]\//g, '/');
			modulePath = modulePath.replace(/^[^.][^/]*\/[.][.]\//g, '');
		}
		modulePath = modulePath.replace(/^[.][\/]/g, '');

		return modulePath;
	}
})();
