describe("Hacker Stories", () => {
	const initialTerm = "React";
	const newTerm = "Cypress";

	const interceptSearch = (
		query = "React",
		page = "0",
		fixture,
		customAlias = "search",
	) => {
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

			cy.contains("More").should("be.visible").click();

			cy.wait("@search", { timeout: 2000 });

			cy.get(".item").should("have.length", 40);
		});

		it("searches via the last searched term", () => {
			interceptSearch("Cypress", "0");
			cy.get("#search").should("be.visible").clear().type(`${newTerm}{enter}`);

			cy.wait("@search", { timeout: 2000 });

			cy.get(`button:contains(${initialTerm})`).should("be.visible").click();

			cy.wait("@search", { timeout: 2000 });

			cy.get(".item").should("have.length", 20);
			cy.get(".item").first().should("be.visible").and("contain", initialTerm);
			cy.get(`button:contains(${newTerm})`).should("be.visible");
		});
	});

	context("Mocking API", () => {
		context("Footer and list of stories", () => {
			beforeEach(() => {
				interceptSearch("React", "0", "stories");
				cy.visit("/");
				cy.wait("@search", { timeout: 2000 });
			});

			it("shows the footer", () => {
				cy.get("footer")
					.should("be.visible")
					.and("contain", "Icons made by Freepik from www.flaticon.com");
			});

			context("List of stories", () => {
				const stories = require("../fixtures/stories.json");
				const firstStory = stories.hits[0];
				const lastStory = stories.hits[stories.hits.length - 1];

				it("shows the right data for all rendered stories", () => {
					stories.hits.forEach((story) => {
						cy.get(".item").contains(story.title).should("be.visible");
						cy.get(".item").contains(story.author).should("be.visible");
						cy.get(".item").contains(story.num_comments).should("be.visible");
						cy.get(".item").contains(story.points).should("be.visible");
						cy.get(`.item a[href="${story.url}"]`)
							.should("be.visible")
							.and("have.attr", "href", story.url);
					});
				});

				// .only(): O only roda só esse teste e ignora os demais
				it("shows one less story after dimissing the first one", () => {
					cy.get(".button-small").first().should("be.visible").click();

					cy.get(".item").should("have.length", 1);
				});

				context("Order by", () => {
					it("orders by title", () => {
						cy.get(".list-header-button")
							.contains("Title")
							.should("be.visible")
							.click();
						// cy.get(".list-header-button").contains("Title").as("orderByTitle").click(); Eu consigo dar alias para tags tbm

						cy.get(".item")
							.first()
							.should("be.visible")
							.and("contain", firstStory.title);

						cy.get(`.item a[href="${firstStory.url}"]`)
							.should("be.visible")
							.and("have.attr", "href", firstStory.url);

						cy.get(".list-header-button")
							.contains("Title")
							.should("be.visible")
							.click();

						cy.get(".item")
							.first()
							.should("be.visible")
							.and("contain", lastStory.title);

						cy.get(`.item a[href="${lastStory.url}"]`)
							.should("be.visible")
							.and("have.attr", "href", lastStory.url);
					});

					it("orders by author", () => {
						cy.get(".list-header-button")
							.contains("Author")
							.should("be.visible")
							.click();

						cy.get(".item")
							.first()
							.should("be.visible")
							.and("contain", firstStory.author);

						cy.get(`.item a[href="${firstStory.url}"]`)
							.should("be.visible")
							.and("have.attr", "href", firstStory.url);

						cy.get(".list-header-button")
							.contains("Author")
							.should("be.visible")
							.click();

						cy.get(".item")
							.first()
							.should("be.visible")
							.and("contain", lastStory.author);

						cy.get(`.item a[href="${lastStory.url}"]`)
							.should("be.visible")
							.and("have.attr", "href", lastStory.url);
					});

					it("orders by comments", () => {
						cy.get(".item")
							.first()
							.should("be.visible")
							.and("contain", firstStory.num_comments);

						cy.get(`.item a[href="${firstStory.url}"]`)
							.should("be.visible")
							.and("have.attr", "href", firstStory.url);

						cy.get(".list-header-button")
							.contains("Comments")
							.should("be.visible")
							.click();

						cy.get(".item")
							.first()
							.should("be.visible")
							.and("contain", lastStory.num_comments);

						cy.get(`.item a[href="${lastStory.url}"]`)
							.should("be.visible")
							.and("have.attr", "href", lastStory.url);
					});

					it("orders by points", () => {
						cy.get(".item")
							.first()
							.should("be.visible")
							.and("contain", firstStory.points);

						cy.get(`.item a[href="${firstStory.url}"]`)
							.should("be.visible")
							.and("have.attr", "href", firstStory.url);

						cy.get(".list-header-button")
							.contains("Points")
							.should("be.visible")
							.click();

						cy.get(".item")
							.first()
							.should("be.visible")
							.and("contain", lastStory.points);

						cy.get(`.item a[href="${lastStory.url}"]`)
							.should("be.visible")
							.and("have.attr", "href", lastStory.url);
					});
				});
			});
		});

		context("Search", () => {
			beforeEach(() => {
				interceptSearch(initialTerm, "0", "empty", "emptySearch");

				interceptSearch(newTerm, "0", "stories", "search");

				cy.visit("/");
				cy.wait("@emptySearch", { timeout: 5000 });

				cy.get("#search").clear();
			});

			it("shows no story when none is returned", () => {
				cy.get(".item").should("not.exist");
			});

			it("types and hits ENTER", () => {
				cy.get("#search").should("be.visible").type(`${newTerm}{enter}`);

				cy.wait("@search", { timeout: 2000 });

				cy.get(".item").should("have.length", 2);
				cy.get(`button:contains(${initialTerm})`).should("be.visible");
			});

			it("types and clicks the submit button", () => {
				cy.get("#search").should("be.visible").type(newTerm);
				cy.contains("Submit").should("be.visible").click();

				cy.wait("@search", { timeout: 2000 });

				cy.get(".item").should("have.length", 2);
				cy.get(`button:contains(${initialTerm})`).should("be.visible");
			});

			// É um fluxo só para mostrar que é possível, porém o teste a seguir não é um fluxo que o usuário faria ou seria capaz de fazer
			it("types and submits the form directly", () => {
				cy.get("#search").should("be.visible").clear().type(newTerm);
				cy.get(".search-form").should("be.visible").submit();
			});

			context("Last searches", () => {
				it("shows a max of 5 buttons for the last searched terms", () => {
					const { faker } = require("@faker-js/faker");

					Cypress._.times(6, () => {
						const fakeWord = faker.lorem.word();
						interceptSearch(fakeWord, "0", "empty");
						cy.get("#search")
							.should("be.visible")
							.clear()
							.type(`${fakeWord}{enter}`);
						cy.wait("@search", { timeout: 2000 });
					});

					cy.get(".last-searches button").should("have.length", 5);
				});
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
