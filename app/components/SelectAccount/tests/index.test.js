import React from 'react';
import renderer from 'react-test-renderer';
import 'jest-styled-components';
import { IntlProvider } from 'react-intl';
import { translationMessages } from 'i18n';

import SelectAccount from '../index';

describe('<SelectAccount />', () => {
  const props = {};

  it('should match the snapshot', () => {
    const renderedComponent = renderer
      .create(
        <IntlProvider locale="en" key="en" messages={translationMessages.en}>
          <SelectAccount props={props} />
        </IntlProvider>,
      )
      .toJSON();
    expect(renderedComponent).toMatchSnapshot();
  });
});