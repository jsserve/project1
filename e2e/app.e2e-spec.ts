import { SportanalysisFrontendPage } from './app.po';

describe('sportanalysis-frontend App', () => {
  let page: SportanalysisFrontendPage;

  beforeEach(() => {
    page = new SportanalysisFrontendPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
