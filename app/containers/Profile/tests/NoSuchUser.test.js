import React from 'react';
import renderer from 'react-test-renderer';
import 'jest-styled-components';
import { IntlProvider } from 'react-intl';

import NoSuchUser from '../NoSuchUser';
import messages from '../messages';

describe('<NoSuchUser />', () => {
  it('should match the snapshot', () => {
    const renderedComponent = renderer
      .create(
        <IntlProvider locale="en" key="en" messages={messages.en}>
          <NoSuchUser />
        </IntlProvider>,
      )
      .toJSON();
    expect(renderedComponent).toMatchSnapshot();
  });
});