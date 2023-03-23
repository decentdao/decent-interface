import { Page, Request } from '@playwright/test';
import { SUBGRAPH_API_URL } from '../../testUtils';

/**
 * @class SubgraphMocker
 * The class to mock results of GraphQL queries.
 * Unfortunately, graph-client does not provide handy methods to mock query results.
 * Also, @apollo is well-settled for itegration testing with server, but not with client.
 * Seems like there's just lack of usage for apollo + graph-client + playwright
 */
export class SubgraphMocker {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    // log requests for debugging
    this.page.on('request', request => console.log('>>', request.method(), request.url()));
  }

  mock(response: object) {
    this.mockWithHandler(() => response);
  }

  async mockWithHandler(handler: (request: Request) => object) {
    await this.page.route(SUBGRAPH_API_URL, async (route, request) => {
      await route.fulfill({
        body: JSON.stringify(handler(request)),
      });
    });
  }
}
