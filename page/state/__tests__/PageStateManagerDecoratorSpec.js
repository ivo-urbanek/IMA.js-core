describe('ima.page.state.PageStateManagerDecorator', function() {
	var pageStateManager = oc.create('ima.page.state.PageStateManagerImpl');
	var allowedStateKeys = ['allow'];
	var decoratedPageStateManager = null;
	var state = {
		allow: 1,
		deny: 0
	};

	beforeEach(function() {
		decoratedPageStateManager =
			oc.create('ima.page.state.PageStateManagerDecorator',
				[
					pageStateManager,
					allowedStateKeys
				]
			);
	});

	it('should call method clear', function() {
		spyOn(pageStateManager, 'clear')
			.and
			.stub();

		decoratedPageStateManager.clear();

		expect(pageStateManager.clear).toHaveBeenCalled();
	});

	it('should return current page state', function() {
		spyOn(pageStateManager, 'getState')
			.and
			.returnValue(state);

		decoratedPageStateManager.getState();

		expect(decoratedPageStateManager.getState()).toEqual(state);
	});

	it('should return all history of states', function() {
		spyOn(pageStateManager, 'getAllStates')
			.and
			.returnValue([state]);

		expect(decoratedPageStateManager.getAllStates()).toEqual([state]);
	});

	describe('setState method', function() {

		it('should throw IMAError for at least one deny key', function() {
			expect(function() {
				decoratedPageStateManager.setState({ deny: 1 });
			}).toThrow();
		});

		it('should setState for all allowed keys', function() {
			var patchState = {
				allow: 0
			};

			spyOn(pageStateManager, 'setState')
				.and
				.stub();

			decoratedPageStateManager.setState(patchState);

			expect(pageStateManager.setState).toHaveBeenCalledWith(patchState);
		});

	});

});
