/**
 *
 * Communities
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { createStructuredSelector } from 'reselect';
import { translationMessages } from 'i18n';
import { connect } from 'react-redux';

import { compose } from 'redux';
import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';

import { DAEMON } from 'utils/constants';

import createdHistory from 'createdHistory';
import * as routes from 'routes-config';

import { makeSelectLocale } from 'containers/LanguageProvider/selectors';

import {
  selectCommunities,
  selectCommunitiesLoading,
} from 'containers/DataCacheProvider/selectors';

import { makeSelectProfileInfo } from 'containers/AccountProvider/selectors';
import { showLoginModal } from 'containers/Login/actions';

import LoadingIndicator from 'components/LoadingIndicator/WidthCentered';
import BaseTransparent from 'components/Base/BaseTransparent';

import { LEFT_MENU_WIDTH } from 'containers/App/constants';

import {
  selectSuggestedCommunities,
  selectSuggestedCommunitiesLoading,
  selectIsLastFetch,
} from './selectors';

import { createCommunityValidator } from './validate';
import { getSuggestedCommunities } from './actions';
import messages from './messages';
import reducer from './reducer';
import saga from './saga';

import languages from './LanguagesOptions';

import CommunitiesHeader from './CommunitiesHeader';
import NothingInterestingBanner from './NothingInterestingBanner';

const AsideWrapper = BaseTransparent.extend`
  flex: 0 0 ${LEFT_MENU_WIDTH}px;
`.withComponent('aside');

/* eslint indent: 0 */
/* eslint-disable react/prefer-stateless-function */
export class Communities extends React.PureComponent {
  state = {
    language: languages.all,
  };

  setLang = language => {
    this.setState({ language });
  };

  componentDidMount() {
    this.getSuggestedCommunities();
  }

  getSuggestedCommunities = () => {
    this.props.getSuggestedCommunitiesDispatch();
  };

  /* eslint consistent-return: 0 */
  goToCreateCommunityScreen = () => {
    const { profile, locale } = this.props;

    if (!profile) {
      this.props.showLoginModalDispatch();
      return null;
    }

    const isValid = createCommunityValidator(
      profile,
      translationMessages[locale],
    );

    if (!isValid) {
      return null;
    }

    createdHistory.push(routes.communitiesCreate());
  };

  render() /* istanbul ignore next */ {
    const {
      locale,
      communities,
      communitiesLoading,
      suggestedCommunities,
      suggestedCommunitiesLoading,
      isLastFetch,
      Content,
      Aside,
      SubHeader,
      changeSorting,
      sorting,
    } = this.props;

    return (
      <div className="d-flex justify-content-center">
        <Helmet>
          <title>{translationMessages[locale][messages.title.id]}</title>
          <meta
            name="description"
            content={translationMessages[locale][messages.description.id]}
          />
        </Helmet>

        <div className="flex-grow-1">
          <CommunitiesHeader
            goToCreateCommunityScreen={this.goToCreateCommunityScreen}
            SubHeader={SubHeader}
            changeSorting={changeSorting}
            sorting={sorting}
            communitiesNumber={communities ? communities.length : 0}
            setLang={this.setLang}
            language={this.state.language}
          />

          <div className="my-3">
            <Content
              suggestedCommunities={suggestedCommunities}
              suggestedCommunitiesLoading={suggestedCommunitiesLoading}
              getSuggestedCommunities={this.getSuggestedCommunities}
              isLastFetch={isLastFetch}
              communities={communities}
              sorting={sorting}
              locale={locale}
              language={this.state.language}
            />
          </div>

          {(communitiesLoading || suggestedCommunitiesLoading) && (
            <LoadingIndicator />
          )}

          {isLastFetch && (
            <NothingInterestingBanner
              goToCreateCommunityScreen={this.goToCreateCommunityScreen}
            />
          )}
        </div>

        <AsideWrapper className="d-none d-xl-block pr-0">
          <Aside
            suggestedCommunities={suggestedCommunities}
            communities={communities}
          />
        </AsideWrapper>
      </div>
    );
  }
}

Communities.propTypes = {
  communities: PropTypes.array,
  suggestedCommunities: PropTypes.array,
  locale: PropTypes.string,
  profile: PropTypes.object,
  sorting: PropTypes.object,
  showLoginModalDispatch: PropTypes.func,
  changeSorting: PropTypes.func,
  SubHeader: PropTypes.any,
  Aside: PropTypes.any,
  Content: PropTypes.any,
  suggestedCommunitiesLoading: PropTypes.bool,
  isLastFetch: PropTypes.bool,
  communitiesLoading: PropTypes.bool,
  getSuggestedCommunitiesDispatch: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  locale: makeSelectLocale(),
  communities: selectCommunities(),
  communitiesLoading: selectCommunitiesLoading(),
  profile: makeSelectProfileInfo(),
  suggestedCommunities: selectSuggestedCommunities(),
  suggestedCommunitiesLoading: selectSuggestedCommunitiesLoading(),
  isLastFetch: selectIsLastFetch(),
});

function mapDispatchToProps(dispatch) /* istanbul ignore next */ {
  return {
    dispatch,
    showLoginModalDispatch: () => dispatch(showLoginModal()),
    getSuggestedCommunitiesDispatch: () => dispatch(getSuggestedCommunities()),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withReducer = injectReducer({ key: 'communities', reducer });
const withSaga = injectSaga({ key: 'communities', saga, mode: DAEMON });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(Communities);