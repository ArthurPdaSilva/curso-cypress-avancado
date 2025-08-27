Cypress.Commands.add(
	"interceptSearch",
	(query = "React", page = "0", fixture, customAlias = "search") => {
		cy.intercept(
			{
				method: "GET",
				pathname: "**/search",
				query: {
					query,
					page,
				},
			},
			fixture && { fixture },
		).as(customAlias);
	},
);

Cypress.Commands.add("checkLocalStorage", (key, expectedValue) => {
	cy.window().then((win) => {
		expect(win.localStorage.getItem(key)).to.eq(expectedValue);
	});
});

Cypress.Commands.add("interceptServerError", (errorType) => {
	cy.intercept(
		{
			method: "GET",
			pathname: "**/search",
			query: {
				query: "React",
				page: "0",
			},
		},
		{
			forceNetworkError: errorType === "network",
			statusCode: errorType === "server" ? 500 : undefined,
		},
	).as("search");
});

Cypress.Commands.add("visitHomePageAndCheckError", () => {
	cy.visit("/");
	cy.wait("@search", { timeout: 2000 });
	cy.get("p:contains('Something went wrong ...')").should("be.visible");
});
