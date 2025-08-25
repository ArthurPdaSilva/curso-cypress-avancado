describe("Hacker Stories", () => {
	const initialTerm = "React";
	const newTerm = "Cypress";

	const interceptSearch = (query = "React", page = "0") => {
		cy.intercept({
			method: "GET",
			pathname: "**/search",
			query: {
				query,
				page,
			},
		}).as("search");
	};

	context("Hitting the real API", () => {
		beforeEach(() => {
			interceptSearch();
			cy.visit("/");
			cy.wait("@search", { timeout: 2000 });
		});

		it('shows 20 stories, then the next 20 after clicking "More"', () => {
			interceptSearch("React", "1");
			cy.get(".item").should("have.length", 20);

			cy.contains("More").click();

			cy.wait("@search", { timeout: 2000 });

			cy.get(".item").should("have.length", 40);
		});

		it("searches via the last searched term", () => {
			interceptSearch("Cypress", "0");
			cy.get("#search").clear().type(`${newTerm}{enter}`);

			cy.wait("@search", { timeout: 2000 });

			cy.get(`button:contains(${initialTerm})`).should("be.visible").click();

			cy.wait("@search", { timeout: 2000 });

			cy.get(".item").should("have.length", 20);
			cy.get(".item").first().should("contain", initialTerm);
			cy.get(`button:contains(${newTerm})`).should("be.visible");
		});
	});

	beforeEach(() => {
		interceptSearch();
		cy.visit("/");
		cy.wait("@search", { timeout: 2000 });
	});

	it("shows the footer", () => {
		cy.get("footer")
			.should("be.visible")
			.and("contain", "Icons made by Freepik from www.flaticon.com");
	});

	context("List of stories", () => {
		it.skip("shows the right data for all rendered stories", () => {});

		// it.only("shows only nineteen stories after dimissing the first story", () => {...) O only roda só esse teste e ignora os demais
		it("shows only nineteen stories after dimissing the first story", () => {
			cy.get(".button-small").first().click();

			cy.get(".item").should("have.length", 19);
		});

		context.skip("Order by", () => {
			it("orders by title", () => {});

			it("orders by author", () => {});

			it("orders by comments", () => {});

			it("orders by points", () => {});
		});
	});

	context("Search", () => {
		beforeEach(() => {
			cy.get("#search").clear();
			interceptSearch(newTerm, "0");
		});

		it("types and hits ENTER", () => {
			cy.get("#search").type(`${newTerm}{enter}`);

			cy.wait("@search", { timeout: 2000 });

			cy.get(".item").should("have.length", 20);
			cy.get(".item").first().should("contain", newTerm);
			cy.get(`button:contains(${initialTerm})`).should("be.visible");
		});

		it("types and clicks the submit button", () => {
			cy.get("#search").type(newTerm);
			cy.contains("Submit").click();

			cy.wait("@search", { timeout: 2000 });

			cy.get(".item").should("have.length", 20);
			cy.get(".item").first().should("contain", newTerm);
			cy.get(`button:contains(${initialTerm})`).should("be.visible");
		});

		// É um fluxo só para mostrar que é possível, porém o teste a seguir não é um fluxo que o usuário faria ou seria capaz de fazer
		it("types and submits the form directly", () => {
			cy.get("#search").should("be.visible").clear().type(newTerm);
			cy.get(".search-form").submit();
		});

		context("Last searches", () => {
			it("shows a max of 5 buttons for the last searched terms", () => {
				const { faker } = require("@faker-js/faker");

				Cypress._.times(6, () => {
					const fakeWord = faker.lorem.word();
					interceptSearch(fakeWord, "0");
					cy.get("#search").clear().type(`${fakeWord}{enter}`);
					cy.wait("@search", { timeout: 2000 });
				});

				cy.get(".last-searches button").should("have.length", 5);
			});
		});
	});

	context("Error handling", () => {
		const interceptServerError = (errorType) => {
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
		};

		const visitHomePageAndCheckError = () => {
			cy.visit("/");
			cy.wait("@search", { timeout: 2000 });

			cy.get("p:contains('Something went wrong ...')").should("be.visible");
		};

		it('shows "Something went wrong ..." in case of a server error', () => {
			interceptServerError("server");
			visitHomePageAndCheckError();
		});

		it('shows "Something went wrong ..." in case of a network error', () => {
			interceptServerError("network");
			visitHomePageAndCheckError();
		});
	});
});
