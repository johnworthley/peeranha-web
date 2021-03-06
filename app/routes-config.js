/* eslint camelcase: 0 */
export const home = () => `/about`;

export const notFound = () => `/404`;
export const errorPage = () => `/error-occured`;

export const profileView = id => `/users/${id}`;

export const profileEdit = id => `/users/edit/${id}`;

export const userQuestions = id => `/users/${id}#questions`;
export const userAnswers = id => `/users/${id}#answers`;
export const userSettings = id => `/users/${id}#settings`;
export const userWallet = id => `/users/${id}/wallet`;

export const questions = communityid =>
  !communityid ? `/` : `/communities/${communityid}`;

export const uniqueAnswerId = answerId => `ans${answerId}`;

export const questionView = (id, answerId) =>
  answerId
    ? `/questions/${id}/#${uniqueAnswerId(answerId)}`
    : `/questions/${id}`;

export const questionEdit = questionid => `/questions/${questionid}/edit`;

export const answerEdit = (questionid, answerid) =>
  `/questions/${questionid}/answers/${answerid}/edit`;

export const questionAsk = () => `/questions/ask`;

export const noAccess = () => `/no-access`;
export const feed = id => `/feed/${id || ''}`;
export const communities = () => `/communities`;
export const tags = () => `/tags`;
export const users = () => `/users`;
export const faq = code => `/faq/${code ? `#${code}` : ``}`;
export const support = section => `/support/${section ? `#${section}` : ''}`;
export const search = q => `/search/${q || ''}`;
export const privacyPolicy = section =>
  `/privacy-policy/${section ? `#${section}` : ''}`;
export const termsAndConditions = section =>
  `/terms-and-conditions/${section ? `#${section}` : ''}`;

export const communitiesCreate = () => `/communities/create`;
export const communitiesCreatedBanner = () => `/communities/create#banner`;
export const suggestedCommunities = () => `/communities/suggested`;
export const communityTags = communityid => `/communities/${communityid}/tags`;

export const suggestedTags = communityid =>
  `/communities/${communityid}/tags/suggested`;

export const tagsCreate = communityid =>
  `/communities/${communityid || 0}/tags/create`;

export const registrationStage = 'signup';

export const preloaderPage = () => '/preloader-page';

export const signup = {
  email: {
    step: 1,
    name: `/${registrationStage}/email`,
    scatter: false,
  },
  displayName: {
    step: 1,
    name: `/${registrationStage}/with-scatter/display-name`,
    scatter: true,
  },
  emailVerification: {
    step: 2,
    name: `/${registrationStage}/email-verification`,
    scatter: false,
  },
  haveEosAccount: {
    step: 3,
    name: `/${registrationStage}/i-have-eos-account`,
    scatter: false,
  },
  dontHaveEosAccount: {
    step: 3,
    name: `/${registrationStage}/i-dont-have-eos-account`,
    scatter: false,
  },
  almostDoneWithAccount: {
    step: 4,
    name: `/${registrationStage}/i-have-eos-account/almost-done`,
    scatter: false,
  },
  almostDoneNoAccount: {
    step: 4,
    name: `/${registrationStage}/i-dont-have-eos-account/almost-done`,
    scatter: false,
  },
};
