// Testes Flake são testes que falham de forma intermitente, geralmente devido a problemas de sincronização ou condições de corrida.

describe("Hacker Stories", () => {
	const initialTerm = "React";
	const newTerm = "Cypress";

	context("Hitting the real API", () => {
		beforeEach(() => {
			cy.interceptSearch();
			cy.visit("/");
			cy.wait("@search");
		});

		it('shows 20 stories, then the next 20 after clicking "More"', () => {
			cy.interceptSearch("React", "1");
			cy.get(".item").should("have.length", 20);

			cy.contains("More").should("be.visible").click();

			cy.wait("@search");

			cy.get(".item").should("have.length", 40);
		});

		it("searches via the last searched term", () => {
			cy.interceptSearch("Cypress", "0");
			cy.get("#search").should("be.visible").clear().type(`${newTerm}{enter}`);

			cy.wait("@search");

			cy.checkLocalStorage("search", newTerm);

			cy.get(`button:contains(${initialTerm})`).should("be.visible").click();

			cy.wait("@search");

			cy.get(".item").should("have.length", 20);
			cy.get(".item").first().should("be.visible").and("contain", initialTerm);
			cy.get(`button:contains(${newTerm})`).should("be.visible");
		});
	});

	context("Mocking API", () => {
		context("Footer and list of stories", () => {
			beforeEach(() => {
				cy.interceptSearch("React", "0", "stories");
				cy.visit("/");
				cy.wait("@search");
			});

			it('shows a "Loading ..." state before showing the results', () => {
				cy.interceptSearch("React", "0", "stories", "delaySearch", 1000);
				cy.visit("/");

				cy.assertLoadingIsShownAndHidden();

				cy.wait("@delaySearch");

				cy.get(".item").should("have.length", 2);
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
							.within(() => {
								cy.contains(firstStory.title).should("be.visible");
								cy.get("a").should("have.attr", "href", firstStory.url);
							});

						cy.get(".list-header-button")
							.contains("Title")
							.should("be.visible")
							.click();

						cy.get(".item")
							.first()
							.within(() => {
								cy.contains(lastStory.title).should("be.visible");
								cy.get("a").should("have.attr", "href", lastStory.url);
							});
					});

					it("orders by author", () => {
						cy.get(".list-header-button")
							.contains("Author")
							.should("be.visible")
							.click();

						cy.get(".item")
							.first()
							.within(() => {
								cy.contains(firstStory.author).should("be.visible");
								cy.get("a").should("have.attr", "href", firstStory.url);
							});

						cy.get(".list-header-button")
							.contains("Author")
							.should("be.visible")
							.click();

						cy.get(".item")
							.first()
							.within(() => {
								cy.contains(lastStory.author).should("be.visible");
								cy.get("a").should("have.attr", "href", lastStory.url);
							});
					});

					it("orders by comments", () => {
						cy.get(".item")
							.first()
							.within(() => {
								cy.contains(firstStory.num_comments).should("be.visible");
								cy.get("a").should("have.attr", "href", firstStory.url);
							});

						cy.get(".list-header-button")
							.contains("Comments")
							.should("be.visible")
							.click();

						cy.get(".item")
							.first()
							.within(() => {
								cy.contains(lastStory.num_comments).should("be.visible");
								cy.get("a").should("have.attr", "href", lastStory.url);
							});
					});

					it("orders by points", () => {
						cy.get(".item")
							.first()
							.within(() => {
								cy.contains(firstStory.points).should("be.visible");
								cy.get("a").should("have.attr", "href", firstStory.url);
							});

						cy.get(".list-header-button")
							.contains("Points")
							.should("be.visible")
							.click();

						cy.get(".item")
							.first()
							.within(() => {
								cy.contains(lastStory.points).should("be.visible");
								cy.get("a").should("have.attr", "href", lastStory.url);
							});
					});
				});
			});
		});

		context("Search", () => {
			beforeEach(() => {
				cy.interceptSearch(initialTerm, "0", "empty", "emptySearch");

				cy.interceptSearch(newTerm, "0", "stories", "search");

				cy.visit("/");
				cy.wait("@emptySearch", { timeout: 5000 });

				cy.get("#search").clear();
			});

			it("shows no story when none is returned", () => {
				cy.get(".item").should("not.exist");
			});

			it("types and hits ENTER", () => {
				cy.get("#search").should("be.visible").type(`${newTerm}{enter}`);

				cy.wait("@search");

				cy.checkLocalStorage("search", newTerm);

				cy.get(".item").should("have.length", 2);
				cy.get(`button:contains(${initialTerm})`).should("be.visible");
			});

			it("types and clicks the submit button", () => {
				cy.get("#search").should("be.visible").type(newTerm);
				cy.contains("Submit").should("be.visible").click();

				cy.wait("@search");

				cy.checkLocalStorage("search", newTerm);

				cy.get(".item").should("have.length", 2);
				cy.get(`button:contains(${initialTerm})`).should("be.visible");
			});

			// É um fluxo só para mostrar que é possível, porém o teste a seguir não é um fluxo que o usuário faria ou seria capaz de fazerlsd
			it("types and submits the form directly", () => {
				cy.get("#search").should("be.visible").clear().type(newTerm);
				cy.get(".search-form").should("be.visible").submit();
			});

			context("Last searches", () => {
				it("shows a max of 5 buttons for the last searched terms", () => {
					const { faker } = require("@faker-js/faker");

					Cypress._.times(6, () => {
						const fakeWord = faker.lorem.word();
						cy.interceptSearch(fakeWord, "0", "empty");
						cy.get("#search")
							.should("be.visible")
							.clear()
							.type(`${fakeWord}{enter}`);
						cy.wait("@search");

						cy.checkLocalStorage("search", fakeWord);
					});

					cy.get(".last-searches button").should("have.length", 5);
					//Uma alternativa: cy.get(".last-searches").within(() => {
					// cy.get("button").should("have.length", 5);
					// });
				});
			});
		});
	});

	context("Error handling", () => {
		it('shows "Something went wrong ..." in case of a server error', () => {
			cy.interceptServerError("server");
			cy.visitHomePageAndCheckError();
		});

		it('shows "Something went wrong ..." in case of a network error', () => {
			cy.interceptServerError("network");
			cy.visitHomePageAndCheckError();
		});
	});
});

describe("Hacker News Search", () => {
	const term = "cypress.io";

	beforeEach(() => {
		cy.intercept("**/search?query=redux&page=0&hitsPerPage=100", {
			fixture: "empty",
		}).as("empty");
		cy.intercept(`**/search?query=${term}&page=0&hitsPerPage=100`, {
			fixture: "stories",
		}).as("stories");

		cy.visit("https://hackernews-seven.vercel.app/");
		cy.wait("@empty");
	});

	it("correctly caches the results", () => {
		const { faker } = require("@faker-js/faker");
		const fakeWord = faker.lorem.word();
		let count = 0;

		cy.intercept(`**/search?query=${fakeWord}**`, (req) => {
			count += 1;
			req.reply({ fixture: "empty" });
		}).as("random");

		cy.search(fakeWord).then(() => {
			expect(count, `network calls to fetch ${fakeWord}`).to.equal(1);

			cy.wait("@random");

			cy.search(term);
			cy.wait("@stories");

			cy.search(fakeWord).then(() => {
				expect(count, `network calls to fetch ${fakeWord}`).to.equal(1);
			});
		});
	});
});
