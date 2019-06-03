import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';

import {
  TEXT_WARNING_LIGHT,
  TEXT_PRIMARY,
  TEXT_DARK,
  TEXT_SECONDARY,
} from 'style-constants';

import { getFormattedNum } from 'utils/numbers';

import Span from 'components/Span';

import options from './options';
import RatingStatusStyled from './RatingStatusStyled';

const getStatus = /* istanbul ignore next */ rating =>
  Object.keys(options).filter(
    x => options[x].minRating < rating && options[x].maxRating >= rating,
  )[0];

const IconWithStatus = /* istanbul ignore next */ ({
  className,
  size,
  rating,
}) => {
  const full = options[getStatus(rating)];

  return (
    <span className={className}>
      <img
        className="d-inline-flex mr-1"
        src={full.icon[size || 'sm']}
        alt="icon"
      />

      <Span
        fontSize={size === 'lg' ? 20 : 14}
        bold={size === 'lg'}
        color={
          rating > options.newbie.minRating && size === 'sm'
            ? TEXT_WARNING_LIGHT
            : rating < options.newbie.minRating && size === 'sm'
              ? TEXT_PRIMARY
              : TEXT_DARK
        }
      >
        {getFormattedNum(rating)}
      </Span>
    </span>
  );
};

/* eslint no-nested-ternary: 0 */
const RatingStatus = /* istanbul ignore next */ ({
  rating,
  size,
  intl,
  isRankOff,
}) => {
  const full = options[getStatus(rating)];

  return (
    <RatingStatusStyled>
      <IconWithStatus size={size} rating={rating} />
      <Span
        className={isRankOff ? 'd-none' : ''}
        fontSize={size === 'lg' ? 16 : 14}
        color={size === 'lg' ? TEXT_DARK : TEXT_SECONDARY}
      >
        {intl.formatMessage({ id: full.messageId })}
      </Span>
    </RatingStatusStyled>
  );
};

RatingStatus.propTypes = {
  intl: intlShape.isRequired,
  rating: PropTypes.number.isRequired,
  size: PropTypes.string,
  isRankOff: PropTypes.bool,
};

IconWithStatus.propTypes = {
  className: PropTypes.string,
  rating: PropTypes.number.isRequired,
  size: PropTypes.string,
};

export { IconWithStatus };
export default React.memo(injectIntl(RatingStatus));